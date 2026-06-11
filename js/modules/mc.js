// js/modules/mc.js — Multiple Choice module
const MC = (() => {
  let questions = [], answers = [], flagged = [], currentQ = 0;
  let timeLeft = 57 * 60, timerInterval = null;

  function init(qs) {
    questions = qs;
    answers   = new Array(qs.length).fill(null);
    flagged   = new Array(qs.length).fill(false);
    currentQ  = 0;
    timeLeft  = 57 * 60;
    _buildMap();
    UI.showScreen('screenTest');
    UI.setTabs(0);
    _render();
    _startTimer();
  }

  function _buildMap() {
    const grid = document.getElementById('qMapGrid');
    grid.innerHTML = '';
    questions.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'q-map-btn';
      b.textContent = i + 1;
      b.setAttribute('aria-label', 'Go to question ' + (i+1));
      b.onclick = () => _jump(i);
      grid.appendChild(b);
    });
  }

  function _updateMap() {
    document.querySelectorAll('.q-map-btn').forEach((b, i) => {
      b.className = 'q-map-btn' +
        (i === currentQ      ? ' current'  :
         flagged[i]          ? ' flagged'  :
         answers[i] !== null ? ' answered' : '');
    });
  }

  function _render() {
    const q      = questions[currentQ];
    const total  = questions.length;
    const answered = answers.filter(a => a !== null).length;
    const nFlagged = flagged.filter(Boolean).length;

    // Header pills
    document.getElementById('qCounter').textContent      = 'Q ' + (currentQ+1) + ' / ' + total;
    document.getElementById('qAnsweredPill').textContent  = 'Answered: ' + answered;
    const fp = document.getElementById('qFlaggedPill');
    fp.textContent   = '🚩 ' + nFlagged;
    fp.style.display = nFlagged > 0 ? '' : 'none';

    // Progress bar
    document.getElementById('progressFill').style.width = ((currentQ+1)/total*100) + '%';

    // Question meta
    document.getElementById('qNumLabel').textContent  = 'Question ' + (currentQ+1) + ' of ' + total;
    document.getElementById('qTopicTag').textContent  = _topicLabel(q.topic);
    document.getElementById('qText').textContent      = q.q;

    // ── Sign / image panel ──────────────────────────────────────
    const card     = document.getElementById('questionCard');
    const existing = card.querySelector('.sign-panel, .image-panel');
    if (existing) existing.remove();

    // Use q.sign key (set in questions data) or fall back to id lookup
    if (typeof Signs !== 'undefined') {
      const signKey   = q.sign || null;
      const signPanel = signKey
        ? Signs.renderSignPanel(signKey)
        : Signs.renderSignPanelById(q.id);
      if (signPanel) {
        const qText = document.getElementById('qText');
        card.insertBefore(signPanel, qText.nextSibling);
      }
    }
    // Future: video case studies, images etc can go here

    // ── Answer options ──────────────────────────────────────────
    const fb = document.getElementById('feedbackBox');
    fb.style.display = 'none';
    fb.className     = 'feedback-box';

    const list   = document.getElementById('optionsList');
    list.innerHTML = '';
    const letters  = ['A','B','C','D'];

    q.options.forEach((opt, i) => {
      const lbl = document.createElement('label');
      lbl.className = 'option-label' + (answers[currentQ] === i ? ' selected' : '');

      const inp    = document.createElement('input');
      inp.type     = 'radio';
      inp.name     = 'opt';
      inp.value    = i;
      inp.setAttribute('aria-label', letters[i] + ': ' + opt);

      const circle = document.createElement('div');
      circle.className = 'option-circle';

      const letter = document.createElement('span');
      letter.className   = 'option-letter';
      letter.textContent = letters[i];

      const text       = document.createElement('span');
      text.textContent = opt;

      lbl.appendChild(inp);
      lbl.appendChild(circle);
      lbl.appendChild(letter);
      lbl.appendChild(text);
      lbl.onclick = () => _select(i);
      list.appendChild(lbl);
    });

    // Flag button
    const btnFlag = document.getElementById('btnFlag');
    btnFlag.className  = 'btn btn-flag' + (flagged[currentQ] ? ' flagged' : '');
    btnFlag.textContent = flagged[currentQ] ? '🚩 Flagged' : '🚩 Flag';

    _updateMap();
  }

  function _topicLabel(topic) {
    const map = {
      alertness:   'Alertness & Attitude',
      safety:      'Safety & Vehicle',
      rules:       'Rules of the Road',
      signs:       'Road & Traffic Signs',
      motorway:    'Motorway Rules',
      environment: 'Vehicle & Environment',
      incidents:   'Incidents & Breakdowns',
    };
    return map[topic] || topic;
  }

  function _select(idx) {
    answers[currentQ] = idx;
    document.querySelectorAll('.option-label').forEach((lbl, i) => {
      lbl.className = 'option-label' + (i === idx ? ' selected' : '');
    });
    document.getElementById('qAnsweredPill').textContent = 'Answered: ' + answers.filter(a => a !== null).length;
    _updateMap();
  }

  function navigate(dir) {
    currentQ = Math.max(0, Math.min(questions.length-1, currentQ+dir));
    _render();
    document.getElementById('questionCard').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function _jump(idx) {
    currentQ = idx;
    _render();
    document.getElementById('questionCard').scrollIntoView({ behavior:'smooth', block:'start' });
  }

  function toggleFlag() {
    flagged[currentQ] = !flagged[currentQ];
    _render();
  }

  function _startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      _updateTimer();
      if (timeLeft <= 0) { clearInterval(timerInterval); _finish(); }
    }, 1000);
  }

  function _updateTimer() {
    const el   = document.getElementById('timerText');
    const wrap = document.getElementById('timerWrap');
    el.textContent = UI.fmt(timeLeft);
    wrap.classList.toggle('warning', timeLeft < 300);
  }

  function confirmFinish() {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      UI.showModal({
        title: 'Finish test?',
        body:  'You have <strong>' + unanswered + ' unanswered question' + (unanswered > 1 ? 's' : '') + '</strong>. These will be marked as incorrect.',
        buttons: [
          { label:'Finish test', cls:'btn-danger',  action: _finish },
          { label:'Go back',     cls:'btn-outline', action: () => {} },
        ]
      });
    } else {
      _finish();
    }
  }

  function _finish() {
    clearInterval(timerInterval);
    const timeTaken = 57*60 - timeLeft;
    const score     = answers.reduce((acc, a, i) => a === questions[i].correct ? acc+1 : acc, 0);
    App.onMCComplete({ questions, answers, score, timeTaken });
  }

  function getState() { return { questions, answers }; }

  return { init, navigate, toggleFlag, confirmFinish, getState };
})();
