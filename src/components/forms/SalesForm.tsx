"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { RecentHistory } from "@/components/dashboard/RecentHistory";

type SalesData = {
    date: string;
    channel: "Store" | "Wholesale" | "Online" | "Project";
    totalAmount: number;
    cogs: number;
    reference?: string;
};

export function SalesForm() {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<SalesData>();

    // Optional: active calculation of Gross Profit for display
    const totalAmount = watch("totalAmount");
    const cogs = watch("cogs");
    const grossProfit = (totalAmount || 0) - (cogs || 0);

    const onSubmit = async (data: SalesData) => {
        console.log("Sales Data:", data);
        try {
            if (db) {
                await addDoc(collection(db, "sales"), {
                    ...data,
                    totalAmount: Number(data.totalAmount),
                    cogs: Number(data.cogs),
                    createdAt: serverTimestamp()
                });
                alert("บันทึกยอดขายเรียบร้อย");
                reset();
            } else {
                alert("Database not connected");
            }
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("เกิดข้อผิดพลาดในการบันทึก");
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>บันทึกยอดขาย (Sales Input)</CardTitle>
                    <CardDescription>บันทึกรายรับและต้นทุนสินค้า</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">วันที่ (Transaction Date)</label>
                                <Input type="date" {...register("date", { required: true })} />
                                {errors.date && <span className="text-red-500 text-xs">ระบุวันที่</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ช่องทางจำหน่าย (Channel)</label>
                                <Select {...register("channel", { required: true })}>
                                    <option value="Store">หน้าร้าน</option>
                                    <option value="Wholesale">ขายส่ง</option>
                                    <option value="Online">ออนไลน์</option>
                                    <option value="Project">โครงการ</option>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ยอดขายรวม (Total Amount)</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    {...register("totalAmount", { required: true, min: 0 })}
                                />
                                {errors.totalAmount && <span className="text-red-500 text-xs">ระบุยอดขาย</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ต้นทุนสินค้า (COGS)</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    {...register("cogs", { required: true, min: 0 })}
                                />
                                {errors.cogs && <span className="text-red-500 text-xs">ระบุต้นทุน</span>}
                            </div>
                        </div>

                        {/* Display Gross Profit Realtime */}
                        <div className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                            <span className="text-sm text-gray-600">กำไรขั้นต้น (Gross Profit):</span>
                            <span className={`font-bold ${grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                ฿{grossProfit.toLocaleString()}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">หมายเหตุ/เลขอ้างอิง</label>
                            <Input placeholder="เช่น เลขที่ใบเสร็จ หรือ ชื่อลูกค้า" {...register("reference")} />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">บันทึกยอดขาย</Button>
                    </form>
                </CardContent>
            </Card>

            <RecentHistory
                collectionName="sales"
                mapData={(data) => ({
                    date: data.date,
                    detail: data.channel,
                    amount: data.totalAmount,
                })}
            />
        </>
    );
}
