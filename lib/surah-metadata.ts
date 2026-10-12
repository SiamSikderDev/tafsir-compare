/**
 * The 114-surah metadata — the single source of truth for surah-level facts.
 *
 * Used by both `scripts/seed-surahs.ts` (CLI seed) and
 * `app/api/admin/seed-surahs/route.ts` (dashboard seed button).
 *
 * Source: Madinah-mushaf (Kufi) ayah numbering and the widely accepted
 * Makki/Madani classification; chronological order follows the
 * Nöldeke/Schwally sequence. This is structural metadata only — no
 * Quranic text lives here, so it is safe to embed.
 *
 * Bengali names follow the Taisirul Quran convention used across the site.
 */

export type RevelationPlace = "makkah" | "madinah";

export interface SurahMetadataEntry {
  number: number;
  nameArabic: string;
  nameTransliterated: string;
  nameBengali: string;
  nameEnglish: string;
  revelationPlace: RevelationPlace;
  totalAyahs: number;
  chronologicalOrder: number;
}

/**
 * Tuple layout:
 * [number, nameArabic, nameTransliterated, nameBengali, nameEnglish,
 *  revelationPlace, totalAyahs, chronologicalOrder]
 */
const ROWS: [
  number,
  string,
  string,
  string,
  string,
  RevelationPlace,
  number,
  number,
][] = [
  [1, "الفاتحة", "Al-Fatihah", "আল-ফাতিহা", "The Opening", "makkah", 7, 5],
  [2, "البقرة", "Al-Baqarah", "আল-বাকারা", "The Cow", "madinah", 286, 87],
  [3, "آل عمران", "Aal-e-Imran", "আলে-ইমরান", "Family of Imran", "madinah", 200, 89],
  [4, "النساء", "An-Nisa", "আন-নিসা", "The Women", "madinah", 176, 92],
  [5, "المائدة", "Al-Ma'idah", "আল-মায়েদা", "The Table Spread", "madinah", 120, 112],
  [6, "الأنعام", "Al-An'am", "আল-আন'আম", "The Cattle", "makkah", 165, 55],
  [7, "الأعراف", "Al-A'raf", "আল-আ'রাফ", "The Heights", "makkah", 206, 39],
  [8, "الأنفال", "Al-Anfal", "আল-আনফাল", "The Spoils of War", "madinah", 75, 88],
  [9, "التوبة", "At-Tawbah", "আত-তাওবা", "The Repentance", "madinah", 129, 113],
  [10, "يونس", "Yunus", "ইউনুস", "Jonah", "makkah", 109, 51],
  [11, "هود", "Hud", "হূদ", "Hud", "makkah", 123, 52],
  [12, "يوسف", "Yusuf", "ইউসুফ", "Joseph", "makkah", 111, 53],
  [13, "الرعد", "Ar-Ra'd", "আর-রা'দ", "The Thunder", "madinah", 43, 96],
  [14, "إبراهيم", "Ibrahim", "ইবরাহীম", "Abraham", "makkah", 52, 72],
  [15, "الحجر", "Al-Hijr", "আল-হিজর", "The Rocky Tract", "makkah", 99, 54],
  [16, "النحل", "An-Nahl", "আন-নাহল", "The Bee", "makkah", 128, 70],
  [17, "الإسراء", "Al-Isra", "বনি ইসরাঈল", "The Night Journey", "makkah", 111, 50],
  [18, "الكهف", "Al-Kahf", "আল-কাহফ", "The Cave", "makkah", 110, 69],
  [19, "مريم", "Maryam", "মারইয়াম", "Mary", "makkah", 98, 44],
  [20, "طه", "Ta-Ha", "ত্বোয়া-হা", "Ta-Ha", "makkah", 135, 45],
  [21, "الأنبياء", "Al-Anbiya", "আল-আম্বিয়া", "The Prophets", "makkah", 112, 73],
  [22, "الحج", "Al-Hajj", "আল-হজ্জ", "The Pilgrimage", "madinah", 78, 103],
  [23, "المؤمنون", "Al-Mu'minun", "আল-মুমিনূন", "The Believers", "makkah", 118, 74],
  [24, "النور", "An-Nur", "আন-নূর", "The Light", "madinah", 64, 102],
  [25, "الفرقان", "Al-Furqan", "আল-ফুরকান", "The Criterion", "makkah", 77, 42],
  [26, "الشعراء", "Ash-Shu'ara", "আশ-শু'আরা", "The Poets", "makkah", 227, 47],
  [27, "النمل", "An-Naml", "আন-নামল", "The Ant", "makkah", 93, 48],
  [28, "القصص", "Al-Qasas", "আল-কাসাস", "The Stories", "makkah", 88, 49],
  [29, "العنكبوت", "Al-Ankabut", "আল-আনকাবূত", "The Spider", "makkah", 69, 85],
  [30, "الروم", "Ar-Rum", "আর-রূম", "The Romans", "makkah", 60, 84],
  [31, "لقمان", "Luqman", "লুকমান", "Luqman", "makkah", 34, 57],
  [32, "السجدة", "As-Sajdah", "আস-সাজদা", "The Prostration", "makkah", 30, 75],
  [33, "الأحزاب", "Al-Ahzab", "আল-আহযাব", "The Combined Forces", "madinah", 73, 90],
  [34, "سبأ", "Saba", "সাবা", "Sheba", "makkah", 54, 58],
  [35, "فاطر", "Fatir", "ফাতির", "The Originator", "makkah", 45, 43],
  [36, "يس", "Ya-Sin", "ইয়া-সীন", "Ya-Sin", "makkah", 83, 41],
  [37, "الصافات", "As-Saffat", "আস-সাফফাত", "Those Ranged in Ranks", "makkah", 182, 56],
  [38, "ص", "Sad", "সোয়াদ", "Sad", "makkah", 88, 38],
  [39, "الزمر", "Az-Zumar", "আয-যুমার", "The Troops", "makkah", 75, 59],
  [40, "غافر", "Ghafir", "গাফির", "The Forgiver", "makkah", 85, 60],
  [41, "فصلت", "Fussilat", "ফুসসিলাত", "Explained in Detail", "makkah", 54, 61],
  [42, "الشورى", "Ash-Shura", "আশ-শূরা", "The Consultation", "makkah", 53, 62],
  [43, "الزخرف", "Az-Zukhruf", "আয-যুখরুফ", "The Gold Ornaments", "makkah", 89, 63],
  [44, "الدخان", "Ad-Dukhan", "আদ-দুখান", "The Smoke", "makkah", 59, 64],
  [45, "الجاثية", "Al-Jasiyah", "আল-জাসিয়া", "The Crouching", "makkah", 37, 65],
  [46, "الأحقاف", "Al-Ahqaf", "আল-আহকাফ", "The Wind-Curved Sandhills", "makkah", 35, 66],
  [47, "محمد", "Muhammad", "মুহাম্মদ", "Muhammad", "madinah", 38, 95],
  [48, "الفتح", "Al-Fath", "আল-ফাতহ", "The Victory", "madinah", 29, 111],
  [49, "الحجرات", "Al-Hujurat", "আল-হুজুরাত", "The Rooms", "madinah", 18, 106],
  [50, "ق", "Qaf", "ক্বাফ", "Qaf", "makkah", 45, 34],
  [51, "الذاريات", "Adh-Dhariyat", "আয-যারিয়াত", "The Winnowing Winds", "makkah", 60, 67],
  [52, "الطور", "At-Tur", "আত-তূর", "The Mount", "makkah", 49, 76],
  [53, "النجم", "An-Najm", "আন-নাজম", "The Star", "makkah", 62, 23],
  [54, "القمر", "Al-Qamar", "আল-কামার", "The Moon", "makkah", 55, 37],
  [55, "الرحمن", "Ar-Rahman", "আর-রাহমান", "The Most Merciful", "madinah", 78, 97],
  [56, "الواقعة", "Al-Waqi'ah", "আল-ওয়াকিআ", "The Inevitable", "makkah", 96, 46],
  [57, "الحديد", "Al-Hadid", "আল-হাদীদ", "The Iron", "madinah", 29, 94],
  [58, "المجادلة", "Al-Mujadila", "আল-মুজাদালা", "The Pleading Woman", "madinah", 22, 105],
  [59, "الحشر", "Al-Hashr", "আল-হাশর", "The Exile", "madinah", 24, 101],
  [60, "الممتحنة", "Al-Mumtahana", "আল-মুমতাহিনা", "She Who Is Examined", "madinah", 13, 91],
  [61, "الصف", "As-Saff", "আস-সফ", "The Ranks", "madinah", 14, 109],
  [62, "الجمعة", "Al-Jumu'ah", "আল-জুমুআ", "Friday", "madinah", 11, 110],
  [63, "المنافقون", "Al-Munafiqun", "আল-মুনাফিকূন", "The Hypocrites", "madinah", 11, 104],
  [64, "التغابن", "At-Taghabun", "আত-তাগাবুন", "Mutual Disillusion", "madinah", 18, 108],
  [65, "الطلاق", "At-Talaq", "আত-তালাক", "The Divorce", "madinah", 12, 99],
  [66, "التحريم", "At-Tahrim", "আত-তাহরীম", "The Prohibition", "madinah", 12, 107],
  [67, "الملك", "Al-Mulk", "আল-মুলক", "The Sovereignty", "makkah", 30, 77],
  [68, "القلم", "Al-Qalam", "আল-কলম", "The Pen", "makkah", 52, 2],
  [69, "الحاقة", "Al-Haqqah", "আল-হাক্কা", "The Reality", "makkah", 52, 78],
  [70, "المعارج", "Al-Ma'arij", "আল-মা'আরিজ", "The Ascending Stairways", "makkah", 44, 79],
  [71, "نوح", "Nuh", "নূহ", "Noah", "makkah", 28, 71],
  [72, "الجن", "Al-Jinn", "আল-জিন", "The Jinn", "makkah", 28, 40],
  [73, "المزمل", "Al-Muzzammil", "আল-মুযযম্মিল", "The Enshrouded One", "makkah", 20, 3],
  [74, "المدثر", "Al-Muddaththir", "আল-মুদ্দাসসির", "The Cloaked One", "makkah", 56, 4],
  [75, "القيامة", "Al-Qiyamah", "আল-কিয়ামা", "The Resurrection", "makkah", 40, 31],
  [76, "الإنسان", "Al-Insan", "আল-ইনসান", "The Man", "madinah", 31, 98],
  [77, "المرسلات", "Al-Mursalat", "আল-মুরসালাত", "The Emissaries", "makkah", 50, 33],
  [78, "النبأ", "An-Naba", "আন-নাবা", "The Tidings", "makkah", 40, 80],
  [79, "النازعات", "An-Nazi'at", "আন-নাযিআত", "Those Who Drag Forth", "makkah", 46, 81],
  [80, "عبس", "Abasa", "আবাসা", "He Frowned", "makkah", 42, 24],
  [81, "التكوير", "At-Takwir", "আত-তাকবীর", "The Overthrowing", "makkah", 29, 7],
  [82, "الانفطار", "Al-Infitar", "আল-ইনফিতার", "The Cleaving", "makkah", 19, 82],
  [83, "المطففين", "Al-Mutaffifin", "আল-মুতাফফিফীন", "The Defrauders", "makkah", 36, 86],
  [84, "الانشقاق", "Al-Inshiqaq", "আল-ইনশিকাক", "The Splitting Open", "makkah", 25, 83],
  [85, "البروج", "Al-Buruj", "আল-বুরুজ", "The Constellations", "makkah", 22, 27],
  [86, "الطارق", "At-Tariq", "আত-তারিক", "The Night Star", "makkah", 17, 36],
  [87, "الأعلى", "Al-A'la", "আল-আ'লা", "The Most High", "makkah", 19, 8],
  [88, "الغاشية", "Al-Ghashiyah", "আল-গাশিয়া", "The Overwhelming", "makkah", 26, 68],
  [89, "الفجر", "Al-Fajr", "আল-ফাজর", "The Dawn", "makkah", 30, 10],
  [90, "البلد", "Al-Balad", "আল-বালাদ", "The City", "makkah", 20, 35],
  [91, "الشمس", "Ash-Shams", "আশ-শামস", "The Sun", "makkah", 15, 26],
  [92, "الليل", "Al-Layl", "আল-লাইল", "The Night", "makkah", 21, 9],
  [93, "الضحى", "Ad-Duhaa", "আদ-দুহা", "The Morning Hours", "makkah", 11, 11],
  [94, "الشرح", "Ash-Sharh", "আশ-শারহ", "The Relief", "makkah", 8, 12],
  [95, "التين", "At-Tin", "আত-তীন", "The Fig", "makkah", 8, 28],
  [96, "العلق", "Al-Alaq", "আল-আলাক", "The Clot", "makkah", 19, 1],
  [97, "القدر", "Al-Qadr", "আল-কদর", "The Night of Decree", "makkah", 5, 25],
  [98, "البينة", "Al-Bayyinah", "আল-বাইয়্যিনা", "The Clear Proof", "madinah", 8, 100],
  [99, "الزلزلة", "Az-Zalzalah", "আয-যিলযাল", "The Earthquake", "madinah", 8, 93],
  [100, "العاديات", "Al-Adiyat", "আল-আদিয়াত", "The Courser", "makkah", 11, 14],
  [101, "القارعة", "Al-Qari'ah", "আল-ক্বারিআ", "The Striking Hour", "makkah", 11, 30],
  [102, "التكاثر", "At-Takathur", "আত-তাকাসুর", "Rivalry in Increase", "makkah", 8, 16],
  [103, "العصر", "Al-Asr", "আল-আসর", "The Declining Day", "makkah", 3, 13],
  [104, "الهمزة", "Al-Humazah", "আল-হুমাযা", "The Slanderer", "makkah", 9, 32],
  [105, "الفيل", "Al-Fil", "আল-ফীল", "The Elephant", "makkah", 5, 19],
  [106, "قريش", "Quraysh", "কুরাইশ", "Quraysh", "makkah", 4, 29],
  [107, "الماعون", "Al-Ma'un", "আল-মাউন", "The Small Kindnesses", "makkah", 7, 17],
  [108, "الكوثر", "Al-Kawthar", "আল-কাউসার", "The Abundance", "makkah", 3, 15],
  [109, "الكافرون", "Al-Kafirun", "আল-কাফিরূন", "The Disbelievers", "makkah", 6, 18],
  [110, "النصر", "An-Nasr", "আন-নাসর", "The Divine Support", "madinah", 3, 114],
  [111, "المسد", "Al-Masad", "আল-মাসাদ", "The Palm Fiber", "makkah", 5, 6],
  [112, "الإخلاص", "Al-Ikhlas", "আল-ইখলাস", "The Sincerity", "makkah", 4, 22],
  [113, "الفلق", "Al-Falaq", "আল-ফালাক", "The Daybreak", "makkah", 5, 20],
  [114, "الناس", "An-Nas", "আন-নাস", "Mankind", "makkah", 6, 21],
];

