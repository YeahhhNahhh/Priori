import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Alerts() {
  const { user, token } = useAuth();
  const socket = useSocket();
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = () => {
    fetch(`/api/hospitals/alerts/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setAlerts);
  };

  useEffect(() => {
    fetchAlerts();
    if (socket) {
      socket.on('NEW_ALERT', fetchAlerts);
      return () => socket.off('NEW_ALERT', fetchAlerts);
    }
  }, [socket, user.id, token]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Notifications
        </p>
        <h1 className="text-3xl font-black tracking-tight">Real-time Alerts</h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Messages dispatched from your assigned hospital.
        </p>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        <AnimatePresence>
          {alerts.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-4 items-start p-4 rounded-2xl"
              style={{
                backgroundColor: i === 0 ? 'rgba(245,158,11,0.08)' : 'rgb(var(--bg-secondary))',
                border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.25)' : 'rgb(var(--border-color))'}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: i === 0 ? 'rgba(245,158,11,0.15)' : 'rgb(var(--bg-hover))',
                  color: i === 0 ? '#d97706' : 'rgb(var(--text-secondary))',
                }}
              >
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm leading-snug"
                  style={{ color: i === 0 ? '#92400e' : 'rgb(var(--text-primary))' }}
                >
                  {a.message}
                </p>
                <p className="flex items-center gap-1 mt-1.5 text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                  <Clock size={11} /> {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 flex flex-col items-center gap-4"
            style={{
              backgroundColor: 'rgb(var(--bg-secondary))',
              border: '1px solid rgb(var(--border-color))',
              borderRadius: 16,
            }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(34,197,94,0.10)', color: '#16a34a' }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <p className="font-bold">All clear</p>
              <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                No alerts received from hospitals yet.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
