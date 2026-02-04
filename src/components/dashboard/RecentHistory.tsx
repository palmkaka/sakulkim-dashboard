"use client";

import { useEffect, useState } from "react";
import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    deleteDoc,
    doc,
    where,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Search, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type HistoryItem = {
    id: string;
    date: string;
    detail: string;
    amount: number | string;
    createdAt?: any;
};

type RecentHistoryProps = {
    collectionName: string;
    title?: string;
    // Function to map raw firestore data to HistoryItem
    mapData: (data: any) => Omit<HistoryItem, "id">;
};

export function RecentHistory({
    collectionName,
    title = "Recent History",
    mapData,
}: RecentHistoryProps) {
    const [data, setData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("");
    // Default to current month YYYY-MM
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return now.toISOString().slice(0, 7);
    });

    useEffect(() => {
        // Requires Firestore valid configuration
        if (!db) return;
        setLoading(true);

        let q;

        try {
            if (selectedMonth) {
                // Calculate start and end of the selected month
                const [year, month] = selectedMonth.split('-').map(Number);
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59);

                q = query(
                    collection(db, collectionName),
                    where("createdAt", ">=", startDate),
                    where("createdAt", "<=", endDate),
                    orderBy("createdAt", "desc")
                    // No limit here, we fetch the month's data and filter client-side
                );
            } else {
                // If no month selected (fallback), just get recent 10
                q = query(
                    collection(db, collectionName),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );
            }

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const items: HistoryItem[] = [];
                    snapshot.forEach((doc) => {
                        const rawData = doc.data();
                        items.push({
                            id: doc.id,
                            ...mapData(rawData),
                        });
                    });
                    setData(items);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error fetching history:", error);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error("Query Error: ", err);
            setLoading(false);
        }

    }, [collectionName, mapData, selectedMonth]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this record?")) {
            try {
                await deleteDoc(doc(db, collectionName, id));
            } catch (error) {
                console.error("Error deleting document:", error);
                alert("Failed to delete");
            }
        }
    };

    // Client-side filtering
    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            item.detail?.toLowerCase().includes(lowerTerm) ||
            item.date?.toLowerCase().includes(lowerTerm) ||
            String(item.amount).toLowerCase().includes(lowerTerm)
        );
    });

    // Logic: If search box empty -> show 10 items (from the filtered set? or just slice top 10?)
    // User said: "If search box empty -> show 10 latest items as usual"
    // But we queried the WHOLE month. Showing 100 items might be too much.
    // So let's slice top 10 if no search term, otherwise show all matches.
    const displayData = searchTerm ? filteredData : filteredData.slice(0, 10);

    if (!db) {
        return <div className="p-4 text-sm text-yellow-600">Firestore is not configured. History unavailable.</div>
    }

    return (
        <Card className="mt-6 border-t-4 border-t-gray-100 shadow-none">
            <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-lg font-semibold text-gray-700">
                        {title} (ประวัติล่าสุด)
                    </CardTitle>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="ค้นหา (เช่น ชื่อ, รายละเอียด)"
                                className="pl-9 h-9 w-[200px] text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Input
                                type="month"
                                className="h-9 w-[150px] text-sm"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="py-8 text-center text-sm text-gray-400 flex flex-col items-center">
                        <span className="loading-spinner mb-2"></span>
                        Loading history...
                    </div>
                ) : displayData.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">
                        {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "ยังไม่มีข้อมูลในเดือนนี้"}
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="w-[120px]">วันที่</TableHead>
                                    <TableHead>รายละเอียด</TableHead>
                                    <TableHead className="text-right">ยอดเงิน/ข้อมูล</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayData.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium text-xs py-3">{item.date}</TableCell>
                                        <TableCell className="text-xs py-3">{item.detail}</TableCell>
                                        <TableCell className="text-right text-xs py-3 font-medium text-gray-900">
                                            {typeof item.amount === 'number'
                                                ? `฿${item.amount.toLocaleString()}`
                                                : item.amount}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {/* Footer summary if strictly showing limited rows */}
                        {!searchTerm && filteredData.length > 10 && (
                            <div className="p-2 text-center text-xs text-gray-400 bg-gray-50 border-t">
                                แสดง 10 รายการล่าสุดจาก {filteredData.length} รายการ (ใช้ช่องค้นหาเพื่อดูเพิ่ม)
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
