import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Clock, Bell, Stethoscope, ArrowRight, Activity, ChevronRight, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import LiveMap from '../../components/LiveMap';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.35, ease: 'easeOut' } }),
};

export default function PatientDashboard() {
  const { user, token } = useAuth();
  const socket = useSocket();
  const [latestCase, setLatestCase] = useState(null);
  const [latestAlert, setLatestAlert] = useState(null);
  const [ambulanceAlert, setAmbulanceAlert] = useState(false);

  useEffect(() => {
    fetch(`/api/triage/patient/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (data?.length > 0) setLatestCase(data[0]); });
    fetch(`/api/hospitals/alerts/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (data?.length > 0) setLatestAlert(data[0]); });
  }, [user.id, token]);

  useEffect(() => {
    if (!socket) return;
    const onCaseUpdate = (c) => setLatestCase(c);
    const onAlert = (a) => setLatestAlert(a);
    const onDispatch = () => setAmbulanceAlert(true);
    socket.on('CASE_UPDATED', onCaseUpdate);
    socket.on('NEW_ALERT', onAlert);
    socket.on('AMBULANCE_DISPATCHED', onDispatch);
    return () => { 
      socket.off('CASE_UPDATED', onCaseUpdate); 
      socket.off('NEW_ALERT', onAlert); 
      socket.off('AMBULANCE_DISPATCHED', onDispatch);
    };
  }, [socket]);

  const isActive = latestCase && latestCase.status !== 'RESOLVED' && latestCase.status !== 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Welcome back
        </p>
        <h1 className="text-3xl font-black tracking-tight">{user.name}</h1>
        <p className="mt-1 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Here's your health overview for today.
        </p>
      </motion.div>

      {/* Ambulance Dispatch Alert */}
      {ambulanceAlert && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 p-5 rounded-2xl border-2 shadow-lg"
          style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#991b1b' }}
        >
          <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-red-600 text-white animate-pulse">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-black text-lg">AMBULANCE DISPATCHED!</h3>
            <p className="text-sm font-medium mt-0.5">Please stay calm and remain at your registered location. Help is on the way.</p>
          </div>
          <button onClick={() => setAmbulanceAlert(false)} className="ml-auto font-bold underline text-sm">Dismiss</button>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Live Status */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}
          className="stat-card flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
              Live Status
            </span>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: isActive ? 'rgba(125,170,203,0.15)' : 'rgb(var(--bg-hover))',
                color: isActive ? 'rgb(var(--accent))' : 'rgb(var(--text-secondary))',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          {isActive ? (
            <>
              <div>
                <p className="text-4xl font-black tracking-tight">{latestCase.status === 'ARRIVED' ? 0 : latestCase.etaMinutes}<span className="text-lg font-semibold ml-1">min</span></p>
                <p className="text-sm font-semibold mt-1" style={{ color: 'rgb(var(--accent))' }}>Estimated wait time</p>
              </div>
              {latestCase.hospital && (
                <p className="text-xs truncate" style={{ color: 'rgb(var(--text-secondary))' }}>
                  At {latestCase.hospital.name}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-2xl font-bold" style={{ color: 'rgb(var(--text-secondary))' }}>Idle</p>
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>No active triage case</p>
            </>
          )}
        </motion.div>

        {/* Latest Alert */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}
          className="stat-card sm:col-span-2 lg:col-span-1 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
              Latest Alert
            </span>
            <Link to="/patient/alerts" className="flex items-center gap-1 text-xs font-bold" style={{ color: 'rgb(var(--accent))' }}>
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div
            className="flex-1 flex items-start gap-3 p-3 rounded-xl"
            style={{ backgroundColor: latestAlert ? 'rgba(245,158,11,0.08)' : 'rgb(var(--bg-hover))' }}
          >
            <Bell size={18} style={{ color: latestAlert ? '#d97706' : 'rgb(var(--text-secondary))', flexShrink: 0, marginTop: 1 }} />
            <p className="text-sm font-medium leading-snug" style={{ color: latestAlert ? '#92400e' : 'rgb(var(--text-secondary))' }}>
              {latestAlert ? latestAlert.message : 'No alerts from hospitals yet.'}
            </p>
          </div>
        </motion.div>

        {/* Live Map */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}
          className="sm:col-span-2 lg:col-span-1"
        >
          <LiveMap />
        </motion.div>

        {/* Symptom Check CTA */}
        <motion.div
          custom={3} initial="hidden" animate="visible" variants={cardVariants}
          className="stat-card flex flex-col justify-between gap-4 relative overflow-hidden h-full"
          style={{ background: 'linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--accent-gradient)) 100%)', borderColor: 'transparent' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">Symptom Check</span>
            <Stethoscope size={20} className="text-white/80" />
          </div>
          <div>
            {latestCase ? (
              <p className="text-sm font-medium text-white/90 truncate">
                Last: {JSON.parse(latestCase.symptoms || '[]').join(', ')}
              </p>
            ) : (
              <p className="text-white font-semibold text-base">Start a new evaluation</p>
            )}
          </div>
          <Link
            to="/patient/symptoms"
            className="flex items-center gap-2 text-sm font-bold text-white group"
          >
            <span>Start Check</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Check Symptoms', to: '/patient/symptoms', icon: Stethoscope },
            { label: 'Find Hospitals', to: '/patient/hospitals', icon: Activity },
            { label: 'Family Profiles', to: '/patient/family', icon: Bell },
            { label: 'Medical History', to: '/patient/history', icon: Clock },
          ].map(({ label, to, icon: Icon }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl text-center transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: 'rgb(var(--bg-secondary))',
                border: '1px solid rgb(var(--border-color))',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(125,170,203,0.12)', color: 'rgb(var(--accent))' }}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
