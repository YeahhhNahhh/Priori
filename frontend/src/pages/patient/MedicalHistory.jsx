import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const CHRONIC_CONDITIONS = [
  'Diabetes', 'Hypertension (BP)', 'Asthma / COPD', 
  'Heart Disease', 'Kidney Disease', 'Liver Disease', 
  'Thyroid Disorders', 'Epilepsy', 'Cancer (current/past)'
];

const SPECIAL_FLAGS = [
  'Pregnant / recently delivered', 'Immunocompromised', 
  'On blood thinners', 'History of stroke/heart attack'
];

export default function MedicalHistory() {
  const { user, token, fetchUser } = useAuth();
  
  // Parse existing JSON string safely
  let existingMedical = {};
  try {
    existingMedical = user?.medicalProfileData ? JSON.parse(user.medicalProfileData) : {};
    // If it was double stringified accidentally by database writes, parse it again
    if (typeof existingMedical === 'string') {
      existingMedical = JSON.parse(existingMedical);
    }
  } catch (e) {
    console.error("Failed to parse medical history", e);
  }
  
  const [form, setForm] = useState({
    bloodGroup: existingMedical.bloodGroup || '',
    age: existingMedical.age || '',
    gender: existingMedical.gender || '',
    weight: existingMedical.weight || '',
    height: existingMedical.height || '',
    emergencyContact: existingMedical.emergencyContact || '',
    chronic: existingMedical.chronic || [],
    medications: existingMedical.medications || '',
    bloodThinners: existingMedical.bloodThinners || false,
    steroids: existingMedical.steroids || false,
    allergiesDrug: existingMedical.allergiesDrug || '',
    allergiesFood: existingMedical.allergiesFood || '',
    allergiesEnv: existingMedical.allergiesEnv || '',
    specialFlags: existingMedical.specialFlags || []
  });

  const [saving, setSaving] = useState(false);

  const toggleArrayItem = (key, val) => {
    const list = form[key];
    if (list.includes(val)) {
      setForm({ ...form, [key]: list.filter(v => v !== val) });
    } else {
      setForm({ ...form, [key]: [...list, val] });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/patient/medical-history/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ medicalProfileData: JSON.stringify(form) })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save data on server. Check your session or log out and back in.");
      }

      await fetchUser(); // Reload user state
      alert("Comprehensive Health Profile Saved Successfully");
    } catch (err) {
      alert("Error saving: " + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <h1 className="text-3xl font-black tracking-tight mb-2">Health Profile</h1>
      <p className="text-[rgb(var(--text-secondary))] mb-6 text-sm">Providing accurate medical history drastically cuts down triage wait times during an emergency.</p>
      
      <form onSubmit={handleSave} className="space-y-8">
        
        <div className="glass-card">
           <h2 className="text-xl font-bold border-b pb-2 mb-4" style={{ borderColor: 'rgb(var(--border-color))' }}>Basic Health Details</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <div><label className="font-bold text-sm block mb-1">Blood Group</label><select className="input-field" value={form.bloodGroup} onChange={e=>setForm({...form, bloodGroup: e.target.value})}><option value="">Select (A+, O-, etc)</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
             <div><label className="font-bold text-sm block mb-1">Age</label><input type="number" className="input-field" value={form.age} onChange={e=>setForm({...form, age:e.target.value})}/></div>
             <div><label className="font-bold text-sm block mb-1">Gender</label><select className="input-field" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
             <div><label className="font-bold text-sm block mb-1">Height (cm)</label><input type="number" className="input-field" value={form.height} onChange={e=>setForm({...form, height:e.target.value})}/></div>
             <div><label className="font-bold text-sm block mb-1">Weight (kg)</label><input type="number" className="input-field" value={form.weight} onChange={e=>setForm({...form, weight:e.target.value})}/></div>
             <div><label className="font-bold text-sm block mb-1">Emergency Contact</label><input type="tel" className="input-field" value={form.emergencyContact} onChange={e=>setForm({...form, emergencyContact:e.target.value})}/></div>
           </div>
        </div>

        <div className="glass-card">
           <h2 className="text-xl font-bold border-b pb-2 mb-4" style={{ borderColor: 'rgb(var(--border-color))' }}>Chronic Conditions</h2>
           <div className="flex flex-wrap gap-3">
             {CHRONIC_CONDITIONS.map(cond => {
               const checked = form.chronic.includes(cond);
               return (
                 <button 
                   type="button" key={cond} onClick={() => toggleArrayItem('chronic', cond)}
                   className="py-2.5 px-4 rounded-full border text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                   style={{
                     borderColor: checked ? 'rgb(var(--accent))' : 'rgb(var(--border-color))',
                     backgroundColor: checked ? 'rgba(125,170,203,0.12)' : 'transparent',
                     color: checked ? 'rgb(var(--accent))' : 'rgb(var(--text-primary))'
                   }}
                 >
                   {cond}
                 </button>
               )
             })}
           </div>
        </div>

        <div className="glass-card">
           <h2 className="text-xl font-bold border-b pb-2 mb-4" style={{ borderColor: 'rgb(var(--border-color))' }}>Current Medications</h2>
           <label className="font-bold text-sm block mb-2">Ongoing Prescriptions (Name or Type)</label>
           <textarea className="input-field rounded-2xl resize-none h-24 mb-4" value={form.medications} onChange={e=>setForm({...form, medications:e.target.value})} placeholder="e.g. Lisinopril, Metformin" />
           <div className="flex gap-4">
             <label className="flex items-center gap-2 font-bold text-sm cursor-pointer"><input type="checkbox" className="w-5 h-5 accent-[rgb(var(--accent))]" checked={form.bloodThinners} onChange={e=>setForm({...form, bloodThinners: e.target.checked})} /> I am actively taking Blood Thinners</label>
             <label className="flex items-center gap-2 font-bold text-sm cursor-pointer"><input type="checkbox" className="w-5 h-5 accent-[rgb(var(--accent))]" checked={form.steroids} onChange={e=>setForm({...form, steroids: e.target.checked})} /> On long-term Steroids</label>
           </div>
        </div>

        <div className="glass-card grid md:grid-cols-3 gap-4">
           <div className="md:col-span-3"><h2 className="text-xl font-bold border-b pb-2 mb-2" style={{ borderColor: 'rgb(var(--border-color))' }}>Known Allergies</h2></div>
           <div><label className="font-bold text-sm block mb-1">Drug Allergies (e.g. Penicillin)</label><input type="text" className="input-field" value={form.allergiesDrug} onChange={e=>setForm({...form, allergiesDrug:e.target.value})}/></div>
           <div><label className="font-bold text-sm block mb-1">Food Allergies</label><input type="text" className="input-field" value={form.allergiesFood} onChange={e=>setForm({...form, allergiesFood:e.target.value})}/></div>
           <div><label className="font-bold text-sm block mb-1">Environmental / Latex</label><input type="text" className="input-field" value={form.allergiesEnv} onChange={e=>setForm({...form, allergiesEnv:e.target.value})}/></div>
        </div>

        <div className="glass-card">
           <h2 className="text-xl font-bold border-b pb-2 mb-4" style={{ borderColor: 'rgb(var(--border-color))' }}>Special Quick Flags</h2>
           <p className="text-xs text-[rgb(var(--text-secondary))] mb-4">Select any extremely urgent qualifiers standard to priority triage.</p>
           <div className="flex flex-wrap gap-3">
             {SPECIAL_FLAGS.map(flag => {
               const checked = form.specialFlags.includes(flag);
               return (
                 <button 
                   type="button" key={flag} onClick={() => toggleArrayItem('specialFlags', flag)}
                   className="py-2.5 px-4 rounded-full border-2 text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center min-h-[44px]"
                   style={{
                     borderColor: checked ? 'rgb(var(--color-red))' : 'rgb(var(--border-color))',
                     backgroundColor: checked ? 'rgba(206,38,38,0.1)' : 'transparent',
                     color: checked ? 'rgb(var(--color-red))' : 'rgb(var(--text-primary))'
                   }}
                 >
                   {flag}
                 </button>
               )
             })}
           </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-base flex justify-center items-center gap-2">
          {saving ? 'Encrypting & Saving Profile...' : 'Save Comprehensive Health Profile'} <CheckCircle size={20}/>
        </button>
      </form>
    </div>
  );
}
