import type { Aliases } from "@/lib/data/aliases";
import { hashAddress } from "./address";
import type { EntryStore, Kind, RateStore } from "./types";
import { validate, type FieldErrors } from "./validate";

export type SubmitResult = { ok: true } | { ok: false; message: string; errors: FieldErrors; values: Record<string, string> };

const HOUR = 60 * 60 * 1000;
const PER_HOUR = 10;
const MAX_PENDING = 200;

export async function submitEntry(
  deps: { store: EntryStore & RateStore; aliases: Aliases; address: string },
  kind: Kind,
  form: Record<string, string>,
): Promise<SubmitResult> {
  const { website, ...values } = form;
  const refuse = (message: string, errors: FieldErrors = {}): SubmitResult => ({ ok: false, message, errors, values });
  // People never see this field; software that fills it is told all went well.
  if (website?.trim()) return { ok: true };

  const checked = validate(kind, values, deps.aliases);
  if (!checked.ok) return refuse("กรุณาตรวจข้อมูลในช่องที่ระบุ", checked.errors);

  try {
    if ((await deps.store.hit(`submit:${hashAddress(deps.address)}`, HOUR)) > PER_HOUR)
      return refuse("ส่งบ่อยเกินไป ลองใหม่ในอีกหนึ่งชั่วโมง");
    if ((await deps.store.count("pending")) >= MAX_PENDING) return refuse("มีรายการรอตรวจจำนวนมาก ลองใหม่ภายหลัง");
    await deps.store.insert({ kind, status: "pending", source: "form", data: checked.data, createdAt: new Date() });
    return { ok: true };
  } catch (error) {
    console.error(error);
    return refuse("ส่งไม่สำเร็จ ข้อความของคุณยังอยู่ กรุณาลองใหม่");
  }
}
