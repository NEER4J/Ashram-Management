"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MoreHorizontal, Edit, Trash2, Users, Play, CheckCircle, XCircle } from "lucide-react"
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

type StaffOption = { id: string; first_name: string; last_name: string | null }

type MedicalCamp = {
    id: string
    name: string
    camp_date: string
    end_date: string | null
    location: string | null
    description: string | null
    status: string
    capacity: number | null
    specialties: string[] | null
    organizer_staff_id: string | null
    created_at: string
    staff?: { first_name: string; last_name: string | null } | null
}

type Registration = {
    id: string
    camp_id: string
    patient_name: string
    contact: string | null
    notes: string | null
    status: string
    prescription: string | null
    follow_up_date: string | null
    is_walk_in: boolean
    created_at: string
}

const emptyCampForm = {
    name: "",
    camp_date: "",
    end_date: "",
    location: "",
    description: "",
    capacity: "",
    specialties: "",
    organizer_staff_id: "",
}

const emptyRegForm = {
    patient_name: "",
    contact: "",
    notes: "",
    status: "Registered",
    prescription: "",
    follow_up_date: "",
    is_walk_in: true,
}

export default function MedicalCampsPage() {
    const supabase = createClient()
    const [data, setData] = useState<MedicalCamp[]>([])
    const [staffOptions, setStaffOptions] = useState<StaffOption[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingCamp, setEditingCamp] = useState<MedicalCamp | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [campToDelete, setCampToDelete] = useState<MedicalCamp | null>(null)
    const [form, setForm] = useState(emptyCampForm)

    // Registrations dialog state
    const [regDialogOpen, setRegDialogOpen] = useState(false)
    const [selectedCamp, setSelectedCamp] = useState<MedicalCamp | null>(null)
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [regFormOpen, setRegFormOpen] = useState(false)
    const [regForm, setRegForm] = useState(emptyRegForm)
    const [editingReg, setEditingReg] = useState<Registration | null>(null)

    const fetchData = async () => {
        const { data: camps } = await supabase
            .from("medical_camps")
            .select("*, staff:organizer_staff_id(first_name, last_name)")
            .order("camp_date", { ascending: false })
        if (camps) setData(camps as MedicalCamp[])
    }

    const fetchStaff = async () => {
        const { data: staff } = await supabase
            .from("staff")
            .select("id, first_name, last_name")
            .order("first_name")
        if (staff) setStaffOptions(staff as StaffOption[])
    }

    const fetchRegistrations = async (campId: string) => {
        const { data: regs } = await supabase
            .from("medical_camp_registrations")
            .select("*")
            .eq("camp_id", campId)
            .order("created_at", { ascending: false })
        if (regs) setRegistrations(regs as Registration[])
    }

    useEffect(() => {
        fetchData()
        fetchStaff()
    }, [])

    const handleOpenNew = () => {
        setEditingCamp(null)
        setForm(emptyCampForm)
        setIsOpen(true)
    }

    const handleEdit = (camp: MedicalCamp) => {
        setEditingCamp(camp)
        setForm({
            name: camp.name || "",
            camp_date: camp.camp_date || "",
            end_date: camp.end_date || "",
            location: camp.location || "",
            description: camp.description || "",
            capacity: camp.capacity?.toString() || "",
            specialties: camp.specialties?.join(", ") || "",
            organizer_staff_id: camp.organizer_staff_id || "",
        })
        setIsOpen(true)
    }

    const handleDelete = (camp: MedicalCamp) => {
        setCampToDelete(camp)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!campToDelete) return
        const { error } = await supabase
            .from("medical_camps")
            .delete()
            .eq("id", campToDelete.id)
        if (error) {
            toast.error("Failed to delete camp")
        } else {
            toast.success("Camp deleted successfully")
            fetchData()
        }
        setDeleteDialogOpen(false)
        setCampToDelete(null)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.camp_date) {
            toast.error("Name and date are required")
            return
        }

        const specialtiesArray = form.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)

        const payload = {
            name: form.name.trim(),
            camp_date: form.camp_date,
            end_date: form.end_date || null,
            location: form.location.trim() || null,
            description: form.description.trim() || null,
            capacity: form.capacity ? parseInt(form.capacity) : null,
            specialties: specialtiesArray.length > 0 ? specialtiesArray : null,
            organizer_staff_id: form.organizer_staff_id || null,
        }

        if (editingCamp) {
            const { error } = await supabase
                .from("medical_camps")
                .update(payload)
                .eq("id", editingCamp.id)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Camp updated successfully")
        } else {
            const { error } = await supabase
                .from("medical_camps")
                .insert(payload)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Camp added successfully")
        }

        setIsOpen(false)
        setEditingCamp(null)
        setForm(emptyCampForm)
        fetchData()
    }

    const handleStatusChange = async (camp: MedicalCamp, newStatus: string) => {
        const { error } = await supabase
            .from("medical_camps")
            .update({ status: newStatus })
            .eq("id", camp.id)
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success(`Status updated to ${newStatus}`)
        fetchData()
    }

    const handleViewRegistrations = (camp: MedicalCamp) => {
        setSelectedCamp(camp)
        setRegDialogOpen(true)
        fetchRegistrations(camp.id)
    }

    const handleSaveReg = async () => {
        if (!selectedCamp) return
        if (!regForm.patient_name.trim()) {
            toast.error("Patient name is required")
            return
        }

        const payload = {
            camp_id: selectedCamp.id,
            patient_name: regForm.patient_name.trim(),
            contact: regForm.contact.trim() || null,
            notes: regForm.notes.trim() || null,
            status: regForm.status,
            prescription: regForm.prescription.trim() || null,
            follow_up_date: regForm.follow_up_date || null,
            is_walk_in: regForm.is_walk_in,
        }

        if (editingReg) {
            const { error } = await supabase
                .from("medical_camp_registrations")
                .update(payload)
                .eq("id", editingReg.id)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Registration updated")
        } else {
            const { error } = await supabase
                .from("medical_camp_registrations")
                .insert(payload)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Registration added")
        }

        setRegFormOpen(false)
        setEditingReg(null)
        setRegForm(emptyRegForm)
        fetchRegistrations(selectedCamp.id)
    }

    const handleEditReg = (reg: Registration) => {
        setEditingReg(reg)
        setRegForm({
            patient_name: reg.patient_name || "",
            contact: reg.contact || "",
            notes: reg.notes || "",
            status: reg.status || "Registered",
            prescription: reg.prescription || "",
            follow_up_date: reg.follow_up_date || "",
            is_walk_in: reg.is_walk_in,
        })
        setRegFormOpen(true)
    }

    const handleDeleteReg = async (reg: Registration) => {
        const { error } = await supabase
            .from("medical_camp_registrations")
            .delete()
            .eq("id", reg.id)
        if (error) {
            toast.error("Failed to delete registration")
        } else {
            toast.success("Registration deleted")
            if (selectedCamp) fetchRegistrations(selectedCamp.id)
        }
    }

    const columns: ColumnDef<MedicalCamp>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "camp_date",
            header: "Start Date",
        },
        {
            accessorKey: "end_date",
            header: "End Date",
            cell: ({ row }) => row.original.end_date || "-",
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => row.original.location || "-",
        },
        {
            accessorKey: "capacity",
            header: "Capacity",
            cell: ({ row }) => row.original.capacity ?? "-",
        },
        {
            id: "organizer",
            header: "Organizer",
            cell: ({ row }) => {
                const s = row.original.staff
                return s ? `${s.first_name} ${s.last_name || ""}`.trim() : "-"
            },
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
                const camp = row.original
                const status = camp.status
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewRegistrations(camp)}>
                                <Users className="mr-2 h-4 w-4" />
                                View Registrations
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(camp)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {status === "Scheduled" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(camp, "InProgress")}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Camp
                                </DropdownMenuItem>
                            )}
                            {status === "InProgress" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(camp, "Completed")}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Completed
                                </DropdownMenuItem>
                            )}
                            {(status === "Scheduled" || status === "InProgress") && (
                                <DropdownMenuItem onClick={() => handleStatusChange(camp, "Cancelled")}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Camp
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(camp)}
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
                    <h2 className="text-2xl font-semibold tracking-tight">Medical Camps</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Organise, track, and manage medical camp events and registrations.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) {
                        setEditingCamp(null)
                        setForm(emptyCampForm)
                    }
                }}>
                    <SheetTrigger asChild>
                        <Button
                            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                            onClick={handleOpenNew}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Camp
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingCamp ? "Edit Camp" : "Add Medical Camp"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingCamp
                                    ? "Update camp information here."
                                    : "Create a new medical camp. Fill in the details below."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 py-6">
                            <div>
                                <Label>Name *</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Camp name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={form.camp_date}
                                        onChange={(e) => setForm((f) => ({ ...f, camp_date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={form.end_date}
                                        onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input
                                    value={form.location}
                                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                                    placeholder="Camp location"
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Camp description"
                                />
                            </div>
                            <div>
                                <Label>Capacity</Label>
                                <Input
                                    type="number"
                                    value={form.capacity}
                                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                                    placeholder="Max participants"
                                />
                            </div>
                            <div>
                                <Label>Specialties (comma-separated)</Label>
                                <Input
                                    value={form.specialties}
                                    onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))}
                                    placeholder="e.g. General Medicine, Dental, Eye"
                                />
                            </div>
                            <div>
                                <Label>Organizer (Staff)</Label>
                                <Select
                                    value={form.organizer_staff_id}
                                    onValueChange={(val) => setForm((f) => ({ ...f, organizer_staff_id: val }))}
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
                            <Button onClick={handleSave} className="w-full">
                                {editingCamp ? "Update Camp" : "Save Camp"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Search camps..."
            />

            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Camp</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{campToDelete?.name}&quot;? This will also delete all registrations for this camp. This action cannot be undone.
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

            {/* Registrations dialog */}
            <Dialog open={regDialogOpen} onOpenChange={(open) => {
                setRegDialogOpen(open)
                if (!open) {
                    setSelectedCamp(null)
                    setRegistrations([])
                    setRegFormOpen(false)
                    setEditingReg(null)
                    setRegForm(emptyRegForm)
                }
            }}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Registrations - {selectedCamp?.name}</DialogTitle>
                        <DialogDescription>
                            Manage patient registrations for this medical camp.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                onClick={() => {
                                    setEditingReg(null)
                                    setRegForm(emptyRegForm)
                                    setRegFormOpen(!regFormOpen)
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {regFormOpen ? "Cancel" : "Add Registration"}
                            </Button>
                        </div>

                        {regFormOpen && (
                            <div className="rounded-md border p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Patient Name *</Label>
                                        <Input
                                            value={regForm.patient_name}
                                            onChange={(e) => setRegForm((f) => ({ ...f, patient_name: e.target.value }))}
                                            placeholder="Patient name"
                                        />
                                    </div>
                                    <div>
                                        <Label>Contact</Label>
                                        <Input
                                            value={regForm.contact}
                                            onChange={(e) => setRegForm((f) => ({ ...f, contact: e.target.value }))}
                                            placeholder="Phone / email"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Status</Label>
                                        <Select
                                            value={regForm.status}
                                            onValueChange={(val) => setRegForm((f) => ({ ...f, status: val }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Registered">Registered</SelectItem>
                                                <SelectItem value="Attended">Attended</SelectItem>
                                                <SelectItem value="NoShow">No Show</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Follow-up Date</Label>
                                        <Input
                                            type="date"
                                            value={regForm.follow_up_date}
                                            onChange={(e) => setRegForm((f) => ({ ...f, follow_up_date: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Notes</Label>
                                    <Input
                                        value={regForm.notes}
                                        onChange={(e) => setRegForm((f) => ({ ...f, notes: e.target.value }))}
                                        placeholder="Notes"
                                    />
                                </div>
                                <div>
                                    <Label>Prescription</Label>
                                    <Input
                                        value={regForm.prescription}
                                        onChange={(e) => setRegForm((f) => ({ ...f, prescription: e.target.value }))}
                                        placeholder="Prescription details"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_walk_in"
                                        checked={regForm.is_walk_in}
                                        onChange={(e) => setRegForm((f) => ({ ...f, is_walk_in: e.target.checked }))}
                                        className="h-4 w-4 rounded border"
                                    />
                                    <Label htmlFor="is_walk_in">Walk-in patient</Label>
                                </div>
                                <Button onClick={handleSaveReg} size="sm">
                                    {editingReg ? "Update Registration" : "Save Registration"}
                                </Button>
                            </div>
                        )}

                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-2 text-left font-medium">Patient</th>
                                        <th className="p-2 text-left font-medium">Contact</th>
                                        <th className="p-2 text-left font-medium">Status</th>
                                        <th className="p-2 text-left font-medium">Walk-in</th>
                                        <th className="p-2 text-left font-medium">Follow-up</th>
                                        <th className="p-2 text-left font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-muted-foreground">
                                                No registrations yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        registrations.map((reg) => (
                                            <tr key={reg.id} className="border-b">
                                                <td className="p-2 font-medium">{reg.patient_name}</td>
                                                <td className="p-2">{reg.contact || "-"}</td>
                                                <td className="p-2">
                                                    <StatusBadge status={reg.status} />
                                                </td>
                                                <td className="p-2">{reg.is_walk_in ? "Yes" : "No"}</td>
                                                <td className="p-2">{reg.follow_up_date || "-"}</td>
                                                <td className="p-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleEditReg(reg)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteReg(reg)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
