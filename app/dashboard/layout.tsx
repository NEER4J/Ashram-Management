"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, User, Settings, Search, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  UserPlus,
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
  GraduationCap,
  ChefHat,
  Heart,
  DoorOpen,
  List,
  HandHeart,
  ClipboardList,
  Award,
  Clock,
  History,
  BarChart3,
  MapPin,
  ArrowRightLeft,
  Landmark,
  Stethoscope,
  ShieldAlert,
  Activity,
  Utensils,
  Ticket,
  HandPlatter,
  UtensilsCrossed,
  Warehouse,
  ScrollText,
  Truck,
  Gem,
  HardHat,
  Contact,
  BadgeCheck,
  Briefcase,
  Calendar
} from "lucide-react";

const navigation = [
  {
    title: "Core Operations",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Devotees", url: "/dashboard/devotees", icon: Users },
      { title: "Puja Booking", url: "/dashboard/pujas", icon: CalendarCheck },
      { title: "Events", url: "/dashboard/events", icon: CalendarDays },
    ],
  },
  {
    title: "Visitors",
    isCollapsible: true,
    icon: UserPlus,
    pathPrefix: "/dashboard/visitors",
    items: [
      { title: "Overview", url: "/dashboard/visitors", icon: LayoutDashboard },
      { title: "Today", url: "/dashboard/visitors/today", icon: ClipboardList },
      { title: "History", url: "/dashboard/visitors/history", icon: History },
      { title: "Analytics", url: "/dashboard/visitors/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Kitchen & Prasad",
    isCollapsible: true,
    icon: ChefHat,
    pathPrefix: "/dashboard/kitchen",
    items: [
      { title: "Overview", url: "/dashboard/kitchen", icon: LayoutDashboard },
      { title: "Inventory", url: "/dashboard/kitchen/inventory", icon: Package },
      { title: "Meal Planning", url: "/dashboard/kitchen/meals", icon: UtensilsCrossed },
      { title: "Meal Tokens", url: "/dashboard/kitchen/tokens", icon: Ticket },
      { title: "Prasad Bookings", url: "/dashboard/kitchen/prasad", icon: HandPlatter },
      { title: "Annadaan", url: "/dashboard/kitchen/annadaan", icon: HandHeart },
    ],
  },
  {
    title: "Seva & Volunteers",
    isCollapsible: true,
    icon: HandHeart,
    pathPrefix: "/dashboard/seva",
    items: [
      { title: "Overview", url: "/dashboard/seva", icon: LayoutDashboard },
      { title: "Volunteers", url: "/dashboard/seva/volunteers", icon: Users },
      { title: "Opportunities", url: "/dashboard/seva/opportunities", icon: ClipboardList },
      { title: "Shifts", url: "/dashboard/seva/shifts", icon: Clock },
      { title: "Assignments", url: "/dashboard/seva/assignments", icon: BadgeCheck },
      { title: "Badges", url: "/dashboard/seva/badges", icon: Award },
    ],
  },
  {
    title: "Staff & Priests",
    isCollapsible: true,
    icon: UserCog,
    pathPrefix: "/dashboard/staff",
    items: [
      { title: "Overview", url: "/dashboard/staff", icon: LayoutDashboard },
      { title: "Directory", url: "/dashboard/staff/directory", icon: Contact },
      { title: "Priests", url: "/dashboard/staff/priests", icon: Landmark },
      { title: "Departments", url: "/dashboard/staff/departments", icon: Briefcase },
      { title: "Attendance", url: "/dashboard/staff/attendance", icon: Calendar },
    ],
  },
  {
    title: "Inventory",
    isCollapsible: true,
    icon: Package,
    pathPrefix: "/dashboard/inventory",
    items: [
      { title: "Overview", url: "/dashboard/inventory", icon: LayoutDashboard },
      { title: "Items", url: "/dashboard/inventory/items", icon: Package },
      { title: "Locations", url: "/dashboard/inventory/locations", icon: MapPin },
      { title: "Transactions", url: "/dashboard/inventory/transactions", icon: ScrollText },
      { title: "Purchase Orders", url: "/dashboard/inventory/purchase-orders", icon: Truck },
      { title: "Transfers", url: "/dashboard/inventory/transfers", icon: ArrowRightLeft },
      { title: "Religious Items", url: "/dashboard/inventory/religious", icon: Gem },
      { title: "Fixed Assets", url: "/dashboard/inventory/assets", icon: HardHat },
    ],
  },
  {
    title: "Medical",
    isCollapsible: true,
    icon: Heart,
    pathPrefix: "/dashboard/medical",
    items: [
      { title: "Overview", url: "/dashboard/medical", icon: LayoutDashboard },
      { title: "Emergency Contacts", url: "/dashboard/medical/emergency", icon: ShieldAlert },
      { title: "Medical Camps", url: "/dashboard/medical/camps", icon: Stethoscope },
      { title: "Wellness", url: "/dashboard/medical/wellness", icon: Activity },
      { title: "First Aid Log", url: "/dashboard/medical/first-aid", icon: Heart },
    ],
  },
  {
    title: "Accommodation",
    isCollapsible: true,
    icon: Building2,
    pathPrefix: "/dashboard/accommodation",
    items: [
      { title: "Overview", url: "/dashboard/accommodation", icon: LayoutDashboard },
      { title: "Properties", url: "/dashboard/accommodation/properties", icon: Building2 },
      { title: "Rooms", url: "/dashboard/accommodation/rooms", icon: DoorOpen },
      { title: "Bookings", url: "/dashboard/accommodation/bookings", icon: CalendarCheck },
      { title: "Waitlist", url: "/dashboard/accommodation/waitlist", icon: List },
    ],
  },
  {
    title: "Accounting & Finance",
    isCollapsible: true,
    icon: Wallet,
    pathPrefix: "/dashboard/accounting",
    pathPrefixes: ["/dashboard/accounting", "/dashboard/donations"],
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
      { title: "Reports", url: "/dashboard/reports", icon: FileText },
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
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
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

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileData) {
        const role = profileData.role as UserRole;
        setUserRole(role);

        const isAdminRoute = pathname.startsWith("/dashboard") &&
          !pathname.startsWith("/dashboard/my-learning") &&
          !pathname.startsWith("/dashboard/profile") &&
          !pathname.startsWith("/dashboard/settings");

        if (role !== 'admin' && isAdminRoute) {
          router.push("/dashboard/my-learning");
          return;
        }
      } else {
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

  useEffect(() => {
    navigation.forEach((group) => {
      if (!group.isCollapsible) return;
      const prefixes = (group as any).pathPrefixes || [(group as any).pathPrefix];
      const match = prefixes?.some((p: string) => pathname.startsWith(p));
      if (match) {
        setOpenMenus((prev) => ({ ...prev, [group.title]: true }));
      }
    });
  }, [pathname]);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setIsNavigating(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  const handleLinkClick = () => {
    setIsNavigating(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        {/* ===== SIDEBAR HEADER ===== */}
        <SidebarHeader>
          <div className="flex items-center gap-3 px-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white leading-tight">Ashram</span>
              <span className="text-[11px] text-white/50 leading-tight">Management</span>
            </div>
          </div>
        </SidebarHeader>

        {/* ===== SIDEBAR CONTENT ===== */}
        <SidebarContent className="custom-scrollbar">
          {userRole === 'admin' ? (
            navigation.length > 0 ? (
              navigation.map((group) => {
              const isCollapsibleGroup = group.isCollapsible;
              const collapsibleOpen = openMenus[group.title] || false;
              const toggleOpen = () => setOpenMenus((prev) => ({ ...prev, [group.title]: !prev[group.title] }));
              const prefixes = (group as any).pathPrefixes || [(group as any).pathPrefix];
              const isActive = isCollapsibleGroup && prefixes?.some((p: string) => p && pathname.startsWith(p));

              return (
                <SidebarGroup key={group.title} className="py-0.5">
                  {!isCollapsibleGroup && (
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.08em] text-white/40 font-medium px-3 mb-0.5">
                      {group.title}
                    </SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {isCollapsibleGroup ? (
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={toggleOpen}
                            isActive={isActive}
                            className="cursor-pointer rounded-lg transition-all duration-200"
                          >
                            <ChevronRight
                              className={`h-3.5 w-3.5 transition-transform duration-200 ease-snappy ${
                                collapsibleOpen ? "rotate-90" : "rotate-0"
                              }`}
                            />
                            {(() => { const Icon = (group as any).icon; return Icon ? <Icon className="h-4 w-4" /> : null; })()}
                            <span className="text-[13px]">{group.title}</span>
                          </SidebarMenuButton>
                          <div
                            className={`overflow-hidden transition-all duration-200 ease-snappy ${
                              collapsibleOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <SidebarMenuSub className="ml-3 border-l border-white/10 pl-2">
                              {(() => {
                                const items = group.items;
                                const matches = items.filter(
                                  (i) =>
                                    pathname === i.url ||
                                    (i.url !== "/dashboard" && pathname.startsWith(i.url + "/"))
                                );
                                const activeUrl =
                                  matches.length === 0
                                    ? null
                                    : matches.reduce((a, b) => (a.url.length >= b.url.length ? a : b)).url;
                                return items.map((item) => {
                                const isItemActive = activeUrl === item.url;
                                return (
                                  <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isItemActive}
                                      className={`rounded-md text-[13px] transition-all duration-150 ${isItemActive ? 'bg-white/15 font-medium' : ''}`}
                                    >
                                      <Link href={item.url} onClick={handleLinkClick}>
                                        <item.icon className="h-3.5 w-3.5" />
                                        <span>{item.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              });
                              })()}
                            </SidebarMenuSub>
                          </div>
                        </SidebarMenuItem>
                      ) : (
                        group.items.map((item) => {
                          const isItemActive = pathname === item.url;
                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                asChild
                                isActive={isItemActive}
                                className={`rounded-lg text-[13px] transition-all duration-150 ${isItemActive ? 'bg-white/15 font-medium' : ''}`}
                              >
                                <Link href={item.url} onClick={handleLinkClick}>
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })
                      )}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })
          ) : (
            <div className="px-3 py-4 text-sm text-white/40">
              Navigation items will appear here
            </div>
          )
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.08em] text-white/40 font-medium px-3">Student Portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/my-learning"} className="rounded-lg text-[13px]">
                      <Link href="/dashboard/my-learning" onClick={handleLinkClick}><GraduationCap className="h-4 w-4" /><span>My Learning</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/gurukul" || pathname.startsWith("/gurukul/")} className="rounded-lg text-[13px]">
                      <Link href="/gurukul" onClick={handleLinkClick}><BookOpen className="h-4 w-4" /><span>Browse Store</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/profile"} className="rounded-lg text-[13px]">
                      <Link href="/dashboard/profile" onClick={handleLinkClick}><User className="h-4 w-4" /><span>Profile</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/settings"} className="rounded-lg text-[13px]">
                      <Link href="/dashboard/settings" onClick={handleLinkClick}><Settings className="h-4 w-4" /><span>Settings</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* ===== SIDEBAR FOOTER ===== */}
        <SidebarFooter className="border-t border-white/8 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-auto py-2 px-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer w-full">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-medium text-white">
                      {user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 text-left">
                      <span className="text-[13px] font-medium text-white truncate">{user?.email}</span>
                      <span className="text-[11px] text-white/40 capitalize">{userRole || "user"}</span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-white/40 shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  sideOffset={8}
                  className="w-56 mb-1"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium truncate">{user?.email}</span>
                      <span className="text-xs text-muted-foreground capitalize">{userRole || "user"}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* ===== MAIN CONTENT ===== */}
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40 md:hidden">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-foreground/80">Ashram Management</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col relative min-h-0">
          {isNavigating && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 animate-fade-in">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            </div>
          )}
          <div className="animate-page-enter">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
