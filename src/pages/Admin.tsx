import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ProjectRequest, UserProfile } from '../types';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';
import { Users, Briefcase, DollarSign, Activity, Shield } from 'lucide-react';

export const Admin: React.FC = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;

    const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc')), (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectRequest)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as UserProfile)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => {
      unsubProjects();
      unsubUsers();
    };
  }, [profile]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12">Loading admin panel...</div>;

  const totalRevenue = projects.reduce((acc, p) => acc + (p.quotedPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center space-x-3 mb-12">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control</h1>
          <p className="text-slate-500">System-wide overview and management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Users', value: users.length, icon: <Users className="text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Active Projects', value: projects.filter(p => p.status !== 'completed').length, icon: <Activity className="text-indigo-600" />, color: 'bg-indigo-50' },
          { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: <Briefcase className="text-emerald-600" />, color: 'bg-emerald-50' },
          { label: 'Total Revenue', value: `$${totalRevenue}`, icon: <DollarSign className="text-amber-600" />, color: 'bg-amber-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
            <div className={stat.color + " w-10 h-10 rounded-xl flex items-center justify-center mb-4"}>
              {stat.icon}
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5 bg-slate-50">
          <h2 className="font-bold text-slate-900">Recent Projects</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-black/5">
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Builder</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {projects.slice(0, 10).map((p) => (
                <tr key={p.id} className="text-sm hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{p.finalSummary?.project_type || p.initialPrompt.slice(0, 30)}...</td>
                  <td className="px-6 py-4 text-slate-500">{users.find(u => u.uid === p.clientId)?.displayName || 'Unknown'}</td>
                  <td className="px-6 py-4 text-slate-500">{p.selectedBuilderId || 'Unassigned'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">${p.quotedPrice || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
