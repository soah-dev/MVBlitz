// MemBlitz - Bible Memory Verse Quiz App

// API.Bible Configuration
const BIBLE_API_KEY = 'wtWRu8mZevMTv5DwqjO6g'; // Get free key from https://scripture.api.bible
const NKJV_BIBLE_ID = 'de4e12af7f28f599-02'; // NKJV Bible ID in API.Bible

// Unsplash API Configuration
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_KEY_HERE'; // Get free key from https://unsplash.com/developers

// Book name to API.Bible abbreviation mapping
const BOOK_ABBREVIATIONS = {
  "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
  "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
  "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
  "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
  "Esther": "EST", "Job": "JOB", "Psalm": "PSA", "Proverbs": "PRO",
  "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
  "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
  "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON",
  "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB", "Zephaniah": "ZEP",
  "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL", "Matthew": "MAT",
  "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT",
  "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO", "Galatians": "GAL",
  "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
  "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI",
  "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB",
  "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN",
  "2 John": "2JN", "3 John": "3JN", "Jude": "JUD", "Revelation": "REV"
};

// Bible books for dropdown
const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalm", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
  "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
  "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

// ===== DARK MODE =====
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateThemeIcon();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      updateThemeIcon();
    }
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? '&#9788;' : '&#9790;';
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }
}

// Initialize theme immediately
initTheme();

// ===== SOUND & HAPTIC FEEDBACK =====
let audioCtx = null;
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // on by default

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', gain = 0.3) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    vol.gain.value = gain;
    vol.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* silent fail */ }
}

function playCorrectSound() {
  if (!soundEnabled) return;
  playTone(523, 0.15); // C5
  setTimeout(() => playTone(659, 0.15), 100); // E5
  setTimeout(() => playTone(784, 0.2), 200); // G5
}

function playIncorrectSound() {
  if (!soundEnabled) return;
  playTone(330, 0.15, 'triangle'); // E4
  setTimeout(() => playTone(277, 0.25, 'triangle'), 120); // C#4
}

function playTimerWarningSound() {
  if (!soundEnabled) return;
  playTone(880, 0.1, 'square', 0.15);
}

function playQuizCompleteSound() {
  if (!soundEnabled) return;
  playTone(523, 0.15); // C5
  setTimeout(() => playTone(659, 0.12), 120);
  setTimeout(() => playTone(784, 0.12), 240);
  setTimeout(() => playTone(1047, 0.3), 360); // C6
}

function vibrateCorrect() {
  if (navigator.vibrate) navigator.vibrate(50);
}

function vibrateIncorrect() {
  if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
}

function vibrateTimerWarning() {
  if (navigator.vibrate) navigator.vibrate([30, 30, 30, 30, 30]);
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  updateSoundIcon();
}

function updateSoundIcon() {
  const btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.innerHTML = soundEnabled ? '&#128264;' : '&#128263;';
    btn.title = soundEnabled ? 'Mute sounds' : 'Unmute sounds';
  }
}

// Quiz state
let quizState = {
  verses: [],
  currentIndex: 0,
  score: 0,
  answered: false,
  hintUsed: false,
  versesAnswered: 0,
  lastMode: 'random',
  // Timer
  timerEnabled: false,
  timerSeconds: 30,
  timerRemaining: 0,
  timerInterval: null,
  // Multiplayer
  isMultiplayer: false,
  players: [],          // { name, verses[], currentVerseIndex, score, versesAnswered }
  currentPlayerIndex: 0,
  currentRound: 1,
  totalRounds: 0
};

// Auth state
let isAuthMode = 'login'; // 'login' or 'signup'

// DOM Elements
const views = {
  auth: document.getElementById('auth-view'),
  home: document.getElementById('home-view'),
  quizSetup: document.getElementById('quiz-setup-view'),
  handoff: document.getElementById('handoff-view'),
  quiz: document.getElementById('quiz-view'),
  quizComplete: document.getElementById('quiz-complete-view'),
  stats: document.getElementById('stats-view'),
  manage: document.getElementById('manage-view'),
  form: document.getElementById('form-view')
};

// ===== AUTHENTICATION =====

// Set up auth event listeners immediately (before auth state fires)
function setupAuthListeners() {
  document.getElementById('auth-form').addEventListener('submit', onAuthFormSubmit);
  document.getElementById('login-tab').addEventListener('click', () => switchAuthMode('login'));
  document.getElementById('signup-tab').addEventListener('click', () => switchAuthMode('signup'));
  document.getElementById('google-sign-in-btn').addEventListener('click', signInWithGoogle);
  document.getElementById('guest-btn').addEventListener('click', signInAsGuest);
  document.getElementById('logout-btn').addEventListener('click', handleSignOut);
}

// Attach auth listeners right away
setupAuthListeners();

// Auth state listener
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // User is signed in
    setCurrentUser(user.uid);
    displayUserInfo(user);
    try {
      await init();
    } catch (err) {
      console.error('Init error:', err);
    }
    showView('home');
  } else {
    // User is signed out
    setCurrentUser(null);
    showView('auth');
  }
});

// Display user info in header
function displayUserInfo(user) {
  const userInfo = document.getElementById('user-info');
  const logoutBtn = document.getElementById('logout-btn');

  if (user.isAnonymous) {
    userInfo.textContent = 'Guest';
    logoutBtn.textContent = 'Sign Up / Log In';
  } else {
    userInfo.textContent = user.displayName || user.email;
    logoutBtn.textContent = 'Log Out';
  }
}

// Sign in as guest (anonymous)
async function signInAsGuest() {
  try {
    hideAuthError();
    await auth.signInAnonymously();
  } catch (error) {
    showAuthError('Could not start guest session. Please try again.');
  }
}

// Sign up with email/password
async function signUpWithEmail(email, password) {
  try {
    hideAuthError();
    await auth.createUserWithEmailAndPassword(email, password);
  } catch (error) {
    showAuthError(getAuthErrorMessage(error.code));
  }
}

// Sign in with email/password
async function signInWithEmail(email, password) {
  try {
    hideAuthError();
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    showAuthError(getAuthErrorMessage(error.code));
  }
}

// Sign in with Google
async function signInWithGoogle() {
  try {
    hideAuthError();
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
  } catch (error) {
    console.error('Google sign-in error:', error.code, error.message);
    if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
      showAuthError(getAuthErrorMessage(error.code));
    }
  }
}

// Sign out
async function handleSignOut() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Get user-friendly auth error messages
function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      return 'An error occurred. Please try again.';
  }
}

