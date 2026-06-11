import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bloodPressure: '',
    cortisolLevels: '',
    allergies: '',
    hasDiabetes: false,
    dependentName: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting offline-capable data", formData);
    // Offline capability: Save to localStorage so if connection is lost, pre-fills still remain
    localStorage.setItem('priora_medical_profile', JSON.stringify(formData));
    navigate('/triage');
  };

  return (
    <div className="app-container flex-center" style={{ padding: '20px' }}>
      <div className="glass-panel animate-in" style={{ padding: '30px', maxWidth: '500px', width: '100%' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--accent-color)' }}>Patient Onboarding</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Please construct your digital health locker. This data will be securely stored offline for seamless intake.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Blood Pressure (e.g. 120/80)</label>
            <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.02)', color: 'inherit' }} placeholder="120/80 bpm" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Cortisol Levels (optional)</label>
            <input type="text" name="cortisolLevels" value={formData.cortisolLevels} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.02)', color: 'inherit' }} placeholder="Provide if known..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Known Allergies</label>
            <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.02)', color: 'inherit' }} placeholder="Peanuts, Penicillin..." />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
            <input type="checkbox" name="hasDiabetes" checked={formData.hasDiabetes} onChange={handleChange} id="diabetes" style={{ width: '18px', height: '18px' }} />
            <label htmlFor="diabetes" style={{ fontWeight: 500 }}>Diagnosis: Diabetes (Check if Yes)</label>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--accent-color)' }}>Dependents (Family Mode)</h3>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Add Child / Elderly Info</label>
            <input type="text" name="dependentName" value={formData.dependentName} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.02)', color: 'inherit' }} placeholder="Relative Name or 'None'" />
          </div>

          <button type="submit" className="premium-button" style={{ marginTop: '20px', width: '100%' }}>
            Save Digital Locker & Proceed
          </button>
        </form>
      </div>
    </div>
  );
}
