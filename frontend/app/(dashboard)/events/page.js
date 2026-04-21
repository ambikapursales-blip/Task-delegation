"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { eventsAPI, usersAPI, api } from "@/lib/api";
import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import Toast from "@/components/Toast";
import {
  Plus,
  Calendar,
  Link as LinkIcon,
  Users,
  Clock,
  Edit,
  Trash2,
  X,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Video,
  Building2,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

const STATUS_STYLES = {
  Upcoming: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Ongoing: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Completed: "bg-stone-100 text-stone-700 ring-1 ring-stone-300",
  Cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const STATUS_DOT = {
  Upcoming: "bg-blue-500",
  Ongoing: "bg-emerald-500",
  Completed: "bg-stone-400",
  Cancelled: "bg-red-500",
};

const RSVP_STATUS = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Accepted: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Declined: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Attended: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Absent: "bg-stone-100 text-stone-700 ring-1 ring-stone-300",
};

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [alert, setAlert] = useState(null);
  const [sortField, setSortField] = useState("startDate");
  const [sortDir, setSortDir] = useState("asc");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Meeting",
    startDate: "",
    endDate: "",
    location: "",
    isVirtual: false,
    meetingLink: "",
    assignedTo: [],
    priority: "Medium",
    tags: [],
  });

  const canManage = ["Admin", "Manager", "HR"].includes(user?.role);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, usersRes] = await Promise.all([
        eventsAPI.getAll(),
        canManage
          ? usersAPI.getAll()
          : Promise.resolve({ data: { users: [] } }),
      ]);
      setEvents(eventsRes.data?.events || []);
      setUsers(usersRes.data?.users || []);
    } catch {
      setAlert({ type: "error", msg: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setAlert({
        type: "error",
        msg: "Title, start date, and end date are required",
      });
      return;
    }

    try {
      if (editingEvent) {
        await eventsAPI.update(editingEvent._id, formData);
        setAlert({ type: "success", msg: "Event updated successfully!" });
      } else {
        await eventsAPI.create(formData);
        setAlert({ type: "success", msg: "Event created successfully!" });
      }
      resetForm();
      fetchData();
    } catch {
      setAlert({ type: "error", msg: "Failed to save event" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventsAPI.delete(id);
      setAlert({ type: "success", msg: "Event deleted successfully!" });
      fetchData();
    } catch {
      setAlert({ type: "error", msg: "Failed to delete event" });
    }
  };

  const handleRSVP = async (eventId, status) => {
    try {
      await api.put(`/events/${eventId}/rsvp`, { status });
      setAlert({ type: "success", msg: "RSVP updated!" });
      fetchData();
    } catch {
      setAlert({ type: "error", msg: "Failed to update RSVP" });
    }
  };

  const handleMarkComplete = async (eventId) => {
    try {
      await eventsAPI.update(eventId, { status: "Completed" });
      setAlert({ type: "success", msg: "Event marked as completed!" });
      fetchData();
    } catch {
      setAlert({ type: "error", msg: "Failed to mark event as completed" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "Meeting",
      startDate: "",
      endDate: "",
      location: "",
      isVirtual: false,
      meetingLink: "",
      assignedTo: [],
      priority: "Medium",
      tags: [],
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronDown className="w-3 h-3 text-stone-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-[#0F6E56]" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[#0F6E56]" />
    );
  };

  const sorted = [...events].sort((a, b) => {
    let av = a[sortField],
      bv = b[sortField];
    if (sortField === "startDate" || sortField === "endDate") {
      av = new Date(av);
      bv = new Date(bv);
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const fmtDateTime = (d) =>
    new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <Loading />;

  return (
    <div className="w-full min-h-screen bg-stone-50">
      {/* Header */}
      <div className="w-full bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Events</h1>
            <p className="text-sm text-stone-500 mt-1">
              Manage organizational events and RSVPs
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="gap-2 bg-[#0F6E56] text-white hover:bg-[#0a4a3d] w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          )}
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <Toast
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="w-full px-6 py-5">
        {/* Event Form */}
        {showForm && (
          <div className="w-full bg-white border border-stone-200 rounded-xl mb-5 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
              <h2 className="text-base font-bold text-stone-800">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Event Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Event Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Training">Training</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Team Building">Team Building</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Start Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    End Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                    placeholder="Physical location (if not virtual)"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isVirtual"
                    checked={formData.isVirtual}
                    onChange={(e) =>
                      setFormData({ ...formData, isVirtual: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300 text-[#0F6E56] focus:ring-[#0F6E56]"
                  />
                  <label htmlFor="isVirtual" className="text-sm text-stone-600">
                    Virtual Event
                  </label>
                </div>
                {formData.isVirtual && (
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingLink: e.target.value,
                        })
                      }
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 resize-y focus:outline-none focus:border-[#0F6E56] focus:bg-white transition-colors"
                    placeholder="Event description and agenda..."
                  />
                </div>
                {canManage && (
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                      Assign To
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {users.map((u) => (
                        <label
                          key={u._id}
                          className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedTo.includes(u._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  assignedTo: [...formData.assignedTo, u._id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedTo: formData.assignedTo.filter(
                                    (id) => id !== u._id,
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 rounded border-stone-300 text-[#0F6E56] focus:ring-[#0F6E56]"
                          />
                          <span className="text-sm text-stone-700">
                            {u.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 hover:text-stone-700 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-[#0F6E56] hover:bg-[#0a5240] text-white rounded-lg transition-colors w-full sm:w-auto"
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
            <h2 className="text-lg font-bold text-slate-800">
              Events Overview
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Showing {sorted.length} events
            </p>
          </div>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <img
                src="/nodata.gif"
                alt="No data"
                className="w-32 h-32 object-contain"
              />
              <p className="text-slate-500 font-medium">No events found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Attendees
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((event) => {
                    const getPriorityColor = (priority) => {
                      const colors = {
                        High: "bg-red-100 text-red-800 border-red-300",
                        Medium:
                          "bg-yellow-100 text-yellow-800 border-yellow-300",
                        Low: "bg-green-100 text-green-800 border-green-300",
                      };
                      return (
                        colors[priority] ||
                        "bg-gray-100 text-gray-800 border-gray-300"
                      );
                    };

                    const rowBgColor =
                      event.status === "Completed"
                        ? "bg-green-50"
                        : event.status === "Ongoing"
                          ? "bg-blue-50"
                          : event.status === "Cancelled"
                            ? "bg-red-50"
                            : event.priority === "High"
                              ? "bg-orange-50"
                              : event.priority === "Medium"
                                ? "bg-yellow-100"
                                : "bg-white";

                    return (
                      <tr
                        key={event._id}
                        className={`${rowBgColor} border-b border-slate-100 hover:opacity-80 transition-opacity`}
                      >
                        <td className="px-4 py-3 max-w-xs">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm truncate">
                              {event.title}
                            </p>
                            {event.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 truncate">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {event.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600">
                            {fmtDateTime(event.startDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[event.status]}`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(event.priority)}`}
                          >
                            {event.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {event.assignedTo && event.assignedTo.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {event.assignedTo
                                  .slice(0, 2)
                                  .map((user, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200"
                                      title={
                                        typeof user === "object"
                                          ? user.name
                                          : user
                                      }
                                    >
                                      {typeof user === "object"
                                        ? user.name
                                        : user}
                                    </span>
                                  ))}
                                {event.assignedTo.length > 2 && (
                                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                    +{event.assignedTo.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                No attendees
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {event.status !== "Completed" && (
                              <button
                                onClick={() => handleMarkComplete(event._id)}
                                className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Mark as completed"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canManage && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingEvent(event);
                                    setFormData(event);
                                    setShowForm(true);
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(event._id)}
                                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