// Show auth error
function showAuthError(message) {
  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

// Hide auth error
function hideAuthError() {
  document.getElementById('auth-error').classList.add('hidden');
}

// ===== APP INITIALIZATION =====

// Initialize the app
async function init() {
  // Initialize with sample verses if empty
  await initializeWithSamples();

  // Populate book dropdown
  populateBookDropdown();

  // Set up event listeners (only once)
  if (!init._listenersSet) {
    setupEventListeners();
    init._listenersSet = true;
  }

  // Update verse count on home
  await updateVerseCount();
}

// Populate the book dropdown
function populateBookDropdown() {
  const select = document.getElementById('verse-book');
  // Clear existing options except the first placeholder
  while (select.options.length > 1) {
    select.remove(1);
  }
  BIBLE_BOOKS.forEach(book => {
    const option = document.createElement('option');
    option.value = book;
    option.textContent = book;
    select.appendChild(option);
  });
}

// Set up all event listeners
function setupEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);

  // Sound toggle
  document.getElementById('sound-toggle-btn').addEventListener('click', toggleSound);
  updateSoundIcon();

  // Swipe gestures
  setupSwipeGestures();

  // Home view — quiz mode buttons
  document.getElementById('quiz-favorites-btn').addEventListener('click', () => openQuizSetup('favorites'));
  document.getElementById('quiz-random-btn').addEventListener('click', () => openQuizSetup('random'));
  document.getElementById('quick-start-btn').addEventListener('click', quickStart);
  document.getElementById('manage-verses-btn').addEventListener('click', () => showView('manage'));
  document.getElementById('stats-btn').addEventListener('click', () => showStatsView());
  document.getElementById('stats-back-btn').addEventListener('click', () => showView('home'));
  document.getElementById('welcome-dismiss').addEventListener('click', dismissWelcomeBanner);

  // Quiz setup view
  document.getElementById('quiz-setup-back-btn').addEventListener('click', () => showView('home'));
  document.getElementById('quiz-start-btn').addEventListener('click', startQuizFromSetup);
  document.getElementById('quiz-verse-count').addEventListener('input', onVerseCountSliderChange);
  document.querySelectorAll('.btn-count-preset').forEach(btn => {
    btn.addEventListener('click', onCountPresetClick);
  });
  document.querySelectorAll('.btn-player-preset').forEach(btn => {
    btn.addEventListener('click', onPlayerPresetClick);
  });

  // Multiplayer toggle
  document.getElementById('multiplayer-toggle').addEventListener('change', onMultiplayerToggle);

  // Timer setup
  document.getElementById('timer-toggle').addEventListener('change', (e) => {
    quizSetupState.timerEnabled = e.target.checked;
    document.getElementById('timer-duration-picker').classList.toggle('hidden', !e.target.checked);
  });
  document.querySelectorAll('#timer-duration-picker .btn-count-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      quizSetupState.timerSeconds = parseInt(e.currentTarget.dataset.seconds);
      document.querySelectorAll('#timer-duration-picker .btn-count-preset').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // Handoff view
  document.getElementById('handoff-ready-btn').addEventListener('click', onHandoffReady);

  // Quiz view
  document.getElementById('quiz-back-btn').addEventListener('click', () => showView('home'));
  document.getElementById('end-session-btn').addEventListener('click', endSession);
  document.getElementById('reveal-answer-btn').addEventListener('click', revealAnswer);
  document.getElementById('knew-it-btn').addEventListener('click', () => rateAnswer(true));
  document.getElementById('still-learning-btn').addEventListener('click', () => rateAnswer(false));
  document.getElementById('show-image-hint').addEventListener('click', showImageHint);
  document.getElementById('show-text-hint').addEventListener('click', showTextHint);

  // Quiz complete view
  document.getElementById('restart-quiz-btn').addEventListener('click', () => startQuiz(quizState.lastMode || 'random'));
  document.getElementById('share-results-btn').addEventListener('click', shareResults);
  document.getElementById('back-home-btn').addEventListener('click', () => showView('home'));

  // Manage view
  document.getElementById('manage-back-btn').addEventListener('click', () => showView('home'));
  document.getElementById('add-verse-btn').addEventListener('click', () => openVerseForm());
  document.getElementById('add-first-verse-btn').addEventListener('click', () => openVerseForm());

  // Reset verses
  document.getElementById('reset-verses-btn').addEventListener('click', onResetVerses);

  // Form view
  document.getElementById('form-back-btn').addEventListener('click', () => showView('manage'));
  document.getElementById('cancel-form-btn').addEventListener('click', () => showView('manage'));
  document.getElementById('verse-form').addEventListener('submit', saveVerseForm);
  document.getElementById('search-image-btn').addEventListener('click', onSearchImageClick);
  document.getElementById('clear-image-btn').addEventListener('click', clearSelectedImage);
  document.getElementById('verse-image-url-manual').addEventListener('input', onManualUrlInput);

  // Dynamic form validation
  document.getElementById('verse-book').addEventListener('change', onBookChange);
  document.getElementById('verse-chapter').addEventListener('change', onChapterChange);
  document.getElementById('verse-verse').addEventListener('input', debounce(onVerseChange, 500));
}

// Handle auth form submission
async function onAuthFormSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (isAuthMode === 'signup') {
    await signUpWithEmail(email, password);
  } else {
    await signInWithEmail(email, password);
  }
}

// Switch between login and signup modes
function switchAuthMode(mode) {
  isAuthMode = mode;
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (mode === 'login') {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    submitBtn.textContent = 'Log In';
  } else {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    submitBtn.textContent = 'Sign Up';
  }
  hideAuthError();
}

// Show a specific view
function showView(viewName) {
  Object.values(views).forEach(view => view.classList.remove('active'));
  views[viewName].classList.add('active');

  // Update content when showing certain views
  if (viewName === 'home') {
    updateVerseCount();
  } else if (viewName === 'manage') {
    renderVerseList();
  }
}

// Update verse counts on home screen
async function updateVerseCount() {
  let allVerses = [];
  let favoriteVerses = [];
  try {
    allVerses = await getVerses();
    favoriteVerses = await getFavoriteVerses();
  } catch (err) {
    console.error('Error loading verse counts:', err);
  }

  const totalCount = allVerses.length;
  const favCount = favoriteVerses.length;

  document.getElementById('random-count').textContent =
    totalCount === 1 ? '1 verse' : `${totalCount} verses`;
  document.getElementById('favorites-count').textContent =
    favCount === 1 ? '1 verse' : `${favCount} verses`;

  // Disable favorites button when 0 favorites and show hint
  const favBtn = document.getElementById('quiz-favorites-btn');
  const favHint = document.getElementById('favorites-hint');
  if (favCount === 0) {
    favBtn.classList.add('disabled');
    favHint.classList.remove('hidden');
  } else {
    favBtn.classList.remove('disabled');
    favHint.classList.add('hidden');
  }

  // Show welcome banner for first-time users
  if (totalCount > 0 && !localStorage.getItem('welcomeDismissed')) {
    document.getElementById('welcome-banner').classList.remove('hidden');
  }
}

// Format verse reference for display
function formatReference(ref) {
  return `${ref.book} ${ref.chapter}:${ref.verse}`;
}

// Dismiss welcome banner
function dismissWelcomeBanner() {
  document.getElementById('welcome-banner').classList.add('hidden');
  localStorage.setItem('welcomeDismissed', 'true');
}

// Quick Start: random mode, 5 verses, 1 player, no timer
async function quickStart() {
  dismissWelcomeBanner();
  const verses = await getVerses();
  if (verses.length === 0) {
    alert('No verses available. Please add some verses first.');
    showView('manage');
    return;
  }

  const count = Math.min(5, verses.length);
  const shuffled = shuffleArray([...verses]);

  quizState.verses = shuffled.slice(0, count);
  quizState.currentIndex = 0;
  quizState.score = 0;
  quizState.versesAnswered = 0;
  quizState.lastMode = 'random';
  quizState.isMultiplayer = false;
  quizState.players = [];
  quizState.timerEnabled = false;

  showView('quiz');
  updateScoreDisplay();
  displayCurrentVerse();
}

