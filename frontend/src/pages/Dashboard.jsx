import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function Dashboard() {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    socket.emit('join_hospital', '123'); // Assume mock hospital 123
    
    socket.on('QUEUE_UPDATED', (data) => {
      setQueue(data);
    });

    socket.on('NEW_PATIENT_QUEUE', (patientData) => {
      setQueue(prev => {
        const sorted = [...prev, patientData].sort((a,b) => b.score - a.score);
        return sorted;
      });
    });

    // Mock initial fetch
    setQueue([
      { id: '1', score: 85, color: 'RED', symptoms: ['chest_pain'], eta: 0 },
      { id: '2', score: 55, color: 'YELLOW', symptoms: ['breathing_difficulty'], eta: 15 },
      { id: '3', score: 20, color: 'GREEN', symptoms: ['headache'], eta: 45 },
    ]);

    return () => {
      socket.off('QUEUE_UPDATED');
      socket.off('NEW_PATIENT_QUEUE');
    };
  }, []);

  return (
    <div className="app-container" style={{ padding: '40px', background: 'var(--bg-color)' }}>
      <h1 style={{ marginBottom: '24px', fontWeight: 800 }}>Hospital Admin Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Real-time priority queue monitoring.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        
        {/* RED QUEUE */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '6px solid var(--color-red)' }}>
          <h2 style={{ color: 'var(--color-red)', marginBottom: '16px' }}>CRITICAL (RED)</h2>
          {queue.filter(p => p.color === 'RED').map(p => (
            <div key={p.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Patient #{p.id}</span>
                <span style={{ color: 'var(--color-red)', fontWeight: 'bold' }}>Score: {p.score}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Symptoms: {p.symptoms.join(', ')}</p>
              <button style={{ marginTop: '12px', padding: '6px 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Overide / Admit</button>
            </div>
          ))}
        </div>

        {/* YELLOW QUEUE */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '6px solid var(--color-yellow)' }}>
          <h2 style={{ color: 'var(--color-yellow)', marginBottom: '16px' }}>URGENT (YELLOW)</h2>
          {queue.filter(p => p.color === 'YELLOW').map(p => (
            <div key={p.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Patient #{p.id}</span>
                <span style={{ color: 'var(--color-yellow)', fontWeight: 'bold' }}>Score: {p.score}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Symptoms: {p.symptoms.join(', ')}</p>
            </div>
          ))}
        </div>

        {/* GREEN QUEUE */}
        <div className="glass-panel" style={{ padding: '24px', borderTop: '6px solid var(--color-green)' }}>
          <h2 style={{ color: 'var(--color-green)', marginBottom: '16px' }}>STANDARD (GREEN)</h2>
          {queue.filter(p => p.color === 'GREEN').map(p => (
            <div key={p.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>Patient #{p.id}</span>
                <span style={{ color: 'var(--color-green)', fontWeight: 'bold' }}>Score: {p.score}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Symptoms: {p.symptoms.join(', ')}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
