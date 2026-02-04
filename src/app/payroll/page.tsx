"use client";

import { PayrollAnalytics } from "@/components/dashboard/PayrollAnalytics";

export const dynamic = 'force-dynamic';

export default function PayrollPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">วิเคราะห์เงินเดือน (Payroll Analytics)</h1>
            </div>
            <PayrollAnalytics />
        </div>
    );
}
