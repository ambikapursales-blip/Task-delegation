"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usersAPI } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Users, Mail, Building2, Edit, Trash2 } from "lucide-react";

const roleColors = {
  Admin: "bg-red-100 text-red-800",
  HR: "bg-purple-100 text-purple-800",
  Manager: "bg-blue-100 text-blue-800",
  "Sales Executive": "bg-green-100 text-green-800",
  Coordinator: "bg-yellow-100 text-yellow-800",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your organization users
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user._id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0F6E56] to-[#0a795d] flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <Badge className={roleColors[user.role] || ""}>
                  {user.role}
                </Badge>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">{user.name}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <p className="truncate">{user.email}</p>
                  </div>

                  {user.department && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <p>{user.department}</p>
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <p>{user.phone}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-[#e02121] text-white hover:bg-[#8a2a0a]"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No users found
          </CardContent>
        </Card>
      )}
    </div>
  );
}
