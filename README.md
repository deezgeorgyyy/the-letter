# The Letter

A private, cinematic web experience built to protect and present a birthday letter. No puzzles live here — the puzzle already happened, on paper. This site's only job is to feel like opening a memory.

## Flow

1. **Loading** — a quiet 4-second animation while the page composes itself.
2. **Password screen** — "The Letter," asking for the one word that unlocks it.
3. **Incorrect password** — a soft shake and an "Access denied" line. The user stays put and tries again.
4. **Correct password** — a warm glow sweeps the card, then the screen fades to black for a two-line cinematic transition.
5. **The letter** — a slow-scrolling reading experience with gently fading-in paragraphs, a reading progress bar, and an emotional, centered ending.

## Files

```
index.html   — structure for all four screens
style.css    — the entire visual design (dark, glass, warm accents)
script.js    — screen flow, password check, scroll reveals, particles
README.md    — this file
```

## Changing the password

Open `script.js` and edit the `CONFIG` object near the top:

```js
const CONFIG = {
  password: 'twin',            // change this to whatever you like
  loadingDurationMs: 4200,     // loading screen duration
  transitionDurationMs: 5600,  // "some letters aren't simply read..." duration
};
```

The password check is case-insensitive and trims whitespace, so `Twin`, `twin `, and `TWIN` all work identically.

## Editing the letter

The letter itself lives inside `index.html`, inside the element with id `letter-body`. Each paragraph is wrapped in a `<p class="reveal">` tag — that class is what makes it fade in gently as the reader scrolls. Keep that class on any paragraph you want to animate in.

To change the title, edit the `.letter-title` heading near the top of the `#letter-screen` section.

To change the ending, edit the two lines inside `#letter-ending`:

```html
<div class="letter-ending" id="letter-ending">
  <p class="ending-text">Some things are worth decoding twice.</p>
  <p class="ending-sub">— happy birthday —</p>
</div>
```

## Adding real photos

There are two placeholder blocks in the letter marked:

```html
<div class="letter-image-placeholder reveal" aria-hidden="true">
  <span>a photograph, waiting to be added</span>
</div>
```

Replace the placeholder's contents with a real image, for example:

```html
<div class="reveal">
  <img src="photo1.jpg" alt="" style="width:100%; border-radius: 16px;" />
</div>
```

Add your image files anywhere in the project folder (e.g. an `images/` folder) and update the `src` path accordingly.

## Adding background music (optional, off by default)

Inside `index.html`, find:

```html
<audio id="bg-audio" loop preload="none">
  <source src="" type="audio/mpeg" />
</audio>
```

Add a path to an audio file you own the rights to, e.g. `src="music/theme.mp3"`. The music toggle button in the top-right corner of the letter screen will then work — it never autoplays, and stays fully optional for the reader.

## Deploying to GitHub Pages

1. Create a new GitHub repository (public or private, either works with GitHub Pages on a paid/eligible plan — public is simplest).
2. Upload all four files (`index.html`, `style.css`, `script.js`, `README.md`) to the repository root.
3. Go to **Settings → Pages**.
4. Under "Build and deployment," set **Source** to `Deploy from a branch`, choose the `main` branch and `/ (root)` folder.
4. Save. GitHub will give you a URL like `https://yourusername.github.io/your-repo-name/`.
5. That URL, plus the password, is everything the recipient needs.

No build step, no dependencies to install — it's plain HTML, CSS, and JavaScript, so it works the moment it's opened, and works identically on GitHub Pages.

## Notes on privacy

This site does not transmit the password anywhere or check it against a server — everything happens locally in the visitor's browser. That means anyone with access to the page's source code could technically find the password in `script.js`. For a private, sentimental gift shared with one specific person via a physical encrypted letter, this is an appropriate and intentional level of protection — it's a lock on a door, not a bank vault.

## Accessibility

- All interactive elements are keyboard-operable (Tab to focus, Enter to submit the password).
- Animations respect `prefers-reduced-motion` — visitors with that OS setting enabled will see calmer, largely static visuals.
- Color contrast on all text meets comfortable reading standards against the dark background.

## Browser support

Built with standard, well-supported CSS and JavaScript (CSS custom properties, `backdrop-filter`, `IntersectionObserver`, Canvas 2D). Works in current versions of Chrome, Firefox, Safari, and Edge, on both desktop and mobile.
