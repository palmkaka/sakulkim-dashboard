"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { X, Plus, Trash2, Save, Users, Layers } from "lucide-react";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

type Team = {
    id: string;
    name: string;
};

type Employee = {
    id: string;
    fullName: string;
    team: string; // Linking to Team name or ID. Let's use name for simplicity as requested "Add New Team (insert name)"
    baseSalary: number;
    employeeId?: string;
};

interface ManagePayrollDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ManagePayrollDataModal({ isOpen, onClose }: ManagePayrollDataModalProps) {
    const [activeTab, setActiveTab] = useState<"teams" | "employees">("teams");
    const [teams, setTeams] = useState<Team[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Inputs
    const [newTeamName, setNewTeamName] = useState("");
    const [newEmp, setNewEmp] = useState({ name: "", team: "", salary: "", empId: "" });

    // Fetch Teams
    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, "teams"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            setTeams(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
        });
        return () => unsub();
    }, []);

    // Fetch Employees
    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, "employees"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snapshot) => {
            setEmployees(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Employee)));
        });
        return () => unsub();
    }, []);

    const handleAddTeam = async () => {
        if (!newTeamName.trim()) return;
        try {
            await addDoc(collection(db, "teams"), {
                name: newTeamName,
                createdAt: serverTimestamp()
            });
            setNewTeamName("");
        } catch (e) {
            console.error(e);
            alert("Error adding team");
        }
    };

    const handleDeleteTeam = async (id: string) => {
        if (!confirm("Delete this team?")) return;
        try {
            await deleteDoc(doc(db, "teams", id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddEmployee = async () => {
        if (!newEmp.name || !newEmp.team) {
            alert("Please fill Name and Team");
            return;
        }
        try {
            await addDoc(collection(db, "employees"), {
                fullName: newEmp.name,
                team: newEmp.team,
                baseSalary: Number(newEmp.salary) || 0,
                employeeId: newEmp.empId || `EMP-${Math.floor(Math.random() * 1000)}`,
                createdAt: serverTimestamp(),
                status: "Active" // Default
            });
            setNewEmp({ name: "", team: "", salary: "", empId: "" });
        } catch (e) {
            console.error(e);
            alert("Error adding employee");
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm("Delete this employee?")) return;
        try {
            await deleteDoc(doc(db, "employees", id));
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Save className="h-5 w-5 text-indigo-600" />
                        จัดการข้อมูลพื้นฐาน (Manage Data)
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50">
                    <button
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === "teams" ? "bg-white border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                        onClick={() => setActiveTab("teams")}
                    >
                        <Layers className="h-4 w-4" /> ทีม (Teams)
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === "employees" ? "bg-white border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
                        onClick={() => setActiveTab("employees")}
                    >
                        <Users className="h-4 w-4" /> พนักงาน (Employees)
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {activeTab === "teams" && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="ใส่ชื่อทีมใหม่ (e.g. Sales A)"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                />
                                <Button onClick={handleAddTeam} className="bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="h-4 w-4 mr-1" /> เพิ่ม
                                </Button>
                            </div>

                            <div className="border rounded-md divide-y">
                                {teams.length === 0 && (
                                    <div className="p-4 text-center text-gray-500">ยังไม่มีข้อมูลทีม</div>
                                )}
                                {teams.map(team => (
                                    <div key={team.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                        <span className="font-medium">{team.name}</span>
                                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteTeam(team.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "employees" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-md border">
                                <Input
                                    placeholder="ชื่อ-สกุล"
                                    className="col-span-2 md:col-span-1"
                                    value={newEmp.name}
                                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                                />
                                <div className="col-span-2 md:col-span-1">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newEmp.team}
                                        onChange={(e) => setNewEmp({ ...newEmp, team: e.target.value })}
                                    >
                                        <option value="">เลือกทีม...</option>
                                        {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                    </select>
                                </div>
                                <Input
                                    type="number"
                                    placeholder="เงินเดือน"
                                    className="col-span-2 md:col-span-1"
                                    value={newEmp.salary}
                                    onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                                />
                                <Button className="col-span-2 md:col-span-1 bg-indigo-600" onClick={handleAddEmployee}>
                                    <Plus className="h-4 w-4" /> เพิ่ม
                                </Button>
                            </div>

                            <div className="border rounded-md">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 text-left">ชื่อ</th>
                                            <th className="p-2 text-left">ทีม</th>
                                            <th className="p-2 text-right">เงินเดือน</th>
                                            <th className="p-2 w-[50px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {employees.length === 0 && (
                                            <tr><td colSpan={4} className="p-4 text-center text-gray-500">ไม่มีข้อมูลพนักงาน</td></tr>
                                        )}
                                        {employees.map(emp => (
                                            <tr key={emp.id} className="hover:bg-gray-50">
                                                <td className="p-2">{emp.fullName}</td>
                                                <td className="p-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        {emp.team}
                                                    </span>
                                                </td>
                                                <td className="p-2 text-right">{emp.baseSalary?.toLocaleString()}</td>
                                                <td className="p-2 text-right">
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDeleteEmployee(emp.id)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <Button onClick={onClose}>ปิดหน้าต่าง (Close)</Button>
                </div>
            </div>
        </div>
    );
}
