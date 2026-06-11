const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/patient/:userId
// Fetch patient details (Used by Admin lookup and patient profile)
router.get('/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: { 
        dependents: true,
        triageCases: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Omit sensitive data
    const { password_hash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/patient/:userId/family
router.get('/:userId/family', async (req, res) => {
  try {
    const family = await prisma.familyProfile.findMany({
      where: { userId: req.params.userId }
    });
    res.json(family);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST /api/patient/:userId/family
router.post('/:userId/family', async (req, res) => {
  try {
    const { name, age, gender, relationship, phone, history_diabetes, history_bp, history_allergies, history_notes } = req.body;
    const profile = await prisma.familyProfile.create({
      data: {
        userId: req.params.userId,
        name, age: parseInt(age), gender, relationship, phone,
        history_bp, history_allergies, history_notes, medicalProfileData: req.body.medicalProfileData
      }
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/patient/medical-history/:userId
router.patch('/medical-history/:userId', async (req, res) => {
  try {
    const { 
      history_diabetes, history_bp, history_allergies, medicalProfileData 
    } = req.body;
    
    const updateData = {};
    if (typeof history_diabetes !== 'undefined') updateData.history_diabetes = history_diabetes;
    if (history_bp !== undefined) updateData.history_bp = history_bp;
    if (history_allergies !== undefined) updateData.history_allergies = history_allergies;
    if (medicalProfileData !== undefined) updateData.medicalProfileData = medicalProfileData;

    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: updateData
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/patient/feedback
router.post('/feedback', async (req, res) => {
  try {
    const { patientId, hospitalId, experience, easeOfUse, timeTaken, clarity, helpfulness, comments } = req.body;
    const feedback = await prisma.feedback.create({
      data: { patientId, hospitalId: hospitalId || null, experience, easeOfUse, timeTaken, clarity, helpfulness, comments }
    });
    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
