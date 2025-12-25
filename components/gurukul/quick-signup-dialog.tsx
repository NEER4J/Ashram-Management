"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { autoLinkDevoteeByPhone } from "@/lib/auth/role-check"
import Link from "next/link"

interface QuickSignupDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (userId: string) => void
}

export function QuickSignupDialog({ open, onOpenChange, onSuccess }: QuickSignupDialogProps) {
    const [mode, setMode] = useState<"signup" | "login">("signup")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Reset form when dialog first opens
    const [hasOpened, setHasOpened] = useState(false)
    useEffect(() => {
        if (open && !hasOpened) {
            setMode("signup")
            setName("")
            setEmail("")
            setPhone("")
            setPassword("")
            setShowPassword(false)
            setLoading(false)
            setHasOpened(true)
        } else if (!open) {
            setHasOpened(false)
        }
    }, [open, hasOpened])

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Sign up the user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone,
                    },
                },
            })

            if (signUpError) {
                // Check if user already exists
                if (
                    signUpError.message.includes("already registered") ||
                    signUpError.message.includes("already exists") ||
                    signUpError.message.includes("User already registered")
                ) {
                    // Switch to login mode
                    setMode("login")
                    toast.info("An account with this email already exists. Please sign in instead.")
                    setLoading(false)
                    return
                }
                throw signUpError
            }

            if (!authData.user) {
                throw new Error("Failed to create user")
            }

            // If no session was created (email confirmation required), sign in instead
            if (!authData.session) {
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                
                if (signInError) {
                    // If sign in fails, user might need to confirm email
                    toast.info("Please check your email to confirm your account, then try again.")
                    throw signInError
                }
            }

            // User profile is automatically created by trigger, but we need to wait a bit
            // Try to auto-link devotee by phone
            try {
                // Wait a moment for the trigger to create the profile
                await new Promise(resolve => setTimeout(resolve, 500))
                await autoLinkDevoteeByPhone(authData.user.id, phone)
            } catch (linkError) {
                // Silently fail - linking is optional
                console.log("Could not auto-link devotee:", linkError)
            }

            toast.success("Account created successfully!")
            onSuccess(authData.user.id)
            onOpenChange(false)

            // Reset form
            setName("")
            setEmail("")
            setPhone("")
            setPassword("")
        } catch (error: any) {
            console.error("Signup error:", error)
            
            // Provide more specific error messages
            let errorMessage = "Failed to create account. Please try again."
            
            if (error.message) {
                if (error.message.includes("password")) {
                    errorMessage = "Password must be at least 6 characters long."
                } else if (error.message.includes("email")) {
                    errorMessage = "Please enter a valid email address."
                } else if (error.message.includes("Database error")) {
                    errorMessage = "Database error. Please contact support if this persists."
                } else {
                    errorMessage = error.message
                }
            }
            
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                throw signInError
            }

            if (!authData.user) {
                throw new Error("Failed to sign in")
            }

            toast.success("Signed in successfully!")
            onSuccess(authData.user.id)
            onOpenChange(false)

            // Reset form
            setEmail("")
            setPassword("")
        } catch (error: any) {
            console.error("Login error:", error)
            
            let errorMessage = "Failed to sign in. Please check your credentials."
            
            if (error.message) {
                if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid credentials")) {
                    errorMessage = "Invalid email or password. Please try again."
                } else if (error.message.includes("Email not confirmed")) {
                    errorMessage = "Please check your email to confirm your account."
                } else {
                    errorMessage = error.message
                }
            }
            
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "signup" ? "Create Account" : "Sign In"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "signup"
                            ? "Enter your details to continue with your purchase"
                            : "Sign in to continue with your purchase"}
                    </DialogDescription>
                </DialogHeader>
                
                <Tabs value={mode} onValueChange={(value) => setMode(value as "signup" | "login")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        <TabsTrigger value="login">Sign In</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="signup" className="space-y-4 mt-4">
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-name">Full Name *</Label>
                                <Input
                                    id="signup-name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email *</Label>
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-phone">Phone Number *</Label>
                                <Input
                                    id="signup-phone"
                                    type="tel"
                                    placeholder="10-digit phone number"
                                    required
                                    minLength={10}
                                    maxLength={10}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="signup-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password (min 6 characters)"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account & Continue"
                                )}
                            </Button>
                        </form>
                    </TabsContent>
                    
                    <TabsContent value="login" className="space-y-4 mt-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email *</Label>
                                <Input
                                    id="login-email"
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="login-password">Password *</Label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm underline-offset-4 hover:underline"
                                        style={{ color: "#3c0212" }}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            onOpenChange(false)
                                            // You can navigate to forgot password page here if needed
                                        }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                        disabled={loading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    "Sign In & Continue"
                                )}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

