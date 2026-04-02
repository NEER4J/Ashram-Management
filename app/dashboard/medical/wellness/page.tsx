"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

type DevoteeOption = { id: string; first_name: string; last_name: string | null }
type StaffOption = { id: string; first_name: string; last_name: string | null }

type WellnessConsultation = {
    id: string
    devotee_id: string | null
    consultation_date: string
    practitioner_id: string | null
    type: string
    treatment_plan: string | null
    session_notes: string | null
    follow_up_date: string | null
    status: string
    created_at: string
    devotees?: { first_name: string; last_name: string | null } | null
    staff?: { first_name: string; last_name: string | null } | null
}

const CONSULTATION_TYPES = ["Ayurveda", "Yoga", "Naturopathy", "Meditation", "Counseling"]
const STATUS_OPTIONS = ["Scheduled", "Completed", "NoShow"]

const emptyForm = {
    devotee_id: "",
    consultation_date: "",
    practitioner_id: "",
    type: "Ayurveda",
    treatment_plan: "",
    session_notes: "",
    follow_up_date: "",
    status: "Scheduled",
}

export default function WellnessConsultationsPage() {
    const supabase = createClient()
    const [data, setData] = useState<WellnessConsultation[]>([])
    const [devoteeOptions, setDevoteeOptions] = useState<DevoteeOption[]>([])
    const [staffOptions, setStaffOptions] = useState<StaffOption[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<WellnessConsultation | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<WellnessConsultation | null>(null)
    const [form, setForm] = useState(emptyForm)

    const fetchData = async () => {
        const { data: consultations } = await supabase
            .from("wellness_consultations")
            .select("*, devotees:devotee_id(first_name, last_name), staff:practitioner_id(first_name, last_name)")
            .order("consultation_date", { ascending: false })
        if (consultations) setData(consultations as WellnessConsultation[])
    }

    const fetchDevotees = async () => {
        const { data: devotees } = await supabase
            .from("devotees")
            .select("id, first_name, last_name")
            .order("first_name")
        if (devotees) setDevoteeOptions(devotees as DevoteeOption[])
    }

    const fetchStaff = async () => {
        const { data: staff } = await supabase
            .from("staff")
            .select("id, first_name, last_name")
            .order("first_name")
        if (staff) setStaffOptions(staff as StaffOption[])
    }

    useEffect(() => {
        fetchData()
        fetchDevotees()
        fetchStaff()
    }, [])

    const handleOpenNew = () => {
        setEditingItem(null)
        setForm(emptyForm)
        setIsOpen(true)
    }

    const handleEdit = (item: WellnessConsultation) => {
        setEditingItem(item)
        setForm({
            devotee_id: item.devotee_id || "",
            consultation_date: item.consultation_date || "",
            practitioner_id: item.practitioner_id || "",
            type: item.type || "Ayurveda",
            treatment_plan: item.treatment_plan || "",
            session_notes: item.session_notes || "",
            follow_up_date: item.follow_up_date || "",
            status: item.status || "Scheduled",
        })
        setIsOpen(true)
    }

    const handleDelete = (item: WellnessConsultation) => {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        const { error } = await supabase
            .from("wellness_consultations")
            .delete()
            .eq("id", itemToDelete.id)
        if (error) {
            toast.error("Failed to delete consultation")
        } else {
            toast.success("Consultation deleted successfully")
            fetchData()
        }
        setDeleteDialogOpen(false)
        setItemToDelete(null)
    }

    const handleSave = async () => {
        if (!form.consultation_date) {
            toast.error("Consultation date is required")
            return
        }

        const payload = {
            devotee_id: form.devotee_id || null,
            consultation_date: form.consultation_date,
            practitioner_id: form.practitioner_id || null,
            type: form.type,
            treatment_plan: form.treatment_plan.trim() || null,
            session_notes: form.session_notes.trim() || null,
            follow_up_date: form.follow_up_date || null,
            status: form.status,
        }

        if (editingItem) {
            const { error } = await supabase
                .from("wellness_consultations")
                .update(payload)
                .eq("id", editingItem.id)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Consultation updated successfully")
        } else {
            const { error } = await supabase
                .from("wellness_consultations")
                .insert(payload)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Consultation added successfully")
        }

        setIsOpen(false)
        setEditingItem(null)
        setForm(emptyForm)
        fetchData()
    }

    const handleStatusChange = async (item: WellnessConsultation, newStatus: string) => {
        const { error } = await supabase
            .from("wellness_consultations")
            .update({ status: newStatus })
            .eq("id", item.id)
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success(`Status updated to ${newStatus}`)
        fetchData()
    }

    const columns: ColumnDef<WellnessConsultation>[] = [
        {
            accessorKey: "consultation_date",
            header: "Date",
        },
        {
            id: "devotee",
            header: "Devotee",
            cell: ({ row }) => {
                const d = row.original.devotees
                return d ? `${d.first_name} ${d.last_name || ""}`.trim() : "-"
            },
        },
        {
            id: "practitioner",
            header: "Practitioner",
            cell: ({ row }) => {
                const s = row.original.staff
                return s ? `${s.first_name} ${s.last_name || ""}`.trim() : "-"
            },
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => <StatusBadge status={row.getValue("type")} />,
        },
        {
            accessorKey: "follow_up_date",
            header: "Follow-up",
            cell: ({ row }) => row.original.follow_up_date || "-",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const item = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {item.status !== "Completed" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(item, "Completed")}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Completed
                                </DropdownMenuItem>
                            )}
                            {item.status !== "NoShow" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(item, "NoShow")}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Mark No Show
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(item)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-6 md:p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Wellness Consultations</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage Ayurveda, yoga, and wellness consultation sessions.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) {
                        setEditingItem(null)
                        setForm(emptyForm)
                    }
                }}>
                    <SheetTrigger asChild>
                        <Button
                            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                            onClick={handleOpenNew}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Consultation
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingItem ? "Edit Consultation" : "Add Wellness Consultation"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingItem
                                    ? "Update consultation details here."
                                    : "Schedule a new wellness consultation session."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 py-6">
                            <div>
                                <Label>Devotee</Label>
                                <Select
                                    value={form.devotee_id}
                                    onValueChange={(val) => setForm((f) => ({ ...f, devotee_id: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select devotee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {devoteeOptions.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.first_name} {d.last_name || ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Consultation Date *</Label>
                                <Input
                                    type="date"
                                    value={form.consultation_date}
                                    onChange={(e) => setForm((f) => ({ ...f, consultation_date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Practitioner (Staff)</Label>
                                <Select
                                    value={form.practitioner_id}
                                    onValueChange={(val) => setForm((f) => ({ ...f, practitioner_id: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select practitioner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffOptions.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.first_name} {s.last_name || ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(val) => setForm((f) => ({ ...f, type: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONSULTATION_TYPES.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Treatment Plan</Label>
                                <Textarea
                                    value={form.treatment_plan}
                                    onChange={(e) => setForm((f) => ({ ...f, treatment_plan: e.target.value }))}
                                    placeholder="Treatment plan details"
                                />
                            </div>
                            <div>
                                <Label>Session Notes</Label>
                                <Textarea
                                    value={form.session_notes}
                                    onChange={(e) => setForm((f) => ({ ...f, session_notes: e.target.value }))}
                                    placeholder="Notes from the session"
                                />
                            </div>
                            <div>
                                <Label>Follow-up Date</Label>
                                <Input
                                    type="date"
                                    value={form.follow_up_date}
                                    onChange={(e) => setForm((f) => ({ ...f, follow_up_date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(val) => setForm((f) => ({ ...f, status: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s === "NoShow" ? "No Show" : s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSave} className="w-full">
                                {editingItem ? "Update Consultation" : "Save Consultation"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="consultation_date"
                searchPlaceholder="Search by date..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Consultation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this consultation? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
