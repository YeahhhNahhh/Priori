const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { calculatePriority, calculateQueueETA } = require('../utils/priority');
const { recalculateQueue } = require('../utils/syncQueue');

const prisma = new PrismaClient();

// POST /api/triage/symptoms
// Save symptoms & calculate priority
router.post('/symptoms', async (req, res) => {
  try {
    const { 
      patientId, familyProfileId, 
      symptoms, targetedAnswers, additionalNotes, conditionAnswers, vitalsAnswers 
    } = req.body;

    const symptomsStr = JSON.stringify(symptoms || []);
    const targetedStr = JSON.stringify(targetedAnswers || {});
    
    // Merge nested vitals into condition blob
    const combinedConditions = { ...(conditionAnswers || {}), vitals: vitalsAnswers || {} };
    const conditionStr = JSON.stringify(combinedConditions);

    // Calculate priority
    const { priorityLevel, priorityInsight, baseEta } = calculatePriority(symptomsStr, conditionStr, targetedStr);

    // Create unassigned case
    const triageCase = await prisma.triageCase.create({
      data: {
        patientId,
        familyProfileId: familyProfileId || null,
        symptoms: symptomsStr,
        targetedAnswers: targetedStr,
        additionalNotes,
        conditionAnswers: conditionStr,
        priorityLevel,
        priorityInsight,
        etaMinutes: baseEta, // Will be updated on assignment
        status: 'IN_QUEUE'
      }
    });

    res.json({ success: true, caseId: triageCase.id, priorityLevel, etaMinutes: baseEta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/triage/assign 
// Assign case to hospital
router.post('/assign', async (req, res) => {
  try {
    const { caseId, hospitalId, locationLat, locationLng } = req.body;

    // Update to assigned initially, real position set by recalculateQueue
    const updatedCase = await prisma.triageCase.update({
      where: { id: caseId },
      data: {
        hospitalId,
        locationLat,
        locationLng,
        queuePosition: 999,
        etaMinutes: 999
      },
      include: {
        patient: { select: { name: true, phone: true } },
        familyProfile: { select: { name: true } }
      }
    });

    const io = req.app.get('io');

    // Dynamically Shift Queue and Emit Sockets
    await recalculateQueue(hospitalId, io);

    // Determine target name
    const patientName = updatedCase.familyProfile ? updatedCase.familyProfile.name : updatedCase.patient.name;

    // Emit via socket
    if (io) {
      io.to(`hospital_${hospitalId}`).emit('NEW_CASE', { 
        ...updatedCase,
        displayName: patientName
      });
    }

    res.json({ success: true, case: updatedCase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/triage/patient/:patientId
// Get cases for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const cases = await prisma.triageCase.findMany({
      where: { patientId: req.params.patientId },
      include: { hospital: true, familyProfile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
