import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Users, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState({ availableBeds: 0, liveQueueSize: 0 });

  useEffect(() => {
    fetch(`/api/admin/metrics/${user.hospitalId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setMetrics);
  }, [user.hospitalId, token]);

  const stats = [
    {
      label: 'Live Queue Size',
      value: metrics.liveQueueSize,
      icon: Users,
      iconBg: 'rgba(125,170,203,0.15)',
      iconColor: 'rgb(var(--accent))',
    },
    {
      label: 'Available ER Beds',
      value: metrics.availableBeds,
      icon: Activity,
      iconBg: 'rgba(34,197,94,0.12)',
      iconColor: '#16a34a',
    },
    {
      label: 'Avg Critical Handle Time',
      value: '12 min',
      icon: Clock,
      iconBg: 'rgba(245,158,11,0.12)',
      iconColor: '#d97706',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Admin Overview
        </p>
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Real-time facility metrics for your hospital.
        </p>
      </motion.div>

      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ backgroundColor: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-xs font-bold text-green-700 dark:text-green-400">System Live</span>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-5">
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor }, i) => (
          <motion.div
            key={label}
            custom={i}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.35 }}
            className="stat-card flex flex-col gap-4"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: iconBg, color: iconColor }}
            >
              <Icon size={22} />
            </div>
            <div>
              <p className="text-4xl font-black tracking-tight">{value}</p>
              <p className="text-sm font-medium mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>{label}</p>
            </div>
          </motion.div>
        ))}
      </div>


    </div>
  );
}
