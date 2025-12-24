import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobSeekerApi from '../../api/jobSeekerApi';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Award, BookOpen, Briefcase, FileText, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const JobSeekerProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await jobSeekerApi.getProfile();
      const profile = response.data?.data?.profile || response.data;

      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phoneNumber || profile.phone || '',
        location: profile.location || (profile.city ? `${profile.city}, ${profile.country}` : ''),
        bio: profile.profileSummary || profile.bio || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : (profile.skills || ''),
        experience: profile.yearsOfExperience?.toString() || profile.experience || '',
        education: profile.education || '',
      });
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const profileData = {
        ...formData,
        phoneNumber: formData.phone,
        profileSummary: formData.bio,
        yearsOfExperience: parseInt(formData.experience) || 0
      };
      await jobSeekerApi.updateProfile(profileData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) return;

    setIsDeleting(true);
    try {
      await jobSeekerApi.deleteAccount();
      dispatch(logout());
      navigate('/');
    } catch (err) {
      alert('Failed to delete account.');
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-blue-600 font-black tracking-widest text-xs uppercase animate-pulse">Loading Profile Data...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Member <span className="text-blue-600">Profile</span></h1>
          <p className="text-slate-400 font-bold text-xs uppercase mt-2 tracking-widest">Manage your professional presence on JobPortal</p>
        </motion.div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> First Name</label>
              <input type="text" className="w-full input-futuristic" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User className="w-3 h-3" /> Last Name</label>
              <input type="text" className="w-full input-futuristic" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3 h-3" /> Email Address (Read-only)</label>
              <input type="email" className="w-full input-futuristic bg-slate-50 text-slate-400 cursor-not-allowed" disabled value={formData.email} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Phone className="w-3 h-3" /> Phone Number</label>
              <input type="tel" className="w-full input-futuristic" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Location</label>
              <input type="text" className="w-full input-futuristic" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="New York, USA" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Professional Details</h3>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText className="w-3 h-3" /> Professional Summary</label>
            <textarea rows="4" className="w-full input-futuristic" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Tell us about yourself..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Award className="w-3 h-3" /> Skills (Comma separated)</label>
              <input type="text" className="w-full input-futuristic" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} placeholder="React, Node.js, Python..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Briefcase className="w-3 h-3" /> Total Experience (Years)</label>
              <input type="number" className="w-full input-futuristic" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><BookOpen className="w-3 h-3" /> Education</label>
            <textarea rows="3" className="w-full input-futuristic" value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} placeholder="Your degrees or certifications..." />
          </div>
        </section>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <Save className="w-5 h-5" /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>

          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4" /> Profile Updated
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full">
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Danger Zone */}
      <footer className="mt-20 pt-12 border-t border-slate-100 space-y-8">
        <div>
          <h3 className="text-xl font-black text-red-500 uppercase tracking-tight">Danger Zone</h3>
          <p className="text-slate-400 font-bold text-sm mt-1">Permanently remove your account and all associated data. This action cannot be reversed.</p>
        </div>

        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all border border-red-100 shadow-sm"
        >
          <Trash2 className="w-4 h-4" /> {isDeleting ? 'Deleting...' : 'Delete My Account'}
        </button>
      </footer>
    </div>
  );
};

export default JobSeekerProfile;