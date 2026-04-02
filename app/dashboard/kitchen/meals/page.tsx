"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

type MealMenu = {
    id: string
    menu_date: string
    meal_type: string
    items: any[]
    special_diet_notes: string | null
    created_at: string
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner"]

export default function MealPlanningPage() {
    const supabase = createClient()
    const [data, setData] = useState<MealMenu[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<MealMenu | null>(null)
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10))
    const [form, setForm] = useState({
        menu_date: new Date().toISOString().slice(0, 10),
        meal_type: "breakfast",
        items_text: "",
        special_diet_notes: "",
    })

    const fetchData = async () => {
        let query = supabase.from("meal_menus").select("*").order("menu_date", { ascending: false }).order("meal_type")
        if (dateFilter) query = query.eq("menu_date", dateFilter)
        const { data: menus } = await query
        setData((menus as MealMenu[]) || [])
    }

    useEffect(() => { fetchData() }, [dateFilter])

    const resetForm = () => {
        setForm({ menu_date: new Date().toISOString().slice(0, 10), meal_type: "breakfast", items_text: "", special_diet_notes: "" })
        setEditing(null)
    }

    const save = async () => {
        if (!form.menu_date) { toast.error("Date required"); return }
        const items = form.items_text.split("\n").filter(Boolean).map((name) => ({ name: name.trim() }))
        const payload = {
            menu_date: form.menu_date,
            meal_type: form.meal_type,
            items,
            special_diet_notes: form.special_diet_notes.trim() || null,
        }
        if (editing) {
            const { error } = await supabase.from("meal_menus").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Menu updated")
        } else {
            const { error } = await supabase.from("meal_menus").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Menu added")
        }
        setOpen(false)
        resetForm()
        fetchData()
    }

    const deleteMenu = async (id: string) => {
        const { error } = await supabase.from("meal_menus").delete().eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Menu deleted")
        fetchData()
    }

    const columns: ColumnDef<MealMenu>[] = [
        { accessorKey: "menu_date", header: "Date" },
        {
            accessorKey: "meal_type",
            header: "Meal",
            cell: ({ row }) => <span className="capitalize">{row.original.meal_type}</span>,
        },
        {
            accessorKey: "items",
            header: "Items",
            cell: ({ row }) => {
                const items = row.original.items || []
                return items.map((i: any) => i.name || i).join(", ") || "—"
            },
        },
        { accessorKey: "special_diet_notes", header: "Diet Notes", cell: ({ row }) => row.original.special_diet_notes || "—" },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            const m = row.original
                            setEditing(m)
                            setForm({
                                menu_date: m.menu_date,
                                meal_type: m.meal_type,
                                items_text: (m.items || []).map((i: any) => i.name || i).join("\n"),
                                special_diet_notes: m.special_diet_notes || "",
                            })
                            setOpen(true)
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteMenu(row.original.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Meal Planning</h2>
                    <p className="text-sm text-muted-foreground mt-1">Plan daily menus for breakfast, lunch, and dinner.</p>
                </div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add Menu</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>{editing ? "Edit Menu" : "Add Menu"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Date</Label><Input type="date" value={form.menu_date} onChange={(e) => setForm((f) => ({ ...f, menu_date: e.target.value }))} /></div>
                            <div>
                                <Label>Meal Type</Label>
                                <Select value={form.meal_type} onValueChange={(v) => setForm((f) => ({ ...f, meal_type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {MEAL_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Items (one per line)</Label>
                                <Textarea rows={6} value={form.items_text} onChange={(e) => setForm((f) => ({ ...f, items_text: e.target.value }))} placeholder="Dal Tadka&#10;Roti&#10;Rice&#10;Sabzi" />
                            </div>
                            <div>
                                <Label>Special Diet Notes</Label>
                                <Textarea rows={2} value={form.special_diet_notes} onChange={(e) => setForm((f) => ({ ...f, special_diet_notes: e.target.value }))} placeholder="Vegan, gluten-free options..." />
                            </div>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex gap-4 items-center">
                <Label>Filter by date</Label>
                <Input type="date" className="w-48" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                <Button variant="outline" size="sm" onClick={() => setDateFilter("")}>All dates</Button>
            </div>
            <Card>
                <CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent>
            </Card>
        </div>
    )
}
