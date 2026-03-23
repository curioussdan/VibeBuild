import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { ProjectRequest, BuilderProfile } from '../types';
import { motion } from 'motion/react';
import { Briefcase, Clock, MessageSquare, CheckCircle2, AlertCircle, Edit, ExternalLink, Send } from 'lucide-react';
import { clsx } from 'clsx';

export const BuilderDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<ProjectRequest[]>([]);
  const [builderProfile, setBuilderProfile] = useState<BuilderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeliveryModal, setShowDeliveryModal] = useState<string | null>(null);
  const [deliveryLink, setDeliveryLink] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  useEffect(() => {
    if (!profile) return;
    
    // Fetch projects assigned to this builder
    const q = query(
      collection(db, 'projects'),
      where('selectedBuilderId', '==', profile.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubProjects = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectRequest)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    // Fetch builder profile
    const unsubProfile = onSnapshot(doc(db, 'builders', profile.uid), (doc) => {
      if (doc.exists()) setBuilderProfile(doc.data() as BuilderProfile);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `builders/${profile.uid}`);
    });

    return () => {
      unsubProjects();
      unsubProfile();
    };
  }, [profile]);

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeliveryModal || !deliveryLink || !deliveryInstructions) return;

    try {
      await addDoc(collection(db, 'projects', showDeliveryModal, 'deliveries'), {
        projectId: showDeliveryModal,
        downloadLink: deliveryLink,
        instructions: deliveryInstructions,
        completedAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'projects', showDeliveryModal), {
        status: 'delivered',
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'projects', showDeliveryModal, 'messages'), {
        projectId: showDeliveryModal,
        senderId: profile?.uid,
        text: "I've delivered the work! You can find the download link and instructions in the delivery card above.",
        createdAt: serverTimestamp(),
      });

      setShowDeliveryModal(null);
      setDeliveryLink('');
      setDeliveryInstructions('');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-12">Loading builder dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Builder Studio</h1>
          <p className="text-slate-500">Manage your active jobs and profile.</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/profile/edit" className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center">
            <Edit size={20} className="mr-2" /> Edit Public Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Active Jobs */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Briefcase size={20} className="mr-2 text-indigo-600" />
              Active Jobs
            </h2>
            
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white p-6 rounded-2xl border border-black/5 hover:border-indigo-200 transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                          )}>
                            {project.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">Due in {project.estimatedDeliveryTime}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                          {project.finalSummary?.project_type || 'Custom Project'}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                          Client ID: {project.clientId.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right mr-4">
                          <p className="text-lg font-black text-slate-900">${project.quotedPrice}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payout</p>
                        </div>
                        <Link to={`/messages/${project.id}`} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <MessageSquare size={20} />
                        </Link>
                        {project.status === 'in_progress' && (
                          <button 
                            onClick={() => setShowDeliveryModal(project.id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
                          >
                            Deliver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <p className="text-slate-400">No active jobs. Make sure your profile is set to "Available".</p>
              </div>
            )}
          </section>
        </div>

        {/* Builder Profile Sidebar */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-black/5">
            <div className="flex items-center space-x-4 mb-6">
              <img src={profile?.photoURL} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h3 className="font-bold text-slate-900">{profile?.displayName}</h3>
                <p className="text-xs text-slate-500">{builderProfile?.headline || 'Expert Builder'}</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-black/5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Rating</span>
                <div className="flex items-center text-amber-400">
                  <Star size={14} fill="currentColor" />
                  <span className="text-slate-900 text-sm font-bold ml-1">{builderProfile?.ratingAverage || '5.0'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Completed</span>
                <span className="font-bold text-slate-900">{builderProfile?.ratingCount || 0} jobs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Status</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {builderProfile?.availabilityStatus || 'Available'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
            <h3 className="font-bold text-xl mb-4">Earnings</h3>
            <p className="text-4xl font-black mb-2">${projects.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.quotedPrice || 0), 0)}</p>
            <p className="text-slate-400 text-sm mb-6">Total earned this month</p>
            <button className="w-full bg-white/10 text-white border border-white/20 py-3 rounded-xl font-bold hover:bg-white/20 transition-all text-sm">
              View Payouts
            </button>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Deliver Project</h2>
            <form onSubmit={handleDeliver} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Download Link / URL</label>
                <div className="relative">
                  <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="url" 
                    required
                    placeholder="https://github.com/... or https://your-site.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={deliveryLink}
                    onChange={(e) => setDeliveryLink(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Instructions</label>
                <textarea 
                  required
                  placeholder="How should the client use this? Any setup steps?"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[150px] resize-none"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowDeliveryModal(null)}
                  className="flex-grow bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center"
                >
                  <Send size={18} className="mr-2" />
                  Deliver Work
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

import { Star } from 'lucide-react';
