"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, LogIn, LogOut, QrCode, Star, MessageSquare, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

type Visitor = {
    id: string
    name: string
    phone: string
    email: string | null
    visit_purpose: string | null
    visit_date: string
    check_in_at: string | null
    check_out_at: string | null
    visitor_pass_code: string | null
    is_walk_in: boolean
    is_vip: boolean
    special_arrangements_note: string | null
    feedback_text: string | null
    nationality: string | null
    vehicle_number: string | null
    visiting_department: string | null
    created_at: string
}

export default function TodayVisitorsPage() {
    const supabase = createClient()
    const [visitors, setVisitors] = useState<Visitor[]>([])
    const [visitDate, setVisitDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Visitor | null>(null)
    const [passDialog, setPassDialog] = useState<Visitor | null>(null)
    const [feedbackVisitor, setFeedbackVisitor] = useState<Visitor | null>(null)
    const [feedbackText, setFeedbackText] = useState("")
    const [form, setForm] = useState({
        name: "", phone: "", email: "", visit_purpose: "", is_vip: false,
        special_arrangements_note: "", nationality: "", vehicle_number: "", visiting_department: "",
    })

    const fetchVisitors = async () => {
        const { data } = await supabase.from("visitor_registrations").select("*").eq("visit_date", visitDate).order("created_at", { ascending: false })
        setVisitors((data as Visitor[]) || [])
    }

    useEffect(() => { fetchVisitors() }, [visitDate])

    const resetForm = () => {
        setForm({ name: "", phone: "", email: "", visit_purpose: "", is_vip: false, special_arrangements_note: "", nationality: "", vehicle_number: "", visiting_department: "" })
        setEditing(null)
    }

    const save = async () => {
        if (!form.name.trim() || !form.phone.trim()) { toast.error("Name and phone are required"); return }
        const payload: any = {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || null,
            visit_purpose: form.visit_purpose.trim() || null,
            is_vip: form.is_vip,
            special_arrangements_note: form.special_arrangements_note.trim() || null,
            nationality: form.nationality.trim() || null,
            vehicle_number: form.vehicle_number.trim() || null,
            visiting_department: form.visiting_department.trim() || null,
        }
        if (editing) {
            const { error } = await supabase.from("visitor_registrations").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Visitor updated")
            setOpen(false)
            resetForm()
            fetchVisitors()
        } else {
            payload.is_walk_in = true
            payload.visit_date = visitDate
            const { data, error } = await supabase.from("visitor_registrations").insert(payload).select().single()
            if (error) { toast.error(error.message); return }
            setOpen(false)
            resetForm()
            fetchVisitors()
            setPassDialog(data as Visitor)
            toast.success("Visitor registered")
        }
    }

    const checkIn = async (v: Visitor) => {
        const { error } = await supabase.from("visitor_registrations").update({ check_in_at: new Date().toISOString() }).eq("id", v.id)
        if (error) { toast.error(error.message); return }
        fetchVisitors()
        toast.success("Checked in")
    }

    const checkOut = async (v: Visitor) => {
        const { error } = await supabase.from("visitor_registrations").update({ check_out_at: new Date().toISOString() }).eq("id", v.id)
        if (error) { toast.error(error.message); return }
        fetchVisitors()
        setFeedbackVisitor(v)
        toast.success("Checked out")
    }

    const deleteVisitor = async (id: string) => {
        const { error } = await supabase.from("visitor_registrations").delete().eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Visitor deleted")
        fetchVisitors()
    }

    const submitFeedback = async () => {
        if (!feedbackVisitor) return
        const { error } = await supabase.from("visitor_registrations").update({ feedback_text: feedbackText }).eq("id", feedbackVisitor.id)
        if (error) { toast.error(error.message); return }
        setFeedbackVisitor(null)
        setFeedbackText("")
        fetchVisitors()
        toast.success("Feedback saved")
    }

    const columns: ColumnDef<Visitor>[] = [
        { accessorKey: "visitor_pass_code", header: "Pass", cell: ({ row }) => row.original.visitor_pass_code || "—" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "phone", header: "Phone" },
        { accessorKey: "visit_purpose", header: "Purpose", cell: ({ row }) => row.original.visit_purpose || "—" },
        { accessorKey: "check_in_at", header: "In", cell: ({ row }) => row.original.check_in_at ? new Date(row.original.check_in_at).toLocaleTimeString() : "—" },
        { accessorKey: "check_out_at", header: "Out", cell: ({ row }) => row.original.check_out_at ? new Date(row.original.check_out_at).toLocaleTimeString() : "—" },
        { accessorKey: "is_vip", header: "VIP", cell: ({ row }) => row.original.is_vip ? <Star className="h-4 w-4 text-amber-500" /> : null },
        {
            id: "actions",
            cell: ({ row }) => {
                const v = row.original
                return (
                    <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => setPassDialog(v)} title="Show pass"><QrCode className="h-4 w-4" /></Button>
                        {!v.check_in_at && <Button size="sm" onClick={() => checkIn(v)}><LogIn className="h-4 w-4 mr-1" />In</Button>}
                        {v.check_in_at && !v.check_out_at && <Button size="sm" variant="secondary" onClick={() => checkOut(v)}><LogOut className="h-4 w-4 mr-1" />Out</Button>}
                        {v.check_out_at && !v.feedback_text && <Button size="sm" variant="ghost" onClick={() => setFeedbackVisitor(v)}><MessageSquare className="h-4 w-4" /></Button>}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => {
                                    setEditing(v)
                                    setForm({
                                        name: v.name, phone: v.phone, email: v.email || "", visit_purpose: v.visit_purpose || "",
                                        is_vip: v.is_vip, special_arrangements_note: v.special_arrangements_note || "",
                                        nationality: v.nationality || "", vehicle_number: v.vehicle_number || "", visiting_department: v.visiting_department || "",
                                    })
                                    setOpen(true)
                                }}>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => deleteVisitor(v.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Today&apos;s Visitors</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {visitors.filter((v) => !v.check_in_at).length} pending · {visitors.filter((v) => v.check_in_at && !v.check_out_at).length} inside · {visitors.filter((v) => v.check_out_at).length} departed
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="w-40" />
                    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                        <SheetTrigger asChild><Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Register</Button></SheetTrigger>
                        <SheetContent>
                            <SheetHeader><SheetTitle>{editing ? "Edit Visitor" : "Walk-in Registration"}</SheetTitle></SheetHeader>
                            <div className="space-y-4 py-6">
                                <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                                <div><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
                                <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
                                <div><Label>Visit Purpose</Label><Input value={form.visit_purpose} onChange={(e) => setForm((f) => ({ ...f, visit_purpose: e.target.value }))} placeholder="Darshan, Meeting..." /></div>
                                <div><Label>Nationality</Label><Input value={form.nationality} onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))} placeholder="Optional" /></div>
                                <div><Label>Vehicle Number</Label><Input value={form.vehicle_number} onChange={(e) => setForm((f) => ({ ...f, vehicle_number: e.target.value }))} placeholder="Optional" /></div>
                                <div><Label>Visiting Department</Label><Input value={form.visiting_department} onChange={(e) => setForm((f) => ({ ...f, visiting_department: e.target.value }))} placeholder="Optional" /></div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="vip" checked={form.is_vip} onChange={(e) => setForm((f) => ({ ...f, is_vip: e.target.checked }))} />
                                    <Label htmlFor="vip">VIP</Label>
                                </div>
                                {form.is_vip && <div><Label>Special arrangements</Label><Textarea value={form.special_arrangements_note} onChange={(e) => setForm((f) => ({ ...f, special_arrangements_note: e.target.value }))} rows={2} /></div>}
                                <Button onClick={save} className="w-full">{editing ? "Update" : "Register & Get Pass"}</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6"><DataTable columns={columns} data={visitors} /></CardContent>
            </Card>
            <Dialog open={!!passDialog} onOpenChange={() => setPassDialog(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Visitor Pass</DialogTitle></DialogHeader>
                    {passDialog && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <QRCodeSVG value={passDialog.visitor_pass_code || passDialog.id} size={180} level="M" />
                            <p className="font-mono text-xl font-semibold">{passDialog.visitor_pass_code}</p>
                            <p className="text-sm text-muted-foreground">{passDialog.name}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={!!feedbackVisitor} onOpenChange={() => { setFeedbackVisitor(null); setFeedbackText("") }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Visitor Feedback</DialogTitle></DialogHeader>
                    {feedbackVisitor && (
                        <>
                            <p className="text-sm text-muted-foreground">{feedbackVisitor.name}</p>
                            <Textarea placeholder="Feedback (optional)" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={4} />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setFeedbackVisitor(null); setFeedbackText("") }}>Skip</Button>
                                <Button onClick={submitFeedback}>Save</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
