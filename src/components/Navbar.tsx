import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LogOut, User, LayoutDashboard, MessageSquare, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-black/5 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">VibeBuild</span>
          </Link>

          <div className="flex items-center space-x-6">
            {profile ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center space-x-1">
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link to="/messages" className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center space-x-1">
                  <MessageSquare size={18} />
                  <span className="hidden sm:inline">Messages</span>
                </Link>
                {profile.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-indigo-600 transition-colors flex items-center space-x-1">
                    <Shield size={18} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <div className="flex items-center space-x-3 pl-4 border-l border-black/5">
                  <Link to="/profile" className="flex items-center space-x-2">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full border border-black/5" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 hidden md:inline">{profile.displayName}</span>
                  </Link>
                  <button onClick={handleSignOut} className="text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-slate-600 hover:text-indigo-600 font-medium">Log in</Link>
                <Link to="/auth?signup=true" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
