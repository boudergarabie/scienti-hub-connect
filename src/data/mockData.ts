export interface Speaker {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  country: string;
  theme: string;
  bio: string;
  photoURL: string;
}

export interface Submission {
  id: string;
  authorName: string;
  authorEmail: string;
  coAuthors: string;
  paperTitle: string;
  abstract: string;
  track: string;
  status: "Pending" | "Under Review" | "Reviewed" | "Accepted" | "Rejected" | "Published";
  submittedAt: string;
}

export interface AgendaItem {
  id: string;
  timeSlot: string;
  startHour: number;
  endHour: number;
  day: number; // 1, 2, or 3
  sessionTitle: string;
  speakerId: string;
  room: string;
  theme: string;
}

export interface CommitteeMember {
  name: string;
  role: string;
  affiliation: string;
  type: "organizing" | "scientific";
}

export const CONFERENCE = {
  name: "International Conference on Sustainable Innovation & Technology",
  acronym: "ICSIT 2026",
  date: new Date("2026-06-15T09:00:00"),
  endDate: new Date("2026-06-17T18:00:00"),
  location: "University of Science & Technology, Algiers, Algeria",
  venue: "Auditorium A — Central Campus",
  themes: [
    "Renewable Energy Systems",
    "Artificial Intelligence & Ethics",
    "Sustainable Urban Development",
    "Biotechnology & Health",
    "Smart Materials & Nanotechnology",
    "Digital Transformation in Education",
  ],
};

export const speakers: Speaker[] = [
  { id: "sp1", name: "Prof. Amina Bensalem", title: "Professor", affiliation: "University of Algiers", country: "Algeria", theme: "Renewable Energy Systems", bio: "Leading researcher in solar energy integration with 20+ years of experience in photovoltaic systems and grid optimization.", photoURL: "" },
  { id: "sp2", name: "Dr. Jean-Luc Moreau", title: "Researcher", affiliation: "CNRS, Paris", country: "France", theme: "Artificial Intelligence & Ethics", bio: "Expert in responsible AI development, focusing on bias detection and fairness in machine learning algorithms.", photoURL: "" },
  { id: "sp3", name: "Prof. Fatima Zahra El-Idrissi", title: "Professor", affiliation: "Mohammed V University, Rabat", country: "Morocco", theme: "Biotechnology & Health", bio: "Specialist in genomic medicine and biomarker discovery for rare diseases in North African populations.", photoURL: "" },
  { id: "sp4", name: "Dr. Hans Weber", title: "Senior Researcher", affiliation: "TU Munich", country: "Germany", theme: "Smart Materials & Nanotechnology", bio: "Pioneering work in self-healing polymers and adaptive materials for aerospace and biomedical applications.", photoURL: "" },
  { id: "sp5", name: "Prof. Aisha Okonkwo", title: "Professor", affiliation: "University of Lagos", country: "Nigeria", theme: "Digital Transformation in Education", bio: "Advocate for EdTech in developing nations, with large-scale deployments reaching over 500,000 students.", photoURL: "" },
  { id: "sp6", name: "Dr. Karim Hadj-Said", title: "Researcher", affiliation: "CDER, Algiers", country: "Algeria", theme: "Renewable Energy Systems", bio: "Focused on wind energy modeling and hybrid renewable systems for off-grid communities in the Sahara.", photoURL: "" },
  { id: "sp7", name: "Prof. Maria Gonzalez", title: "Professor", affiliation: "University of Barcelona", country: "Spain", theme: "Sustainable Urban Development", bio: "Urban planner and researcher specializing in green infrastructure and climate-resilient city design.", photoURL: "" },
  { id: "sp8", name: "Dr. Yuki Tanaka", title: "Associate Professor", affiliation: "University of Tokyo", country: "Japan", theme: "Artificial Intelligence & Ethics", bio: "Researching explainable AI systems for healthcare diagnostics and patient trust frameworks.", photoURL: "" },
];

export const committee: CommitteeMember[] = [
  { name: "Prof. Mohamed Larbi", role: "Conference Chair", affiliation: "University of Algiers", type: "organizing" },
  { name: "Dr. Sarah Khediri", role: "Co-Chair", affiliation: "USTHB, Algiers", type: "organizing" },
  { name: "Dr. Omar Benali", role: "Secretary General", affiliation: "University of Oran", type: "organizing" },
  { name: "Ms. Nadia Cherif", role: "Logistics Coordinator", affiliation: "ICSIT Foundation", type: "organizing" },
  { name: "Prof. Ahmed Bouazza", role: "Finance Officer", affiliation: "University of Constantine", type: "organizing" },
  { name: "Prof. Amina Bensalem", role: "Scientific Chair", affiliation: "University of Algiers", type: "scientific" },
  { name: "Prof. Jean-Luc Moreau", role: "Track Chair — AI & Ethics", affiliation: "CNRS, Paris", type: "scientific" },
  { name: "Prof. Maria Gonzalez", role: "Track Chair — Urban Development", affiliation: "University of Barcelona", type: "scientific" },
  { name: "Dr. Hans Weber", role: "Track Chair — Smart Materials", affiliation: "TU Munich", type: "scientific" },
  { name: "Prof. Fatima Zahra El-Idrissi", role: "Reviewer Coordinator", affiliation: "Mohammed V University", type: "scientific" },
  { name: "Prof. Aisha Okonkwo", role: "Track Chair — EdTech", affiliation: "University of Lagos", type: "scientific" },
];

