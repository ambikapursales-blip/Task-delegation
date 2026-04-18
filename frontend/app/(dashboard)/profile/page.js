"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { authAPI } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Edit, CheckCircle, X } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
    avatar: user?.avatar || "",
  });
  const [message, setMessage] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(formData);
      await refreshUser();
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Loading />;

  const roleColors = {
    Admin: "bg-rose-100 text-rose-700 border border-rose-200",
    HR: "bg-violet-100 text-violet-700 border border-violet-200",
    Manager: "bg-blue-100 text-blue-700 border border-blue-200",
    "Sales Executive":
      "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Coordinator: "bg-amber-100 text-amber-700 border border-amber-200",
  };

  const getRoleColor = (role) => {
    return (
      roleColors[role] || "bg-slate-100 text-slate-700 border border-slate-200"
    );
  };

  const getInitialBgColor = (role) => {
    const colorMap = {
      Admin: "from-rose-400 to-rose-600",
      HR: "from-violet-400 to-violet-600",
      Manager: "from-blue-400 to-blue-600",
      "Sales Executive": "from-emerald-400 to-emerald-600",
      Coordinator: "from-amber-400 to-amber-600",
    };
    return colorMap[role] || "from-slate-400 to-slate-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-2">
            Profile
          </h1>
          <p className="text-lg text-slate-600">
            Manage and update your account information
          </p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 flex items-center gap-3 transition-all duration-300 ${
              message.includes("successfully")
                ? "bg-emerald-50 border-l-emerald-500 text-emerald-800"
                : "bg-rose-50 border-l-rose-500 text-rose-800"
            }`}
          >
            {message.includes("successfully") ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <X className="h-5 w-5 flex-shrink-0 text-rose-600" />
            )}
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 md:px-8 py-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Personal Information
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Update your profile details and settings
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isEditing
                  ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Edit
                </>
              )}
            </button>
          </div>

          {/* Card Content */}
          <div className="px-6 md:px-8 py-8">
            {!isEditing ? (
              <div className="space-y-8">
                {/* Avatar and Name */}
                <div className="flex items-center gap-6 pb-8 border-b border-slate-200">
                  <div
                    className={`h-24 w-24 rounded-2xl bg-gradient-to-br ${getInitialBgColor(
                      user.role,
                    )} flex items-center justify-center text-white text-4xl font-bold shadow-md`}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-slate-900">
                      {user.name}
                    </h3>
                    <div className="mt-2">
                      <Badge
                        className={`${getRoleColor(
                          user.role,
                        )} text-sm font-semibold px-3 py-1`}
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Email Address
                    </p>
                    <p className="text-lg text-slate-900 font-medium">
                      {user.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Phone Number
                    </p>
                    <p className="text-lg text-slate-900 font-medium">
                      {user.phone || (
                        <span className="text-slate-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Department
                    </p>
                    <p className="text-lg text-slate-900 font-medium">
                      {user.department || (
                        <span className="text-slate-400">Not set</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Employee ID
                    </p>
                    <p className="text-lg text-slate-900 font-medium font-mono">
                      {user.employeeId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Join Date
                    </p>
                    <p className="text-lg text-slate-900 font-medium">
                      {new Date(user.joinDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="rounded-lg border-slate-300 bg-slate-50 focus:bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="rounded-lg border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="rounded-lg border-slate-300 bg-slate-50 focus:bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="department"
                      className="text-sm font-semibold text-slate-900"
                    >
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="rounded-lg border-slate-300 bg-slate-50 focus:bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400"
                      placeholder="e.g., Engineering, Sales"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-lg font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-lg font-medium text-white bg-[#0F6E56] hover:bg-[#0C5A45] disabled:bg-[#0F6E56]/50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
