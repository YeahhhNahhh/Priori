import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLocation } from '../context/LocationContext';
import { Navigation } from 'lucide-react';

// Custom Map Center Updater Hook
function MapFlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 });
  }, [lat, lng, map]);
  return null;
}

// Custom CSS Pulse Icon
const pulseIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background-color: rgb(var(--accent));
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(125,170,203,0.8);
    animation: pulse 1.5s infinite;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

export default function LiveMap() {
  const { location, address, error } = useLocation();

  if (error) {
    return (
      <div className="w-full h-48 rounded-xl flex flex-col items-center justify-center p-4 text-center border" style={{ backgroundColor: 'rgb(var(--bg-secondary))', borderColor: 'rgb(var(--border-color))' }}>
        <p className="text-sm font-bold text-red-500 mb-1">Location Unavailable</p>
        <p className="text-xs text-[rgb(var(--text-secondary))]">{error}</p>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="w-full h-48 rounded-xl flex flex-col items-center justify-center gap-3 border" style={{ backgroundColor: 'rgb(var(--bg-secondary))', borderColor: 'rgb(var(--border-color))' }}>
        <Navigation size={24} className="animate-pulse-soft" style={{ color: 'rgb(var(--accent))' }} />
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>Acquiring Signal...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-sm relative border" style={{ height: '300px', borderColor: 'rgb(var(--border-color))' }}>
      <MapContainer 
        center={[location.lat, location.lng]} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapFlyTo lat={location.lat} lng={location.lng} />
        <Marker position={[location.lat, location.lng]} icon={pulseIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold mb-1" style={{ fontSize: '13px' }}>Current Location</p>
              <p style={{ fontSize: '11px', color: '#666' }}>{address || 'Fetching address...'}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay status tag */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full shadow-md z-[1000] flex items-center gap-2 backdrop-blur-md" 
           style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(var(--accent))', animation: 'pulse 2s infinite' }}></span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-800">Live GPS</span>
      </div>
      
      {address && (
         <div className="absolute bottom-3 left-3 right-3 px-4 py-2.5 rounded-xl shadow-lg z-[1000] backdrop-blur-md" 
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
           <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Approximate Address</p>
           <p className="text-sm font-semibold truncate text-slate-800">{address}</p>
         </div>
      )}
    </div>
  );
}
