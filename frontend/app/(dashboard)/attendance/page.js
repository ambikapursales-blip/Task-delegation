"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { attendanceAPI } from "@/lib/api";

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("month");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAll();
      setRecords(response.data?.records || []);
    } catch (err) {
      setError("Failed to load attendance records");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    try {
      setError("");
      setSuccess("");
      await attendanceAPI.mark({
        date: new Date(),
        status: "Present",
      });
      setSuccess("Attendance marked successfully!");
      fetchAttendance();
    } catch (err) {
      setError("Failed to mark attendance");
    }
  };

  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const totalDays = records.length;
  const attendancePercentage =
    totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  const isHROrAdmin = ["HR", "Admin"].includes(user?.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground mt-1">
          Your attendance records and statistics
        </p>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-600">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Present Days
              </p>
              <p className="text-3xl font-bold text-green-700">
                {presentCount}
              </p>
              <p className="text-xs text-muted-foreground">days present</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Absent Days
              </p>
              <p className="text-3xl font-bold text-red-700">{absentCount}</p>
              <p className="text-xs text-muted-foreground">days absent</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Total Days
              </p>
              <p className="text-3xl font-bold">{totalDays}</p>
              <p className="text-xs text-muted-foreground">record days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-xs text-blue-700 font-medium">Attendance %</p>
              <p className="text-3xl font-bold text-blue-700">
                {attendancePercentage}%
              </p>
              <p className="text-xs text-blue-600">of working days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mark Attendance Button */}
      {!isHROrAdmin && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  Mark Today's Attendance
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Button
                onClick={handleMarkAttendance}
                className="bg-[#0F6E56] hover:bg-[#0C5A45] text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Present
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your daily attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">
              Loading records...
            </p>
          ) : records.length === 0 ? (
            <Alert>
              <AlertDescription>No attendance records yet</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {records.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    {record.status === "Present" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      {record.loginTime && (
                        <p className="text-xs text-muted-foreground">
                          Login:{" "}
                          {new Date(record.loginTime).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge
                    className={
                      record.status === "Present"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
