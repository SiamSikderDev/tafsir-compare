# MASTER Research Framework — Whole-Quran Shia-Sunni Comparative Tafsir & Hadith

**Adopted:** 2026-10-13 · **Owner directive:** master prompt "Whole-Quran Shia-Sunni Comparative Tafsir & Hadith Research"
**ROLE UPDATE 2026-10-13 ~17:02 +06:** Muse is now DEVELOPER ONLY. Research content is provided by the
owner (or Perplexity) as ready-made markdown drafts. Muse does NOT research tafsir/hadith/shan-e-nuzul,
does NOT verify Islamic references, does NOT judge authenticity, and never invents religious content.
Muse's job: parse the provided draft → validate shape → store in MongoDB → display on the ayah page →
publish after owner approval. If content is missing/malformed, ask the owner for clarification.
This template remains the CONTRACT for the shape of incoming research drafts.
**Perspective:** Shia school of thought — with NON-NEGOTIABLE honesty rules (below).
**Approval workflow:** research → draft shown to owner → "Do you approve this for publishing?" → publish only after approval.

## Non-negotiable rules

1. Never invent a hadith, page number, volume, narrator, or reference.
2. Never claim a hadith is authentic without checking its grading.
3. **Never distort a Sunni hadith to force a Shia conclusion.**
4. **Never distort a Shia tafsir to weaken it.**
5. Quote/summarize hadith exactly as the source presents it.
6. Every hadith: collection, book, chapter, number, narrator, grading (if available), source URL.
7. Unverifiable reference → mark "needs manual verification".
8. No publishing without owner approval.
9. Respectful language for all companions, scholars, schools.
10. Clearly separate: Quranic text / translation / shan-e-nuzul / tafsir opinion / hadith evidence / scholarly interpretation.
11. **If a tafsir does NOT mention Ali/Ahl al-Bayt on a verse, say so clearly** — never imply a connection that isn't there.
12. Quranic Arabic and translations are verbatim imports — never author your own translation.

## Tafsir source sets (per ayah)

**Sunni (5):** Ibn Kathir · al-Tabari · al-Qurtubi · al-Jalalayn · al-Sa'di
**Shia (4):** Al-Mizan (Tabatabai) · Nur al-Thaqalayn · Al-Tibyan (Tusi) · Majma' al-Bayan (Tabrisi)

For EACH tafsir record: bookTitle, author, language (BN+EN summaries), summary, sourceUrl, keyPoints,
`mentionsAliAhlulBayt` (true/false), `mentionNote` (what it says, or "does not mention Ali/Ahl al-Bayt here").

## Hadith collections

**Sunni:** Sahih al-Bukhari · Sahih Muslim · Jami' at-Tirmidhi · Sunan Abu Dawud · Sunan an-Nasa'i · Musnad Ahmad
**Shia:** Al-Kafi · Man La Yahduruhu al-Faqih · Tahdhib al-Ahkam · Al-Istibsar · Bihar al-Anwar · Wasa'il al-Shia

For EACH hadith: collectionName, school, book, chapter, hadithNumber, narrator, arabicText (when available),
bengaliTranslation, englishTranslation, grading, gradingSource, sourceUrl, notes, `relevanceNote`
(how it relates to Ali/Ahl al-Bayt/wilayah — empty when it doesn't), and `evidenceTier`:
- `"primary"` — Sahih or Hasan AND clearly supports Ali/Ahl al-Bayt/wilayah. Presented prominently.
- `"disputed"` — weak, disputed, or not directly about Ali. Labeled clearly with grading; both Sunni
  and Shia scholarly positions shown honestly. Never hidden, never presented as primary proof.

**Sunni hadith evidence is split into two sections per ayah:**
1. PRIMARY SUNNI EVIDENCE — only Sahih/Hasan narrations clearly supporting Ali, Ahl al-Bayt, wilayah
   (e.g. Ghadir Khumm, Two Weighty Things, Harun-Musa where thematically relevant).
2. DISPUTED / CONTEXTUAL EVIDENCE — weak/disputed/not-directly-about-Ali narrations, honestly labeled.

**Tafsir rule:** if a Sunni tafsir does not mention Ali, say clearly "This tafsir does not explicitly
mention Ali here." Never force Ali's name into a tafsir. Ali-related evidence comes primarily from
Sunni hadith collections, not Sunni tafsir books.

**Special focus:** Sunni narrations on Ali ibn Abi Talib, Ahl al-Bayt, wilayah, the Shia of Ali,
Ghadir Khumm, the Two Weighty Things — presented accurately with Sunni scholarly context, never distorted.

## Per-ayah research draft format

```md
# Qur'an [Surah]:[Ayah] — Research Draft
## Verse (Arabic / BN / EN — verbatim imports, never authored)
## Shan-e-Nuzul
### Sunni report (+ source)
### Shia report (+ source)
## Sunni Tafsir (5 books — each with Ali/Ahl al-Bayt mention flag)
## Shia Tafsir (4 books — each with Ali/Ahl al-Bayt connection)
## Sunni Hadith Evidence
## Shia Hadith Evidence
## Comparison Table
| Topic | Sunni view | Shia view |
| Main tafsir explanation | | |
| Connection to Ali/Ahl al-Bayt | | |
| Key hadith evidence | | |
| Wilayah concept | | |
## Honest Limitations (sahih/hasan/weak, incomplete refs, disagreements, needs-verification)
## References
## Approval Request — Do you approve this for publishing?
```

## Data shape (scripts/data/<batch>.json)

```json
{
  "tafsirs": [{ "surah": 2, "ayah": 1, "school": "sunni", "bookTitle": "...", "author": "...",
    "language": "bengali", "summary": "...", "sourceUrl": "...", "keyPoints": [],
    "mentionsAliAhlulBayt": false, "mentionNote": "..." }],
  "hadiths": [{ "key": "B1", "collectionName": "...", "school": "sunni", "book": "...",
    "hadithNumber": "...", "narrator": "...", "arabicText": "...",
    "bengaliTranslation": "...", "englishTranslation": "...", "grading": "...",
    "gradingSource": "...", "sourceUrl": "...", "notes": "...", "relevanceNote": "..." }],
  "researchNotes": [{ "ayah": 1, "language": "bengali", "title": "...",
    "sunniView": "...", "shiaView": "...", "neutralExplanation": "...",
    "agreements": [], "differences": [], "linguisticNotes": [],
    "shanENuzul": { "sunni": "...", "shia": "..." },
    "comparisonTable": {
      "mainExplanation": { "sunni": "...", "shia": "..." },
      "aliConnection": { "sunni": "...", "shia": "..." },
      "keyHadithEvidence": { "sunni": "...", "shia": "..." },
      "wilayahConcept": { "sunni": "...", "shia": "..." } },
    "honestLimitations": [],
    "references": [{ "type": "tafsir", "title": "...", "author": "...", "url": "..." }] }]
}
```

Publish via `/api/admin/seed-batch` with `{ "batch": "<key>" }` — allowlisted to `baqarah-2-\d+-\d+`
(extend the regex when new surahs begin). Dashboard: add one line to APPROVED_BATCHES.
