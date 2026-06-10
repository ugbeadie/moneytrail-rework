"use server";

import { db } from "../app/db/drizzle";
import { transactions } from "../app/db/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
  Transaction,
  TransactionSummary,
  AddTransactionResult,
  TransactionType,
} from "../types/transaction";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from "date-fns";
import { auth } from "./auth";
import { headers } from "next/headers";

export async function addTransaction(
  formData: FormData,
): Promise<AddTransactionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    const type = formData.get("type") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const dateStr = formData.get("date") as string;

    if (!type || !amountStr || !category || !dateStr) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = Number.parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    const localDate = new Date(dateStr);
    const date = localDate;

    await db.insert(transactions).values({
      userId,
      type,
      amount: amount.toString(),
      category,
      description: description || null,
      imageUrl: imageUrl || null,
      date,
    });

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to add transaction:", error);
    return { success: false, error: "Failed to add transaction" };
  }
}

export async function updateTransaction(
  formData: FormData,
): Promise<AddTransactionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    const id = formData.get("id") as string;
    const type = formData.get("type") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const dateStr = formData.get("date") as string;

    if (!id || !type || !amountStr || !category || !dateStr) {
      return { success: false, error: "Missing required fields" };
    }

    const amount = Number.parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    const localDate = new Date(dateStr);
    const date = localDate;

    await db
      .update(transactions)
      .set({
        type,
        amount: amount.toString(),
        category,
        description: description || null,
        imageUrl: imageUrl || null,
        date,
      })
      .where(
        and(
          eq(transactions.id, id),
          eq(transactions.userId, userId), // Security: Only update if user owns it
        ),
      );

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return { success: false, error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(
  id: string,
): Promise<AddTransactionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    await db.delete(transactions).where(
      and(
        eq(transactions.id, id),
        eq(transactions.userId, userId), // Security: Only delete if user owns it
      ),
    );

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return { success: false, error: "Failed to delete transaction" };
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) return [];

    const rawTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    return rawTransactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      type: transaction.type as TransactionType,
    }));
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return [];
  }
}

export async function getTransactionsByMonth(
  month: number,
  year: number,
): Promise<Transaction[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) return [];

    const localStartDate = new Date(year, month, 1);
    const localEndDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const utcStartDate = new Date(
      Date.UTC(
        localStartDate.getFullYear(),
        localStartDate.getMonth(),
        localStartDate.getDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const utcEndDate = new Date(
      Date.UTC(
        localEndDate.getFullYear(),
        localEndDate.getMonth(),
        localEndDate.getDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const rawTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, utcStartDate),
          lte(transactions.date, utcEndDate),
        ),
      )
      .orderBy(desc(transactions.date));

    return rawTransactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      type: transaction.type as TransactionType,
    }));
  } catch (error) {
    console.error("Error fetching transactions by month:", error);
    return [];
  }
}

export async function getTransactionSummary(): Promise<TransactionSummary> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) return { totalIncome: 0, totalExpenses: 0, balance: 0 };

    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));

    const totalIncome = allTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = allTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

export async function getTransactionSummaryByMonth(
  month: number,
  year: number,
): Promise<TransactionSummary> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) return { totalIncome: 0, totalExpenses: 0, balance: 0 };

    const localStartDate = new Date(year, month, 1);
    const localEndDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const utcStartDate = new Date(
      Date.UTC(
        localStartDate.getFullYear(),
        localStartDate.getMonth(),
        localStartDate.getDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const utcEndDate = new Date(
      Date.UTC(
        localEndDate.getFullYear(),
        localEndDate.getMonth(),
        localEndDate.getDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const monthTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, utcStartDate),
          lte(transactions.date, utcEndDate),
        ),
      );

    const totalIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  } catch (error) {
    console.error("Error fetching transaction summary by month:", error);
    return { totalIncome: 0, totalExpenses: 0, balance: 0 };
  }
}

// ----------------------------------------------------------------------
// STATS ACTIONS
// ----------------------------------------------------------------------

export interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface StatsData {
  totalIncome: number;
  totalExpenses: number;
  incomeByCategory: CategoryStats[];
  expensesByCategory: CategoryStats[];
  dateRange: string;
}

export interface CategoryDetailData {
  transactions: Transaction[];
  chartData: { period: string; amount: number }[];
}

