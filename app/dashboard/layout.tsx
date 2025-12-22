"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  FileText
} from "lucide-react";

const navigation = [
  {
    title: "Core Operations",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Devotees", url: "/dashboard/devotees", icon: Users },
      { title: "Donations", url: "/dashboard/donations", icon: Banknote },
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
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
          {navigation.length > 0 ? (
            navigation.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.url}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          ) : (
            <div className="px-2 py-4 text-sm text-slate-500">
              Navigation items will appear here
            </div>
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
