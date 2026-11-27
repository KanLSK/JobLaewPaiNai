"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { EditorState } from "@/components/admin/EntryEditor";
import { GONE, destroy, saveEdit, setStatus } from "@/lib/admin/moderate";
import { ADMIN_COOKIE, SESSION_SECONDS, adminPassword, attemptLogin, makeToken, requireAdmin } from "@/lib/admin/session";
import { getStore, mongoConfigured } from "@/lib/entries";
import { addressFrom } from "@/lib/entries/address";
import { loadAliases } from "@/lib/entries/aliasFile";
import type { Status } from "@/lib/entries/types";

export async function logIn(formData: FormData): Promise<void> {
  const password = adminPassword(process.env);
  if (!password || !mongoConfigured(process.env)) redirect("/admin");
  const ok = await attemptLogin(
    { rates: getStore(), password, address: addressFrom(await headers()) },
    String(formData.get("password") ?? ""),
  );
  if (!ok) redirect("/admin?failed=1");
  (await cookies()).set(ADMIN_COOKIE, makeToken(password), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  redirect("/admin");
}

export async function logOut(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

const TABS: Status[] = ["pending", "approved", "rejected"];

/** Save, approve, reject, unpublish and delete, all from the one form around an entry. */
export async function moderate(previous: EditorState, formData: FormData): Promise<EditorState> {
  await requireAdmin();
  const form = Object.fromEntries([...formData].filter((pair): pair is [string, string] => typeof pair[1] === "string"));
  const { id = "", intent } = form;
  const attempt = (previous?.attempt ?? 0) + 1;
  const store = getStore();
  const failed = (message: string, errors = {}): EditorState => ({ attempt, ok: false, message, errors, values: form });

  let done: string;
  try {
    const tab = (await store.get(id))?.status;
    const back = (code: string) => `/admin?tab=${tab && TABS.includes(tab) ? tab : "pending"}&done=${code}`;
    // Approving stores what is on screen first, so an unsaved edit is never lost.
    if (intent === "save" || intent === "approve") {
      const saved = await saveEdit(store, await loadAliases(), id, form);
      if (!saved.ok && saved.message !== GONE) {
        revalidatePath("/admin");
        return failed(saved.message, saved.errors);
      }
      if (intent === "save" && saved.ok) {
        revalidatePath("/admin");
        return { attempt, ok: true, message: saved.message, errors: {}, values: {} };
      }
    }
    if (intent === "approve") done = back((await setStatus(store, id, "approved")) ? "approved" : "gone");
    else if (intent === "reject") done = back((await setStatus(store, id, "rejected")) ? "rejected" : "gone");
    else if (intent === "unpublish") done = back((await setStatus(store, id, "rejected")) ? "unpublished" : "gone");
    else if (intent === "delete") done = back((await destroy(store, id)) ? "deleted" : "gone");
    else if (intent === "save") done = back("gone");
    else throw new Error("Unknown action");
  } catch (error) {
    console.error(error);
    return failed("ทำรายการไม่สำเร็จ กรุณาลองใหม่");
  }
  redirect(done);
}
