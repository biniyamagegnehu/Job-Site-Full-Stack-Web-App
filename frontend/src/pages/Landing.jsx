import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Zap, Globe, Shield, ArrowRight, Star, LayoutDashboard } from 'lucide-react';

const Landing = () => {
  const { user } = useSelector((state) => state.auth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const featureCards = [
    {
      title: "Smart Matching",
      desc: "Connect with the perfect roles using our advanced recruitment filters.",
      icon: Zap,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Global Reach",
      desc: "Access remote opportunities across the globe instantly.",
      icon: Globe,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Verified Jobs",
      desc: "Premium security for your data and verified employer profiles.",
      icon: Shield,
      color: "text-blue-600",
      bg: "bg-blue-50"
    }
  ];

  return (
    <div className="relative pt-12 lg:pt-24 min-h-screen bg-slate-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center px-4">
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 mb-6">
              <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span className="text-xs font-black text-blue-600 tracking-widest uppercase">Trusted by Thousands</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-black mb-8 leading-none tracking-tighter text-slate-900"
            >
              FIND YOUR <br />
              <span className="reveal-text">DREAM JOB</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium"
            >
              Navigate the professional landscape with JobPortal. The premier platform for talent seeking extraordinary opportunities in the modern market.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="btn-futuristic px-12 py-5 bg-blue-600 text-white font-black text-lg group flex items-center justify-center gap-2"
                  >
                    Start Hiring <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/jobs"
                    className="px-12 py-5 bg-white border border-slate-200 text-slate-700 font-bold text-lg rounded-2xl hover:border-blue-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    Browse Jobs
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="btn-futuristic px-12 py-5 bg-blue-600 text-white font-black text-lg group flex items-center justify-center gap-2"
                >
                  Return to Dashboard <LayoutDashboard className="w-5 h-5" />
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="mt-16 grid grid-cols-3 gap-8 border-t border-slate-100 pt-12">
              <div>
                <h4 className="text-3xl font-black text-slate-900">50K+</h4>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Active Roles</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-slate-900">12K+</h4>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Companies</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-slate-900">95%</h4>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Match Rate</p>
              </div>
            </motion.div>
          </div>

          {/* Floating Visual Elements */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <div className="w-full aspect-square bg-white rounded-[3rem] border border-slate-100 shadow-2xl flex items-center justify-center p-12 overflow-hidden group">
                <div className="absolute inset-0 bg-blue-50 opacity-20" />
                <Briefcase className="w-48 h-48 text-blue-600 animate-pulse group-hover:scale-110 transition-transform duration-500" />

                {/* Floating Icons */}
                <div className="absolute top-12 left-12 bg-white shadow-xl p-5 rounded-3xl border border-slate-50">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <div className="absolute bottom-16 right-16 bg-white shadow-xl p-5 rounded-3xl border border-slate-50">
                  <Globe className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="mt-40 px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight uppercase">Built for <span className="text-blue-600">Simplicity</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">Our platform is designed to provide the cleanest and most efficient job search experience across the industry.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featureCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-xl hover:translate-y-[-8px] transition-all duration-300 group"
              >
                <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{card.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Landing;