// Handle multiplayer toggle
function onMultiplayerToggle(e) {
  const isMultiplayer = e.target.checked;
  const optionsEl = document.getElementById('multiplayer-options');

  if (isMultiplayer) {
    optionsEl.classList.remove('hidden');
    // Default to 2 players
    quizSetupState.playerCount = 2;
    document.querySelectorAll('.btn-player-preset').forEach(b => b.classList.remove('active'));
    const btn2 = document.querySelector('.btn-player-preset[data-count="2"]');
    if (btn2) btn2.classList.add('active');
    renderPlayerNameInputs(2);
    document.getElementById('verse-count-label').textContent = 'How many verses per player?';
    updateVerseCountConstraints();
  } else {
    optionsEl.classList.add('hidden');
    quizSetupState.playerCount = 1;
    quizSetupState.playerNames = [];
    document.getElementById('verse-count-label').textContent = 'How many verses?';
    // Reset slider max to full total
    const total = quizSetupState.availableVerses.length;
    const slider = document.getElementById('quiz-verse-count');
    slider.max = total;
    if (quizSetupState.selectedCount > total) {
      quizSetupState.selectedCount = Math.min(5, total);
      slider.value = quizSetupState.selectedCount;
    }
    updateVerseCountDisplay(quizSetupState.selectedCount, total);
    document.getElementById('quiz-setup-note').classList.add('hidden');
    document.getElementById('quiz-start-btn').disabled = false;

    // Update preset buttons for full range
    document.querySelectorAll('.quiz-verse-count-picker .btn-count-preset').forEach(btn => {
      const val = btn.dataset.count;
      if (val === 'all') {
        btn.classList.toggle('disabled-preset', false);
      } else {
        btn.classList.toggle('disabled-preset', parseInt(val) > total);
      }
      btn.classList.toggle('active',
        (val === 'all' && quizSetupState.selectedCount === total) ||
        (val !== 'all' && parseInt(val) === quizSetupState.selectedCount)
      );
    });
  }
}

// ===== QUIZ FUNCTIONS =====

// Pending setup state
let quizSetupState = {
  mode: 'random',
  availableVerses: [],
  selectedCount: 5,
  playerCount: 1,
  playerNames: [],
  timerEnabled: false,
  timerSeconds: 30
};

// Open the quiz setup screen
async function openQuizSetup(mode) {
  let verses;

  if (mode === 'favorites') {
    verses = await getFavoriteVerses();
    if (verses.length === 0) {
      alert('No favorite verses yet. Star some verses in Manage Verses first!');
      return;
    }
  } else {
    verses = await getVerses();
    if (verses.length === 0) {
      alert('No verses available. Please add some verses first.');
      showView('manage');
      return;
    }
  }

  quizSetupState.mode = mode;
  quizSetupState.availableVerses = verses;

  // Reset multiplayer to off
  quizSetupState.playerCount = 1;
  quizSetupState.playerNames = [];
  document.getElementById('multiplayer-toggle').checked = false;
  document.getElementById('multiplayer-options').classList.add('hidden');
  document.querySelectorAll('.btn-player-preset').forEach(b => b.classList.remove('active'));
  document.getElementById('verse-count-label').textContent = 'How many verses?';
  document.getElementById('quiz-setup-note').classList.add('hidden');
  document.getElementById('quiz-start-btn').disabled = false;

  // Reset timer setup
  quizSetupState.timerEnabled = false;
  quizSetupState.timerSeconds = 30;
  document.getElementById('timer-toggle').checked = false;
  document.getElementById('timer-duration-picker').classList.add('hidden');
  document.querySelectorAll('#timer-duration-picker .btn-count-preset').forEach(b => b.classList.remove('active'));
  const defaultTimerBtn = document.querySelector('#timer-duration-picker .btn-count-preset[data-seconds="30"]');
  if (defaultTimerBtn) defaultTimerBtn.classList.add('active');

  // Update setup UI
  const total = verses.length;
  document.getElementById('quiz-setup-title').textContent =
    mode === 'favorites' ? 'Favorites Quiz' : 'All Verses Quiz';
  document.getElementById('quiz-setup-available').textContent =
    `${total} verse${total === 1 ? '' : 's'} available`;

  // Configure slider
  const slider = document.getElementById('quiz-verse-count');
  slider.max = total;
  slider.min = 1;

  // Pick a sensible default
  const defaultCount = Math.min(5, total);
  slider.value = defaultCount;
  quizSetupState.selectedCount = defaultCount;
  updateVerseCountDisplay(defaultCount, total);

  // Update preset buttons
  document.querySelectorAll('.btn-count-preset').forEach(btn => {
    const val = btn.dataset.count;
    if (val === 'all') {
      btn.classList.toggle('disabled-preset', false);
    } else {
      const num = parseInt(val);
      btn.classList.toggle('disabled-preset', num > total);
    }
    // Highlight matching preset
    btn.classList.toggle('active',
      (val === 'all' && defaultCount === total) ||
      (val !== 'all' && parseInt(val) === defaultCount)
    );
  });

  showView('quizSetup');
}

// Handle preset button clicks
function onCountPresetClick(e) {
  const btn = e.currentTarget;
  if (btn.classList.contains('disabled-preset')) return;

  const maxVal = parseInt(document.getElementById('quiz-verse-count').max);
  const val = btn.dataset.count;
  const count = val === 'all' ? maxVal : parseInt(val);

  if (count > maxVal) return;

  quizSetupState.selectedCount = count;
  document.getElementById('quiz-verse-count').value = count;
  updateVerseCountDisplay(count, maxVal);

  // Update active state
  document.querySelectorAll('.btn-count-preset').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// Handle slider change
function onVerseCountSliderChange() {
  const count = parseInt(document.getElementById('quiz-verse-count').value);
  const maxVal = parseInt(document.getElementById('quiz-verse-count').max);
  quizSetupState.selectedCount = count;
  updateVerseCountDisplay(count, maxVal);

  // Update preset active state to match slider
  document.querySelectorAll('.btn-count-preset').forEach(btn => {
    const val = btn.dataset.count;
    btn.classList.toggle('active',
      (val === 'all' && count === maxVal) ||
      (val !== 'all' && parseInt(val) === count)
    );
  });
}

// Update the verse count display text
function updateVerseCountDisplay(count, total) {
  const display = document.getElementById('quiz-verse-count-display');
  display.textContent = count === total ? `All ${total} verses` : `${count} verse${count === 1 ? '' : 's'}`;
}

// Handle player preset button clicks
function onPlayerPresetClick(e) {
  const btn = e.currentTarget;
  const count = parseInt(btn.dataset.count);

  quizSetupState.playerCount = count;

  // Update active state
  document.querySelectorAll('.btn-player-preset').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide player names section
  const namesSection = document.getElementById('player-names-section');
  if (count > 1) {
    namesSection.classList.remove('hidden');
    renderPlayerNameInputs(count);
  } else {
    namesSection.classList.add('hidden');
  }

  // Update verse count label
  document.getElementById('verse-count-label').textContent =
    count > 1 ? 'How many verses per player?' : 'How many verses?';

  // Recalculate max verse count based on player count
  updateVerseCountConstraints();
}

// Render player name input fields
function renderPlayerNameInputs(count) {
  const list = document.getElementById('player-names-list');
  list.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const existing = quizSetupState.playerNames[i] || '';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'player-name-input';
    input.placeholder = `Player ${i + 1}`;
    input.value = existing;
    input.maxLength = 20;
    input.dataset.index = i;
    input.addEventListener('input', (e) => {
      quizSetupState.playerNames[parseInt(e.target.dataset.index)] = e.target.value.trim();
    });
    list.appendChild(input);
  }
  // Trim array
  quizSetupState.playerNames = quizSetupState.playerNames.slice(0, count);
}

