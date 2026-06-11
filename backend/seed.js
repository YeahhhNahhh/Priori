const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Custom Hospitals, Admins, and Dummy Cases for Karnataka Region...");

  await prisma.feedback.deleteMany();
  await prisma.sOSRequest.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.triageCase.deleteMany();
  await prisma.familyProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.hospital.deleteMany();

  const hospitalsData = [
    { name: 'NMAMIT Hospital', lat: 13.182, lng: 74.934, address: 'Nitte Campus', availableBeds: 120, icuBeds: 15, availableDoctors: 25, ambulances: 5 },
    { name: 'Nitte Rural Medical Center', lat: 13.185, lng: 74.938, address: 'Nitte Village', availableBeds: 45, icuBeds: 5, availableDoctors: 8, ambulances: 2 },
    { name: 'Government hospital', lat: 13.190, lng: 74.940, address: 'Karkala', availableBeds: 150, icuBeds: 10, availableDoctors: 20, ambulances: 3 },
    { name: 'Nitte Community Health Centre', lat: 13.180, lng: 74.930, address: 'Nitte', availableBeds: 30, icuBeds: 2, availableDoctors: 4, ambulances: 1 },
    { name: 'Nitte Gajria Hospital', lat: 13.188, lng: 74.932, address: 'Karkala Road', availableBeds: 80, icuBeds: 12, availableDoctors: 15, ambulances: 4 },
    { name: 'Dr.T.M.A. Pai Rotary Hospital', lat: 13.195, lng: 74.945, address: 'Karkala Main', availableBeds: 200, icuBeds: 30, availableDoctors: 40, ambulances: 8 },
    { name: 'Spandana Maternity & General Hospital', lat: 13.175, lng: 74.925, address: 'Udupi Highway', availableBeds: 60, icuBeds: 8, availableDoctors: 12, ambulances: 2 },
    { name: 'Mount Rosary Hospital', lat: 13.200, lng: 74.950, address: 'Karkala Center', availableBeds: 90, icuBeds: 10, availableDoctors: 18, ambulances: 3 }
  ];

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  const pHash = await bcrypt.hash('password123', salt);

  let outputText = "=== Priori System Credentials ===\n\n[ HOSPITAL ADMINS (Password for all: admin123) ]\n";
  const createdHospitals = [];

  const adminNames = [
    'Dr. Ramesh Bhat', 'Dr. Sunita Shetty', 'Dr. Anand Rao', 'Dr. Kavitha Poojary',
    'Dr. Rajesh Kumar', 'Dr. Lakshmi Narayan', 'Dr. Suresh Prabhu', 'Dr. Meenakshi Iyer'
  ];

  for (let i = 0; i < hospitalsData.length; i++) {
    const h = await prisma.hospital.create({ data: hospitalsData[i] });
    createdHospitals.push(h);

    const email = `admin${i+1}@${h.name.replace(/\s+/g, '').replace(/&/g, 'and').replace(/\./g, '').toLowerCase()}.com`;
    const adminName = adminNames[i] || `Dr. Admin ${i+1}`;
    await prisma.user.create({
      data: {
        name: adminName,
        email: email,
        password_hash: passwordHash,
        role: 'ADMIN',
        hospitalId: h.id
      }
    });

    outputText += `- ${h.name} (${adminName}): ${email}\n`;
  }

  outputText += "\n[ DUMMY PATIENTS IN QUEUE (Password for all: password123) ]\n";

  // Add 10 dummy patients for the first 3 hospitals
  const nearestHospitals = createdHospitals.slice(0, 3);
  let patientCounter = 1;

  const priorities = ['HIGH', 'MEDIUM', 'LOW'];
  const baseLat = 13.182;
  const baseLng = 74.934;

  const firstNames = ['Arjun', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Anjali', 'Karthik', 'Divya', 'Sanjay', 'Pooja', 'Ravi', 'Kavya', 'Manoj', 'Shruti', 'Deepak', 'Meghana', 'Kiran', 'Swati', 'Nitin', 'Nandini', 'Vikas', 'Rashmi', 'Pradeep', 'Pallavi', 'Santosh'];
  const lastNames = ['Shetty', 'Rao', 'Bhat', 'Prabhu', 'Poojary', 'Kamath', 'Nayak', 'Shenoy', 'Mallya', 'Naik', 'Kini', 'Pai', 'Gowda', 'Hegde', 'Baliga'];

  for (let h of nearestHospitals) {
    outputText += `\n--- Patients in queue for ${h.name} ---\n`;
    
    for (let i = 0; i < 10; i++) {
      const email = `patient${patientCounter}@demo.com`;
      
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${fn} ${ln}`;
      
      const pat = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password_hash: pHash,
          role: 'PATIENT',
          phone: `555-00${patientCounter.toString().padStart(2, '0')}`,
          medicalProfileData: JSON.stringify({ age: 20 + Math.floor(Math.random() * 40), bloodGroup: 'O+' })
        }
      });
      
      const pLevel = priorities[i % 3];
      await prisma.triageCase.create({
        data: {
          patientId: pat.id,
          hospitalId: h.id,
          symptoms: JSON.stringify(["Fever", "Pain"]),
          targetedAnswers: "{}",
          conditionAnswers: JSON.stringify({ can_walk: 'Yes' }),
          priorityLevel: pLevel,
          priorityInsight: `Auto-generated ${pLevel} priority case for testing`,
          etaMinutes: 5 + (i * 10),
          status: 'IN_QUEUE',
          queuePosition: i + 1,
          locationLat: baseLat + (Math.random() * 0.05),
          locationLng: baseLng + (Math.random() * 0.05)
        }
      });

      outputText += `- ${name} | Check-in: ${email}\n`;
      patientCounter++;
    }
  }

  fs.writeFileSync('login_details.txt', outputText);

  console.log("✅ Seed complete!");
  console.log("✅ Created login_details.txt successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
