"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DevoteeForm } from "../devotee-form"
import { ArrowLeft, FileText, Gift, MessageSquare, User, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

type Devotee = {
    id: string
    first_name: string
    last_name: string | null
    email: string | null
    mobile_number: string
    devotee_code: string | null
    emergency_contact_name?: string | null
    emergency_contact_phone?: string | null
    medical_notes?: string | null
    dietary_preferences?: string | null
    photo_url?: string | null
    relationship_status?: string | null
    first_visit_date?: string | null
    last_visit_date?: string | null
    spiritual_notes?: string | null
    membership_type?: string
    membership_status?: string
    [k: string]: unknown
}

type DevoteeTag = { id: string; tag_name: string }
type KycDoc = { id: string; document_type: string; file_path: string; verified_at: string | null; created_at: string }
type Milestone = { id: string; milestone_type: string; date: string; notes: string | null }
type Communication = { id: string; channel: string; direction: string; summary: string | null; created_at: string }
type Note = { id: string; note: string; follow_up_date: string | null; created_at: string }

const KYC_TYPES = ["Aadhaar", "PAN", "Passport"]
const MILESTONE_TYPES = ["birthday", "anniversary", "spiritual_milestone"]
const CHANNELS = ["call", "email", "whatsapp", "sms"]

export default function DevoteeDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const supabase = createClient()
    const [devotee, setDevotee] = useState<Devotee | null>(null)
    const [tags, setTags] = useState<DevoteeTag[]>([])
    const [kycDocs, setKycDocs] = useState<KycDoc[]>([])
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [communications, setCommunications] = useState<Communication[]>([])
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [noteOpen, setNoteOpen] = useState(false)
    const [commOpen, setCommOpen] = useState(false)
    const [milestoneOpen, setMilestoneOpen] = useState(false)
    const [newNote, setNewNote] = useState("")
    const [newFollowUp, setNewFollowUp] = useState("")
    const [newCommChannel, setNewCommChannel] = useState("call")
    const [newCommDirection, setNewCommDirection] = useState("outbound")
    const [newCommSummary, setNewCommSummary] = useState("")
    const [newMilestoneType, setNewMilestoneType] = useState("birthday")
    const [newMilestoneDate, setNewMilestoneDate] = useState("")
    const [newMilestoneNotes, setNewMilestoneNotes] = useState("")
    const [newTag, setNewTag] = useState("")
    const [kycUploadType, setKycUploadType] = useState("Aadhaar")
    const [kycFile, setKycFile] = useState<File | null>(null)
    const [kycSignedUrls, setKycSignedUrls] = useState<Record<string, string>>({})

    const fetchDevotee = async () => {
        const { data } = await supabase.from("devotees").select("*").eq("id", id).single()
        setDevotee(data as Devotee)
    }

    const fetchTags = async () => {
        const { data } = await supabase.from("devotee_tags").select("id, tag_name").eq("devotee_id", id)
        setTags((data as DevoteeTag[]) || [])
    }

    const fetchKyc = async () => {
        const { data } = await supabase.from("devotee_kyc_documents").select("id, document_type, file_path, verified_at, created_at").eq("devotee_id", id)
        const docs = (data as KycDoc[]) || []
        setKycDocs(docs)
        const urls: Record<string, string> = {}
        for (const doc of docs) {
            const { data: urlData } = await supabase.storage.from("devotee-documents").createSignedUrl(doc.file_path, 3600)
            if (urlData?.signedUrl) urls[doc.id] = urlData.signedUrl
        }
        setKycSignedUrls(urls)
    }

    const fetchMilestones = async () => {
        const { data } = await supabase.from("devotee_milestones").select("id, milestone_type, date, notes").eq("devotee_id", id).order("date", { ascending: false })
        setMilestones((data as Milestone[]) || [])
    }

    const fetchCommunications = async () => {
        const { data } = await supabase.from("devotee_communications").select("id, channel, direction, summary, created_at").eq("devotee_id", id).order("created_at", { ascending: false })
        setCommunications((data as Communication[]) || [])
    }

    const fetchNotes = async () => {
        const { data } = await supabase.from("devotee_notes").select("id, note, follow_up_date, created_at").eq("devotee_id", id).order("created_at", { ascending: false })
        setNotes((data as Note[]) || [])
    }

    useEffect(() => {
        if (!id) return
        setLoading(true)
        Promise.all([fetchDevotee(), fetchTags(), fetchKyc(), fetchMilestones(), fetchCommunications(), fetchNotes()]).finally(() => setLoading(false))
    }, [id])

    const addTag = async () => {
        if (!newTag.trim()) return
        const { error } = await supabase.from("devotee_tags").insert({ devotee_id: id, tag_name: newTag.trim() })
        if (error) {
            toast.error(error.message)
            return
        }
        setNewTag("")
        fetchTags()
        toast.success("Tag added")
    }

    const removeTag = async (tagId: string) => {
        await supabase.from("devotee_tags").delete().eq("id", tagId)
        fetchTags()
        toast.success("Tag removed")
    }

    const addNote = async () => {
        if (!newNote.trim()) return
        const { error } = await supabase.from("devotee_notes").insert({
            devotee_id: id,
            note: newNote.trim(),
            follow_up_date: newFollowUp || null,
        })
        if (error) {
            toast.error(error.message)
            return
        }
        setNewNote("")
        setNewFollowUp("")
        setNoteOpen(false)
        fetchNotes()
        toast.success("Note added")
    }

    const addCommunication = async () => {
        const { error } = await supabase.from("devotee_communications").insert({
            devotee_id: id,
            channel: newCommChannel,
            direction: newCommDirection,
            summary: newCommSummary || null,
        })
        if (error) {
            toast.error(error.message)
            return
        }
        setNewCommSummary("")
        setCommOpen(false)
        fetchCommunications()
        toast.success("Communication logged")
    }

    const addMilestone = async () => {
        if (!newMilestoneDate) return
        const { error } = await supabase.from("devotee_milestones").insert({
            devotee_id: id,
            milestone_type: newMilestoneType,
            date: newMilestoneDate,
            notes: newMilestoneNotes || null,
        })
        if (error) {
            toast.error(error.message)
            return
        }
        setNewMilestoneDate("")
        setNewMilestoneNotes("")
        setMilestoneOpen(false)
        fetchMilestones()
        toast.success("Milestone added")
    }

    const uploadKyc = async () => {
        if (!kycFile) {
            toast.error("Select a file")
            return
        }
        const ext = kycFile.name.split(".").pop() || "pdf"
        const path = `${id}/${kycUploadType.toLowerCase()}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from("devotee-documents").upload(path, kycFile, { upsert: true })
        if (uploadError) {
            toast.error(uploadError.message)
            return
        }
        const { data: urlData } = supabase.storage.from("devotee-documents").getPublicUrl(path)
        const filePath = path
        const { error: insertError } = await supabase.from("devotee_kyc_documents").insert({
            devotee_id: id,
            document_type: kycUploadType,
            file_path: filePath,
        })
        if (insertError) {
            toast.error(insertError.message)
            return
        }
        setKycFile(null)
        fetchKyc()
        toast.success("Document uploaded")
    }


    if (loading || !devotee) {
        return (
            <div className="p-8">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <div className="h-full flex-1 flex-col space-y-6 p-8 md:flex">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/devotees">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h2 className="text-3xl font-medium tracking-tight">
                        {devotee.first_name} {devotee.last_name || ""}
                    </h2>
                    <p className="text-muted-foreground">
                        {devotee.devotee_code || "-"} · {devotee.mobile_number}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="kyc">
                        <FileText className="mr-2 h-4 w-4" />
                        KYC
                    </TabsTrigger>
                    <TabsTrigger value="milestones">
                        <Gift className="mr-2 h-4 w-4" />
                        Milestones
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Activity
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DevoteeForm
                                initialData={{ ...devotee, id: devotee.id }}
                                onSuccess={() => { fetchDevotee(); router.refresh(); }}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {tags.map((t) => (
                                <span
                                    key={t.id}
                                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-sm"
                                >
                                    {t.tag_name}
                                    <button type="button" onClick={() => removeTag(t.id)} className="text-red-600 hover:underline">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="New tag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                                    className="w-32"
                                />
                                <Button size="sm" onClick={addTag}>Add</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="kyc" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>KYC Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-2">
                                {kycDocs.map((doc) => (
                                    <li key={doc.id} className="flex items-center justify-between rounded border p-2">
                                        <span className="font-medium">{doc.document_type}</span>
                                        <span className="text-muted-foreground text-sm">
                                            {doc.verified_at ? "Verified" : "Pending"}
                                        </span>
                                        <a
                                            href={kycSignedUrls[doc.id] || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-wrap gap-2 items-end">
                                <Select value={kycUploadType} onValueChange={setKycUploadType}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {KYC_TYPES.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setKycFile(e.target.files?.[0] || null)}
                                />
                                <Button onClick={uploadKyc} disabled={!kycFile}>Upload</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Milestones</CardTitle>
                                <Sheet open={milestoneOpen} onOpenChange={setMilestoneOpen}>
                                    <SheetTrigger asChild>
                                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add</Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>Add Milestone</SheetTitle>
                                        </SheetHeader>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label>Type</Label>
                                                <Select value={newMilestoneType} onValueChange={setNewMilestoneType}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {MILESTONE_TYPES.map((t) => (
                                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Date</Label>
                                                <Input type="date" value={newMilestoneDate} onChange={(e) => setNewMilestoneDate(e.target.value)} />
                                            </div>
                                            <div>
                                                <Label>Notes</Label>
                                                <Textarea value={newMilestoneNotes} onChange={(e) => setNewMilestoneNotes(e.target.value)} rows={2} />
                                            </div>
                                            <Button onClick={addMilestone}>Save</Button>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {milestones.map((m) => (
                                    <li key={m.id} className="flex justify-between rounded border p-2">
                                        <span className="capitalize">{m.milestone_type}</span>
                                        <span>{m.date}</span>
                                        {m.notes && <span className="text-muted-foreground text-sm">{m.notes}</span>}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Notes & Follow-ups</CardTitle>
                                <Sheet open={noteOpen} onOpenChange={setNoteOpen}>
                                    <SheetTrigger asChild>
                                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Add Note</Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>Add Note</SheetTitle>
                                        </SheetHeader>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label>Note</Label>
                                                <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={4} />
                                            </div>
                                            <div>
                                                <Label>Follow-up Date</Label>
                                                <Input type="date" value={newFollowUp} onChange={(e) => setNewFollowUp(e.target.value)} />
                                            </div>
                                            <Button onClick={addNote}>Save</Button>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {notes.map((n) => (
                                    <li key={n.id} className="rounded border p-2">
                                        <p>{n.note}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {new Date(n.created_at).toLocaleString()}
                                            {n.follow_up_date && ` · Follow-up: ${n.follow_up_date}`}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Communications</CardTitle>
                                <Sheet open={commOpen} onOpenChange={setCommOpen}>
                                    <SheetTrigger asChild>
                                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Log</Button>
                                    </SheetTrigger>
                                    <SheetContent>
                                        <SheetHeader>
                                            <SheetTitle>Log Communication</SheetTitle>
                                        </SheetHeader>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label>Channel</Label>
                                                <Select value={newCommChannel} onValueChange={setNewCommChannel}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {CHANNELS.map((c) => (
                                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Direction</Label>
                                                <Select value={newCommDirection} onValueChange={setNewCommDirection}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="inbound">Inbound</SelectItem>
                                                        <SelectItem value="outbound">Outbound</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Summary</Label>
                                                <Textarea value={newCommSummary} onChange={(e) => setNewCommSummary(e.target.value)} rows={3} />
                                            </div>
                                            <Button onClick={addCommunication}>Save</Button>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {communications.map((c) => (
                                    <li key={c.id} className="flex justify-between rounded border p-2">
                                        <span className="capitalize">{c.channel} · {c.direction}</span>
                                        <span className="text-muted-foreground text-sm">{new Date(c.created_at).toLocaleString()}</span>
                                        {c.summary && <p className="w-full text-sm mt-1">{c.summary}</p>}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
