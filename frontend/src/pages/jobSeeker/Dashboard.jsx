import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jobSeekerApi from '../../api/jobSeekerApi';
import { motion } from 'framer-motion';
import { Briefcase, FileText, User, Search, CheckCircle, Clock, Award, Rocket, ChevronRight, Settings } from 'lucide-react';

const JobSeekerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await jobSeekerApi.getProfile();
      setProfile(response.data?.data?.profile || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-blue-600 font-black tracking-widest text-xs uppercase animate-pulse">Syncing Your Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">User <span className="text-blue-600">Dashboard</span></h1>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">
            Welcome back, <span className="text-blue-600">{profile?.firstName || 'Professional'}</span>!
          </p>
        </motion.div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          icon={FileText}
          label="Applications"
          value="12"
          desc="Total job requests sent"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={CheckCircle}
          label="Integrity"
          value="85%"
          desc="Profile completeness score"
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={Briefcase}
          label="Open Roles"
          value="240+"
          desc="Matching your skillset"
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Quick Navigation */}
        <div className="lg:col-span-12">
          <section className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-10">Quick Access Hub</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <NavCard
                to="/job-seeker/profile"
                icon={User}
                title="Member Profile"
                desc="Update your professional bio"
                color="bg-blue-600"
              />
              <NavCard
                to="/jobs"
                icon={Search}
                title="Discovery"
                desc="Search matching job signals"
                color="bg-indigo-600"
              />
              <NavCard
                to="/job-seeker/applications"
                icon={FileText}
                title="My Applications"
                desc="Track your active requests"
                color="bg-sky-600"
              />
              <NavCard
                to="/job-seeker/cv"
                icon={Award}
                title="Credentials"
                desc="Manage your CV and docs"
                color="bg-slate-900"
              />
            </div>
          </section>
        </div>

        {/* Profile Snapshot */}
        <div className="lg:col-span-12">
          <section className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity Overview</h2>
              <Link to="/job-seeker/profile" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
                Open Settings <Settings className="w-3.5 h-3.5" />
              </Link>
            </div>

            {profile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <SnapshotField label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
                <SnapshotField label="Identifier" value={profile.email} />
                <SnapshotField label="Coordinates" value={profile.location || 'Not Specified'} />
                <SnapshotField label="Neural Experience" value={profile.yearsOfExperience ? `${profile.yearsOfExperience} Years` : 'Not Set'} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 font-bold uppercase tracking-widest mb-6">Profile data not initialized</p>
                <Link to="/job-seeker/profile" className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest text-xs">
                  Setup Profile
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, desc, color, bg }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-8">
    <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center shrink-0`}>
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{desc}</p>
    </div>
  </div>
);

const NavCard = ({ to, icon: Icon, title, desc, color }) => (
  <Link to={to} className="group p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
    <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{title}</h4>
    <p className="text-xs text-slate-400 font-bold leading-tight uppercase tracking-wider">{desc}</p>
  </Link>
);

const SnapshotField = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-slate-700 uppercase tracking-tighter truncate">{value}</p>
  </div>
);

export default JobSeekerDashboard;