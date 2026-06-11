import { Header } from "@/components/shared/header";
import { MonthPickerTab } from "@/components/home/MonthPickerTab";
import { TransactionManager } from "@/components/home/TransactionManager";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { getCurrentUser } from "@/server/users"; // Adjust path to your auth utilities file

export default async function HomePage() {
  // Fetch the current user session server-side
  const user = await getCurrentUser();

  return (
    <CalendarProvider>
      {/* Pass the email to the client-side header */}
      <Header userEmail={user?.email} />

      <div className="max-h-screen bg-background flex flex-col">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 flex-1 w-full flex flex-col pt-6">
          <MonthPickerTab />
          <div className="w-full flex-1 mt-4">
            <TransactionManager />
          </div>
        </main>
      </div>
    </CalendarProvider>
  );
}