// Recalculate verse slider max based on player count
function updateVerseCountConstraints() {
  const total = quizSetupState.availableVerses.length;
  const playerCount = quizSetupState.playerCount;
  const maxPerPlayer = Math.floor(total / playerCount);

  const slider = document.getElementById('quiz-verse-count');
  const noteEl = document.getElementById('quiz-setup-note');

  if (maxPerPlayer < 1) {
    // Not enough verses for this many players
    slider.max = 1;
    slider.value = 1;
    quizSetupState.selectedCount = 1;
    noteEl.textContent = `Not enough verses for ${playerCount} players. Add more verses or reduce players.`;
    noteEl.classList.remove('hidden');
    document.getElementById('quiz-start-btn').disabled = true;
  } else {
    slider.max = maxPerPlayer;
    document.getElementById('quiz-start-btn').disabled = false;

    // Cap current selection
    if (quizSetupState.selectedCount > maxPerPlayer) {
      quizSetupState.selectedCount = maxPerPlayer;
      slider.value = maxPerPlayer;
    }

    if (maxPerPlayer < total && playerCount > 1) {
      noteEl.textContent = `Max ${maxPerPlayer} verses per player (${total} total ÷ ${playerCount} players)`;
      noteEl.classList.remove('hidden');
    } else {
      noteEl.classList.add('hidden');
    }
  }

  updateVerseCountDisplay(quizSetupState.selectedCount, parseInt(slider.max));

  // Update preset buttons
  document.querySelectorAll('.btn-count-preset').forEach(btn => {
    const val = btn.dataset.count;
    if (val === 'all') {
      btn.classList.toggle('disabled-preset', false);
    } else {
      const num = parseInt(val);
      btn.classList.toggle('disabled-preset', num > maxPerPlayer);
    }
    btn.classList.toggle('active',
      (val === 'all' && quizSetupState.selectedCount === maxPerPlayer) ||
      (val !== 'all' && parseInt(val) === quizSetupState.selectedCount)
    );
  });
}

// Start quiz from setup screen
function startQuizFromSetup() {
  const verses = quizSetupState.availableVerses;
  const count = quizSetupState.selectedCount;
  const playerCount = quizSetupState.playerCount;

  quizState.lastMode = quizSetupState.mode;
  quizState.timerEnabled = quizSetupState.timerEnabled;
  quizState.timerSeconds = quizSetupState.timerSeconds;

  if (playerCount <= 1) {
    // Single player — existing flow
    const shuffled = shuffleArray([...verses]);
    quizState.verses = shuffled.slice(0, count);
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizState.versesAnswered = 0;
    quizState.isMultiplayer = false;
    quizState.players = [];

    showView('quiz');
    updateScoreDisplay();
    displayCurrentVerse();
  } else {
    // Multiplayer
    const shuffled = shuffleArray([...verses]);
    const totalNeeded = playerCount * count;

    quizState.isMultiplayer = true;
    quizState.currentPlayerIndex = 0;
    quizState.currentRound = 1;
    quizState.totalRounds = count;

    // Build player objects with unique verse subsets
    quizState.players = [];
    for (let i = 0; i < playerCount; i++) {
      const name = (quizSetupState.playerNames[i] || '').trim() || `Player ${i + 1}`;
      const playerVerses = shuffled.slice(i * count, (i + 1) * count);
      quizState.players.push({
        name,
        verses: playerVerses,
        currentVerseIndex: 0,
        score: 0,
        versesAnswered: 0
      });
    }

    // Show handoff for first player
    showHandoff();
  }
}

// Start the quiz (used by "Quiz Again" button)
async function startQuiz(mode = 'random') {
  // Re-open setup so user can pick count again
  await openQuizSetup(mode);
}

// Show the handoff screen for the current player
function showHandoff() {
  const player = quizState.players[quizState.currentPlayerIndex];
  document.getElementById('handoff-player-name').textContent = player.name;
  document.getElementById('handoff-round').textContent =
    `Round ${quizState.currentRound} of ${quizState.totalRounds}`;
  showView('handoff');
}

// When player taps "I'm Ready" on handoff screen
function onHandoffReady() {
  showView('quiz');
  updateScoreDisplay();
  displayCurrentVerse();
}

// Shuffle array (Fisher-Yates)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Display the current verse in quiz mode (flashcard style)
function displayCurrentVerse() {
  let verse;
  let currentNum, totalNum, progressText;

  if (quizState.isMultiplayer) {
    const player = quizState.players[quizState.currentPlayerIndex];
    verse = player.verses[player.currentVerseIndex];
    currentNum = player.currentVerseIndex + 1;
    totalNum = player.verses.length;
    progressText = `${player.name} — Verse ${currentNum} of ${totalNum}`;
  } else {
    verse = quizState.verses[quizState.currentIndex];
    currentNum = quizState.currentIndex + 1;
    totalNum = quizState.verses.length;
    progressText = `Verse ${currentNum} of ${totalNum}`;
  }

  quizState.answered = false;
  quizState.hintUsed = false;

  // Update progress
  document.getElementById('quiz-progress').textContent = progressText;

  // Update progress bar
  const progressPercent = (currentNum / totalNum) * 100;
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;

  // Update reference on both sides
  const reference = formatReference(verse.reference);
  document.getElementById('verse-reference').textContent = reference;
  document.getElementById('verse-reference-back').textContent = reference;

  // Set up verse text for reveal
  document.getElementById('verse-text-display').textContent = verse.text;

  // Reset hints
  document.getElementById('image-hint-container').classList.add('hidden');
  document.getElementById('text-hint-container').classList.add('hidden');

  // Set up hint content
  const hintImage = document.getElementById('hint-image');
  if (verse.imageHintUrl) {
    hintImage.src = verse.imageHintUrl;
    document.getElementById('show-image-hint').disabled = false;
  } else {
    document.getElementById('show-image-hint').disabled = true;
  }

  if (verse.textHint) {
    document.getElementById('hint-text').textContent = verse.textHint;
    document.getElementById('show-text-hint').disabled = false;
  } else {
    document.getElementById('show-text-hint').disabled = true;
  }

  // Show front, hide back
  document.getElementById('flashcard-front').classList.remove('hidden');
  document.getElementById('flashcard-back').classList.add('hidden');

  // Start timer if enabled
  if (quizState.timerEnabled) {
    startTimer();
  } else {
    document.getElementById('quiz-timer').classList.add('hidden');
  }
}

