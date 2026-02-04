"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Users, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

type Employee = {
    id: string;
    fullName: string;
    role?: string;
    department: string;
    team?: string; // Some data might use 'team' instead of department depending on previous forms
    status: string;
    baseSalary?: number;
};

type Team = {
    id: string;
    name: string;
};

export function HRAnalytics() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("All");
    const [loading, setLoading] = useState(true);

    // Fetch Real Data
    useEffect(() => {
        if (!db) return;

        // 1. Fetch Employees
        const qEmp = query(collection(db, "employees"), orderBy("createdAt", "desc"));
        const unsubEmp = onSnapshot(qEmp, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                department: doc.data().team || doc.data().department || "Unassigned" // Fallback layout
            } as Employee));
            setEmployees(items);
            setLoading(false);
        });

        // 2. Fetch Teams (for Tabs)
        const qTeam = query(collection(db, "teams"), orderBy("name"));
        const unsubTeam = onSnapshot(qTeam, (snapshot) => {
            const teamNames = snapshot.docs.map(doc => doc.data().name);
            setTeams(teamNames);
        });

        return () => {
            unsubEmp();
            unsubTeam();
        };
    }, []);

    // Filter Logic
    const filteredEmployees = activeTab === "All"
        ? employees
        : employees.filter(e => e.department === activeTab || e.team === activeTab);

    // Stats Calculation (Realtime)
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === "Active" || e.status === "ทำงานอยู่").length;
    const turnoverRate = totalEmployees > 0 ? ((totalEmployees - activeEmployees) / totalEmployees * 100).toFixed(1) : "0";

    // Calculate Average Salary 
    const totalSalary = employees.reduce((acc, curr) => acc + Number(curr.baseSalary || 0), 0);
    const avgSalary = activeEmployees > 0 ? (totalSalary / activeEmployees).toFixed(0) : "0";

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">วิเคราะห์ทรัพยากรบุคคล</h2>
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">พนักงานทั้งหมด</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">+ from Real DB</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">อัตราการลาออก</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{turnoverRate}%</div>
                        <p className="text-xs text-muted-foreground">คำนวณจากสถานะ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ค่าใช้จ่ายต่อหัว</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{Number(avgSalary).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">เฉลี่ยต่อเดือน</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">% ต้นทุนบุคลากร</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">32%</div>
                        <p className="text-xs text-muted-foreground">เทียบกับรายรับรวม</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle>รายชื่อพนักงาน ({filteredEmployees.length})</CardTitle>

                        {/* Department Filter Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            <button
                                onClick={() => setActiveTab("All")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${activeTab === "All"
                                        ? "bg-slate-900 text-white"
                                        : "bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200"
                                    }`}
                            >
                                ทั้งหมด (All)
                            </button>
                            {teams.map(team => (
                                <button
                                    key={team}
                                    onClick={() => setActiveTab(team)}
                                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${activeTab === team
                                            ? "bg-slate-900 text-white"
                                            : "bg-transparent text-slate-600 hover:bg-slate-100 border border-slate-200"
                                        }`}
                                >
                                    {team}
                                </button>
                            ))}
                            {/* Fallback Static Tabs if DB is empty to match request visual */}
                            {teams.length === 0 && (
                                <>
                                    <button onClick={() => setActiveTab("Sales")} className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${activeTab === "Sales" ? "bg-slate-900 text-white" : "border"}`}>Sales</button>
                                    <button onClick={() => setActiveTab("IT")} className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${activeTab === "IT" ? "bg-slate-900 text-white" : "border"}`}>IT</button>
                                    <button onClick={() => setActiveTab("HR")} className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${activeTab === "HR" ? "bg-slate-900 text-white" : "border"}`}>HR</button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] overflow-y-auto border rounded-md relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">Loading...</div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">ไม่พบข้อมูลพนักงาน</div>
                        ) : (
                            <Table>
                                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead>ชื่อ-นามสกุล</TableHead>
                                        <TableHead>ตำแหน่ง</TableHead>
                                        <TableHead>แผนก/ทีม</TableHead>
                                        <TableHead>เงินเดือน</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-medium">{employee.fullName}</TableCell>
                                            <TableCell>{employee.role || "-"}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                    {employee.department}
                                                </span>
                                            </TableCell>
                                            <TableCell>฿{Number(employee.baseSalary || 0).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${employee.status === "Active" || employee.status === "ทำงานอยู่"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {employee.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
