import { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Activity, Users, Briefcase, FileText, TrendingUp, Cpu, Zap, Globe } from 'lucide-react';

const PlatformAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await adminApi.getDashboard();
                setData(response.data?.data?.dashboard);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-blue-600 font-black tracking-widest text-[10px] uppercase animate-pulse">Processing Platform Data...</p>
        </div>
    );

    // Prepare data for Job Types Pie Chart
    const jobTypeData = data?.jobsByType ? Object.entries(data.jobsByType).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value
    })) : [];

    // Prepare data for Application Status Bar Chart
    const appStatusData = data?.applicationsByStatus ? Object.entries(data.applicationsByStatus).map(([name, value]) => ({
        name: name.replace('_', ' '),
        count: value
    })) : [];

    const COLORS = ['#2563eb', '#4f46e5', '#0ea5e9', '#059669', '#f1f5f9'];

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <header>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-4">
                        <Activity className="text-blue-600" /> Platform <span className="text-blue-600">Analytics</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase mt-2 tracking-widest font-heading">Real-time Performance Metrics</p>
                </motion.div>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard icon={Users} label="Total Users" value={data?.totalUsers} color="text-blue-600" bg="bg-blue-50" />
                <MetricCard icon={Briefcase} label="Active Jobs" value={data?.totalJobs} color="text-indigo-600" bg="bg-indigo-50" />
                <MetricCard icon={FileText} label="Total Applications" value={data?.totalApplications} color="text-sky-600" bg="bg-sky-50" />
                <MetricCard icon={TrendingUp} label="Platform Uptime" value="99.9%" color="text-green-600" bg="bg-green-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Job Distribution */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <Cpu className="text-indigo-600 w-5 h-5" />
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Job Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={jobTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {jobTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.section>

                {/* Application Status */}
                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <Zap className="text-blue-600 w-5 h-5" />
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Application Pipeline</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={appStatusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#2563eb', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.section>
            </div>

            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-8">
                    <Globe className="text-blue-600 w-5 h-5" />
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Traffic</h3>
                </div>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                            { name: 'Mon', value: 30 }, { name: 'Tue', value: 45 }, { name: 'Wed', value: 35 },
                            { name: 'Thu', value: 65 }, { name: 'Fri', value: 55 }, { name: 'Sat', value: 85 }, { name: 'Sun', value: 95 }
                        ]}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontStyle="bold" />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#2563eb', fontSize: '14px', fontWeight: 'black' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.section>
        </div>
    );
};

const MetricCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:translate-y-[-2px] transition-all">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-3 ${bg} rounded-xl`}>
                <Icon className={`${color} w-6 h-6`} />
            </div>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest border border-slate-50 px-2 py-0.5 rounded-full">Active</span>
        </div>
        <h4 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{value?.toLocaleString() || '---'}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    </div>
);

export default PlatformAnalytics;
