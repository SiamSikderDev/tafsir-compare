# Quran Text & Translation — Source Attribution

Imported: 2026-10-12

## Arabic text (Uthmani script)

- **Source:** Tanzil Project — https://tanzil.net
- **File:** Quran text, Uthmani edition (Version 1.1), downloaded via the
  CC BY 3.0-licensed GitHub mirror `acfatah/tanzil` (verbatim copy of
  Tanzil's `quran-uthmani.txt`; byte-size verified identical to the mirror).
- **License:** Creative Commons Attribution 3.0 (CC BY 3.0).
- **Terms (from https://tanzil.net/download):** verbatim copies may be copied
  and distributed; **the text was NOT modified in any way** — stored and
  served byte-for-byte as published. The source (Tanzil Project) is credited
  here and on the site's `/sources` page with a link to https://tanzil.net so
  users can track changes. Check updates at http://tanzil.net/updates/.
- **Verification at import:** 6,236 verses / 114 surahs; per-surah ayah counts
  matched `lib/surah-metadata.ts` exactly; Surah 1 verified as 7 verses
  starting with the Bismillah; juz boundaries taken from Tanzil's
  `quran-data.js` metadata (also CC BY 3.0).

## English translation

- **Translation:** Saheeh International
- **Source:** Tanzil Project translations page — https://tanzil.net/trans/
  (file ID `en.sahih`, last update April 24, 2011 per the file header).
- **Terms:** Tanzil provides translations for **non-commercial purposes only**.
  Tafsir Compare is a free, non-commercial research platform (no ads, no paid
  content), which fits these terms. If the platform ever becomes commercial,
  permission must be obtained from the translator/publisher first.
- The English text is stored verbatim alongside the Arabic; it is a
  translation aid and not a replacement for the Quranic text (per Tanzil's
  own disclaimer: no translation is 100% accurate).

## Bengali translation

- **Translation:** মুহিউদ্দীন খান (Muhiuddin Khan)
- **Source:** Tanzil Project translations page — https://tanzil.net/trans/
  (file ID `bn.bengali`, last update April 30, 2011 per the file header;
  changelog at https://tanzil.net/trans/log/bn.bengali).
- **Terms:** Tanzil provides translations for **non-commercial purposes only**.
  Tafsir Compare is a free, non-commercial research platform (no ads, no paid
  content), which fits these terms. If the platform ever becomes commercial,
  permission must be obtained from the translator/publisher first.
- **Verification at import (2026-10-12):** 6,236 verses / 114 surahs;
  per-surah ayah counts matched `lib/surah-metadata.ts` exactly (zero
  mismatches); 1:1 key alignment with the existing Arabic+English bundle
  (zero missing, zero extra); ayahs sequential within every surah; Surah 1
  verified as 7 verses starting with the Bismillah. The Bengali text is
  stored verbatim — parsed by splitting on the first two pipes only, no
  trimming or normalization; it is a translation aid and not a replacement
  for the Quranic text.

## What is NOT included

- No tafsir, hadith, or research content is generated from these files; that
  content enters only through the admin draft → review → published workflow
  with exact scholarly citations.
