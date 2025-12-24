import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import employerApi from '../../api/employerApi';
import { motion } from 'framer-motion';
import { Briefcase, Building, MapPin, DollarSign, Target, FileText, Send, X, Plus } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    description: '',
    requirements: '',
    skills: '',
    contactEmail: '',
  });

  const jobTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'REMOTE', label: 'Remote' },
  ];

  const experienceLevels = [
    { value: 'ENTRY', label: 'Entry Level' },
    { value: 'JUNIOR', label: 'Junior' },
    { value: 'MID', label: 'Mid Level' },
    { value: 'SENIOR', label: 'Senior Level' },
    { value: 'LEAD', label: 'Lead' },
    { value: 'EXECUTIVE', label: 'Executive' },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const parseSalary = (salaryStr) => {
        if (!salaryStr) return { min: null, max: null };
        const nums = salaryStr.split('-').map(s => s.replace(/[^0-9.]/g, '').trim()).filter(Boolean).map(Number);
        if (nums.length === 1) return { min: nums[0], max: nums[0] };
        if (nums.length >= 2) return { min: nums[0], max: nums[1] };
        return { min: null, max: null };
      };

      const { min: salaryMin, max: salaryMax } = parseSalary(formData.salary);

      const payload = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        location: formData.location,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        requiredSkills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : null,
      };

      const response = await employerApi.createJob(payload);

      if (response?.data?.data?.job) {
        alert('Job broadcast initiated successfully!');
        navigate('/employer/jobs');
      } else {
        alert('Broadcast failed. Server returned unexpected response.');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      const msg = error.response?.data?.message || error.message || 'Failed to create job.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Broadcast <span className="text-blue-600">New Role</span></h1>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Initialize a new job listing on JobPortal network</p>
        </motion.div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core details */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm space-y-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" /> Deployment Specs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Official Job Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} icon={Briefcase} placeholder="e.g. Lead Frontend Architect" />
              <FormField label="Company Brand" name="company" value={formData.company} onChange={handleChange} error={errors.company} icon={Building} placeholder="Organization Name" />
              <FormField label="Geo-Location" name="location" value={formData.location} onChange={handleChange} error={errors.location} icon={MapPin} placeholder="Remote, Region, or City" />
              <FormField label="Comp Package (e.g. 80k-120k)" name="salary" value={formData.salary} onChange={handleChange} icon={DollarSign} placeholder="Numeric range preferred" />

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Employment Protocol</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full input-futuristic h-12 appearance-none">
                  {jobTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Experience Tier</label>
                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full input-futuristic h-12 appearance-none">
                  {experienceLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm space-y-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" /> Detailed Manifest
            </h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3" /> Responsibility Breakdown</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="6" className={`w-full input-futuristic ${errors.description ? 'border-red-500' : ''}`} placeholder="Define the primary mission and day-to-day operations..." />
                {errors.description && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.description}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText className="w-3 h-3" /> Technical Requirements</label>
                <textarea name="requirements" value={formData.requirements} onChange={handleChange} rows="4" className={`w-full input-futuristic ${errors.requirements ? 'border-red-500' : ''}`} placeholder="List essential qualifications (one per line)..." />
                {errors.requirements && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.requirements}</p>}
              </div>
            </div>
          </div>
        </section>

        {/* Info */}
        <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
            <div className="w-2 h-8 bg-sky-600 rounded-full" /> Meta Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField label="Required Skillstack (CSV)" name="skills" value={formData.skills} onChange={handleChange} icon={Plus} placeholder="e.g. React, GO, AWS" />
            <FormField label="Recruitment Contact" name="contactEmail" value={formData.contactEmail} onChange={handleChange} icon={Send} type="email" placeholder="hr@org.com" />
          </div>
        </section>

        <footer className="flex justify-end items-center gap-6 pt-10">
          <button type="button" onClick={() => navigate('/employer/jobs')} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-red-500 transition-colors">Abort Changes</button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-5 rounded-[1.5rem] shadow-xl shadow-blue-100 flex items-center gap-3 transition-all active:scale-95"
          >
            {loading ? 'Initializing...' : <><Send className="w-5 h-5" /> Deploy Broadcast</>}
          </button>
        </footer>
      </form>
    </div>
  );
};

const FormField = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {Icon && <Icon className="w-3 h-3" />} {label}
    </label>
    <input {...props} className={`w-full input-futuristic h-12 ${error ? 'border-red-500' : ''}`} />
    {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}
  </div>
);

export default CreateJob;