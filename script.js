// ========================================================
// INCLUAI — Advanced Inclusive Platform Script
// Features: Web Speech API (Voice), Tone Rewriter,
// Leave Flow, Role Simulation, and Accessibility
// ========================================================

// App State
const API_BASE = "http://localhost:5000/api";
let currentRole = "employee"; // "employee", "hr", "admin"
let currentLanguage = "EN";   // "EN", "HI"
let selectedTone = "formal";
let isListening = false;
let recognition = null;

// Leave Balances
let balances = {
  pto: 14,
  sick: 7,
  casual: 3
};

// Leave Records
let leaveHistory = [
  { id: 1, type: "Sick / Medical Leave", dates: "12 Oct - 13 Oct 2026", reason: "Viral flu recovery with doctor note", status: "Approved" },
  { id: 2, type: "Paid Time Off (PTO)", dates: "28 Oct - 29 Oct 2026", reason: "Family event travel", status: "Pending" }
];

// Employee Directory
const directory = [
  { name: "Gourav", role: "Software Engineer (AIML)", dept: "Engineering", email: "gourav@technova.ai" },
  { name: "Priya Sharma", role: "Head of People & Inclusion", dept: "HR & POSH Lead", email: "priya.s@technova.ai" },
  { name: "Rohan Verma", role: "Staff AI Researcher", dept: "AI & Innovation", email: "rohan.v@technova.ai" },
  { name: "Sneha Patel", role: "Accessibility Designer", dept: "Product & UX", email: "sneha.p@technova.ai" },
  { name: "Arjun Rao", role: "Cloud & DevSecOps Lead", dept: "Infrastructure", email: "arjun.r@technova.ai" }
];

// ========================================================
// 1. TAB NAVIGATION
// ========================================================
function showTab(tabId) {
  // Hide all tab panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Activate selected panel
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.add('active');

  // Update navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(tabId)) {
      btn.classList.add('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================================
// 2. ACCESSIBILITY CONTROLS
// ========================================================
function setFontSize(size) {
  document.body.classList.remove('font-small', 'font-medium', 'font-large');
  document.body.classList.add(`font-${size}`);

  document.querySelectorAll('.font-sizer button').forEach(btn => btn.classList.remove('active-size'));
  event.target.classList.add('active-size');
}

function toggleContrast() {
  document.body.classList.toggle('high-contrast');
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "EN" ? "HI" : "EN";
  document.getElementById('langLabel').textContent = currentLanguage;
  const msg = currentLanguage === "HI"
    ? "🌐 Language switched to Hinglish. Copilot will now speak in Hindi/English."
    : "🌐 Language switched to English.";
  alert(msg);
}

// ========================================================
// 3. ROLE SWITCHER
// ========================================================
function switchRole(role) {
  currentRole = role;
  const userName = document.getElementById('userName');
  const userDesig = document.getElementById('userDesignation');
  const heroTitle = document.getElementById('heroTitle');

  if (role === "hr") {
    userName.textContent = "Priya Sharma (HR)";
    userDesig.textContent = "Head of People & Inclusion";
    heroTitle.textContent = "HR & Workplace Culture Center 💼";
    alert("Switched to HR Role! You can now review and approve pending employee leaves in the Leave Manager tab.");
  } else if (role === "admin") {
    userName.textContent = "Admin Gourav";
    userDesig.textContent = "Workspace Administrator";
    heroTitle.textContent = "Company Admin Dashboard 👑";
  } else {
    userName.textContent = "Gourav";
    userDesig.textContent = "Software Engineer (AIML)";
    heroTitle.textContent = "Welcome back, Gourav! 👋";
  }

  renderLeaveTable();
}

// ========================================================
// 4. VOICE SPEECH INPUT & SYNTHESIS (Web Speech API)
// ========================================================
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech recognition is not supported in this browser.");
    return null;
  }

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = currentLanguage === "HI" ? "hi-IN" : "en-US";

  rec.onstart = () => {
    isListening = true;
    document.getElementById('micBtn')?.classList.add('listening');
    const indicator = document.getElementById('voiceIndicator');
    if (indicator) indicator.innerHTML = `<span class="status-dot" style="background:#ef4444;"></span> Listening to your voice... Speak now!`;
  };

  rec.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('copilotInput');
    if (input) input.value = transcript;
    sendCopilotMsg();
  };

  rec.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    stopListening();
  };

  rec.onend = () => {
    stopListening();
  };

  return rec;
}

