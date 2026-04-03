"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AshramSettings } from "@/lib/settings/types"
import { GeneralTab } from "./general-tab"
import { FinancialTab } from "./financial-tab"
import { DonationsReceiptsTab } from "./donations-receipts-tab"
import { AccommodationSettingsTab } from "./accommodation-tab"
import { NotificationsTab } from "./notifications-tab"
import { RolesAccessTab } from "./roles-access-tab"
import { PublicPagesTab } from "./public-pages-tab"
import { IntegrationsTab } from "./integrations-tab"
import {
  Building2, Wallet, HandHeart, BedDouble,
  Bell, ShieldCheck, Globe, Plug
} from "lucide-react"

const TABS = [
  { value: "general",       label: "General",              icon: Building2   },
  { value: "financial",     label: "Financial",            icon: Wallet      },
  { value: "donations",     label: "Donations & Receipts", icon: HandHeart   },
  { value: "accommodation", label: "Accommodation",        icon: BedDouble   },
  { value: "notifications", label: "Notifications",        icon: Bell        },
  { value: "roles",         label: "Roles & Access",       icon: ShieldCheck },
  { value: "public",        label: "Public Pages",         icon: Globe       },
  { value: "integrations",  label: "Integrations",         icon: Plug        },
]

interface Props {
  settings: AshramSettings
  onSave: (updates: Partial<AshramSettings>) => Promise<void>
}

export function SettingsLayout({ settings, onSave }: Props) {
  return (
    <Tabs defaultValue="general" className="flex flex-col md:flex-row gap-0 min-h-[80vh]">
      {/* ── Desktop: vertical left sidebar ── */}
      <TabsList className="hidden md:flex flex-col h-auto w-52 shrink-0 bg-transparent border-r items-stretch justify-start rounded-none gap-0.5 p-2">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="justify-start gap-2.5 rounded-lg px-3 py-2 text-sm font-normal text-muted-foreground
                       data-[state=active]:bg-[#3c0212]/[0.07] data-[state=active]:text-[#3c0212]
                       data-[state=active]:font-medium data-[state=active]:shadow-none
                       hover:bg-muted/50 transition-colors"
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── Mobile: horizontal scrollable tabs ── */}
      <TabsList className="flex md:hidden w-full overflow-x-auto border-b bg-transparent rounded-none justify-start h-auto p-1 gap-1 shrink-0">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="shrink-0 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-normal
                       data-[state=active]:bg-[#3c0212]/[0.07] data-[state=active]:text-[#3c0212]
                       data-[state=active]:font-medium data-[state=active]:shadow-none"
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── Content area ── */}
      <div className="flex-1 min-w-0 overflow-auto">
        <TabsContent value="general" className="mt-0 p-6 md:p-8">
          <GeneralTab settings={settings} onSave={onSave} />
        </TabsContent>
        <TabsContent value="financial" className="mt-0 p-6 md:p-8">
          <FinancialTab settings={settings} onSave={onSave} />
        </TabsContent>
        <TabsContent value="donations" className="mt-0 p-6 md:p-8">
          <DonationsReceiptsTab settings={settings} onSave={onSave} />
        </TabsContent>
        <TabsContent value="accommodation" className="mt-0 p-6 md:p-8">
          <AccommodationSettingsTab settings={settings} onSave={onSave} />
        </TabsContent>
        <TabsContent value="notifications" className="mt-0 p-6 md:p-8">
          <NotificationsTab settings={settings} onSave={onSave} />
        </TabsContent>
        <TabsContent value="roles" className="mt-0 p-6 md:p-8">
          <RolesAccessTab />
        </TabsContent>
        <TabsContent value="public" className="mt-0 p-6 md:p-8">
          <PublicPagesTab settings={settings} onSave={onSave} />
        </TabsContent>
        <TabsContent value="integrations" className="mt-0 p-6 md:p-8">
          <IntegrationsTab settings={settings} onSave={onSave} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
