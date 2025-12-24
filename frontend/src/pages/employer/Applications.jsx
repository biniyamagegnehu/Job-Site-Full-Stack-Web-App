import { useState, useEffect } from 'react';
import employerApi from '../../api/employerApi';

const EmployerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      // API expects uppercase enum values usually, check backend: PENDING, REVIEWED, ACCEPTED, REJECTED
      // Backend: PENDING, REVIEWED, SHORTLISTED, ACCEPTED, REJECTED
      const statusToSend = newStatus.toUpperCase();
      await employerApi.updateApplicationStatus(applicationId, statusToSend);

      // Update local state
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: statusToSend } : app
      ));

      // alert(`Application status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update application status');
    }
  };

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
                      <button
                        onClick={() => {
                          // TODO: Implement view application details
                          console.log('View application:', application.id);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      {application.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application.id, 'reviewed')}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {application.status === 'REVIEWED' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application.id, 'accepted')}
                            className="text-green-600 hover:text-green-900 mr-2"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployerApplications;