"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
type UserRole = 'admin' | 'user';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  LayoutDashboard,
  Users,
  Banknote,
  CalendarCheck,
  CalendarDays,
  UserCog,
  Package,
  FileText,
  Calculator,
  BookOpen,
  Receipt,
  Building2,
  Wallet,
  FileSpreadsheet,
  TrendingUp,
  Scale,
  DollarSign,
  ChevronRight,
  ChevronDown,
  GraduationCap
} from "lucide-react";

const navigation = [
  {
    title: "Core Operations",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Devotees", url: "/dashboard/devotees", icon: Users },
      { title: "Puja Booking", url: "/dashboard/pujas", icon: CalendarCheck },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Events", url: "/dashboard/events", icon: CalendarDays },
      { title: "Staff & Priests", url: "/dashboard/staff", icon: UserCog },
      { title: "Inventory", url: "/dashboard/inventory", icon: Package },
    ],
  },
  {
    title: "Accounting & Finance",
    isCollapsible: true,
    items: [
      { title: "Donations", url: "/dashboard/donations", icon: Banknote },
      { title: "Chart of Accounts", url: "/dashboard/accounting/chart-of-accounts", icon: BookOpen },
      { title: "General Ledger", url: "/dashboard/accounting/general-ledger", icon: FileSpreadsheet },
      { title: "Journal Entries", url: "/dashboard/accounting/journal-entries", icon: Calculator },
      { title: "Bank Accounts", url: "/dashboard/accounting/bank-accounts", icon: Building2 },
      { title: "Vendors", url: "/dashboard/accounting/vendors", icon: Users },
      { title: "Bills (Payable)", url: "/dashboard/accounting/bills", icon: Receipt },
      { title: "Invoices (Receivable)", url: "/dashboard/accounting/invoices", icon: FileText },
      { title: "Expenses", url: "/dashboard/accounting/expenses", icon: DollarSign },
      { title: "Budgets", url: "/dashboard/accounting/budgets", icon: TrendingUp },
      { title: "GST Management", url: "/dashboard/accounting/gst", icon: Receipt },
      { title: "Financial Reports", url: "/dashboard/accounting/reports", icon: Scale },
    ],
  },
  {
    title: "Gurukul",
    items: [
      { title: "Study Materials", url: "/dashboard/gurukul/study-materials", icon: BookOpen },
      { title: "Courses", url: "/dashboard/gurukul/courses", icon: GraduationCap },
      { title: "Orders", url: "/dashboard/gurukul/orders", icon: Receipt },
    ],
  },
  {
    title: "Reports",
    items: [
      { title: "Reports", url: "/reports", icon: FileText },
    ],
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountingOpen, setAccountingOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);

      // Get user profile and role
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileData) {
        const role = profileData.role as UserRole;
        setUserRole(role);
        
        // Redirect non-admin users from admin routes to my-learning
        const isAdminRoute = pathname.startsWith("/dashboard") && 
          !pathname.startsWith("/dashboard/my-learning") &&
          !pathname.startsWith("/dashboard/profile") &&
          !pathname.startsWith("/dashboard/settings");
        
        if (role !== 'admin' && isAdminRoute) {
          router.push("/dashboard/my-learning");
          return;
        }
      } else {
        // No profile, redirect to my-learning
        if (pathname.startsWith("/dashboard") && 
          !pathname.startsWith("/dashboard/my-learning") &&
          !pathname.startsWith("/dashboard/profile") &&
          !pathname.startsWith("/dashboard/settings")) {
          router.push("/dashboard/my-learning");
          return;
        }
      }

      setLoading(false);
    };

    checkUser();
  }, [router, supabase, pathname]);

  // Auto-open accounting menu when on accounting pages
  useEffect(() => {
    if (pathname.startsWith("/dashboard/accounting") || pathname.startsWith("/dashboard/donations")) {
      setAccountingOpen(true);
    }
  }, [pathname]);

  // Track navigation state
  useEffect(() => {
    // If pathname changed, navigation completed
    if (prevPathnameRef.current !== pathname) {
      setIsNavigating(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  // Handle link clicks to show loading
  const handleLinkClick = () => {
    setIsNavigating(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2 border-b" style={{ borderColor: "#3c0212" }}>
            <div className="grid flex-1 text-left text-lg leading-tight">
              <span className="truncate font-semibold text-white">Ashram Management</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {userRole === 'admin' ? (
            navigation.length > 0 ? (
              navigation.map((group) => {
              const isAccountingGroup = group.isCollapsible;
              const isActive = isAccountingGroup && group.items.some(item => pathname === item.url || pathname.startsWith("/dashboard/accounting") || pathname.startsWith("/dashboard/donations"));
              
              return (
                <SidebarGroup key={group.title}>
                  <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {isAccountingGroup ? (
                        <>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              onClick={() => setAccountingOpen(!accountingOpen)}
                              isActive={isActive}
                              className="cursor-pointer"
                            >
                              <ChevronRight 
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  accountingOpen ? "rotate-90" : "rotate-0"
                                }`}
                              />
                              <Wallet className="h-4 w-4" />
                              <span>Accounting & Finance</span>
                            </SidebarMenuButton>
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                accountingOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                              }`}
                            >
                              <SidebarMenuSub>
                                {group.items.map((item) => (
                                  <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === item.url}
                                    >
                                      <Link href={item.url} onClick={handleLinkClick}>
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </div>
                          </SidebarMenuItem>
                        </>
                      ) : (
                        group.items.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname === item.url}
                            >
                              <Link href={item.url} onClick={handleLinkClick}>
                                <item.icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })
          ) : (
            <div className="px-2 py-4 text-sm text-slate-500">
              Navigation items will appear here
            </div>
          )
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/my-learning"}
                    >
                      <Link href="/dashboard/my-learning" onClick={handleLinkClick}>
                        <GraduationCap />
                        <span>My Learning</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/gurukul" || pathname.startsWith("/gurukul/")}
                    >
                      <Link href="/gurukul" onClick={handleLinkClick}>
                        <BookOpen />
                        <span>Browse Store</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/profile"}
                    >
                      <Link href="/dashboard/profile" onClick={handleLinkClick}>
                        <User />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/dashboard/settings"}
                    >
                      <Link href="/dashboard/settings" onClick={handleLinkClick}>
                        <Settings />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-white">
                <User className="size-4" />
                <span className="truncate">{user?.email}</span>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-2 h-8 px-2 text-sm font-normal hover:bg-opacity-10 text-white hover:text-white bg-white/20"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 md:hidden flex">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 relative">
          {isNavigating && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-lg z-50 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          )}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