function toggleVoiceInput() {
  if (!recognition) {
    recognition = initSpeechRecognition();
  }

  if (!recognition) {
    alert("Voice recognition is best supported in Google Chrome or Microsoft Edge. Please ensure microphone permissions are granted.");
    return;
  }

  if (isListening) {
    recognition.stop();
    stopListening();
  } else {
    try {
      recognition.lang = currentLanguage === "HI" ? "hi-IN" : "en-US";
      recognition.start();
    } catch (e) {
      console.warn(e);
    }
  }
}

function stopListening() {
  isListening = false;
  document.getElementById('micBtn')?.classList.remove('listening');
  const indicator = document.getElementById('voiceIndicator');
  if (indicator) indicator.innerHTML = `<span class="status-dot"></span> Ready for Voice & Text`;
}

// Text-to-Speech (Read Aloud for accessibility)
function speakText(btn) {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis not supported on your browser.");
    return;
  }

  // Find message text inside parent msg-content
  const parent = btn.closest('.msg-content');
  const p = parent.querySelector('p');
  const text = p ? p.innerText : "";

  window.speechSynthesis.cancel(); // Stop any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

// ========================================================
// 5. INCLUAI COPILOT CHAT ENGINE
// ========================================================
async function sendCopilotMsg() {
  const input = document.getElementById('copilotInput');
  const text = input.value.trim();
  if (!text) return;

  addChatBubble('user', text);
  input.value = '';

  // Try calling real Node.js Backend API
  try {
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, language: currentLanguage })
    });

    if (res.ok) {
      const data = await res.json();
      addChatBubble('bot', data.answer);
      return;
    }
  } catch (err) {
    // If backend is offline, gracefully use local fallback
  }

  // Fallback simulation
  setTimeout(() => {
    const reply = generateCopilotAnswer(text);
    addChatBubble('bot', reply);
  }, 500);
}

