"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { DollarSign, Percent, Briefcase } from "lucide-react";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

// Mock Data
const payrollTrend = [
    { name: "Aug", salary: 280000, ot: 15000, commission: 20000 },
    { name: "Sep", salary: 285000, ot: 12000, commission: 25000 },
    { name: "Oct", salary: 290000, ot: 18000, commission: 15000 },
    { name: "Nov", salary: 290000, ot: 20000, commission: 30000 },
    { name: "Dec", salary: 295000, ot: 25000, commission: 45000 },
    { name: "Jan", salary: 300000, ot: 10000, commission: 10000 },
];

const costByDept = [
    { name: "Sales", value: 120000 },
    { name: "Engineering", value: 150000 },
    { name: "HR", value: 50000 },
    { name: "Marketing", value: 45000 },
    { name: "Admin", value: 30000 },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function PayrollAnalytics() {
    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">เงินเดือนรวม (Total Payroll)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿320,000</div>
                        <p className="text-xs text-muted-foreground">+5% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ค่าล่วงเวลา (Total OT)</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿10,000</div>
                        <p className="text-xs text-muted-foreground text-green-500">-15% from last month (Less OT)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ค่าคอมมิชชั่น (Total Commission)</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿10,000</div>
                        <p className="text-xs text-muted-foreground">Seasonal drop in Jan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-7">
                {/* Payroll Composition (Stacked Bar) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>โครงสร้างเงินเดือน (Payroll Composition)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={payrollTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value / 1000}k`} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="salary" stackId="a" fill="#8884d8" name="Salary" />
                                    <Bar dataKey="ot" stackId="a" fill="#82ca9d" name="OT" />
                                    <Bar dataKey="commission" stackId="a" fill="#ffc658" name="Commission" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Cost by Dept (Donut) */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>สัดส่วนตามแผนก (Cost by Dept)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={costByDept}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {costByDept.map((entry, index) => (
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
            </div>
            {/* Recent Payroll History (Using reused component) */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold">ประวัติการจ่ายเงินเดือนล่าสุด</h3>
                <RecentHistory
                    collectionName="payroll" // Assuming this collection exists or will be used
                    mapData={(data) => ({
                        date: data.paymentDate || "N/A",
                        detail: "Payroll Run", // Or specific detail
                        amount: data.totalPaid || 0,
                    })}
                />
            </div>
        </div>
    );
}
