/**
 * AI & Smart Grievance Classifier Service
 * Analyzes complaint title and description to suggest category, priority,
 * urgency score, sentiment, and automated resolution checklist.
 */

const CATEGORY_KEYWORDS = {
  'Anti-Ragging & Harassment': [
    'ragging', 'harassment', 'bully', 'threat', 'abuse', 'tease', 'senior',
    'ragged', 'threatened', 'physical', 'mental harassment', 'blackmail'
  ],
  'Electrical & Maintenance': [
    'fan', 'light', 'power', 'electricity', 'plug', 'switch', 'ac',
    'air conditioner', 'short circuit', 'wire', 'sparks', 'cooler', 'voltage'
  ],
  'Hostel & Mess': [
    'hostel', 'room', 'bed', 'warden', 'mess', 'food', 'meal', 'dinner',
    'lunch', 'breakfast', 'canteen', 'water cooler', 'plumbing', 'bathroom',
    'washroom', 'tap', 'leakage', 'geyser', 'mattress'
  ],
  'IT & Labs': [
    'wifi', 'internet', 'network', 'lan', 'computer', 'lab', 'pc', 'monitor',
    'mouse', 'keyboard', 'software', 'projector', 'portal', 'login', 'server'
  ],
  'Academic & Faculty': [
    'exam', 'marks', 'grade', 'faculty', 'professor', 'lecture', 'class',
    'attendance', 'syllabus', 'timetable', 'subject', 'hod', 'assignment', 'internal'
  ],
  'Library & Resources': [
    'book', 'library', 'journal', 'borrow', 'return', 'fine', 'librarian',
    'reading room', 'id card', 'catalog'
  ],
  'Fee & Accounts': [
    'fee', 'payment', 'receipt', 'scholarship', 'refund', 'challan', 'dues',
    'fine', 'tuition', 'account', 'bank'
  ],
  'Sanitation & Hygiene': [
    'clean', 'dustbin', 'garbage', 'dirty', 'sanitizer', 'pest', 'mosquito',
    'cockroach', 'smell', 'odor', 'hygiene', 'sweeper'
  ],
  'Transport & Parking': [
    'bus', 'driver', 'route', 'stop', 'parking', 'vehicle', 'transport', 'shuttle'
  ],
  'Infrastructure & Civil': [
    'bench', 'desk', 'door', 'window', 'wall', 'roof', 'lift', 'elevator',
    'crack', 'corridor', 'stairs', 'classroom', 'water leak'
  ]
};

const CRITICAL_KEYWORDS = [
  'ragging', 'harassment', 'sexual', 'suicide', 'assault', 'violence',
  'fire', 'electric shock', 'short circuit', 'bleeding', 'hospital', 'blackmail'
];

const HIGH_KEYWORDS = [
  'no water', 'food poison', 'exam tomorrow', 'wifi down', 'urgent',
  'broken glass', 'theft', 'stolen', 'unsafe', 'injury'
];

const CHECKLIST_MAP = {
  'Anti-Ragging & Harassment': [
    'Immediate notification to Anti-Ragging Committee Head',
    'Confidential statement recording with student / victim',
    'Identification of reported individuals / seniors',
    'Review CCTV footage of reported location & timestamp',
    'Provide counseling and ensure victim campus safety',
    'Convene Anti-Ragging Disciplinary Hearing within 24 hours'
  ],
  'Hostel & Mess': [
    'Dispatch Hostel Maintenance / Warden staff to room location',
    'Inspect plumbing / electrical / furniture condition',
    'Verify mess food sample testing / hygiene standards',
    'Coordinate temporary alternate room allotment if necessary',
    'Obtain student sign-off after physical inspection & repair'
  ],
  'IT & Labs': [
    'Check network switch / AP health at specified floor/block',
    'Inspect client hardware, cables, and DHCP lease logs',
    'Deploy patch or replacement peripheral (mouse/keyboard/monitor)',
    'Verify user login credentials and portal access logs',
    'Conduct speed & latency test after resolution'
  ],
  'Electrical & Maintenance': [
    'Deploy on-duty Electrician / Maintenance Tech with work order',
    'Cut off power breaker if spark / shock hazard detected',
    'Replace damaged wiring, socket, tube light or breaker unit',
    'Perform load & insulation test before restoring main switch',
    'Document repair photo proof for institutional record'
  ],
  'Academic & Faculty': [
    'Forward grievance to Department Academic Committee / Dean',
    'Verify internal marks / attendance records with course instructor',
    'Check university evaluation guidelines and syllabus timeline',
    'Schedule one-on-one grievance counseling session if required',
    'Issue corrected marksheet or attendance memo if verified'
  ],
  'Sanitation & Hygiene': [
    'Assign cleaning supervisor and custodial team to reported area',
    'Perform deep chemical sanitization and waste removal',
    'Replenish soap dispensers and clean water outlets',
    'Schedule recurring pest control or hygiene audit'
  ]
};

const analyzeGrievance = (title = '', description = '') => {
  const text = `${title} ${description}`.toLowerCase();
  
  // 1. Detect Category
  let detectedCategory = 'General Grievance';
  let maxScore = 0;

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += kw.includes(' ') ? 3 : 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      detectedCategory = cat;
    }
  }

  // 2. Detect Priority & Urgency Score
  let priority = 'Medium';
  let urgencyScore = 50;

  const hasCritical = CRITICAL_KEYWORDS.some((kw) => text.includes(kw));
  const hasHigh = HIGH_KEYWORDS.some((kw) => text.includes(kw));

  if (hasCritical || detectedCategory === 'Anti-Ragging & Harassment') {
    priority = 'Critical';
    urgencyScore = 95;
  } else if (hasHigh) {
    priority = 'High';
    urgencyScore = 75;
  } else if (text.includes('minor') || text.includes('request') || text.includes('suggestion')) {
    priority = 'Low';
    urgencyScore = 30;
  }

  // 3. Sentiment Analysis
  let sentiment = 'Neutral';
  if (urgencyScore >= 80 || text.includes('terrible') || text.includes('worst') || text.includes('danger') || text.includes('disaster')) {
    sentiment = 'Negative / High Frustration';
  } else if (urgencyScore >= 60 || text.includes('bad') || text.includes('issue') || text.includes('delay')) {
    sentiment = 'Moderate Concern';
  } else {
    sentiment = 'Inquiry / General Concern';
  }

  // 4. Extract Key matched keywords
  const matchedKeywords = [];
  const allKeywords = [...CRITICAL_KEYWORDS, ...HIGH_KEYWORDS, ...(CATEGORY_KEYWORDS[detectedCategory] || [])];
  for (const kw of allKeywords) {
    if (text.includes(kw.toLowerCase()) && !matchedKeywords.includes(kw)) {
      matchedKeywords.push(kw);
      if (matchedKeywords.length >= 6) break;
    }
  }

  // 5. Checklist recommendation
  const suggestedChecklist = CHECKLIST_MAP[detectedCategory] || [
    'Acknowledge complaint and verify location details',
    'Assign task to relevant department field officer',
    'Perform on-site inspection and review root cause',
    'Take corrective maintenance or administrative action',
    'Notify complainant with resolution proof and seek feedback'
  ];

  return {
    suggestedCategory: detectedCategory,
    suggestedPriority: priority,
    urgencyScore,
    sentiment,
    keywords: matchedKeywords,
    suggestedChecklist
  };
};

module.exports = {
  analyzeGrievance
};
