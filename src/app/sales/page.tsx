"use client";

import { SalesPerformance } from "@/components/dashboard/SalesPerformance";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

export const dynamic = 'force-dynamic';

export default function SalesPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">วิเคราะห์ยอดขาย (Sales Analytics)</h1>
            </div>

            {/* Top Section: Charts */}
            <SalesPerformance />

            {/* Bottom Section: Recent Transactions */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">รายการขายล่าสุด</h3>
                <RecentHistory
                    collectionName="sales"
                    mapData={(data) => ({
                        date: data.date,
                        detail: data.channel,
                        amount: data.totalAmount,
                    })}
                />
            </div>
        </div>
    );
}
