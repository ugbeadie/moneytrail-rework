"use client";

import { useState, useActionState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/server/users";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googlePending, setGooglePending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "account_not_linked") {
      toast.error(
        "This email is already registered. Please sign in with your email and password instead.",
        { duration: 5000 },
      );
      router.replace("/login");
    }
  }, [searchParams, router]);

  const [state, formAction, pending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        await signIn({ email, password });
        toast.success("Successfully signed in!");

        router.push("/");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "An error occurred during sign-in.",
        );
      }
    },
    null,
  );

  const signInWithGoogle = async () => {
    setGooglePending(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        errorCallbackURL: "/login",
      });
    } catch (error) {
      toast.error("Google sign-in failed.");
      setGooglePending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your details to sign in to your account
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email address</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || googlePending}
            className="w-full h-11 rounded-xl font-medium cursor-pointer hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 bg-primary text-primary-foreground border border-gray-200 dark:border-gray-800"
          >
            {pending ? <Loader2 className="animate-spin size-4" /> : "Login"}
          </button>
        </form>

        <div className="relative flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          <span className="px-3 text-xs uppercase text-gray-400 dark:text-gray-500 bg-background relative z-10">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>

        <button
          type="button"
          disabled={pending || googlePending}
          onClick={signInWithGoogle}
          className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center gap-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-900/50 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {googlePending ? (
            <Loader2 className="animate-spin size-4" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.2 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.7 0 5.2 1 7.1 2.7l5.7-5.7C33.7 6.7 29.1 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21 21-9.4 21-21c0-1.8-.2-3.5-.4-5.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c2.7 0 5.2 1 7.1 2.7l5.7-5.7C33.7 6.7 29.1 5 24 5c-8.2 0-15.2 4.7-18.7 11.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 47c5.1 0 9.8-2 13.4-5.3l-6.2-5.1C29.4 38.5 26.8 39.5 24 39.5c-5.1 0-9.5-3.1-11.1-7.4l-6.6 5.1C8.8 42.3 15.8 47 24 47z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.4 5.5-6.1 6.9l6.2 5.1C38.9 36.6 45 31 45 26c0-1.8-.2-3.5-.4-5.5z"
              />
            </svg>
          )}
          {googlePending ? "Connecting..." : "Sign in with Google"}
        </button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin size-8 text-gray-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
