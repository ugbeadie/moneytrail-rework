"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/server/users"; // Adjust this path if your users.ts is located elsewhere
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/header";
import { MonthPickerTab } from "@/components/home/MonthPickerTab";
import { TransactionManager } from "@/components/home/TransactionManager";
import { CalendarProvider } from "@/contexts/CalendarContext";

export default function HomePage() {
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
    <CalendarProvider>
      <Header />
      <div className="max-h-screen bg-background flex flex-col">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 flex-1 w-full flex flex-col">
          {/* Sign Out Button Container */}
          <div className="flex justify-end py-4">
            <button
              onClick={handleSignOut}
              disabled={isPending}
              className="px-4 py-2 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm"
            >
              {isPending ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <LogOut size={16} />
              )}
              {isPending ? "Signing out..." : "Sign out"}
            </button>
          </div>

          <hr className="border-muted" />
          <MonthPickerTab />
          <div className="w-full flex-1">
            <TransactionManager />
          </div>
        </main>
      </div>
    </CalendarProvider>
  );
}