export async function getStatsData(
  period: "weekly" | "monthly" | "annually",
  month?: number,
  year?: number,
  selectedWeek?: Date,
): Promise<StatsData> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        incomeByCategory: [],
        expensesByCategory: [],
        dateRange: "",
      };
    }

    let startDate: Date;
    let endDate: Date;
    let dateRange: string;
    const currentYear = year || new Date().getFullYear();

    switch (period) {
      case "weekly":
        const weekDate = selectedWeek || new Date();
        startDate = startOfWeek(weekDate);
        endDate = endOfWeek(weekDate);

        dateRange = `${startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
        break;

      case "monthly":
        const targetMonth = month !== undefined ? month : new Date().getMonth();
        startDate = new Date(currentYear, targetMonth, 1);
        endDate = new Date(currentYear, targetMonth + 1, 0, 23, 59, 59, 999);

        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        dateRange = `${monthNames[targetMonth]} ${currentYear}`;
        break;

      case "annually":
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        dateRange = `${currentYear}`;
        break;
    }

    const utcStartDate = new Date(
      Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const utcEndDate = new Date(
      Date.UTC(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const rawTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, utcStartDate),
          lte(transactions.date, utcEndDate),
        ),
      );

    const mappedTransactions: Transaction[] = rawTransactions.map((t) => ({
      id: t.id,
      type: t.type as TransactionType,
      amount: Number(t.amount),
      category: t.category,
      description: t.description,
      imageUrl: t.imageUrl,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));

    const incomeTransactions = mappedTransactions.filter(
      (t) => t.type === "income",
    );
    const expenseTransactions = mappedTransactions.filter(
      (t) => t.type === "expense",
    );

    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );
    const totalExpenses = expenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );

    const incomeByCategory = groupByCategory(incomeTransactions, totalIncome);
    const expensesByCategory = groupByCategory(
      expenseTransactions,
      totalExpenses,
    );

    return {
      totalIncome,
      totalExpenses,
      incomeByCategory,
      expensesByCategory,
      dateRange,
    };
  } catch (error) {
    console.error("Error fetching stats data:", error);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      incomeByCategory: [],
      expensesByCategory: [],
      dateRange: "",
    };
  }
}

export async function getTransactionsCategory(
  category: string,
  type: "income" | "expense",
  period: "weekly" | "monthly" | "annually",
  currentDate: Date,
): Promise<CategoryDetailData> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;
    if (!userId) return { transactions: [], chartData: [] };

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "weekly":
        startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
        break;
      case "monthly":
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case "annually":
        startDate = startOfYear(currentDate);
        endDate = endOfYear(currentDate);
        break;
    }

    const rawTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.category, category),
          eq(transactions.type, type),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
        ),
      )
      .orderBy(asc(transactions.date));

    const mappedTransactions: Transaction[] = rawTransactions.map((t) => ({
      id: t.id,
      type: t.type as "income" | "expense",
      amount: Number(t.amount),
      category: t.category,
      description: t.description,
      imageUrl: t.imageUrl,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));

    let chartData: { period: string; amount: number }[] = [];

    if (period === "weekly") {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const dayMap = new Map<string, number>();
      days.forEach((d) => dayMap.set(format(d, "EEE"), 0));

      mappedTransactions.forEach((t) => {
        const key = format(new Date(t.date), "EEE");
        dayMap.set(key, (dayMap.get(key) || 0) + t.amount);
      });

      chartData = Array.from(dayMap.entries()).map(([period, amount]) => ({
        period,
        amount,
      }));
    } else if (period === "monthly") {
      const chartStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 5,
        1,
      );

      const rawChartTransactions = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.category, category),
            eq(transactions.type, type),
            gte(transactions.date, chartStart),
            lte(transactions.date, endDate),
          ),
        )
        .orderBy(asc(transactions.date));

      const chartTransactions = rawChartTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        date: new Date(t.date),
      }));

      const months = eachMonthOfInterval({
        start: chartStart,
        end: currentDate,
      });
      const monthMap = new Map<string, number>();
      months.forEach((m) => monthMap.set(format(m, "MMM"), 0));

      chartTransactions.forEach((t) => {
        const key = format(new Date(t.date), "MMM");
        monthMap.set(key, (monthMap.get(key) || 0) + t.amount);
      });

      chartData = Array.from(monthMap.entries()).map(([period, amount]) => ({
        period,
        amount,
      }));
    } else if (period === "annually") {
      const chartStart = new Date(currentDate.getFullYear() - 4, 0, 1);

      const rawChartTransactions = await db
        .select()
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.category, category),
            eq(transactions.type, type),
            gte(transactions.date, chartStart),
            lte(transactions.date, endDate),
          ),
        )
        .orderBy(asc(transactions.date));

      const chartTransactions = rawChartTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        date: new Date(t.date),
      }));

      const years = eachYearOfInterval({
        start: chartStart,
        end: currentDate,
      });
      const yearMap = new Map<string, number>();
      years.forEach((y) => yearMap.set(format(y, "yyyy"), 0));

      chartTransactions.forEach((t) => {
        const key = format(new Date(t.date), "yyyy");
        yearMap.set(key, (yearMap.get(key) || 0) + t.amount);
      });

      chartData = Array.from(yearMap.entries()).map(([period, amount]) => ({
        period,
        amount,
      }));
    }

    return { transactions: mappedTransactions, chartData };
  } catch (error) {
    console.error("Error fetching category transactions:", error);
    return { transactions: [], chartData: [] };
  }
}

function groupByCategory(
  transactions: Transaction[],
  total: number,
): CategoryStats[] {
  const categoryMap = new Map<string, { amount: number; count: number }>();

  transactions.forEach((transaction) => {
    const category = transaction.category;

    const existing = categoryMap.get(category) || { amount: 0, count: 0 };
    categoryMap.set(category, {
      amount: existing.amount + Number(transaction.amount),
      count: existing.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}
