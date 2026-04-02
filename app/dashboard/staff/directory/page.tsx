"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

type Department = {
    id: string
    name: string
}

type Staff = {
    id: string
    employee_id: string | null
    first_name: string
    last_name: string | null
    role: string
    mobile_number: string | null
    email: string | null
    is_active: boolean
    designation: string | null
    department_id: string | null
    join_date: string | null
    date_of_birth: string | null
    contract_type: string | null
    salary_amount: number | null
    salary_frequency: string | null
    languages: string[] | null
    address: string | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
    staff_departments: { name: string } | null
}

const ROLES = [
    "Priest", "Teacher", "Cook", "Security", "Gardener",
    "Admin", "Manager", "Driver", "Medical Staff", "Cleaner",
    "Front Desk", "Other",
]

const CONTRACT_TYPES = ["Full-time", "Part-time", "Seva-based", "Contract"]
const SALARY_FREQUENCIES = ["monthly", "weekly", "daily", "yearly"]

const emptyForm = {
    first_name: "",
    last_name: "",
    role: "Priest",
    mobile_number: "",
    email: "",
    designation: "",
    department_id: "",
    join_date: "",
    date_of_birth: "",
    contract_type: "Full-time",
    salary_amount: "",
    salary_frequency: "monthly",
    languages: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    is_active: true,
}

