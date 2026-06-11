const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'priora_super_secret_jwt_token_2026';

// Initialize static hospitals if empty
async function initHospitals() {
  const count = await prisma.hospital.count();
  if (count === 0) {
    const defaultHospitals = [
      { name: 'NMAMIT Hospital', lat: 13.182, lng: 74.934, address: 'Nitte Campus', phone: '555-0101', availableBeds: 120, icuBeds: 15, availableDoctors: 25, ambulances: 5 },
      { name: 'Nitte Rural Medical Center', lat: 13.185, lng: 74.938, address: 'Nitte Village', phone: '555-0102', availableBeds: 45, icuBeds: 5, availableDoctors: 8, ambulances: 2 },
      { name: 'Government hospital', lat: 13.190, lng: 74.940, address: 'Karkala', phone: '555-0103', availableBeds: 150, icuBeds: 10, availableDoctors: 20, ambulances: 3 },
      { name: 'Nitte Community Health Centre', lat: 13.180, lng: 74.930, address: 'Nitte', phone: '555-0104', availableBeds: 30, icuBeds: 2, availableDoctors: 4, ambulances: 1 },
      { name: 'Nitte Gajria Hospital', lat: 13.188, lng: 74.932, address: 'Karkala Road', phone: '555-0105', availableBeds: 80, icuBeds: 12, availableDoctors: 15, ambulances: 4 },
      { name: 'Dr.T.M.A. Pai Rotary Hospital', lat: 13.195, lng: 74.945, address: 'Karkala Main', phone: '555-0106', availableBeds: 200, icuBeds: 30, availableDoctors: 40, ambulances: 8 },
      { name: 'Spandana Maternity & General Hospital', lat: 13.175, lng: 74.925, address: 'Udupi Highway', phone: '555-0107', availableBeds: 60, icuBeds: 8, availableDoctors: 12, ambulances: 2 },
      { name: 'Mount Rosary Hospital', lat: 13.200, lng: 74.950, address: 'Karkala Center', phone: '555-0108', availableBeds: 90, icuBeds: 10, availableDoctors: 18, ambulances: 3 }
    ];
    for (let data of defaultHospitals) {
      await prisma.hospital.create({ data });
    }
    console.log('Seeded static hospitals.');
  }
}
initHospitals();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { 
      role, name, phone, email, password,
      // Patient optional
      history_diabetes, history_bp, history_allergies,
      // Admin required
      hospitalId
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, phone, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const existingPhone = await prisma.user.findFirst({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number is already associated with an account' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    let data = {
      role: role || 'PATIENT',
      name,
      phone,
      email,
      password_hash,
    };

    if (data.role === 'PATIENT') {
      data = { 
        ...data, 
        history_diabetes: history_diabetes || false,
        history_bp: history_bp || '',
        history_allergies: history_allergies || ''
      };
    } else if (data.role === 'ADMIN') {
      if (!hospitalId) {
         return res.status(400).json({ error: 'Hospital ID is required for Admins' });
      }
      data.hospitalId = hospitalId;
    }

    const user = await prisma.user.create({ data });
    const token = jwt.sign({ id: user.id, role: user.role, hospitalId: user.hospitalId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, hospitalId: user.hospitalId, medicalProfileData: user.medicalProfileData }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, hospitalId: user.hospitalId }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, hospitalId: user.hospitalId, medicalProfileData: user.medicalProfileData }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
