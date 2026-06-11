import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null); // { lat, lng }
  const [address, setAddress] = useState(null);   // string, e.g., "Los Angeles, CA"
  const [error, setError] = useState(null);
  
  // Throttle API requests based on 100-meter minimum movement tolerance
  const lastGeocodedLocation = useRef(null);
  const cache = useRef(new Map());

  // Calculates distance in km using Haversine
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const reverseGeocode = async (lat, lng) => {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`; // approx ~11m precision box
    
    if (cache.current.has(key)) {
      setAddress(cache.current.get(key));
      return;
    }

    try {
      // Nominatim requires a user-agent and respects 1 request/sec max global limit.
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      
      let formattedAddress = 'Unknown Location';
      if (data && data.address) {
        const ad = data.address;
        const city = ad.city || ad.town || ad.village || ad.suburb;
        if (city && ad.state) {
          formattedAddress = `${city}, ${ad.state}`;
        } else if (ad.county && ad.state) {
          formattedAddress = `${ad.county}, ${ad.state}`;
        } else {
          formattedAddress = data.display_name.split(',').slice(0, 2).join(', ');
        }
      }

      cache.current.set(key, formattedAddress);
      setAddress(formattedAddress);
      lastGeocodedLocation.current = { lat, lng };
    } catch (err) {
      console.error("Reverse Geocoding Failed:", err);
    }
  };

  useEffect(() => {
    // FORCE HARDCODED NITTE LOCATION FOR TESTING
    const lat = 13.183;
    const lng = 74.934;
    setLocation({ lat, lng });
    setAddress("NMAMIT, Nitte, Karkala, Karnataka");
    setError(null);
    lastGeocodedLocation.current = { lat, lng };

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported. Using mock.");
      return;
    }

    const success = (position) => {
      // OVERRIDING HARDWARE LOCATION FOR TESTING
      const lat = 13.183;
      const lng = 74.934;
      setLocation({ lat, lng });
      setError(null);

      if (!lastGeocodedLocation.current || getDistanceFromLatLonInKm(lastGeocodedLocation.current.lat, lastGeocodedLocation.current.lng, lat, lng) > 0.2) {
        reverseGeocode(lat, lng);
      }
    };

    const fail = (err) => {
      console.warn(`Geolocation Error (${err.code}): ${err.message}`);
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        console.warn("Using Localhost mock NMAMIT coordinates due to blocked GPS");
        const lat = 13.183; // NMAMIT Nitte
        const lng = 74.934;
        setLocation({ lat, lng });
        reverseGeocode(lat, lng);
      } else {
        setError("Location access denied.");
      }
    };

    const id = navigator.geolocation.watchPosition(success, fail, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 60000
    });

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return (
    <LocationContext.Provider value={{ location, address, error }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
