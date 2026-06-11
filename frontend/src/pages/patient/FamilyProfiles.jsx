import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Users, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const RELATIONSHIP_COLORS = {
  Parent: '#7DAACB', Child: '#16a34a', Sibling: '#9333ea', Friend: '#d97706', Other: '#64748b',
};

export default function FamilyProfiles() {
  const { user, token } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', phone: '', relationship: 'Parent' });

  useEffect(() => {
    fetch(`/api/patient/${user.id}/family`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setProfiles);
  }, [user.id, token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/patient/${user.id}/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const p = await res.json();
      setProfiles([...profiles, p]);
      setShowAdd(false);
      setForm({ name: '', age: '', phone: '', relationship: 'Parent' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
            Dependents
          </p>
          <h1 className="text-3xl font-black tracking-tight">Family Profiles</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Manage triage profiles for your dependents.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="btn-primary shrink-0"
        >
          <UserPlus size={17} />
          Add Member
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden"
          >
            <div
              className="grid md:grid-cols-4 gap-3 p-5 rounded-2xl"
              style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
            >
              <input required type="text" placeholder="Full Name" className="input-field"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input required type="number" placeholder="Age" className="input-field"
                value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              <select className="input-field" value={form.relationship}
                onChange={e => setForm({ ...form, relationship: e.target.value })}>
                {['Parent', 'Child', 'Sibling', 'Friend', 'Other'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <input type="tel" placeholder="Emergency Phone" className="input-field"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <button type="submit" className="btn-primary col-span-full md:col-span-1">Save Profile</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {profiles.map((p, i) => {
            const color = RELATIONSHIP_COLORS[p.relationship] || '#64748b';
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col justify-between p-5 rounded-2xl"
                style={{
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  border: '1px solid rgb(var(--border-color))',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl text-white"
                      style={{ backgroundColor: color }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {p.relationship}
                    </span>
                  </div>
                  <p className="font-bold text-lg leading-tight">{p.name}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>{p.age} years old</p>
                </div>
                <Link
                  to="/patient/symptoms"
                  className="btn-secondary mt-5 w-full text-center"
                >
                  <Stethoscope size={16} /> Start Triage
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {profiles.length === 0 && !showAdd && (
          <div
            className="col-span-full text-center py-20 rounded-2xl flex flex-col items-center gap-4"
            style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgb(var(--bg-hover))', color: 'rgb(var(--text-secondary))' }}>
              <Users size={26} />
            </div>
            <div>
              <p className="font-bold">No family profiles yet</p>
              <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                Add a family member to manage their triage on their behalf.
              </p>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary mt-2">
              <UserPlus size={16} /> Add first member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
