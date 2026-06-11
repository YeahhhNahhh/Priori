import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function PatientDetails() {
  const { caseId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tCase, setCase] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for overriding
  const [overridePriority, setOverridePriority] = useState('');
  const [isFlagged, setIsFlagged] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/case/${caseId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setCase(data);
        setOverridePriority(data.priorityLevel);
        setIsFlagged(data.priorityInsight?.includes('[FLAGGED]'));
        setLoading(false);
      });
  }, [caseId, token]);

  const handleOverride = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/case/${caseId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ priorityLevel: overridePriority, isFlagged })
      });
      if (res.ok) {
        alert("Patient record updated and broadcasted.");
        navigate('/admin/queue');
      }
    } catch (e) {}
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading patient details...</div>;
  if (!tCase) return <div className="p-8 text-center text-red-500">Case not found.</div>;

  const targetPerson = tCase.familyProfile || tCase.patient;
  let symptomsList = [];
  try { symptomsList = JSON.parse(tCase.symptoms); } catch(e) {}
  
  let targetA = {};
  try { targetA = JSON.parse(tCase.targetedAnswers); } catch(e) {}

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patient Case Review</h1>
        <button onClick={() => navigate('/admin/queue')} className="btn-secondary">Back to Queue</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Demographics & Flags */}
        <div className="glass-card flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b pb-2 mb-2" style={{ borderColor: 'rgb(var(--border-color))' }}>Demographics</h2>
          <div>
             <p className="text-sm font-semibold capitalize" style={{ color: 'rgb(var(--text-secondary))' }}>Name</p>
             <p className="text-lg font-bold">{targetPerson.name}</p>
          </div>
          <div>
             <p className="text-sm font-semibold capitalize" style={{ color: 'rgb(var(--text-secondary))' }}>Contact Phone</p>
             <p className="text-lg font-medium">{tCase.patient.phone}</p>
          </div>
          
          <h2 className="text-xl font-bold border-b pb-2 mt-4 mb-2" style={{ borderColor: 'rgb(var(--border-color))' }}>System Medical Flags</h2>
          <div className="flex gap-2">
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${tCase.patient.history_diabetes ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>Diabetic: {tCase.patient.history_diabetes ? 'YES' : 'NO'}</span>
          </div>
          <p className="text-sm"><strong>BP:</strong> {tCase.patient.history_bp || 'Unknown'}</p>
          <p className="text-sm"><strong>Allergies:</strong> {tCase.patient.history_allergies || 'Unknown'}</p>
        </div>

        {/* Triage Info */}
        <div className="glass-card flex flex-col gap-4">
          <h2 className="text-xl font-bold border-b pb-2 mb-2" style={{ borderColor: 'rgb(var(--border-color))' }}>Triage Engine Results</h2>
          <div>
            <p className="text-sm font-semibold capitalize" style={{ color: 'rgb(var(--text-secondary))' }}>Symptoms Reported</p>
            <div className="flex flex-wrap gap-2 mt-2">
               {symptomsList.map(s => <span key={s} className="px-3 py-1 bg-[rgb(var(--bg-hover))] outline outline-1 outline-[rgb(var(--border-color))] rounded-lg text-sm font-bold">{s}</span>)}
            </div>
          </div>
          
          <div>
             <p className="text-sm font-semibold capitalize mt-2" style={{ color: 'rgb(var(--text-secondary))' }}>Engine Insight</p>
             <p className="font-mono text-sm mt-1 p-2 bg-[rgb(var(--bg-hover))] rounded-md">{tCase.priorityInsight}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-bold mb-2">Targeted Q&A</h3>
            {Object.keys(targetA).length === 0 ? <p className="text-sm">No follow-ups recorded.</p> : (
              <ul className="text-sm space-y-1">
                {Object.keys(targetA).map(k => (
                   <li key={k}><strong className="capitalize">{k.replace('_', ' ')}:</strong> {targetA[k]}</li>
                ))}
              </ul>
            )}
            {tCase.additionalNotes && <p className="text-sm mt-4"><strong>Notes:</strong> {tCase.additionalNotes}</p>}
          </div>
        </div>
      </div>

      {/* Admin Overrides */}
      <div className="glass-card">
         <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[rgb(var(--color-red))]"><AlertCircle size={20}/> Admin Case Override</h2>
         <p className="text-sm mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>Bypass system priority algorithms or flag this patient for immediate physician attention.</p>
         
         <div className="flex items-center gap-6">
            <div>
              <label className="font-bold block mb-2 text-sm">Force Priority Level</label>
              <select className="input-field" value={overridePriority} onChange={e=>setOverridePriority(e.target.value)}>
                 <option value="HIGH">HIGH (Urgent)</option>
                 <option value="MEDIUM">MEDIUM</option>
                 <option value="LOW">LOW</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
               <input type="checkbox" id="flag" className="w-5 h-5 accent-[rgb(var(--color-red))]" checked={isFlagged} onChange={e => setIsFlagged(e.target.checked)}/>
               <label htmlFor="flag" className="font-bold text-sm cursor-pointer">Flag Patient (Creates visual system alert)</label>
            </div>
         </div>
         <button onClick={handleOverride} disabled={saving} className="btn-primary mt-6 !bg-[rgb(var(--color-red))] !text-white flex items-center justify-center gap-2">
           {saving ? 'Overriding Case...' : 'Apply Force Override'} <CheckCircle size={18}/>
         </button>
      </div>

    </div>
  );
}
