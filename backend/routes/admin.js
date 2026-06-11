const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { recalculateQueue } = require('../utils/syncQueue');

const prisma = new PrismaClient();

// GET /api/admin/queue/:hospitalId
router.get('/queue/:hospitalId', async (req, res) => {
  try {
    const queue = await prisma.triageCase.findMany({
      where: { hospitalId: req.params.hospitalId, status: { in: ['IN_QUEUE', 'ARRIVED'] } },
      include: {
        patient: { select: { name: true, phone: true } },
        familyProfile: { select: { name: true, phone: true } }
      },
      orderBy: [
        { priorityLevel: 'asc' }, // HIGH, LOW, MEDIUM alphabetic sorting is flawed. Wait, Prisma SQLite doesn't let us easily sort by custom enum. We will sort in memory.
        { createdAt: 'asc' }
      ]
    });

    // In-memory sort for Priority: HIGH -> MEDIUM -> LOW
    const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    queue.sort((a, b) => {
      if (priorityWeight[a.priorityLevel] !== priorityWeight[b.priorityLevel]) {
        return priorityWeight[b.priorityLevel] - priorityWeight[a.priorityLevel];
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/case/:caseId/status
router.patch('/case/:caseId/status', async (req, res) => {
  try {
    const { status } = req.body; // ARRIVED, SEEN_BY_DOCTOR
    const updatedCase = await prisma.triageCase.update({
      where: { id: req.params.caseId },
      data: { status }
    });

    const io = req.app.get('io');
    if (io) {
      if (status === 'SEEN_BY_DOCTOR') {
        io.to(`session_${updatedCase.patientId}`).emit('FEEDBACK_UNLOCKED', { caseId: updatedCase.id });
      }
      io.to(`hospital_${updatedCase.hospitalId}`).emit('QUEUE_UPDATED');
      // Fix: Ensure the exact patient receives the update in absolute real-time
      io.to(`session_${updatedCase.patientId}`).emit('CASE_UPDATED', updatedCase);
    }

    res.json({ success: true, case: updatedCase });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/case/:caseId/update
// Full Admin Override of Patient Details
router.patch('/case/:caseId/update', async (req, res) => {
  try {
    const { priorityLevel, priorityInsight, isFlagged } = req.body;
    let updateData = {};
    if (priorityLevel) updateData.priorityLevel = priorityLevel;
    
    // Add flags
    if (isFlagged !== undefined) {
      updateData.priorityInsight = isFlagged 
        ? `[FLAGGED] ${priorityInsight || 'Manually flagged by Admin'}` 
        : priorityInsight;
    } else if (priorityInsight) {
      updateData.priorityInsight = priorityInsight;
    }

    const originalCase = await prisma.triageCase.findUnique({ where: { id: req.params.caseId } });

    const updatedCase = await prisma.triageCase.update({
      where: { id: req.params.caseId },
      data: updateData,
      include: {
        patient: { select: { name: true, phone: true } },
        familyProfile: { select: { name: true, phone: true } }
      }
    });

    const io = req.app.get('io');
    
    if (updateData.status && updateData.status !== originalCase.status) {
      await recalculateQueue(updatedCase.hospitalId, io);
    } else if (io) {
      io.to(`hospital_${updatedCase.hospitalId}`).emit('QUEUE_UPDATED');
      io.to(`session_${updatedCase.patientId}`).emit('CASE_UPDATED', updatedCase);
    }

    res.json({ success: true, case: updatedCase });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/patient/:userId
router.get('/patient/:userId', async (req, res) => {
  try {
    const p = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, name: true, phone: true, email: true, medicalProfileData: true }
    });
    if (!p) return res.status(404).json({ error: 'Patient not found' });
    
    // Grab latest cases
    const cases = await prisma.triageCase.findMany({
      where: { patientId: p.id },
      include: { hospital: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ patient: p, history: cases });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/case/:caseId
// Used by PatientDetails view on Admin Side
router.get('/case/:caseId', async (req, res) => {
  try {
    const tCase = await prisma.triageCase.findUnique({
      where: { id: req.params.caseId },
      include: {
        patient: true,
        familyProfile: true
      }
    });
    if (!tCase) return res.status(404).json({ error: "Not found" });
    res.json(tCase);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/metrics/:hospitalId
router.get('/metrics/:hospitalId', async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({ where: { id: req.params.hospitalId } });
    const queueCount = await prisma.triageCase.count({ where: { hospitalId: req.params.hospitalId, status: { in: ['IN_QUEUE', 'ARRIVED'] } } });
    
    res.json({
      availableBeds: hospital.availableBeds,
      icuBeds: hospital.icuBeds,
      availableDoctors: hospital.availableDoctors,
      ambulances: hospital.ambulances,
      liveQueueSize: queueCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