// Reveal the answer (flip flashcard)
function revealAnswer() {
  stopTimer();
  document.getElementById('flashcard-front').classList.add('hidden');
  document.getElementById('flashcard-back').classList.remove('hidden');
}

// Update the running score display
function updateScoreDisplay() {
  const scoreEl = document.getElementById('quiz-score');

  if (quizState.isMultiplayer) {
    const player = quizState.players[quizState.currentPlayerIndex];
    if (player.versesAnswered === 0) {
      scoreEl.textContent = '0% correct';
    } else {
      const percentage = Math.round((player.score / player.versesAnswered) * 100);
      scoreEl.textContent = `${percentage}% correct`;
    }
  } else {
    if (quizState.versesAnswered === 0) {
      scoreEl.textContent = '0% correct';
    } else {
      const percentage = Math.round((quizState.score / quizState.versesAnswered) * 100);
      scoreEl.textContent = `${percentage}% correct`;
    }
  }
}

// Rate whether user knew the answer
function rateAnswer(knewIt) {
  // Sound & haptic feedback
  if (knewIt) { playCorrectSound(); vibrateCorrect(); }
  else { playIncorrectSound(); vibrateIncorrect(); }

  if (quizState.isMultiplayer) {
    rateAnswerMultiplayer(knewIt);
  } else {
    quizState.versesAnswered++;
    if (knewIt) quizState.score += quizState.hintUsed ? 0.5 : 1;
    updateScoreDisplay();

    quizState.currentIndex++;
    if (quizState.currentIndex >= quizState.verses.length) {
      showQuizComplete(false);
    } else {
      displayCurrentVerse();
    }
  }
}

// Multiplayer answer rating with round-robin
function rateAnswerMultiplayer(knewIt) {
  const player = quizState.players[quizState.currentPlayerIndex];
  player.versesAnswered++;
  if (knewIt) player.score += quizState.hintUsed ? 0.5 : 1;

  player.currentVerseIndex++;

  // Move to next player
  quizState.currentPlayerIndex = (quizState.currentPlayerIndex + 1) % quizState.players.length;

  // Check if we completed a round (everyone answered one more verse)
  if (quizState.currentPlayerIndex === 0) {
    quizState.currentRound++;
  }

  // Check if all players have finished all their verses
  const allDone = quizState.players.every(p => p.currentVerseIndex >= p.verses.length);
  if (allDone) {
    showMultiplayerScoreboard(false);
  } else {
    // Show handoff for next player
    showHandoff();
  }
}

// End session early
function endSession() {
  if (quizState.isMultiplayer) {
    const anyAnswered = quizState.players.some(p => p.versesAnswered > 0);
    if (!anyAnswered) {
      showView('home');
      return;
    }
    if (confirm('End this session and see the standings?')) {
      showMultiplayerScoreboard(true);
    }
  } else {
    if (quizState.versesAnswered === 0) {
      showView('home');
      return;
    }
    if (confirm('End this session and see your results?')) {
      showQuizComplete(true);
    }
  }
}

// Show quiz completion screen (unified for single & multiplayer)
function showQuizComplete(endedEarly = false) {
  playQuizCompleteSound();

  document.getElementById('complete-title').textContent =
    endedEarly ? 'Session Ended' : 'Quiz Complete!';

  // Build a players array — for single player, wrap the solo stats into one entry
  let players;
  if (quizState.isMultiplayer) {
    players = quizState.players;
  } else {
    players = [{
      name: 'You',
      score: quizState.score,
      versesAnswered: quizState.versesAnswered
    }];
  }

  // Sort by accuracy descending, then score descending
  const sorted = [...players].sort((a, b) => {
    const pctA = a.versesAnswered > 0 ? a.score / a.versesAnswered : 0;
    const pctB = b.versesAnswered > 0 ? b.score / b.versesAnswered : 0;
    if (pctB !== pctA) return pctB - pctA;
    return b.score - a.score;
  });

  const medals = ['gold', 'silver', 'bronze'];
  const medalSymbols = ['1st', '2nd', '3rd'];

  const scoreboard = document.getElementById('mp-scoreboard');
  scoreboard.innerHTML = '';

  sorted.forEach((player, index) => {
    const pct = player.versesAnswered > 0
      ? Math.round((player.score / player.versesAnswered) * 100)
      : 0;
    const medalClass = index < 3 ? medals[index] : '';
    const rank = index + 1;

    const row = document.createElement('div');
    row.className = `mp-score-row ${medalClass}`;
    row.innerHTML = `
      ${quizState.isMultiplayer ? `<span class="mp-rank">${index < 3 ? medalSymbols[index] : rank + 'th'}</span>` : ''}
      <span class="mp-player-name">${player.name}</span>
      <span class="mp-player-stats">${player.score}/${player.versesAnswered} (${pct}%)</span>
    `;
    scoreboard.appendChild(row);
  });

  // Save quiz session to history
  try {
    const sessionPlayers = sorted.map(p => ({
      name: p.name,
      score: p.score,
      versesAnswered: p.versesAnswered
    }));
    saveQuizSession({
      mode: quizState.lastMode,
      playerCount: quizState.isMultiplayer ? quizState.players.length : 1,
      players: sessionPlayers,
      timerEnabled: quizState.timerEnabled,
      timerSeconds: quizState.timerSeconds,
      endedEarly
    });
  } catch (e) {
    console.error('Error saving quiz session:', e);
  }

  showView('quizComplete');
}

// Alias for multiplayer completion
function showMultiplayerScoreboard(endedEarly = false) {
  showQuizComplete(endedEarly);
}

