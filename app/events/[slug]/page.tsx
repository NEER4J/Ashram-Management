"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { eventRegistrationSchema, EventRegistrationFormValues } from "../schema"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INDIAN_STATES, CITIES_BY_STATE, OCCUPATIONS } from "@/lib/data/indian-states-cities"
import { Button } from "@/components/ui/button"
import { Loader2, MessageCircle, Facebook, Twitter, Link as LinkIcon, Download, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
    const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState<"english" | "hindi">("english")
    const qrCodeRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // WhatsApp message options
    const whatsappMessages = {
        english: "Jai Gurudev, seeking your divine blessings",
        hindi: "जय गुरुदेव, आपके दिव्य आशीर्वाद की कामना करता हूं"
    }

    // Debug: Log when dialog state changes
    useEffect(() => {
        console.log("WhatsApp Dialog state changed:", showWhatsAppDialog)
    }, [showWhatsAppDialog])

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
        const message = encodeURIComponent(whatsappMessages[selectedMessage])
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
        window.open(whatsappUrl, "_blank")
    }

    const openWhatsAppWithMessage = () => {
        const phoneNumber = "917470915225"
        const message = encodeURIComponent(whatsappMessages[selectedMessage])
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
            
            // Show WhatsApp dialog after a short delay
            setTimeout(() => {
                console.log("Setting showWhatsAppDialog to true")
                setShowWhatsAppDialog(true)
            }, 500)
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
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
            {/* Hero Section */}
            <section className="relative py-12 md:py-18 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ backgroundColor: "#3c0212" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3c0212] via-[#4a0318] to-[#3c0212] opacity-100"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #fef9fb 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center mb-12 opacity-0 animate-fade-in">
                        {event.type && (
                            <div className="inline-block px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-6 shadow-lg"
                                style={{ backgroundColor: "#fef9fb", color: "#3c0212" }}>
                                {event.type}
                            </div>
                        )}
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 md:mb-8 leading-tight tracking-tight" style={{ color: "#fef9fb" }}>
                            {event.name}
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-10 md:mb-12 max-w-4xl mx-auto leading-relaxed font-light" style={{ color: "#fef9fb", opacity: 0.95 }}>
                            {event.description || "Join us for a divine spiritual experience"}
                        </p>

                        {/* Banner Image - Responsive */}
                        <div className="mb-10 md:mb-12 flex justify-center">
                            <div className="relative w-full max-w-4xl mx-auto">
                                {/* Mobile Image */}
                                <Image
                                    src="/img-2.jpeg"
                                    alt="Spiritual journey banner"
                                    width={800}
                                    height={1200}
                                    className="w-full h-auto rounded-lg shadow-2xl md:hidden"
                                    priority
                                />
                                {/* Desktop Image */}
                                <Image
                                    src="/img-1.jpeg"
                                    alt="Spiritual journey banner"
                                    width={1200}
                                    height={400}
                                    className="hidden md:block w-full h-auto rounded-lg shadow-2xl"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Share Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4" >
                            <Button
                                onClick={() => handleShare("whatsapp")}
                                variant="outline"
                                size="lg"
                                className="font-semibold w-[160px] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                style={{
                                    backgroundColor: "transparent",
                                    color: "#fef9fb",
                                    borderColor: "#fef9fb"
                                }}
                            >
                                <MessageCircle className="mr-2 h-5 w-5" />
                                WhatsApp
                            </Button>
                            <Button
                                onClick={() => handleShare("facebook")}
                                variant="outline"
                                size="lg"
                                className="font-semibold w-[160px] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                style={{
                                    backgroundColor: "transparent",
                                    color: "#fef9fb",
                                    borderColor: "#fef9fb"
                                }}
                            >
                                <Facebook className="mr-2 h-5 w-5" />
                                Facebook
                            </Button>
                            <Button
                                onClick={() => handleShare("twitter")}
                                variant="outline"
                                size="lg"
                                className="font-semibold w-[160px] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                style={{
                                    backgroundColor: "transparent",
                                    color: "#fef9fb",
                                    borderColor: "#fef9fb"
                                }}
                            >
                                <Twitter className="mr-2 h-5 w-5" />
                                Twitter
                            </Button>
                            <Button
                                onClick={() => handleShare("copy")}
                                variant="outline"
                                size="lg"
                                className="font-semibold w-[160px] rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
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

            {/* About Event Section */}
            {event.description && (
                <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-5xl">
                        <div className="opacity-0 animate-fade-in-delay" style={{ animationDelay: '200ms' }}>
                            <div className="text-center mb-10 md:mb-12">
                                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: "#3c0212" }}>
                                    About the Event
                                </h2>
                                <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: "#3c0212" }}></div>
                            </div>
                            <Card className="p-8 md:p-12 rounded-2xl shadow-xl border-2" style={{ backgroundColor: "#fef9fb", borderColor: "#e5e5e5" }}>
                                <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
                                    {event.description}
                                </p>
                            </Card>
                        </div>
                    </div>
                </section>
            )}

            {/* Registration Form Section - Prominent CTA */}
            <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fef9fb" }}>
                <div className="container mx-auto max-w-4xl">
                    <div className="opacity-0 animate-fade-in-delay" style={{ animationDelay: '400ms' }}>
                        <div className="text-center mb-10 md:mb-12">
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight" style={{ color: "#3c0212" }}>
                                Register Now
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                                Fill in your details to register and secure your spot at this divine event
                            </p>
                            <div className="w-24 h-1 mx-auto mt-6" style={{ backgroundColor: "#3c0212" }}></div>
                        </div>

                        <Card className="p-8 md:p-12 lg:p-16 rounded-2xl shadow-2xl border-2" style={{ backgroundColor: "#fef9fb", borderColor: "#e5e5e5" }}>

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

                                <div className="pt-6">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 md:h-16 text-lg md:text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
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
                </div>
            </section>

            {/* Event Details Section */}
            <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fbf9ef" }}>
                <div className="container mx-auto max-w-4xl">
                    <div className="opacity-0 animate-fade-in-delay" style={{ animationDelay: '500ms' }}>
                        <div className="text-center mb-8">
                            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ color: "#3c0212" }}>
                                Event Details
                            </h2>
                            <div className="w-20 h-1 mx-auto" style={{ backgroundColor: "#3c0212" }}></div>
                        </div>

                        <Card className="p-6 md:p-8 rounded-2xl shadow-xl border-2" style={{ backgroundColor: "#fef9fb", borderColor: "#e5e5e5" }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date & Time */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3c0212" }}>
                                        <svg className="w-6 h-6" style={{ color: "#fef9fb" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1" style={{ color: "#3c0212" }}>Date & Time</h3>
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-medium">Start:</span> {formatDate(event.start_date)}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-medium">End:</span> {formatDate(event.end_date)}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                {(event.city || event.state) && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3c0212" }}>
                                            <svg className="w-6 h-6" style={{ color: "#fef9fb" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1" style={{ color: "#3c0212" }}>Location</h3>
                                            <p className="text-gray-700 text-base">
                                                {[event.city, event.state].filter(Boolean).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Event Type */}
                                {event.type && (
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3c0212" }}>
                                            <svg className="w-6 h-6" style={{ color: "#fef9fb" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1" style={{ color: "#3c0212" }}>Event Type</h3>
                                            <p className="text-gray-700 text-base">{event.type}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3c0212" }}>
                                        <svg className="w-6 h-6" style={{ color: "#fef9fb" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1" style={{ color: "#3c0212" }}>Contact</h3>
                                        <p className="text-gray-700 text-base">+91 7470915225</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* QR Code Section */}
            <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-4xl">
                    <div className="opacity-0 animate-fade-in-delay" style={{ animationDelay: '600ms' }}>
                        <div className="text-center mb-10 md:mb-12">
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: "#3c0212" }}>
                                Share This Event
                            </h2>
                            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                                Scan the QR code to share this event or download it to print
                            </p>
                            <div className="w-24 h-1 mx-auto mt-6" style={{ backgroundColor: "#3c0212" }}></div>
                        </div>
                        <Card className="p-8 md:p-12 rounded-2xl shadow-xl border-2  mx-auto max-w-lg" style={{ backgroundColor: "#fef9fb", borderColor: "#e5e5e5" }}>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex justify-center p-6 bg-white rounded-2xl shadow-lg" ref={qrCodeRef}>
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
                                            className="font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg px-6 py-6"
                                            style={{ borderColor: "#3c0212", color: "#3c0212" }}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download QR Code
                                        </Button>
                                        <Button
                                            onClick={() => handleShare("copy")}
                                            variant="outline"
                                            className="font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg px-6 py-6"
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
                </div>
            </section>

            <Footer />

            {/* WhatsApp Message Dialog */}
            <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif font-bold text-center" style={{ color: "#3c0212" }}>
                            Registration Successful!
                        </DialogTitle>
                        <DialogDescription className="text-center text-base pt-2">
                            Send a message to Gurudev to get blessings
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-600">Choose your message language:</p>
                            
                            {/* English Message Option */}
                            <div 
                                onClick={() => setSelectedMessage("english")}
                                className={`cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 ${
                                    selectedMessage === "english" 
                                        ? "border-[#3c0212] bg-[#fef9fb]" 
                                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        selectedMessage === "english" ? "border-[#3c0212]" : "border-gray-300"
                                    }`}>
                                        {selectedMessage === "english" && (
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3c0212" }}></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 mb-1">English</p>
                                        <p className="text-sm font-medium text-gray-800 italic">
                                            "{whatsappMessages.english}"
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Hindi Message Option */}
                            <div 
                                onClick={() => setSelectedMessage("hindi")}
                                className={`cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 ${
                                    selectedMessage === "hindi" 
                                        ? "border-[#3c0212] bg-[#fef9fb]" 
                                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        selectedMessage === "hindi" ? "border-[#3c0212]" : "border-gray-300"
                                    }`}>
                                        {selectedMessage === "hindi" && (
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3c0212" }}></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-gray-500 mb-1">हिंदी (Hindi)</p>
                                        <p className="text-sm font-medium text-gray-800 italic">
                                            "{whatsappMessages.hindi}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                openWhatsAppWithMessage()
                                setShowWhatsAppDialog(false)
                            }}
                            className="w-full h-12 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                backgroundColor: "#25D366",
                                color: "white",
                            }}
                        >
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Send WhatsApp Message
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowWhatsAppDialog(false)}
                            className="w-full"
                        >
                            Maybe Later
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

