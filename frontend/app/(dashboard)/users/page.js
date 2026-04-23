"use client";

import { useState, useEffect } from "react";
import { usersAPI } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Mail, Building2, Edit, Trash2, Phone } from "lucide-react";

const ROLE_STYLES = {
  Admin: {
    badge: "bg-red-50 text-red-700 ring-1 ring-red-200",
    avatar: "bg-red-50 text-red-700",
    bar: "bg-red-400",
  },
  HR: {
    badge: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    avatar: "bg-violet-50 text-violet-700",
    bar: "bg-violet-400",
  },
  Manager: {
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    avatar: "bg-blue-50 text-blue-700",
    bar: "bg-blue-400",
  },
  "Sales Executive": {
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    avatar: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-400",
  },
  Coordinator: {
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    avatar: "bg-amber-50 text-amber-700",
    bar: "bg-amber-400",
  },
};

const DEFAULT_STYLE = {
  badge: "bg-gray-50 text-gray-700 ring-1 ring-gray-200",
  avatar: "bg-gray-100 text-gray-600",
  bar: "bg-gray-400",
};

const FILTERS = [
  "All",
  "Admin",
  "HR",
  "Manager",
  "Sales Executive",
  "Coordinator",
];

function UserCard({ user }) {
  const style = ROLE_STYLES[user.role] || DEFAULT_STYLE;
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${style.bar}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${style.avatar}`}
          >
            {initials}
          </div>
          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${style.badge}`}
          >
            {user.role}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-3 leading-snug">
          {user.name}
        </h3>

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-gray-500 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{user.email}</span>
          </div>

          {user.department && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span>{user.department}</span>
            </div>
          )}

          {user.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg px-3 py-2 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    activeFilter === "All"
      ? users
      : users.filter((u) => u.role === activeFilter);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Team Members
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organisation users
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{filtered.length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {activeFilter === "All" ? "Total Users" : activeFilter}
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((role) => (
          <button
            key={role}
            onClick={() => setActiveFilter(role)}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all ${
              activeFilter === role
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">No users found</p>
        </div>
      )}
    </div>
  );
}
