// js/modules/ui.js — Shared UI utilities
const UI = (() => {
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  function setTabs(phase) {
    // phase: 0=mc, 1=hazard, 2=results, -1=home
    const tabs = [document.getElementById('tab0'), document.getElementById('tab1'), document.getElementById('tab2')];
    tabs.forEach(t => { t.className = 'phase-tab'; });
    if (phase === 0) tabs[0].classList.add('active');
    else if (phase === 0.5) tabs[0].classList.add('done');
    else if (phase === 1) { tabs[0].classList.add('done'); tabs[1].classList.add('active'); }
    else if (phase === 2) { tabs[0].classList.add('done'); tabs[1].classList.add('done'); tabs[2].classList.add('active'); }
  }

  function showModal({ title, body, buttons }) {
    const overlay = document.getElementById('modalOverlay');
    const card = document.getElementById('modalCard');
    card.innerHTML = '';
    const h = document.createElement('h3');
    h.style.cssText = 'margin-bottom:12px;font-size:18px;';
    h.textContent = title;
    const p = document.createElement('p');
    p.style.cssText = 'margin-bottom:20px;font-size:15px;';
    p.innerHTML = body;
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';
    buttons.forEach(btn => {
      const b = document.createElement('button');
      b.className = 'btn ' + (btn.cls || 'btn-outline');
      b.textContent = btn.label;
      b.onclick = () => { hideModal(); btn.action(); };
      row.appendChild(b);
    });
    card.appendChild(h); card.appendChild(p); card.appendChild(row);
    overlay.style.display = 'flex';
  }

  function hideModal() {
    document.getElementById('modalOverlay').style.display = 'none';
  }

  function toast(msg, duration = 3000) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; setTimeout(() => { el.style.display = 'none'; }, 300); }, duration);
  }

  function fmt(secs) {
    return Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
  }

  return { showScreen, setTabs, showModal, hideModal, toast, fmt };
})();
