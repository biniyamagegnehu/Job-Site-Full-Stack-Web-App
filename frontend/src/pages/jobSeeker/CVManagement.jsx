import { useState, useEffect } from 'react';
import jobSeekerExtendedApi from '../../api/jobSeekerExtendedApi';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Download, Trash2, CheckCircle, Info, Star, ChevronDown, Plus, ShieldCheck } from 'lucide-react';

const CVManagement = () => {
  const [cvList, setCvList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCV();
  }, []);

  const fetchCV = async () => {
    try {
      const { data } = await jobSeekerExtendedApi.getCVs();
      const cv = data?.data?.cv;
      if (cv) setCvList([cv]); else setCvList([]);
    } catch (err) {
      console.error('Error fetching CV:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await jobSeekerExtendedApi.uploadCV(formData);
      alert(`File "${file.name}" uploaded successfully!`);
      e.target.value = '';
      fetchCV();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCV = async (cvId) => {
    if (window.confirm('Are you sure you want to permanently delete this CV record?')) {
      try {
        await jobSeekerExtendedApi.deleteCV();
        alert('CV record purged.');
        setCvList([]);
      } catch (err) {
        console.error('Failed to delete CV', err);
        alert('Deletion failed');
      }
    }
  };

  const handleDownloadCV = async (cvId) => {
    try {
      const res = await jobSeekerExtendedApi.downloadCV();
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const disposition = res.headers['content-disposition'];
      let filename = 'jobportal_cv.pdf';
      if (disposition) {
        const match = /filename="?(.*?)"?$/.exec(disposition);
        if (match && match[1]) filename = match[1];
      }
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download file.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Credentials <span className="text-blue-600">Manager</span></h1>
          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mt-2">Manage your professional CVs and verification docs</p>
        </motion.div>
      </header>

      {/* Upload Zone */}
      <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Deployment Terminal</h2>
        <div className="border-4 border-dashed border-slate-50 rounded-[2rem] p-12 text-center group hover:border-blue-100 transition-colors">
          <Upload className="mx-auto h-16 w-16 text-slate-100 group-hover:text-blue-200 transition-colors mb-6" />
          <div className="relative">
            <label htmlFor="cv-upload" className="cursor-pointer">
              <span className="px-10 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 inline-block">
                {uploading ? 'Processing Stream...' : 'Select Document to Upload'}
              </span>
              <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploading} className="hidden" />
            </label>
            <p className="mt-6 text-[10px] text-slate-400 font-black uppercase tracking-widest tracking-[0.2em]">
              Accepting PDF / DOCX Protocols (Max 5MB)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <TipItem text="Keep your CV updated with recent milestones" />
          <TipItem text="Tailor your profile for specific Role Clusters" />
          <TipItem text="Embed industry-standard keywords" />
          <TipItem text="Optimize for automated screening tech" />
        </div>
      </section>

      {/* Records Table */}
      <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Records</h2>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">1/1 Limit</span>
        </div>

        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-25 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-10 py-5">Filename</th>
                <th className="px-10 py-5">Integrity Date</th>
                <th className="px-10 py-5">Data Size</th>
                <th className="px-10 py-5 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-25">
              {cvList.length === 0 ? (
                <tr><td colSpan="4" className="px-10 py-24 text-center text-slate-300 font-black text-xs uppercase tracking-widest">No primary CV record detected</td></tr>
              ) : cvList.map((cv) => (
                <tr key={cv.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:text-blue-600 transition-colors rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
                          {cv.fileUrl ? cv.fileUrl.split('/').pop().replace(/^\w+_(.+)$/, '$1') : 'Primary Resume Document'}
                        </div>
                        <div className="text-[9px] text-slate-400 font-black tracking-widest uppercase">SYS_REF: {cv.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
                    {formatDate(cv.lastUpdated)}
                  </td>
                  <td className="px-10 py-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                    {cv.fileSize || 'N/A'}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleDownloadCV(cv.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm" title="Download"><Download className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteCV(cv.id)} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" title="Purge Records"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Promotion */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-2xl font-black uppercase tracking-tight">Identity Optimization</h3>
            <p className="text-slate-400 font-medium leading-relaxed max-w-md uppercase tracking-widest text-xs">Utilize our automated CV Architect to restructure your professional profile for maximum impact on JobPortal network.</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <SkillTag text="Industry Templates" />
              <SkillTag text="Guided Input" />
              <SkillTag text="PDF Export" />
            </div>
          </div>
          <button onClick={() => alert('CV Architect coming soon!')} className="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:translate-y-[-4px] transition-all shrink-0">
            Initialize Architect
          </button>
        </div>
      </section>
    </div>
  );
};

const TipItem = ({ text }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{text}</span>
  </div>
);

const SkillTag = ({ text }) => (
  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
    {text}
  </span>
);

export default CVManagement;