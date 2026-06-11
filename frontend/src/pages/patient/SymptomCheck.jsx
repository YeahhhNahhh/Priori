import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, HeartPulse, Brain, AlertTriangle, ShieldAlert, CheckCircle, Activity, ArrowLeft } from 'lucide-react';

const SYMPTOMS = [
  { id: 'Chest Pain',           icon: HeartPulse, color: '#CE2626',   bg: 'rgba(206,38,38,0.10)' },
  { id: 'Breathing Difficulty', icon: Activity,   color: '#ea580c',   bg: 'rgba(234,88,12,0.10)' },
  { id: 'Headache',             icon: Brain,      color: '#9333ea',   bg: 'rgba(147,51,234,0.10)' },
  { id: 'Fever',                icon: AlertTriangle, color: '#d97706', bg: 'rgba(217,119,6,0.10)' },
  { id: 'Bleeding',             icon: ShieldAlert, color: '#b91c1c',  bg: 'rgba(185,28,28,0.10)' },
  { id: 'Injury',               icon: CheckCircle, color: '#0ea5e9',  bg: 'rgba(14,165,233,0.10)' },
  { id: 'Other',                icon: CheckCircle, color: 'rgb(var(--accent))', bg: 'rgba(125,170,203,0.10)' },
];

const stepSlide = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 30 : -30 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    (dir) => ({ opacity: 0, x: dir > 0 ? -30 : 30, transition: { duration: 0.2 } }),
};

