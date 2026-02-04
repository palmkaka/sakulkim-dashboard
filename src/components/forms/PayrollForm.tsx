"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, writeBatch, doc, query, onSnapshot, orderBy } from "firebase/firestore";
import { RecentHistory } from "@/components/dashboard/RecentHistory";
import { Settings, Users, User, ArrowRightLeft } from "lucide-react";
import { ManagePayrollDataModal } from "./ManagePayrollDataModal";

type PayrollItem = {
    employeeId: string;
    name: string;
    baseSalary: number;
    commission: number;
    incentive: number;
    ot: number;
    totalIncome: number;
};

type PayrollFormData = {
    mode: "bulk" | "individual";
    monthYear: string;
    team: string; // For Bulk
    selectedEmployeeId: string; // For Individual
    items: PayrollItem[]; // For Bulk
    // Individual fields
    indivBaseSalary: number;
    indivCommission: number;
    indivIncentive: number;
    indivOt: number;
};

export function PayrollForm() {
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [teams, setTeams] = useState<{ id: string, name: string }[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const { register, control, handleSubmit, watch, setValue, reset } = useForm<PayrollFormData>({
        defaultValues: {
            mode: "bulk",
            items: [],
            indivCommission: 0,
            indivIncentive: 0,
            indivOt: 0,
        }
    });

    const { fields, replace } = useFieldArray({
        control,
        name: "items",
    });

    const mode = watch("mode");
    const selectedTeam = watch("team");
    const selectedEmployeeId = watch("selectedEmployeeId"); // Watch individual employee selection

    // Individual Mode Calculations
    const indivBaseSalary = watch("indivBaseSalary") || 0;
    const indivCommission = watch("indivCommission") || 0;
    const indivIncentive = watch("indivIncentive") || 0;
    const indivOt = watch("indivOt") || 0;
    const indivTotal = Number(indivBaseSalary) + Number(indivCommission) + Number(indivIncentive) + Number(indivOt);

    // Fetch Teams & Employees Realtime
    useEffect(() => {
        if (!db) return;

        // Teams
        const unsubTeams = onSnapshot(query(collection(db, "teams"), orderBy("createdAt", "desc")), (snap) => {
            setTeams(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
        });

        // Employees
        const unsubEmps = onSnapshot(query(collection(db, "employees")), (snap) => {
            setEmployees(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
        });

        return () => {
            unsubTeams();
            unsubEmps();
        };
    }, []);

    // Effect: Populate Bulk Items when Team changes
    useEffect(() => {
        if (mode === "bulk" && selectedTeam) {
            const filtered = employees.filter((e) => e.team === selectedTeam && e.status !== "Resigned");
            const items = filtered.map((e) => ({
                employeeId: e.id,
                name: e.fullName,
                baseSalary: Number(e.baseSalary),
                commission: 0,
                incentive: 0,
                ot: 0,
                totalIncome: Number(e.baseSalary),
            }));
            replace(items);
        } else if (mode === "bulk") {
            replace([]);
        }
    }, [selectedTeam, employees, mode, replace]);

    // Effect: Populate Individual Data when Employee changes
    useEffect(() => {
        if (mode === "individual" && selectedEmployeeId) {
            const emp = employees.find(e => e.id === selectedEmployeeId);
            if (emp) {
                setValue("indivBaseSalary", Number(emp.baseSalary));
            }
        }
    }, [selectedEmployeeId, employees, mode, setValue]);

    const onSubmit = async (data: PayrollFormData) => {
        if (!db) { alert("Database error"); return; }

        try {
            if (data.mode === "bulk") {
                // Bulk Save
                if (data.items.length === 0) {
                    alert("No employees to save");
                    return;
                }
                const batch = writeBatch(db);
                const payrollCollection = collection(db, "payrolls");

                data.items.forEach(item => {
                    const docRef = doc(payrollCollection);
                    batch.set(docRef, {
                        monthYear: data.monthYear,
                        team: data.team,
                        employeeId: item.employeeId,
                        name: item.name,
                        baseSalary: Number(item.baseSalary),
                        commission: Number(item.commission),
                        incentive: Number(item.incentive),
                        ot: Number(item.ot),
                        netPay: Number(item.totalIncome), // Calculated in Row or Logic
                        type: "Batch",
                        createdAt: serverTimestamp()
                    });
                });
                await batch.commit();
                alert(`Saved payroll for ${data.items.length} employees.`);
                setValue("items", []);
            } else {
                // Individual Save
                if (!data.selectedEmployeeId) { alert("Select an employee"); return; }
                const emp = employees.find(e => e.id === data.selectedEmployeeId);

                await addDoc(collection(db, "payrolls"), {
                    monthYear: data.monthYear,
                    employeeId: data.selectedEmployeeId,
                    name: emp?.fullName || "Unknown",
                    team: emp?.team || "Unknown",
                    baseSalary: Number(data.indivBaseSalary),
                    commission: Number(data.indivCommission),
                    incentive: Number(data.indivIncentive),
                    ot: Number(data.indivOt),
                    netPay: indivTotal,
                    type: "Individual",
                    createdAt: serverTimestamp()
                });
                alert("Saved individual payroll.");
                setValue("indivCommission", 0);
                setValue("indivIncentive", 0);
                setValue("indivOt", 0);
            }
        } catch (e) {
            console.error(e);
            alert("Save failed");
        }
    };

    return (
        <>
            <ManagePayrollDataModal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} />

            <Card className="w-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>บันทึกเงินเดือน (Payroll Input)</CardTitle>
                            <CardDescription>คำนวณและบันทึกรายได้พนักงาน</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setValue("mode", "bulk")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors ${mode === "bulk" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <Users className="h-3 w-3" /> รายทีม (Bulk)
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue("mode", "individual")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-colors ${mode === "individual" ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <User className="h-3 w-3" /> รายคน (Individual)
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">เดือน/ปี (Month/Year)</label>
                                <Input type="month" {...register("monthYear", { required: true })} />
                            </div>

                            {mode === "bulk" ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">เลือกทีม (Select Team)</label>
                                    <div className="flex gap-2">
                                        <Select
                                            {...register("team")}
                                            onChange={(e) => setValue("team", e.target.value)}
                                        >
                                            <option value="">-- เลือกทีม --</option>
                                            {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" onClick={() => setIsManageModalOpen(true)}>
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ค้นหาพนักงาน (Search Employee)</label>
                                    <div className="flex gap-2">
                                        {/* Simple Select for now, ideally an Autocomplete */}
                                        <Select
                                            {...register("selectedEmployeeId")}
                                            onChange={(e) => setValue("selectedEmployeeId", e.target.value)}
                                        >
                                            <option value="">-- เลือกพนักงาน --</option>
                                            {employees.map(e => (
                                                <option key={e.id} value={e.id}>{e.fullName} ({e.team})</option>
                                            ))}
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" onClick={() => setIsManageModalOpen(true)}>
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BULK MODE TABLE */}
                        {mode === "bulk" && fields.length > 0 && (
                            <div className="border rounded-md overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>พนักงาน</TableHead>
                                            <TableHead className="w-[100px]">เงินเดือน</TableHead>
                                            <TableHead className="w-[100px]">ค่าคอมฯ</TableHead>
                                            <TableHead className="w-[100px]">Incentive</TableHead>
                                            <TableHead className="w-[100px]">OT</TableHead>
                                            <TableHead className="text-right">รวมรับสุทธิ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fields.map((item, index) => (
                                            <PayrollRow
                                                key={item.id}
                                                index={index}
                                                control={control}
                                                register={register}
                                                baseSalary={item.baseSalary}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* INDIVIDUAL MODE FORM */}
                        {mode === "individual" && selectedEmployeeId && (
                            <div className="bg-slate-50 p-4 rounded-md border space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium text-lg text-slate-700">ช้อมูลรายได้</span>
                                    <span className="text-sm text-slate-500">ฐานเงินเดือน: {indivBaseSalary.toLocaleString()}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">คอมมิชชั่น</label>
                                        <Input type="number" {...register("indivCommission")} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Incentive</label>
                                        <Input type="number" {...register("indivIncentive")} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">OT/อื่นๆ</label>
                                        <Input type="number" {...register("indivOt")} />
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded border text-center">
                                    <span className="text-slate-500 text-sm">รวมสุทธิ</span>
                                    <div className="text-2xl font-bold text-emerald-600">฿{indivTotal.toLocaleString()}</div>
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {mode === "bulk" ? `บันทึกทั้งทีม (${fields.length} คน)` : "บันทึกรายคน"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <RecentHistory
                collectionName="payrolls"
                mapData={(data) => ({
                    date: data.monthYear,
                    detail: `${data.name} (${data.team || "N/A"})`,
                    amount: data.netPay,
                })}
            />
        </>
    );
}

// Sub-component for Row
function PayrollRow({ index, control, register, baseSalary }: { index: number, control: Control<PayrollFormData>, register: any, baseSalary: number }) {
    const commission = useWatch({ control, name: `items.${index}.commission` }) || 0;
    const incentive = useWatch({ control, name: `items.${index}.incentive` }) || 0;
    const ot = useWatch({ control, name: `items.${index}.ot` }) || 0;
    const totalIncome = Number(baseSalary) + Number(commission) + Number(incentive) + Number(ot);

    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{control._formValues.items[index]?.name}</div>
                <div className="text-xs text-muted-foreground">Base: {baseSalary.toLocaleString()}</div>
                <input type="hidden" {...register(`items.${index}.employeeId`)} />
                <input type="hidden" {...register(`items.${index}.name`)} />
                <input type="hidden" {...register(`items.${index}.baseSalary`)} />
                <input type="hidden" value={totalIncome} {...register(`items.${index}.totalIncome`)} />
            </TableCell>
            <TableCell>{baseSalary.toLocaleString()}</TableCell>
            <TableCell>
                <Input type="number" className="h-8" placeholder="0" {...register(`items.${index}.commission`, { valueAsNumber: true })} />
            </TableCell>
            <TableCell>
                <Input type="number" className="h-8" placeholder="0" {...register(`items.${index}.incentive`, { valueAsNumber: true })} />
            </TableCell>
            <TableCell>
                <Input type="number" className="h-8" placeholder="0" {...register(`items.${index}.ot`, { valueAsNumber: true })} />
            </TableCell>
            <TableCell className="text-right font-bold text-emerald-600">
                {totalIncome.toLocaleString()}
            </TableCell>
        </TableRow>
    );
}