// ===== STATS VIEW =====
async function showStatsView() {
  showView('stats');

  try {
    const stats = await getQuizStats();
    document.getElementById('stat-total-quizzes').textContent = stats.totalQuizzes;
    document.getElementById('stat-total-verses').textContent = stats.totalVerses;
    document.getElementById('stat-avg-accuracy').textContent = stats.avgAccuracy + '%';
    document.getElementById('stat-best-score').textContent = stats.bestScore + '%';

    const history = await getQuizHistory(10);
    const historyEl = document.getElementById('stats-history');

    if (history.length === 0) {
      historyEl.innerHTML = '<p class="stats-empty">No quiz sessions yet. Complete a quiz to see your history!</p>';
      return;
    }

    historyEl.innerHTML = '';
    history.forEach(session => {
      const date = new Date(session.date);
      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const mode = session.mode === 'favorites' ? 'Favorites' : 'Random';
      const playerCount = session.playerCount || 1;
      const modeLabel = playerCount > 1 ? `${mode} (${playerCount}p)` : mode;

      let scoreText = '';
      if (session.players && session.players.length > 0) {
        const p = session.players[0];
        const pct = p.versesAnswered > 0 ? Math.round((p.score / p.versesAnswered) * 100) : 0;
        scoreText = `${p.score}/${p.versesAnswered} (${pct}%)`;
        if (playerCount > 1) {
          scoreText = session.players.map(pl => {
            const pc = pl.versesAnswered > 0 ? Math.round((pl.score / pl.versesAnswered) * 100) : 0;
            return `${pl.name}: ${pc}%`;
          }).join(', ');
        }
      }

      const row = document.createElement('div');
      row.className = 'stats-session-row';
      row.innerHTML = `
        <span class="stats-session-date">${dateStr}</span>
        <span class="stats-session-mode">${modeLabel}</span>
        <span class="stats-session-score">${scoreText}</span>
      `;
      historyEl.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// Show image hint
function showImageHint() {
  document.getElementById('image-hint-container').classList.remove('hidden');
  quizState.hintUsed = true;
}

// Show text hint
function showTextHint() {
  document.getElementById('text-hint-container').classList.remove('hidden');
  quizState.hintUsed = true;
}

// ===== MANAGE VERSES FUNCTIONS =====

// Render the verse list
async function renderVerseList() {
  const verses = await getVerses();
  const listEl = document.getElementById('verse-list');
  const emptyState = document.getElementById('empty-state');

  listEl.innerHTML = '';

  if (verses.length === 0) {
    emptyState.classList.remove('hidden');
    listEl.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  listEl.classList.remove('hidden');

  verses.forEach(verse => {
    const isFav = verse.favorite || false;
    const item = document.createElement('div');
    item.className = 'verse-item';
    item.innerHTML = `
      <button class="btn-favorite ${isFav ? 'active' : ''}" data-id="${verse.id}" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">&#9733;</button>
      <div class="verse-item-info">
        <div class="verse-item-reference">${formatReference(verse.reference)}</div>
        <div class="verse-item-preview">${verse.text}</div>
      </div>
      <div class="verse-item-actions">
        <button class="btn btn-secondary btn-small edit-btn" data-id="${verse.id}">Edit</button>
        <button class="btn btn-danger btn-small delete-btn" data-id="${verse.id}">Delete</button>
      </div>
    `;
    listEl.appendChild(item);
  });

  // Add event listeners for favorite/edit/delete buttons
  listEl.querySelectorAll('.btn-favorite').forEach(btn => {
    btn.addEventListener('click', () => toggleFavoriteVerse(btn.dataset.id));
  });

  listEl.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openVerseForm(btn.dataset.id));
  });

  listEl.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => confirmDeleteVerse(btn.dataset.id));
  });
}

// Confirm and delete a verse
async function confirmDeleteVerse(id) {
  const verse = await getVerseById(id);
  if (verse && confirm(`Delete "${formatReference(verse.reference)}"?`)) {
    await deleteVerse(id);
    await renderVerseList();
  }
}

// Toggle favorite on a verse
async function toggleFavoriteVerse(id) {
  await toggleFavorite(id);
  await renderVerseList();
}

// Reset verses to sample data
async function onResetVerses() {
  if (!confirm('This will replace all your current verses with the latest sample verses. Continue?')) {
    return;
  }
  await resetToSamples();
  await renderVerseList();
  await updateVerseCount();
}

// ===== FORM FUNCTIONS =====

// Open the verse form (for add or edit)
async function openVerseForm(id = null) {
  const form = document.getElementById('verse-form');
  const title = document.getElementById('form-title');
  const chapterSelect = document.getElementById('verse-chapter');
  const verseInput = document.getElementById('verse-verse');
  const verseText = document.getElementById('verse-text');

  form.reset();
  document.getElementById('image-preview').classList.remove('visible');
  document.getElementById('image-preview').src = '';
  document.getElementById('clear-image-btn').classList.add('hidden');
  document.getElementById('image-picker-grid').innerHTML = '';
  document.getElementById('image-picker-grid').classList.add('hidden');
  document.getElementById('image-keywords').value = '';
  document.getElementById('verse-image-url-manual').value = '';
  hideImageSearchStatus();
  document.getElementById('verse-range-hint').textContent = '';
  hideFetchStatus();

  // Reset chapter/verse to disabled state
  chapterSelect.innerHTML = '<option value="">--</option>';
  chapterSelect.disabled = true;
  verseInput.disabled = true;
  verseText.value = '';
  verseText.setAttribute('readonly', true);

  if (id) {
    // Edit mode
    const verse = await getVerseById(id);
    if (verse) {
      title.textContent = 'Edit Verse';
      document.getElementById('verse-id').value = verse.id;

      // Set book and trigger chapter population
      document.getElementById('verse-book').value = verse.reference.book;
      onBookChange();

      // Set chapter and trigger verse range hint
      chapterSelect.value = verse.reference.chapter;
      onChapterChange();

      // Set verse and text
      verseInput.value = verse.reference.verse;
      verseText.value = verse.text;
      verseText.removeAttribute('readonly'); // Allow editing in edit mode

      document.getElementById('verse-image-url').value = verse.imageHintUrl || '';
      document.getElementById('verse-image-url-manual').value = verse.imageHintUrl || '';
      document.getElementById('verse-text-hint').value = verse.textHint || '';

      document.getElementById('verse-favorite').checked = verse.favorite || false;

      if (verse.imageHintUrl) {
        const preview = document.getElementById('image-preview');
        preview.src = verse.imageHintUrl;
        preview.classList.add('visible');
        document.getElementById('clear-image-btn').classList.remove('hidden');
      }
    }
  } else {
    // Add mode
    title.textContent = 'Add New Verse';
    document.getElementById('verse-id').value = '';
  }

  showView('form');
}

// Save the verse form
async function saveVerseForm(e) {
  e.preventDefault();

  const id = document.getElementById('verse-id').value || null;
  const verse = {
    id: id,
    reference: {
      book: document.getElementById('verse-book').value,
      chapter: parseInt(document.getElementById('verse-chapter').value),
      verse: document.getElementById('verse-verse').value
    },
    text: document.getElementById('verse-text').value.trim(),
    imageHintUrl: document.getElementById('verse-image-url').value.trim() || null,
    textHint: document.getElementById('verse-text-hint').value.trim() || null,
    favorite: document.getElementById('verse-favorite').checked
  };

  await saveVerse(verse);
  showView('manage');
}

// ===== DYNAMIC FORM VALIDATION =====

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// When book is selected, populate chapters
function onBookChange() {
  const book = document.getElementById('verse-book').value;
  const chapterSelect = document.getElementById('verse-chapter');
  const verseInput = document.getElementById('verse-verse');
  const verseText = document.getElementById('verse-text');

  // Reset downstream fields
  chapterSelect.innerHTML = '<option value="">Select chapter...</option>';
  verseInput.value = '';
  verseInput.disabled = true;
  verseText.value = '';
  document.getElementById('verse-range-hint').textContent = '';

  if (!book) {
    chapterSelect.disabled = true;
    return;
  }

  // Populate chapters
  const chapterCount = getChapterCount(book);
  for (let i = 1; i <= chapterCount; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    chapterSelect.appendChild(option);
  }
  chapterSelect.disabled = false;
}

