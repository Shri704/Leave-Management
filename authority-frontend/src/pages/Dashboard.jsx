import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { getPendingLeaves, getProcessedLeaves, getTeacherStatistics, approveLeave, rejectLeave } from "../api/leaveApi";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [processedLeaves, setProcessedLeaves] = useState([]);
  const [teacherStats, setTeacherStats] = useState([]);
  const [filteredStats, setFilteredStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "processed", or "statistics"
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchAllData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [pendingRes, processedRes, statsRes] = await Promise.all([
        getPendingLeaves(),
        getProcessedLeaves(),
        getTeacherStatistics()
      ]);
      setPendingLeaves(pendingRes.data);
      setProcessedLeaves(processedRes.data);
      const stats = statsRes.data.statistics || [];
      setTeacherStats(stats);
      setFilteredStats(stats);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter teacher statistics based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStats(teacherStats);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = teacherStats.filter(stat => 
      stat.teacherName.toLowerCase().includes(query) ||
      stat.employeeId.toLowerCase().includes(query) ||
      stat.teacherEmail.toLowerCase().includes(query) ||
      stat.department.toLowerCase().includes(query)
    );
    setFilteredStats(filtered);
  }, [searchQuery, teacherStats]);

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await approveLeave(id);
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve leave");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Are you sure you want to reject this leave request?")) {
      return;
    }
    setProcessing(id);
    try {
      await rejectLeave(id);
      await fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject leave");
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      HOD: "Head of Department",
      DEAN: "Dean",
      PRINCIPAL: "Principal"
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            ✓ Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
            ✗ Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
            {status.replace("_", " ")}
          </span>
        );
    }
  };

  const renderLeaveCard = (leave, index, showActions = true) => {
    const borderColor = leave.status === "APPROVED" 
      ? "border-green-500" 
      : leave.status === "REJECTED" 
      ? "border-red-500" 
      : "border-indigo-500";

    return (
      <motion.div
        key={leave._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 + index * 0.05 }}
        whileHover={{ scale: 1.01 }}
        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${borderColor}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  leave.status === "APPROVED" ? "bg-green-100" : 
                  leave.status === "REJECTED" ? "bg-red-100" : 
                  "bg-indigo-100"
                }`}>
                  <span className={`font-bold text-lg ${
                    leave.status === "APPROVED" ? "text-green-600" : 
                    leave.status === "REJECTED" ? "text-red-600" : 
                    "text-indigo-600"
                  }`}>
                    {leave.teacherId?.name?.charAt(0) || "T"}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {leave.teacherId?.name || "Unknown Teacher"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {leave.teacherId?.email || "N/A"}
                  </p>
                </div>
              </div>
              {getStatusBadge(leave.status)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Leave Type</p>
                <p className="font-semibold text-gray-900">
                  {leave.leaveType}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">From Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(leave.fromDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">To Date</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(leave.toDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Days</p>
                <p className="font-semibold text-gray-900">
                  {leave.finalDays} days
                  {leave.holidaysExcluded > 0 && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({leave.holidaysExcluded} holidays excluded)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {leave.reason && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {leave.reason}
                </p>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3">
              Applied on {formatDate(leave.appliedAt)}
            </p>
          </div>

          {showActions && (
            <div className="flex gap-3 md:flex-col md:w-32">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleApprove(leave._id)}
                disabled={processing === leave._id}
                className="flex-1 md:w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === leave._id ? "Processing..." : "Approve"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReject(leave._id)}
                disabled={processing === leave._id}
                className="flex-1 md:w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing === leave._id ? "Processing..." : "Reject"}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getRoleDisplay(user?.role)} Dashboard
          </h1>
          <p className="text-gray-600">
            Review and manage leave requests
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-1 inline-flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "pending"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Pending ({pendingLeaves.length})
            </button>
            <button
              onClick={() => setActiveTab("processed")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "processed"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Processed ({processedLeaves.length})
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "statistics"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Teacher Statistics ({teacherStats.length})
            </button>
          </div>
        </motion.div>

        {/* Pending Leaves Tab */}
        {activeTab === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {pendingLeaves.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-6xl mb-4"
                >
                  ✅
                </motion.div>
                <p className="text-gray-500 text-lg font-semibold">
                  No pending leave requests
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  All leave requests have been processed
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLeaves.map((leave, index) => renderLeaveCard(leave, index, true))}
              </div>
            )}
          </motion.div>
        )}

        {/* Processed Leaves Tab */}
        {activeTab === "processed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {processedLeaves.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-6xl mb-4"
                >
                  📋
                </motion.div>
                <p className="text-gray-500 text-lg font-semibold">
                  No processed leaves yet
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Processed leaves will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {processedLeaves.map((leave, index) => renderLeaveCard(leave, index, false))}
              </div>
            )}
          </motion.div>
        )}

        {/* Teacher Statistics Tab */}
        {activeTab === "statistics" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search Bar */}
            {teacherStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by Employee ID, Name, Email, or Department..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="text-sm text-gray-500 mt-2">
                      Found {filteredStats.length} result{filteredStats.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {filteredStats.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-6xl mb-4"
                >
                  {teacherStats.length === 0 ? "📊" : "🔍"}
                </motion.div>
                <p className="text-gray-500 text-lg font-semibold">
                  {teacherStats.length === 0 
                    ? "No teacher statistics available"
                    : "No results found"}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {teacherStats.length === 0
                    ? "Statistics will appear here once teachers apply for leaves"
                    : "Try a different search term"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStats.map((stat, index) => (
                  <motion.div
                    key={stat.teacherId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Teacher Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {stat.teacherName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {stat.teacherName}
                              </h3>
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold">
                                ID: {stat.employeeId}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {stat.teacherEmail}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Department: {stat.department}
                            </p>
                          </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Total Leaves</p>
                            <p className="text-2xl font-bold text-blue-600">{stat.totalLeaves}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Approved</p>
                            <p className="text-2xl font-bold text-green-600">{stat.approvedLeaves}</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{stat.rejectedLeaves}</p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stat.pendingLeaves}</p>
                          </div>
                        </div>

                        {/* Days Summary */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Total Days</p>
                            <p className="text-xl font-bold text-gray-900">{stat.totalDays} days</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Approved Days</p>
                            <p className="text-xl font-bold text-green-600">{stat.approvedDays} days</p>
                          </div>
                        </div>

                        {/* Leave Type Breakdown */}
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 mb-2 font-semibold">Leave Type Breakdown:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(stat.byType).map(([type, data]) => (
                              <div key={type} className="bg-gray-50 rounded-lg p-2">
                                <p className="text-xs text-gray-500">{type}</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {data.count} leaves ({data.days} days)
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
