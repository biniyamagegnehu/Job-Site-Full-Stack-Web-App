import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { motion } from 'framer-motion';
import { Users, Briefcase, Building, Clock, CheckCircle, XCircle, ChevronRight, Activity, BarChart3, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [approving, setApproving] = useState({});
  const [approvingJobs, setApprovingJobs] = useState({});
  const [rejectingJobs, setRejectingJobs] = useState({});

  useEffect(() => {
    fetchDashboardData();
    fetchPendingEmployers();
    fetchPendingJobs();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getDashboard();
      setDashboardData(response.data?.data?.dashboard);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEmployers = async () => {
    try {
      const response = await adminApi.getPendingEmployers();
      setPendingEmployers(response.data?.data?.employers || []);
    } catch (err) {
      console.error('Error fetching pending employers:', err);
    }
  };

  const fetchPendingJobs = async () => {
    try {
      const response = await adminApi.getPendingJobs();
      const jobs = response.data?.data?.jobs || [];
      setPendingJobs(jobs);
    } catch (err) {
      console.error('Error fetching pending jobs:', err);
    }
  };

  const handleApproveEmployer = async (employerId) => {
    setApproving(prev => ({ ...prev, [employerId]: true }));
    try {
      await adminApi.approveEmployer(employerId);
      setPendingEmployers(prev => prev.filter(employer => employer.id !== employerId));
      fetchDashboardData();
    } catch (err) {
      alert('Failed to approve employer');
    } finally {
      setApproving(prev => ({ ...prev, [employerId]: false }));
    }
  };

  const handleApproveJob = async (jobId) => {
    setApprovingJobs(prev => ({ ...prev, [jobId]: true }));
    try {
      await adminApi.approveJob(jobId);
      setPendingJobs(prev => prev.filter(j => j.id !== jobId));
      fetchDashboardData();
    } catch (err) {
      alert('Failed to approve job');
    } finally {
      setApprovingJobs(prev => ({ ...prev, [jobId]: false }));
    }
  };

  const handleRejectJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to reject this job?')) return;
    setRejectingJobs(prev => ({ ...prev, [jobId]: true }));
    try {
      await adminApi.rejectJob(jobId);
      setPendingJobs(prev => prev.filter(j => j.id !== jobId));
      fetchDashboardData();
    } catch (err) {
      alert('Failed to reject job');
    } finally {
      setRejectingJobs(prev => ({ ...prev, [jobId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-blue-600 font-black tracking-widest text-xs uppercase animate-pulse">Syncing Portal Systems...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: dashboardData?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Live Jobs', value: dashboardData?.totalJobs || 0, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Organizations', value: dashboardData?.totalEmployers || 0, icon: Building, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Needs Review', value: pendingEmployers.length + pendingJobs.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Admin <span className="text-blue-600">Console</span></h1>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">JobPortal Central Management</p>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6"
          >
            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Approvals */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pending Employers */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Organization Requests</h2>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                {pendingEmployers.length} PENDING
              </span>
            </div>

            {pendingEmployers.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No pending applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingEmployers.map((emp) => (
                  <motion.div
                    layout
                    key={emp.id}
                    className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{emp.companyName || `${emp.firstName} ${emp.lastName}`}</h4>
                      <p className="text-slate-400 font-bold text-sm tracking-tight">{emp.email}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveEmployer(emp.id)}
                        disabled={approving[emp.id]}
                        className="px-6 py-2 bg-blue-600 text-white font-black text-xs rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-100"
                      >
                        {approving[emp.id] ? 'UPDATING...' : 'APPROVE'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Jobs */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Job Review Queue</h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                {pendingJobs.length} WAITING
              </span>
            </div>

            {pendingJobs.length === 0 ? (
              <div className="py-12 text-center">
                <Briefcase className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No jobs in queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingJobs.map((job) => (
                  <motion.div
                    layout
                    key={job.id}
                    className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{job.title}</h4>
                      <p className="text-slate-400 text-xs uppercase font-black tracking-widest mt-1">From: {job.employerCompanyName || 'Anonymous'}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveJob(job.id)}
                        disabled={approvingJobs[job.id]}
                        className="px-5 py-2 bg-indigo-600 text-white font-black text-[10px] rounded-xl hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg shadow-indigo-100"
                      >
                        {approvingJobs[job.id] ? 'SYNC...' : 'PUBLISH'}
                      </button>
                      <button
                        onClick={() => handleRejectJob(job.id)}
                        disabled={rejectingJobs[job.id]}
                        className="p-2 bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm h-full">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Resources</h2>
            <div className="grid gap-3">
              <QuickLink
                to="/admin/users"
                title="User Control"
                desc="Manage all platform entities"
                icon={Users}
                color="text-blue-600"
                bg="bg-blue-50"
              />
              <QuickLink
                to="/admin/jobs"
                title="Job Registry"
                desc="Manage live and archived jobs"
                icon={Briefcase}
                color="text-indigo-600"
                bg="bg-indigo-50"
              />
              <QuickLink
                to="/admin/analytics"
                title="Analytics"
                desc="Platform performance metrics"
                icon={BarChart3}
                color="text-sky-600"
                bg="bg-sky-50"
              />
              <div className="p-6 rounded-2xl border border-slate-50 bg-slate-25 opacity-40 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <Settings className="w-8 h-8 text-slate-300" />
                  <div>
                    <h4 className="font-black text-slate-300 uppercase tracking-widest text-sm">Settings</h4>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Temporarily Offline</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickLink = ({ to, title, desc, icon: Icon, color, bg }) => (
  <Link to={to} className="group p-5 rounded-2xl border border-slate-50 bg-white hover:bg-slate-50 hover:border-slate-100 transition-all duration-200 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{desc}</p>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
  </Link>
);

export default AdminDashboard;