// When chapter is selected, enable verse input and show range
function onChapterChange() {
  const book = document.getElementById('verse-book').value;
  const chapter = parseInt(document.getElementById('verse-chapter').value);
  const verseInput = document.getElementById('verse-verse');
  const verseText = document.getElementById('verse-text');
  const rangeHint = document.getElementById('verse-range-hint');

  verseInput.value = '';
  verseText.value = '';

  if (!book || !chapter) {
    verseInput.disabled = true;
    rangeHint.textContent = '';
    return;
  }

  const verseCount = getVerseCount(book, chapter);
  rangeHint.textContent = `(1-${verseCount})`;
  verseInput.disabled = false;
  verseInput.max = verseCount;
  verseInput.placeholder = `1-${verseCount}`;
}

// When verse is entered, validate and fetch text
function onVerseChange() {
  const book = document.getElementById('verse-book').value;
  const chapter = parseInt(document.getElementById('verse-chapter').value);
  const verseValue = document.getElementById('verse-verse').value.trim();

  if (!book || !chapter || !verseValue) {
    return;
  }

  // Validate the verse reference
  if (!isValidReference(book, chapter, verseValue)) {
    const verseCount = getVerseCount(book, chapter);
    showFetchStatus(`Invalid verse. Must be between 1 and ${verseCount}`, true);
    return;
  }

  // Fetch the verse text
  fetchVerseText(book, chapter, verseValue);
}

// Show fetch status message
function showFetchStatus(message, isError = false) {
  const status = document.getElementById('fetch-status');
  status.textContent = message;
  status.classList.remove('hidden', 'error');
  if (isError) {
    status.classList.add('error');
  }
}

// Hide fetch status
function hideFetchStatus() {
  document.getElementById('fetch-status').classList.add('hidden');
}

