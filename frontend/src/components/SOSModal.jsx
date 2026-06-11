import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { X, MapPin, AlertCircle, CheckCircle, Ambulance } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

export default function SOSModal({ isOpen, onClose }) {
  const { user, token } = useAuth();
  const socket = useSocket();
  const { location, error: locError } = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [ambulance, setAmbulance] = useState(null);
  const [whatHappened, setWhatHappened] = useState('');
  const [reqs, setReqs] = useState({ oxygen: false, wheelchair: false, other: '' });

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    if (locError) {
      setError(locError);
      setLoading(false);
      return;
    }

    if (!location) {
      setError('Waiting for GPS signal. Make sure location services are enabled.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        patientId: user.id,
        locationLat: location.lat,
        locationLng: location.lng,
        description: whatHappened,
        ambulanceRequired: ambulance === 'yes',
        requirements: Object.keys(reqs).filter(k => reqs[k] === true).concat(reqs.other ? [reqs.other] : [])
      };

      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to send SOS');
      setStep(2);
    } catch {
      setError('Failed to dispatch SOS. Please call emergency services.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setAmbulance(null);
      setWhatHappened('');
      setReqs({ oxygen: false, wheelchair: false, other: '' });
      setError('');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={resetAndClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgb(var(--bg-secondary))',
            border: '1px solid rgb(var(--border-color))',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <div
            className="relative px-6 py-7 text-white text-center"
            style={{ background: 'linear-gradient(135deg, #CE2626 0%, #a01e1e 100%)' }}
          >
            <button
              onClick={resetAndClose}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={32} className="animate-pulse-soft" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">SOS EMERGENCY</h2>
            <p className="text-white/75 text-sm mt-1">Dispatching closest hospital to your location</p>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Ambulance toggle */}
                  <div>
                    <p className="text-sm font-bold mb-3">Do you need an ambulance immediately?</p>
                    <div className="flex gap-3">
                      {[
                        { val: 'yes', label: 'YES', activeColor: '#CE2626', activeBg: 'rgba(206,38,38,0.12)' },
                        { val: 'no',  label: 'NO',  activeColor: 'rgb(var(--text-primary))', activeBg: 'rgb(var(--bg-hover))' },
                      ].map(({ val, label, activeColor, activeBg }) => (
                        <button
                          key={val}
                          onClick={() => setAmbulance(val)}
                          className="flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all"
                          style={{
                            borderColor: ambulance === val ? activeColor : 'rgb(var(--border-color))',
                            backgroundColor: ambulance === val ? activeBg : 'transparent',
                            color: ambulance === val ? activeColor : 'rgb(var(--text-secondary))',
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* What happened */}
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      What happened? <span style={{ color: 'rgb(var(--text-secondary))', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={whatHappened}
                      onChange={e => setWhatHappened(e.target.value)}
                      placeholder="e.g. Car accident, Heart attack"
                      className="input-field"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Special Requirements</label>
                    <div className="flex flex-wrap gap-2">
                      {['oxygen', 'wheelchair'].map(item => (
                        <button
                          key={item}
                          onClick={() => setReqs({ ...reqs, [item]: !reqs[item] })}
                          className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                          style={{
                            borderColor: reqs[item] ? 'rgb(var(--accent))' : 'rgb(var(--border-color))',
                            backgroundColor: reqs[item] ? 'rgba(125,170,203,0.12)' : 'transparent',
                            color: reqs[item] ? 'rgb(var(--accent))' : 'rgb(var(--text-secondary))',
                          }}
                        >
                          {item.charAt(0).toUpperCase() + item.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p
                      className="text-sm font-medium px-4 py-3 rounded-xl"
                      style={{ backgroundColor: 'rgba(206,38,38,0.08)', color: 'rgb(var(--color-red))' }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleConfirm}
                    disabled={loading || !ambulance}
                    className="btn-danger w-full"
                    style={{ padding: '14px', fontSize: '0.95rem', borderRadius: 12 }}
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Locating…
                      </>
                    ) : (
                      <><MapPin size={18} /> CONFIRM SOS</>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#16a34a' }}
                  >
                    <CheckCircle size={40} />
                  </motion.div>
                  <h3 className="text-2xl font-black tracking-tight">SOS Dispatched</h3>
                  <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Help is on the way. The nearest hospital has been alerted with your live location.
                  </p>
                  <button onClick={resetAndClose} className="btn-primary w-full mt-4" style={{ padding: '12px' }}>
                    Close Window
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
