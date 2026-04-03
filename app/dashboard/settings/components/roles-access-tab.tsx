"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserWithRole, GranularRole, Permission, RolePermission } from "@/lib/settings/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus, Check, Minus, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

// ─── Types ──────────────────────────────────────────────────────────────────

// Unique modules derived from permissions list
type PermissionMap = Map<string, Map<string, string>> // module → action → permission_id

// ─── Permission Matrix (read-only V1) ────────────────────────────────────────

const ACTIONS = ["create", "read", "update", "delete"] as const

function PermissionMatrix({
  permissions,
  rolePermissions,
  selectedRoleId,
}: {
  permissions: Permission[]
  rolePermissions: RolePermission[]
  selectedRoleId: string
}) {
  // Build a Set of permission_ids granted to the selected role
  const grantedIds = new Set(
    rolePermissions.filter(rp => rp.role_id === selectedRoleId).map(rp => rp.permission_id)
  )

  // Group permissions by module
  const byModule: Record<string, Record<string, string>> = {}
  for (const p of permissions) {
    if (!byModule[p.module]) byModule[p.module] = {}
    byModule[p.module][p.action] = p.id
  }

  const modules = Object.keys(byModule).sort()

  if (modules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No permissions defined for this role.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-[180px]">Module</th>
            {ACTIONS.map(a => (
              <th key={a} className="px-4 py-2.5 font-medium text-muted-foreground capitalize text-center w-[80px]">{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modules.map((mod, i) => (
            <tr key={mod} className={i % 2 === 0 ? "" : "bg-muted/20"}>
              <td className="px-4 py-2.5 font-medium capitalize">{mod.replace(/_/g, " ")}</td>
              {ACTIONS.map(action => {
                const pid = byModule[mod]?.[action]
                const granted = pid ? grantedIds.has(pid) : false
                return (
                  <td key={action} className="px-4 py-2.5 text-center">
                    {pid ? (
                      granted
                        ? <Check className="h-4 w-4 text-green-600 mx-auto" />
                        : <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground/25">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Invite Dialog ────────────────────────────────────────────────────────────

function InviteUserDialog({ onInvited }: { onInvited: () => void }) {
  const [open, setOpen]       = useState(false)
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)

  async function handleInvite() {
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/settings/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Invite failed")
      toast.success(`Invite sent to ${email}`)
      setEmail("")
      setOpen(false)
      onInvited()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a new user</DialogTitle>
          <DialogDescription>
            An email with a sign-up link will be sent. They can set their password on first login.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleInvite} disabled={loading || !email.trim()}
            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export function RolesAccessTab() {
  const supabase = createClient()

  const [users, setUsers]               = useState<UserWithRole[]>([])
  const [roles, setRoles]               = useState<GranularRole[]>([])
  const [permissions, setPermissions]   = useState<Permission[]>([])
  const [rolePerms, setRolePerms]       = useState<RolePermission[]>([])
  const [loading, setLoading]           = useState(true)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    const [usersRes, rolesRes, permsRes, rolePermsRes] = await Promise.all([
      supabase.rpc("get_users_with_roles"),
      supabase.from("roles").select("id, name, description").order("name"),
      supabase.from("permissions").select("id, module, action").order("module").order("action"),
      supabase.from("role_permissions").select("role_id, permission_id"),
    ])

    if (!usersRes.error)    setUsers(usersRes.data ?? [])
    if (!rolesRes.error)    setRoles(rolesRes.data ?? [])
    if (!permsRes.error)    setPermissions(permsRes.data ?? [])
    if (!rolePermsRes.error) setRolePerms(rolePermsRes.data ?? [])

    // Pre-select first role in matrix
    if (rolesRes.data && rolesRes.data.length > 0 && !selectedRoleId) {
      setSelectedRoleId(rolesRes.data[0].id)
    }

    setLoading(false)
  }

  useEffect(() => { fetchAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function updatePlatformRole(userId: string, newRole: "admin" | "user") {
    setUpdatingUserId(userId)
    const { error } = await supabase
      .from("user_profiles")
      .update({ role: newRole })
      .eq("id", userId)
    if (error) toast.error("Failed to update role")
    else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      toast.success("Role updated")
    }
    setUpdatingUserId(null)
  }

  async function updateGranularRole(userId: string, roleId: string) {
    setUpdatingUserId(userId)
    const value = roleId === "__none__" ? null : roleId
    const roleName = roleId === "__none__" ? null : (roles.find(r => r.id === roleId)?.name ?? null)
    const { error } = await supabase
      .from("user_profiles")
      .update({ role_id: value })
      .eq("id", userId)
    if (error) toast.error("Failed to update granular role")
    else {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role_id: value, role_name: roleName } : u
      ))
      toast.success("Granular role updated")
    }
    setUpdatingUserId(null)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Roles & Access</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage platform roles, granular permissions, and invite new users.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Users Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Users</CardTitle>
                  <CardDescription className="mt-0.5">
                    {users.length} member{users.length !== 1 ? "s" : ""} — change roles immediately
                  </CardDescription>
                </div>
                <InviteUserDialog onInvited={fetchAll} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-[140px]">Platform Role</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-[180px]">Granular Role</th>
                      <th className="px-4 py-2.5 text-muted-foreground w-[80px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr key={user.id} className={`border-b last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-xs text-muted-foreground">
                            Joined {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={user.role}
                            onValueChange={(v) => updatePlatformRole(user.id, v as "admin" | "user")}
                            disabled={updatingUserId === user.id}
                          >
                            <SelectTrigger className="h-8 text-xs w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <span className="flex items-center gap-1.5">
                                  <Badge className="h-4 px-1.5 text-[10px] bg-[#3c0212]/10 text-[#3c0212] hover:bg-[#3c0212]/10">admin</Badge>
                                </span>
                              </SelectItem>
                              <SelectItem value="user">
                                <span className="flex items-center gap-1.5">
                                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">user</Badge>
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={user.role_id ?? "__none__"}
                            onValueChange={(v) => updateGranularRole(user.id, v)}
                            disabled={updatingUserId === user.id}
                          >
                            <SelectTrigger className="h-8 text-xs w-[160px]">
                              <SelectValue placeholder="No role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">
                                <span className="text-muted-foreground">No role</span>
                              </SelectItem>
                              {roles.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {updatingUserId === user.id && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          {roles.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#3c0212]" />
                  Permission Matrix
                </CardTitle>
                <CardDescription>Read-only view of what each granular role can do.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Label className="shrink-0 text-sm">View role:</Label>
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                    <SelectTrigger className="w-[200px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRoleId && roles.find(r => r.id === selectedRoleId)?.description && (
                    <p className="text-xs text-muted-foreground">
                      {roles.find(r => r.id === selectedRoleId)?.description}
                    </p>
                  )}
                </div>

                {selectedRoleId && (
                  <PermissionMatrix
                    permissions={permissions}
                    rolePermissions={rolePerms}
                    selectedRoleId={selectedRoleId}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
