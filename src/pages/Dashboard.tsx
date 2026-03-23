import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { ProjectRequest } from '../types';
import { motion } from 'motion/react';
import { Plus, Clock, MessageSquare, CheckCircle2, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { clsx } from 'clsx';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'projects'),
      where('clientId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectRequest)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });
    return unsubscribe;
  }, [profile]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12">Loading your dashboard...</div>;

  const activeProjects = projects.filter(p => !['completed', 'delivered'].includes(p.status));
  const completedProjects = projects.filter(p => ['completed', 'delivered'].includes(p.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome back, {profile?.displayName.split(' ')[0]}</h1>
          <p className="text-slate-500">Manage your projects and track progress.</p>
        </div>
        <Link to="/home" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center">
          <Plus size={20} className="mr-2" /> Start new project
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Active Projects */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Active Projects</h2>
              <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{activeProjects.length}</span>
            </div>
            
            {activeProjects.length > 0 ? (
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <p className="text-slate-400 mb-6">No active projects yet.</p>
                <Link to="/home" className="text-indigo-600 font-bold hover:underline">Start your first project</Link>
              </div>
            )}
          </section>

          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Completed</h2>
                <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{completedProjects.length}</span>
              </div>
              <div className="space-y-4 opacity-75 grayscale-[0.5]">
                {completedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-black/5">
            <h3 className="font-bold text-slate-900 mb-6">Quick Stats</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total Spent</span>
                <span className="font-bold text-slate-900">${projects.reduce((acc, p) => acc + (p.quotedPrice || 0), 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Projects Done</span>
                <span className="font-bold text-slate-900">{completedProjects.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Active Builders</span>
                <span className="font-bold text-slate-900">{new Set(projects.map(p => p.selectedBuilderId).filter(Boolean)).size}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-xl mb-4">Need help?</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Our support team is available 24/7 to help you with your projects.</p>
              <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all">
                Contact Support
              </button>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 text-indigo-500 opacity-50" size={120} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: ProjectRequest }> = ({ project }) => {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600', icon: <AlertCircle size={14} /> },
    clarifying: { label: 'Clarifying', color: 'bg-indigo-100 text-indigo-600', icon: <MessageSquare size={14} /> },
    confirming: { label: 'Confirming', color: 'bg-indigo-100 text-indigo-600', icon: <CheckCircle2 size={14} /> },
    selecting_builder: { label: 'Selecting Builder', color: 'bg-purple-100 text-purple-600', icon: <Plus size={14} /> },
    awaiting_payment: { label: 'Awaiting Payment', color: 'bg-amber-100 text-amber-600', icon: <Clock size={14} /> },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-600', icon: <Zap size={14} /> },
    delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle2 size={14} /> },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-600', icon: <CheckCircle2 size={14} /> },
  };

  const config = statusConfig[project.status];

  return (
    <Link 
      to={['in_progress', 'delivered', 'completed'].includes(project.status) ? `/messages/${project.id}` : `/project/${project.id}`}
      className="block bg-white p-6 rounded-2xl border border-black/5 hover:border-indigo-200 hover:shadow-lg transition-all group"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-grow">
          <div className="flex items-center space-x-3 mb-2">
            <span className={clsx("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-1", config.color)}>
              {config.icon}
              <span>{config.label}</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {project.finalSummary?.project_type || project.initialPrompt}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-1 mt-1">
            {project.finalSummary?.problem_statement || project.initialPrompt}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {project.quotedPrice && (
            <div className="text-right hidden sm:block">
              <p className="text-lg font-black text-slate-900">${project.quotedPrice}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fixed Price</p>
            </div>
          )}
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </Link>
  );
};

import { Sparkles } from 'lucide-react';
