"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save, CalendarDays } from "lucide-react"
import { toast } from "sonner"

type StaffMember = {
    id: string
    first_name: string
    last_name: string | null
    role: string
    employee_id: string | null
}

type AttendanceRecord = {
    staff_id: string
    status: string
    check_in_time: string
    check_out_time: string
    notes: string
}

const STATUSES = ["Present", "Absent", "HalfDay", "OnLeave", "Holiday"]

const statusColors: Record<string, string> = {
    Present: "bg-green-600 hover:bg-green-700",
    Absent: "bg-red-500 hover:bg-red-600",
    HalfDay: "bg-yellow-500 hover:bg-yellow-600",
    OnLeave: "bg-blue-500 hover:bg-blue-600",
    Holiday: "bg-purple-500 hover:bg-purple-600",
}

export default function AttendancePage() {
    const [staffList, setStaffList] = useState<StaffMember[]>([])
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().slice(0, 10)
    )
    const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    const fetchStaff = async () => {
        const { data: staff } = await supabase
            .from("staff")
            .select("id, first_name, last_name, role, employee_id")
            .eq("is_active", true)
            .order("first_name")

        if (staff) setStaffList(staff)
    }

    const fetchAttendance = async (date: string) => {
        setLoading(true)
        const { data: records } = await supabase
            .from("staff_attendance")
            .select("staff_id, status, check_in_time, check_out_time, notes")
            .eq("attendance_date", date)

        const map: Record<string, AttendanceRecord> = {}
        if (records) {
            records.forEach((r: any) => {
                map[r.staff_id] = {
                    staff_id: r.staff_id,
                    status: r.status || "Present",
                    check_in_time: r.check_in_time || "",
                    check_out_time: r.check_out_time || "",
                    notes: r.notes || "",
                }
            })
        }
        setAttendance(map)
        setLoading(false)
    }

    useEffect(() => {
        fetchStaff()
    }, [])

    useEffect(() => {
        if (selectedDate) {
            fetchAttendance(selectedDate)
        }
    }, [selectedDate])

    const getRecord = (staffId: string): AttendanceRecord => {
        return (
            attendance[staffId] || {
                staff_id: staffId,
                status: "Present",
                check_in_time: "",
                check_out_time: "",
                notes: "",
            }
        )
    }

    const updateRecord = (staffId: string, field: keyof AttendanceRecord, value: string) => {
        setAttendance((prev) => ({
            ...prev,
            [staffId]: {
                ...getRecord(staffId),
                [field]: value,
            },
        }))
    }

    const handleSave = async () => {
        setSaving(true)

        // Build upsert payloads for all staff who have a record
        const rows = staffList.map((staff) => {
            const record = getRecord(staff.id)
            return {
                staff_id: staff.id,
                attendance_date: selectedDate,
                status: record.status,
                check_in_time: record.check_in_time || null,
                check_out_time: record.check_out_time || null,
                notes: record.notes || null,
            }
        })

        try {
            const { error } = await supabase
                .from("staff_attendance")
                .upsert(rows, { onConflict: "staff_id,attendance_date" })

            if (error) throw error

            toast.success("Attendance saved successfully")
            fetchAttendance(selectedDate)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to save attendance")
        } finally {
            setSaving(false)
        }
    }

    const presentCount = Object.values(attendance).filter((a) => a.status === "Present").length
    const absentCount = Object.values(attendance).filter((a) => a.status === "Absent").length
    const halfDayCount = Object.values(attendance).filter((a) => a.status === "HalfDay").length
    const onLeaveCount = Object.values(attendance).filter((a) => a.status === "OnLeave").length

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-6 md:p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Staff Attendance</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Record daily attendance for all active staff members.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving || staffList.length === 0}
                    style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Attendance"}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="attendance-date" className="text-sm font-medium">
                        Date:
                    </Label>
                    <Input
                        id="attendance-date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-[180px]"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{absentCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Half Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">{halfDayCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{onLeaveCount}</div>
                    </CardContent>
                </Card>
            </div>

            {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading attendance...</div>
            ) : staffList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No active staff members found.</div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">#</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="w-[160px]">Status</TableHead>
                                <TableHead className="w-[140px]">Check In</TableHead>
                                <TableHead className="w-[140px]">Check Out</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staffList.map((staff, index) => {
                                const record = getRecord(staff.id)
                                return (
                                    <TableRow key={staff.id}>
                                        <TableCell className="text-muted-foreground">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {staff.employee_id || "-"}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {staff.first_name} {staff.last_name || ""}
                                        </TableCell>
                                        <TableCell>{staff.role}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={record.status}
                                                onValueChange={(val) =>
                                                    updateRecord(staff.id, "status", val)
                                                }
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUSES.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    className={`text-xs text-white ${statusColors[status]}`}
                                                                >
                                                                    {status}
                                                                </Badge>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="time"
                                                value={record.check_in_time}
                                                onChange={(e) =>
                                                    updateRecord(staff.id, "check_in_time", e.target.value)
                                                }
                                                className="w-[130px]"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="time"
                                                value={record.check_out_time}
                                                onChange={(e) =>
                                                    updateRecord(staff.id, "check_out_time", e.target.value)
                                                }
                                                className="w-[130px]"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={record.notes}
                                                onChange={(e) =>
                                                    updateRecord(staff.id, "notes", e.target.value)
                                                }
                                                placeholder="Optional notes"
                                                className="min-w-[150px]"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
