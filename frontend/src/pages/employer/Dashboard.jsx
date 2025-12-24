import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, FileText, Plus, Settings, Users, ArrowUpRight, Clock, CheckCircle } from 'lucide-react';

const EmployerDashboard = () => {
  const [stats] = useState({
    totalJobs: 12,
    activeJobs: 8,
    totalApplications: 45,
    pendingReviews: 12,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Employer <span className="text-blue-600">Hub</span></h1>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Manage your organization's talent acquisition</p>
        </motion.div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Briefcase} label="Postings" value={stats.totalJobs} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={CheckCircle} label="Live" value={stats.activeJobs} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={Users} label="Total Applicants" value={stats.totalApplications} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={Clock} label="Under Review" value={stats.pendingReviews} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-12">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">Management Center</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ActionCard
                to="/employer/jobs/create"
                icon={Plus}
                title="Launch New Job"
                desc="Broadcast a new role to the portal"
                color="bg-blue-600"
              />
              <ActionCard
                to="/employer/jobs"
                icon={Settings}
                title="Active Listings"
                desc="Manage and edit existing postings"
                color="bg-indigo-600"
              />
              <ActionCard
                to="/employer/applications"
                icon={FileText}
                title="Review Queue"
                desc="Process incoming job applications"
                color="bg-sky-600"
              />
            </div>
          </section>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-12">
          <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">System Activity Log</h2>
            <div className="space-y-4">
              <ActivityItem icon={Briefcase} color="text-green-600" bg="bg-green-50" text="Senior Product Designer job went LIVE" time="2 hours ago" />
              <ActivityItem icon={Users} color="text-blue-600" bg="bg-blue-50" text="Received 8 new applications for Backend Lead" time="5 hours ago" />
              <ActivityItem icon={Clock} color="text-amber-600" bg="bg-amber-50" text="Interview scheduled with Elias Thompson" time="Yesterday" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
  </div>
);

const ActionCard = ({ to, icon: Icon, title, desc, color }) => (
  <Link to={to} className="group p-8 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
    <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h4>
      <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
    </div>
    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-tight">{desc}</p>
  </Link>
);

const ActivityItem = ({ icon: Icon, color, bg, text, time }) => (
  <div className="flex items-center gap-6 p-6 hover:bg-slate-50 rounded-2xl transition-colors">
    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-black text-slate-700 uppercase tracking-tight truncate">{text}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{time}</p>
    </div>
  </div>
);

export default EmployerDashboard;