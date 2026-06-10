// js/app.js — Main application controller
const App = (() => {
  let _mcResult = null;
  let _selectedTopic = 'all';
  let _sidebarOpen = true;
  let _breakTimer = null;

  function init() {
    _buildTopicGrid();
    document.getElementById('btnStartTest').addEventListener('click', () => startMC());
    document.getElementById('btnStartTopic').addEventListener('click', () => startMC());
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('modalOverlay')) UI.hideModal();
    });
    // Restore theme
    const saved = localStorage.getItem('ptf-theme');
    if (saved) { document.documentElement.setAttribute('data-theme', saved); _syncThemeBtn(saved); }
    // Responsive sidebar default
    _sidebarOpen = window.innerWidth >= 960;
    _applySidebar();
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 960) { _sidebarOpen = true; _applySidebar(); }
    });
  }

  function _buildTopicGrid() {
    const grid = document.getElementById('topicGrid');
    if (!grid) return;
    grid.innerHTML = '';
    TOPICS.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'topic-btn' + (t.id === 'all' ? ' selected' : '');
      btn.dataset.topic = t.id;
      btn.innerHTML = t.label + '<span class="topic-count">' + t.count + ' questions</span>';
      btn.addEventListener('click', () => {
        document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        _selectedTopic = t.id;
      });
      grid.appendChild(btn);
    });
  }

  function startMC(forceQs) {
    let pool;
    if (forceQs) {
      pool = [...forceQs];
    } else {
      pool = _selectedTopic === 'all'
        ? [...QUESTIONS]
        : QUESTIONS.filter(q => q.topic === _selectedTopic);
      pool = pool.sort(() => Math.random() - 0.5);
      if (pool.length < 50) {
        const extra = QUESTIONS.filter(q => !pool.includes(q)).sort(() => Math.random() - 0.5);
        pool = [...pool, ...extra].slice(0, 50);
      } else {
        pool = pool.slice(0, 50);
      }
    }
    MC.init(pool);
  }

  function onMCComplete({ questions, answers, score, timeTaken }) {
    _mcResult = { questions, answers, score, timeTaken };
    _showBreak();
  }

  function _showBreak() {
    UI.showScreen('screenBreak');
    UI.setTabs(0.5);
    let t = 15;
    document.getElementById('breakCountdown').textContent = '0:15';
    clearInterval(_breakTimer);
    _breakTimer = setInterval(() => {
      t--;
      document.getElementById('breakCountdown').textContent = '0:' + String(t).padStart(2, '0');
      if (t <= 0) { clearInterval(_breakTimer); Hazard.start(); }
    }, 1000);
  }

  function onHazardComplete({ scores, total }) {
    Results.show({
      questions:   _mcResult.questions,
      answers:     _mcResult.answers,
      mcScore:     _mcResult.score,
      mcTimeTaken: _mcResult.timeTaken,
      hazScores:   scores,
      hazTotal:    total,
    });
  }

  function restart() {
    _mcResult = null;
    clearInterval(_breakTimer);
    UI.setTabs(-1);
    // Reset tab styles
    ['tab0','tab1','tab2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.className = 'phase-tab';
    });
    document.getElementById('tab0').classList.add('active');
    UI.showScreen('screenHome');
  }

  function goHome() { restart(); }

  function showHowItWorks() {
    const el = document.getElementById('howItWorksSection');
    if (!el) return;
    const isHidden = el.style.display === 'none' || el.style.display === '';
    el.style.display = isHidden ? 'block' : 'none';
    if (isHidden) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleFaq(btn) {
    const answer = btn.nextElementSibling;
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all others
    document.querySelectorAll('.faq-q').forEach(q => {
      q.setAttribute('aria-expanded', 'false');
      if (q.nextElementSibling) q.nextElementSibling.classList.remove('open');
    });
    // Toggle this one
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      answer.classList.add('open');
    }
  }

  function toggleSidebar() {
    _sidebarOpen = !_sidebarOpen;
    _applySidebar();
  }

  function _applySidebar() {
    const sidebar = document.getElementById('qSidebar');
    if (!sidebar) return;
    sidebar.style.display = _sidebarOpen ? 'block' : 'none';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ptf-theme', next);
    _syncThemeBtn(next);
  }

  function _syncThemeBtn(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  return { init, startMC, onMCComplete, onHazardComplete, restart, goHome, showHowItWorks, toggleFaq, toggleSidebar, toggleTheme };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
