"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

// Mock Data for Cost Breakdown (Migrated from ExecutiveSummary)
const dataCostBreakdown = [
    { name: "เงินเดือน", value: 45000 },
    { name: "ค่าเช่า", value: 15000 },
    { name: "การตลาด", value: 12000 },
    { name: "ต้นทุนขาย", value: 25000 },
    { name: "อื่นๆ", value: 5000 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function ExpensesAnalytics() {
    return (
        <div className="grid gap-4 md:grid-cols-7">
            {/* Cost Breakdown Donut Chart */}
            <Card className="col-span-3">
                <CardHeader>
                    <CardTitle>โครงสร้างค่าใช้จ่าย (Expense Structure)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataCostBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataCostBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Expenses History Table */}
            <div className="col-span-4">
                <RecentHistory
                    collectionName="expenses"
                    title="ประวัติการจ่ายเงิน (Transaction History)"
                    mapData={(data) => ({
                        date: data.date,
                        detail: data.category,
                        amount: data.amount,
                    })}
                />
            </div>
        </div>
    );
}
