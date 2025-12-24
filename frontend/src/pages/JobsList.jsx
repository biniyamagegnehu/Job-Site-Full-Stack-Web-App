import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jobApi from '../api/jobApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Clock, DollarSign, Filter, X, ChevronRight, Globe } from 'lucide-react';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    isRemote: false,
    showFilters: false
  });

  const fetchJobs = async (page = 0, search = '') => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (search.trim() || filters.location || filters.jobType || filters.isRemote) {
        response = await jobApi.searchJobs(search, filters, page, pagination.size);
      } else {
        response = await jobApi.getAllJobs(page, pagination.size);
      }

      const { jobs, totalPages, totalItems, currentPage } = response.data.data;
      setJobs(jobs || []);
      setPagination(prev => ({
        ...prev,
        page: currentPage,
        totalPages,
        totalElements: totalItems,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(0, searchTerm);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchJobs(newPage, searchTerm);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-12">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight"
        >
          Explore <span className="text-blue-600">Career Opportunities</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-slate-500 font-bold uppercase tracking-wider text-xs"
        >
          Discovering {pagination.totalElements} active openings for you.
        </motion.p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-12 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, role, or company..."
              className="w-full input-futuristic pl-12 shadow-sm"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className={`p-4 rounded-xl bg-white border transition-all ${filters.showFilters ? 'border-blue-600 text-blue-600' : 'border-slate-200 text-slate-400 hover:border-blue-300'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {loading ? 'Searching...' : 'Find Jobs'}
            </button>
          </div>
        </form>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {filters.showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-white rounded-2xl border border-slate-100 shadow-xl mt-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Remote, NY, London..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full input-futuristic text-sm pl-10 h-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Employment Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                    className="w-full input-futuristic text-sm h-10"
                  >
                    <option value="">All Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="FREELANCE">Freelance</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilters({ location: '', jobType: '', isRemote: false, showFilters: true });
                      setSearchTerm('');
                    }}
                    className="flex items-center gap-2 text-xs font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest pb-3 ml-2"
                  >
                    <X className="w-4 h-4" /> Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl h-64 p-8 animate-pulse">
              <div className="w-2/3 h-4 bg-slate-100 rounded mb-4" />
              <div className="w-1/2 h-4 bg-slate-100 rounded mb-8" />
              <div className="w-full h-12 bg-slate-50 rounded" />
            </div>
          ))
        ) : jobs.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <Globe className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">No Jobs Found</h3>
            <p className="text-slate-500 font-medium">We couldn't find any jobs matching your search criteria.</p>
          </div>
        ) : (
          jobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded">Verified</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                  <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                </h3>
                <p className="text-slate-500 font-bold text-sm mb-6 flex items-center gap-2 uppercase tracking-wider">
                  {job.employerCompanyName || job.employerName || 'Top Company'}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {job.location}
                  </span>
                  <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {job.jobType?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proposed Salary</span>
                  <span className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                    {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}K` : '$0'} - {job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}K` : '$0'}
                  </span>
                </div>
                <Link
                  to={`/jobs/${job.id}`}
                  className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {
        pagination.totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-2 pb-12">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`w-10 h-10 rounded-xl font-black transition-all ${pagination.page === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-600'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )
      }
    </div >
  );
};

export default JobsList;