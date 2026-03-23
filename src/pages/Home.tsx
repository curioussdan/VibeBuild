import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const Home: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('onboarding_done'));
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleSkipOnboarding = () => {
    localStorage.setItem('onboarding_done', 'true');
    setShowOnboarding(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'projects'), {
        clientId: profile?.uid,
        initialPrompt: prompt,
        status: 'clarifying',
        aiQuestions: [],
        aiAnswers: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigate(`/project/${docRef.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-bold mb-6"
        >
          <Sparkles size={16} />
          <span>AI-Powered Marketplace</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          What are we building today?
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Describe your problem in plain English. Our AI will help you refine it, and our builders will bring it to life.
        </p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="relative"
      >
        <div className="bg-white p-2 rounded-[2rem] shadow-2xl shadow-indigo-100 border border-black/5">
          <textarea 
            className="w-full p-6 text-xl bg-transparent border-none focus:outline-none min-h-[200px] resize-none placeholder:text-slate-300"
            placeholder="Describe the problem you want solved..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem]">
            <div className="flex items-center space-x-4 text-slate-400 text-sm font-medium px-2">
              <span className="flex items-center"><Zap size={14} className="mr-1" /> Fast delivery</span>
              <span className="flex items-center"><ShieldCheck size={14} className="mr-1" /> Secure payments</span>
            </div>
            <button 
              type="submit"
              disabled={!prompt.trim() || loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-200"
            >
              {loading ? 'Starting...' : 'Continue'}
              <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </div>
      </motion.form>

      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to VibeBuild!</h2>
                <div className="space-y-4 mb-8">
                  {[
                    "Describe what you want built in plain English.",
                    "Our AI assistant will help you refine the details.",
                    "Choose an expert builder and get it tomorrow.",
                    "Communicate directly via live chat until delivery."
                  ].map((text, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} />
                      </div>
                      <p className="text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={handleSkipOnboarding}
                    className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    Let's get started
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 z-0"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Landing Page", desc: "I need a landing page for my new AI startup", icon: "🚀" },
          { title: "Web Dashboard", desc: "I want a dashboard for tracking study habits", icon: "📊" },
          { title: "Booking App", desc: "I need a simple app to manage client bookings", icon: "📅" }
        ].map((example, i) => (
          <button 
            key={i}
            onClick={() => setPrompt(example.desc)}
            className="text-left p-6 bg-white rounded-2xl border border-black/5 hover:border-indigo-200 hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-3">{example.icon}</div>
            <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{example.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{example.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

import { Zap, ShieldCheck } from 'lucide-react';