function addChatBubble(sender, content) {
  const chat = document.getElementById('copilotChat');
  const msg = document.createElement('div');
  msg.className = `msg ${sender}`;

  const avatar = sender === 'user' ? 'G' : '🤖';
  const speakBtn = sender === 'bot' ? `<button class="speak-btn" onclick="speakText(this)">🔊 Listen</button>` : '';

  msg.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div class="msg-content">
      <p>${content}</p>
      ${speakBtn}
    </div>
  `;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function quickCopilotQuery(question) {
  showTab('copilot');
  addChatBubble('user', question);
  setTimeout(() => {
    const reply = generateCopilotAnswer(question);
    addChatBubble('bot', reply);
  }, 500);
}

function generateCopilotAnswer(query) {
  const q = query.toLowerCase();

  if (q.includes('wfh') || q.includes('leave') || q.includes('chhutti') || q.includes('pto')) {
    if (currentLanguage === "HI") {
      return `<strong>TechNova Leave Policy Summary:</strong><br>
      • Aapke paas currently <strong>${balances.pto} Annual PTO</strong> baaki hain.<br>
      • Hybrid work policy ke hisaab se aap hafte me 2 din WFH kar sakte hain.<br>
      • Chhutti apply karne ke liye hamare <strong>Leave Manager</strong> tab par jaayein!`;
    }
    return `<strong>Leave & Remote Work Policy (TechNova 2026):</strong><br>
    • You currently have <strong>${balances.pto} Paid Leaves (PTO)</strong> available.<br>
    • Engineers are entitled to up to 2 remote working days per week with team notification.<br>
    • You can submit a leave request directly in the <strong>Leave Manager</strong> tab.`;
  }

  if (q.includes('mental') || q.includes('wellness') || q.includes('counseling')) {
    return `<strong>Mental Health & Well-being Stipend:</strong><br>
    TechNova provides 4 free confidential therapy sessions per quarter with certified counselors.<br>
    • You can also take 1 dedicated <em>Mental Wellness Day</em> every month without needing medical justification.`;
  }

  if (q.includes('neurodivergent') || q.includes('accessibility') || q.includes('adjustments')) {
    return `<strong>Neurodiversity & Ergonomics Support:</strong><br>
    TechNova is committed to full accessibility. You can request noise-canceling headphones, flexible asynchronous core hours, or dual ergonomic monitors.<br>
    • Contact: Priya Sharma (People & Inclusion Lead).`;
  }

  if (q.includes('posh') || q.includes('harassment') || q.includes('safety')) {
    return `<strong>POSH & Confidential Safety Channel:</strong><br>
    TechNova maintains strict zero tolerance for any form of harassment.<br>
    • All inquiries are handled with 100% confidentiality by the Internal Complaints Committee (ICC).<br>
    • Direct confidential email: <code>icc-support@technova.ai</code>.`;
  }

  return `Maine TechNova internal handbook me search kiya. Aap is baare me HR portal ya department lead se coordinate kar sakte hain. Main leave application, email drafting, aur workplace guidelines me aapki poori madad kar sakta hoon!`;
}

// ========================================================
// 6. SMART TONE REWRITER & INCLUSION TRANSLATOR
// ========================================================
function selectTone(btn) {
  document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedTone = btn.dataset.tone;
}

async function processToneRewrite() {
  const raw = document.getElementById('rawInput').value.trim();
  const output = document.getElementById('polishedOutput');
  const explanation = document.getElementById('toneExplanation');

  if (!raw) {
    alert("Please enter a message or raw thought to polish!");
    return;
  }

  // Try calling real Node.js Backend API
  try {
    const res = await fetch(`${API_BASE}/tone/rewrite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: raw, tone: selectedTone })
    });

    if (res.ok) {
      const data = await res.json();
      output.innerText = `Subject: ${data.subject}\n\n${data.polishedText}`;
      explanation.innerHTML = `💡 ${data.tip}`;
      incrementTaskMetric();
      return;
    }
  } catch (err) {
    // Fallback if backend offline
  }

  let subject = "";
  let body = "";
  let tip = "";

  if (selectedTone === "formal") {
    subject = `Formal Notice / Update: Regarding schedule and deliverables`;
    body = `Dear Team / Manager,

I am writing to formally communicate an update regarding: ${raw}.

I have reviewed my current assignments and ensured that all pressing priorities have been addressed or handed over to ensure continuity. 

Please let me know if any further clarification is required.

Sincerely,
Gourav
Software Engineer (AIML) | TechNova`;
    tip = `💡 Formal Tone: Ideal for senior leadership, official notices, and client communication.`;
  } else if (selectedTone === "empathetic") {
    subject = `Quick collaborative note: ${raw.slice(0, 25)}...`;
    body = `Hello Team,

I hope you are all having a smooth and productive week.

I wanted to kindly share a personal update: ${raw}. Ensuring that the team feels supported and that no tasks are delayed is very important to me, so please feel free to reach out if you need anything before I step away.

Thank you very much for your understanding and continuous support.

Warmly,
Gourav`;
    tip = `💡 Empathetic Tone: Builds psychological safety, warmth, and strong peer relationships.`;
  } else if (selectedTone === "assertive") {
    subject = `Action Item / Status Update: ${raw.slice(0, 25)}...`;
    body = `Hi Team,

Direct update on my availability: ${raw}.

All current blockers have been logged on the board. I will resume active status upon my return. For any critical escalation, please ping Devansh on the backend channel.

Thanks,
Gourav`;
    tip = `💡 Direct & Clear Tone: High efficiency, eliminates ambiguity, and respects everyone's time.`;
  } else {
    // Hinglish
    subject = `Quick update regarding ${raw.slice(0, 25)}...`;
    body = `Hi Team,

Hope sab theek chal raha hai.

Main ek quick update dena chahta tha ki: ${raw}. Maine apne code commits push kar diye hain aur pending tasks document kar diye hain.

Emergency me main Slack/phone par reachable hoon.

Thanks & regards,
Gourav`;
    tip = `💡 Team Hinglish: Relaxed, friendly, and culturally intuitive for domestic tech teams.`;
  }

  output.innerText = `Subject: ${subject}\n\n${body}`;
  explanation.innerHTML = tip;

  // Increment smart actions used
  const tasksEl = document.getElementById('metricTasks');
  if (tasksEl) {
    tasksEl.textContent = parseInt(tasksEl.textContent) + 1;
  }
}

