"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
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
import { MaterialForm } from "./material-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export type StudyMaterial = {
    id: string
    title: string
    description: string | null
    type: string
    price: number
    is_free: boolean
    is_published: boolean
    cover_image_url: string | null
    author: string | null
    language: string
    stock_quantity: number
    is_digital: boolean
    file_urls: string[]
}

export default function StudyMaterialsPage() {
    const [data, setData] = useState<StudyMaterial[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [materialToDelete, setMaterialToDelete] = useState<StudyMaterial | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        try {
            const { data: materials, error } = await supabase
                .from("study_materials")
                .select("*")
                .neq("type", "Course")
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching materials:", error)
                toast.error(`Failed to fetch materials: ${error.message}`)
                return
            }

            if (materials) {
                setData(materials)
            } else {
                setData([])
            }
        } catch (error) {
            console.error("Unexpected error fetching materials:", error)
            toast.error("An unexpected error occurred")
        }
    }

    useEffect(() => {
        fetchData()
    }, [supabase])

    const handleEdit = (material: StudyMaterial) => {
        setEditingMaterial(material)
        setIsOpen(true)
    }

    const handleDelete = (material: StudyMaterial) => {
        setMaterialToDelete(material)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!materialToDelete) return

        const { error } = await supabase
            .from("study_materials")
            .delete()
            .eq("id", materialToDelete.id)

        if (error) {
            toast.error("Failed to delete material")
        } else {
            toast.success("Material deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setMaterialToDelete(null)
    }

    const columns: ColumnDef<StudyMaterial>[] = [
        {
            accessorKey: "cover_image_url",
            header: "Cover",
            cell: ({ row }) => {
                const url = row.getValue("cover_image_url") as string | null
                return url ? (
                    <img
                        src={url}
                        alt="Cover"
                        className="w-12 h-12 object-cover rounded"
                    />
                ) : (
                    <div className="w-12 h-16 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500">
                        No Image
                    </div>
                )
            },
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="font-medium text-slate-900">{row.getValue("title")}</div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue("type")}</Badge>
            ),
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
                const isFree = row.original.is_free
                const price = parseFloat(row.getValue("price"))
                return isFree ? (
                    <span className="font-medium text-green-600">Free</span>
                ) : (
                    <div className="font-medium">
                        ₹{new Intl.NumberFormat("en-IN").format(price)}
                    </div>
                )
            },
        },
        {
            accessorKey: "stock_quantity",
            header: "Stock",
            cell: ({ row }) => {
                const material = row.original
                if (material.type === "Book" && !material.is_digital) {
                    return (
                        <div className={material.stock_quantity <= 5 ? "text-red-600 font-medium" : ""}>
                            {material.stock_quantity}
                        </div>
                    )
                }
                return <span className="text-slate-400">-</span>
            },
        },
        {
            accessorKey: "is_published",
            header: "Status",
            cell: ({ row }) => (
                <StatusBadge status={row.getValue("is_published") ? "Published" : "Draft"} />
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const material = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(material)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(material)}
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
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-medium tracking-tight">Study Materials</h2>
                    <p className="text-muted-foreground">
                        Manage books, courses, and digital study materials.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingMaterial(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Material
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-2xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingMaterial ? "Edit Material" : "Add Study Material"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingMaterial
                                    ? "Update material information here."
                                    : "Create a new study material entry."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <MaterialForm
                                initialData={editingMaterial ? {
                                    title: editingMaterial.title,
                                    description: editingMaterial.description ?? undefined,
                                    type: editingMaterial.type as "Book" | "PDF" | "Video" | "Audio",
                                    price: editingMaterial.price,
                                    is_free: editingMaterial.is_free,
                                    is_published: editingMaterial.is_published,
                                    cover_image_url: editingMaterial.cover_image_url ?? undefined,
                                    author: editingMaterial.author ?? undefined,
                                    language: editingMaterial.language,
                                    stock_quantity: editingMaterial.stock_quantity,
                                    is_digital: editingMaterial.is_digital,
                                    file_urls: editingMaterial.file_urls,
                                } : undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingMaterial(null)
                                    fetchData()
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="title"
                searchPlaceholder="Search by title, author, type..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Material</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{materialToDelete?.title}"? This action cannot be undone.
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

