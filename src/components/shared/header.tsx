"use client";

import Image from "next/image";
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
import { ThemeToggle } from "../theme-toggle";
import { signOut } from "@/server/users";
import { toast } from "sonner";

function UserMenu({ email }: { email?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-transparent hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <User className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-popover border border-border text-popover-foreground rounded-lg shadow-lg p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-2 py-2 text-sm font-medium truncate border-b border-border mb-1">
            {email || "My Account"}
          </div>

          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>

          <hr className="border-border my-1" />

          <button
            onClick={handleSignOut}
            disabled={isPending}
            className="flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors disabled:opacity-50 text-left w-full cursor-pointer"
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

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/statistics", label: "Statistics", icon: ChartArea },
];

export function Header({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const [loadingPath, setLoadingPath] = useState<string | null>(null);

  // Reset loading when route changes
  useEffect(() => {
    if (loadingPath === pathname) {
      setLoadingPath(null);
    }
  }, [pathname, loadingPath]);

  return (
    <>
      {/* Desktop Navigation - Top Fixed */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full px-6 py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="block w-8 h-8 relative">
              <Image
                src="/expenses.png"
                alt="Expenses logo"
                fill
                className="object-contain"
                sizes="32px"
              />
            </Link>
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
                      if (pathname !== item.href) {
                        setLoadingPath(item.href);
                      }
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

      {/* Mobile Top Bar - Logo and User Menu Fixed */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="block w-8 h-8 relative">
            <Image
              src="/expenses.png"
              alt="Expenses logo"
              fill
              className="object-contain"
              sizes="32px"
            />
          </Link>

          {/* User Avatar Menu */}
          <div className="flex items-center">
            <UserMenu email={userEmail} />
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Fixed */}
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
                    if (pathname !== item.href) {
                      setLoadingPath(item.href);
                    }
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

      {/* Spacer for fixed headers */}
      <div className="h-[60px]" />
    </>
  );
}
