import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, LayoutDashboard, FileText, User, LogOut, Menu, X, Rocket } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    ...(user?.role === 'ROLE_JOB_SEEKER' ? [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Applications', path: '/job-seeker/applications', icon: FileText },
      { name: 'Settings', path: '/job-seeker/profile', icon: User },
    ] : []),
    ...(user?.role === 'ROLE_EMPLOYER' ? [
      { name: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
      { name: 'Job Manager', path: '/employer/jobs', icon: Briefcase },
      { name: 'Applicants', path: '/employer/applications', icon: FileText },
    ] : []),
    ...(user?.role === 'ROLE_ADMIN' ? [
      { name: 'Admin Console', path: '/admin/dashboard', icon: Rocket },
    ] : []),
  ];

  const activeLink = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-200">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 font-heading uppercase">
                Job<span className="text-blue-600">Portal</span>
              </span>
            </Link>

            <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${activeLink(link.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                    }`}
                >
                  <link.icon className={`w-4 h-4 ${activeLink(link.path) ? 'text-blue-600' : ''}`} />
                  {link.name}
                  {activeLink(link.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      initial={false}
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">{user.role.replace('ROLE_', '')}</span>
                  <span className="text-sm font-bold text-slate-600 max-w-[150px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all duration-200 group"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-slate-50 text-slate-500 border border-slate-100"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-1 shadow-xl overflow-hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${activeLink(link.path) ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <link.icon className="w-5 h-5" />
                <span className="font-bold">{link.name}</span>
              </Link>
            ))}
            {!user && (
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                <Link to="/login" className="flex items-center justify-center p-4 text-slate-600 font-bold">Sign In</Link>
                <Link to="/register" className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-2xl font-bold">Sign Up</Link>
              </div>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 bg-red-50 mt-6 font-bold"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;