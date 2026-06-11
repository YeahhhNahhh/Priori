import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function HospitalProfile() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.hospitalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Facility
        </p>
        <h1 className="text-3xl font-black tracking-tight">Hospital Profile</h1>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
      >
        {/* Icon row */}
        <div
          className="flex items-center gap-4 px-6 py-5"
          style={{ borderBottom: '1px solid rgb(var(--border-color))' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(125,170,203,0.15)', color: 'rgb(var(--accent))' }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <p className="font-bold text-lg">Connected Hospital</p>
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              Your admin account is linked to this facility.
            </p>
          </div>
        </div>

        {/* Hospital ID */}
        <div className="px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
            Hospital ID
          </p>
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: 'rgb(var(--bg-hover))' }}
          >
            <span className="font-mono text-sm truncate">{user.hospitalId}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: copied ? '#16a34a' : 'rgb(var(--accent))',
                backgroundColor: copied ? 'rgba(34,197,94,0.10)' : 'rgba(125,170,203,0.12)',
              }}
            >
              {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div
        className="px-5 py-4 rounded-2xl text-sm"
        style={{ backgroundColor: 'rgba(125,170,203,0.08)', border: '1px solid rgba(125,170,203,0.2)' }}
      >
        <p style={{ color: 'rgb(var(--text-secondary))' }}>
          To update facility capacities or link a new hospital, please contact{' '}
          <strong style={{ color: 'rgb(var(--text-primary))' }}>technical support</strong>.
        </p>
      </div>
    </div>
  );
}
