"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MoreHorizontal, Edit, Save, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type Priest = {
    id: string
    employee_id: string | null
    first_name: string
    last_name: string | null
    mobile_number: string | null
    email: string | null
    is_active: boolean
    priest_skills: string[] | null
    languages: string[] | null
    designation: string | null
}

export default function PriestsPage() {
    const [data, setData] = useState<Priest[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingPriest, setEditingPriest] = useState<Priest | null>(null)
    const [skillsInput, setSkillsInput] = useState("")
    const [languagesInput, setLanguagesInput] = useState("")
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: priests } = await supabase
            .from("staff")
            .select("id, employee_id, first_name, last_name, mobile_number, email, is_active, priest_skills, languages, designation")
            .eq("role", "Priest")
            .order("first_name", { ascending: true })

        if (priests) setData(priests)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (priest: Priest) => {
        setEditingPriest(priest)
        setSkillsInput(priest.priest_skills?.join(", ") || "")
        setLanguagesInput(priest.languages?.join(", ") || "")
        setIsOpen(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingPriest) return

        setLoading(true)

        const priestSkills = skillsInput
            ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
            : null

        const languages = languagesInput
            ? languagesInput.split(",").map((l) => l.trim()).filter(Boolean)
            : null

        try {
            const { error } = await supabase
                .from("staff")
                .update({ priest_skills: priestSkills, languages })
                .eq("id", editingPriest.id)

            if (error) throw error

            toast.success("Priest updated successfully")
            setIsOpen(false)
            setEditingPriest(null)
            fetchData()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const columns: ColumnDef<Priest>[] = [
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
            accessorKey: "designation",
            header: "Designation",
            cell: ({ row }) => row.original.designation || "-",
        },
        {
            id: "priest_skills",
            header: "Skills",
            cell: ({ row }) => {
                const skills = row.original.priest_skills
                if (!skills || skills.length === 0) return "-"
                return (
                    <div className="flex flex-wrap gap-1">
                        {skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                )
            },
        },
        {
            id: "languages",
            header: "Languages",
            cell: ({ row }) => {
                const langs = row.original.languages
                if (!langs || langs.length === 0) return "-"
                return (
                    <div className="flex flex-wrap gap-1">
                        {langs.map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                                {lang}
                            </Badge>
                        ))}
                    </div>
                )
            },
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
                const priest = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(priest)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Skills & Languages
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
                    <h2 className="text-2xl font-semibold tracking-tight">Priests</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage priest skills, languages, and specializations.
                    </p>
                </div>
            </div>

            <DataTable
                data={data}
                columns={columns}
                searchKey="first_name"
                searchPlaceholder="Filter priests..."
            />

            <Sheet
                open={isOpen}
                onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingPriest(null)
                }}
            >
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Priest Details</SheetTitle>
                        <SheetDescription>
                            Update skills and languages for{" "}
                            {editingPriest?.first_name} {editingPriest?.last_name || ""}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="priest_skills">
                                Priest Skills (comma-separated)
                            </Label>
                            <Input
                                id="priest_skills"
                                value={skillsInput}
                                onChange={(e) => setSkillsInput(e.target.value)}
                                placeholder="Vedic Rituals, Puja, Havan, Graha Shanti"
                            />
                            {skillsInput && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {skillsInput.split(",").map((s) => s.trim()).filter(Boolean).map((skill) => (
                                        <Badge key={skill} variant="outline" className="text-xs">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="languages">
                                Languages Spoken (comma-separated)
                            </Label>
                            <Input
                                id="languages"
                                value={languagesInput}
                                onChange={(e) => setLanguagesInput(e.target.value)}
                                placeholder="Hindi, Sanskrit, English"
                            />
                            {languagesInput && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {languagesInput.split(",").map((l) => l.trim()).filter(Boolean).map((lang) => (
                                        <Badge key={lang} variant="secondary" className="text-xs">
                                            {lang}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsOpen(false)
                                    setEditingPriest(null)
                                }}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    )
}
