"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "../../../server/users"; // Adjust this import path if needed
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut();
        toast.success("Signed out successfully");
        router.push("/login");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to sign out",
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="space-y-6 text-center max-w-sm w-full p-8 border border-gray-200 dark:border-gray-800 rounded-2xl">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome to your account!
          </p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={isPending}
          className="w-full h-11 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white"
        >
          {isPending ? (
            <Loader2 className="animate-spin size-4" />
          ) : (
            <LogOut size={18} />
          )}
          {isPending ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
