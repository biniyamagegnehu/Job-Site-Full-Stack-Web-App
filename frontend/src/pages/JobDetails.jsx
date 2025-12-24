import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import jobApi from '../api/jobApi';
import jobSeekerExtendedApi from '../api/jobSeekerExtendedApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, Calendar, ArrowLeft, Building, Mail, ChevronRight, CheckCircle, Globe, Shield, XCircle } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [hasCV, setHasCV] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchJobDetails();
    if (user && user.role === 'ROLE_JOB_SEEKER') {
      checkInitialStatus();
    }
  }, [id, user]);

  const checkInitialStatus = async () => {
    try {
      const appRes = await jobSeekerExtendedApi.getApplications();
      const apps = appRes.data?.data?.applications || [];
      const alreadyApplied = apps.some(app => app.jobId === parseInt(id));
      setHasApplied(alreadyApplied);

      const cvRes = await jobSeekerExtendedApi.getCVs();
      setHasCV(!!cvRes.data?.data?.cv);
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await jobApi.getJobDetails(id);
      setJob(response.data.data.job);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
      console.error('Error fetching job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      window.location.href = `/login?redirect=/jobs/${id}`;
      return;
    }

    if (user.role !== 'ROLE_JOB_SEEKER') {
      return;
    }

    if (!hasCV) {
      alert('You must upload a CV in your profile settings before applying.');
      return;
    }

    setApplying(true);
    try {
      await jobSeekerExtendedApi.applyForJob(id, { coverLetter });
      setHasApplied(true);
      setShowApplyModal(false);
      alert('Application submitted successfully!');
      fetchJobDetails();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application';
      alert(msg);
      console.error('Error applying for job:', err);
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-blue-600 font-black tracking-widest text-xs uppercase animate-pulse">Syncing Job Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem]">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Access Error</h3>
          <p className="text-red-600 font-bold text-sm mb-8 uppercase tracking-widest">{error}</p>
          <Link to="/jobs" className="inline-flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Return to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Job List
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-16 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 pb-12 border-b border-slate-50">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100">
                    {job.jobType?.replace('_', ' ') || 'Full Time'}
                  </span>
                  <span className="text-slate-300 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Posted {formatDate(job.createdAt)}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                  {job.title}
                </h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-sm">
                    <Building className="w-5 h-5 text-blue-600" /> {job.company || job.employerCompanyName || 'Leading Org'}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-sm">
                    <MapPin className="w-5 h-5 text-blue-600" /> {job.location}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proposed Comp</p>
                  <p className="text-4xl font-black text-blue-600 tracking-tighter line-height-none">
                    {job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}K` : '$0'} - {job.salaryMax ? `$${(job.salaryMax / 1000).toFixed(0)}K` : '$0'}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                  {hasApplied ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="px-8 py-4 bg-green-50 text-green-600 font-black rounded-2xl border border-green-100 uppercase tracking-widest text-xs flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Already Applied
                      </span>
                      <Link to="/job-seeker/applications" className="text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline">
                        Track Application
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      disabled={applying || (user && user.role !== 'ROLE_JOB_SEEKER')}
                      className="w-full md:w-auto px-10 py-5 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:translate-y-[-2px] transition-all uppercase tracking-widest text-sm"
                    >
                      Apply for this Role
                    </button>
                  )}
                  {user && user.role !== 'ROLE_JOB_SEEKER' && (
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Job Seeker access only</p>
                  )}
                </div>

                {/* Inline Application Modal/Form */}
                <AnimatePresence>
                  {showApplyModal && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full mt-10 p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100"
                    >
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">Finalize Application</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">Add a cover letter to stand out (Optional)</p>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Why are you a great fit for this role?"
                        className="w-full h-40 p-6 bg-white border border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium mb-6"
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={handleApply}
                          disabled={applying}
                          className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
                        >
                          {applying ? 'Submitting...' : 'Confirm Application'}
                        </button>
                        <button
                          onClick={() => setShowApplyModal(false)}
                          className="px-8 py-4 bg-white text-slate-400 font-black rounded-xl border border-slate-100 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-600 rounded-full" /> Job Description
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-500 font-medium leading-relaxed text-lg whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              </div>

              {job.requirements && (
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                    <div className="w-2 h-8 bg-indigo-600 rounded-full" /> Key Requirements
                  </h2>
                  <div className="grid gap-4">
                    {job.requirements.split('\n').map((req, index) => (
                      <div key={index} className="flex gap-4 items-start p-5 bg-slate-25 border border-slate-50 rounded-2xl group hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all">
                        <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 font-bold leading-snug">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Role Overview</h3>

            <div className="space-y-6">
              <OverviewItem label="Employment Type" value={job.jobType?.replace('_', ' ') || 'Full-time'} icon={Briefcase} color="text-blue-600" />
              <OverviewItem label="Experience Level" value={job.experienceLevel || 'Mid-level'} icon={ChevronRight} color="text-indigo-600" />
              <OverviewItem label="Primary Location" value={job.location} icon={Globe} color="text-sky-600" />
            </div>

            {job.skills && (
              <div className="mt-12 pt-12 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Required Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.split(',').map((skill, index) => (
                    <span key={index} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-blue-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4">Contact Hiring</h3>
              <p className="text-slate-400 text-sm font-bold mb-8 leading-relaxed uppercase tracking-wider">Direct channel to the recruitment lead for this opening.</p>
              <a
                href={`mailto:${job.employerContactEmail || 'jobs@portal.com'}`}
                className="flex items-center gap-3 text-blue-400 font-black text-sm uppercase tracking-widest hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" /> {job.employerContactEmail || 'recruitment@jobportal.com'}
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const OverviewItem = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{value}</p>
    </div>
  </div>
);

export default JobDetails;