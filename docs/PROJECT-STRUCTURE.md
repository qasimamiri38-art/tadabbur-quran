# Repository structure and maintenance notes

## Current layout

The app is currently a static site published from the repository root. Keep `index.html`, `manifest.webmanifest`, `sw.js`, and `icon-512.png` at the root unless all references and GitHub Pages behavior are updated together.

`index.html` currently contains the page markup, styles, and JavaScript. The Quran data files are also in the root, while the app fetches its displayed Quran data from AlQuran Cloud at runtime. Do not delete or relocate data files until their provenance, intended use, and all references have been checked.

## Recommended next refactor

1. Extract the inline stylesheet from `index.html` to `assets/css/styles.css` and verify the site on a GitHub Pages project URL.
2. Extract the inline script to `assets/js/app.js`; preserve script execution order and test all tabs, search, saved verses, audio, and memorization controls.
3. Decide whether the repository's Quran files are needed. If retained, move them to `data/` only in a dedicated change that updates every consumer and documentation.
4. Add automated HTML, JavaScript, and JSON validation before merging further changes.

This change intentionally avoids moving application/data assets without a full reference and runtime test, which would risk breaking the deployed site.
