import { useState, useEffect } from 'react';
import employerApi from '../../api/employerApi';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, Download, X, FileText, Briefcase, Award, ExternalLink } from 'lucide-react';

const EmployerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await employerApi.getApplications();
      // Adjust structure based on API response: { data: { applications: [...] } }
      setApplications(response.data?.data?.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const jobs = [...new Set(applications.map(app => app.jobTitle))];

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SHORTLISTED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Pending Review';
      case 'REVIEWED': return 'Reviewed';
      case 'ACCEPTED': return 'Accepted';
      case 'REJECTED': return 'Rejected';
      case 'SHORTLISTED': return 'Shortlisted';
      default: return status;
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

  const filteredApplications = applications.filter(app => {
    if (selectedJob !== 'all' && app.jobTitle !== selectedJob) return false;
    // Compare loosely or ensure case matches. Backend status is usually UPPERCASE.
    if (selectedStatus !== 'all' && app.status !== selectedStatus.toUpperCase()) return false;
    return true;
  });

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const statusToSend = newStatus.toUpperCase();
      await employerApi.updateApplicationStatus(applicationId, statusToSend);

      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: statusToSend } : app
      ));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update application status');
    }
  };

  const handleViewProfile = async (jobSeekerId) => {
    setProfileLoading(true);
    setIsProfileModalOpen(true);
    setSelectedProfile(null); // Clear previous
    try {
      const response = await employerApi.getApplicantProfile(jobSeekerId);
      setSelectedProfile(response.data?.data?.profile);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      // If 403, it might be due to the ROLE_ prefix issue partially fixed or token issue
      alert('Failed to load applicant profile. Please login again if the error persists.');
      setIsProfileModalOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsAppModalOpen(true);
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
        <p className="mt-2 text-gray-600">
          Review and manage job applications
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Job
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending Review</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedJob('all');
                setSelectedStatus('all');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Applications</h3>
          <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Pending Review</h3>
          <p className="text-3xl font-bold text-gray-900">
            {applications.filter(a => a.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Reviewed</h3>
          <p className="text-3xl font-bold text-gray-900">
            {applications.filter(a => a.status === 'REVIEWED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Accepted</h3>
          <p className="text-3xl font-bold text-gray-900">
            {applications.filter(a => a.status === 'ACCEPTED').length}
          </p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No applications found with the current filters
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.jobSeekerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.applicantEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.yearsOfExperience} years</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {/* Skills might not be in the lightweight list response, or structured differently */}
                        {/* {application.skills?.slice(0, 3).join(', ')} */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.applicationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewProfile(application.jobSeekerId)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                          title="Detailed Profile"
                        >
                          <User className="w-4 h-4" /> Profile
                        </button>

                        <button
                          onClick={() => handleViewApplication(application)}
                          className="text-amber-600 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                          title="Application Letter"
                        >
                          <FileText className="w-4 h-4" /> Letter
                        </button>

                        {application.cvFileUrl && (
                          <a
                            href={`${API_BASE_URL}${application.cvFileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" /> CV
                          </a>
                        )}

                        {application.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, 'reviewed')}
                              className="text-green-600 hover:text-green-900 font-bold"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {(application.status === 'REVIEWED' || application.status === 'SHORTLISTED') && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, 'accepted')}
                              className="text-green-600 hover:text-green-900 font-bold"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-900 font-bold"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors z-10 bg-white/80 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              {profileLoading ? (
                <div className="p-20 text-center">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Profile...</p>
                </div>
              ) : selectedProfile ? (
                <div className="overflow-y-auto">
                  {/* Header/Hero */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center overflow-hidden shrink-0">
                        {selectedProfile.profilePictureUrl ? (
                          <img src={`${API_BASE_URL}${selectedProfile.profilePictureUrl}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-white" />
                        )}
                      </div>
                      <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black uppercase tracking-tight">{selectedProfile.firstName} {selectedProfile.lastName}</h2>
                        <p className="text-blue-100 font-bold text-lg mt-1">{selectedProfile.profileHeadline || 'Professional Candidate'}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                          <span className="flex items-center gap-2 text-xs font-bold uppercase bg-white/10 px-3 py-1.5 rounded-full">
                            <Mail className="w-3.5 h-3.5" /> {selectedProfile.email}
                          </span>
                          {selectedProfile.phoneNumber && (
                            <span className="flex items-center gap-2 text-xs font-bold uppercase bg-white/10 px-3 py-1.5 rounded-full">
                              <Phone className="w-3.5 h-3.5" /> {selectedProfile.phoneNumber}
                            </span>
                          )}
                          <span className="flex items-center gap-2 text-xs font-bold uppercase bg-white/10 px-3 py-1.5 rounded-full">
                            <MapPin className="w-3.5 h-3.5" /> {selectedProfile.city}, {selectedProfile.country}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-10">
                      <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" /> About Candidate
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium">
                          {selectedProfile.profileSummary || 'No summary provided.'}
                        </p>
                      </section>

                      {/* We could add experience/education here if the endpoint returned them */}
                      <section>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-blue-600" /> Professional Overview
                        </h3>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-slate-400 text-[10px] font-black uppercase">Experience</p>
                              <p className="text-slate-900 font-black text-lg">{selectedProfile.yearsOfExperience || 0} Years</p>
                            </div>
                            <div className="text-right">
                              <p className="text-slate-400 text-[10px] font-black uppercase">Member Since</p>
                              <p className="text-slate-900 font-black text-lg">{formatDate(selectedProfile.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h4>
                        <div className="space-y-3">
                          <a
                            href={`mailto:${selectedProfile.email}`}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 text-xs uppercase tracking-widest"
                          >
                            <Mail className="w-4 h-4" /> Send Email
                          </a>
                          <button
                            onClick={() => window.print()}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                          >
                            <Download className="w-4 h-4" /> Print Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application Letter Modal */}
      <AnimatePresence>
        {isAppModalOpen && selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAppModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Application Letter</h2>
                    <p className="text-amber-100 font-bold text-sm mt-1">From: {selectedApplication.jobSeekerName}</p>
                    <p className="text-amber-100/80 text-xs mt-0.5 uppercase tracking-widest font-black">Position: {selectedApplication.jobTitle}</p>
                  </div>
                  <button
                    onClick={() => setIsAppModalOpen(false)}
                    className="p-2 text-white/80 hover:text-white transition-colors bg-white/20 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto">
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" /> Letter Content
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedApplication.coverLetter || "No cover letter provided for this application."}
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setIsAppModalOpen(false)}
                    className="px-6 py-2 border border-slate-200 text-slate-600 font-black text-xs rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleViewProfile(selectedApplication.jobSeekerId);
                      setIsAppModalOpen(false);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white font-black text-xs rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-100"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployerApplications;