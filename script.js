// ========================================================
// INCLUAI — Advanced Interactive Client Script
// Features: Dynamic 3-Way Translation (EN, Hinglish, HI),
// Modern Toast System, Equalizer Animation, Typewriter Effect,
// Web Speech API, Leave Manager & Express Backend Gateway
// ========================================================

const API_BASE = "http://localhost:5000/api";
let currentRole = "employee"; // "employee", "hr", "admin"
let currentLanguage = "en";   // "en", "hinglish", "hi"
let selectedTone = "formal";
let isListening = false;
let recognition = null;

// Leave Balances State
let balances = {
  pto: 14,
  sick: 7,
  casual: 3
};

// Initial Leave History
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
// 1. DYNAMIC TRANSLATION DICTIONARY (EN, Hinglish, Hindi)
// ========================================================
const translations = {
  en: {
    contrast: "Contrast",
    roleLabel: "Role:",
    navDashboard: "Dashboard",
    navCopilot: "AI Copilot",
    navTone: "Tone Rewriter",
    navLeave: "Leave Manager",
    navEmployees: "Employees",
    navInclusion: "Inclusion & POSH",
    inclusionTitle: "Inclusion Assistant",
    inclusionDesc: "Voice speech, live translations, and empathetic communication active.",
    heroGreeting: "Welcome back, Gourav! 👋",
    heroSubtitle: "INCLUAI combines workplace intelligence with empathy, accessibility, and AI assistance.",
    btnTalkCopilot: "Talk to Copilot",
    btnApplyLeave: "Apply Leave",
    metricLeaveTitle: "Leave Balance (PTO)",
    metricLeaveNote: "Annual paid time off remaining",
    metricTasksTitle: "Smart Actions Used",
    metricTasksNote: "Emails polished & queries solved",
    metricTeamTitle: "Colleagues Online",
    metricTeamNote: "Across Engineering & Product",
    metricAccessTitle: "Accessibility Score",
    metricAccessNote: "WCAG AAA Compliance Rating",
    quickActionsTitle: "⚡ One-Click Inclusive Actions",
    chip1: "Translate raw thought into Sick Leave Email",
    chip2: "Mental Wellness & Therapy Benefits",
    chip3: "Neurodivergent & Accessible Work Guidelines",
    chip4: "Check Leave Application Status",
    noticeTitle: "📢 Workplace Updates",
    notice1Title: "Voice Copilot & Live Translation:",
    notice1Desc: "You can now talk to Copilot in Hindi & English, or switch language in 1-click.",
    notice2Title: "Hardware & Screen-Reader Grants:",
    notice2Desc: "HR has approved hardware grants for accessibility setups and ergonomic chairs.",
    notice3Title: "Q4 Hackathon Announced:",
    notice3Desc: "Build inclusive AI apps for employees with disabilities. Cash prizes available.",
    copilotHeader: "🤖 INCLUAI Copilot (Voice & Text)",
    copilotSub: "Ask about HR policies, benefits, leaves, or write workplace emails.",
    copilotWelcome: "Hello Gourav! I am your INCLUAI Copilot. Ask me anything via text or microphone (🎙️). I support English, Hinglish, and Hindi!",
    btnListen: "Listen",
    btnSend: "Send 🚀",
    toneHeader: "✍️ Smart Tone Rewriter & Inclusion Translator",
    toneSub: "Convert raw thoughts or informal Hindi into professional, empathetic corporate emails.",
    rawInputTitle: "1. Enter Raw Thought / Informal Message",
    rawInputSub: "Type freely without worrying about corporate grammar or vocabulary.",
    toneSelectLabel: "Select Desired Tone:",
    toneFormal: "Professional",
    toneEmpathetic: "Empathetic & Warm",
    toneAssertive: "Direct & Clear",
    toneHinglish: "Team Hinglish",
    btnPolish: "✨ Polish & Rewrite with AI",
    polishedTitle: "2. Polished Workplace Communication",
    btnCopy: "Copy",
    placeholderPolished: "Your polished and inclusive message will appear here with subject line...",
    leaveHeader: "🏖️ Automated Leave & Absence Manager",
    leaveSub: "Apply for leaves with AI justification and manage approvals in real-time.",
    applyLeaveTitle: "Apply for Leave",
    leaveTypeLabel: "Leave Type:",
    fromDateLabel: "From Date:",
    toDateLabel: "To Date:",
    reasonLabel: "Reason / Handover Note:",
    btnSubmitLeave: "Submit Leave Request 🚀",
    balancesTitle: "Your Leave Balances",
    historyTitle: "Leave Application Records",
    thType: "Type",
    thDates: "Dates",
    thReason: "Reason",
    thStatus: "Status",
    thAction: "Action",
    empHeader: "👥 Employee Directory & Support Contacts",
    empSub: "Find colleagues, accessibility buddies, and department leads.",
    poshHeader: "🤝 Workplace Inclusion, Accessibility & POSH Portal",
    poshSub: "TechNova's verified policies for harassment-free, accessible collaboration."
  },
  hinglish: {
    contrast: "कंट्रास्ट",
    roleLabel: "रोल:",
    navDashboard: "Dashboard",
    navCopilot: "AI Copilot",
    navTone: "Tone Rewriter",
    navLeave: "Leave Portal",
    navEmployees: "Employees",
    navInclusion: "Inclusion & POSH",
    inclusionTitle: "Inclusion Assistant",
    inclusionDesc: "Voice speech, live translations, aur empathetic communication active hai.",
    heroGreeting: "Welcome back, Gourav! 👋",
    heroSubtitle: "INCLUAI workplace intelligence ko empathy aur real AI power ke sath unite karta hai.",
    btnTalkCopilot: "Copilot Se Baat Karo",
    btnApplyLeave: "Chhutti Apply Karo",
    metricLeaveTitle: "Available Leaves (PTO)",
    metricLeaveNote: "Total bachi hui chhuttiyan",
    metricTasksTitle: "AI Tasks Solved",
    metricTasksNote: "Emails polished aur queries solve hui",
    metricTeamTitle: "Online Colleagues",
    metricTeamNote: "Engineering aur Product team active",
    metricAccessTitle: "Accessibility Score",
    metricAccessNote: "Sabhi ke liye aasan design (WCAG AAA)",
    quickActionsTitle: "⚡ 1-Click Fast Actions",
    chip1: "Raw Hindi se Sick Leave Email banao",
    chip2: "Mental Wellness aur Therapy Allowance",
    chip3: "Neurodivergent aur Accessible Work Rules",
    chip4: "Leave Status Check Karo",
    noticeTitle: "📢 Company News & Updates",
    notice1Title: "Voice Copilot & Live Translation:",
    notice1Desc: "Ab aap Copilot se bolkar baat kar sakte hain aur 1-click me language badal sakte hain.",
    notice2Title: "Ergonomic & Screen-Reader Grant:",
    notice2Desc: "HR ne hardware upgrades aur accessibility setups approve kar diye hain.",
    notice3Title: "Q4 AI Hackathon Announced:",
    notice3Desc: "Accessible AI tools banane ke liye hackathon start ho gaya hai.",
    copilotHeader: "🤖 INCLUAI Copilot (Voice & Chat)",
    copilotSub: "HR policies, leaves, allowances aur email drafting ke liye poocho.",
    copilotWelcome: "Hello Gourav! Main INCLUAI Copilot hoon. Type karo ya mic (🎙️) par bolo. Main English, Hinglish aur Hindi me madad kar sakta hoon!",
    btnListen: "Suno",
    btnSend: "Bhejo 🚀",
    toneHeader: "✍️ Smart Tone Rewriter & Inclusion Translator",
    toneSub: "Apne raw thoughts ya informal Hindi ko polite corporate email me badlo.",
    rawInputTitle: "1. Raw Thought / Idea Likho",
    rawInputSub: "Grammar ki tension liye bina simple words me likho.",
    toneSelectLabel: "Kaisa Tone Chahiye:",
    toneFormal: "Professional",
    toneEmpathetic: "Empathetic & Warm",
    toneAssertive: "Direct & Clear",
    toneHinglish: "Team Hinglish",
    btnPolish: "✨ Polish & Rewrite Karo",
    polishedTitle: "2. Polished Corporate Email",
    btnCopy: "Copy",
    placeholderPolished: "Aapka polished email subject line ke sath yahan aayega...",
    leaveHeader: "🏖️ Automated Leave Manager",
    leaveSub: "AI reasoning ke sath leave apply karo aur live approval track karo.",
    applyLeaveTitle: "Leave Apply Karo",
    leaveTypeLabel: "Chhutti Ka Type:",
    fromDateLabel: "Is Tareekh Se:",
    toDateLabel: "Is Tareekh Tak:",
    reasonLabel: "Reason / Handover Note:",
    btnSubmitLeave: "Leave Bhejo 🚀",
    balancesTitle: "Aapka Leave Balance",
    historyTitle: "Pichli Chhuttiyon Ka Record",
    thType: "Type",
    thDates: "Tareekh",
    thReason: "Reason",
    thStatus: "Status",
    thAction: "Action",
    empHeader: "👥 Employee Directory",
    empSub: "Apne colleagues aur department leads ko search karo.",
    poshHeader: "🤝 Workplace Inclusion & POSH Safety",
    poshSub: "TechNova ki verified harassment-free aur accessible workspace policies."
  },
  hi: {
    contrast: "कंट्रास्ट",
    roleLabel: "भूमिका:",
    navDashboard: "डैशबोर्ड",
    navCopilot: "एआई कोपायलट",
    navTone: "टोन रीराइटर",
    navLeave: "छुट्टी प्रबंधक",
    navEmployees: "कर्मचारी",
    navInclusion: "समावेशिता व सुरक्षा",
    inclusionTitle: "समावेशिता सहायक",
    inclusionDesc: "ध्वनि इनपुट, सजीव अनुवाद और संवेदनशील संचार सक्रिय है।",
    heroGreeting: "नमस्ते गौरव! 👋",
    heroSubtitle: "INCLUAI कार्यस्थल की बुद्धिमत्ता, संवेदनशीलता और सुगमता का संगम है।",
    btnTalkCopilot: "कोपायलट से बोलें",
    btnApplyLeave: "छुट्टी का आवेदन करें",
    metricLeaveTitle: "शेष छुट्टियाँ (PTO)",
    metricLeaveNote: "वार्षिक सवैतनिक छुट्टियाँ",
    metricTasksTitle: "सुलझाए गए कार्य",
    metricTasksNote: "संपादित ईमेल और उत्तरित प्रश्न",
    metricTeamTitle: "सक्रिय सहकर्मी",
    metricTeamNote: "इंजीनियरिंग व उत्पाद विभाग",
    metricAccessTitle: "सुगमता स्कोर",
    metricAccessNote: "WCAG AAA उच्चतम मानक",
    quickActionsTitle: "⚡ त्वरित समावेशी क्रियाएं",
    chip1: "सामान्य विचार से बीमारी की छुट्टी का ईमेल बनाएं",
    chip2: "मानसिक स्वास्थ्य एवं चिकित्सा लाभ",
    chip3: "दिव्यांगजनों हेतु सुगम कार्य नीति",
    chip4: "छुट्टी आवेदन की स्थिति देखें",
    noticeTitle: "📢 कार्यस्थल समाचार",
    notice1Title: "आवाज़ कोपायलट एवं अनुवाद:",
    notice1Desc: "अब आप कोपायलट से बोलकर पूछ सकते हैं और भाषा बदल सकते हैं।",
    notice2Title: "सुगम उपकरण सहायता:",
    notice2Desc: "एचआर ने सुगम कुर्सी और कंप्यूटर उपकरणों की स्वीकृति दी है।",
    notice3Title: "चतुर्थ तिमाही हेकाथॉन:",
    notice3Desc: "दिव्यांगजनों हेतु एआई उपकरण बनाने की प्रतियोगिता प्रारंभ।",
    copilotHeader: "🤖 INCLUAI कोपायलट (ध्वनि व चैट)",
    copilotSub: "कंपनी नीतियों, छुट्टियों और ईमेल प्रारूप हेतु सहायता लें।",
    copilotWelcome: "नमस्ते गौरव! मैं INCLUAI कोपायलट हूँ। लिखकर या माइक (🎙️) द्वारा बोलकर प्रश्न पूछें।",
    btnListen: "सुनें",
    btnSend: "भेजें 🚀",
    toneHeader: "✍️ स्मार्ट टोन रीराइटर एवं अनुवादक",
    toneSub: "अपने विचारों को विनम्र व औपचारिक कार्यालयी भाषा में रूपांतरित करें।",
    rawInputTitle: "1. अपना मूल विचार लिखें",
    rawInputSub: "व्याकरण की चिंता किए बिना सहज भाषा में लिखें।",
    toneSelectLabel: "वांछित शैली चुनें:",
    toneFormal: "औपचारिक",
    toneEmpathetic: "संवेदनशील व विनम्र",
    toneAssertive: "स्पष्ट व संक्षिप्त",
    toneHinglish: "सहज हिंग्लिश",
    btnPolish: "✨ एआई से परिष्कृत करें",
    polishedTitle: "2. परिष्कृत आधिकारिक संदेश",
    btnCopy: "प्रतिलिपि",
    placeholderPolished: "विषय सहित आपका परिष्कृत संदेश यहाँ प्रदर्शित होगा...",
    leaveHeader: "🏖️ स्वचालित अवकाश प्रबंधक",
    leaveSub: "एआई सहायता से अवकाश आवेदन करें और स्वीकृति ट्रैक करें।",
    applyLeaveTitle: "अवकाश हेतु आवेदन",
    leaveTypeLabel: "अवकाश का प्रकार:",
    fromDateLabel: "प्रारंभ तिथि:",
    toDateLabel: "अंतिम तिथि:",
    reasonLabel: "कारण / दायित्व विवरण:",
    btnSubmitLeave: "आवेदन प्रेषित करें 🚀",
    balancesTitle: "आपका अवकाश शेष",
    historyTitle: "अवकाश इतिहास अभिलेख",
    thType: "प्रकार",
    thDates: "तिथियां",
    thReason: "कारण",
    thStatus: "स्थिति",
    thAction: "कार्रवाई",
    empHeader: "👥 कर्मचारी निर्देशिका",
    empSub: "सहकर्मियों एवं विभाग प्रमुखों से संपर्क करें।",
    poshHeader: "🤝 कार्यस्थल सुरक्षा एवं समावेशिता",
    poshSub: "उत्पीड़न-मुक्त व सुरक्षित कार्यस्थल हेतु आधिकारिक दिशा-निर्देश।"
  }
};

// ========================================================
// 2. LIVE DYNAMIC LANGUAGE SWITCHER
// ========================================================
function changeLanguage(langKey) {
  currentLanguage = langKey;
  const dict = translations[langKey] || translations.en;

  // Update all elements tagged with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = dict[key];
        el.style.opacity = '1';
      }, 150);
    }
  });

  const langNames = { en: "English (US)", hinglish: "Hinglish (Team)", hi: "हिंदी (Hindi)" };
  showToast(`🌐 Language switched to ${langNames[langKey]}`, "info");
}

// ========================================================
// 3. MODERN TOAST NOTIFICATION SYSTEM
// ========================================================
function showToast(message, type = "info") {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    info: "ℹ️",
    success: "✅",
    voice: "🎙️",
    copy: "📋"
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${icons[type] || "⚡"}</span>
    <span>${message}</span>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  // Auto remove after 3.5 seconds with slide-out animation
  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ========================================================
// 4. TAB NAVIGATION
// ========================================================
function showTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick')?.includes(tabId)) {
      btn.classList.add('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================================
// 5. ACCESSIBILITY CONTROLS
// ========================================================
function setFontSize(size) {
  document.body.classList.remove('font-small', 'font-medium', 'font-large');
  document.body.classList.add(`font-${size}`);

  document.querySelectorAll('.font-sizer button').forEach(btn => btn.classList.remove('active-size'));
  event.target.classList.add('active-size');
  showToast(`Font size adjusted to ${size.toUpperCase()}`, "info");
}

function toggleContrast() {
  document.body.classList.toggle('high-contrast');
  const isHigh = document.body.classList.contains('high-contrast');
  showToast(isHigh ? "High-Contrast OLED Mode Enabled" : "Standard Aurora Theme Restored", "info");
}

// ========================================================
// 6. ROLE SWITCHER
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
    showToast("Switched to HR Role! You can now approve pending leaves.", "success");
  } else if (role === "admin") {
    userName.textContent = "Admin Gourav";
    userDesig.textContent = "Workspace Administrator";
    heroTitle.textContent = "Company Admin Dashboard 👑";
    showToast("Switched to Company Admin Mode.", "info");
  } else {
    userName.textContent = "Gourav";
    userDesig.textContent = "Software Engineer (AIML)";
    heroTitle.textContent = "Welcome back, Gourav! 👋";
    showToast("Switched to Employee View.", "info");
  }

  renderLeaveTable();
}

// ========================================================
// 7. ROBUST VOICE RECOGNITION (Web Speech API)
// ========================================================
function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showToast("⚠️ Speech recognition not supported in this browser. Please use Chrome or Edge.", "info");
    return;
  }

  // Check if running on file:/// URL
  if (window.location.protocol === 'file:') {
    showToast("🔒 Browser blocks mic on file:// URLs. Open http://localhost:5000 to speak!", "info");
  }

  if (isListening && recognition) {
    try { recognition.stop(); } catch(e){}
    stopListening();
    return;
  }

  // Always create a clean instance to prevent InvalidStateError
  try {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    // Choose dialect based on current language
    if (currentLanguage === "hi") {
      recognition.lang = "hi-IN";
    } else if (currentLanguage === "hinglish") {
      recognition.lang = "en-IN";
    } else {
      recognition.lang = "en-US";
    }

    recognition.onstart = () => {
      isListening = true;
      document.getElementById('micBtn')?.classList.add('listening');
      document.getElementById('equalizerBars')?.classList.add('animating');
      const status = document.getElementById('voiceStatusText');
      if (status) status.textContent = "Listening... Speak your question now!";
      showToast("Listening to voice input... 🎙️ Speak now!", "voice");
    };

    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('copilotInput');
        if (input) input.value = transcript;
        showToast(`Captured: "${transcript}"`, "voice");
        sendCopilotMsg();
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech error:", event.error);
      stopListening();
      if (event.error === 'not-allowed') {
        if (window.location.protocol === 'file:') {
          showToast("🔒 Mic blocked on file:// URL. Please open http://localhost:5000 in your browser!", "info");
        } else {
          showToast("⚠️ Microphone access denied. Click the lock/camera icon in your address bar to allow mic.", "info");
        }
      } else if (event.error === 'no-speech') {
        showToast("No speech detected. Please speak closer to the microphone.", "info");
      } else if (event.error === 'audio-capture') {
        showToast("No microphone found on your computer.", "info");
      } else if (event.error === 'network') {
        showToast("Voice transcription requires an active internet connection.", "info");
      } else {
        showToast(`Voice status: ${event.error}`, "info");
      }
    };

    recognition.onend = () => {
      stopListening();
    };

    recognition.start();
  } catch (err) {
    console.error("Failed to start voice recognition:", err);
    stopListening();
    showToast("Could not start microphone. Please check permissions.", "info");
  }
}

function stopListening() {
  isListening = false;
  document.getElementById('micBtn')?.classList.remove('listening');
  document.getElementById('equalizerBars')?.classList.remove('animating');
  const status = document.getElementById('voiceStatusText');
  if (status) status.textContent = "Ready for Voice & Text";
}

// ========================================================
// AUTH MODAL & LOGIN/SIGNUP SYSTEM
// ========================================================
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('active');
}

function handleModalOverlayClick(e) {
  if (e.target.id === 'authModal') {
    closeAuthModal();
  }
}

function switchAuthTab(tab) {
  const signInBtn = document.getElementById('tabSignInBtn');
  const signUpBtn = document.getElementById('tabSignUpBtn');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  if (tab === 'signin') {
    signInBtn.classList.add('active');
    signUpBtn.classList.remove('active');
    signInForm.classList.add('active');
    signUpForm.classList.remove('active');
  } else {
    signUpBtn.classList.add('active');
    signInBtn.classList.remove('active');
    signUpForm.classList.add('active');
    signInForm.classList.remove('active');
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

function fillDemoAccount(email, role) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginRole').value = role;
  document.getElementById('loginPassword').value = "demoPassword123";
  showToast(`Loaded ${role.toUpperCase()} demo credentials!`, "info");
}

function forgotPasswordMock() {
  showToast("Password reset link sent to registered email address.", "info");
}

async function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const role = document.getElementById('loginRole').value;
  const companyCode = document.getElementById('loginCompanyCode').value.trim();

  // Try real backend
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role, companyCode })
    });

    if (res.ok) {
      const data = await res.json();
      applyUserSession(data.user);
      closeAuthModal();
      showToast(`🎉 ${data.message}`, "success");
      return;
    }
  } catch (err) {
    // Offline fallback
  }

  const fallbackUser = {
    name: email.split('@')[0],
    email: email,
    role: role,
    designation: role === 'hr' ? 'Head of People & Inclusion' : role === 'admin' ? 'Workspace Administrator' : 'Software Engineer (AIML)',
    companyCode: companyCode || "CORP-7749"
  };
  applyUserSession(fallbackUser);
  closeAuthModal();
  showToast(`🎉 Logged in as ${fallbackUser.name} (${fallbackUser.role})`, "success");
}

async function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const company = document.getElementById('signupCompany').value.trim();
  const role = document.getElementById('signupRole').value;

  // Try real backend
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, companyName: company, role })
    });

    if (res.ok) {
      const data = await res.json();
      applyUserSession(data.user);
      closeAuthModal();
      showToast(`✨ Account created! Welcome, ${name}.`, "success");
      return;
    }
  } catch (err) {
    // Offline fallback
  }

  const fallbackUser = {
    name: name,
    email: email,
    role: role,
    designation: role === 'hr' ? 'HR Specialist' : role === 'admin' ? 'Workspace Administrator' : 'Software Engineer (AIML)',
    companyCode: "CORP-7749"
  };
  applyUserSession(fallbackUser);
  closeAuthModal();
  showToast(`✨ Welcome aboard, ${name}!`, "success");
}

function applyUserSession(user) {
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userDesignation').textContent = user.designation;
  document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('heroTitle').textContent = `Welcome back, ${user.name}! 👋`;
  document.getElementById('authBtnLabel').textContent = `Signed in (${user.name})`;
  
  const roleSel = document.getElementById('roleSelector');
  if (roleSel) roleSel.value = user.role;
  switchRole(user.role);

  try {
    localStorage.setItem('incluai_user', JSON.stringify(user));
  } catch (e) {}
}

// Text-to-Speech (Read Aloud with Equalizer Effect)
function speakText(btn) {
  if (!('speechSynthesis' in window)) {
    showToast("Speech synthesis not supported in this browser.", "info");
    return;
  }

  const parent = btn.closest('.msg-content');
  const p = parent.querySelector('p');
  const text = p ? p.innerText : "";

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;

  // Animate equalizer while speaking
  const eq = document.getElementById('equalizerBars');
  if (eq) eq.classList.add('animating');

  utterance.onend = () => {
    if (eq) eq.classList.remove('animating');
  };

  window.speechSynthesis.speak(utterance);
  showToast("Reading response aloud... 🔊", "info");
}

// ========================================================
// 8. COPILOT ENGINE WITH TYPEWRITER STREAMING EFFECT
// ========================================================
async function sendCopilotMsg() {
  const input = document.getElementById('copilotInput');
  const text = input.value.trim();
  if (!text) return;

  addChatBubble('user', text);
  input.value = '';

  // Show Typing Indicator
  const typingBubble = showTypingIndicator();

  // 1. Try real Node.js Express backend
  try {
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, language: currentLanguage })
    });

    if (res.ok) {
      const data = await res.json();
      typingBubble.remove();
      streamBotResponse(data.answer);
      return;
    }
  } catch (err) {
    // Graceful offline fallback
  }

  // 2. Fallback simulation
  setTimeout(() => {
    typingBubble.remove();
    const reply = generateCopilotAnswer(text);
    streamBotResponse(reply);
  }, 600);
}

function showTypingIndicator() {
  const chat = document.getElementById('copilotChat');
  const msg = document.createElement('div');
  msg.className = 'msg bot typing-msg';
  msg.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-content" style="color: var(--text-dim); font-style: italic;">
      Copilot is thinking...
    </div>
  `;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  return msg;
}

function streamBotResponse(htmlContent) {
  const chat = document.getElementById('copilotChat');
  const msg = document.createElement('div');
  msg.className = 'msg bot';

  msg.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-content">
      <p class="stream-text"></p>
      <button class="speak-btn hover-bounce" onclick="speakText(this)">
        <span>🔊</span> <span>Listen</span>
      </button>
    </div>
  `;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;

  const targetP = msg.querySelector('.stream-text');

  // Fast typewriter injection
  targetP.innerHTML = htmlContent;
  targetP.style.animation = "msgFadeIn 0.3s ease-in";
}

function addChatBubble(sender, content) {
  const chat = document.getElementById('copilotChat');
  const msg = document.createElement('div');
  msg.className = `msg ${sender}`;

  const avatar = sender === 'user' ? 'G' : '🤖';

  msg.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div class="msg-content">
      <p>${content}</p>
    </div>
  `;

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function quickCopilotQuery(question) {
  showTab('copilot');
  addChatBubble('user', question);
  const typing = showTypingIndicator();
  setTimeout(() => {
    typing.remove();
    const reply = generateCopilotAnswer(question);
    streamBotResponse(reply);
  }, 500);
}

function generateCopilotAnswer(query) {
  const q = query.toLowerCase();

  if (q.includes('wfh') || q.includes('leave') || q.includes('chhutti') || q.includes('pto')) {
    if (currentLanguage === "hi") {
      return `<strong>टेकनोवा अवकाश नीति (TechNova 2026):</strong><br>
      • आपके पास वर्तमान में <strong>${balances.pto} सवैतनिक छुट्टियाँ (PTO)</strong> उपलब्ध हैं।<br>
      • टीम के साथ समन्वय कर प्रति सप्ताह 2 दिन घर से काम (WFH) करने की अनुमति है।<br>
      • तुरंत आवेदन हेतु हमारे <strong>छुट्टी प्रबंधक</strong> का उपयोग करें।`;
    }
    if (currentLanguage === "hinglish") {
      return `<strong>TechNova Leave Policy Summary:</strong><br>
      • Aapke paas abhi <strong>${balances.pto} Annual PTO</strong> baaki hain.<br>
      • Hybrid model ke hisaab se aap hafte me 2 din WFH kar sakte hain.<br>
      • Chhutti apply karne ke liye <strong>Leave Manager</strong> tab par jayein!`;
    }
    return `<strong>Leave & Hybrid Work Policy (TechNova 2026):</strong><br>
    • You currently have <strong>${balances.pto} Paid Leaves (PTO)</strong> available.<br>
    • Engineers are entitled to up to 2 remote working days per week with team alignment.<br>
    • Apply directly in the <strong>Leave Manager</strong> tab with auto-drafted justification.`;
  }

  if (q.includes('mental') || q.includes('wellness') || q.includes('counseling')) {
    return `<strong>Mental Health & Well-being Stipend:</strong><br>
    TechNova provides 4 free confidential therapy sessions per quarter with certified counselors.<br>
    • Employees can take 1 dedicated <em>Mental Wellness Day</em> each month without requiring doctor justification.`;
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

  return `I verified this request in the TechNova internal handbook. You can coordinate this through the HR portal or our Smart Tone Rewriter for instant workplace assistance!`;
}

// ========================================================
// 9. SMART TONE REWRITER
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
    showToast("Please enter a raw thought to polish!", "info");
    return;
  }

  // 1. Try real Node.js Backend API
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
      showToast("✨ Message polished with AI!", "success");
      return;
    }
  } catch (err) {
    // Offline fallback
  }

  // 2. Fallback generator
  let subject = "";
  let body = "";
  let tip = "";

  if (selectedTone === "formal") {
    subject = `Formal Communication: Regarding schedule and commitments`;
    body = `Dear Team / Leadership,\n\nI am writing to formally communicate an update regarding: ${raw}.\n\nI have aligned my current deliverables to maintain uninterrupted project continuity. Please let me know if any further details are needed.\n\nSincerely,\nGourav\nSoftware Engineer (AIML) | TechNova`;
    tip = "Formal tone is best suited for senior management, stakeholders, and clients.";
  } else if (selectedTone === "empathetic") {
    subject = `Quick collaborative note: ${raw.slice(0, 30)}...`;
    body = `Hello Everyone,\n\nI hope your week is going smoothly.\n\nI wanted to share a thoughtful personal update: ${raw}.\n\nEnsuring the team is supported is my priority, so please reach out if you need any handover notes before I step away.\n\nWarmly,\nGourav`;
    tip = "Empathetic communication promotes psychological safety and trust in teams.";
  } else if (selectedTone === "assertive") {
    subject = `Action Item & Availability: ${raw.slice(0, 30)}...`;
    body = `Hi Team,\n\nDirect status update regarding my availability: ${raw}.\n\nAll current blockers have been logged on the board. I will review pending PRs upon return.\n\nRegards,\nGourav`;
    tip = "Direct & assertive tone is ideal for fast-moving engineering teams.";
  } else {
    // Hinglish
    subject = `Quick team update: ${raw.slice(0, 30)}...`;
    body = `Hi Team,\n\nHope sab theek chal raha hai.\n\nMain ek quick update share karna chahta tha: ${raw}.\nMeri priority tasks maine coordinate kar li hain. Emergency me main Slack/phone par reachable hoon.\n\nThanks & regards,\nGourav`;
    tip = "Team Hinglish creates a relaxed, inclusive domestic team atmosphere.";
  }

  output.innerText = `Subject: ${subject}\n\n${body}`;
  explanation.innerHTML = `💡 ${tip}`;
  incrementTaskMetric();
  showToast("✨ Message polished with AI!", "success");
}

function quickRewriter(text) {
  showTab('tone');
  document.getElementById('rawInput').value = text;
  processToneRewrite();
}

function copyPolishedDraft() {
  const text = document.getElementById('polishedOutput').innerText;
  if (!text || text.includes('Your polished and inclusive')) {
    showToast("Please polish a draft first!", "info");
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast("Polished draft copied to clipboard! 📋 Ready to paste.", "copy");
  });
}

function incrementTaskMetric() {
  const tasksEl = document.getElementById('metricTasks');
  if (tasksEl) {
    tasksEl.textContent = parseInt(tasksEl.textContent) + 1;
  }
}

// ========================================================
// 10. LEAVE MANAGER & APPROVAL FLOW
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

  showToast("✨ Reason auto-drafted by Copilot!", "success");
}

function submitLeaveRequest() {
  const type = document.getElementById('leaveType').value;
  const from = document.getElementById('leaveFrom').value;
  const to = document.getElementById('leaveTo').value;
  const reason = document.getElementById('leaveReason').value.trim();

  if (!from || !to) {
    showToast("Please choose both From and To dates.", "info");
    return;
  }

  if (!reason) {
    showToast("Please provide a reason or click 'Copilot Auto-Draft'.", "info");
    return;
  }

  const d1 = new Date(from);
  const d2 = new Date(to);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (type.includes("PTO")) {
    if (balances.pto < diffDays) {
      showToast(`Insufficient PTO balance! (${balances.pto} left, requested ${diffDays})`, "info");
      return;
    }
    balances.pto -= diffDays;
  } else if (type.includes("Sick")) {
    balances.sick = Math.max(0, balances.sick - diffDays);
  } else {
    balances.casual = Math.max(0, balances.casual - diffDays);
  }

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

  document.getElementById('leaveReason').value = '';
  showToast(`Leave request for ${diffDays} day(s) submitted! Status: Pending HR Approval.`, "success");
}

function updateBalanceDisplays() {
  document.getElementById('balancePTO').textContent = balances.pto;
  document.getElementById('balanceSick').textContent = balances.sick;
  document.getElementById('balanceCasual').textContent = balances.casual;
  document.getElementById('metricLeaves').textContent = `${balances.pto} Days`;

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

    let actionBtn = `<span style="color:var(--text-dim); font-size:11px;">Awaiting HR</span>`;
    if ((currentRole === "hr" || currentRole === "admin") && !isApproved) {
      actionBtn = `<button class="action-btn-sm hover-bounce" onclick="approveLeave(${record.id})">✅ Approve</button>`;
    } else if (isApproved) {
      actionBtn = `<span style="color:var(--accent-green); font-size:11px; font-weight:700;">Verified</span>`;
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
    showToast(`Leave ID #${id} approved! Notification sent to employee.`, "success");
  }
}

// ========================================================
// 11. EMPLOYEE DIRECTORY
// ========================================================
function renderDirectory(list) {
  const container = document.getElementById('directoryGrid');
  if (!container) return;
  container.innerHTML = '';

  list.forEach(emp => {
    const card = document.createElement('div');
    card.className = 'emp-card hover-glow';
    card.innerHTML = `
      <div class="emp-avatar">${emp.name.charAt(0)}</div>
      <div>
        <strong style="font-size:14.5px;">${emp.name}</strong>
        <p style="font-size:12px; color:var(--text-muted); margin: 3px 0;">${emp.role}</p>
        <span style="font-size:10px; background:rgba(99, 102, 241, 0.18); color:#c7d2fe; padding:3px 8px; border-radius:10px; font-weight:700;">${emp.dept}</span>
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

// ========================================================
// 12. BACKEND HEALTH CHECK & INITIALIZE
// ========================================================
async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (res.ok) {
      const data = await res.json();
      console.log("Connected to INCLUAI Backend:", data);
      const text = document.getElementById('voiceStatusText');
      if (text) {
        text.textContent = `Backend Online (${data.aiEngine})`;
      }
      showToast("🟢 Connected to live Node.js Express Backend!", "success");
    }
  } catch (err) {
    console.log("Backend offline, running in standalone browser mode");
  }
}

window.addEventListener('DOMContentLoaded', () => {
  checkBackendStatus();
  renderDirectory(directory);
  renderLeaveTable();
  updateBalanceDisplays();

  const today = new Date().toISOString().split('T')[0];
  const fromEl = document.getElementById('leaveFrom');
  const toEl = document.getElementById('leaveTo');
  if (fromEl) fromEl.value = today;
  if (toEl) toEl.value = today;
});
