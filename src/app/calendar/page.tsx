import { getCurrentUser } from "@/server/users";
import CalendarPage from "@/components/calendar/CalendarPage";

export default async function CalendarRoute() {
  const user = await getCurrentUser();

  return <CalendarPage userEmail={user?.email} />;
}
