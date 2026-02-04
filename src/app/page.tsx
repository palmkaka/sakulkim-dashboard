"use client";

import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { SalesPerformance } from "@/components/dashboard/SalesPerformance";
import { ExpensesAnalytics } from "@/components/dashboard/ExpensesAnalytics";
import { HRAnalytics } from "@/components/dashboard/HRAnalytics";
import { Separator } from "@/components/ui/separator"; // Need to check if this exists or just use hr

export default function Dashboard() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">แดชบอร์ดภาพรวมธุรกิจ (Business Overview)</h1>
      </div>

      {/* Executive Summary */}
      <section>
        <ExecutiveSummary />
      </section>

      <div className="border-t border-gray-200" />

      {/* Sales Analytics */}
      <section className="space-y-4">
        {/* SalesPerformance component already has an H2 title, so we let it render */}
        <SalesPerformance />
      </section>

      <div className="border-t border-gray-200" />

      {/* Expense Analytics */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">วิเคราะห์ค่าใช้จ่าย (Expenses Analytics)</h2>
        <ExpensesAnalytics />
      </section>

      <div className="border-t border-gray-200" />

      {/* HR Analytics */}
      <section>
        <HRAnalytics />
      </section>
    </div>
  );
}
