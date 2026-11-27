# Tadabbur Quran — Content Sources & Readiness Register

Last reviewed: 2026-11-27

This register separates sources already referenced by the codebase from sources that are only candidates. Do not treat an API being reachable as proof that its content may be redistributed, bundled, or cached indefinitely.


## Project ownership and attribution

- **Project:** تدبر القرآن (Tadabbur Quran)
- **Founder and project owner:** محمد قسیم امیری
- **Role:** Founder / Project Owner

This identifies the project's founder and owner. It is separate from attribution owed to Quran text publishers, translators, reciters, photographers, font authors, and other third-party rights holders; those credits and licenses must remain attached to the relevant resources.

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


## 6. Repository Quran-text integrity audit (2026-11-27)

The existing repository files were inspected directly through their Git blobs. These are structural checks, **not** a comparison against Tanzil or a printed Hafs mushaf:

- `quran-uthmani.txt` contains 6,236 lines.
- `quran-uthmani-structured.json` and `quran-uthmani-structured-v2-min.json` each contain 6,236 verse records and 114 surah records.
- Both structured files agree on all 6,236 `surah:ayah` text values.
- All 6,236 verse keys are unique.
- Every structured record's `source_line` points to a line in `quran-uthmani.txt` that exactly equals its preserved `source_text`.
- The per-surah verse counts match the standard 114-surah count sequence (sum 6,236).
- The structured files deliberately separate the opening basmala for 112 surahs; Al-Fatiha keeps its basmala as ayah 1, and At-Tawbah has no opening basmala. This explains why comparing `text_uthmani` directly with the complete source line reports apparent differences at basmala-bearing surahs: the source line contains the opening basmala while the verse field stores it separately.
- The JSON metadata itself explicitly says the source text does not identify a recitation chain and that Hafs 'an Asim is the project's target, not a verified source attribution.

**Audit result:** repository files are internally consistent in their line mapping, record counts, and two structured variants. They are **not yet approved as canonical production Quran text**, because their original publisher/version/license provenance has not been established and no independent word-for-word comparison against the official Tanzil release or an authoritative Hafs mushaf has been completed.

### Next validation step

Obtain the exact official Tanzil Uthmani Version 1.1 source and its unmodified copyright block. Compare the existing repository's canonical verse strings against the official file using a documented mapping that treats opening basmalas separately. Report every mismatch without automatically correcting the Quran text. Only after a zero-unexplained-difference review should the selected file be marked as the production canonical text.


## 7. Reciter photo inventory and rights review (2026-11-27)

The reciter gallery should use real, clean portraits with no embedded names, captions, watermarks, or promotional text. Preserve the existing local images until they are visually inspected; do not overwrite them based only on filenames.

| Reciter | Candidate image/source | Rights / current decision |
|---|---|---|
| Mishary bin Rashid Alafasy (مشاري بن راشد العفاسي) | Wikimedia Commons file page: https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg | Commons page states the copyright holder permits unrestricted redistribution, commercial use, and modification. Candidate may be used after checking the actual image, attribution/permission evidence, and suitability for the app. |
| Abdul Basit Abdus Samad (عبدالباسط عبدالصمد) | Wikimedia Commons portrait from 1955: https://commons.wikimedia.org/wiki/File:Abdel_Basit_Abdel_Samad_1955.png | Commons page states public-domain status under Egyptian and US rules, but author is unknown and source is a cropped 1955 magazine/newspaper image. Candidate only; inspect image and legal basis before bundling. An alternate 1966 South Africa photo is also listed as public domain: https://commons.wikimedia.org/wiki/File:Abdul_Basit_Abd_us-Samad_in_South_Africa_in_1966_(3).jpg |
| Mahmoud Khalil Al-Husary (محمود خليل الحصري) | Wikimedia Commons portrait: https://commons.wikimedia.org/wiki/File:Hussary.jpg | Uploader explicitly dedicated their own work to the public domain. Candidate may be used after image inspection and recording the creator credit/rights statement. |
| Barakatullah Salim (برکت‌الله سلیم) | Background/identity reference: https://www.afghan-bios.info/index.php/database/5478-saleem-barakatullah ; news reference: https://tolonews.com/afghanistan-187173 ; a portrait appears in the Islamic Bulletin reciter list: https://islamicbulletin.org/?page_id=12001 | No independently verified reuse license for a portrait found in this review. Do not copy the Islamic Bulletin image into the app without permission. Seek family/estate, broadcaster, or photographer permission, or locate a clearly licensed portrait. |

### Implementation status

- This is a source-and-rights shortlist, not a claim that image files have been downloaded, installed, or tested in the app.
- No remote image hotlink should be treated as a permanent production asset. For approved images, retain the original file, source page, creator, exact license/permission evidence, retrieval date, and checksum in the repository.
- Crop/resize copies for the UI only after permission is confirmed; retain an unmodified source master. Do not add names or text into the image pixels; display names as normal app text beside/below the image.
- Before committing binary portraits, visually inspect the exact image and confirm it depicts the intended reciter, is a single-person portrait, is clear enough for mobile/TV cards, and has no unwanted writing or watermark.

### Immediate next action

Inspect the four existing repository image files (alafasy.jpg, abdulbasit.jpg, husary.jpg, barakatullah.jpg) and the archive reciter_photos_four.zip. Compare them with the candidate source pages above, then keep, replace, or hold each image based on visual quality and documented rights. The repository file audit must be completed before changing the app's image paths.


### Visual inspection of existing repository portraits (completed 2026-11-27)

The four current JPEGs were fetched from the repository and visually inspected at full image size:

| File | Visual result | Decision |
|---|---|---|
| `alafasy.jpg` | Correct-looking single-person portrait; clean background; no embedded name or watermark; close crop around the face. | Keep for now. It is usable in a portrait card; consider a slightly wider licensed portrait later if the gallery needs consistent framing. |
| `abdulbasit.jpg` | Single-person archival/colorized portrait; clean background; no embedded name or visible watermark; face and clothing are clear. | Keep for now. Confirm the exact source/license record before final public release. |
| `husary.jpg` | Correct-looking single-person archival portrait; no embedded name; visibly lower resolution and has a scan/photo border and a circular mark at lower left. | Keep as a temporary source asset, but mark for replacement with a cleaner, higher-resolution licensed portrait when available. Do not remove before replacement is approved. |
| `barakatullah.jpg` | Single-person portrait; no embedded name, but the top edge includes phone status-bar/interface icons and the framing is a little tight. | Hold. Do not publish as the final gallery portrait until replaced by a clean original or cropped from a permission-cleared master. Existing project code credits Pajhwok / Haseeb Muslih; verify that credit and reuse permission against the original image page. |

The main `index.html` already displays the four local image paths and includes source-credit links in the reciter cards: Wikimedia Commons for the first three and Pajhwok / Haseeb Muslih for Barakatullah Salim. The source links are useful attribution, but a credit link by itself is not proof that all reuse conditions have been met. The separate installer script `qari-library-install.js` contains remote Wikimedia/Pajhwok image URLs; do not assume those remote files and the current local JPEGs are byte-identical. The existing local photos have not been replaced in this audit.

### ZIP archive status

The repository also contains `reciter_photos_four.zip` (191,000 bytes). Its archive contents were not extracted in this pass, so no claim is made about whether it contains better or duplicate versions. Compare its members visually before using any of them.
