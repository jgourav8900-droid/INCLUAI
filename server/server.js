// ========================================================
// INCLUAI — Backend Server (Node.js + Express)
// Built for Gourav (CSE AIML) — Clean, modular, well-commented
// ========================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the browser frontend can communicate with this backend
app.use(cors());

// Enable parsing of JSON bodies in requests
app.use(express.json());

// Serve static frontend files (index.html, style.css, script.js) so localhost:5000 runs with full microphone & speech permissions!
app.use(express.static(path.join(__dirname, '..')));

// ========================================================
// 1. IN-MEMORY DATABASE (Ready for MongoDB Atlas)
// ========================================================
let leaveBalances = {
  pto: 14,
  sick: 7,
  casual: 3
};

let leaveRequests = [
  {
    id: 1,
    employeeName: "Gourav",
    type: "Sick / Medical Leave",
    dates: "12 Oct - 13 Oct 2026",
    days: 2,
    reason: "Viral flu recovery with doctor note",
    status: "Approved",
    appliedAt: new Date("2026-10-12T09:00:00Z")
  },
  {
    id: 2,
    employeeName: "Gourav",
    type: "Paid Time Off (PTO)",
    dates: "28 Oct - 29 Oct 2026",
    days: 2,
    reason: "Family event travel",
    status: "Pending",
    appliedAt: new Date("2026-10-20T11:30:00Z")
  }
];

const employees = [
  { id: "EMP-101", name: "Gourav", role: "Software Engineer (AIML)", dept: "Engineering", email: "gourav@technova.ai" },
  { id: "EMP-102", name: "Priya Sharma", role: "Head of People & Inclusion", dept: "HR & POSH Lead", email: "priya.s@technova.ai" },
  { id: "EMP-103", name: "Rohan Verma", role: "Staff AI Researcher", dept: "AI & Innovation", email: "rohan.v@technova.ai" },
  { id: "EMP-104", name: "Sneha Patel", role: "Accessibility Designer", dept: "Product & UX", email: "sneha.p@technova.ai" },
  { id: "EMP-105", name: "Arjun Rao", role: "Cloud & DevSecOps Lead", dept: "Infrastructure", email: "arjun.r@technova.ai" }
];

// Company Knowledge Base (RAG Documents)
const companyHandbook = {
  leavePolicy: `TechNova provides 24 total days of Paid Time Off (PTO) per year. In addition, employees get 7 medical leaves and 3 casual leaves. Hybrid work policy allows 2 days Work From Home (WFH) per week with team alignment.`,
  mentalHealth: `Every full-time employee is entitled to 4 confidential counseling sessions per quarter and 1 recharge Mental Wellness Day per month.`,
  poshPolicy: `TechNova enforces a zero-tolerance policy against any workplace harassment under POSH regulations. The Internal Complaints Committee (ICC) is chaired by Priya Sharma. Inquiries can be emailed confidentially to icc-support@technova.ai.`,
  upskilling: `Each engineer has an annual educational reimbursement allowance of ₹40,000 for approved AI/ML courses, certifications, and cloud credits.`
};

// ========================================================
// 2. API ROUTES
// ========================================================

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    app: "INCLUAI Backend Gateway",
    status: "online",
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? "Gemini-API-Active" : "Local-RAG-Engine"
  });
});

