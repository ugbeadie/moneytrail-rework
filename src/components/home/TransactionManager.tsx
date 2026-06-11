"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Transaction } from "@/types/transaction";
import { SummaryCards } from "@/components/shared/SummaryCard";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";

export function TransactionManager() {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  const handleRefresh = () => {
    refresh();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowMobileForm(true);
  };

  const handleTransactionSaved = () => {
    setEditingTransaction(null);
    setShowMobileForm(false);
    refresh();
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setShowMobileForm(false);
  };

  const handleFloatingButtonClick = () => {
    setEditingTransaction(null);
    setShowMobileForm(true);
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (showMobileForm && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showMobileForm]);

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <SummaryCards key={`summary-${refreshKey}`} />

      <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:mt-6 flex-1 min-h-0 pb-6">
        <div className="flex flex-col min-h-0">
          <TransactionList
            key={refreshKey}
            onEdit={handleEdit}
            onRefresh={handleRefresh}
          />
        </div>

        <div className="overflow-y-auto min-h-0 bg-card rounded-xl border shadow-sm h-fit">
          <TransactionForm
            editingTransaction={editingTransaction}
            onTransactionSaved={handleTransactionSaved}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden mt-8 mb-5 overflow-y-auto">
        <TransactionList
          key={refreshKey}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
        />

        {!showMobileForm && (
          <Button
            onClick={handleFloatingButtonClick}
            className="fixed bottom-14 right-5 h-12 w-12 rounded-full shadow-lg z-1 cursor-pointer"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}

        {showMobileForm && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="p-4">
              <TransactionForm
                editingTransaction={editingTransaction}
                onTransactionSaved={handleTransactionSaved}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
