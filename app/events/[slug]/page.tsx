"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { eventRegistrationSchema, EventRegistrationFormValues } from "../schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INDIAN_STATES, CITIES_BY_STATE, OCCUPATIONS } from "@/lib/data/indian-states-cities"
import { Button } from "@/components/ui/button"
import { Loader2, MessageCircle, Facebook, Twitter, Link as LinkIcon, Calendar, MapPin, Users, QrCode, Download, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QRCodeSVG } from "qrcode.react"

type EventDetails = {
    id: string
    name: string
    slug: string
    type: string | null
    start_date: string
    end_date: string
    city: string | null
    state: string | null
    description: string | null
}

export default function EventDetailPage() {
    const params = useParams()
    const slug = params?.slug as string
    const [loading, setLoading] = useState(false)
    const [event, setEvent] = useState<EventDetails | null>(null)
    const [loadingEvent, setLoadingEvent] = useState(true)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const qrCodeRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Calculate event URL dynamically
    const getEventUrl = () => {
        if (!event?.slug) return ""
        if (typeof window !== "undefined") {
            return `${window.location.origin}/events/${event.slug}`
        }
        return `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/events/${event.slug}`
    }
    const eventUrl = getEventUrl()

    const form = useForm<EventRegistrationFormValues>({
        resolver: zodResolver(eventRegistrationSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            dob: "",
            occupation: "",
            city: "",
            state: "",
        }
    })

    useEffect(() => {
        if (slug) {
            fetchEvent()
        }
    }, [slug])

    useEffect(() => {
        if (slug) {
            initializeTracking()
        }
    }, [slug])

    const fetchEvent = async () => {
        try {
            const { data, error } = await supabase
                .from("temple_events")
                .select("id, name, slug, type, start_date, end_date, city, state, description")
                .eq("slug", slug)
                .eq("is_published", true)
                .single()

            if (error || !data) {
                setEvent(null)
                return
            }
            setEvent(data as EventDetails)
        } catch (error) {
            console.error("Error fetching event:", error)
            setEvent(null)
        } finally {
            setLoadingEvent(false)
        }
    }

    const initializeTracking = async () => {
        // Get or create session ID
        let sid = localStorage.getItem(`event_session_${slug}`)
        if (!sid) {
            sid = crypto.randomUUID()
            localStorage.setItem(`event_session_${slug}`, sid)
        }
        setSessionId(sid)

        // Detect mobile device
        const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
        setIsMobile(mobile)

        // Track QR scan (after event is loaded)
        // We'll do this in fetchEvent after event is loaded
    }

    useEffect(() => {
        if (event?.id && sessionId) {
            trackQRScan()
        }
    }, [event?.id, sessionId])

    const trackQRScan = async () => {
        if (!event?.id || !sessionId) return

        try {
            await fetch(`/api/events/${event.id}/track-scan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    user_agent: navigator.userAgent,
                }),
            })
        } catch (error) {
            console.error("Failed to track QR scan:", error)
        }
    }

    const handleWhatsAppClick = () => {
        const phoneNumber = "917470915225"
        const message = encodeURIComponent("send a message gurudev to get blessings")
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
        window.open(whatsappUrl, "_blank")
    }

    const handleShare = (platform: string) => {
        if (!event) return
        const url = window.location.href
        const title = `Join ${event.name} - Register Now!`
        const text = `Join us for ${event.name}. Register now!`

        switch (platform) {
            case "facebook":
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
                break
            case "twitter":
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank")
                break
            case "whatsapp":
                window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank")
                break
            case "copy":
                navigator.clipboard.writeText(url)
                toast.success("Link copied to clipboard!")
                break
        }
    }

    async function onSubmit(data: EventRegistrationFormValues) {
        if (!event) return

        setLoading(true)
        try {
            const response = await fetch(`/api/events/${event.id}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    session_id: sessionId,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit registration")
            }

            toast.success("Registration successful! Thank you for registering.")
            form.reset()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred while submitting")
        } finally {
            setLoading(false)
        }
    }

    if (loadingEvent) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fbf9ef" }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c0212] mx-auto mb-4"></div>
                    <p style={{ color: "#3c0212" }}>Loading event...</p>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fbf9ef" }}>
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4" style={{ color: "#3c0212" }}>404</h1>
                    <p className="text-xl text-gray-600">Event not found</p>
                </div>
            </div>
        )
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
        })
    }

    const downloadQRCode = () => {
        if (!qrCodeRef.current || !eventUrl) {
            toast.error("QR code not available")
            return
        }

        const svg = qrCodeRef.current.querySelector("svg")
        if (!svg) {
            toast.error("QR code not found")
            return
        }

        try {
            // Download as SVG
            const svgData = new XMLSerializer().serializeToString(svg)
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
            const url = URL.createObjectURL(svgBlob)
            const downloadLink = document.createElement("a")
            downloadLink.href = url
            downloadLink.download = `${event?.slug || 'event'}-qr-code.svg`
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
            URL.revokeObjectURL(url)
            toast.success("QR code downloaded successfully")
        } catch (error) {
            console.error("Error downloading QR code:", error)
            toast.error("Failed to download QR code")
        }
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#fbf9ef" }}>
            <Header />
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#3c0212" }}>
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: "#fef9fb" }}>
                            {event.name}
                        </h1>
                        {event.type && (
                            <div className="inline-block px-4 py-2 rounded-full text-lg font-semibold mb-4" 
                                 style={{ backgroundColor: "#fef9fb", color: "#3c0212" }}>
                                {event.type}
                            </div>
                        )}
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: "#fef9fb", opacity: 0.9 }}>
                            {event.description || "Join us for a divine spiritual experience"}
                        </p>
                        
                        {/* Share Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                            <Button
                                onClick={() => handleShare("whatsapp")}
                                variant="outline"
                                size="lg"
                                className="font-semibold"
                                style={{ 
                                    backgroundColor: "#25D366", 
                                    color: "white",
                                    borderColor: "#25D366"
                                }}
                            >
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Share on WhatsApp
                            </Button>
                            <Button
                                onClick={() => handleShare("facebook")}
                                variant="outline"
                                size="lg"
                                className="font-semibold"
                                style={{ 
                                    backgroundColor: "#1877F2", 
                                    color: "white",
                                    borderColor: "#1877F2"
                                }}
                            >
                                <Facebook className="mr-2 h-5 w-5" />
                                Share on Facebook
                            </Button>
                            <Button
                                onClick={() => handleShare("twitter")}
                                variant="outline"
                                size="lg"
                                className="font-semibold"
                                style={{ 
                                    backgroundColor: "#1DA1F2", 
                                    color: "white",
                                    borderColor: "#1DA1F2"
                                }}
                            >
                                <Twitter className="mr-2 h-5 w-5" />
                                Share on Twitter
                            </Button>
                            <Button
                                onClick={() => handleShare("copy")}
                                variant="outline"
                                size="lg"
                                className="font-semibold"
                                style={{ 
                                    backgroundColor: "transparent", 
                                    color: "#fef9fb",
                                    borderColor: "#fef9fb"
                                }}
                            >
                                <LinkIcon className="mr-2 h-5 w-5" />
                                Copy Link
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Details Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <Card className="text-center p-6" style={{ backgroundColor: "#fef9fb" }}>
                            <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: "#3c0212" }} />
                            <h3 className="font-serif text-xl font-bold mb-2" style={{ color: "#3c0212" }}>Date</h3>
                            <p className="text-gray-600">
                                {formatDate(event.start_date)}
                                {event.start_date !== event.end_date && ` to ${formatDate(event.end_date)}`}
                            </p>
                        </Card>
                        {(event.city || event.state) && (
                            <Card className="text-center p-6" style={{ backgroundColor: "#fef9fb" }}>
                                <MapPin className="h-12 w-12 mx-auto mb-4" style={{ color: "#3c0212" }} />
                                <h3 className="font-serif text-xl font-bold mb-2" style={{ color: "#3c0212" }}>Location</h3>
                                <p className="text-gray-600">{[event.city, event.state].filter(Boolean).join(", ")}</p>
                            </Card>
                        )}
                        <Card className="text-center p-6" style={{ backgroundColor: "#fef9fb" }}>
                            <Users className="h-12 w-12 mx-auto mb-4" style={{ color: "#3c0212" }} />
                            <h3 className="font-serif text-xl font-bold mb-2" style={{ color: "#3c0212" }}>Join Us</h3>
                            <p className="text-gray-600">Register below to participate</p>
                        </Card>
                    </div>

                    {event.description && (
                        <Card className="p-8 mb-12" style={{ backgroundColor: "#fef9fb" }}>
                            <h2 className="font-serif text-3xl font-bold mb-4 text-center" style={{ color: "#3c0212" }}>
                                About the Event
                            </h2>
                            <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
                                {event.description}
                            </p>
                        </Card>
                    )}

                    {/* QR Code Section */}
                    <Card className="p-8" style={{ backgroundColor: "#fef9fb" }}>
                        <div className="text-center mb-6">
                            <h2 className="font-serif text-3xl font-bold mb-2" style={{ color: "#3c0212" }}>
                                Share This Event
                            </h2>
                            <p className="text-gray-600">
                                Scan the QR code to share this event or download it to print
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex justify-center p-6 bg-white rounded-lg shadow-sm" ref={qrCodeRef}>
                                    {eventUrl && (
                                        <QRCodeSVG
                                            value={eventUrl}
                                            size={256}
                                            level="H"
                                            includeMargin={true}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={downloadQRCode}
                                        variant="outline"
                                        className="font-semibold"
                                        style={{ borderColor: "#3c0212", color: "#3c0212" }}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download QR Code
                                    </Button>
                                    <Button
                                        onClick={() => handleShare("copy")}
                                        variant="outline"
                                        className="font-semibold"
                                        style={{ borderColor: "#3c0212", color: "#3c0212" }}
                                    >
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Copy Event Link
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Registration Form Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fbf9ef" }}>
                <div className="container mx-auto max-w-2xl">
                    <Card className="p-8 md:p-12" style={{ backgroundColor: "#fef9fb", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
                        <div className="text-center mb-8">
                            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" style={{ color: "#3c0212" }}>
                                Register for the Event
                            </h2>
                            <p className="text-lg text-gray-600">
                                Fill in your details to register and secure your spot
                            </p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold" style={{ color: "#3c0212" }}>Full Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter your full name" className="h-12 text-base" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold" style={{ color: "#3c0212" }}>Phone Number *</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="tel" placeholder="Enter your phone number" className="h-12 text-base" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold" style={{ color: "#3c0212" }}>Email (Optional)</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="email" placeholder="Enter your email" className="h-12 text-base" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dob"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold" style={{ color: "#3c0212" }}>Date of Birth *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="date" max={new Date().toISOString().split('T')[0]} className="h-12 text-base" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="occupation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold" style={{ color: "#3c0212" }}>Occupation *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Select your occupation" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {OCCUPATIONS.map((occ) => (
                                                            <SelectItem key={occ} value={occ}>
                                                                {occ}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold" style={{ color: "#3c0212" }}>State *</FormLabel>
                                                <Select onValueChange={(value) => {
                                                    field.onChange(value)
                                                    form.setValue("city", "") // Reset city when state changes
                                                }} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Select State" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {INDIAN_STATES.map((state) => (
                                                            <SelectItem key={state.code} value={state.name}>
                                                                {state.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold" style={{ color: "#3c0212" }}>City *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch("state")}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder={form.watch("state") ? "Select City" : "Select State first"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {form.watch("state") && CITIES_BY_STATE[form.watch("state")]?.map((city) => (
                                                            <SelectItem key={city} value={city}>
                                                                {city}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {isMobile && (
                                    <div className="pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleWhatsAppClick}
                                            className="w-full h-12 text-base font-semibold"
                                            style={{ borderColor: "#25D366", color: "#25D366" }}
                                        >
                                            <MessageCircle className="mr-2 h-5 w-5" />
                                            Send WhatsApp Message to Gurudev
                                        </Button>
                                    </div>
                                )}

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 text-lg font-bold"
                                        style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Register Now"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </Card>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#3c0212" }}>
                <div className="container mx-auto max-w-6xl text-center">
                    <p className="text-lg" style={{ color: "#fef9fb", opacity: 0.9 }}>
                        For any queries, contact us at <strong>+91 7470915225</strong>
                    </p>
                    <p className="mt-4 text-sm" style={{ color: "#fef9fb", opacity: 0.7 }}>
                        © {new Date().getFullYear()} {event.name}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

