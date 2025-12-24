import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import JobsList from './pages/JobsList';
import JobDetails from './pages/JobDetails';

// Job Seeker Pages
import JobSeekerDashboard from './pages/jobSeeker/Dashboard';
import JobSeekerProfile from './pages/jobSeeker/Profile';
import JobSeekerApplications from './pages/jobSeeker/Applications';
import CVManagement from './pages/jobSeeker/CVManagement';


//Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerApplications from './pages/employer/Applications';
import EmployerJobList from './pages/employer/JobList';
import CreateJob from './pages/employer/CreateJob';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import JobManagement from './pages/admin/JobManagement';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <Layout>
                <Landing />
              </Layout>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={
              <Layout>
                <JobsList />
              </Layout>
            } />
            <Route path="/jobs/:id" element={
              <Layout>
                <JobDetails />
              </Layout>
            } />


            {/* Job Seeker Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['ROLE_JOB_SEEKER']}>
                <Layout>
                  <JobSeekerDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/job-seeker/profile" element={
              <ProtectedRoute allowedRoles={['ROLE_JOB_SEEKER']}>
                <Layout>
                  <JobSeekerProfile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/job-seeker/applications" element={
              <ProtectedRoute allowedRoles={['ROLE_JOB_SEEKER']}>
                <Layout>
                  <JobSeekerApplications />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/job-seeker/cv" element={
              <ProtectedRoute allowedRoles={['ROLE_JOB_SEEKER']}>
                <Layout>
                  <CVManagement />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Employer Routes */}
            <Route path="/employer/dashboard" element={
              <ProtectedRoute allowedRoles={['ROLE_EMPLOYER']}>
                <Layout>
                  <EmployerDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employer/jobs" element={
              <ProtectedRoute allowedRoles={['ROLE_EMPLOYER']}>
                <Layout>
                  <EmployerJobList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employer/jobs/create" element={
              <ProtectedRoute allowedRoles={['ROLE_EMPLOYER']}>
                <Layout>
                  <CreateJob />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employer/jobs/:id/edit" element={
              <ProtectedRoute allowedRoles={['ROLE_EMPLOYER']}>
                <Layout>
                  <CreateJob /> {/* Reuse same component for edit */}
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/employer/applications" element={
              <ProtectedRoute allowedRoles={['ROLE_EMPLOYER']}>
                <Layout>
                  <EmployerApplications />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/jobs" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout>
                  <JobManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Layout>
                  <PlatformAnalytics />
                </Layout>
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;