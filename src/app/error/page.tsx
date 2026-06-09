"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");

  const messages: Record<string, string> = {
    account_not_linked:
      "This email is already registered with a password. Please sign in with your email and password.",
    default: "Something went wrong during sign in. Please try again.",
  };

  const message = messages[error ?? ""] ?? messages.default;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in failed</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-full h-11 rounded-xl font-medium border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-sm"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
