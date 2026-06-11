"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { getTransactionsByMonth, deleteTransaction } from "@/lib/actions";
import { toast } from "sonner";
import { useCalendar } from "@/contexts/CalendarContext";
import { TransactionGroup } from "./TransactionGroup";

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
  onRefresh: () => void;
}

// Structural Skeleton Loader that mirrors your actual UI rows
function TransactionListSkeleton() {
  return (
    <div className="md:min-h-full flex flex-col space-y-6 animate-pulse">
      {/* Header Loading State */}
      <div className="flex-shrink-0 space-y-2">
        <div className="h-7 w-48 bg-muted rounded-md" />
        <div className="h-4 w-64 bg-muted/60 rounded-md" />
      </div>

      {/* List Content Loading State */}
      <div className="flex-1 overflow-hidden space-y-6">
        {[1, 2].map((groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            {/* Grouped Date Bar Skeleton */}
            <div className="h-10 w-full bg-muted/40 border-2 border-muted/50 rounded-md" />

            {/* Row Content Skeletons */}
            {[1, 2, 3].map((itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center justify-between py-3 px-2 border-b border-muted/30"
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Plus/Minus Dot */}
                  <div className="w-6 h-6 rounded-full bg-muted" />
                  {/* Title & Category Tag */}
                  <div className="flex flex-col gap-1.5 flex-1 max-w-[220px]">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-3.5 w-16 bg-muted/60 rounded-full" />
                  </div>
                </div>
                {/* Amount Right side */}
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TransactionList({ onEdit, onRefresh }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedMonthIndex, selectedMonth } = useCalendar();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const data = await getTransactionsByMonth(
        selectedMonthIndex,
        currentYear,
      );
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      toast.error("Failed to load transactions", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonthIndex]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        toast.error("Transaction deleted!", {
          duration: 3000,
          icon: <Trash2 className="text-red-600" size={18} />,
          description: "The transaction has been removed successfully.",
        });
        onRefresh();
      } else {
        toast.error(result.error || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("An error occurred while deleting the transaction");
    }
  };

  // Swap out the old spinner screen here
  if (loading) {
    return <TransactionListSkeleton />;
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <div className="flex-1 flex items-center">
          <p className="text-muted-foreground text-sm text-center">
            No transactions for {selectedMonth}. Add your first transaction!
          </p>
        </div>
      </div>
    );
  }

  // Group transactions
  const groupedTransactions = transactions.reduce(
    (groups: Record<string, Transaction[]>, transaction) => {
      const date = transaction.date.toISOString().split("T")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(transaction);
      return groups;
    },
    {},
  );

  Object.keys(groupedTransactions).forEach((date) => {
    groupedTransactions[date].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const totalIncomes = transactions.filter((t) => t.type === "income").length;
  const totalExpenses = transactions.filter((t) => t.type === "expense").length;

  return (
    <div className=" flex flex-col md:max-h-[70vh]">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <p className="text-muted-foreground text-sm mb-6">
          You have{" "}
          <span className="font-semibold">
            {totalIncomes} {totalIncomes > 1 ? "incomes" : "income"}
          </span>{" "}
          and{" "}
          <span className="font-semibold">
            {totalExpenses} {totalExpenses > 1 ? "expenses" : "expense"}
          </span>{" "}
          in {selectedMonth}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden thin-scrollbar">
        <div className="space-y-0">
          {sortedDates.map((date) => (
            <TransactionGroup
              key={date}
              date={date}
              transactions={groupedTransactions[date]}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
