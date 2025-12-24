import { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Trash2, Power, PowerOff, Search, MapPin, Globe, ChevronLeft, ChevronRight, AlertTriangle, Building, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobManagement = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
    });
    const [actionStatus, setActionStatus] = useState({ loading: false, id: null });

    const fetchJobs = async (page = 0) => {
        setLoading(true);
        try {
            const response = await adminApi.listJobs(page, pagination.size);
            const { data } = response.data;
            setJobs(data.jobs || []);
            setPagination(prev => ({
                ...prev,
                page: data.currentPage,
                totalPages: data.totalPages,
                totalElements: data.totalItems
            }));
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDeleteJob = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this job listing?')) return;

        setActionStatus({ loading: true, id });
        try {
            await adminApi.deleteJob(id);
            setJobs(prev => prev.filter(j => j.id !== id));
        } catch (err) {
            alert('Deletion Failed');
        } finally {
            setActionStatus({ loading: false, id: null });
        }
    };

    const handleToggleStatus = async (job) => {
        setActionStatus({ loading: true, id: job.id });
        try {
            if (job.isActive) {
                await adminApi.deactivateJob(job.id);
                setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isActive: false } : j));
            } else {
                await adminApi.approveJob(job.id);
                setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isActive: true } : j));
            }
        } catch (err) {
            alert('Status update failed');
        } finally {
            setActionStatus({ loading: false, id: null });
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchJobs(newPage);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.employerCompanyName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Job <span className="text-indigo-600">Inventory</span></h1>
                    <p className="text-slate-400 font-bold text-xs uppercase mt-2 tracking-widest">Master registry of all platform job listings</p>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by title or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full input-futuristic pl-12 shadow-sm text-sm"
                    />
                </div>
            </header>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm border-l-8 border-l-blue-600">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Listings</p>
                    <h3 className="text-3xl font-black text-slate-900">{pagination.totalElements}</h3>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm border-l-8 border-l-green-600">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Broadcasts</p>
                    <h3 className="text-3xl font-black text-slate-900">{jobs.filter(j => j.active).length}</h3>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm border-l-8 border-l-red-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inactive / Pending</p>
                    <h3 className="text-3xl font-black text-slate-900">{jobs.filter(j => !j.active).length}</h3>
                </div>
            </div>

            {loading ? (
                <div className="py-40 text-center">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-indigo-600 font-black text-xs uppercase tracking-widest animate-pulse">Synchronizing database...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredJobs.map((job, idx) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:shadow-lg transition-all"
                            >
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${job.isActive ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <Briefcase className={`w-6 h-6 ${job.isActive ? 'text-green-600' : 'text-red-500'}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h4>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <Building className="w-3.5 h-3.5" /> {job.employerCompanyName || 'Top Organization'}
                                            </p>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5" /> {job.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                                    <div className="flex flex-col items-end mr-4 hidden md:flex">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${job.isActive ? 'text-green-600' : 'text-red-500'}`}>
                                            {job.isActive ? 'Live' : 'Hidden'}
                                        </span>
                                        <span className="text-[10px] text-slate-300 font-bold uppercase mt-1">Ref No: {job.id.toString().padStart(4, '0')}</span>
                                    </div>

                                    <button
                                        onClick={() => handleToggleStatus(job)}
                                        disabled={actionStatus.loading && actionStatus.id === job.id}
                                        className={`p-3 rounded-xl transition-all shadow-sm ${job.isActive ? 'bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                                        title={job.isActive ? 'Deactivate Job' : 'Approve Job'}
                                    >
                                        {job.isActive ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={() => handleDeleteJob(job.id)}
                                        disabled={actionStatus.loading && actionStatus.id === job.id}
                                        className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
                                        title="View Details"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredJobs.length === 0 && (
                        <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
                            <AlertTriangle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No records matching your search</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-6 pt-12 pb-20">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 0}
                        className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:shadow-lg disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="bg-slate-100 px-8 py-3 rounded-2xl flex items-center font-black text-slate-600 tracking-widest text-sm">
                        PAGE {(pagination.page + 1)} / {pagination.totalPages}
                    </div>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages - 1}
                        className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:shadow-lg disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default JobManagement;
