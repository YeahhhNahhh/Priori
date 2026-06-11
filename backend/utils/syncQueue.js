const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371;
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}
function deg2rad(deg) { return deg * (Math.PI/180) }

async function recalculateQueue(hospitalId, io) {
  try {
    // 1. Fetch active queue
    const queue = await prisma.triageCase.findMany({
      where: { hospitalId, status: { in: ['IN_QUEUE', 'ARRIVED'] } },
      orderBy: [{ createdAt: 'asc' }],
      include: { hospital: true }
    });

    // 2. Sort by Priority then Time
    const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    queue.sort((a, b) => {
      if (priorityWeight[a.priorityLevel] !== priorityWeight[b.priorityLevel]) {
        return priorityWeight[b.priorityLevel] - priorityWeight[a.priorityLevel];
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // 3. Re-assign ETA based on Index
    for (let i = 0; i < queue.length; i++) {
      const c = queue[i];
      let baseEta = 60;
      if (c.priorityLevel === 'HIGH') baseEta = 10;
      if (c.priorityLevel === 'MEDIUM') baseEta = 30;
      
      let travelTimeMins = 0;
      if (c.locationLat && c.locationLng && c.hospital?.lat && c.hospital?.lng) {
        const dist = getDistanceFromLatLonInKm(c.locationLat, c.locationLng, c.hospital.lat, c.hospital.lng);
        travelTimeMins = Math.round(dist * 2);
      }
      
      const dynamicEta = baseEta + (i * 10) + travelTimeMins;
      const dynamicPos = i + 1;

      if (c.etaMinutes !== dynamicEta || c.queuePosition !== dynamicPos) {
        const updated = await prisma.triageCase.update({
          where: { id: c.id },
          data: { etaMinutes: dynamicEta, queuePosition: dynamicPos },
          include: { 
            hospital: true, 
            patient: { select: { name: true, phone: true } }, 
            familyProfile: { select: { name: true, phone: true } } 
          }
        });

        // 4. Notify specific patient that their ETA shifted
        if (io) {
          io.to(`session_${c.patientId}`).emit('CASE_UPDATED', updated);
        }
      }
    }

    // 5. Tell the hospital admin dashboard to refresh visually
    if (io) {
      io.to(`hospital_${hospitalId}`).emit('QUEUE_UPDATED');
    }
  } catch (error) {
    console.error('Error recalculating queue:', error);
  }
}

module.exports = { recalculateQueue };
