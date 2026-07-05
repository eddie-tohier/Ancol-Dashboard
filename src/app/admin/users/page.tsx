"use client"

import { useState } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import Breadcrumb from "@/components/layout/Breadcrumb"
import { Plus, Edit, Trash2, Shield } from "lucide-react"

type UserRole = "super_admin" | "admin" | "manajemen"
type UserStatus = "active" | "inactive"

interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: string
}

const initialUsers: AdminUser[] = [
  { id: "USR-001", name: "Eddie Tohier", email: "eddie@ancol.com", role: "super_admin", status: "active", lastLogin: "2026-07-03 08:30" },
  { id: "USR-002", name: "Rina Marlina", email: "rina@ancol.com", role: "admin", status: "active", lastLogin: "2026-07-03 09:15" },
  { id: "USR-003", name: "Dimas Prayoga", email: "dimas@ancol.com", role: "manajemen", status: "active", lastLogin: "2026-07-02 14:45" },
  { id: "USR-004", name: "Siti Rahmawati", email: "siti@ancol.com", role: "admin", status: "inactive", lastLogin: "2026-06-28 11:20" },
  { id: "USR-005", name: "Ahmad Fauzi", email: "ahmad@ancol.com", role: "manajemen", status: "inactive", lastLogin: "2026-06-15 16:00" },
]

const roleLabel: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manajemen: "Manajemen",
}

const roleBadge: Record<UserRole, string> = {
  super_admin: "text-success border border-success",
  admin: "text-primary border border-primary",
  manajemen: "text-[#8B5CF6] border-[#8B5CF6] border",
}

const roleOptions = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "manajemen", label: "Manajemen" },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)

  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formRole, setFormRole] = useState<UserRole>("admin")
  const [formStatus, setFormStatus] = useState<UserStatus>("active")
  const [formError, setFormError] = useState("")

  function openAdd() {
    setEditingUser(null)
    setFormName("")
    setFormEmail("")
    setFormPassword("")
    setFormRole("admin")
    setFormStatus("active")
    setFormError("")
    setFormOpen(true)
  }

  function openEdit(u: AdminUser) {
    setEditingUser(u)
    setFormName(u.name)
    setFormEmail(u.email)
    setFormPassword("")
    setFormRole(u.role)
    setFormStatus(u.status)
    setFormError("")
    setFormOpen(true)
  }

  function handleSave() {
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and Email are required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      setFormError("Invalid email format")
      return
    }
    if (!editingUser && formPassword.length < 8) {
      setFormError("Password must be at least 8 characters")
      return
    }
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: formName.trim(), email: formEmail.trim(), role: formRole, status: formStatus }
            : u
        )
      )
    } else {
      const newUser: AdminUser = {
        id: `USR-${String(users.length + 1).padStart(3, "0")}`,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        status: "active",
        lastLogin: "-",
      }
      setUsers((prev) => [...prev, newUser])
    }
    setFormOpen(false)
  }

  function handleDelete() {
    if (deletingUser) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id))
      setDeleteOpen(false)
      setDeletingUser(null)
    }
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Admin Users" />

      <div className="mb-6">
        <p className="flex items-center gap-1 text-sm text-gray-500">
          <Shield className="h-3.5 w-3.5" />
          Super Admin only
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between border-b border-stroke px-5 py-3 ">
          <div />
          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="compact-table w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left ">
                <th className="min-w-[150px] xl:pl-11">Name</th>
                <th className="min-w-[200px]">Email</th>
                <th className="min-w-[120px]">Role</th>
                <th className="min-w-[100px]">Status</th>
                <th className="min-w-[150px]">Last Login</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border-b border-[#eee] pl-9 xl:pl-11">
                    <span className="font-medium text-black ">{u.name}</span>
                  </td>
                  <td className="border-b border-[#eee] ">{u.email}</td>
                  <td className="border-b border-[#eee] ">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] ">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${
                      u.status === "active" ? "border-success text-success" : "border-gray-500 text-gray-500"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] text-sm text-gray-500 ">
                    {u.lastLogin}
                  </td>
                  <td className="border-b border-[#eee] text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        className="inline-flex items-center justify-center rounded px-2 py-1.5 text-sm font-medium hover:bg-gray-1 "
                        onClick={() => openEdit(u)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded px-2 py-1.5 text-sm font-medium hover:bg-gray-1 "
                        onClick={() => {
                          setDeletingUser(u)
                          setDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={99} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-lg rounded-lg border border-stroke bg-white shadow-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-stroke px-5 py-3 ">
              <h3 className="text-base font-semibold text-black ">
                {editingUser ? "Edit User" : "Add User"}
              </h3>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                <div>
                  <label className="compact-label">Name</label>
                  <input
                    className="compact-input w-full"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="compact-label">Email</label>
                  <input
                    type="email"
                    className="compact-input w-full"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@email.com"
                  />
                </div>
                <div>
                  <label className="compact-label">Password</label>
                  <input
                    type="password"
                    className="compact-input w-full"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={editingUser ? "Leave blank if unchanged" : "Min. 8 characters"}
                  />
                </div>
                <div>
                  <label className="compact-label">Role</label>
                  <select
                    className="compact-input w-full"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="compact-label mb-0">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormStatus(formStatus === "active" ? "inactive" : "active")}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      formStatus === "active" ? "bg-success" : "bg-gray-3"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition ${
                        formStatus === "active" ? "translate-x-[18px]" : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-body -mt-1">{formStatus === "active" ? "Active" : "Inactive"}</p>
                {formError && (
                  <div className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                    {formError}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  className="inline-flex items-center justify-center rounded border border-stroke px-5 py-1.5 text-sm font-medium hover:bg-gray-1"
                  onClick={() => setFormOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center justify-center rounded bg-primary px-5 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
          onClick={() => setDeleteOpen(false)}
        >
          <div
            className="mx-4 w-full max-w-md rounded-lg border border-stroke bg-white shadow-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-stroke px-5 py-3 ">
              <h3 className="text-base font-semibold text-black ">Delete User</h3>
              <p className="text-sm text-body">
                Are you sure you want to delete user <strong>{deletingUser?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-5">
              <button
                className="inline-flex items-center justify-center rounded border border-stroke px-6 py-2 text-sm font-medium hover:bg-gray-1"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center justify-center rounded bg-danger px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}
