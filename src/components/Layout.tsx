import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'motion/react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-16"
      >
        {children}
      </motion.main>
      
      <footer className="bg-white border-t border-black/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">VibeBuild</span>
              </div>
              <p className="text-slate-500 max-w-xs">
                Describe the problem. Pick who builds it. Get it tomorrow. The fastest way to ship your ideas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-slate-500">
                <li><Link to="/" className="hover:text-indigo-600">How it works</Link></li>
                <li><Link to="/" className="hover:text-indigo-600">Builders</Link></li>
                <li><Link to="/" className="hover:text-indigo-600">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-slate-500">
                <li><Link to="/" className="hover:text-indigo-600">About</Link></li>
                <li><Link to="/" className="hover:text-indigo-600">Terms</Link></li>
                <li><Link to="/" className="hover:text-indigo-600">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-black/5 mt-12 pt-8 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} VibeBuild. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

import { Link } from 'react-router-dom';
