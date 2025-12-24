import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import employerApi from '../../api/employerApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Users, Settings, Trash2, Power, PowerOff, ShieldAlert, ChevronRight, Calendar, Search } from 'lucide-react';

const EmployerJobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const response = await employerApi.getJobs(page, 20);
      const content = response.data?.data?.jobs || [];
      setJobs(content);
    } catch (err) {
      console.error('Error fetching employer jobs:', err);
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    setBusy(prev => ({ ...prev, [id]: true }));
    try {
      await employerApi.deleteJob(id);
      await fetchJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      alert(err.response?.data?.message || 'Failed to delete job');
    } finally {
      setBusy(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleJobStatus = async (job) => {
    setBusy(prev => ({ ...prev, [job.id]: true }));
    try {
      await employerApi.toggleJobStatus(job.id, !job.isActive);
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isActive: !j.isActive } : j));
    } catch (err) {
      console.error('Error toggling job status:', err);
      alert(err.response?.data?.message || 'Failed to update job status');
    } finally {
      setBusy(prev => ({ ...prev, [job.id]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Job <span className="text-blue-600">Inventory</span></h1>
          <p className="text-slate-400 font-bold text-xs uppercase mt-2 tracking-widest">Manage your organization's open roles</p>
        </div>
        <Link
          to="/employer/jobs/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> BROADCAST NEW ROLE
        </Link>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem label="Total Postings" value={jobs.length} color="text-slate-900" bg="bg-slate-50" />
        <StatItem label="Live Broadcasts" value={jobs.filter(j => j.active).length} color="text-green-600" bg="bg-green-50" />
        <StatItem label="Candidate Pool" value={jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0)} color="text-blue-600" bg="bg-blue-50" />
        <StatItem label="Inactive" value={jobs.filter(j => !j.active).length} color="text-red-500" bg="bg-red-50" />
      </div>

      {loading ? (
        <div className="py-40 text-center">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-blue-600 font-black text-xs uppercase tracking-widest animate-pulse">Synchronizing Job Data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-10 rounded-[2.5rem] text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 uppercase">Operation Failed</h3>
          <p className="text-red-600 font-bold text-sm mt-2">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Position Details</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-center">Talent</th>
                  <th className="px-8 py-5">Timelines</th>
                  <th className="px-8 py-5 text-right">Control Registry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <p className="text-slate-300 font-black text-xs uppercase tracking-widest">No job postings detected in your cluster</p>
                    </td>
                  </tr>
                ) : jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{job.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref ID: {job.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${job.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                        {(job.isActive ? 'Live' : 'Hidden')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-slate-900">
                      <div className="flex flex-col items-center">
                        <span className="text-lg leading-none">{job.applicationCount || 0}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Applied</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Calendar className="w-3 h-3" /> Published: {formatDate(job.createdAt)}
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          Deadline: {formatDate(job.applicationDeadline)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        ><Search className="w-4 h-4" /></Link>

                        <Link
                          to={`/employer/jobs/${job.id}/edit`}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        ><Settings className="w-4 h-4" /></Link>

                        <button
                          onClick={() => toggleJobStatus(job)}
                          disabled={busy[job.id]}
                          className={`p-3 rounded-xl transition-all ${job.isActive ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          title={job.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {busy[job.id] ? <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" /> : (job.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />)}
                        </button>

                        <button
                          onClick={() => handleDelete(job.id)}
                          disabled={busy[job.id]}
                          className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                          title="Delete Listing"
                        >
                          {busy[job.id] ? '...' : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, value, color, bg }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className={`text-3xl font-black ${color}`}>{value}</h3>
  </div>
);

export default EmployerJobList;