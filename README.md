# PassTheoryFast 🚗

Free UK Driving Theory Test practice site — multiple choice + hazard perception.

## Project Structure

```
passtheoryfast/
├── index.html              # Main entry point
├── README.md
├── css/
│   ├── base.css            # CSS variables, reset, typography
│   ├── layout.css          # Header, container, grid, screen layout
│   ├── components.css      # Buttons, cards, options, modals, hazard UI
│   ├── screens.css         # Screen-specific overrides
│   └── responsive.css      # Mobile breakpoints
├── data/
│   └── questions.js        # Question bank (extend to add more questions)
└── js/
    ├── app.js              # Main app controller (boot, routing, state)
    └── modules/
        ├── ui.js           # Shared UI utilities (screens, modals, toast)
        ├── mc.js           # Multiple choice module
        ├── hazard-scenes.js# Canvas driving scene renderer (8 scene types)
        ├── hazard.js       # Hazard perception module
        └── results.js      # Results & review module
```

## How to Run Locally

Just open `index.html` in a browser — no build step, no server needed.

## How to Deploy to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your site will be live at `https://yourusername.github.io/passtheoryfast`

## How to Add More Questions

Edit `data/questions.js` and add to the `QUESTIONS` array:

```js
{ 
  id: 51, 
  topic: 'rules',      // alertness | safety | rules | signs | motorway | environment | incidents
  q: 'Your question text here?', 
  options: ['Option A', 'Option B', 'Option C', 'Option D'], 
  correct: 0,          // index of correct option (0-3)
  explanation: 'Why this answer is correct.' 
}
```

## How to Add a New Topic

1. Add questions with the new `topic` value in `data/questions.js`
2. Add a new entry to the `TOPICS` array in `data/questions.js`

## How to Add Real Video Clips (when licensed)

Replace canvas in `js/modules/hazard.js` — swap `HazardScenes.draw()` call with a `<video>` element src update. The scoring, progress bar and click detection are all independent of the video source.

## Roadmap / Future Features

- [ ] User accounts & progress tracking
- [ ] Leaderboard
- [ ] More question categories (motorcycles, LGV, ADI)
- [ ] Real video clips (requires DVSA licence)
- [ ] Timed mock test mode
- [ ] Detailed topic-by-topic analytics
- [ ] PWA / offline mode
