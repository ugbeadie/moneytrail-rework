import { Header } from "@/components/shared/header";
import { MonthPickerTab } from "@/components/home/MonthPickerTab";
import { TransactionManager } from "@/components/home/TransactionManager";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { getCurrentUser } from "@/server/users";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <CalendarProvider>
      <Header userEmail={user?.email} />

      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 flex-1 w-full flex flex-col min-h-0">
          <MonthPickerTab />
          <div className="w-full flex-1 flex flex-col min-h-0">
            <TransactionManager />
          </div>
        </main>
      </div>
    </CalendarProvider>
  );
}
