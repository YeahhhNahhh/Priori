import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ALL_SYMPTOMS = ['chest_pain', 'breathing_difficulty', 'bleeding', 'fever', 'headache'];

export default function Triage() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState([]);
  const [age, setAge] = useState('');
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [biometricFailed, setBiometricFailed] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSymptomChange = (symp) => {
    setSymptoms(prev => prev.includes(symp) ? prev.filter(s => s !== symp) : [...prev, symp]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('priora_token');

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/api/triage/intake', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          symptoms,
          biometricFailed,
          medicalProfile: {
            hasDiabetes,
            age: age ? parseInt(age, 10) : 0
          }
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Triage submission failed');
      }

      // Navigate to result, passing data
      navigate('/result', { state: { result: data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Triage Intake Form</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <fieldset style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>
          <legend style={{ fontWeight: 'bold' }}>Symptoms (Select all that apply)</legend>
          {ALL_SYMPTOMS.map(symp => (
            <label key={symp} style={{ display: 'block', margin: '5px 0' }}>
              <input 
                type="checkbox" 
                checked={symptoms.includes(symp)} 
                onChange={() => handleSymptomChange(symp)} 
              />
              {" " + symp.replace('_', ' ').toUpperCase()}
            </label>
          ))}
        </fieldset>

        <label>
          Age:
          <input type="number" value={age} onChange={e => setAge(e.target.value)} required min="0" placeholder="e.g. 30" />
        </label>

        <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
          <input type="checkbox" checked={hasDiabetes} onChange={e => setHasDiabetes(e.target.checked)} />
          Has Diabetes
        </label>

        <label style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', fontWeight: 'normal' }}>
          <input type="checkbox" checked={biometricFailed} onChange={e => setBiometricFailed(e.target.checked)} />
          Simulate Biometric Failure
        </label>

        <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Submitting...' : 'Submit Triage Form'}
        </button>
      </form>
    </div>
  );
}