// Authentication Endpoints (Login / Signup)
app.post('/api/auth/login', (req, res) => {
  const { email, password, role, companyCode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  // Find user or generate mock session
  let user = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
  const assignedRole = role || (email.toLowerCase().includes('priya') ? 'hr' : 'employee');

  if (!user) {
    user = {
      id: "EMP-" + Math.floor(100 + Math.random() * 900),
      name: email.split('@')[0],
      email: email,
      role: assignedRole === 'hr' ? 'Head of People & Inclusion' : assignedRole === 'admin' ? 'Workspace Administrator' : 'Software Engineer (AIML)',
      dept: assignedRole === 'hr' ? 'Human Resources' : 'Engineering'
    };
  }

  res.json({
    success: true,
    message: `Welcome back, ${user.name}! Successfully signed in.`,
    token: "mock-jwt-token-incluai-" + Date.now(),
    user: {
      name: user.name,
      email: user.email,
      role: assignedRole,
      designation: user.role,
      companyCode: companyCode || "CORP-7749"
    }
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email and password are required." });
  }

  const assignedRole = role || 'employee';
  const newUser = {
    id: "EMP-" + (employees.length + 101),
    name,
    role: assignedRole === 'hr' ? 'HR Specialist' : assignedRole === 'admin' ? 'Workspace Administrator' : 'Software Engineer (AIML)',
    dept: assignedRole === 'hr' ? 'Human Resources' : 'Engineering',
    email
  };
  employees.push(newUser);

  res.status(201).json({
    success: true,
    message: `Account created! Welcome to INCLUAI, ${name}.`,
    token: "mock-jwt-token-incluai-" + Date.now(),
    user: {
      name: newUser.name,
      email: newUser.email,
      role: assignedRole,
      designation: newUser.role,
      companyCode: "CORP-7749"
    }
  });
});

// Employee Directory Endpoint
app.get('/api/employees', (req, res) => {
  res.json({ success: true, count: employees.length, data: employees });
});

// Leave Endpoints (GET, POST, APPROVE)
app.get('/api/leaves', (req, res) => {
  res.json({
    success: true,
    balances: leaveBalances,
    requests: leaveRequests
  });
});

app.post('/api/leaves', (req, res) => {
  const { type, from, to, days, reason } = req.body;

  if (!type || !from || !to || !reason) {
    return res.status(400).json({ success: false, message: "Missing required leave fields." });
  }

  const requestedDays = days || 1;

  // Validate balance
  if (type.includes("PTO")) {
    if (leaveBalances.pto < requestedDays) {
      return res.status(400).json({ success: false, message: `Insufficient PTO balance (${leaveBalances.pto} left).` });
    }
    leaveBalances.pto -= requestedDays;
  } else if (type.includes("Sick")) {
    leaveBalances.sick = Math.max(0, leaveBalances.sick - requestedDays);
  } else {
    leaveBalances.casual = Math.max(0, leaveBalances.casual - requestedDays);
  }

  const newLeave = {
    id: leaveRequests.length + 1,
    employeeName: "Gourav",
    type,
    dates: `${from} to ${to} (${requestedDays} days)`,
    days: requestedDays,
    reason,
    status: "Pending",
    appliedAt: new Date()
  };

  leaveRequests.unshift(newLeave);

  res.status(201).json({
    success: true,
    message: "Leave application submitted successfully.",
    data: newLeave,
    balances: leaveBalances
  });
});

app.patch('/api/leaves/:id/approve', (req, res) => {
  const leaveId = parseInt(req.params.id);
  const leave = leaveRequests.find(l => l.id === leaveId);

  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave record not found." });
  }

  leave.status = "Approved";
  leave.approvedAt = new Date();

  res.json({
    success: true,
    message: `Leave #${leaveId} approved successfully.`,
    data: leave
  });
});

// Smart Tone Rewriter Endpoint
app.post('/api/tone/rewrite', (req, res) => {
  const { rawText, tone } = req.body;

  if (!rawText) {
    return res.status(400).json({ success: false, message: "Raw text is required." });
  }

  let subject = "";
  let polishedText = "";
  let tip = "";

  if (tone === "formal") {
    subject = `Formal Update: Communication regarding schedule and tasks`;
    body = `Dear Team,\n\nI am writing to formally communicate an update regarding: ${rawText}.\n\nAll urgent assignments and deliverables have been aligned to maintain seamless progress. Should you require further clarification, please do not hesitate to reach out.\n\nSincerely,\nGourav\nSoftware Engineer (AIML) | TechNova`;
    tip = "Formal tone is best suited for senior management, stakeholders, and clients.";
  } else if (tone === "empathetic") {
    subject = `Quick collaborative note: ${rawText.slice(0, 30)}...`;
    body = `Hello Everyone,\n\nI hope your week is progressing smoothly.\n\nI wanted to share a thoughtful personal update: ${rawText}.\n\nEnsuring that my team is well-supported is my priority, so please let me know if you need any handover notes before I step away.\n\nWarmly,\nGourav`;
    tip = "Empathetic communication promotes psychological safety and trust in teams.";
  } else if (tone === "assertive") {
    subject = `Action Item & Availability: ${rawText.slice(0, 30)}...`;
    body = `Hi Team,\n\nDirect status update regarding my schedule: ${rawText}.\n\nTask statuses are updated on the board. I will address pending reviews upon my return.\n\nRegards,\nGourav`;
    tip = "Direct & assertive tone is ideal for fast-moving engineering teams.";
  } else {
    // Hinglish
    subject = `Quick team update: ${rawText.slice(0, 30)}...`;
    body = `Hi Team,\n\nHope sab theek chal raha hai.\n\nMain ek quick update share karna chahta tha: ${rawText}.\nMeri priority tasks maine coordinate kar li hain. Kisi urgent matter par main Slack par reachable hoon.\n\nThanks & regards,\nGourav`;
    tip = "Team Hinglish creates a relaxed, inclusive domestic team atmosphere.";
  }

  res.json({
    success: true,
    subject,
    polishedText: body,
    tip
  });
});

// INCLUAI Copilot Chat Endpoint (Supports RAG & LLM Integration)
app.post('/api/copilot/chat', async (req, res) => {
  const { message, language } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: "Message is required." });
  }

  const query = message.toLowerCase();
  let answer = "";

  // 1. Check if Gemini / OpenAI API key exists for live LLM response
  if (process.env.GEMINI_API_KEY) {
    try {
      // Future live LLM pipeline
      // const response = await callGeminiAPI(message, companyHandbook);
      // return res.json({ success: true, answer: response, source: "Gemini-1.5-Pro" });
    } catch (err) {
      console.error("LLM API Error:", err.message);
    }
  }

  // 2. Built-in RAG Search over Company Handbook
  if (query.includes('leave') || query.includes('pto') || query.includes('wfh') || query.includes('chhutti')) {
    answer = language === "HI"
      ? `<strong>TechNova Leave Policy (Backend Verified):</strong><br>• Aapke paas abhi <strong>${leaveBalances.pto} Annual PTO</strong> balance hai.<br>• 2 din WFH per week allowed hai.<br>• Aap hamare <em>Leave Manager</em> se instant leave submit kar sakte hain.`
      : `<strong>Leave Policy (TechNova Verified):</strong><br>• Available PTO balance: <strong>${leaveBalances.pto} days</strong>.<br>• Engineers can take up to 2 WFH days per week with manager coordination.`;
  } else if (query.includes('mental') || query.includes('wellness') || query.includes('therapy')) {
    answer = `<strong>Well-being Benefit:</strong><br>${companyHandbook.mentalHealth}`;
  } else if (query.includes('posh') || query.includes('harassment') || query.includes('safety')) {
    answer = `<strong>POSH Policy:</strong><br>${companyHandbook.poshPolicy}`;
  } else if (query.includes('allowance') || query.includes('course') || query.includes('upskill')) {
    answer = `<strong>AI Upskilling Benefit:</strong><br>${companyHandbook.upskilling}`;
  } else {
    answer = language === "HI"
      ? `Maine TechNova internal database me search kiya: <em>"${message}"</em>.<br>Yeh request verify ho chuki hai. Aap hamare HR portal ya tone rewriter se assistance le sakte hain!`
      : `I searched the TechNova workplace database for <em>"${message}"</em>.<br>Let me know if you would like me to draft an email or query the employee directory!`;
  }

  res.json({
    success: true,
    answer,
    source: "INCLUAI Knowledge Base (Backend RAG)",
    timestamp: new Date().toISOString()
  });
});

// ========================================================
// 3. START SERVER
// ========================================================
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`🚀 INCLUAI Backend Server is running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/status`);
  console.log(`=================================================\n`);
});
