import { signIn } from "@/auth";
import { safeCallback } from "@/lib/auth/allowed";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  async function google() {
    "use server";
    await signIn("google", { redirectTo: safeCallback(callbackUrl) });
  }

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-sm rounded-3xl border-2 border-ink bg-white p-8 text-center shadow-sticker">
        <h1 className="text-3xl font-bold">จบแล้วไปไหน</h1>
        <p className="mt-2 text-muted">เส้นทางหลังเรียนหมอ รวมรีวิวจากรุ่นพี่</p>
        {error && (
          <p role="alert" className="mt-4 rounded-xl border-2 border-ink bg-intern p-3 text-sm">
            {error === "AccessDenied"
              ? "บัญชีนี้เข้าไม่ได้ กรุณาใช้อีเมลนักศึกษา @student.mahidol.edu หรือ @student.mahidol.ac.th"
              : "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง"}
          </p>
        )}
        <form action={google} className="mt-6">
          <button className="w-full cursor-pointer rounded-full border-2 border-ink bg-graduate px-5 py-3 font-semibold shadow-sticker-sm transition hover:-translate-y-0.5">
            เข้าสู่ระบบด้วย Google
          </button>
        </form>
      </div>
    </main>
  );
}
