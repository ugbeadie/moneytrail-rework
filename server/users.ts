"use server";

import { auth } from "../src/app/lib/auth";
import { headers } from "next/headers";

// Define the shape of Better-Auth's expected error object
type BetterAuthError = {
  body?: {
    code?: string;
    message?: string;
  };
};

export const signIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    console.log("Sign-in successful for email:", email);
  } catch (error: unknown) {
    console.error("Sign-in error:", error);

    const authError = error as BetterAuthError;
    const errorCode = authError.body?.code;

    if (errorCode === "INVALID_EMAIL_OR_PASSWORD") {
      throw new Error("Invalid email or password. Please try again.");
    }

    if (errorCode === "USER_NOT_FOUND") {
      throw new Error("No account found with this email. Please sign up.");
    }

    throw new Error(
      authError.body?.message ||
        (error instanceof Error
          ? error.message
          : "Unknown error during sign-in"),
    );
  }
};

export const signUp = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
    console.log("Sign-up successful for email:", email);
  } catch (error: unknown) {
    console.error("Sign-up error:", error);

    const authError = error as BetterAuthError;

    if (authError.body?.code === "USER_ALREADY_EXISTS") {
      throw new Error(
        "An account with this email already exists. Please sign in.",
      );
    }

    throw new Error(
      authError.body?.message ||
        (error instanceof Error
          ? error.message
          : "Unknown error during sign-up"),
    );
  }
};

// Added Server-Side Sign Out
export const signOut = async () => {
  try {
    await auth.api.signOut({
      // In Next.js App Router, server-side Better-Auth methods require headers
      headers: await headers(),
    });
    console.log("Sign-out successful");
  } catch (error: unknown) {
    console.error("Sign-out error:", error);
    throw new Error("Failed to sign out. Please try again.");
  }
};
