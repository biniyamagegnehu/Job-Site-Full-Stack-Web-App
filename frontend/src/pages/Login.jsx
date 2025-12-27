import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Rocket, ArrowLeft, Briefcase } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Identifier required';
    if (!formData.password) newErrors.password = 'Pass-key required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    dispatch(clearError());

    const loginPayload = { identifier: formData.email, password: formData.password };

    try {
      const resultAction = await dispatch(login(loginPayload));
      if (login.fulfilled.match(resultAction)) {
        const userPayload = resultAction.payload?.user || resultAction.payload;
        const role = userPayload?.role;
        switch (role) {
          case 'ROLE_ADMIN': navigate('/admin/dashboard'); break;
          case 'ROLE_EMPLOYER': navigate('/employer/dashboard'); break;
          case 'ROLE_JOB_SEEKER': navigate('/dashboard'); break;
          default: navigate('/jobs');
        }
      }
    } catch (err) {
      console.log('Login error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />

          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Welcome <span className="text-blue-600">Back</span></h2>
            <p className="text-slate-400 font-bold text-xs uppercase mt-2 tracking-widest">JobPortal Authorization</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full input-futuristic pl-12"
                  placeholder=" "
                />
              </div>
              {errors.email && <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full input-futuristic pl-12"
                  placeholder=" "
                />
              </div>
              {errors.password && <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter ml-1">{errors.password}</p>}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 items-center">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter leading-tight">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            New Here?{' '}
            <Link to="/register" className="text-blue-600 hover:underline transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;