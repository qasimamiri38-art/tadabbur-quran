# Tadabbur Quran

A Persian/Arabic web app for reading the Quran, selecting available translations and tafsir editions, searching, bookmarking verses, and playing recitation audio.

## Run locally

This is a static front-end project with no build step. Serve the repository with a local web server, for example:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. Service workers do not work from a `file://` URL. For deployment, configure GitHub Pages to publish the `main` branch from the repository root.

## Key files

- `index.html` — current interface and application logic; it fetches data at runtime.
- `manifest.webmanifest` — installable web app metadata.
- `sw.js` — app-shell and successful API-response caching for limited offline use.
- `icon-512.png` — app icon.
- `quran-*.json` and `quran-uthmani.txt` — data files currently present in the repository; the current interface uses the AlQuran Cloud API, according to `index.html`.
- `README-FA.md` — Persian documentation.

## Data and limitations

Quran text, translations, and the available tafsir editions are fetched from the [AlQuran Cloud API](https://alquran.cloud/api). Internet is required for the initial fetch and online audio. Service-worker caching does not guarantee complete offline access. Verify the sources and licenses of translations and tafsir editions before public distribution.

## Maintenance

Existing data and image files have not been moved, to avoid breaking GitHub Pages paths before verifying every reference. In future changes, separate CSS and JavaScript into dedicated files after testing, and document which data files are actually used by the app.
