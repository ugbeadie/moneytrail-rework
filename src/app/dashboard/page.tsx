"use client";

import React, { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, getCurrentUser } from "../../../server/users"; // Added getCurrentUser
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/header";

// Define the shape of the user object so TypeScript is happy
type User = {
  name?: string | null;
  email: string;
} | null;

const Dashboard = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state to hold the fetched user and loading status
  const [user, setUser] = useState<User>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch the user data from the server action when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          // Optional: redirect to login if no user is found
          router.push("/login");
          return;
        }
        setUser(userData);
      } catch (error) {
        toast.error("Failed to load user data");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [router]);

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
      <Header />
      <div className="space-y-6 text-center max-w-sm w-full p-8 border border-gray-200 dark:border-gray-800 rounded-2xl">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome to your account!
          </p>
        </div>

        {/* 👇 User Information Display */}
        <div className="py-4 border-y border-gray-100 dark:border-gray-800/50">
          {isLoadingUser ? (
            <div className="flex justify-center py-2">
              <Loader2 className="animate-spin size-5 text-gray-400" />
            </div>
          ) : user ? (
            <div className="space-y-1 text-center">
              {user.name && (
                <p className="text-base font-medium">{user.name}</p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          ) : (
            <p className="text-sm text-red-500">Could not load user data.</p>
          )}
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
