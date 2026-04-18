"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { eventsAPI, usersAPI, api } from "@/lib/api";
import { Loading } from "@/components/loading";
import {
  Plus,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Users,
  Clock,
  Edit,
  Trash2,
  X,
  Check,
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
        <div
          className={`mx-6 mt-4 flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
            alert.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          }`}
        >
          {alert.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <BadgeCheck className="w-4 h-4 shrink-0" />
          )}
          {alert.msg}
        </div>
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
        <div className="w-full bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 border-b border-stone-100 bg-stone-50 gap-2">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
              {sorted.length} Event{sorted.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {["Upcoming", "Ongoing", "Completed", "Cancelled"].map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 text-xs text-stone-400"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`}
                  />
                  {sorted.filter((e) => e.status === s).length} {s}
                </span>
              ))}
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Calendar className="w-10 h-10 text-stone-200" />
              <p className="text-sm font-medium text-stone-400">
                No events yet
              </p>
              <p className="text-xs text-stone-300">
                Click "New Event" to create your first event
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    {[
                      { field: "title", label: "Event", icon: Calendar },
                      { field: "type", label: "Type", icon: null },
                      { field: "startDate", label: "Start Date", icon: Clock },
                      { field: "status", label: "Status", icon: BadgeCheck },
                      { field: "assignedTo", label: "Attendees", icon: Users },
                      { field: null, label: "", icon: null },
                    ].map(({ field, label, icon: Icon }) => (
                      <th
                        key={label}
                        onClick={() => field && toggleSort(field)}
                        className={`px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap ${
                          field
                            ? "cursor-pointer select-none hover:text-stone-600"
                            : ""
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {Icon && <Icon className="w-3.5 h-3.5" />}
                          {label}
                          {field && <SortIcon field={field} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((event) => (
                    <>
                      <tr
                        key={event._id}
                        className={`border-b border-stone-50 transition-colors ${
                          expandedRow === event._id
                            ? "bg-stone-50"
                            : "hover:bg-stone-50/70"
                        }`}
                      >
                        <td className="px-4 py-3.5 min-w-[150px]">
                          <div>
                            <p className="font-semibold text-stone-800">
                              {event.title}
                            </p>
                            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                              {event.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 min-w-[80px]">
                          <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                            {event.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-stone-500 min-w-[140px]">
                          {fmtDateTime(event.startDate)}
                        </td>
                        <td className="px-4 py-3.5 min-w-[100px]">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[event.status]}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[event.status]}`}
                            />
                            {event.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 min-w-[80px]">
                          <span className="text-xs text-stone-500">
                            {event.assignedTo?.length || 0} attendee
                            {event.assignedTo?.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setExpandedRow(
                                  expandedRow === event._id ? null : event._id,
                                )
                              }
                              className="flex items-center gap-1 text-xs font-medium text-stone-400 hover:text-[#0F6E56] px-2.5 py-1.5 rounded-md hover:bg-emerald-50 transition-colors"
                            >
                              {expandedRow === event._id ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
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

                      {/* Expanded Row */}
                      {expandedRow === event._id && (
                        <tr
                          key={`exp-${event._id}`}
                          className="bg-stone-50/80 border-b border-stone-100"
                        >
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4">
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                                  Description
                                </p>
                                <p className="text-sm text-stone-600 leading-relaxed">
                                  {event.description || "No description"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                                  Time Details
                                </p>
                                <div className="space-y-1 text-sm text-stone-600">
                                  <p>Start: {fmtDateTime(event.startDate)}</p>
                                  <p>End: {fmtDateTime(event.endDate)}</p>
                                </div>
                              </div>
                              {event.location && (
                                <div>
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                                    Location
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-stone-600">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                </div>
                              )}
                              {event.isVirtual && event.meetingLink && (
                                <div>
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                                    Meeting Link
                                  </p>
                                  <a
                                    href={event.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                  >
                                    <Video className="w-4 h-4" />
                                    Join Meeting
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Assigned Users */}
                            {event.assignedTo?.length > 0 && (
                              <div className="pt-4 border-t border-stone-200">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                                  Attendees
                                </p>
                                <div className="space-y-2">
                                  {event.assignedTo.map((assignment) => (
                                    <div
                                      key={assignment.employee?._id}
                                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-stone-200"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                          <span className="text-xs font-bold text-violet-600">
                                            {assignment.employee?.name?.charAt(
                                              0,
                                            )}
                                          </span>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-stone-800">
                                            {assignment.employee?.name}
                                          </p>
                                          <p className="text-xs text-stone-400">
                                            {assignment.employee?.email}
                                          </p>
                                        </div>
                                      </div>
                                      <span
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${RSVP_STATUS[assignment.status]}`}
                                      >
                                        {assignment.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* RSVP Actions for current user */}
                            {!canManage &&
                              event.assignedTo?.some(
                                (a) =>
                                  a.employee?._id === user._id &&
                                  a.status === "Pending",
                              ) && (
                                <div className="pt-4 border-t border-stone-200">
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                                    Your Response
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleRSVP(event._id, "Accepted")
                                      }
                                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                    >
                                      <Check className="w-3.5 h-3.5" /> Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRSVP(event._id, "Declined")
                                      }
                                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" /> Decline
                                    </button>
                                  </div>
                                </div>
                              )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
