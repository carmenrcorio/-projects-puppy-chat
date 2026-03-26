import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/feed" className="text-xl font-bold tracking-tight">
          🐶 Puppy Chat
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/feed" className="hover:underline">
                Feed
              </Link>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded bg-gray-100 px-3 py-1 hover:bg-gray-200"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:underline">
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded bg-black px-3 py-1 text-white hover:bg-gray-800"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
