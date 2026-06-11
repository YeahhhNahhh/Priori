import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, Zap, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_ALERTS = [
  { label: 'Preparing for your arrival', color: '#7DAACB', bg: 'rgba(125,170,203,0.12)' },
  { label: 'You are next',               color: '#16a34a', bg: 'rgba(34,197,94,0.12)' },
  { label: 'Delay due to emergency',     color: '#CE2626', bg: 'rgba(206,38,38,0.12)' },
];

export default function AdminAlerts() {
  const { user, token } = useAuth();
  const [targetId, setTargetId] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState('');

  const sendAlert = async (preset) => {
    const text = preset || msg;
    if (!text || !targetId) { setStatus('error'); return; }

    await fetch('/api/hospitals/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hospitalId: user.hospitalId, targetPatientId: targetId, message: text })
    });
    setStatus('success');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Communication
        </p>
        <h1 className="text-3xl font-black tracking-tight">Alert Dispatch Center</h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Send real-time messages to patients in your queue.
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
      >
        {/* Target */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgb(var(--border-color))' }}>
          <label className="block text-sm font-bold mb-2">Target Patient ID</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter Patient UUID"
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
          />
        </div>

        {/* Quick alerts */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgb(var(--border-color))' }}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} style={{ color: 'rgb(var(--accent))' }} />
            <label className="text-sm font-bold">Quick Fire Messages</label>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_ALERTS.map(({ label, color, bg }) => (
              <button
                key={label}
                onClick={() => sendAlert(label)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: bg, color }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom */}
        <div className="px-6 py-5">
          <label className="block text-sm font-bold mb-2">Custom Alert</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Type a custom message…"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendAlert()}
            />
            <button onClick={() => sendAlert()} className="btn-primary shrink-0">
              <Send size={16} /> Send
            </button>
          </div>

          <AnimatePresence>
            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-sm font-semibold mt-3"
                style={{ color: '#16a34a' }}
              >
                <CheckCircle size={15} /> Alert dispatched successfully!
              </motion.p>
            )}
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-sm font-semibold mt-3"
                style={{ color: 'rgb(var(--color-red))' }}
              >
                Please fill in both the Patient ID and message.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
