const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}
function deg2rad(deg) { return deg * (Math.PI/180) }

// POST /api/sos
router.post('/', async (req, res) => {
  try {
    const { patientId, locationLat, locationLng, description, ambulanceRequired, requirements } = req.body;
    
    const hospitals = await prisma.hospital.findMany();
    
    // Filter by available ambulances if requested
    let validHospitals = hospitals;
    if (ambulanceRequired) {
      validHospitals = hospitals.filter(h => h.ambulances > 0);
      if (validHospitals.length === 0) validHospitals = hospitals; // fallback if no ambulances anywhere
    }

    let closestHospital = validHospitals[0];
    let minDist = Infinity;

    validHospitals.forEach(h => {
      const dist = getDistanceFromLatLonInKm(locationLat, locationLng, h.lat, h.lng);
      if (dist < minDist) {
        minDist = dist;
        closestHospital = h;
      }
    });

    const sosReq = await prisma.sOSRequest.create({
      data: {
        patientId,
        hospitalId: closestHospital.id,
        locationLat,
        locationLng,
        description,
        ambulanceRequired,
        requirements: JSON.stringify(requirements || []),
        status: 'PENDING'
      },
      include: { patient: { select: { name: true, phone: true } } }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`hospital_${closestHospital.id}`).emit('NEW_SOS', sosReq);
    }

    res.json({ success: true, sos: sosReq, hospital: closestHospital });
  } catch (error) {
    console.error('SOS Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sos/:hospitalId
router.get('/:hospitalId', async (req, res) => {
  try {
    const requests = await prisma.sOSRequest.findMany({
      where: { hospitalId: req.params.hospitalId, status: { not: 'RESOLVED' } },
      include: { patient: { select: { name: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/sos/:id/dispatch
router.patch('/:id/dispatch', async (req, res) => {
  try {
    const updated = await prisma.sOSRequest.update({
      where: { id: req.params.id },
      data: { status: 'DISPATCHED' }
    });
    const io = req.app.get('io');
    if (io) {
      io.to(`session_${updated.patientId}`).emit('AMBULANCE_DISPATCHED', updated);
    }
    res.json({ success: true, sos: updated });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