export default function StaffDirectoryPage() {
    const [data, setData] = useState<Staff[]>([])
    const [filteredData, setFilteredData] = useState<Staff[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>("all")
    const [form, setForm] = useState(emptyForm)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: staff } = await supabase
            .from("staff")
            .select("*, staff_departments(name)")
            .order("first_name", { ascending: true })

        if (staff) {
            setData(staff)
            setFilteredData(staff)
        }
    }

    const fetchDepartments = async () => {
        const { data: depts } = await supabase
            .from("staff_departments")
            .select("id, name")
            .order("name")

        if (depts) setDepartments(depts)
    }

    useEffect(() => {
        fetchData()
        fetchDepartments()
    }, [])

    useEffect(() => {
        if (selectedRole === "all") {
            setFilteredData(data)
        } else {
            setFilteredData(data.filter((s) => s.role === selectedRole))
        }
    }, [selectedRole, data])

    const resetForm = () => {
        setForm(emptyForm)
        setEditingStaff(null)
    }

    const handleEdit = (staff: Staff) => {
        setEditingStaff(staff)
        setForm({
            first_name: staff.first_name || "",
            last_name: staff.last_name || "",
            role: staff.role || "Priest",
            mobile_number: staff.mobile_number || "",
            email: staff.email || "",
            designation: staff.designation || "",
            department_id: staff.department_id || "",
            join_date: staff.join_date || "",
            date_of_birth: staff.date_of_birth || "",
            contract_type: staff.contract_type || "Full-time",
            salary_amount: staff.salary_amount?.toString() || "",
            salary_frequency: staff.salary_frequency || "monthly",
            languages: staff.languages?.join(", ") || "",
            address: staff.address || "",
            emergency_contact_name: staff.emergency_contact_name || "",
            emergency_contact_phone: staff.emergency_contact_phone || "",
            is_active: staff.is_active ?? true,
        })
        setIsOpen(true)
    }

    const handleDelete = (staff: Staff) => {
        setStaffToDelete(staff)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!staffToDelete) return

        const { error } = await supabase
            .from("staff")
            .delete()
            .eq("id", staffToDelete.id)

        if (error) {
            toast.error("Failed to delete staff member")
        } else {
            toast.success("Staff member deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setStaffToDelete(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: Record<string, unknown> = {
            first_name: form.first_name,
            last_name: form.last_name || null,
            role: form.role,
            mobile_number: form.mobile_number || null,
            email: form.email || null,
            designation: form.designation || null,
            department_id: form.department_id || null,
            join_date: form.join_date || null,
            date_of_birth: form.date_of_birth || null,
            contract_type: form.contract_type || "Full-time",
            salary_amount: form.salary_amount ? parseFloat(form.salary_amount) : null,
            salary_frequency: form.salary_frequency || "monthly",
            languages: form.languages
                ? form.languages.split(",").map((l) => l.trim()).filter(Boolean)
                : null,
            address: form.address || null,
            emergency_contact_name: form.emergency_contact_name || null,
            emergency_contact_phone: form.emergency_contact_phone || null,
            is_active: form.is_active,
        }

        try {
            const { error } = editingStaff
                ? await supabase.from("staff").update(payload).eq("id", editingStaff.id)
                : await supabase.from("staff").insert(payload)

            if (error) throw error

            toast.success(editingStaff ? "Staff updated" : "Staff created")
            setIsOpen(false)
            resetForm()
            fetchData()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const columns: ColumnDef<Staff>[] = [
        {
            accessorKey: "employee_id",
            header: "Employee ID",
            cell: ({ row }) => (
                <span className="font-mono">{row.original.employee_id || "-"}</span>
            ),
        },
        {
            accessorKey: "first_name",
            header: "Name",
            cell: ({ row }) =>
                `${row.original.first_name} ${row.original.last_name || ""}`.trim(),
        },
        {
            accessorKey: "role",
            header: "Role",
        },
        {
            id: "department",
            header: "Department",
            cell: ({ row }) => row.original.staff_departments?.name || "-",
        },
        {
            accessorKey: "mobile_number",
            header: "Mobile",
            cell: ({ row }) => row.original.mobile_number || "-",
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
                    {row.getValue("is_active") ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const staff = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(staff)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(staff)}
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
                    <h2 className="text-2xl font-semibold tracking-tight">Staff Directory</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        View and manage all staff members.
                    </p>
                </div>
                <Sheet
                    open={isOpen}
                    onOpenChange={(open) => {
                        setIsOpen(open)
                        if (!open) resetForm()
                    }}
                >
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Staff
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingStaff ? "Edit Staff" : "Add New Staff"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingStaff
                                    ? "Update staff information here."
                                    : "Create a new staff member profile."}
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        value={form.first_name}
                                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={form.last_name}
                                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={form.role}
                                        onValueChange={(val) => setForm({ ...form, role: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map((r) => (
                                                <SelectItem key={r} value={r}>
                                                    {r}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="designation">Designation</Label>
                                    <Input
                                        id="designation"
                                        value={form.designation}
                                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mobile_number">Mobile</Label>
                                    <Input
                                        id="mobile_number"
                                        value={form.mobile_number}
                                        onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department_id">Department</Label>
                                <Select
                                    value={form.department_id}
                                    onValueChange={(val) => setForm({ ...form, department_id: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="join_date">Join Date</Label>
                                    <Input
                                        id="join_date"
                                        type="date"
                                        value={form.join_date}
                                        onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={form.date_of_birth}
                                        onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contract_type">Contract Type</Label>
                                    <Select
                                        value={form.contract_type}
                                        onValueChange={(val) => setForm({ ...form, contract_type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CONTRACT_TYPES.map((ct) => (
                                                <SelectItem key={ct} value={ct}>
                                                    {ct}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary_frequency">Salary Frequency</Label>
                                    <Select
                                        value={form.salary_frequency}
                                        onValueChange={(val) => setForm({ ...form, salary_frequency: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SALARY_FREQUENCIES.map((sf) => (
                                                <SelectItem key={sf} value={sf}>
                                                    {sf.charAt(0).toUpperCase() + sf.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salary_amount">Salary Amount</Label>
                                <Input
                                    id="salary_amount"
                                    type="number"
                                    step="0.01"
                                    value={form.salary_amount}
                                    onChange={(e) => setForm({ ...form, salary_amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="languages">Languages (comma-separated)</Label>
                                <Input
                                    id="languages"
                                    value={form.languages}
                                    onChange={(e) => setForm({ ...form, languages: e.target.value })}
                                    placeholder="Hindi, Sanskrit, English"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        value={form.emergency_contact_name}
                                        onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                                    <Input
                                        id="emergency_contact_phone"
                                        value={form.emergency_contact_phone}
                                        onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <Checkbox
                                    id="is_active"
                                    checked={form.is_active}
                                    onCheckedChange={(checked) =>
                                        setForm({ ...form, is_active: checked === true })
                                    }
                                />
                                <Label htmlFor="is_active" className="leading-none">
                                    Active Staff Member
                                </Label>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                >
                                    {editingStaff ? "Update Staff" : "Add Staff"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="role-filter" className="text-sm font-medium">
                        Filter by Role:
                    </Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger id="role-filter" className="w-[200px]">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles ({data.length})</SelectItem>
                            {ROLES.map((role) => {
                                const count = data.filter((s) => s.role === role).length
                                return (
                                    <SelectItem key={role} value={role}>
                                        {role} ({count})
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>
                {selectedRole !== "all" && (
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredData.length} of {data.length} staff
                    </p>
                )}
            </div>

            <DataTable
                data={filteredData}
                columns={columns}
                searchKey="first_name"
                searchPlaceholder="Filter staff..."
            />

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Staff</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {staffToDelete?.first_name}{" "}
                            {staffToDelete?.last_name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
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
