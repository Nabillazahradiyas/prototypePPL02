export const criteria = [
  "Rata-rata rapor",
  "Nilai mapel pendukung jurusan",
  "Skor peringkat kelas",
];
const names = [
  "Alya Putri Ramadhani",
  "Bagas Aditya Pratama",
  "Citra Ayu Lestari",
  "Dimas Arya Wibowo",
  "Eka Nurul Hidayah",
  "Fajar Maulana Siddiq",
  "Gita Savitri Anjani",
  "Hanif Rizky Fauzan",
  "Intan Permata Sari",
  "Joko Santoso",
  "Kirana Dewi Anggraini",
  "Lukman Hakim",
];
const classes = [
  "IPA 1",
  "IPA 1",
  "IPA 2",
  "IPA 2",
  "IPS 1",
  "IPS 1",
  "IPS 2",
  "IPA 1",
  "IPS 2",
  "IPA 2",
  "IPS 1",
  "IPA 2",
];
const values = [
  [100, 100, 100],
  [96, 97, 92.2],
  [98, 96, 95],
  [93, 92.3, 92.5],
  [96, 95.3, 94],
  [91, 90, 85],
  [94, 94.8, 90],
  [87, 86, 81.5],
  [89, 89.1, 83],
  [84, 82.5, 80],
  [89, null, 86],
  [88, 90, null],
];
export const seed = {
  students: names.map((name, i) => ({
    id: String(81234567 + i).padStart(10, "0"),
    name,
    cls: "XII " + classes[i],
    v: values[i],
  })),
  config: {
    year: "2026/2027",
    period: "Seleksi SNBP Gelombang 1",
    weights: [50, 30, 20],
    quota: 40,
  },
  verified: [],
  stale: false,
  activity: "Data contoh seleksi tersedia.",
};
export const defaultRules = criteria.map((name, i) => ({
  id: "C" + (i + 1),
  name,
  type: "benefit",
  params: [],
}));
export function convert(value, rule) {
  if (!Number.isFinite(value) || value < 0 || value > 100) return null;
  if (!rule.params.length) return value;
  return (
    rule.params.find((p) => value >= p.min && value <= p.max)?.score ?? null
  );
}
export function complete(s, rules = defaultRules) {
  return rules.every((r, i) => convert(s.v[i], r) !== null);
}
export function rank(students, config) {
  const rules = config.rules || defaultRules;
  const rows = students
    .filter((s) => complete(s, rules))
    .map((s) => ({ ...s, converted: rules.map((r, i) => convert(s.v[i], r)) }));
  const extrema = rules.map((r, i) =>
    rows.length
      ? (r.type === "cost" ? Math.min : Math.max)(
          ...rows.map((s) => s.converted[i]),
        )
      : 0,
  );
  const seats = Math.floor((rows.length * config.quota) / 100);
  return rows
    .map((s) => {
      const norm = s.converted.map((n, i) =>
        rules[i].type === "cost"
          ? n === 0
            ? 1
            : extrema[i] / n
          : extrema[i]
            ? n / extrema[i]
            : 0,
      );
      return {
        ...s,
        norm,
        score: norm.reduce((sum, n, i) => sum + n * config.weights[i], 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .map((s, i) => ({ ...s, rank: i + 1, eligible: i < seats }));
}
export const users = [
  {
    id: "u1",
    username: "admin",
    name: "Budi Santoso, S.Kom",
    role: "Admin",
    school: "s1",
  },
  {
    id: "u2",
    username: "superadmin",
    name: "Laela Sugi Nurfatekhah",
    role: "Super Admin",
    school: null,
  },
  {
    id: "u3",
    username: "gurubk",
    name: "Dewi Lestari",
    role: "Guru BK",
    school: "s1",
  },
];
export function periodData(base = seed) {
  const config = { ...base.config, rules: base.config.rules || defaultRules };
  return {
    ...base,
    config,
    decisions:
      base.decisions ||
      Object.fromEntries(
        (base.verified || []).map((id) => [
          id,
          { by: "Verifikasi versi awal", final: false },
        ]),
      ),
    results: base.stale ? [] : rank(base.students, config),
  };
}
export function initialState(legacy) {
  return {
    users,
    schools: [
      { id: "s1", name: "SMA Negeri Semarang", active: true, logo: "" },
    ],
    spaces: {
      s1: { active: "p1", periods: { p1: periodData(legacy || seed) } },
    },
  };
}
export function emptyPeriod(label, year, config = seed.config) {
  return periodData({
    ...seed,
    students: [],
    config: { ...config, period: label, year },
    stale: true,
    verified: [],
    activity: "Periode baru dibuat.",
  });
}
