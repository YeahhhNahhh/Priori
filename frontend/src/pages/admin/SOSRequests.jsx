import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { AlertCircle, MapPin, Ambulance, Phone, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SOSRequests() {
  const { user, token } = useAuth();
  const socket = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    if (!user?.hospitalId) return;
    fetch(`/api/sos/${user.hospitalId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setRequests(data); setLoading(false); });
  };

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 15s as fallback
    const iv = setInterval(fetchRequests, 15000);
    return () => clearInterval(iv);
  }, [user.hospitalId, token]);

  const handleDispatch = async (sosId) => {
    try {
      await fetch(`/api/sos/${sosId}/dispatch`, { 
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(206,38,38,0.12)', color: 'rgb(var(--color-red))' }}
        >
          <AlertCircle size={26} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgb(var(--color-red))' }}>
            Emergency
          </p>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'rgb(var(--color-red))' }}>
            SOS Dispatches
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>
            High-priority incoming emergency requests.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative overflow-hidden rounded-2xl flex flex-col gap-4 p-5"
              style={{
                backgroundColor: 'rgb(var(--bg-secondary))',
                border: '1px solid rgba(206,38,38,0.25)',
                boxShadow: '0 0 0 1px rgba(206,38,38,0.06)',
              }}
            >
              {/* Left accent stripe */}
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: 'rgb(var(--color-red))' }}
              />

              {/* Patient info */}
              <div className="flex justify-between items-start pl-2">
                <div>
                  <p className="font-bold text-lg leading-tight">{req.patient.name}</p>
                  <p className="text-sm mt-0.5 flex items-center gap-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    <Phone size={12} /> {req.patient.phone}
                  </p>
                </div>
                <span
                  className="badge"
                  style={{ backgroundColor: 'rgba(206,38,38,0.12)', color: 'rgb(var(--color-red))' }}
                >
                  {req.status}
                </span>
              </div>

              {/* Coordinates */}
              <div
                className="rounded-xl p-3 pl-5"
                style={{ backgroundColor: 'rgb(var(--bg-hover))' }}
              >
                <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 mb-1"
                   style={{ color: 'rgb(var(--text-secondary))' }}>
                  <MapPin size={11} /> Location
                </p>
                <p className="font-mono text-sm">
                  {req.locationLat.toFixed(5)}, {req.locationLng.toFixed(5)}
                </p>
              </div>

              {/* Description */}
              {req.description && (
                <div className="pl-2">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Details
                  </p>
                  <p className="text-sm font-medium">{req.description}</p>
                </div>
              )}

              {/* Requirements */}
              {(req.ambulanceRequired || JSON.parse(req.requirements || '[]').length > 0) && (
                <div className="flex flex-wrap gap-2 pl-2">
                  {req.ambulanceRequired && (
                    <span className="badge badge-amber flex items-center gap-1">
                      <Ambulance size={11} /> Ambulance Required
                    </span>
                  )}
                  {JSON.parse(req.requirements || '[]').map(r => (
                    <span key={r} className="badge badge-blue">{r}</span>
                  ))}
                </div>
              )}

              {req.status === 'DISPATCHED' ? (
                <div className="w-full mt-auto py-3 flex items-center justify-center gap-2 font-bold text-sm" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 12 }}>
                  <CheckCircle size={17} /> Ambulance Dispatched
                </div>
              ) : (
                <button onClick={() => handleDispatch(req.id)} className="btn-danger w-full mt-auto" style={{ borderRadius: 12 }}>
                  <Ambulance size={17} /> Dispatch Ambulance
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {requests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full py-24 flex flex-col items-center gap-4 rounded-2xl"
            style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(34,197,94,0.10)', color: '#16a34a' }}>
              <CheckCircle size={32} />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">All Clear</p>
              <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                No pending SOS requests for your facility.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