// Fetch verse text from API.Bible (NKJV)
async function fetchVerseText(book, chapter, verse) {
  const verseText = document.getElementById('verse-text');

  // Check if API key is configured
  if (BIBLE_API_KEY === 'YOUR_API_KEY_HERE') {
    showFetchStatus('API key not configured. Please enter verse manually.', true);
    verseText.removeAttribute('readonly');
    setTimeout(hideFetchStatus, 3000);
    return;
  }

  // Format the passage ID for API.Bible (e.g., "JHN.3.16" or "JHN.3.16-JHN.3.17")
  const bookAbbr = BOOK_ABBREVIATIONS[book];
  if (!bookAbbr) {
    showFetchStatus('Unknown book. Please enter verse manually.', true);
    verseText.removeAttribute('readonly');
    setTimeout(hideFetchStatus, 3000);
    return;
  }

  let passageId;
  if (verse.includes('-')) {
    const [startVerse, endVerse] = verse.split('-').map(v => v.trim());
    passageId = `${bookAbbr}.${chapter}.${startVerse}-${bookAbbr}.${chapter}.${endVerse}`;
  } else {
    passageId = `${bookAbbr}.${chapter}.${verse}`;
  }

  showFetchStatus('Loading verse...');

  try {
    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${NKJV_BIBLE_ID}/passages/${passageId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false`,
      {
        headers: {
          'api-key': BIBLE_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error('Verse not found');
    }

    const data = await response.json();

    if (data.data && data.data.content) {
      // Clean up the text (remove extra whitespace and newlines)
      const cleanText = data.data.content.replace(/\s+/g, ' ').trim();
      verseText.value = cleanText;
      verseText.removeAttribute('readonly');
      hideFetchStatus();
    } else {
      throw new Error('No text returned');
    }
  } catch (error) {
    showFetchStatus('Could not fetch verse. Please enter manually.', true);
    verseText.removeAttribute('readonly');
    setTimeout(hideFetchStatus, 3000);
  }
}

// ===== UNSPLASH IMAGE SEARCH =====

// Common stop words to filter out when extracting keywords
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'am', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'not',
  'no', 'nor', 'so', 'if', 'then', 'than', 'that', 'this', 'these',
  'those', 'it', 'its', 'i', 'me', 'my', 'we', 'us', 'our', 'you',
  'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their',
  'who', 'whom', 'which', 'what', 'when', 'where', 'how', 'why', 'all',
  'each', 'every', 'both', 'any', 'few', 'more', 'most', 'some', 'such',
  'into', 'also', 'let', 'as', 'up', 'out', 'about', 'upon', 'over',
  'after', 'before', 'between', 'through', 'during', 'without', 'again',
  'there', 'here', 'very', 'just', 'because', 'even', 'own', 'same',
  'himself', 'herself', 'itself', 'themselves', 'ourselves', 'yourself',
  'says', 'said', 'saying', 'lord', 'god', 'jesus', 'christ', 'unto'
]);

// Extract 2-4 meaningful keywords from verse text
function extractImageKeywords(verseText) {
  if (!verseText) return '';

  const words = verseText
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));

  // Count word frequency to find most distinctive
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  // Sort by frequency (descending), take top 3-4
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  return sorted.slice(0, 4).join(' ');
}

// Check if Unsplash API is configured
function isUnsplashConfigured() {
  return UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_KEY_HERE';
}

// Search Unsplash for images
async function searchUnsplashImages(query) {
  if (!isUnsplashConfigured()) {
    return { error: 'Unsplash API key not configured. Enter your key in app.js or use a manual URL.' };
  }

  if (!query || !query.trim()) {
    return { error: 'Please enter keywords to search for.' };
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
      { headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );

    if (response.status === 401) {
      return { error: 'Invalid Unsplash API key. Check your key in app.js.' };
    }
    if (response.status === 403) {
      return { error: 'Unsplash rate limit reached. Try again later or enter a URL manually.' };
    }
    if (!response.ok) {
      return { error: 'Image search failed. Try again or enter a URL manually.' };
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return { error: 'No images found. Try different keywords.' };
    }

    return {
      images: data.results.map(img => ({
        id: img.id,
        thumbUrl: img.urls.small,
        regularUrl: img.urls.regular,
        credit: img.user.name,
        creditLink: img.user.links.html
      }))
    };
  } catch (err) {
    return { error: 'Network error. Check your connection or enter a URL manually.' };
  }
}

// Show image search status
function showImageSearchStatus(message, isError = false) {
  const status = document.getElementById('image-search-status');
  status.textContent = message;
  status.classList.remove('hidden', 'error');
  if (isError) status.classList.add('error');
}

function hideImageSearchStatus() {
  document.getElementById('image-search-status').classList.add('hidden');
}

// Render image picker grid with search results
function renderImagePicker(images) {
  const grid = document.getElementById('image-picker-grid');
  grid.innerHTML = '';
  grid.classList.remove('hidden');

  images.forEach(img => {
    const item = document.createElement('div');
    item.className = 'image-picker-item';
    item.dataset.url = img.regularUrl;
    item.innerHTML = `
      <img src="${img.thumbUrl}" alt="Search result" loading="lazy">
      <a class="unsplash-credit" href="${img.creditLink}?utm_source=memblitz&utm_medium=referral" target="_blank" rel="noopener">${img.credit}</a>
    `;
    item.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') return; // Let credit link work
      selectPickerImage(img.regularUrl + '?w=400');
      // Highlight selected
      grid.querySelectorAll('.image-picker-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    });
    grid.appendChild(item);
  });
}

// Select an image from the picker
function selectPickerImage(url) {
  document.getElementById('verse-image-url').value = url;
  document.getElementById('verse-image-url-manual').value = url;

  const preview = document.getElementById('image-preview');
  preview.src = url;
  preview.classList.add('visible');

  document.getElementById('clear-image-btn').classList.remove('hidden');
}

// Clear the selected image
function clearSelectedImage() {
  document.getElementById('verse-image-url').value = '';
  document.getElementById('verse-image-url-manual').value = '';
  document.getElementById('image-preview').classList.remove('visible');
  document.getElementById('image-preview').src = '';
  document.getElementById('clear-image-btn').classList.add('hidden');
  document.getElementById('image-picker-grid').querySelectorAll('.image-picker-item').forEach(
    el => el.classList.remove('selected')
  );
}

// Handle search image button click
async function onSearchImageClick() {
  const keywordsInput = document.getElementById('image-keywords');
  let keywords = keywordsInput.value.trim();

  // Auto-extract keywords from verse text if empty
  if (!keywords) {
    const verseText = document.getElementById('verse-text').value;
    keywords = extractImageKeywords(verseText);
    keywordsInput.value = keywords;
  }

  if (!keywords) {
    showImageSearchStatus('Enter verse text first, then search for images.', true);
    return;
  }

  const searchBtn = document.getElementById('search-image-btn');
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';
  hideImageSearchStatus();

  const result = await searchUnsplashImages(keywords);

  searchBtn.disabled = false;
  searchBtn.textContent = 'Search Image';

  if (result.error) {
    document.getElementById('image-picker-grid').classList.add('hidden');
    showImageSearchStatus(result.error, true);
  } else {
    hideImageSearchStatus();
    renderImagePicker(result.images);
  }
}

// ===== SHARE RESULTS =====
function generateShareText() {
  let players;
  if (quizState.isMultiplayer) {
    players = quizState.players;
  } else {
    players = [{
      name: 'I',
      score: quizState.score,
      versesAnswered: quizState.versesAnswered
    }];
  }

  const sorted = [...players].sort((a, b) => {
    const pctA = a.versesAnswered > 0 ? a.score / a.versesAnswered : 0;
    const pctB = b.versesAnswered > 0 ? b.score / b.versesAnswered : 0;
    return pctB - pctA || b.score - a.score;
  });

  const mode = quizState.lastMode === 'favorites' ? 'Favorites' : 'Random';

  if (!quizState.isMultiplayer) {
    const p = sorted[0];
    const pct = p.versesAnswered > 0 ? Math.round((p.score / p.versesAnswered) * 100) : 0;
    return `MemBlitz: I scored ${p.score}/${p.versesAnswered} (${pct}%) on a ${mode} quiz!\n\nMemorize Scripture, one verse at a time.`;
  }

  const ranks = ['1st', '2nd', '3rd'];
  let text = 'MemBlitz Results:\n';
  sorted.forEach((p, i) => {
    const pct = p.versesAnswered > 0 ? Math.round((p.score / p.versesAnswered) * 100) : 0;
    const rank = i < 3 ? ranks[i] : `${i + 1}th`;
    text += `${rank}: ${p.name} ${p.score}/${p.versesAnswered} (${pct}%)\n`;
  });
  text += '\nMemorize Scripture, one verse at a time.';
  return text;
}

async function shareResults() {
  const text = generateShareText();
  const btn = document.getElementById('share-results-btn');

  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch (e) {
      if (e.name !== 'AbortError') copyToClipboard(text, btn);
    }
  } else {
    copyToClipboard(text, btn);
  }
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

// ===== TIMER =====
function startTimer() {
  if (!quizState.timerEnabled) return;
  stopTimer();
  quizState.timerRemaining = quizState.timerSeconds;
  const timerEl = document.getElementById('quiz-timer');
  timerEl.classList.remove('hidden', 'warning');
  timerEl.textContent = quizState.timerRemaining;

  quizState.timerInterval = setInterval(() => {
    quizState.timerRemaining--;
    timerEl.textContent = quizState.timerRemaining;

    if (quizState.timerRemaining <= 5 && quizState.timerRemaining > 0) {
      timerEl.classList.add('warning');
      playTimerWarningSound();
      vibrateTimerWarning();
    }

    if (quizState.timerRemaining <= 0) {
      stopTimer();
      revealAnswer();
    }
  }, 1000);
}

function stopTimer() {
  if (quizState.timerInterval) {
    clearInterval(quizState.timerInterval);
    quizState.timerInterval = null;
  }
}

// ===== SWIPE GESTURES =====
function setupSwipeGestures() {
  const flashcard = document.getElementById('flashcard');
  let startX = 0, startY = 0, startTime = 0;
  const THRESHOLD = 60;
  const TIME_LIMIT = 300;

  flashcard.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    flashcard.style.transition = 'none';
  }, { passive: true });

  flashcard.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const isFront = !document.getElementById('flashcard-front').classList.contains('hidden');

    if (isFront) {
      // Only respond to up swipe on front
      if (dy < -20) {
        flashcard.style.transform = `translateY(${dy * 0.3}px)`;
        flashcard.style.opacity = Math.max(0.7, 1 + dy / 300);
      }
    } else {
      // Left/right swipe on back
      if (Math.abs(dx) > 20) {
        const rotation = dx * 0.03;
        flashcard.style.transform = `translateX(${dx * 0.4}px) rotate(${rotation}deg)`;
        // Color tint overlay
        if (dx > 30) {
          flashcard.style.boxShadow = `inset 0 0 60px rgba(16, 185, 129, ${Math.min(0.2, dx / 500)})`;
        } else if (dx < -30) {
          flashcard.style.boxShadow = `inset 0 0 60px rgba(239, 68, 68, ${Math.min(0.2, Math.abs(dx) / 500)})`;
        }
      }
    }
  }, { passive: true });

  flashcard.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const elapsed = Date.now() - startTime;

    // Reset visual state
    flashcard.style.transition = 'transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease';
    flashcard.style.transform = '';
    flashcard.style.opacity = '';
    flashcard.style.boxShadow = '';

    if (elapsed > TIME_LIMIT) return;

    const isFront = !document.getElementById('flashcard-front').classList.contains('hidden');

    if (isFront && dy < -THRESHOLD && Math.abs(dx) < Math.abs(dy)) {
      // Swipe up on front → reveal
      revealAnswer();
    } else if (!isFront) {
      if (dx > THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        // Swipe right on back → knew it
        rateAnswer(true);
      } else if (dx < -THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        // Swipe left on back → still learning
        rateAnswer(false);
      }
    }
  }, { passive: true });
}

// Handle manual URL input
function onManualUrlInput() {
  const url = document.getElementById('verse-image-url-manual').value.trim();
  const preview = document.getElementById('image-preview');

  document.getElementById('verse-image-url').value = url;

  if (url) {
    preview.src = url;
    preview.classList.add('visible');
    preview.onerror = () => preview.classList.remove('visible');
    document.getElementById('clear-image-btn').classList.remove('hidden');
  } else {
    preview.classList.remove('visible');
    document.getElementById('clear-image-btn').classList.add('hidden');
  }
}
