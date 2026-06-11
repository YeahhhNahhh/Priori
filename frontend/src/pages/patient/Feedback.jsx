import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';

export default function Feedback() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    hospitalId: '', experience: 'Good', easeOfUse: 'Yes', timeTaken: 'Okay',
    clarity: 'Yes', helpfulness: 'Yes', comments: ''
  });
  const [hospitals, setHospitals] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    fetch('/api/hospitals', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setHospitals(data));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/patient/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, patientId: user.id })
    });
    setSubmitted(true);
    setTimeout(() => navigate('/patient/dashboard'), 3000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
        >
          <CheckCircle size={40} />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Thank You!</h2>
          <p className="mt-2 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Your feedback helps us save lives faster.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Share your experience
        </p>
        <h1 className="text-3xl font-black tracking-tight">Hospital Visit Feedback</h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Please tell us about your experience using Priori.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hospital Selection */}
        <div
          className="p-5 rounded-2xl"
          style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
        >
          <label className="font-bold block mb-3">Which hospital did you visit?</label>
          <select 
            className="input-field w-full"
            value={form.hospitalId}
            onChange={(e) => setForm({...form, hospitalId: e.target.value})}
            required
          >
            <option value="" disabled>Select a designated hospital...</option>
            {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        {/* Overall experience */}
        <div
          className="p-5 rounded-2xl"
          style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
        >
          <label className="font-bold block mb-3 flex items-center gap-2">
            <Star size={17} style={{ color: '#d97706' }} /> Overall Experience
          </label>
          <div className="flex gap-2 flex-wrap">
            {['Excellent', 'Good', 'Average', 'Poor'].map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm({ ...form, experience: opt })}
                className="flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                style={{
                  borderColor: form.experience === opt ? 'rgb(var(--accent))' : 'rgb(var(--border-color))',
                  backgroundColor: form.experience === opt ? 'rgba(125,170,203,0.12)' : 'transparent',
                  color: form.experience === opt ? 'rgb(var(--accent))' : 'rgb(var(--text-primary))',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div
          className="p-5 rounded-2xl"
          style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
        >
          <label className="font-bold block mb-3">Suggestions or Issues?</label>
          <textarea
            className="input-field resize-none"
            style={{ borderRadius: 12, minHeight: 100 }}
            placeholder="Tell us more about your experience…"
            value={form.comments}
            onChange={e => setForm({ ...form, comments: e.target.value })}
          />
        </div>

        <button type="submit" className="btn-primary w-full" style={{ padding: '13px', fontSize: '0.9rem' }}>
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
