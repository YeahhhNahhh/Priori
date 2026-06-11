import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Mail, Phone, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();

  let medData = {};
  if (user.medicalProfileData) {
    try { medData = JSON.parse(user.medicalProfileData); } catch(e) {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Account
        </p>
        <h1 className="text-3xl font-black tracking-tight">Profile</h1>
      </div>

      <div className="space-y-5">
        {/* Profile card */}
        <div className="space-y-4">
          {/* Avatar + name */}
          <div
            className="flex items-center gap-5 p-6 rounded-2xl"
            style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, rgb(var(--accent)) 0%, #5f93b8 100%)' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black">{user.name}</h2>
              <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>Patient Account</p>
              <p className="text-xs font-mono mt-1 px-2 py-0.5 rounded bg-[rgb(var(--bg-hover))] inline-block" style={{ color: 'rgb(var(--accent))' }}>UUID: {user.id}</p>
            </div>
          </div>

          {/* Details */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
          >
            <ProfileRow icon={Mail} label="Email" value={user.email} />
            <ProfileRow icon={Phone} label="Phone" value={user.phone || 'Not provided'} last />
          </div>

          {/* Actions */}
          <Link
            to="/patient/history"
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <ClipboardList size={17} /> Update Medical History
          </Link>

          {/* New Medical History Summary Block */}
          {Object.keys(medData).length > 0 && (
            <div className="glass-card">
              <h3 className="font-bold border-b pb-2 mb-3" style={{ borderColor: 'rgb(var(--border-color))' }}>Health Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-bold opacity-70">Blood Group:</span> {medData.bloodGroup || 'N/A'}</div>
                <div><span className="font-bold opacity-70">Age:</span> {medData.age || 'N/A'}</div>
                <div><span className="font-bold opacity-70">Gender:</span> {medData.gender || 'N/A'}</div>
                <div><span className="font-bold opacity-70">Emergency Contact:</span> {medData.emergencyContact || 'N/A'}</div>
              </div>
              {medData.chronic?.length > 0 && (
                <div className="mt-4">
                  <span className="font-bold opacity-70 block mb-1 text-sm">Chronic Conditions:</span>
                  <div className="flex flex-wrap gap-1">
                    {medData.chronic.map(c => <span key={c} className="px-2 py-0.5 bg-[rgb(var(--bg-hover))] border border-[rgb(var(--border-color))] rounded-md text-xs font-semibold">{c}</span>)}
                  </div>
                </div>
              )}
              {medData.specialFlags?.length > 0 && (
                <div className="mt-4">
                  <span className="font-bold opacity-70 block mb-1 text-sm">Critical Flags:</span>
                  <div className="flex flex-wrap gap-1">
                    {medData.specialFlags.map(f => <span key={f} className="px-2 py-0.5 bg-red-100/10 border border-red-500/30 text-[rgb(var(--color-red))] rounded-md text-xs font-bold">{f}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value, last }) {
  return (
    <div
      className="flex items-center gap-4 px-6 py-4"
      style={{ borderBottom: last ? 'none' : '1px solid rgb(var(--border-color))' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgba(125,170,203,0.12)', color: 'rgb(var(--accent))' }}
      >
        <Icon size={17} />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
          {label}
        </p>
        <p className="font-semibold text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
}
