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
import { toast } from "sonner"

type StaffMember = {
    id: string
    first_name: string
    last_name: string | null
}

type Department = {
    id: string
    name: string
    description: string | null
    head_staff_id: string | null
    created_at: string
    head_staff?: { first_name: string; last_name: string | null } | null
    staff_count: number
}

const emptyForm = {
    name: "",
    description: "",
    head_staff_id: "",
}

export default function DepartmentsPage() {
    const [data, setData] = useState<Department[]>([])
    const [staffList, setStaffList] = useState<StaffMember[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingDept, setEditingDept] = useState<Department | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deptToDelete, setDeptToDelete] = useState<Department | null>(null)
    const [form, setForm] = useState(emptyForm)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        // Fetch departments with head staff info
        const { data: departments } = await supabase
            .from("staff_departments")
            .select("*, head_staff:staff!staff_departments_head_staff_id_fkey(first_name, last_name)")
            .order("name")

        // Fetch staff counts per department
        const { data: staffCounts } = await supabase
            .from("staff")
            .select("department_id")
            .eq("is_active", true)

        const countMap: Record<string, number> = {}
        if (staffCounts) {
            staffCounts.forEach((s: { department_id: string | null }) => {
                if (s.department_id) {
                    countMap[s.department_id] = (countMap[s.department_id] || 0) + 1
                }
            })
        }

        if (departments) {
            setData(
                departments.map((d: any) => ({
                    ...d,
                    head_staff: d.head_staff,
                    staff_count: countMap[d.id] || 0,
                }))
            )
        }
    }

    const fetchStaff = async () => {
        const { data: staff } = await supabase
            .from("staff")
            .select("id, first_name, last_name")
            .eq("is_active", true)
            .order("first_name")

        if (staff) setStaffList(staff)
    }

    useEffect(() => {
        fetchData()
        fetchStaff()
    }, [])

    const resetForm = () => {
        setForm(emptyForm)
        setEditingDept(null)
    }

    const handleEdit = (dept: Department) => {
        setEditingDept(dept)
        setForm({
            name: dept.name || "",
            description: dept.description || "",
            head_staff_id: dept.head_staff_id || "",
        })
        setIsOpen(true)
    }

    const handleDelete = (dept: Department) => {
        setDeptToDelete(dept)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deptToDelete) return

        const { error } = await supabase
            .from("staff_departments")
            .delete()
            .eq("id", deptToDelete.id)

        if (error) {
            toast.error("Failed to delete department")
        } else {
            toast.success("Department deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setDeptToDelete(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload: Record<string, unknown> = {
            name: form.name,
            description: form.description || null,
            head_staff_id: form.head_staff_id || null,
        }

        try {
            const { error } = editingDept
                ? await supabase.from("staff_departments").update(payload).eq("id", editingDept.id)
                : await supabase.from("staff_departments").insert(payload)

            if (error) throw error

            toast.success(editingDept ? "Department updated" : "Department created")
            setIsOpen(false)
            resetForm()
            fetchData()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const columns: ColumnDef<Department>[] = [
        {
            accessorKey: "name",
            header: "Department Name",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => row.original.description || "-",
        },
        {
            id: "head",
            header: "Department Head",
            cell: ({ row }) => {
                const head = row.original.head_staff
                if (!head) return "-"
                return `${head.first_name} ${head.last_name || ""}`.trim()
            },
        },
        {
            id: "staff_count",
            header: "Staff Count",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.staff_count}</span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const dept = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(dept)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(dept)}
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
                    <h2 className="text-2xl font-semibold tracking-tight">Departments</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage staff departments and team leads.
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
                            <Plus className="mr-2 h-4 w-4" /> Add Department
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingDept ? "Edit Department" : "Add New Department"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingDept
                                    ? "Update department information here."
                                    : "Create a new department."}
                            </SheetDescription>
                        </SheetHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Department Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="head_staff_id">Department Head</Label>
                                <Select
                                    value={form.head_staff_id}
                                    onValueChange={(val) =>
                                        setForm({ ...form, head_staff_id: val })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select staff member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffList.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.first_name} {s.last_name || ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                >
                                    {editingDept ? "Update Department" : "Add Department"}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <DataTable
                data={data}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Filter departments..."
            />

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Department</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deptToDelete?.name}&quot;?
                            This action cannot be undone.
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
