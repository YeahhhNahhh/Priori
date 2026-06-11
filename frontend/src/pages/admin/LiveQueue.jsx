import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Clock, CheckCircle, MapPin, Users, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LiveQueue() {
  const { user, token } = useAuth();
  const socket = useSocket();
  const [queue, setQueue] = useState([]);

  const fetchQueue = () => {
    fetch(`/api/admin/queue/${user.hospitalId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setQueue);
  };

  useEffect(() => {
    fetchQueue();
    if (socket) {
      socket.on('NEW_CASE', fetchQueue);
      socket.on('QUEUE_UPDATED', fetchQueue);
      return () => { socket.off('NEW_CASE', fetchQueue); socket.off('QUEUE_UPDATED', fetchQueue); };
    }
  }, [socket, user.hospitalId, token]);

  const updateStatus = async (caseId, status) => {
    await fetch(`/api/admin/case/${caseId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    fetchQueue();
  };

  const overridePriority = async (caseId, currentInsight) => {
    const isCurrentlyFlagged = currentInsight && currentInsight.includes('[FLAGGED]');
    const newInsight = isCurrentlyFlagged 
       ? currentInsight.replace('[FLAGGED] ', '').replace('[FLAGGED]', '') 
       : currentInsight;

    await fetch(`/api/admin/case/${caseId}/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isFlagged: !isCurrentlyFlagged, priorityInsight: newInsight })
    });
    fetchQueue();
  };

  const priorityStyle = {
    HIGH:   { cls: 'priority-red',    badge: 'badge badge-red',   label: 'High' },
    MEDIUM: { cls: 'priority-yellow', badge: 'badge badge-amber', label: 'Medium' },
    LOW:    { cls: 'priority-low',    badge: 'badge badge-blue',  label: 'Low' },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
            Real-time Triage
          </p>
          <h1 className="text-3xl font-black tracking-tight">Live Patient Queue</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Incoming triage streams from Priori patients.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0"
          style={{ backgroundColor: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-bold text-green-700 dark:text-green-400">System Live</span>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid rgb(var(--border-color))' }}>
              {['Priority / Patient', 'ETA', 'Status', 'Insights', 'Actions'].map((col, i) => (
                <th
                  key={col}
                  className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                  style={{
                    color: 'rgb(var(--text-secondary))',
                    backgroundColor: 'rgb(var(--bg-hover))',
                    textAlign: i === 4 ? 'right' : 'left',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {queue.map((q) => {
                const pStyle = priorityStyle[q.priorityLevel] || priorityStyle.LOW;
                const statusBadge = q.status === 'ARRIVED' ? 'badge badge-blue' : 'badge badge-green';
                return (
                  <motion.tr
                    key={q.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={pStyle.cls}
                    style={{ borderBottom: '1px solid rgb(var(--border-color))' }}
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold">{q.familyProfile ? q.familyProfile.name : q.patient.name}</p>
                      <span className={pStyle.badge}>{pStyle.label} Priority</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 font-bold text-sm">
                        <Clock size={14} style={{ color: 'rgb(var(--text-secondary))' }} />
                        {q.status === 'ARRIVED' ? '0 min' : `${q.etaMinutes} min`}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={statusBadge}>{q.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm max-w-[200px] truncate" style={{ color: 'rgb(var(--text-secondary))' }}
                         title={q.priorityInsight}>
                        {q.priorityInsight || JSON.parse(q.symptoms || '[]').join(', ')}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {q.status !== 'ARRIVED' && (
                          <button
                            onClick={() => overridePriority(q.id, q.priorityInsight)}
                            className={`transition-colors flex items-center gap-1 rounded font-bold border ${
                              q.priorityInsight && q.priorityInsight.includes('[FLAGGED]')
                                ? 'bg-red-500 text-white border-red-600 shadow-inner'
                                : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            }`}
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          >
                            <AlertTriangle size={14} /> {q.priorityInsight && q.priorityInsight.includes('[FLAGGED]') ? 'Unflag' : 'Flag'}
                          </button>
                        )}
                        {q.status !== 'ARRIVED' && (
                          <button
                            onClick={() => updateStatus(q.id, 'ARRIVED')}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          >
                            <MapPin size={14} /> Arrived
                          </button>
                        )}
                        <button
                          onClick={() => updateStatus(q.id, 'SEEN_BY_DOCTOR')}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', backgroundColor: '#16a34a' }}
                        >
                          <CheckCircle size={14} /> Seen
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>

            {queue.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgb(var(--bg-hover))', color: 'rgb(var(--text-secondary))' }}>
                      <Users size={24} />
                    </div>
                    <p className="font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Queue is currently empty
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
