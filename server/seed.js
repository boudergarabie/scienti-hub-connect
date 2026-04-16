import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Speaker from './models/Speaker.js';
import Agenda from './models/Agenda.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Mock Data
const speakers = [
  { _id: "661cd8f830d939eabc417a01", fullName: "Prof. Amina Bensalem", title: "Professor", affiliation: "University of Algiers", country: "Algeria", theme: "Renewable Energy Systems", biography: "Leading researcher in solar energy integration with 20+ years of experience in photovoltaic systems and grid optimization.", photoUrl: "" },
  { _id: "661cd8f830d939eabc417a02", fullName: "Dr. Jean-Luc Moreau", title: "Researcher", affiliation: "CNRS, Paris", country: "France", theme: "Artificial Intelligence & Ethics", biography: "Expert in responsible AI development, focusing on bias detection and fairness in machine learning algorithms.", photoUrl: "" },
  { _id: "661cd8f830d939eabc417a03", fullName: "Prof. Fatima Zahra El-Idrissi", title: "Professor", affiliation: "Mohammed V University, Rabat", country: "Morocco", theme: "Biotechnology & Health", biography: "Specialist in genomic medicine and biomarker discovery for rare diseases in North African populations.", photoUrl: "" },
  { _id: "661cd8f830d939eabc417a04", fullName: "Dr. Hans Weber", title: "Senior Researcher", affiliation: "TU Munich", country: "Germany", theme: "Smart Materials & Nanotechnology", biography: "Pioneering work in self-healing polymers and adaptive materials for aerospace and biomedical applications.", photoUrl: "" },
  { _id: "661cd8f830d939eabc417a05", fullName: "Prof. Aisha Okonkwo", title: "Professor", affiliation: "University of Lagos", country: "Nigeria", theme: "Digital Transformation in Education", biography: "Advocate for EdTech in developing nations, with large-scale deployments reaching over 500,000 students.", photoUrl: "" },
];

const agenda = [
  { timeSlot: "09:00 - 09:45", startHour: 9, endHour: 9.75, day: 1, sessionTitle: "Opening Ceremony & Keynote", speakerId: "661cd8f830d939eabc417a01", roomLocation: "Main Auditorium", theme: "Renewable Energy Systems" },
  { timeSlot: "10:00 - 10:45", startHour: 10, endHour: 10.75, day: 1, sessionTitle: "Solar Energy Integration in Smart Grids", speakerId: "661cd8f830d939eabc417a01", roomLocation: "Main Auditorium", theme: "Renewable Energy Systems" },
  { timeSlot: "11:00 - 11:45", startHour: 11, endHour: 11.75, day: 1, sessionTitle: "Responsible AI: Detecting Algorithmic Bias", speakerId: "661cd8f830d939eabc417a02", roomLocation: "Hall B", theme: "Artificial Intelligence & Ethics" },
  { timeSlot: "13:00 - 13:45", startHour: 13, endHour: 13.75, day: 1, sessionTitle: "Genomic Medicine in North Africa", speakerId: "661cd8f830d939eabc417a03", roomLocation: "Hall C", theme: "Biotechnology & Health" },
  { timeSlot: "14:00 - 14:45", startHour: 14, endHour: 14.75, day: 1, sessionTitle: "Self-Healing Polymers for Aerospace", speakerId: "661cd8f830d939eabc417a04", roomLocation: "Lab Theater", theme: "Smart Materials & Nanotechnology" },
  { timeSlot: "09:00 - 09:45", startHour: 9, endHour: 9.75, day: 2, sessionTitle: "EdTech for Developing Nations", speakerId: "661cd8f830d939eabc417a05", roomLocation: "Main Auditorium", theme: "Digital Transformation in Education" },
];

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Successfully connected.');

    // Clear existing
    console.log('Clearing existing data...');
    await Speaker.deleteMany({});
    await Agenda.deleteMany({});

    // Seed Data
    console.log('Seeding Speakers...');
    await Speaker.insertMany(speakers);
    
    console.log('Seeding Agenda...');
    await Agenda.insertMany(agenda);

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
