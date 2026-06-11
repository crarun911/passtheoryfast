// js/modules/signs.js — SVG road sign renderer
// Draws accurate UK road signs inline for relevant questions

const Signs = (() => {

  // Sign definitions — each returns an SVG string
  const SIGNS = {

    // ── CIRCULAR MANDATORY (blue) ──────────────────────────────
    'blue-arrow-up': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0047AB" stroke="white" stroke-width="3"/>
        <polygon points="50,18 68,55 58,55 58,82 42,82 42,55 32,55" fill="white"/>
      </svg>`,

    'blue-arrow-left': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0047AB" stroke="white" stroke-width="3"/>
        <polygon points="82,50 45,32 45,42 18,42 18,58 45,58 45,68" fill="white"/>
      </svg>`,

    'blue-arrow-right': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0047AB" stroke="white" stroke-width="3"/>
        <polygon points="18,50 55,32 55,42 82,42 82,58 55,58 55,68" fill="white"/>
      </svg>`,

    'blue-arrow-ahead-left': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0047AB" stroke="white" stroke-width="3"/>
        <polygon points="50,15 65,40 57,40 57,60 43,60 43,40 35,40" fill="white"/>
        <polygon points="30,60 30,75 45,75 45,68 22,68 22,75 37,75 37,60" fill="white" opacity="0.8"/>
      </svg>`,

    'blue-roundabout': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0047AB" stroke="white" stroke-width="3"/>
        <circle cx="50" cy="50" r="22" fill="none" stroke="white" stroke-width="5"/>
        <circle cx="50" cy="50" r="10" fill="white"/>
        <polygon points="50,20 58,32 42,32" fill="white"/>
        <polygon points="80,50 68,42 68,58" fill="white"/>
        <polygon points="50,80 42,68 58,68" fill="white"/>
      </svg>`,

    'blue-min-speed-30': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0047AB" stroke="white" stroke-width="3"/>
        <text x="50" y="62" font-family="Arial Black,Arial" font-weight="900" font-size="38" fill="white" text-anchor="middle">30</text>
      </svg>`,

    'blue-pedestrians': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#0047AB" stroke="white" stroke-width="3"/>
        <circle cx="50" cy="26" r="8" fill="white"/>
        <line x1="50" y1="34" x2="50" y2="62" stroke="white" stroke-width="5" stroke-linecap="round"/>
        <line x1="50" y1="45" x2="36" y2="55" stroke="white" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="45" x2="64" y2="55" stroke="white" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="62" x2="38" y2="78" stroke="white" stroke-width="5" stroke-linecap="round"/>
        <line x1="50" y1="62" x2="62" y2="78" stroke="white" stroke-width="5" stroke-linecap="round"/>
      </svg>`,

    // ── CIRCULAR PROHIBITORY (red ring) ────────────────────────
    'no-entry': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#CC0000" stroke="white" stroke-width="3"/>
        <rect x="20" y="43" width="60" height="14" rx="3" fill="white"/>
      </svg>`,

    'no-overtaking': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="white" stroke="#CC0000" stroke-width="6"/>
        <ellipse cx="38" cy="50" rx="10" ry="15" fill="#111"/>
        <ellipse cx="62" cy="50" rx="10" ry="15" fill="#CC0000"/>
        <line x1="72" y1="20" x2="28" y2="80" stroke="#CC0000" stroke-width="6"/>
      </svg>`,

    'speed-limit-30': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="white" stroke="#CC0000" stroke-width="8"/>
        <text x="50" y="64" font-family="Arial Black,Arial" font-weight="900" font-size="42" fill="#111" text-anchor="middle">30</text>
      </svg>`,

    'speed-limit-60': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="white" stroke="#CC0000" stroke-width="8"/>
        <text x="50" y="64" font-family="Arial Black,Arial" font-weight="900" font-size="42" fill="#111" text-anchor="middle">60</text>
      </svg>`,

    'speed-limit-70': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="white" stroke="#CC0000" stroke-width="8"/>
        <text x="50" y="64" font-family="Arial Black,Arial" font-weight="900" font-size="42" fill="#111" text-anchor="middle">70</text>
      </svg>`,

    'national-speed-limit': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="white" stroke="#CC0000" stroke-width="8"/>
        <line x1="62" y1="22" x2="38" y2="78" stroke="#111" stroke-width="8" stroke-linecap="round"/>
      </svg>`,

    'no-right-turn': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="white" stroke="#CC0000" stroke-width="6"/>
        <path d="M 45,70 L 45,45 Q 45,28 62,28 L 70,28" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round"/>
        <polygon points="70,20 82,28 70,36" fill="#111"/>
        <line x1="72" y1="22" x2="28" y2="78" stroke="#CC0000" stroke-width="6"/>
      </svg>`,

    // ── TRIANGULAR WARNING (red) ────────────────────────────────
    'warning-general': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,90 5,90" fill="white" stroke="#CC0000" stroke-width="5" stroke-linejoin="round"/>
        <text x="50" y="80" font-family="Arial Black,Arial" font-weight="900" font-size="52" fill="#111" text-anchor="middle">!</text>
      </svg>`,

    'warning-crossroads': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,90 5,90" fill="white" stroke="#CC0000" stroke-width="5" stroke-linejoin="round"/>
        <rect x="45" y="30" width="10" height="45" fill="#111"/>
        <rect x="28" y="48" width="44" height="10" fill="#111"/>
      </svg>`,

    'warning-junction-right': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,90 5,90" fill="white" stroke="#CC0000" stroke-width="5" stroke-linejoin="round"/>
        <rect x="45" y="30" width="10" height="45" fill="#111"/>
        <rect x="45" y="48" width="25" height="10" fill="#111"/>
        <polygon points="73,42 73,64 83,53" fill="#111"/>
      </svg>`,

    'warning-pedestrians': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,90 5,90" fill="white" stroke="#CC0000" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="50" cy="40" r="7" fill="#111"/>
        <line x1="50" y1="47" x2="50" y2="68" stroke="#111" stroke-width="5" stroke-linecap="round"/>
        <line x1="50" y1="55" x2="38" y2="62" stroke="#111" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="55" x2="62" y2="62" stroke="#111" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="68" x2="40" y2="80" stroke="#111" stroke-width="4" stroke-linecap="round"/>
        <line x1="50" y1="68" x2="60" y2="80" stroke="#111" stroke-width="4" stroke-linecap="round"/>
      </svg>`,

    'warning-school': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,90 5,90" fill="#FFDD00" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="40" cy="40" r="5" fill="#111"/>
        <circle cx="60" cy="40" r="5" fill="#111"/>
        <line x1="40" y1="45" x2="40" y2="62" stroke="#111" stroke-width="4"/>
        <line x1="60" y1="45" x2="60" y2="62" stroke="#111" stroke-width="4"/>
        <line x1="40" y1="52" x2="60" y2="52" stroke="#111" stroke-width="3"/>
        <line x1="40" y1="62" x2="34" y2="76" stroke="#111" stroke-width="4"/>
        <line x1="40" y1="62" x2="46" y2="76" stroke="#111" stroke-width="4"/>
        <line x1="60" y1="62" x2="54" y2="76" stroke="#111" stroke-width="4"/>
        <line x1="60" y1="62" x2="66" y2="76" stroke="#111" stroke-width="4"/>
      </svg>`,

    'warning-bend-left': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,90 5,90" fill="white" stroke="#CC0000" stroke-width="5" stroke-linejoin="round"/>
        <path d="M 50,75 Q 50,50 35,35 Q 28,25 45,20" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"/>
        <polygon points="38,14 52,14 44,26" fill="#111"/>
      </svg>`,

    'warning-slippery': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,90 5,90" fill="white" stroke="#CC0000" stroke-width="5" stroke-linejoin="round"/>
        <path d="M 40,30 Q 55,42 45,55 Q 35,68 50,80" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="60" cy="68" rx="10" ry="6" fill="#111" transform="rotate(-20,60,68)"/>
      </svg>`,

    // ── GIVE WAY / STOP ─────────────────────────────────────────
    'give-way': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,95 5,15 95,15" fill="white" stroke="#CC0000" stroke-width="5" stroke-linejoin="round"/>
        <text x="50" y="62" font-family="Arial Black,Arial" font-weight="900" font-size="16" fill="#CC0000" text-anchor="middle">GIVE</text>
        <text x="50" y="80" font-family="Arial Black,Arial" font-weight="900" font-size="16" fill="#CC0000" text-anchor="middle">WAY</text>
      </svg>`,

    'stop': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#CC0000" stroke="white" stroke-width="3"/>
        <text x="50" y="62" font-family="Arial Black,Arial" font-weight="900" font-size="24" fill="white" text-anchor="middle">STOP</text>
      </svg>`,

    // ── INFORMATION (blue rectangle) ───────────────────────────
    'info-motorway': () => `
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="116" height="76" rx="6" fill="#003399" stroke="white" stroke-width="3"/>
        <text x="60" y="30" font-family="Arial,sans-serif" font-weight="700" font-size="14" fill="white" text-anchor="middle">MOTORWAY</text>
        <text x="60" y="58" font-family="Arial Black,Arial" font-weight="900" font-size="28" fill="white" text-anchor="middle">M1</text>
      </svg>`,

    'info-hospital': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="96" height="96" rx="6" fill="#003399" stroke="white" stroke-width="3"/>
        <text x="50" y="65" font-family="Arial Black,Arial" font-weight="900" font-size="72" fill="white" text-anchor="middle">H</text>
      </svg>`,

    'info-parking': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="96" height="96" rx="6" fill="#003399" stroke="white" stroke-width="3"/>
        <text x="50" y="70" font-family="Arial Black,Arial" font-weight="900" font-size="72" fill="white" text-anchor="middle">P</text>
      </svg>`,

    // ── ROAD MARKINGS ───────────────────────────────────────────
    'double-white-lines': () => `
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="80" fill="#555"/>
        <line x1="58" y1="0" x2="58" y2="80" stroke="white" stroke-width="3"/>
        <line x1="62" y1="0" x2="62" y2="80" stroke="white" stroke-width="3"/>
        <rect x="0" y="0" width="58" height="80" fill="#444"/>
        <rect x="62" y="0" width="58" height="80" fill="#444"/>
        <text x="29" y="45" font-family="Arial,sans-serif" font-size="10" fill="white" text-anchor="middle">Your lane</text>
        <text x="91" y="45" font-family="Arial,sans-serif" font-size="10" fill="white" text-anchor="middle">Oncoming</text>
      </svg>`,

    'yellow-box': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#555"/>
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="#FFD600" stroke-width="4"/>
        <line x1="10" y1="10" x2="90" y2="90" stroke="#FFD600" stroke-width="4"/>
        <line x1="90" y1="10" x2="10" y2="90" stroke="#FFD600" stroke-width="4"/>
      </svg>`,

    'give-way-lines': () => `
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="80" fill="#555"/>
        <line x1="0" y1="72" x2="120" y2="72" stroke="white" stroke-width="2" stroke-dasharray="8,6"/>
        <line x1="0" y1="78" x2="120" y2="78" stroke="white" stroke-width="2" stroke-dasharray="8,6"/>
        <text x="60" y="45" font-family="Arial,sans-serif" font-size="11" fill="white" text-anchor="middle">Give Way</text>
        <text x="60" y="60" font-family="Arial,sans-serif" font-size="10" fill="#aaa" text-anchor="middle">double dashed lines</text>
      </svg>`,

    // ── TRAFFIC LIGHTS ──────────────────────────────────────────
    'traffic-light-red': () => `
      <svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="5" width="40" height="130" rx="8" fill="#222"/>
        <circle cx="30" cy="35" r="14" fill="#CC0000"/>
        <circle cx="30" cy="70" r="14" fill="#333"/>
        <circle cx="30" cy="105" r="14" fill="#333"/>
      </svg>`,

    'traffic-light-amber': () => `
      <svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="5" width="40" height="130" rx="8" fill="#222"/>
        <circle cx="30" cy="35" r="14" fill="#333"/>
        <circle cx="30" cy="70" r="14" fill="#FF8C00"/>
        <circle cx="30" cy="105" r="14" fill="#333"/>
      </svg>`,

    'traffic-light-green': () => `
      <svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="5" width="40" height="130" rx="8" fill="#222"/>
        <circle cx="30" cy="35" r="14" fill="#333"/>
        <circle cx="30" cy="70" r="14" fill="#333"/>
        <circle cx="30" cy="105" r="14" fill="#00AA00"/>
      </svg>`,

    'traffic-light-red-amber': () => `
      <svg viewBox="0 0 60 140" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="5" width="40" height="130" rx="8" fill="#222"/>
        <circle cx="30" cy="35" r="14" fill="#CC0000"/>
        <circle cx="30" cy="70" r="14" fill="#FF8C00"/>
        <circle cx="30" cy="105" r="14" fill="#333"/>
      </svg>`,

    'pelican-flashing-amber': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="5" width="40" height="90" rx="6" fill="#222"/>
        <circle cx="50" cy="30" r="14" fill="#333"/>
        <circle cx="50" cy="70" r="14" fill="#FF8C00" opacity="0.9"/>
        <text x="50" y="98" font-family="Arial,sans-serif" font-size="9" fill="#FF8C00" text-anchor="middle">FLASHING AMBER</text>
      </svg>`,

    // ── MOTORWAY SIGNS ──────────────────────────────────────────
    'smart-motorway-x': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="90" height="90" rx="6" fill="#111" stroke="#555" stroke-width="2"/>
        <line x1="25" y1="25" x2="75" y2="75" stroke="#CC0000" stroke-width="12" stroke-linecap="round"/>
        <line x1="75" y1="25" x2="25" y2="75" stroke="#CC0000" stroke-width="12" stroke-linecap="round"/>
      </svg>`,

    'smart-motorway-speed': () => `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="90" height="90" rx="6" fill="#111" stroke="#555" stroke-width="2"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#FF8C00" stroke-width="5"/>
        <text x="50" y="64" font-family="Arial Black,Arial" font-weight="900" font-size="36" fill="#FF8C00" text-anchor="middle">60</text>
      </svg>`,

    // ── MOTORWAY + DIRECTION ────────────────────────────────────
    'motorway-direction': () => `
      <svg viewBox="0 0 160 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="156" height="76" rx="6" fill="#003399" stroke="white" stroke-width="3"/>
        <polygon points="130,40 148,28 148,52" fill="white"/>
        <text x="75" y="35" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="white" text-anchor="middle">The NORTH</text>
        <text x="75" y="58" font-family="Arial Black,Arial" font-weight="900" font-size="20" fill="white" text-anchor="middle">M1</text>
      </svg>`,
  };

  // Map question IDs to sign keys
  const QUESTION_SIGNS = {
    26: 'blue-arrow-up',        // Blue circle white upward arrow
    27: 'no-entry',             // Red circle white bar
    25: 'warning-general',      // Red triangle exclamation
    28: 'give-way',             // Give way road marking
    29: 'info-hospital',        // White H on blue
    30: 'double-white-lines',   // Double white lines
    31: 'pelican-flashing-amber',// Pelican crossing flashing amber
    32: 'warning-school',       // School crossing patrol
    33: 'smart-motorway-x',     // Red X gantry
  };

  // Render by explicit key (preferred — set in question data)
  function renderSignPanel(key) {
    if (!key || !SIGNS[key]) return null;
    const svg  = SIGNS[key]();
    const wrap = document.createElement('div');
    wrap.className = 'sign-panel';
    wrap.setAttribute('aria-label', 'Road sign illustration');
    wrap.innerHTML = svg;
    return wrap;
  }

  // Render by question ID (fallback using QUESTION_SIGNS map)
  function renderSignPanelById(questionId) {
    const key = QUESTION_SIGNS[questionId];
    return renderSignPanel(key);
  }

  // Render sign SVG string by key (for Highway Code, Road Signs quiz etc)
  function renderSign(key) {
    return SIGNS[key] ? SIGNS[key]() : null;
  }

  // Build a labelled sign grid (for Road Signs reference page)
  function renderSignGrid(keys, container) {
    container.innerHTML = '';
    keys.forEach(key => {
      if (!SIGNS[key]) return;
      const item = document.createElement('div');
      item.className = 'sign-with-label';
      item.innerHTML = SIGNS[key]();
      const lbl = document.createElement('span');
      lbl.textContent = key.replace(/-/g,' ');
      item.appendChild(lbl);
      container.appendChild(item);
    });
  }

  function getAllKeys() { return Object.keys(SIGNS); }

  return { renderSignPanel, renderSignPanelById, renderSign, renderSignGrid, getAllKeys };
})();
