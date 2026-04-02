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
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

type EmergencyContact = {
    id: string
    name: string
    role: string | null
    phone: string
    type: string | null
    address: string | null
    notes: string | null
    created_at: string
}

const emptyForm = {
    name: "",
    role: "",
    phone: "",
    type: "ambulance",
    address: "",
    notes: "",
}

export default function EmergencyContactsPage() {
    const supabase = createClient()
    const [data, setData] = useState<EmergencyContact[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null)
    const [form, setForm] = useState(emptyForm)

    const fetchData = async () => {
        const { data: contacts } = await supabase
            .from("emergency_contacts")
            .select("*")
            .order("name")
        if (contacts) setData(contacts as EmergencyContact[])
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenNew = () => {
        setEditingContact(null)
        setForm(emptyForm)
        setIsOpen(true)
    }

    const handleEdit = (contact: EmergencyContact) => {
        setEditingContact(contact)
        setForm({
            name: contact.name || "",
            role: contact.role || "",
            phone: contact.phone || "",
            type: contact.type || "ambulance",
            address: (contact as any).address || "",
            notes: (contact as any).notes || "",
        })
        setIsOpen(true)
    }

    const handleDelete = (contact: EmergencyContact) => {
        setContactToDelete(contact)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!contactToDelete) return
        const { error } = await supabase
            .from("emergency_contacts")
            .delete()
            .eq("id", contactToDelete.id)
        if (error) {
            toast.error("Failed to delete contact")
        } else {
            toast.success("Contact deleted successfully")
            fetchData()
        }
        setDeleteDialogOpen(false)
        setContactToDelete(null)
    }

    const handleSave = async () => {
        if (!form.name.trim() || !form.phone.trim()) {
            toast.error("Name and phone are required")
            return
        }

        const payload = {
            name: form.name.trim(),
            role: form.role.trim() || null,
            phone: form.phone.trim(),
            type: form.type,
            address: form.address.trim() || null,
            notes: form.notes.trim() || null,
        }

        if (editingContact) {
            const { error } = await supabase
                .from("emergency_contacts")
                .update(payload)
                .eq("id", editingContact.id)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Contact updated successfully")
        } else {
            const { error } = await supabase
                .from("emergency_contacts")
                .insert(payload)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Contact added successfully")
        }

        setIsOpen(false)
        setEditingContact(null)
        setForm(emptyForm)
        fetchData()
    }

    const columns: ColumnDef<EmergencyContact>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => row.original.role || "-",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.original.type
                if (!type) return "-"
                return <StatusBadge status={type} />
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const contact = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(contact)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(contact)}
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
                    <h2 className="text-2xl font-semibold tracking-tight">Emergency Contacts</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage ambulance, hospital, and doctor contact information.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) {
                        setEditingContact(null)
                        setForm(emptyForm)
                    }
                }}>
                    <SheetTrigger asChild>
                        <Button
                            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                            onClick={handleOpenNew}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Contact
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingContact ? "Edit Contact" : "Add Emergency Contact"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingContact
                                    ? "Update contact information here."
                                    : "Add a new emergency contact. Fill in the details below."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 py-6">
                            <div>
                                <Label>Name *</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Contact name"
                                />
                            </div>
                            <div>
                                <Label>Role</Label>
                                <Input
                                    value={form.role}
                                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                                    placeholder="e.g. Dr. Sharma, City Hospital reception"
                                />
                            </div>
                            <div>
                                <Label>Phone *</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                    placeholder="Phone number"
                                />
                            </div>
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(val) => setForm((f) => ({ ...f, type: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ambulance">Ambulance</SelectItem>
                                        <SelectItem value="hospital">Hospital</SelectItem>
                                        <SelectItem value="doctor">Doctor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input
                                    value={form.address}
                                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                    placeholder="Address"
                                />
                            </div>
                            <div>
                                <Label>Notes</Label>
                                <Input
                                    value={form.notes}
                                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                    placeholder="Additional notes"
                                />
                            </div>
                            <Button onClick={handleSave} className="w-full">
                                {editingContact ? "Update Contact" : "Save Contact"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Search contacts..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Contact</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {contactToDelete?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
