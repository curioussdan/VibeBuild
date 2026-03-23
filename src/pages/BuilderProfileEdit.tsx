import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { User, Briefcase, DollarSign, Clock, Save, Tag } from 'lucide-react';
import { BuilderProfile } from '../types';

export const BuilderProfileEdit: React.FC = () => {
  const { profile } = useAuth();
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [pricingRange, setPricingRange] = useState('');
  const [turnaround, setTurnaround] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!profile) return;
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, 'builders', profile.uid));
      if (docSnap.exists()) {
        const data = docSnap.data() as BuilderProfile;
        setHeadline(data.headline);
        setBio(data.bio);
        setSpecialties(data.specialties.join(', '));
        setPricingRange(data.pricingRange);
        setTurnaround(data.turnaroundEstimate);
      }
    };
    fetchProfile();
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const builderData: Partial<BuilderProfile> = {
        userId: profile.uid,
        headline,
        bio,
        specialties: specialties.split(',').map(s => s.trim()).filter(Boolean),
        pricingRange,
        turnaroundEstimate: turnaround,
        availabilityStatus: 'available',
        updatedAt: new Date().toISOString(),
      } as any;

      const docRef = doc(db, 'builders', profile.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, builderData);
      } else {
        await setDoc(docRef, {
          ...builderData,
          ratingAverage: 5.0,
          ratingCount: 0,
        });
      }
      
      // Also update user role to builder if it wasn't already
      if (profile.role !== 'builder') {
        await updateDoc(doc(db, 'users', profile.uid), { role: 'builder' });
      }

      setMessage('Builder profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden"
      >
        <div className="p-8 border-b border-black/5 bg-indigo-50/30">
          <h2 className="text-2xl font-bold text-slate-900">Builder Profile</h2>
          <p className="text-slate-500 text-sm">This information will be public to clients looking for builders.</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          {message && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm border border-emerald-100">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Professional Headline</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Full-stack MVP Expert"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Bio / About You</label>
              <textarea 
                required
                placeholder="Describe your experience, what you love building, and why clients should choose you."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[150px] resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Specialties (comma separated)</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="React, Firebase, UI Design"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Pricing Range</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. $500 - $2000"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    value={pricingRange}
                    onChange={(e) => setPricingRange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Typical Turnaround</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. 1-2 days"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  value={turnaround}
                  onChange={(e) => setTurnaround(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-black/5 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center"
            >
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : 'Save Builder Profile'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
