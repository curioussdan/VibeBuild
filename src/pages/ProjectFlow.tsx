import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ProjectRequest, ProjectStatus, ProjectSummary, BuilderProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getNextQuestion, generateProjectSummary } from '../services/ai';
import { Sparkles, Send, Check, Edit2, User, Star, Zap, Clock, CreditCard, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ProjectFlow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'projects', id), (doc) => {
      if (doc.exists()) {
        setProject({ id: doc.id, ...doc.data() } as ProjectRequest);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `projects/${id}`);
    });
    return unsubscribe;
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [project?.aiQuestions]);

  const handleSendAnswer = async () => {
    if (!inputValue.trim() || !project || aiLoading) return;

    const currentQuestion = project.aiQuestions[project.aiQuestions.length - 1];
    const newAnswers = { ...project.aiAnswers, [currentQuestion.field]: inputValue };
    const newInputValue = inputValue;
    setInputValue('');
    setAiLoading(true);

    try {
      const nextQ = await getNextQuestion(project.initialPrompt, newAnswers);
      
      if (nextQ === 'FINISH') {
        const summary = await generateProjectSummary(project.initialPrompt, newAnswers);
        await updateDoc(doc(db, 'projects', project.id), {
          aiAnswers: newAnswers,
          finalSummary: summary,
          status: 'confirming',
          updatedAt: serverTimestamp(),
        });
      } else {
        const nextQuestionObj = {
          id: Date.now().toString(),
          question: nextQ,
          field: `q_${project.aiQuestions.length + 1}`
        };
        await updateDoc(doc(db, 'projects', project.id), {
          aiAnswers: newAnswers,
          aiQuestions: [...project.aiQuestions, nextQuestionObj],
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const startClarification = async () => {
    if (!project || aiLoading) return;
    setAiLoading(true);
    try {
      const firstQ = await getNextQuestion(project.initialPrompt, {});
      const firstQuestionObj = {
        id: Date.now().toString(),
        question: firstQ,
        field: 'q_1'
      };
      await updateDoc(doc(db, 'projects', project.id), {
        aiQuestions: [firstQuestionObj],
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (project && project.status === 'clarifying' && project.aiQuestions.length === 0 && !aiLoading) {
      startClarification();
    }
  }, [project?.status]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading project...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center">Project not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {project.status === 'clarifying' && (
        <div className="flex flex-col h-[70vh] bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center justify-between bg-indigo-50/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Vibe Assistant</h2>
                <p className="text-xs text-slate-500">Clarifying your project requirements</p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6">
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[80%] text-slate-700">
                <p>Hi! I'm here to help you refine your idea: <strong>"{project.initialPrompt}"</strong></p>
                <p className="mt-2">I'll ask a few questions to make sure we get the perfect builder for you.</p>
              </div>
            </div>

            {project.aiQuestions.map((q, i) => (
              <React.Fragment key={q.id}>
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none max-w-[80%] text-slate-700">
                    <ReactMarkdown>{q.question}</ReactMarkdown>
                  </div>
                </div>
                {project.aiAnswers[q.field] && (
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none max-w-[80%] text-white">
                      {project.aiAnswers[q.field]}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-black/5 bg-slate-50">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Type your answer..."
                className="w-full pl-6 pr-16 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendAnswer()}
                disabled={aiLoading}
              />
              <button 
                onClick={handleSendAnswer}
                disabled={!inputValue.trim() || aiLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {project.status === 'confirming' && project.finalSummary && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden"
        >
          <div className="p-8 border-b border-black/5 bg-indigo-50/30">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Confirm your project</h2>
            <p className="text-slate-500">Here's what we've gathered. Does this look right?</p>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Project Type</h4>
                <p className="text-lg font-medium text-slate-900">{project.finalSummary.project_type}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Problem Statement</h4>
                <p className="text-slate-700 leading-relaxed">{project.finalSummary.problem_statement}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target User</h4>
                <p className="text-slate-700">{project.finalSummary.target_user}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Features</h4>
                <ul className="space-y-2">
                  {project.finalSummary.must_have_features.map((f, i) => (
                    <li key={i} className="flex items-center space-x-2 text-slate-700">
                      <Check size={16} className="text-emerald-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deliverables</h4>
                <div className="flex flex-wrap gap-2">
                  {project.finalSummary.deliverables.map((d, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-black/5 flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => updateDoc(doc(db, 'projects', project.id), { status: 'clarifying' })}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all flex items-center justify-center"
            >
              <Edit2 size={18} className="mr-2" /> Edit details
            </button>
            <button 
              onClick={() => updateDoc(doc(db, 'projects', project.id), { status: 'selecting_builder' })}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center"
            >
              Yes, this is correct <ArrowRight size={18} className="ml-2" />
            </button>
          </div>
        </motion.div>
      )}

      {project.status === 'selecting_builder' && (
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Choose your builder</h2>
            <p className="text-lg text-slate-500">We've found 3 expert vibe coders who are perfect for this project.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_BUILDERS.map((builder) => (
              <motion.div 
                key={builder.userId}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-center space-x-4 mb-6">
                    <img src={builder.photoURL} alt={builder.name} className="w-16 h-16 rounded-2xl object-cover border border-black/5" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{builder.name}</h3>
                      <div className="flex items-center text-amber-400">
                        <Star size={14} fill="currentColor" />
                        <span className="text-slate-900 text-sm font-bold ml-1">{builder.ratingAverage}</span>
                        <span className="text-slate-400 text-xs ml-1">({builder.ratingCount} jobs)</span>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-indigo-600 mb-2">{builder.headline}</h4>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-3">{builder.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {builder.specialties.map(s => (
                      <span key={s} className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-black/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-slate-500 text-sm">
                      <CreditCard size={16} className="mr-2" />
                      <span>Quote</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">${builder.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-slate-500 text-sm">
                      <Clock size={16} className="mr-2" />
                      <span>Delivery</span>
                    </div>
                    <span className="font-bold text-slate-900">{builder.turnaround}</span>
                  </div>
                  <button 
                    onClick={() => handleSelectBuilder(builder)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
                  >
                    Select this builder
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {project.status === 'awaiting_payment' && (
        <div className="max-w-2xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden"
          >
            <div className="p-8 border-b border-black/5 bg-indigo-50/30">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Checkout</h2>
              <p className="text-slate-500">Review your order and start the project.</p>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-black/5">
                <div className="flex items-center space-x-4">
                  <img src={MOCK_BUILDERS.find(b => b.userId === project.selectedBuilderId)?.photoURL} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-slate-900">{MOCK_BUILDERS.find(b => b.userId === project.selectedBuilderId)?.name}</p>
                    <p className="text-xs text-slate-500">Selected Builder</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">${project.quotedPrice}</p>
                  <p className="text-xs text-slate-500">Fixed Price</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900">Payment Method</h4>
                <div className="p-4 border-2 border-indigo-600 rounded-2xl bg-indigo-50/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                    <span className="font-medium text-slate-700">•••• 4242</span>
                  </div>
                  <Check className="text-indigo-600" size={20} />
                </div>
              </div>

              <div className="pt-4 border-t border-black/5">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500">Total amount</span>
                  <span className="text-3xl font-black text-slate-900">${project.quotedPrice}</span>
                </div>
                <button 
                  onClick={handlePayment}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center"
                >
                  Pay and Start Project
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Secure payment processed by VibeBuild. Your funds are held in escrow until delivery.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );

  async function handleSelectBuilder(builder: any) {
    await updateDoc(doc(db, 'projects', project!.id), {
      selectedBuilderId: builder.userId,
      quotedPrice: builder.price,
      estimatedDeliveryTime: builder.turnaround,
      status: 'awaiting_payment',
      updatedAt: serverTimestamp(),
    });
  }

  async function handlePayment() {
    await updateDoc(doc(db, 'projects', project!.id), {
      status: 'in_progress',
      updatedAt: serverTimestamp(),
    });
    navigate(`/messages/${project!.id}`);
  }
};

const MOCK_BUILDERS = [
  {
    userId: 'alex_chen',
    name: 'Alex Chen',
    photoURL: 'https://picsum.photos/seed/alex/200/200',
    headline: 'Fast MVP Builder',
    bio: 'I specialize in building high-performance React apps and landing pages. I focus on speed and clean code.',
    specialties: ['React', 'Tailwind', 'Next.js'],
    ratingAverage: 4.8,
    ratingCount: 124,
    price: 499,
    turnaround: '1 day'
  },
  {
    userId: 'maya_lin',
    name: 'Maya Lin',
    photoURL: 'https://picsum.photos/seed/maya/200/200',
    headline: 'Full-stack Product Maker',
    bio: 'I build complete products from scratch. Expert in Firebase and UI polish. I make things look and feel premium.',
    specialties: ['Firebase', 'UI/UX', 'Product'],
    ratingAverage: 4.9,
    ratingCount: 89,
    price: 799,
    turnaround: '2 days'
  },
  {
    userId: 'jordan_park',
    name: 'Jordan Park',
    photoURL: 'https://picsum.photos/seed/jordan/200/200',
    headline: 'Internal Tools Expert',
    bio: 'Need a dashboard or an admin system? I build robust internal tools that scale with your business.',
    specialties: ['Dashboards', 'Admin', 'API'],
    ratingAverage: 4.7,
    ratingCount: 156,
    price: 599,
    turnaround: '1 day'
  }
];