function quickRewriter(text) {
  showTab('tone');
  document.getElementById('rawInput').value = text;
  processToneRewrite();
}

function copyPolishedDraft() {
  const text = document.getElementById('polishedOutput').innerText;
  if (!text || text.includes('Your polished and inclusive')) {
    alert("Please polish a draft first!");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    alert("Polished draft copied to clipboard! 📋 Ready to paste into Gmail or Slack.");
  });
}

// ========================================================
// 7. LEAVE MANAGER & APPROVAL FLOW
// ========================================================
function autoDraftLeaveReason() {
  const type = document.getElementById('leaveType').value;
  const reasonBox = document.getElementById('leaveReason');

  if (type.includes("Sick")) {
    reasonBox.value = "Recovering from unexpected fever/medical ailment. Doctor has advised complete rest to ensure full recovery.";
  } else if (type.includes("Mental")) {
    reasonBox.value = "Taking a designated mental wellness recharge day to prevent burnout and return refreshed.";
  } else if (type.includes("Casual")) {
    reasonBox.value = "Urgent personal family matter requiring my physical presence during office hours.";
  } else {
    reasonBox.value = "Planned annual vacation with family. Deliverables have been scheduled and PRs reviewed.";
  }
}

function submitLeaveRequest() {
  const type = document.getElementById('leaveType').value;
  const from = document.getElementById('leaveFrom').value;
  const to = document.getElementById('leaveTo').value;
  const reason = document.getElementById('leaveReason').value.trim();

  if (!from || !to) {
    alert("Please choose both From and To dates.");
    return;
  }

  if (!reason) {
    alert("Please enter a reason or click 'Copilot Auto-Draft'.");
    return;
  }

  // Calculate day difference
  const d1 = new Date(from);
  const d2 = new Date(to);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (type.includes("PTO")) {
    if (balances.pto < diffDays) {
      alert(`Insufficient PTO balance! You have ${balances.pto} days, but requested ${diffDays} days.`);
      return;
    }
    balances.pto -= diffDays;
  } else if (type.includes("Sick")) {
    balances.sick = Math.max(0, balances.sick - diffDays);
  } else {
    balances.casual = Math.max(0, balances.casual - diffDays);
  }

  // Add to records
  const newRecord = {
    id: leaveHistory.length + 1,
    type: type,
    dates: `${from} to ${to} (${diffDays} days)`,
    reason: reason,
    status: "Pending"
  };

  leaveHistory.unshift(newRecord);
  updateBalanceDisplays();
  renderLeaveTable();

  // Reset inputs
  document.getElementById('leaveReason').value = '';
  alert(`Leave request for ${diffDays} day(s) submitted successfully! It is now pending HR approval.`);
}

