"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ShoppingCart, ArrowLeft, User, Link as LinkIcon, CheckCircle2, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { DevoteeLinker } from "@/components/gurukul/devotee-linker"
import { Badge } from "@/components/ui/badge"

function CheckoutPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const materialId = searchParams.get("material")
    const courseId = searchParams.get("course")
    const [items, setItems] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [devotee, setDevotee] = useState<any>(null)
    const [paymentMode, setPaymentMode] = useState("Cash")
    const [transactionRef, setTransactionRef] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showDevoteeLinker, setShowDevoteeLinker] = useState(false)
    const [alreadyOwned, setAlreadyOwned] = useState<{ [key: string]: { type: "material" | "course", accessUrl: string } }>({})
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            // Check authentication
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
            if (!authUser || authError) {
                // Redirect to login with return URL
                const returnUrl = `/gurukul/checkout?${searchParams.toString()}`
                router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`)
                return
            }

            setUser(authUser)

            // Get user profile and linked devotee
            const { data: userProfile } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", authUser.id)
                .single()

            setProfile(userProfile)

            if (userProfile?.devotee_id) {
                const { data: devoteeData } = await supabase
                    .from("devotees")
                    .select("*")
                    .eq("id", userProfile.devotee_id)
                    .single()

                if (devoteeData) {
                    setDevotee(devoteeData)
                }
            }

            // Fetch items and check if user already owns them
            const itemsToLoad: any[] = []
            const ownedItems: { [key: string]: { type: "material" | "course", accessUrl: string } } = {}

            if (materialId) {
                const { data } = await supabase
                    .from("study_materials")
                    .select("*")
                    .eq("id", materialId)
                    .eq("is_published", true)
                    .single()

                if (data) {
                    itemsToLoad.push({
                        ...data,
                        item_type: "Material",
                        quantity: 1,
                    })

                    // Check if user already purchased this material
                    const { data: ordersData } = await supabase
                        .from("study_material_orders")
                        .select(`
                            id,
                            order_items (
                                material_id
                            )
                        `)
                        .eq("user_id", authUser.id)

                    if (ordersData) {
                        const hasPurchased = ordersData.some(order =>
                            order.order_items?.some((item: any) => item.material_id === materialId)
                        )

                        if (hasPurchased) {
                            ownedItems[materialId] = {
                                type: "material",
                                accessUrl: `/dashboard/my-learning/materials/${materialId}`
                            }
                        }
                    }
                }
            }

            if (courseId) {
                const { data } = await supabase
                    .from("study_materials")
                    .select("*")
                    .eq("id", courseId)
                    .eq("type", "Course")
                    .eq("is_published", true)
                    .single()

                if (data) {
                    itemsToLoad.push({
                        ...data,
                        item_type: "Course",
                        quantity: 1,
                    })

                    // Check if user already enrolled in this course
                    const { data: enrollmentData } = await supabase
                        .from("course_enrollments")
                        .select("id")
                        .eq("course_id", courseId)
                        .eq("user_id", authUser.id)
                        .maybeSingle()

                    if (enrollmentData) {
                        ownedItems[courseId] = {
                            type: "course",
                            accessUrl: `/dashboard/my-learning/courses/${courseId}`
                        }
                    }
                }
            }

            setItems(itemsToLoad)
            setAlreadyOwned(ownedItems)
            setLoading(false)
        }

        fetchData()
    }, [materialId, courseId, supabase, router, searchParams])

    // Calculate total amount, excluding items already owned
    const totalAmount = items
        .filter(item => !alreadyOwned[item.id])
        .reduce((sum, item) => {
            return sum + (item.is_free ? 0 : item.price * item.quantity)
        }, 0)

    const handleSubmit = async () => {
        if (!user) {
            toast.error("Please log in to continue")
            return
        }

        // Check if user already owns all items
        if (Object.keys(alreadyOwned).length === items.length) {
            toast.info("You already own all items. Please use the access links above.")
            return
        }

        // Filter out items that are already owned
        const itemsToPurchase = items.filter(item => !alreadyOwned[item.id])
        
        if (itemsToPurchase.length === 0) {
            toast.info("You already own all items. Please use the access links above.")
            return
        }

        // Recalculate total for items that need to be purchased
        const amountToPay = itemsToPurchase.reduce((sum, item) => {
            return sum + (item.is_free ? 0 : item.price * item.quantity)
        }, 0)

        if (amountToPay > 0 && !paymentMode) {
            toast.error("Please select a payment mode")
            return
        }

        setSubmitting(true)
        try {
            // Generate order code
            const year = new Date().getFullYear()
            const prefix = `ORD-${year}-`

            const { data: latestOrder } = await supabase
                .from("study_material_orders")
                .select("order_code")
                .like("order_code", `${prefix}%`)
                .order("order_code", { ascending: false })
                .limit(1)
                .maybeSingle()

            let nextNumber = 1
            if (latestOrder?.order_code) {
                const match = latestOrder.order_code.match(/-(\d+)$/)
                if (match) {
                    nextNumber = parseInt(match[1], 10) + 1
                }
            }

            const orderCode = `${prefix}${nextNumber.toString().padStart(4, "0")}`

            // Create order with user_id (only if there are items to purchase)
            let order = null
            if (itemsToPurchase.length > 0) {
                const { data: orderData, error: orderError } = await supabase
                    .from("study_material_orders")
                    .insert({
                        order_code: orderCode,
                        user_id: user.id,
                        devotee_id: devotee?.id || null,
                        order_date: new Date().toISOString().split('T')[0],
                        total_amount: amountToPay,
                        payment_status: amountToPay === 0 ? "Paid" : "Pending",
                        payment_mode: amountToPay > 0 ? paymentMode : null,
                        transaction_ref: transactionRef || null,
                        delivery_status: "Pending",
                    })
                    .select()
                    .single()

                if (orderError) throw orderError
                order = orderData

                // Create order items
                const orderItems = itemsToPurchase.map(item => ({
                    order_id: order.id,
                    material_id: item.item_type === "Material" ? item.id : null,
                    course_id: item.item_type === "Course" ? item.id : null,
                    quantity: item.quantity,
                    unit_price: item.is_free ? 0 : item.price,
                    total_price: item.is_free ? 0 : item.price * item.quantity,
                }))

                const { error: itemsError } = await supabase
                    .from("order_items")
                    .insert(orderItems)

                if (itemsError) throw itemsError
            }

            // If course, create enrollment with user_id (only if not already enrolled)
            const courseItem = itemsToPurchase.find(item => item.item_type === "Course")
            if (courseItem) {
                // Double-check enrollment doesn't exist
                const { data: existingEnrollment } = await supabase
                    .from("course_enrollments")
                    .select("id")
                    .eq("course_id", courseItem.id)
                    .eq("user_id", user.id)
                    .maybeSingle()

                if (!existingEnrollment) {
                    await supabase
                        .from("course_enrollments")
                        .insert({
                            course_id: courseItem.id,
                            user_id: user.id,
                            devotee_id: devotee?.id || null,
                            progress_percentage: 0,
                        })
                }
            }

            toast.success("Order placed successfully!")
            router.push(`/dashboard/my-learning`)
        } catch (error) {
            console.error("Error creating order:", error)
            toast.error("Failed to place order. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fbf9ef" }}>
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </main>
        )
    }

    if (items.length === 0) {
        return (
            <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fbf9ef" }}>
                <div className="text-center">
                    <p className="text-slate-600 mb-4">No items to checkout</p>
                    <Link href="/gurukul/materials">
                        <Button>Browse Materials</Button>
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fbf9ef" }}>
            <div className="container mx-auto max-w-4xl">
                <Link href="/gurukul/materials">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                    </Button>
                </Link>

                <h1 className="text-3xl font-semibold text-slate-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const isOwned = alreadyOwned[item.id]
                                        return (
                                            <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                                                {item.cover_image_url && (
                                                    <img
                                                        src={item.cover_image_url}
                                                        alt={item.title}
                                                        className="w-20 h-28 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                                            <p className="text-sm text-slate-600">{item.type}</p>
                                                            <p className="text-sm font-medium mt-2">
                                                                {item.is_free ? (
                                                                    <span className="text-green-600">Free</span>
                                                                ) : (
                                                                    <>₹{new Intl.NumberFormat("en-IN").format(item.price)}</>
                                                                )}
                                                            </p>
                                                        </div>
                                                        {isOwned && (
                                                            <Badge className="bg-green-600 flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Already Owned
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {isOwned && (
                                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                            <p className="text-sm text-green-800 mb-2">
                                                                You already {isOwned.type === "course" ? "enrolled in" : "purchased"} this {isOwned.type === "course" ? "course" : "material"}.
                                                            </p>
                                                            <Link href={isOwned.accessUrl}>
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full sm:w-auto"
                                                                    style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                                                >
                                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                                    {isOwned.type === "course" ? "Continue Learning" : "View Material"}
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Email</label>
                                        <Input value={user?.email || ""} disabled />
                                    </div>
                                    {devotee ? (
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium">Linked Devotee</label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowDevoteeLinker(true)}
                                                >
                                                    <LinkIcon className="h-4 w-4 mr-1" />
                                                    Change
                                                </Button>
                                            </div>
                                            <div className="p-3 border rounded-lg bg-slate-50">
                                                <p className="font-medium text-slate-900">
                                                    {devotee.first_name} {devotee.middle_name || ""} {devotee.last_name || ""}
                                                </p>
                                                <p className="text-sm text-slate-600">{devotee.mobile_number}</p>
                                                {devotee.devotee_code && (
                                                    <p className="text-xs text-slate-500 font-mono">{devotee.devotee_code}</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Link Devotee (Optional)</label>
                                            {showDevoteeLinker ? (
                                                <DevoteeLinker
                                                    userId={user?.id}
                                                    onLinked={(devoteeData) => {
                                                        setDevotee(devoteeData)
                                                        setShowDevoteeLinker(false)
                                                        toast.success("Devotee linked successfully")
                                                    }}
                                                />
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowDevoteeLinker(true)}
                                                    className="w-full"
                                                >
                                                    <LinkIcon className="h-4 w-4 mr-2" />
                                                    Link Devotee Account
                                                </Button>
                                            )}
                                            <p className="text-xs text-slate-500 mt-2">
                                                Linking your devotee account helps sync your information
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {totalAmount > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Payment Mode *</label>
                                            <Select value={paymentMode} onValueChange={setPaymentMode}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Cash">Cash</SelectItem>
                                                    <SelectItem value="UPI">UPI</SelectItem>
                                                    <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                                                    <SelectItem value="Card">Card</SelectItem>
                                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Transaction Reference</label>
                                            <Input
                                                placeholder="Optional"
                                                value={transactionRef}
                                                onChange={(e) => setTransactionRef(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div>
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-medium">
                                            ₹{new Intl.NumberFormat("en-IN").format(totalAmount)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total:</span>
                                            <span>
                                                {totalAmount === 0 ? (
                                                    <span className="text-green-600">Free</span>
                                                ) : (
                                                    <>₹{new Intl.NumberFormat("en-IN").format(totalAmount)}</>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    {Object.keys(alreadyOwned).length === items.length ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-slate-600 text-center mb-4">
                                                You already own all items in this order.
                                            </p>
                                            {items.map((item) => {
                                                const owned = alreadyOwned[item.id]
                                                if (!owned) return null
                                                return (
                                                    <Link key={item.id} href={owned.accessUrl} className="block">
                                                        <Button
                                                            size="lg"
                                                            variant="outline"
                                                            className="w-full"
                                                        >
                                                            <ExternalLink className="mr-2 h-5 w-5" />
                                                            {owned.type === "course" ? "Continue Learning" : "View Material"}
                                                        </Button>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <>
                                            {Object.keys(alreadyOwned).length > 0 && (
                                                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <p className="text-sm text-amber-800">
                                                        Note: Some items are already in your library. You'll only be charged for new items.
                                                    </p>
                                                </div>
                                            )}
                                            <Button
                                                size="lg"
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="w-full"
                                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                                        Place Order
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fbf9ef" }}>
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </main>
        }>
            <CheckoutPageContent />
        </Suspense>
    )
}

