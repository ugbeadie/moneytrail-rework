"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { TransactionItem } from "./TransactionItem";

interface TransactionGroupProps {
  date: string;
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionGroup({
  date,
  transactions,
  onEdit,
  onDelete,
}: TransactionGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const formattedDate = (() => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const weekdayColorClass =
      weekday === "Sun"
        ? "text-red-600"
        : weekday === "Sat"
          ? "text-blue-600"
          : "text-muted-foreground";
    return (
      <>
        {`${day}/${month}/${year} `}
        <span className={`font-semibold ${weekdayColorClass}`}>
          ({weekday})
        </span>
      </>
    );
  })();

  return (
    <div className="mb-6">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center border-2 border-muted rounded-md px-4 py-2 cursor-pointer hover:bg-muted/40 transition-colors select-none group"
      >
        <div className="text-sm font-medium text-muted-foreground flex-1">
          {formattedDate}
        </div>

        {/* Removed gap-3 here so the arrow doesn't force blank space when hidden */}
        <div className="flex items-center">
          <div className="text-xs font-semibold space-x-3">
            <span className="text-green-600">₦{totalIncome.toFixed(2)}</span>
            <span className="text-red-600">₦{totalExpense.toFixed(2)}</span>
          </div>

          {/* Layout Wrapper for Chevron:
            - Mobile: Always occupies space (w-4 ml-3)
            - Desktop (md): Shrinks to 0 width and 0 margin, completely hiding from layout flow
            - Desktop Hover (md:group-hover): Smoothly expands width and margin, sliding out to shift the text
          */}
          <div
            className={`transition-all duration-200 ease-in-out overflow-hidden flex items-center justify-end
              w-4 ml-3 opacity-100
              md:w-0 md:ml-0 md:opacity-0
              md:group-hover:w-4 md:group-hover:ml-3 md:group-hover:opacity-100
            `}
          >
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground/70 transition-transform duration-200 ease-in-out shrink-0
                ${isOpen ? "rotate-180" : "rotate-0"}
              `}
            />
          </div>
        </div>
      </div>

      {/* Collapsible Content Wrapper */}
      {isOpen && (
        <div className="space-y-1 mt-1 animate-in fade-in-50 duration-150">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="[&:not(:last-child)]:border-b [&:not(:last-child)]:border-muted"
            >
              <TransactionItem
                transaction={transaction}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
