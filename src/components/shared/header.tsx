"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Calendar,
  AreaChartIcon as ChartArea,
  Loader2,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/server/users"; // Adjust path to your auth utilities file
import { toast } from "sonner";

// --- Custom User Menu Dropdown ---
function UserMenu({ email }: { email?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Handle clicking outside to close the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut();
        toast.success("Signed out successfully");
        setIsOpen(false);
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
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-transparent hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      >
        <User className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-popover border border-border text-popover-foreground rounded-lg shadow-lg p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-2 py-2 text-sm font-medium truncate border-b border-border mb-1">
            {email || "My Account"}
          </div>

          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="flex items-center gap-2 px-2 py-2 mt-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors disabled:opacity-50 text-left w-full cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}

// --- Main Header Component ---
const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/statistics", label: "Statistics", icon: ChartArea },
];

export function Header({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  useEffect(() => {
    if (loadingPath === pathname) {
      setLoadingPath(null);
    }
  }, [pathname, loadingPath]);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full px-6 py-3">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.5 10.84L6.5 8.84L2 13.34L3.5 14.84L6.5 11.84L10.5 13.84L17.83 6.5L20.5 9.17L22 7.67L21 9Z" />
              </svg>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex gap-2 w-full max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isLoading = loadingPath === item.href;
              return (
                <Link key={item.label} href={item.href} className="flex-1">
                  <Button
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium transition-colors cursor-pointer"
                    onClick={() => {
                      if (pathname !== item.href) setLoadingPath(item.href);
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Avatar Menu */}
          <div className="flex items-center">
            <UserMenu email={userEmail} />
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L13.5 2.5L16.17 5.17L10.5 10.84L6.5 8.84L2 13.34L3.5 14.84L6.5 11.84L10.5 13.84L17.83 6.5L20.5 9.17L22 7.67L21 9Z" />
              </svg>
            </div>
          </div>

          {/* User Avatar Menu */}
          <div className="flex items-center">
            <UserMenu email={userEmail} />
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-t border-border/40">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isLoading = loadingPath === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 h-auto min-w-0 transition-colors cursor-pointer",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => {
                    if (pathname !== item.href) setLoadingPath(item.href);
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                  <span className="text-xs font-medium sr-only">
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="h-[60px]" />
    </>
  );
}
