import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Phone, Mail, Lock, Shield, Activity } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('PATIENT');

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', hospitalId: '',
    history_diabetes: false, history_bp: '', history_allergies: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      login(data.user, data.token);
      navigate(data.user.role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: 'rgb(var(--bg-primary))' }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(125,170,203,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232,219,179,0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
        style={{
          backgroundColor: 'rgb(var(--bg-secondary))',
          border: '1px solid rgb(var(--border-color))',
          borderRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
          padding: '36px 32px',
        }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Activity size={28} style={{ color: 'rgb(var(--accent))' }} />
          </div>
          <h1
            className="text-4xl font-black tracking-tighter mb-1"
            style={{ color: 'rgb(var(--accent))' }}
          >
            PRIORI
          </h1>
          <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
            Pre-arrival Hospital Triage System
          </p>
        </div>

        {/* Role toggle */}
        <div
          className="flex p-1 rounded-xl mb-6 gap-1"
          style={{ backgroundColor: 'rgb(var(--bg-hover))' }}
        >
          {[
            { r: 'PATIENT', label: 'Patient', Icon: User },
            { r: 'ADMIN',   label: 'Hospital Admin', Icon: Shield },
          ].map(({ r, label, Icon }) => (
            <button
              key={r}
              type="button"
              onClick={() => { 
                setRole(r); 
                setError(''); 
                if (r === 'ADMIN') setIsLogin(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-all"
              style={{
                backgroundColor: role === r ? 'rgb(var(--bg-secondary))' : 'transparent',
                color: role === r ? 'rgb(var(--accent))' : 'rgb(var(--text-secondary))',
                boxShadow: role === r ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <InputIcon Icon={User} placeholder="Full Name" type="text"
                  required={!isLogin} value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <InputIcon Icon={Phone} placeholder="Phone Number" type="tel"
                  required={!isLogin} value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                {role === 'ADMIN' && (
                  <InputIcon Icon={Building2} placeholder="Hospital ID" type="text"
                    required={!isLogin} value={formData.hospitalId}
                    onChange={e => setFormData({ ...formData, hospitalId: e.target.value })} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <InputIcon Icon={Mail} placeholder="Email Address" type="email"
            required value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <InputIcon Icon={Lock} placeholder="Password" type="password"
            required value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })} />



          {error && (
            <p
              className="text-sm font-medium text-center px-4 py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(206,38,38,0.08)', color: 'rgb(var(--color-red))' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4"
            style={{ padding: '12px', fontSize: '0.9rem' }}
          >
            {loading ? 'Processing…' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {role === 'PATIENT' && (
          <p className="text-center mt-5 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => { setIsLogin(l => !l); setError(''); }}
              className="font-bold ml-1 hover:underline"
              style={{ color: 'rgb(var(--accent))' }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}

function InputIcon({ Icon, ...props }) {
  return (
    <div className="relative">
      <Icon
        size={17}
        style={{
          position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
          color: 'rgb(var(--text-secondary))', pointerEvents: 'none',
        }}
      />
      <input
        {...props}
        className="input-field"
        style={{ paddingLeft: 38 }}
      />
    </div>
  );
}
