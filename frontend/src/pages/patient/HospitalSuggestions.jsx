import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { MapPin, Activity, CheckCircle, Navigation } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HospitalSuggestions() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { location, error: locError } = useLocation();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/hospitals', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (locError) {
          const fallback = data.map(h => ({ ...h, dist: 0 })).sort((a, b) => a.currentQueueLength - b.currentQueueLength);
          setHospitals(fallback);
          if (fallback.length > 0) setSelectedHospital(fallback[0].id);
          setError(locError);
          setLoading(false);
          return;
        }

        if (location) {
          const hlist = data.map(h => {
             const dist = getDistanceFromLatLonInKm(location.lat, location.lng, h.lat, h.lng);
             return { ...h, dist, score: dist + h.currentQueueLength * 5 };
          }).sort((a, b) => a.score - b.score);
          setHospitals(hlist);
          if (hlist.length > 0) setSelectedHospital(hlist[0].id);
          setLoading(false);
        }
      });
  }, [token, location, locError]);

  const confirmDispatch = async () => {
    const caseId = sessionStorage.getItem('current_case_id');
    if (!caseId) { alert('No active case. Please complete symptom check.'); navigate('/patient/symptoms'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/triage/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ caseId, hospitalId: selectedHospital, locationLat: location?.lat, locationLng: location?.lng })
      });
      if (!res.ok) throw new Error();
      sessionStorage.removeItem('current_case_id');
      navigate('/patient/dashboard');
    } catch {
      alert('Error assigning hospital');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse-soft"
          style={{ backgroundColor: 'rgba(125,170,203,0.15)', color: 'rgb(var(--accent))' }}>
          <Navigation size={28} />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>
          Finding the best routes…
        </p>
      </div>
    );
  }

  const selected = hospitals.find(h => h.id === selectedHospital);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          Step 3 of 3
        </p>
        <h1 className="text-3xl font-black tracking-tight">Hospital Suggestions</h1>
        <p className="mt-1 text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
          Optimal destinations based on distance and current ER queue.
        </p>
        <div className="relative max-w-sm mb-6">
           <input 
             type="text" 
             placeholder="Search specific hospital..." 
             className="input-field"
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400e' }}>
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {/* Hospital list */}
        <div className="md:col-span-2 space-y-3">
          {hospitals.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase())).map((h, idx) => {
            const isSelected = selectedHospital === h.id;
            return (
              <motion.button
                key={h.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                onClick={() => setSelectedHospital(h.id)}
                className="w-full text-left flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  border: `2px solid ${isSelected ? 'rgb(var(--accent))' : 'rgb(var(--border-color))'}`,
                  boxShadow: isSelected ? '0 0 0 3px rgba(125,170,203,0.18)' : 'none',
                }}
              >
                {/* Rank badge */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0"
                  style={{
                    backgroundColor: isSelected ? 'rgb(var(--accent))' : 'rgb(var(--bg-hover))',
                    color: isSelected ? '#fff' : 'rgb(var(--text-secondary))',
                  }}
                >
                  {idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base leading-tight truncate">{h.name}</p>
                  <div className="flex gap-4 mt-1.5 text-xs font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {h.dist > 0 ? `${h.dist.toFixed(1)} km` : 'N/A km'}</span>
                    <span className="flex items-center gap-1"><Activity size={12} /> Queue: {h.currentQueueLength}</span>
                  </div>
                </div>

                {isSelected && <CheckCircle size={22} style={{ color: 'rgb(var(--accent))', flexShrink: 0 }} />}
              </motion.button>
            );
          })}
        </div>

        {/* Confirm panel */}
        <div className="md:col-span-1">
          <div
            className="sticky top-24 p-5 rounded-2xl flex flex-col gap-4"
            style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
          >
            <h3 className="font-bold text-base">Confirm Selection</h3>
            {selected && (
              <>
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(var(--bg-hover))' }}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Destination
                  </p>
                  <p className="font-bold">{selected.name}</p>
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    <MapPin size={11} /> {selected.dist.toFixed(1)} km away
                  </p>
                </div>
                <button onClick={confirmDispatch} disabled={submitting} className="btn-primary w-full" style={{ padding: '12px' }}>
                  {submitting ? 'Dispatching…' : 'Dispatch My Data'}
                </button>
                <p className="text-xs text-center leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
                  This instantly transmits your symptoms, medical history, and ETA to the hospital's priority dashboard.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
