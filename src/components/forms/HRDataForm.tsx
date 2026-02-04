"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HRData = {
    employeeName: string;
    role: string;
    department: string;
    status: "Active" | "On Leave" | "Terminated";
    salary: number;
};

export function HRDataForm() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<HRData>();

    const onSubmit = (data: HRData) => {
        console.log("HR Data:", data);
        alert("บันทึกข้อมูลพนักงานเรียบร้อย (ตรวจสอบ console สำหรับข้อมูล)");
        reset();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>เพิ่มข้อมูลพนักงาน</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">ชื่อ-นามสกุล</label>
                        <Input placeholder="ชื่อ-นามสกุล เต็ม" {...register("employeeName", { required: true })} />
                        {errors.employeeName && <span className="text-red-500 text-xs">จำเป็นต้องระบุ</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">ตำแหน่ง</label>
                            <Input placeholder="เช่น นักพัฒนา, ผู้จัดการ" {...register("role", { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">แผนก</label>
                            <Select {...register("department", { required: true })}>
                                <option value="ฝ่ายขาย">ฝ่ายขาย</option>
                                <option value="ไอที">ไอที</option>
                                <option value="ทรัพยากรบุคคล">ทรัพยากรบุคคล</option>
                                <option value="การเงิน">การเงิน</option>
                                <option value="การตลาด">การตลาด</option>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">สถานะ</label>
                            <Select {...register("status", { required: true })}>
                                <option value="ทำงานอยู่">ทำงานอยู่</option>
                                <option value="ลาพัก">ลาพัก</option>
                                <option value="ลาออก">ลาออก</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">เงินเดือน</label>
                            <Input type="number" placeholder="0.00" {...register("salary", { required: true, min: 0 })} />
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">บันทึกข้อมูลพนักงาน</Button>
                </form>
            </CardContent>
        </Card>
    );
}
