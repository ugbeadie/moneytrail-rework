import { getCurrentUser } from "@/server/users";
import StatsPage from "@/components/stats/StatsPage";

export default async function StatisticsRoute() {
  const user = await getCurrentUser();

  return <StatsPage userEmail={user?.email} />;
}
