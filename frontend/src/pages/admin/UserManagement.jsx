import { useState, useEffect } from 'react';
import adminApi from '../../api/adminApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Shield, Trash2, Edit3, ShieldAlert, CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight, X, Lock, Unlock, Power } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'ROLE_JOB_SEEKER' });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers(pagination.page, pagination.size);
      const { users, totalPages, totalItems, currentPage } = response.data.data;
      setUsers(users || []);
      setPagination(prev => ({ ...prev, totalPages, totalElements: totalItems, page: currentPage }));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, password: '' });
    } else {
      setEditingUser(null);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'ROLE_JOB_SEEKER' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, formData);
      } else {
        await adminApi.createUser(formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(user.id);
      fetchUsers();
    } catch (err) {
      alert('Deletion failed');
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      if (user.enabled) {
        await adminApi.disableUser(user.id);
      } else {
        await adminApi.enableUser(user.id);
      }
      fetchUsers();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleLockToggle = async (user) => {
    try {
      if (user.locked) {
        await adminApi.unlockUser(user.id);
      } else {
        await adminApi.lockUser(user.id);
      }
      fetchUsers();
    } catch (err) {
      alert('Lock toggle failed');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return <ShieldAlert className="text-red-500 w-4 h-4" />;
      case 'ROLE_EMPLOYER': return <Shield className="text-indigo-600 w-4 h-4" />;
      default: return <Users className="text-blue-600 w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">User <span className="text-blue-600">Management</span></h1>
          <p className="text-slate-400 font-bold text-xs uppercase mt-2 tracking-widest">Manage platform accounts and access control</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> CREATE NEW USER
        </button>
      </header>

      {/* Main Container */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Search Header */}
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Filter by name or email..."
              className="w-full input-futuristic pl-12 shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6 text-slate-400 font-black text-[10px] uppercase tracking-widest">
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full" /> Account Active</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full" /> Restricted</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Role</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="p-20 text-center animate-pulse text-blue-600 font-black text-xs uppercase tracking-widest">Loading user database...</td></tr>
              ) : users.filter(u => u.email.includes(searchTerm) || u.firstName.includes(searchTerm)).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-sm">
                        {user.firstName[0]}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{user.firstName} {user.lastName}</h4>
                        <p className="text-xs text-slate-400 font-bold">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full w-fit shadow-sm">
                      {getRoleIcon(user.role)}
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{user.role.replace('ROLE_', '')}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1">
                      {user.enabled ? (
                        <span className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase"><CheckCircle2 className="w-3 h-3" /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase"><XCircle className="w-3 h-3" /> Disabled</span>
                      )}
                      {user.locked && (
                        <span className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase"><Lock className="w-3 h-3" /> Locked</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleStatusToggle(user)}
                        title={user.enabled ? "Disable Account" : "Enable Account"}
                        className={`p-3 rounded-xl transition-all ${user.enabled ? 'bg-slate-50 text-slate-400 hover:text-orange-500 hover:bg-orange-50' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        <Power className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleLockToggle(user)}
                        title={user.locked ? "Unlock Account" : "Lock Account"}
                        className={`p-3 rounded-xl transition-all ${user.locked ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                      >
                        {user.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>

                      <button onClick={() => handleOpenModal(user)} title="Edit Details" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(user)} title="Delete User" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-colors"
              ><X className="w-6 h-6" /></button>

              <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">First Name</label>
                    <input type="text" className="w-full input-futuristic h-12" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Last Name</label>
                    <input type="text" className="w-full input-futuristic h-12" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                  <input type="email" className="w-full input-futuristic h-12" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                {!editingUser && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Initial Password</label>
                    <input type="password" className="w-full input-futuristic h-12" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Platform Role</label>
                  <select className="w-full input-futuristic h-12 appearance-none" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="ROLE_JOB_SEEKER">Job Seeker</option>
                    <option value="ROLE_EMPLOYER">Employer / Company</option>
                    <option value="ROLE_ADMIN">System Administrator</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg shadow-blue-100 transition-all font-heading">
                  {editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;