"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type Accommodation = { id: string; name: string; code: string }

export default function BookStayPage() {
    const supabase = createClient()
    const [accommodations, setAccommodations] = useState<Accommodation[]>([])
    const [loading, setLoading] = useState(false)
    const [waitlist, setWaitlist] = useState(false)
    const [form, setForm] = useState({
        guest_name: "",
        guest_phone: "",
        guest_email: "",
        check_in_date: "",
        check_out_date: "",
        room_type_preference: "double",
        number_of_guests: 1,
        special_requests: "",
        accommodation_id: "",
    })
    const [done, setDone] = useState<{ booking_code?: string } | null>(null)

    useEffect(() => {
        supabase.from("accommodations").select("id, name, code").eq("is_active", true).order("code").then(({ data }) => setAccommodations((data as Accommodation[]) || []))
    }, [])

    const submit = async () => {
        if (!form.guest_name.trim() || !form.guest_phone.trim() || !form.check_in_date || !form.check_out_date) {
            toast.error("Please fill name, phone, and dates")
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/accommodation/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    accommodation_id: form.accommodation_id || undefined,
                    add_to_waitlist: waitlist,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                toast.error(data.error || "Request failed")
                return
            }
            setDone({ booking_code: data.booking_code })
            toast.success(data.message)
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Request received</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-muted-foreground">
                            We will confirm your stay shortly. {done.booking_code && `Your reference: ${done.booking_code}`}
                        </p>
                        <Button variant="outline" onClick={() => { setDone(null); setForm({ guest_name: "", guest_phone: "", guest_email: "", check_in_date: "", check_out_date: "", room_type_preference: "double", number_of_guests: 1, special_requests: "", accommodation_id: "" }) }}>
                            Book another stay
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Book your stay</CardTitle>
                    <p className="text-sm text-muted-foreground">Submit your accommodation request.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Name *</Label>
                        <Input value={form.guest_name} onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))} placeholder="Full name" />
                    </div>
                    <div>
                        <Label>Phone *</Label>
                        <Input value={form.guest_phone} onChange={(e) => setForm((f) => ({ ...f, guest_phone: e.target.value }))} placeholder="10-digit mobile" />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input type="email" value={form.guest_email} onChange={(e) => setForm((f) => ({ ...f, guest_email: e.target.value }))} placeholder="Optional" />
                    </div>
                    <div>
                        <Label>Property (optional)</Label>
                        <Select value={form.accommodation_id} onValueChange={(v) => setForm((f) => ({ ...f, accommodation_id: v }))}>
                            <SelectTrigger><SelectValue placeholder="Any property" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Any property</SelectItem>
                                {accommodations.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Check-in *</Label>
                        <Input type="date" value={form.check_in_date} onChange={(e) => setForm((f) => ({ ...f, check_in_date: e.target.value }))} />
                    </div>
                    <div>
                        <Label>Check-out *</Label>
                        <Input type="date" value={form.check_out_date} onChange={(e) => setForm((f) => ({ ...f, check_out_date: e.target.value }))} />
                    </div>
                    <div>
                        <Label>Room type preference</Label>
                        <Select value={form.room_type_preference} onValueChange={(v) => setForm((f) => ({ ...f, room_type_preference: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="double">Double</SelectItem>
                                <SelectItem value="dormitory">Dormitory</SelectItem>
                                <SelectItem value="family_suite">Family suite</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Number of guests</Label>
                        <Input type="number" min={1} value={form.number_of_guests} onChange={(e) => setForm((f) => ({ ...f, number_of_guests: parseInt(e.target.value, 10) || 1 }))} />
                    </div>
                    <div>
                        <Label>Special requests</Label>
                        <Input value={form.special_requests} onChange={(e) => setForm((f) => ({ ...f, special_requests: e.target.value }))} placeholder="Optional" />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="waitlist" checked={waitlist} onChange={(e) => setWaitlist(e.target.checked)} />
                        <Label htmlFor="waitlist">Add to waitlist only (no room assigned yet)</Label>
                    </div>
                    <Button onClick={submit} disabled={loading} className="w-full">
                        {loading ? "Submitting..." : waitlist ? "Join waitlist" : "Submit booking request"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
