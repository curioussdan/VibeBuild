import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, addDoc, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ProjectRequest, Message, Delivery } from '../types';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';
import { Send, Download, FileText, CheckCircle2, Clock, User, Sparkles, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';

export const Messaging: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [project, setProject] = useState<ProjectRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const unsubProject = onSnapshot(doc(db, 'projects', id), (doc) => {
      if (doc.exists()) setProject({ id: doc.id, ...doc.data() } as ProjectRequest);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `projects/${id}`);
    });

    const q = query(collection(db, 'projects', id, 'messages'), orderBy('createdAt', 'asc'));
    const unsubMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `projects/${id}/messages`);
    });

    const unsubDelivery = onSnapshot(collection(db, 'projects', id, 'deliveries'), (snapshot) => {
      if (!snapshot.empty) setDelivery({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Delivery);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `projects/${id}/deliveries`);
    });

    return () => {
      unsubProject();
      unsubMessages();
      unsubDelivery();
    };
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !id || !profile) return;

    const text = inputValue;
    setInputValue('');

    await addDoc(collection(db, 'projects', id, 'messages'), {
      projectId: id,
      senderId: profile.uid,
      text,
      createdAt: serverTimestamp(),
    });
  };

  const handleCompleteProject = async () => {
    if (!id) return;
    await updateDoc(doc(db, 'projects', id), {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
  };

  if (!project) return <div className="min-h-screen flex items-center justify-center">Loading project...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{project.finalSummary?.project_type || 'Project Thread'}</h1>
            <div className="flex items-center space-x-2">
              <span className={clsx(
                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                project.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
              )}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">Project ID: {project.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>
        
        {profile?.role === 'builder' && project.status === 'in_progress' && (
          <button 
            onClick={() => {/* Open delivery modal */}}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            Deliver Work
          </button>
        )}
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden">
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6">
            <div className="flex justify-center">
              <div className="bg-slate-50 px-4 py-2 rounded-full text-xs font-medium text-slate-400 border border-black/5">
                Project started on {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={clsx("flex", msg.senderId === profile?.uid ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "max-w-[80%] p-4 rounded-2xl",
                  msg.senderId === profile?.uid 
                    ? "bg-indigo-600 text-white rounded-tr-none" 
                    : "bg-slate-100 text-slate-700 rounded-tl-none"
                )}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={clsx(
                    "text-[10px] mt-2 font-medium",
                    msg.senderId === profile?.uid ? "text-indigo-200" : "text-slate-400"
                  )}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {delivery && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center py-8"
              >
                <div className="bg-emerald-50 border-2 border-emerald-500/20 rounded-3xl p-8 max-w-lg w-full shadow-lg shadow-emerald-100/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-900 text-lg">Work Delivered!</h3>
                      <p className="text-sm text-emerald-600">Your project is ready for review.</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-emerald-100 mb-6">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                      <FileText size={16} className="mr-2 text-emerald-500" />
                      Instructions
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{delivery.instructions}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                      href={delivery.downloadLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-grow bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center shadow-lg shadow-emerald-200"
                    >
                      <Download size={18} className="mr-2" /> Download Assets
                    </a>
                    {project.status !== 'completed' && profile?.role === 'client' && (
                      <button 
                        onClick={handleCompleteProject}
                        className="bg-white text-emerald-600 border border-emerald-200 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all"
                      >
                        Accept & Complete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 border-t border-black/5">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type a message..."
                className="w-full pl-6 pr-16 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="w-full lg:w-80 space-y-6 hidden lg:block">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-black/5">
            <h3 className="font-bold text-slate-900 mb-6">Project Details</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <div className={clsx("w-2 h-2 rounded-full", project.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500')}></div>
                  <span className="font-bold text-slate-700 capitalize">{project.status.replace('_', ' ')}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Estimate</p>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Clock size={16} className="text-slate-400" />
                  <span className="font-medium">{project.estimatedDeliveryTime || 'TBD'}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price</p>
                <p className="text-xl font-black text-slate-900">${project.quotedPrice || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-black/5">
            <h3 className="font-bold text-slate-900 mb-4">Participants</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Client</p>
                  <p className="text-[10px] text-slate-500">Project Owner</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Builder</p>
                  <p className="text-[10px] text-slate-500">Assigned Expert</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