function updateBalanceDisplays() {
  document.getElementById('balancePTO').textContent = balances.pto;
  document.getElementById('balanceSick').textContent = balances.sick;
  document.getElementById('balanceCasual').textContent = balances.casual;
  document.getElementById('metricLeaves').textContent = `${balances.pto} Days`;

  // Count pending
  const pendingCount = leaveHistory.filter(l => l.status === "Pending").length;
  document.getElementById('pendingLeaveBadge').textContent = pendingCount;
}

function renderLeaveTable() {
  const tbody = document.getElementById('leaveTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  leaveHistory.forEach(record => {
    const tr = document.createElement('tr');
    const isApproved = record.status === "Approved";
    const statusClass = isApproved ? 'approved' : 'pending';

    // Show Approve button if HR/Admin and status is Pending
    let actionBtn = `<span style="color:var(--text-dim); font-size:11px;">Awaiting HR</span>`;
    if ((currentRole === "hr" || currentRole === "admin") && !isApproved) {
      actionBtn = `<button class="action-btn-sm" onclick="approveLeave(${record.id})">✅ Approve</button>`;
    } else if (isApproved) {
      actionBtn = `<span style="color:var(--accent-green); font-size:11px;">Verified</span>`;
    }

    tr.innerHTML = `
      <td><strong>${record.type}</strong></td>
      <td>${record.dates}</td>
      <td>${record.reason}</td>
      <td><span class="badge-status ${statusClass}">${record.status}</span></td>
      <td>${actionBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

function approveLeave(id) {
  const record = leaveHistory.find(l => l.id === id);
  if (record) {
    record.status = "Approved";
    renderLeaveTable();
    updateBalanceDisplays();
    alert(`Leave ID #${id} approved successfully! Notification sent to employee.`);
  }
}

// ========================================================
// 8. EMPLOYEE DIRECTORY
// ========================================================
function renderDirectory(list) {
  const container = document.getElementById('directoryGrid');
  if (!container) return;
  container.innerHTML = '';

  list.forEach(emp => {
    const card = document.createElement('div');
    card.className = 'emp-card';
    card.innerHTML = `
      <div class="emp-avatar">${emp.name.charAt(0)}</div>
      <div>
        <strong style="font-size:14px;">${emp.name}</strong>
        <p style="font-size:12px; color:var(--text-muted); margin: 2px 0;">${emp.role}</p>
        <span style="font-size:10px; background:#1f253e; color:#a58bff; padding:2px 6px; border-radius:8px;">${emp.dept}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterDirectory() {
  const q = document.getElementById('empSearch').value.toLowerCase();
  const filtered = directory.filter(emp => 
    emp.name.toLowerCase().includes(q) || 
    emp.role.toLowerCase().includes(q) ||
    emp.dept.toLowerCase().includes(q)
  );
  renderDirectory(filtered);
}

function incrementTaskMetric() {
  const tasksEl = document.getElementById('metricTasks');
  if (tasksEl) {
    tasksEl.textContent = parseInt(tasksEl.textContent) + 1;
  }
}

async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (res.ok) {
      const data = await res.json();
      console.log("Connected to INCLUAI Backend:", data);
      const indicator = document.getElementById('voiceIndicator');
      if (indicator) {
        indicator.innerHTML = `<span class="status-dot" style="background:#10b981;"></span> Backend Online (${data.aiEngine})`;
      }
    }
  } catch (err) {
    console.log("Backend offline, running in local standalone mode");
  }
}

// ========================================================
// INITIALIZE
// ========================================================
window.addEventListener('DOMContentLoaded', () => {
  checkBackendStatus();
  renderDirectory(directory);
  renderLeaveTable();
  updateBalanceDisplays();

  // Set default dates for leave
  const today = new Date().toISOString().split('T')[0];
  const fromEl = document.getElementById('leaveFrom');
  const toEl = document.getElementById('leaveTo');
  if (fromEl) fromEl.value = today;
  if (toEl) toEl.value = today;
});
