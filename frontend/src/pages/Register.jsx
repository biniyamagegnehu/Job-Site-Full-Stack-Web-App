import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Building, Globe, Phone, Rocket, ArrowLeft, Shield, Briefcase } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'ROLE_JOB_SEEKER',
    companyName: '',
    companyWebsite: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Identifier required';
    if (!formData.firstName) newErrors.firstName = 'First name required';
    if (!formData.lastName) newErrors.lastName = 'Last name required';
    if (!formData.password) newErrors.password = 'Password required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.role === 'ROLE_EMPLOYER' && !formData.companyName) newErrors.companyName = 'Company name required';
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

    const payload = {
      ...formData,
      username: formData.email.split('@')[0],
      phone: formData.phone?.trim() || null,
      companyWebsite: formData.companyWebsite?.trim() || null,
      companyName: formData.role === 'ROLE_EMPLOYER' ? formData.companyName.trim() : null
    };

    try {
      const resultAction = await dispatch(register(payload));
      if (register.fulfilled.match(resultAction)) {
        alert('ACCOUNT CREATED. Please login.');
        navigate('/login');
      }
    } catch (err) {
      console.log('Registration error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-12 font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Already have an account?
        </Link>

        <div className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-16 shadow-2xl relative">
          <div className="absolute top-0 right-0 w-32 h-1.5 bg-blue-600" />

          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Join <span className="text-blue-600">JobPortal</span></h2>
            <p className="text-slate-400 font-bold text-xs uppercase mt-2 tracking-[0.2em]">Create your professional identity</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange} className="w-full input-futuristic pl-12" placeholder="John" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange} className="w-full input-futuristic pl-12" placeholder="Doe" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full input-futuristic pl-12" placeholder="john@example.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Type</label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select name="role" value={formData.role} onChange={handleChange} className="w-full input-futuristic pl-12 appearance-none">
                  <option value="ROLE_JOB_SEEKER">Job Seeker</option>
                  <option value="ROLE_EMPLOYER">Employer / Company</option>
                </select>
              </div>
            </div>

            <AnimatePresence>
              {formData.role === 'ROLE_EMPLOYER' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Name</label>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input name="companyName" type="text" value={formData.companyName} onChange={handleChange} className="w-full input-futuristic pl-12" placeholder="Acme Inc." />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Website</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input name="companyWebsite" type="url" value={formData.companyWebsite} onChange={handleChange} className="w-full input-futuristic pl-12" placeholder="https://..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full input-futuristic pl-12" placeholder="+1..." />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full input-futuristic pl-12" placeholder="••••••••" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full input-futuristic pl-12" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-blue-100 transition-all font-heading"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;