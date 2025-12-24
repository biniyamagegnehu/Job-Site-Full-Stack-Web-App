import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jobSeekerExtendedApi from '../../api/jobSeekerExtendedApi';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, Filter, Search, Building, Calendar, ShieldCheck, Briefcase } from 'lucide-react';

const JobSeekerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await jobSeekerExtendedApi.getApplications();
      const apps = res.data?.data?.applications || [];
      setApplications(apps);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING': return { label: 'Submitted', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock };
      case 'REVIEWED': return { label: 'Under Review', color: 'text-amber-600', bg: 'bg-amber-50', icon: Search };
      case 'SHORTLISTED': return { label: 'Shortlisted', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: ShieldCheck };
      case 'ACCEPTED': return { label: 'Offer Received', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle };
      case 'REJECTED': return { label: 'Not Selected', color: 'text-red-500', bg: 'bg-red-50', icon: XCircle };
      default: return { label: status, color: 'text-slate-500', bg: 'bg-slate-50', icon: FileText };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  const stats = [
    { label: 'Total', value: applications.length, color: 'text-slate-900', bg: 'bg-slate-50' },
    { label: 'Pending', value: applications.filter(a => a.status === 'PENDING').length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Review', value: applications.filter(a => a.status === 'REVIEWED').length, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Shortlist', value: applications.filter(a => a.status === 'SHORTLISTED').length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Accepted', value: applications.filter(a => a.status === 'ACCEPTED').length, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'REJECTED').length, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-blue-600 font-black tracking-widest text-xs uppercase animate-pulse">Syncing Application Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">My <span className="text-blue-600">Applications</span></h1>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Track your career progression and role status</p>
        </motion.div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className={`text-2xl font-black ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'PENDING', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
                }`}
            >
              {f === 'all' ? 'All Records' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Grid/List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Role Reference</th>
                <th className="px-8 py-5">Organization</th>
                <th className="px-8 py-5">Timeline</th>
                <th className="px-8 py-5">Current Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto text-slate-300">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="font-black text-xs uppercase tracking-widest">No matching application records detected</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const status = getStatusConfig(app.status);
                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">
                            {app.jobTitle}
                          </h4>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-xs">
                          <Building className="w-4 h-4 text-slate-300" /> {app.employerCompanyName}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" /> Applied: {formatDate(app.applicationDate)}
                          </div>
                          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                            Updated: {formatDate(app.lastUpdated)}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${status.bg} ${status.color} rounded-full border border-current/10`}>
                          <status.icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pro-Tips */}
      <footer className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-200">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-black uppercase tracking-tight">Boost your chances</h3>
          <p className="text-blue-100 font-medium text-sm leading-relaxed max-w-md">Ensure your profile is 100% complete and your CV is updated before applying to premium roles.</p>
        </div>
        <Link to="/job-seeker/profile" className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all">
          Update My Profile
        </Link>
      </footer>
    </div>
  );
};

export default JobSeekerApplications;