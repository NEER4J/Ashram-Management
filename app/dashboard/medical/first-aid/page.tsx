"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type StaffOption = { id: string; first_name: string; last_name: string | null }

type FirstAidIncident = {
    id: string
    incident_date: string
    incident_time: string | null
    location: string | null
    patient_name: string | null
    patient_contact: string | null
    incident_type: string | null
    treatment_given: string | null
    referred_to_hospital: boolean
    hospital_name: string | null
    attending_staff_id: string | null
    severity: string | null
    notes: string | null
    created_at: string
    staff?: { first_name: string; last_name: string | null } | null
}

const INCIDENT_TYPES = ["Faint", "Fall", "Cut", "HeatStroke", "AllergicReaction", "Burn", "Fracture", "Other"]
const SEVERITY_OPTIONS = ["Minor", "Moderate", "Serious"]

const emptyForm = {
    incident_date: new Date().toISOString().slice(0, 10),
    incident_time: "",
    location: "",
    patient_name: "",
    patient_contact: "",
    incident_type: "Other",
    treatment_given: "",
    referred_to_hospital: false,
    hospital_name: "",
    attending_staff_id: "",
    severity: "Minor",
    notes: "",
}

export default function FirstAidPage() {
    const supabase = createClient()
    const [data, setData] = useState<FirstAidIncident[]>([])
    const [staffOptions, setStaffOptions] = useState<StaffOption[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<FirstAidIncident | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<FirstAidIncident | null>(null)
    const [form, setForm] = useState(emptyForm)

    const fetchData = async () => {
        const { data: incidents } = await supabase
            .from("first_aid_incidents")
            .select("*, staff:attending_staff_id(first_name, last_name)")
            .order("incident_date", { ascending: false })
        if (incidents) setData(incidents as FirstAidIncident[])
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
        fetchStaff()
    }, [])

    const handleOpenNew = () => {
        setEditingItem(null)
        setForm({
            ...emptyForm,
            incident_date: new Date().toISOString().slice(0, 10),
        })
        setIsOpen(true)
    }

    const handleEdit = (item: FirstAidIncident) => {
        setEditingItem(item)
        setForm({
            incident_date: item.incident_date || new Date().toISOString().slice(0, 10),
            incident_time: item.incident_time || "",
            location: item.location || "",
            patient_name: item.patient_name || "",
            patient_contact: item.patient_contact || "",
            incident_type: item.incident_type || "Other",
            treatment_given: item.treatment_given || "",
            referred_to_hospital: item.referred_to_hospital || false,
            hospital_name: item.hospital_name || "",
            attending_staff_id: item.attending_staff_id || "",
            severity: item.severity || "Minor",
            notes: item.notes || "",
        })
        setIsOpen(true)
    }

    const handleDelete = (item: FirstAidIncident) => {
        setItemToDelete(item)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!itemToDelete) return
        const { error } = await supabase
            .from("first_aid_incidents")
            .delete()
            .eq("id", itemToDelete.id)
        if (error) {
            toast.error("Failed to delete incident")
        } else {
            toast.success("Incident deleted successfully")
            fetchData()
        }
        setDeleteDialogOpen(false)
        setItemToDelete(null)
    }

    const handleSave = async () => {
        if (!form.patient_name.trim()) {
            toast.error("Patient name is required")
            return
        }

        const payload = {
            incident_date: form.incident_date,
            incident_time: form.incident_time || null,
            location: form.location.trim() || null,
            patient_name: form.patient_name.trim(),
            patient_contact: form.patient_contact.trim() || null,
            incident_type: form.incident_type,
            treatment_given: form.treatment_given.trim() || null,
            referred_to_hospital: form.referred_to_hospital,
            hospital_name: form.referred_to_hospital ? (form.hospital_name.trim() || null) : null,
            attending_staff_id: form.attending_staff_id || null,
            severity: form.severity,
            notes: form.notes.trim() || null,
        }

        if (editingItem) {
            const { error } = await supabase
                .from("first_aid_incidents")
                .update(payload)
                .eq("id", editingItem.id)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Incident updated successfully")
        } else {
            const { error } = await supabase
                .from("first_aid_incidents")
                .insert(payload)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Incident recorded successfully")
        }

        setIsOpen(false)
        setEditingItem(null)
        setForm(emptyForm)
        fetchData()
    }

    const severityColor = (severity: string | null) => {
        switch (severity) {
            case "Minor":
                return "bg-green-100 text-green-800 hover:bg-green-200"
            case "Moderate":
                return "bg-amber-100 text-amber-800 hover:bg-amber-200"
            case "Serious":
                return "bg-red-100 text-red-800 hover:bg-red-200"
            default:
                return ""
        }
    }

    const columns: ColumnDef<FirstAidIncident>[] = [
        {
            accessorKey: "incident_date",
            header: "Date",
        },
        {
            accessorKey: "patient_name",
            header: "Patient",
            cell: ({ row }) => (
                <div className="font-medium">{row.original.patient_name || "-"}</div>
            ),
        },
        {
            accessorKey: "incident_type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.original.incident_type
                if (!type) return "-"
                const label = type === "HeatStroke" ? "Heat Stroke"
                    : type === "AllergicReaction" ? "Allergic Reaction"
                    : type
                return label
            },
        },
        {
            accessorKey: "severity",
            header: "Severity",
            cell: ({ row }) => {
                const severity = row.original.severity
                if (!severity) return "-"
                return (
                    <Badge variant="secondary" className={severityColor(severity)}>
                        {severity}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "referred_to_hospital",
            header: "Hospital Referral",
            cell: ({ row }) => {
                const referred = row.original.referred_to_hospital
                if (!referred) return <span className="text-muted-foreground text-sm">No</span>
                return (
                    <Badge variant="destructive" className="text-xs">
                        Yes{row.original.hospital_name ? ` — ${row.original.hospital_name}` : ""}
                    </Badge>
                )
            },
        },
        {
            id: "attending_staff",
            header: "Attending Staff",
            cell: ({ row }) => {
                const s = row.original.staff
                return s ? `${s.first_name} ${s.last_name || ""}`.trim() : "-"
            },
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
                    <h2 className="text-2xl font-semibold tracking-tight">First Aid Log</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Record and track first aid incidents, treatments, and hospital referrals.
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
                            <Plus className="mr-2 h-4 w-4" /> Log Incident
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingItem ? "Edit Incident" : "Log First Aid Incident"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingItem
                                    ? "Update incident details here."
                                    : "Record a new first aid incident. Fill in the details below."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Incident Date *</Label>
                                    <Input
                                        type="date"
                                        value={form.incident_date}
                                        onChange={(e) => setForm((f) => ({ ...f, incident_date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Incident Time</Label>
                                    <Input
                                        type="time"
                                        value={form.incident_time}
                                        onChange={(e) => setForm((f) => ({ ...f, incident_time: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input
                                    value={form.location}
                                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                    placeholder="Where did the incident occur?"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Patient Name *</Label>
                                    <Input
                                        value={form.patient_name}
                                        onChange={(e) => setForm((f) => ({ ...f, patient_name: e.target.value }))}
                                        placeholder="Patient name"
                                    />
                                </div>
                                <div>
                                    <Label>Patient Contact</Label>
                                    <Input
                                        value={form.patient_contact}
                                        onChange={(e) => setForm((f) => ({ ...f, patient_contact: e.target.value }))}
                                        placeholder="Phone / contact"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Incident Type</Label>
                                    <Select
                                        value={form.incident_type}
                                        onValueChange={(val) => setForm((f) => ({ ...f, incident_type: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {INCIDENT_TYPES.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t === "HeatStroke" ? "Heat Stroke"
                                                        : t === "AllergicReaction" ? "Allergic Reaction"
                                                        : t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Severity</Label>
                                    <Select
                                        value={form.severity}
                                        onValueChange={(val) => setForm((f) => ({ ...f, severity: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SEVERITY_OPTIONS.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label>Treatment Given</Label>
                                <Textarea
                                    value={form.treatment_given}
                                    onChange={(e) => setForm((f) => ({ ...f, treatment_given: e.target.value }))}
                                    placeholder="Describe the treatment provided"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="referred_to_hospital"
                                    checked={form.referred_to_hospital}
                                    onChange={(e) => setForm((f) => ({
                                        ...f,
                                        referred_to_hospital: e.target.checked,
                                        hospital_name: e.target.checked ? f.hospital_name : "",
                                    }))}
                                    className="h-4 w-4 rounded border"
                                />
                                <Label htmlFor="referred_to_hospital">Referred to Hospital</Label>
                            </div>
                            {form.referred_to_hospital && (
                                <div>
                                    <Label>Hospital Name</Label>
                                    <Input
                                        value={form.hospital_name}
                                        onChange={(e) => setForm((f) => ({ ...f, hospital_name: e.target.value }))}
                                        placeholder="Hospital name"
                                    />
                                </div>
                            )}
                            <div>
                                <Label>Attending Staff</Label>
                                <Select
                                    value={form.attending_staff_id}
                                    onValueChange={(val) => setForm((f) => ({ ...f, attending_staff_id: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select staff member" />
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
                                <Label>Notes</Label>
                                <Textarea
                                    value={form.notes}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                    placeholder="Additional notes"
                                />
                            </div>
                            <Button onClick={handleSave} className="w-full">
                                {editingItem ? "Update Incident" : "Save Incident"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="patient_name"
                searchPlaceholder="Search by patient name..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Incident</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this incident record? This action cannot be undone.
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