export default function SymptomCheck() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [targetedAnswers, setTargetedAnswers] = useState({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [conditionAnswers, setConditionAnswers] = useState({ can_walk: null, speak_properly: null, dizzy: null });
  const [vitalsAnswers, setVitalsAnswers] = useState({ rr: '', pulse: '', spo2: '', crt: '' });

  const goTo = (s) => { setDir(s > step ? 1 : -1); setStep(s); };

  const renderTargetedQuestions = () => {
    return (
      <div className="space-y-8">
        {selectedSymptoms.includes('Chest Pain') && (
          <div className="space-y-6">
            <SectionTitle>Tell us about the chest pain</SectionTitle>
            <YesNoQuestion
              question="Are you sweating?"
              value={targetedAnswers.sweating}
              onChange={(v) => setTargetedAnswers({ ...targetedAnswers, sweating: v })}
            />
            <YesNoQuestion
              question="Is pain spreading to arm or jaw?"
              value={targetedAnswers.spreading}
              onChange={(v) => setTargetedAnswers({ ...targetedAnswers, spreading: v })}
            />
          </div>
        )}

        {selectedSymptoms.includes('Fever') && (
          <div className="space-y-6">
            <SectionTitle>Tell us about your fever</SectionTitle>
            <div>
              <QuestionLabel>Temperature Level</QuestionLabel>
              <OptionRow options={['Mild', 'High']} value={targetedAnswers.temperature_level}
                onChange={(v) => setTargetedAnswers({ ...targetedAnswers, temperature_level: v })} />
            </div>
            <div>
              <QuestionLabel>Duration</QuestionLabel>
              <OptionRow options={['< 1 day', '2-3 days', '3+ days']} value={targetedAnswers.duration}
                onChange={(v) => setTargetedAnswers({ ...targetedAnswers, duration: v })} />
            </div>
          </div>
        )}

        {(!selectedSymptoms.includes('Chest Pain') && !selectedSymptoms.includes('Fever')) && (
          <div className="space-y-4">
            <SectionTitle>Any specific triggers? <span style={{ color: 'rgb(var(--text-secondary))' }}>(Optional)</span></SectionTitle>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. After eating"
              onChange={e => setTargetedAnswers({ ...targetedAnswers, triggers: e.target.value })}
            />
          </div>
        )}

        <button onClick={() => goTo(3)} className="btn-primary w-full mt-4">
          Next <ArrowRight size={17} />
        </button>
      </div>
    );
  };

  const submitSymptoms = async () => {
    setLoading(true);
    try {
      const payload = { patientId: user.id, symptoms: selectedSymptoms, targetedAnswers, additionalNotes, conditionAnswers, vitalsAnswers };
      const res = await fetch('/api/triage/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Submission failed');
      sessionStorage.setItem('current_case_id', data.caseId);
      navigate('/patient/hospitals');
    } catch {
      alert('Error submitting symptoms.');
      setLoading(false);
    }
  };

  const totalSteps = 6;

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Step progress */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: step > i ? 'rgb(var(--accent))' : 'rgb(var(--border-color))' }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={stepSlide}
          initial="initial"
          animate="animate"
          exit="exit"
          className="card"
          style={{ minHeight: 320 }}
        >
          {/* Step 1 – Symptom selector */}
          {step === 1 && (
            <div>
              <SectionTitle>What is your primary symptom?</SectionTitle>
              <p className="text-sm mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
                Select all the symptoms that apply.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SYMPTOMS.map(({ id, icon: Icon, color, bg }) => {
                  const isSelected = selectedSymptoms.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        let updated = [...selectedSymptoms];
                        if (isSelected) {
                          updated = updated.filter(s => s !== id);
                        } else {
                          updated.push(id);
                        }
                        setSelectedSymptoms(updated);
                        setTargetedAnswers({}); // reset follow up queries
                      }}
                      className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all hover:scale-105 active:scale-95 border"
                      style={{
                        backgroundColor: isSelected ? bg : 'rgb(var(--bg-secondary))',
                        borderColor: isSelected ? color : 'rgb(var(--border-color))',
                        boxShadow: isSelected ? `0 0 0 2px ${color}30` : 'none',
                      }}
                    >
                      <Icon size={30} style={{ color }} />
                      <span className="text-sm font-semibold">{id}</span>
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => goTo(2)} 
                disabled={selectedSymptoms.length === 0}
                className="btn-primary w-full mt-6"
              >
                Next <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Step 2 – Targeted questions */}
          {step === 2 && (
            <div>
              <BackButton onClick={() => goTo(1)} />
              {renderTargetedQuestions()}
            </div>
          )}

          {/* Step 3 – Additional notes */}
          {step === 3 && (
            <div>
              <BackButton onClick={() => goTo(2)} />
              <SectionTitle>Anything else we should know?</SectionTitle>
              <textarea
                rows={4}
                className="input-field resize-none mt-4"
                style={{ borderRadius: 12 }}
                placeholder="Describe any other symptoms or context..."
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
              />
              <button onClick={() => goTo(4)} className="btn-primary w-full mt-5">
                Next <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Step 4 – Condition checks */}
          {step === 4 && (
            <div>
              <BackButton onClick={() => goTo(3)} />
              <SectionTitle>Current Condition</SectionTitle>
              <p className="text-sm mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
                Answer these 3 quick checks.
              </p>
              <div className="space-y-4">
                {[
                  { id: 'can_walk',      label: 'Can you walk normally?' },
                  { id: 'speak_properly',label: 'Are you able to speak properly?' },
                  { id: 'dizzy',         label: 'Are you feeling dizzy?' },
                ].map(q => (
                  <div key={q.id} className="rounded-xl p-4" style={{ backgroundColor: 'rgb(var(--bg-hover))' }}>
                    <QuestionLabel>{q.label}</QuestionLabel>
                    <YesNoQuestion
                      value={conditionAnswers[q.id]}
                      onChange={(v) => setConditionAnswers({ ...conditionAnswers, [q.id]: v })}
                    />
                  </div>
                ))}
              </div>
              <button
                disabled={!conditionAnswers.can_walk || !conditionAnswers.speak_properly || !conditionAnswers.dizzy}
                onClick={() => goTo(5)}
                className="btn-primary w-full mt-6"
              >
                Next <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Step 5 – Vitals Placard */}
          {step === 5 && (
            <div>
              <BackButton onClick={() => goTo(4)} />
              <SectionTitle>Clinical Vitals (Optional)</SectionTitle>
              <p className="text-sm mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
                If you have access to measurement tools, provide your readings.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <QuestionLabel>RR (Respirations)</QuestionLabel>
                  <input type="number" className="input-field" placeholder="e.g. 18" value={vitalsAnswers.rr} onChange={e => setVitalsAnswers({...vitalsAnswers, rr: e.target.value})} />
                </div>
                <div>
                  <QuestionLabel>Pulse (BPM)</QuestionLabel>
                  <input type="number" className="input-field" placeholder="e.g. 80" value={vitalsAnswers.pulse} onChange={e => setVitalsAnswers({...vitalsAnswers, pulse: e.target.value})} />
                </div>
                <div>
                  <QuestionLabel>SpO₂ (%)</QuestionLabel>
                  <input type="number" className="input-field" placeholder="e.g. 98" value={vitalsAnswers.spo2} onChange={e => setVitalsAnswers({...vitalsAnswers, spo2: e.target.value})} />
                </div>
                <div>
                  <QuestionLabel>CRT (seconds)</QuestionLabel>
                  <input type="number" className="input-field" placeholder="e.g. 2" value={vitalsAnswers.crt} onChange={e => setVitalsAnswers({...vitalsAnswers, crt: e.target.value})} />
                </div>
              </div>

              <button
                onClick={() => goTo(6)}
                className="btn-primary w-full mt-6"
              >
                Review <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Step 6 – Review & submit */}
          {step === 6 && (
            <div className="text-center py-4">
              <div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-5"
                style={{ backgroundColor: 'rgba(125,170,203,0.15)', color: 'rgb(var(--accent))' }}
              >
                <ShieldAlert size={38} />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">Ready to Submit</h2>
              <p className="text-sm max-w-xs mx-auto" style={{ color: 'rgb(var(--text-secondary))' }}>
                Your symptoms are securely recorded and will be analyzed to direct you to the best hospital.
              </p>

              <div
                className="flex flex-col gap-2 text-left mt-8 mb-6 p-4 rounded-xl"
                style={{ backgroundColor: 'rgb(var(--bg-hover))' }}
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>Summary</p>
                <SummaryRow label="Symptoms" value={selectedSymptoms.join(', ')} />
                <SummaryRow label="Additional notes" value={additionalNotes || 'None'} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => goTo(1)} className="btn-secondary flex-1">Edit Answers</button>
                <button onClick={submitSymptoms} disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Submitting…' : 'Submit & Find Hospital'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Helpers ── */
function SectionTitle({ children }) {
  return <h2 className="text-xl font-bold tracking-tight mb-1">{children}</h2>;
}
function QuestionLabel({ children }) {
  return <p className="text-sm font-semibold mb-3">{children}</p>;
}
function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm font-semibold mb-5"
      style={{ color: 'rgb(var(--text-secondary))' }}>
      <ArrowLeft size={16} /> Back
    </button>
  );
}
function YesNoQuestion({ question, value, onChange }) {
  return (
    <div>
      {question && <QuestionLabel>{question}</QuestionLabel>}
      <div className="flex gap-3">
        {['Yes', 'No'].map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className="flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all"
            style={{
              borderColor: value === opt ? 'rgb(var(--accent))' : 'rgb(var(--border-color))',
              backgroundColor: value === opt ? 'rgba(125,170,203,0.12)' : 'transparent',
              color: value === opt ? 'rgb(var(--accent))' : 'rgb(var(--text-primary))',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
function OptionRow({ options, value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all"
          style={{
            borderColor: value === opt ? 'rgb(var(--accent))' : 'rgb(var(--border-color))',
            backgroundColor: value === opt ? 'rgba(125,170,203,0.12)' : 'transparent',
            color: value === opt ? 'rgb(var(--accent))' : 'rgb(var(--text-primary))',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span style={{ color: 'rgb(var(--text-secondary))' }}>{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}
