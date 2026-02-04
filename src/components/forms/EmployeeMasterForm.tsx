"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

type EmployeeMasterData = {
    employeeId: string;
    fullName: string;
    department: string;
    startDate: string;
    status: "Active" | "Resigned";
    resignDate?: string;
};

export function EmployeeMasterForm() {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<EmployeeMasterData>();

    const status = watch("status");

    const onSubmit = async (data: EmployeeMasterData) => {
        console.log("Employee Master Data:", data);
        try {
            if (db) {
                await addDoc(collection(db, "employees"), {
                    ...data,
                    createdAt: serverTimestamp()
                });
                alert("บันทึกข้อมูลพนักงานเรียบร้อย");
                reset();
            } else {
                alert("Database not connected");
            }
        } catch (e) {
            console.error("Error: ", e);
            alert("เกิดข้อผิดพลาด");
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>ฐานข้อมูลพนักงาน (Employee Master)</CardTitle>
                    <CardDescription>ลงทะเบียนพนักงานใหม่หรืออัปเดตสถานะ</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">รหัสพนักงาน</label>
                                <Input placeholder="EMP-001" {...register("employeeId", { required: true })} />
                                {errors.employeeId && <span className="text-red-500 text-xs">ระบุรหัส</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ชื่อ-สกุล</label>
                                <Input placeholder="สมชาย ใจดี" {...register("fullName", { required: true })} />
                                {errors.fullName && <span className="text-red-500 text-xs">ระบุชื่อ</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">แผนก (Department)</label>
                                <Select {...register("department", { required: true })}>
                                    <option value="Sales">ฝ่ายขาย</option>
                                    <option value="IT">ไอที</option>
                                    <option value="HR">ทรัพยากรบุคคล</option>
                                    <option value="Finance">การเงิน</option>
                                    <option value="Marketing">การตลาด</option>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">วันที่เริ่มงาน (Start Date)</label>
                                <Input type="date" {...register("startDate", { required: true })} />
                                {errors.startDate && <span className="text-red-500 text-xs">ระบุวันเริ่มงาน</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">สถานะ (Status)</label>
                                <Select {...register("status", { required: true })}>
                                    <option value="Active">ทำงานอยู่ (Active)</option>
                                    <option value="Resigned">ลาออก (Resigned)</option>
                                </Select>
                            </div>
                            {status === "Resigned" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">วันที่ลาออก (Resign Date)</label>
                                    <Input type="date" {...register("resignDate", { required: true })} />
                                    {errors.resignDate && <span className="text-red-500 text-xs">ระบุวันลาออก</span>}
                                </div>
                            )}
                        </div>

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">บันทึกพนักงาน</Button>
                    </form>
                </CardContent>
            </Card>

            <RecentHistory
                collectionName="employees"
                mapData={(data) => ({
                    date: data.startDate,
                    detail: data.fullName,
                    amount: data.status,
                })}
            />
        </>
    );
}
