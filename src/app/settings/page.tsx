"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Check } from "lucide-react"

interface RolePermission {
  role: string
  label: string
  permissions: { key: string; name: string; allowed: boolean }[]
}

const initialRoles: RolePermission[] = [
  {
    role: "super_admin",
    label: "Super Admin",
    permissions: [
      { key: "view_dashboard", name: "View Dashboard", allowed: true },
      { key: "view_orders", name: "View Orders", allowed: true },
      { key: "view_payments", name: "View Payments", allowed: true },
      { key: "view_tickets", name: "View Tickets", allowed: true },
      { key: "view_customers", name: "View Customers", allowed: true },
      { key: "view_reconciliation", name: "View Reconciliation", allowed: true },
      { key: "manage_users", name: "Manage Users", allowed: true },
      { key: "manage_settings", name: "Manage Settings", allowed: true },
      { key: "manage_roles", name: "Manage RBAC", allowed: true },
      { key: "sync_data", name: "Sync Data", allowed: true },
    ],
  },
  {
    role: "admin",
    label: "Admin",
    permissions: [
      { key: "view_dashboard", name: "View Dashboard", allowed: true },
      { key: "view_orders", name: "View Orders", allowed: true },
      { key: "view_payments", name: "View Payments", allowed: true },
      { key: "view_tickets", name: "View Tickets", allowed: true },
      { key: "view_customers", name: "View Customers", allowed: true },
      { key: "view_reconciliation", name: "View Reconciliation", allowed: true },
      { key: "manage_users", name: "Manage Users", allowed: false },
      { key: "manage_settings", name: "Manage Settings", allowed: false },
      { key: "manage_roles", name: "Manage RBAC", allowed: false },
      { key: "sync_data", name: "Sync Data", allowed: true },
    ],
  },
  {
    role: "manajemen",
    label: "Manajemen",
    permissions: [
      { key: "view_dashboard", name: "View Dashboard", allowed: true },
      { key: "view_orders", name: "View Orders", allowed: true },
      { key: "view_payments", name: "View Payments", allowed: true },
      { key: "view_tickets", name: "View Tickets", allowed: true },
      { key: "view_customers", name: "View Customers", allowed: true },
      { key: "view_reconciliation", name: "View Reconciliation", allowed: true },
      { key: "manage_users", name: "Manage Users", allowed: false },
      { key: "manage_settings", name: "Manage Settings", allowed: false },
      { key: "manage_roles", name: "Manage RBAC", allowed: false },
      { key: "sync_data", name: "Sync Data", allowed: false },
    ],
  },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const [roles, setRoles] = useState<RolePermission[]>(initialRoles)
  const [activeTab, setActiveTab] = useState("profile")
  const [name, setName] = useState(session?.user?.name || "")
  const [email] = useState(session?.user?.email || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [rbacSaving, setRbacSaving] = useState(false)
  const [rbacSaved, setRbacSaved] = useState(false)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await new Promise((r) => setTimeout(r, 800))
    setSaved(true)
    setSaving(false)
  }

  async function handleRbacSave() {
    setRbacSaving(true)
    setRbacSaved(false)
    await new Promise((r) => setTimeout(r, 800))
    setRbacSaving(false)
    setRbacSaved(true)
    setTimeout(() => setRbacSaved(false), 3000)
  }

  function togglePermission(roleIdx: number, permKey: string) {
    setRoles((prev) =>
      prev.map((r, i) =>
        i === roleIdx
          ? { ...r, permissions: r.permissions.map((p) => (p.key === permKey ? { ...p, allowed: !p.allowed } : p)) }
          : r,
      ),
    )
  }

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "rbac", label: "RBAC Roles" },
  ]

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Settings" />

      <div className="mb-4 flex gap-1 rounded-lg border border-stroke bg-white p-1.5 shadow-default">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 rounded px-4 py-2 text-sm font-medium transition ${
              activeTab === t.key ? "bg-primary text-white" : "text-body hover:bg-gray-1 "
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
          <div className="border-b border-stroke px-5 py-3 ">
            <h3 className="font-medium text-black ">Profile</h3>
          </div>
          <form onSubmit={handleProfileSave} className="p-5">
            {saved && (
              <div className="mb-3 flex items-center gap-2 rounded-md bg-success/10 p-2.5 text-sm text-success">
                <Check className="h-4 w-4" />
                <span>Saved</span>
              </div>
            )}
            <div className="mb-3">
              <label className="compact-label">Name</label>
              <input className="compact-input w-full" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="compact-label">Email</label>
              <input className="compact-input w-full bg-whiten" value={email} disabled />
            </div>
            <div className="mb-3">
              <label className="compact-label">Role</label>
              <input className="compact-input w-full bg-whiten" value={session?.user?.role || ""} disabled />
            </div>
            <button type="submit" disabled={saving} className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "rbac" && (
        <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
          <div className="border-b border-stroke px-5 py-3 ">
            <h3 className="font-medium text-black ">Role-Based Access Control</h3>
            <p className="mt-0.5 text-xs text-body">
              Manage permissions for each role. Changes affect the current view only (not yet connected to backend).
            </p>
          </div>
          <div className="p-5">
            <div className="max-w-full overflow-x-auto">
              <table className="compact-table w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left ">
                    <th>Permission</th>
                    {roles.map((r) => (
                      <th key={r.role} className="text-center">{r.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roles[0].permissions.map((perm, pidx) => (
                    <tr key={perm.key} className="border-b border-[#eee] ">
                      <td className="font-medium text-black ">
                        {perm.name}
                      </td>
                      {roles.map((role, ridx) => (
                        <td key={role.role} className="text-center">
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={role.permissions[pidx].allowed}
                              onChange={() => togglePermission(ridx, perm.key)}
                              className="sr-only"
                            />
                            <div className={`flex h-5 w-9 items-center rounded-full transition ${role.permissions[pidx].allowed ? "bg-primary" : "bg-gray-3 "}`}>
                              <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${role.permissions[pidx].allowed ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
                            </div>
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleRbacSave}
                disabled={rbacSaving}
                className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
              >
                {rbacSaving ? "Saving..." : "Save RBAC"}
              </button>
              {rbacSaved && (
                <span className="text-sm text-success">Changes saved (local)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
