const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany();
    
    // Attach current queue lengths
    const stats = await Promise.all(hospitals.map(async (h) => {
      const queueLen = await prisma.triageCase.count({
        where: { hospitalId: h.id, status: { in: ['IN_QUEUE', 'ARRIVED'] } }
      });
      return { ...h, currentQueueLength: queueLen };
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hospitals/alerts
// Admin sending an alert to a patient
router.post('/alerts', async (req, res) => {
  try {
    const { hospitalId, targetPatientId, message } = req.body;
    const alert = await prisma.alert.create({
      data: { hospitalId, targetPatientId, message }
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`session_${targetPatientId}`).emit('NEW_ALERT', alert);
    }
    
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/hospitals/alerts/:patientId
router.get('/alerts/:patientId', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { targetPatientId: req.params.patientId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