export const SURAH_METADATA: SurahMetadataEntry[] = ROWS.map(
  ([number, nameArabic, nameTransliterated, nameBengali, nameEnglish, revelationPlace, totalAyahs, chronologicalOrder]) => ({
    number,
    nameArabic,
    nameTransliterated,
    nameBengali,
    nameEnglish,
    revelationPlace,
    totalAyahs,
    chronologicalOrder,
  }),
);

/** Well-known ayah counts (Madinah mushaf) used as a spot-check. */
const FAMOUS_COUNTS: Record<number, number> = {
  1: 7,
  2: 286,
  3: 200,
  36: 83,
  55: 78,
  67: 30,
  112: 4,
  113: 5,
  114: 6,
};

/**
 * Validates the metadata table. Throws on the first inconsistency.
 * Called by the CLI seed script and the admin seed route before any write.
 */
export function validateSurahMetadata(): void {
  const fail = (msg: string): never => {
    throw new Error(`[surah-metadata] invalid data: ${msg}`);
  };

  if (SURAH_METADATA.length !== 114) fail(`expected 114 rows, got ${SURAH_METADATA.length}`);

  const numbers = new Set<number>();
  const chronos = new Set<number>();
  let totalAyahs = 0;

  for (const row of SURAH_METADATA) {
    if (!Number.isInteger(row.number) || row.number < 1 || row.number > 114)
      fail(`bad number ${row.number}`);
    if (numbers.has(row.number)) fail(`duplicate number ${row.number}`);
    numbers.add(row.number);

    if (!Number.isInteger(row.chronologicalOrder) || row.chronologicalOrder < 1 || row.chronologicalOrder > 114)
      fail(`bad chronologicalOrder ${row.chronologicalOrder} on surah ${row.number}`);
    if (chronos.has(row.chronologicalOrder))
      fail(`duplicate chronologicalOrder ${row.chronologicalOrder}`);
    chronos.add(row.chronologicalOrder);

    if (row.revelationPlace !== "makkah" && row.revelationPlace !== "madinah")
      fail(`bad revelationPlace on surah ${row.number}`);
    if (!Number.isInteger(row.totalAyahs) || row.totalAyahs < 1)
      fail(`bad totalAyahs on surah ${row.number}`);
    if (!row.nameArabic || !row.nameTransliterated || !row.nameBengali || !row.nameEnglish)
      fail(`missing name on surah ${row.number}`);

    totalAyahs += row.totalAyahs;
  }

  if (totalAyahs !== 6236)
    fail(`total ayah count is ${totalAyahs}, expected 6236 (Madinah mushaf)`);

  for (const [surah, ayahs] of Object.entries(FAMOUS_COUNTS)) {
    const row = SURAH_METADATA.find((r) => r.number === Number(surah));
    if (row?.totalAyahs !== ayahs)
      fail(`surah ${surah} has ${row?.totalAyahs} ayahs, expected ${ayahs}`);
  }

  const makki = SURAH_METADATA.filter((r) => r.revelationPlace === "makkah").length;
  const madani = SURAH_METADATA.filter((r) => r.revelationPlace === "madinah").length;
  if (makki !== 86 || madani !== 28)
    fail(`expected 86 Makki + 28 Madani, got ${makki} Makki + ${madani} Madani`);
}
