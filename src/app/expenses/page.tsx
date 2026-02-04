"use client";

import { ExpensesAnalytics } from "@/components/dashboard/ExpensesAnalytics";

export const dynamic = 'force-dynamic';

export default function ExpensePage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">วิเคราะห์ค่าใช้จ่าย (Expense Analytics)</h1>
            </div>
            <ExpensesAnalytics />
        </div>
    );
}
