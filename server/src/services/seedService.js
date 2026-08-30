const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { analyzeGrievance } = require('./aiClassifierService');

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('🌱 Database already populated with seed data.');
      return;
    }

    console.log('🌱 Seeding initial data for College Complaint Management System...');

    // 1. Create Departments
    const departmentsData = [
      {
        name: 'Information Technology & Computer Labs',
        code: 'DEPT-IT',
        description: 'Handles campus WiFi, computer laboratories, software licensing, smart classrooms, and portal access.',
        headOfficerName: 'Dr. Alan Vance',
        email: 'it.support@college.edu',
        phone: '+1 (555) 234-5670',
        location: 'Tech Tower, 3rd Floor, Room 302',
        categories: ['IT & Labs'],
        defaultSlaHours: 24,
        color: '#2563EB',
        icon: 'Monitor'
      },
      {
        name: 'Hostel & Residential Life',
        code: 'DEPT-HOSTEL',
        description: 'Manages student accommodation, dining mess hygiene, water supply, warden affairs, and room maintenance.',
        headOfficerName: 'Prof. Margaret Green',
        email: 'hostel.affairs@college.edu',
        phone: '+1 (555) 234-5671',
        location: 'Hostel Block B, Office Room 101',
        categories: ['Hostel & Mess', 'Sanitation & Hygiene'],
        defaultSlaHours: 48,
        color: '#059669',
        icon: 'Home'
      },
      {
        name: 'Academic Affairs & Examinations',
        code: 'DEPT-ACAD',
        description: 'Oversees course registration, faculty grievances, internal marks discrepancies, timetable conflicts, and exam hall issues.',
        headOfficerName: 'Dr. Robert Sterling',
        email: 'dean.academics@college.edu',
        phone: '+1 (555) 234-5672',
        location: 'Administration Building, 2nd Floor, Room 210',
        categories: ['Academic & Faculty'],
        defaultSlaHours: 72,
        color: '#7C3AED',
        icon: 'BookOpen'
      },
      {
        name: 'Campus Infrastructure & Maintenance',
        code: 'DEPT-ESTATE',
        description: 'Maintains physical classrooms, power/electrical grids, elevators, civil repairs, air conditioning, and sports grounds.',
        headOfficerName: 'Eng. David Miller',
        email: 'estate.maintenance@college.edu',
        phone: '+1 (555) 234-5673',
        location: 'Central Workshop & Estate Office',
        categories: ['Infrastructure & Civil', 'Electrical & Maintenance'],
        defaultSlaHours: 48,
        color: '#D97706',
        icon: 'Wrench'
      },
      {
        name: 'Anti-Ragging & Internal Complaints Committee',
        code: 'DEPT-ARICC',
        description: 'High-priority institutional grievance cell dedicated to zero-tolerance anti-ragging enforcement, harassment redressal, and student safety.',
        headOfficerName: 'Prof. Sarah Jenkins (Chairperson)',
        email: 'antiragging.cell@college.edu',
        phone: '+1 (555) 234-9999',
        location: 'Grievance Redressal Chamber, Main Wing',
        categories: ['Anti-Ragging & Harassment'],
        defaultSlaHours: 12,
        color: '#DC2626',
        icon: 'ShieldAlert'
      },
      {
        name: 'Accounts & Student Finance',
        code: 'DEPT-FIN',
        description: 'Resolves fee payment receipts, scholarship disbursals, fine adjustments, and caution deposit refunds.',
        headOfficerName: 'Mr. Thomas Wright',
        email: 'finance.desk@college.edu',
        phone: '+1 (555) 234-5674',
        location: 'Admin Wing, Ground Floor, Counter 4',
        categories: ['Fee & Accounts'],
        defaultSlaHours: 48,
        color: '#0891B2',
        icon: 'DollarSign'
      }
    ];

    const departments = await Department.insertMany(departmentsData);
    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d;
    });

    // 2. Create Users
    const usersData = [
      {
        name: 'Alex Rivera',
        email: 'student@college.edu',
        password: 'password123',
        role: 'student',
        studentId: 'CS-2023-084',
        batch: '2023-2027 (CSE)',
        phone: '+1 (555) 019-2834',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Priya Sharma',
        email: 'priya.student@college.edu',
        password: 'password123',
        role: 'student',
        studentId: 'EC-2023-112',
        batch: '2023-2027 (ECE)',
        phone: '+1 (555) 019-2835',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Dr. Alan Vance (IT HOD)',
        email: 'officer.it@college.edu',
        password: 'password123',
        role: 'officer',
        department: deptMap['DEPT-IT']._id,
        departmentName: deptMap['DEPT-IT'].name,
        phone: '+1 (555) 234-5670',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Prof. Margaret Green (Hostel Warden)',
        email: 'officer.hostel@college.edu',
        password: 'password123',
        role: 'officer',
        department: deptMap['DEPT-HOSTEL']._id,
        departmentName: deptMap['DEPT-HOSTEL'].name,
        phone: '+1 (555) 234-5671',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Dr. Evelyn Reed (Principal / Super Admin)',
        email: 'admin@college.edu',
        password: 'password123',
        role: 'admin',
        phone: '+1 (555) 000-1111',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Prof. Sarah Jenkins (Grievance Committee)',
        email: 'committee@college.edu',
        password: 'password123',
        role: 'committee',
        department: deptMap['DEPT-ARICC']._id,
        departmentName: deptMap['DEPT-ARICC'].name,
        phone: '+1 (555) 234-9999',
        avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
      }
    ];

    const users = await User.create(usersData);
    const userMap = {};
    users.forEach((u) => {
      userMap[u.email] = u;
    });

    // 3. Create Sample Complaints
    const student1 = userMap['student@college.edu'];
    const student2 = userMap['priya.student@college.edu'];
    const itOfficer = userMap['officer.it@college.edu'];
    const hostelOfficer = userMap['officer.hostel@college.edu'];
    const adminUser = userMap['admin@college.edu'];

    const sampleComplaints = [
      {
        ticketNumber: 'CMP-2026-1001',
        title: 'High-speed WiFi router down in Library 2nd Floor study cubicles',
        description: 'The wireless access point (SSID: Campus_HighSpeed_5G) on the 2nd-floor east wing study area has been unreachable for 2 days. Students cannot access digital library databases or submit online assignments.',
        category: 'IT & Labs',
        subcategory: 'Network & Internet',
        department: deptMap['DEPT-IT']._id,
        departmentName: deptMap['DEPT-IT'].name,
        complainant: student1._id,
        complainantName: student1.name,
        complainantRollNo: student1.studentId,
        isAnonymous: false,
        priority: 'High',
        status: 'In Progress',
        location: {
          block: 'Central Library Block',
          floor: '2nd Floor',
          roomOrArea: 'East Wing Study Cubicle #14'
        },
        assignedOfficer: itOfficer._id,
        assignedOfficerName: itOfficer.name,
        slaDeadline: new Date(Date.now() + 18 * 3600 * 1000),
        aiAnalysis: analyzeGrievance('High-speed WiFi router down in Library 2nd Floor', 'The wireless access point has been unreachable'),
        timeline: [
          {
            status: 'Submitted',
            actor: student1._id,
            actorName: student1.name,
            actorRole: 'student',
            note: 'Complaint registered by student.',
            timestamp: new Date(Date.now() - 26 * 3600 * 1000)
          },
          {
            status: 'Under Review',
            actor: itOfficer._id,
            actorName: itOfficer.name,
            actorRole: 'officer',
            note: 'Acknowledged by IT Department. Access point hardware fault suspected.',
            timestamp: new Date(Date.now() - 20 * 3600 * 1000)
          },
          {
            status: 'In Progress',
            actor: itOfficer._id,
            actorName: itOfficer.name,
            actorRole: 'officer',
            note: 'Replacement Cisco AP unit dispatched with technician. Firmware update in progress.',
            timestamp: new Date(Date.now() - 6 * 3600 * 1000)
          }
        ]
      },
      {
        ticketNumber: 'CMP-2026-1002',
        title: 'Water cooler purification filter leaking in Boys Hostel Block-B 3rd Floor',
        description: 'The drinking water cooler near Room 312 is leaking continuously onto the floor, causing water accumulation and creating an electric slip hazard near the power socket.',
        category: 'Hostel & Mess',
        subcategory: 'Plumbing & Drinking Water',
        department: deptMap['DEPT-HOSTEL']._id,
        departmentName: deptMap['DEPT-HOSTEL'].name,
        complainant: student2._id,
        complainantName: student2.name,
        complainantRollNo: student2.studentId,
        isAnonymous: false,
        priority: 'Critical',
        status: 'Resolved',
        location: {
          block: 'Hostel Block-B',
          floor: '3rd Floor',
          roomOrArea: 'Near Water Station outside Room 312'
        },
        assignedOfficer: hostelOfficer._id,
        assignedOfficerName: hostelOfficer.name,
        slaDeadline: new Date(Date.now() - 10 * 3600 * 1000),
        resolution: {
          notes: 'Maintenance technician replaced the faulty high-pressure silicone pipe and installed a new carbon filter. Sealed leak and checked drainage.',
          resolvedAt: new Date(Date.now() - 4 * 3600 * 1000),
          resolvedBy: hostelOfficer._id,
          resolvedByName: hostelOfficer.name,
          proofAttachments: [
            { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', name: 'leak_repaired_proof.jpg' }
          ]
        },
        feedback: {
          rating: 5,
          comment: 'Very swift response from the warden and technician. The leak was completely fixed within 6 hours. Thank you!',
          submittedAt: new Date(Date.now() - 2 * 3600 * 1000)
        },
        aiAnalysis: analyzeGrievance('Water cooler purification filter leaking', 'continuous water accumulation slip hazard'),
        timeline: [
          {
            status: 'Submitted',
            actor: student2._id,
            actorName: student2.name,
            actorRole: 'student',
            note: 'Urgent complaint filed.',
            timestamp: new Date(Date.now() - 30 * 3600 * 1000)
          },
          {
            status: 'In Progress',
            actor: hostelOfficer._id,
            actorName: hostelOfficer.name,
            actorRole: 'officer',
            note: 'Plumber assigned and water valve turned off for safety.',
            timestamp: new Date(Date.now() - 18 * 3600 * 1000)
          },
          {
            status: 'Resolved',
            actor: hostelOfficer._id,
            actorName: hostelOfficer.name,
            actorRole: 'officer',
            note: 'Filter tube replaced and water tested for TDS quality.',
            timestamp: new Date(Date.now() - 4 * 3600 * 1000)
          }
        ]
      },
      {
        ticketNumber: 'CMP-2026-1003',
        title: 'Projector display flickering and audio jack broken in CS Lab 4',
        description: 'The ceiling projector in Lab 4 cuts out every 3 minutes, and the HDMI audio channel produces loud static noise. Disrupting Machine Learning lab demonstrations.',
        category: 'IT & Labs',
        subcategory: 'Hardware & Audio-Visual',
        department: deptMap['DEPT-IT']._id,
        departmentName: deptMap['DEPT-IT'].name,
        complainant: student1._id,
        complainantName: student1.name,
        complainantRollNo: student1.studentId,
        isAnonymous: false,
        priority: 'Medium',
        status: 'Submitted',
        location: {
          block: 'Tech Tower A',
          floor: '4th Floor',
          roomOrArea: 'Computer Lab 4 (CS-401)'
        },
        slaDeadline: new Date(Date.now() + 42 * 3600 * 1000),
        aiAnalysis: analyzeGrievance('Projector display flickering and audio jack broken in CS Lab 4', 'ceiling projector cuts out every 3 minutes'),
        timeline: [
          {
            status: 'Submitted',
            actor: student1._id,
            actorName: student1.name,
            actorRole: 'student',
            note: 'Complaint registered by student.',
            timestamp: new Date(Date.now() - 2 * 3600 * 1000)
          }
        ]
      },
      {
        ticketNumber: 'CMP-2026-1004',
        title: 'Internal Assessment Grade mismatch in Database Management Systems',
        description: 'My midterm quiz 2 score was recorded as 12/25 instead of 22/25 on the portal. I have the signed physical answer paper verified by the faculty instructor.',
        category: 'Academic & Faculty',
        subcategory: 'Evaluation & Internal Marks',
        department: deptMap['DEPT-ACAD']._id,
        departmentName: deptMap['DEPT-ACAD'].name,
        complainant: student2._id,
        complainantName: student2.name,
        complainantRollNo: student2.studentId,
        isAnonymous: false,
        priority: 'Medium',
        status: 'Under Review',
        location: {
          block: 'Admin Block',
          floor: '2nd Floor',
          roomOrArea: 'Academic Examination Section'
        },
        slaDeadline: new Date(Date.now() + 60 * 3600 * 1000),
        aiAnalysis: analyzeGrievance('Internal Assessment Grade mismatch in DBMS', 'Midterm score recorded incorrectly on portal'),
        timeline: [
          {
            status: 'Submitted',
            actor: student2._id,
            actorName: student2.name,
            actorRole: 'student',
            note: 'Academic grievance filed with attached marksheet copy.',
            timestamp: new Date(Date.now() - 14 * 3600 * 1000)
          },
          {
            status: 'Under Review',
            actor: adminUser._id,
            actorName: 'Academic Cell',
            actorRole: 'admin',
            note: 'Verification memo sent to Course Instructor for grade confirmation.',
            timestamp: new Date(Date.now() - 8 * 3600 * 1000)
          }
        ]
      },
      {
        ticketNumber: 'CMP-2026-1005',
        title: 'Report of verbal intimidation near North Gate parking area after 7 PM',
        description: 'A group of seniors gathered near the North Gate bike parking stand and engaged in abusive language and intimidating behavior toward 1st-year day scholars.',
        category: 'Anti-Ragging & Harassment',
        subcategory: 'Ragging & Intimidation',
        department: deptMap['DEPT-ARICC']._id,
        departmentName: deptMap['DEPT-ARICC'].name,
        complainant: student1._id,
        complainantName: 'Anonymous Student',
        complainantRollNo: 'HIDDEN',
        isAnonymous: true,
        priority: 'Critical',
        status: 'In Progress',
        location: {
          block: 'Campus Perimeter',
          floor: 'Ground',
          roomOrArea: 'North Gate Two-Wheeler Parking Stand'
        },
        slaDeadline: new Date(Date.now() + 4 * 3600 * 1000),
        aiAnalysis: analyzeGrievance('Report of verbal intimidation near North Gate parking', 'seniors gathered and engaged in abusive language towards 1st year students ragging'),
        timeline: [
          {
            status: 'Submitted',
            actor: student1._id,
            actorName: 'Anonymous Complainant',
            actorRole: 'student',
            note: 'Confidential Anti-Ragging grievance logged.',
            timestamp: new Date(Date.now() - 8 * 3600 * 1000)
          },
          {
            status: 'In Progress',
            actor: userMap['committee@college.edu']._id,
            actorName: 'Prof. Sarah Jenkins',
            actorRole: 'committee',
            note: 'Anti-Ragging Squad squad leader notified. Campus Security CCTV camera #12 & #13 footage retrieved for 19:00 - 20:30 timeframe.',
            timestamp: new Date(Date.now() - 5 * 3600 * 1000)
          }
        ]
      }
    ];

    const complaints = await Complaint.insertMany(sampleComplaints);

    // 4. Create Sample Comments on CMP-2026-1001
    const complaint1 = complaints[0];
    await Comment.insertMany([
      {
        complaint: complaint1._id,
        author: student1._id,
        authorName: student1.name,
        authorRole: 'student',
        content: 'Hello, the 5GHz channel has been down since Thursday. Even the wired Ethernet port on desk 14 is not assigning an IP address.',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000)
      },
      {
        complaint: complaint1._id,
        author: itOfficer._id,
        authorName: itOfficer.name,
        authorRole: 'officer',
        content: 'Thank you for the detailed information Alex. We tested the floor switch uplink and detected packet drops. Our network engineer is on site to replace the cable and reboot the PoE switch.',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 15 * 3600 * 1000)
      },
      {
        complaint: complaint1._id,
        author: itOfficer._id,
        authorName: itOfficer.name,
        authorRole: 'officer',
        content: 'INTERNAL NOTE: Replaced port 8 patch cord. If issue persists, replace the Cisco Catalyst switch during Sunday maintenance window.',
        isInternalNote: true,
        createdAt: new Date(Date.now() - 10 * 3600 * 1000)
      }
    ]);

    // 5. Create Sample Notifications
    await Notification.insertMany([
      {
        recipient: student1._id,
        complaint: complaint1._id,
        title: 'Status Updated to In Progress',
        message: `Your complaint #${complaint1.ticketNumber} regarding WiFi has been marked In Progress by Dr. Alan Vance.`,
        type: 'status_updated',
        isRead: false
      },
      {
        recipient: student2._id,
        complaint: complaints[1]._id,
        title: 'Complaint Resolved',
        message: `Your complaint #${complaints[1].ticketNumber} regarding the water cooler has been resolved. Please rate your experience!`,
        type: 'status_updated',
        isRead: true
      },
      {
        recipient: itOfficer._id,
        complaint: complaints[2]._id,
        title: 'New Complaint Assigned',
        message: `A new complaint #${complaints[2].ticketNumber} (Projector flickering) was submitted under IT & Labs.`,
        type: 'new_complaint',
        isRead: false
      }
    ]);

    console.log('✅ College Complaint Management System seed data created successfully!');
  } catch (error) {
    console.error('❌ Error during seedDatabase:', error);
  }
};

module.exports = { seedDatabase };
