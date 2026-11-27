# Tadabbur Quran — Content Sources & Readiness Register

Last reviewed: 2026-11-27

This register separates sources already referenced by the codebase from sources that are only candidates. Do not treat an API being reachable as proof that its content may be redistributed, bundled, or cached indefinitely.

## 1. Current repository audit

| Resource | What is present today | Readiness / action |
|---|---|---|
| Arabic Quran text | `quran-uthmani.txt`, `quran-uthmani-structured.json`, `quran-uthmani-structured-v2-min.json`; the TV reader currently requests Uthmani text from AlQuranCloud | Files exist, but their provenance, version, checksums, and verbatim integrity are not recorded in the app. Verify against an authoritative source before treating any file as production canonical. |
| Quran metadata | `quran.json` currently contains metadata but an empty `surahs` array | Populate from a documented source only after schema and count validation. |
| Dari translation | Code uses QuranEnc key `dari_badkhashani`; `translation-library.js` identifies it as the default | QuranEnc identifies the edition as “Dari Translation — Muhammad Anwar Badakhshani.” Verify all 114 surahs, verse counts, footnotes, and attribution before offline packaging. |
| Recitation | Main app/TV code references AlQuranCloud editions for Alafasy, Abdul Basit Murattal, and Husary | Streaming currently exists in code. Recording-specific rights and service terms must be checked before downloading, bundling, or rehosting. |
| Adhan | Several local playback and prayer setup scripts exist | Five sounds are referenced in project history, but source, performer/mosque, recording provenance, and reuse permissions are not inventoried. Do not replace the chosen sounds until provenance is documented. |
| Tafsir / tadabbur | No verified tafsir dataset or scholarly editorial workflow was established by this audit | Keep tafsir and original educational reflections separate. Add edition/author/source references and review before publication. |
| Reciter photos / artwork | Local images and `reciter_photos_four.zip` exist | Photographer/source and reuse permissions are not documented in this register; confirm before public store release. |
| Fonts / Mushaf assets | TV code references Uthmanic Hafs font hosted by Quran Foundation; other fonts are loaded from Google Fonts | Record exact font edition, provider, license, and required credit before bundling. |

## 2. Verified source facts

### Arabic Quran text — Tanzil

Tanzil publishes Uthmani Quran text and states that its text may be copied and distributed verbatim, but must not be changed. Applications must identify Tanzil as the source, link to tanzil.net, and preserve the copyright/license notice. The current download page identifies version 1.1 (published February 2021).

Recommended use:
- Use Tanzil Uthmani as a candidate canonical text source after comparing the repository files verse-by-verse.
- Never silently normalize, edit, remove marks, or rewrite the canonical Arabic string.
- Keep search-normalized text in a separate derived field, never in place of the canonical verse.
- Include the complete required Tanzil attribution notice and link in the app's credits/about screen and source bundle.

Source: https://tanzil.net/pub/download/index.php

### Dari translation — QuranEnc / Muhammad Anwar Badakhshani

QuranEnc lists the edition as “Translation of the Meanings of the Noble Quran — Dari Translation — Muhammad Anwar Badakhshani” and documents the key `dari_badkhashani`. Its API returns verse rows with `sura`, `aya`, `translation`, and `footnotes`.

Recommended use:
- Keep this as the app's default Dari translation, consistent with the existing project configuration.
- Preserve the translator/edition name and QuranEnc source credit.
- Store footnotes as separate linked notes, not merged into the translation sentence.
- Verify exact verse alignment and missing rows for all 114 surahs.
- Do not assume permission to redistribute a full offline copy solely because an API endpoint is public; obtain/confirm the edition's reuse terms before bundling.

Source: https://quranenc.com/en/browse/dari_badkhashani

### Quran Foundation — candidate content and recitation platform

Quran Foundation documents content APIs for Quran text, translations, tafsir, and recitations. Its current developer FAQ states:
- Content API use is subject to Developer Terms and attribution.
- Content obtained through ordinary API endpoints generally cannot be stored for more than one week; use Content Sync for supported offline copies and sync at least every seven days when connectivity permits.
- Recitation files downloaded to a user's device for offline listening have specific conditions, including user opt-in, private app storage, no export/rehosting, credits, and removal/update handling.
- Recording rights vary by recording; verify the specific recording before publishing or redistributing.
- Quran Foundation asks apps to credit “Quran data provided by Quran Foundation” wherever Quranic content is surfaced in connected apps.

Recommended use:
- Evaluate Quran Foundation Content Sync as a governed offline source for supported resources.
- Do not put a client secret in browser or mobile code.
- Do not bundle API response datasets into the public GitHub repository.
- Keep the existing AlQuranCloud integration until a deliberate migration is tested; AlQuranCloud is an independent service and its own terms apply.

Sources:
- https://api-docs.quran.foundation/docs/api-reference/
- https://api-docs.quran.com/docs/tutorials/faq/

## 3. Resource acceptance checklist

Before any resource is marked production-ready, record:
1. Exact title, author/reciter/translator, edition, language, and source URL.
2. Rights holder and license/permission evidence for this exact edition or recording.
3. Required attribution wording and placement.
4. Version/date retrieved and checksum for each static file.
5. Completeness: expected chapters/verses/tracks and missing/duplicate checks.
6. Integrity tests: Arabic text must match its source exactly; translation verse keys must align; audio must map to the correct surah/ayah/reciter.
7. Offline policy: what may be bundled, cached, downloaded to user storage, or streamed only.
8. Fallback behavior when a service is unavailable.

## 4. Work order

1. **Canonical Quran text:** inspect existing repository datasets, identify their origin, compare all 6,236 ayahs with the chosen authoritative source, and add source notice/checksum.
2. **Dari Badakhshani:** verify API schema, complete 114-surah coverage, footnotes, and verse alignment; document reuse terms before bundling.
3. **Reciters:** create a recording manifest per reciter/edition with exact source, format, duration, verse/chapter mapping, and permission/terms status.
4. **Adhan recordings:** inventory the five existing sounds, preserve the selected recordings, and document the mosque/performer/source and written permission where needed.
5. **Tafsir and teaching:** select named editions and qualified review; label tafsir, translation, and original app reflections distinctly.
6. **Images and fonts:** record source and license/credit for each portrait, logo, background, and font.
7. **Offline library:** implement only under the applicable source terms, with integrity checks and explicit download controls.

## 5. Release gate

No resource should be described as “licensed,” “official,” “original,” or “offline-ready” until the exact file/edition has supporting source and permission evidence. Public API access alone is not proof of redistribution rights.
