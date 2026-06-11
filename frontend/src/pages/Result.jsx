import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialResult = location.state?.result;
  
  const [result, setResult] = useState(initialResult);

  useEffect(() => {
    if (!initialResult) {
      navigate('/triage');
      return;
    }

    const socket = io('http://localhost:5001');
    
    // Listen for queue updates 
    socket.on('ETA_UPDATED', (payload) => {
      // Assuming payload has updated dynamic_eta for this user
      if (payload.qr_code === result.qr_code && payload.dynamic_eta !== undefined) {
        setResult(prev => ({ ...prev, dynamic_eta: payload.dynamic_eta }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [initialResult, navigate, result?.qr_code]);

  if (!result) return <div>Loading...</div>;

  let colorClass = 'box-green';
  if (result.calculated_color === 'RED') colorClass = 'box-red';
  if (result.calculated_color === 'YELLOW') colorClass = 'box-yellow';

  return (
    <div className="page">
      <h2>Triage Result</h2>
      
      <div className={`result-box ${colorClass}`}>
        <h3 style={{ marginTop: 0 }}>Priority: {result.calculated_color}</h3>
        <p><strong>Score:</strong> {result.score}</p>
        <p><strong>Estimated Wait Time:</strong> {result.dynamic_eta} minutes</p>
      </div>



      <button onClick={() => navigate('/triage')} style={{ marginTop: '20px' }}>Submit Another Patient</button>
    </div>
  );
}
