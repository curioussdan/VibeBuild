import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8"
            >
              Describe the problem. <br />
              <span className="text-indigo-600">Get it built by tomorrow.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-slate-500 max-w-3xl mx-auto mb-12"
            >
              VibeBuild connects you with world-class builders who ship high-quality MVPs, landing pages, and tools in record time.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link to="/auth?signup=true" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center">
                Get started <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link to="/builders" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
                Browse builders
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-5xl h-full opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-[120px]"></div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-500">From idea to product in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Zap className="text-indigo-600" size={32} />,
                title: "1. Describe your problem",
                desc: "Tell us what you want to build. Our AI assistant will help you clarify the details."
              },
              {
                icon: <ShieldCheck className="text-indigo-600" size={32} />,
                title: "2. Choose a builder",
                desc: "Pick from a curated list of expert vibe coders based on their profile, price, and speed."
              },
              {
                icon: <CheckCircle className="text-indigo-600" size={32} />,
                title: "3. Receive your product",
                desc: "Get your high-quality, ready-to-use product delivered in as little as 24 hours."
              }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-black/5 hover:shadow-md transition-all">
                <div className="mb-6">{step.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why VibeBuild */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Why wait weeks when you can have it <span className="text-indigo-600">tomorrow?</span>
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                Traditional development is slow and expensive. VibeBuild is designed for speed without sacrificing quality. We focus on the "vibe" — the core essence of your product that makes it work.
              </p>
              <ul className="space-y-4">
                {[
                  "Curated network of top-tier builders",
                  "AI-guided intake for perfect clarity",
                  "Fixed pricing and guaranteed delivery",
                  "Direct communication with your builder"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-slate-700 font-medium">
                    <CheckCircle className="text-emerald-500" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="aspect-video bg-indigo-100 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="https://picsum.photos/seed/vibebuild/800/600" 
                  alt="Product preview" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-black/5 max-w-xs">
                <p className="text-slate-900 font-bold mb-1">Alex Chen</p>
                <p className="text-slate-500 text-sm mb-3">Landing page specialist</p>
                <div className="flex items-center space-x-1 text-amber-400">
                  {[1,2,3,4,5].map(s => <Zap key={s} size={14} fill="currentColor" />)}
                  <span className="text-slate-900 text-xs font-bold ml-1">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