export const agenda: AgendaItem[] = [
  { id: "a1", timeSlot: "09:00 – 09:45", startHour: 9, endHour: 9.75, day: 1, sessionTitle: "Opening Ceremony & Keynote", speakerId: "sp1", room: "Main Auditorium", theme: "Renewable Energy Systems" },
  { id: "a2", timeSlot: "10:00 – 10:45", startHour: 10, endHour: 10.75, day: 1, sessionTitle: "Solar Energy Integration in Smart Grids", speakerId: "sp1", room: "Main Auditorium", theme: "Renewable Energy Systems" },
  { id: "a3", timeSlot: "11:00 – 11:45", startHour: 11, endHour: 11.75, day: 1, sessionTitle: "Responsible AI: Detecting Algorithmic Bias", speakerId: "sp2", room: "Hall B", theme: "Artificial Intelligence & Ethics" },
  { id: "a4", timeSlot: "13:00 – 13:45", startHour: 13, endHour: 13.75, day: 1, sessionTitle: "Genomic Medicine in North Africa", speakerId: "sp3", room: "Hall C", theme: "Biotechnology & Health" },
  { id: "a5", timeSlot: "14:00 – 14:45", startHour: 14, endHour: 14.75, day: 1, sessionTitle: "Self-Healing Polymers for Aerospace", speakerId: "sp4", room: "Lab Theater", theme: "Smart Materials & Nanotechnology" },
  { id: "a6", timeSlot: "09:00 – 09:45", startHour: 9, endHour: 9.75, day: 2, sessionTitle: "EdTech for Developing Nations", speakerId: "sp5", room: "Main Auditorium", theme: "Digital Transformation in Education" },
  { id: "a7", timeSlot: "10:00 – 10:45", startHour: 10, endHour: 10.75, day: 2, sessionTitle: "Hybrid Wind-Solar Systems in the Sahara", speakerId: "sp6", room: "Hall B", theme: "Renewable Energy Systems" },
  { id: "a8", timeSlot: "11:00 – 11:45", startHour: 11, endHour: 11.75, day: 2, sessionTitle: "Green Infrastructure for Resilient Cities", speakerId: "sp7", room: "Main Auditorium", theme: "Sustainable Urban Development" },
  { id: "a9", timeSlot: "13:00 – 13:45", startHour: 13, endHour: 13.75, day: 2, sessionTitle: "Explainable AI in Healthcare", speakerId: "sp8", room: "Hall C", theme: "Artificial Intelligence & Ethics" },
  { id: "a10", timeSlot: "14:00 – 15:00", startHour: 14, endHour: 15, day: 2, sessionTitle: "Panel: Future of Sustainable Innovation", speakerId: "sp1", room: "Main Auditorium", theme: "Renewable Energy Systems" },
  { id: "a11", timeSlot: "09:00 – 10:30", startHour: 9, endHour: 10.5, day: 3, sessionTitle: "Poster Session & Networking", speakerId: "sp3", room: "Exhibition Hall", theme: "Biotechnology & Health" },
  { id: "a12", timeSlot: "11:00 – 12:00", startHour: 11, endHour: 12, day: 3, sessionTitle: "Closing Keynote & Awards Ceremony", speakerId: "sp2", room: "Main Auditorium", theme: "Artificial Intelligence & Ethics" },
];

export const mockSubmissions: Submission[] = [
  { id: "sub1", authorName: "Dr. Rachid Messaoudi", authorEmail: "r.messaoudi@univ-alger.dz", coAuthors: "A. Boudiaf, S. Hamidi", paperTitle: "Optimizing PV Panel Orientation Using Machine Learning", abstract: "This paper proposes a novel ML-based approach for dynamically adjusting photovoltaic panel angles to maximize energy output in North African climates.", track: "Renewable Energy Systems", status: "Accepted", submittedAt: "2026-02-15" },
  { id: "sub2", authorName: "Ms. Lina Kaddour", authorEmail: "l.kaddour@usthb.dz", coAuthors: "", paperTitle: "Ethical Frameworks for Autonomous Decision Systems", abstract: "An analysis of existing ethical frameworks and proposal of a unified model for autonomous AI decision-making in critical infrastructure.", track: "Artificial Intelligence & Ethics", status: "Under Review", submittedAt: "2026-03-01" },
  { id: "sub3", authorName: "Prof. David Müller", authorEmail: "d.mueller@tum.de", coAuthors: "H. Weber, K. Schmidt", paperTitle: "Graphene-Enhanced Self-Healing Coatings", abstract: "We present a breakthrough in self-healing coating technology using graphene nanoparticles for extended material lifespan.", track: "Smart Materials & Nanotechnology", status: "Reviewed", submittedAt: "2026-01-20" },
  { id: "sub4", authorName: "Dr. Amira Belhaj", authorEmail: "a.belhaj@um5.ac.ma", coAuthors: "F. El-Idrissi", paperTitle: "CRISPR Applications in Rare Disease Screening", abstract: "A study on the feasibility and ethical implications of using CRISPR-based screening for rare genetic disorders prevalent in Maghreb populations.", track: "Biotechnology & Health", status: "Pending", submittedAt: "2026-03-05" },
  { id: "sub5", authorName: "Mr. Youssef Taleb", authorEmail: "y.taleb@univ-oran.dz", coAuthors: "M. Saidi", paperTitle: "Smart Campus: IoT-Driven Energy Management", abstract: "Implementation and evaluation of an IoT-based energy monitoring and optimization system deployed across a university campus.", track: "Digital Transformation in Education", status: "Rejected", submittedAt: "2026-02-28" },
];
