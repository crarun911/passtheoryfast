// js/modules/results.js — Results module
const Results = (() => {
  let _state = {};
  let _showingWrong = false;

  function show({ questions, answers, mcScore, mcTimeTaken, hazScores, hazTotal }) {
    _state = { questions, answers, mcScore, mcTimeTaken, hazScores, hazTotal };
    _showingWrong = false;
    UI.showScreen('screenResults');
    UI.setTabs(2);
    _render();
  }

  function _render() {
    const { questions, answers, mcScore, mcTimeTaken, hazTotal } = _state;
    const mcPass  = mcScore >= 43;
    const hazPass = hazTotal >= 44;
    const overall = mcPass && hazPass;

    // Hero
    const hero = document.getElementById('resultsHero');
    hero.style.borderTop = '5px solid ' + (overall ? 'var(--success)' : 'var(--red)');
    hero.style.background = overall ? 'var(--success-bg)' : 'var(--red-bg)';

    const badge = document.getElementById('resultBadge');
    badge.textContent = overall ? 'PASS' : 'FAIL';
    badge.className = 'result-badge ' + (overall ? 'pass' : 'fail');

    document.getElementById('resultTitle').textContent =
      overall ? 'Theory Test — Passed 🎉' : 'Theory Test — Not Passed';
    document.getElementById('resultSub').textContent = overall
      ? 'Both sections passed. You would pass the official theory test.'
      : (!mcPass && !hazPass ? 'Both sections failed. You need to pass both on the same day.'
        : !mcPass ? 'The multiple choice section was not passed (need 43+).'
        : 'The hazard perception section was not passed (need 44+).');

    // Section badges
    const mcB = document.getElementById('mcBadge');
    mcB.textContent = mcPass ? 'PASS' : 'FAIL';
    mcB.className = 'section-badge ' + (mcPass ? 'pass' : 'fail');
    document.getElementById('mcResultText').textContent = mcScore + ' / ' + questions.length + ' (need 43)';

    const hazB = document.getElementById('hazBadge');
    hazB.textContent = hazPass ? 'PASS' : 'FAIL';
    hazB.className = 'section-badge ' + (hazPass ? 'pass' : 'fail');
    document.getElementById('hazResultText').textContent = hazTotal + ' / 75 (need 44)';

    // Stats
    const wrong = answers.filter((a,i) => a !== questions[i].correct).length;
    const mins = Math.floor(mcTimeTaken/60), secs = mcTimeTaken%60;
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><div class="stat-num">${mcScore}/${questions.length}</div><div class="stat-label">MC Score</div></div>
      <div class="stat-card"><div class="stat-num">${hazTotal}/75</div><div class="stat-label">Hazard Score</div></div>
      <div class="stat-card"><div class="stat-num">${wrong}</div><div class="stat-label">Wrong answers</div></div>
      <div class="stat-card"><div class="stat-num">${mins}m ${secs}s</div><div class="stat-label">Time taken</div></div>
    `;

    _renderReview(false);
  }

  function _renderReview(wrongOnly) {
    const { questions, answers } = _state;
    const list = document.getElementById('reviewList');
    list.innerHTML = '';
    const letters = ['A','B','C','D'];
    questions.forEach((q, i) => {
      const userAns = answers[i];
      const correct = q.correct;
      const isRight = userAns === correct;
      if (wrongOnly && isRight) return;
      const div = document.createElement('div');
      div.className = 'review-item ' + (isRight ? 'right' : 'wrong');
      div.innerHTML = `
        <div class="review-q">${i+1}. ${q.q}</div>
        <div class="review-answers">
          <span class="your-ans">You: ${userAns !== null ? letters[userAns]+' — '+q.options[userAns] : 'Not answered'}</span>
          ${!isRight ? `<span class="correct-ans">✓ ${letters[correct]} — ${q.options[correct]}</span>` : ''}
        </div>
        ${!isRight ? `<div class="review-explanation">${q.explanation}</div>` : ''}
      `;
      list.appendChild(div);
    });
    if (list.children.length === 0) {
      list.innerHTML = '<p style="padding:16px;text-align:center;color:var(--success)">🎉 You answered every question correctly!</p>';
    }
  }

  function filterWrong() {
    _showingWrong = !_showingWrong;
    _renderReview(_showingWrong);
    document.getElementById('btnFilterWrong').textContent = _showingWrong ? 'Show all' : 'Show wrong only';
  }

  function retryWrong() {
    const { questions, answers } = _state;
    const wrong = questions.filter((q, i) => answers[i] !== q.correct);
    if (wrong.length === 0) { UI.toast('🎉 No wrong answers to retry!'); return; }
    App.startMC(wrong);
  }

  return { show, filterWrong, retryWrong };
})();
