"use client";
import { useEffect, useRef, useState, Fragment } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  ScanSearch,
  ListOrdered,
  FileChartColumn,
  Settings,
  Menu,
  ArrowRight,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCheck,
  Clock3,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Search,
  Plus,
  Download,
  Upload,
  X,
  LogOut,
  Info,
  CheckCircle2,
  Printer,
  School,
  ContactRound,
} from "lucide-react";
import {
  initialState,
  defaultRules,
  convert,
  rank,
  complete,
} from "./model.mjs";
import { Directory, Periods, CriteriaEditor } from "./management";
const menus = [
  "Dashboard",
  "Data Siswa",
  "Kriteria, Bobot, Periode dan Kuota",
  "Proses Seleksi",
  "Hasil Seleksi",
  "Laporan",
  "Pengaturan Akun",
  "Sekolah",
  "Pengguna",
];
const icons = [
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  ScanSearch,
  ListOrdered,
  FileChartColumn,
  Settings,
  School,
  ContactRound,
];
const classes = ["XII IPA 1", "XII IPA 2", "XII IPS 1", "XII IPS 2"];
const Badge = ({ tone = "green", children }) => (
  <span className={"badge " + tone}>{children}</span>
);
function schoolPhoto(school) {
  return school?.photo ?? (school?.id === "s1" ? "/sidebar.jpg" : "");
}
function Brand({ school, subtitle }) {
  const image = school?.logo || schoolPhoto(school);
  return (
    <div className="brand">
      <i>
        {image ? (
          <img src={image} className={school?.logo ? "schoolLogo" : "schoolPhoto"} alt={school.name} />
        ) : (
          school ? <b>{school.name.slice(0,1)}</b> : <GraduationCap size={30} />
        )}
      </i>
      <span>
        <b>SPK SNBP</b>
        {(school || subtitle) && <small>{school?.name || subtitle}</small>}
      </span>
    </div>
  );
}
async function digest(s) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  return Array.from(new Uint8Array(bytes), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
}
function Login({ enter, state }) {
  const [show, S] = useState(false),
    [err, E] = useState("");
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    const u = state.users.find(
      (x) => x.username === f.get("user").trim().toLowerCase(),
    );
    if (
      !u ||
      (u.hash
        ? (await digest(f.get("pass"))) !== u.hash
        : f.get("pass") !== "snbp2026")
    )
      return E("Nama pengguna atau kata sandi salah.");
    if (u.school && !state.schools.some((s) => s.id === u.school && s.active))
      return E("Sekolah akun ini sedang nonaktif.");
    enter(u.id);
  }
  return (
    <main className="login">
      <section className="welcome">
        <Brand />
        <div className="greeting">
          <h1>
            SELAMAT <em>DATANG</em>
          </h1>
          <p>
            Masuk untuk melanjutkan ke sistem pendukung keputusan penentuan
            siswa eligible SNBP.
          </p>
        </div>
        <img src="/campus.jpg" alt="Gedung sekolah" />
      </section>
      <section className="loginRight">
        <div className="dots" />
        <form className="loginCard" onSubmit={submit}>
          <h2>Masuk</h2>
          <p>Silakan masukkan nama pengguna dan kata sandi Anda.</p>
          <label>
            Username
            <div className="field">
              <UserRound />
              <input
                name="user"
                placeholder="Masukkan username"
                autoComplete="username"
                required
              />
            </div>
          </label>
          <label>
            Kata sandi
            <div className="field">
              <LockKeyhole />
              <input
                name="pass"
                type={show ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                title={show ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                onClick={() => S(!show)}
              >
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          {err && (
            <p role="alert" className="error">
              {err}
            </p>
          )}
          <button className="primary masuk">
            Masuk <ArrowRight size={20} />
          </button>

        </form>
      </section>
    </main>
  );
}
function Metrics({ items }) {
  return (
    <div className="metrics">
      {items.map(([label, n, Icon, color]) => (
        <div className="metric" key={label}>
          <i className={color}>
            <Icon size={22} />
          </i>
          <div>
            <small>{label}</small>
            <strong>{n}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
function StudentForm({ student, save, criteria }) {
  const [s, S] = useState(student);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save({ ...s, name: s.name.trim() });
      }}
    >
      <label>
        NISN
        <input
          required
          pattern="[0-9]{10}"
          title="10 digit angka"
          maxLength={10}
          value={s.id}
          onChange={(e) => S({ ...s, id: e.target.value })}
        />
      </label>
      <label>
        Nama siswa
        <input
          required
          value={s.name}
          onChange={(e) => S({ ...s, name: e.target.value })}
        />
      </label>
      <label>
        Kelas
        <select
          value={s.cls}
          onChange={(e) => S({ ...s, cls: e.target.value })}
        >
          {classes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      {criteria.map((c, i) => (
        <label key={c}>
          {c}
          <input
            type="number"
            placeholder="Belum diisi"
            min="0"
            max="100"
            step="any"
            value={s.v[i] ?? ""}
            onChange={(e) =>
              S({
                ...s,
                v: s.v.map((n, j) =>
                  j === i
                    ? e.target.value === ""
                      ? null
                      : +e.target.value
                    : n,
                ),
              })
            }
          />
        </label>
      ))}
      <button className="primary">Simpan siswa</button>
    </form>
  );
}
async function exportFile(rows, name) {
  const x = await import("xlsx");
  const book = x.utils.book_new();
  x.utils.book_append_sheet(book, x.utils.json_to_sheet(rows), "Data");
  x.writeFile(book, name + ".xlsx");
}
export default function Page() {
  const [uid, A] = useState(null),
    [state, D] = useState(() => initialState()),
    [pg, P] = useState(0),
    [compact, C] = useState(false),
    [mobile, M] = useState(false),
    [modal, U] = useState(null),
    [msg, T] = useState(""),
    [q, Q] = useState(""),
    [cls, F] = useState(""),
    [status, G] = useState("");
  const file = useRef(null);
  useEffect(() => {
    function restore() {
      try {
        const saved = localStorage.getItem("snbp-v2");
        if (saved) {
          D(JSON.parse(saved));
          return;
        }
        const legacy = JSON.parse(localStorage.getItem("snbp-v1") || "null");
        const next = initialState(legacy);
        next.users = next.users.map((u) =>
          u.username === "admin"
            ? { ...u, hash: localStorage.getItem("snbp-password") }
            : u,
        );
        D(next);
      } catch {}
    }
    restore();
    A(
      sessionStorage.getItem("snbp-user") ||
        (sessionStorage.getItem("snbp-session") === "1" ? "u1" : null),
    );
    window.addEventListener("storage", restore);
    return () => window.removeEventListener("storage", restore);
  }, []);
  useEffect(() => {
    if (!msg) return;
    const timer = setTimeout(() => T(""), 4500);
    return () => clearTimeout(timer);
  }, [msg]);
  useEffect(() => {
    function esc(e) {
      if (e.key === "Escape") {
        U(null);
        M(false);
      }
    }
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);
  const user = state.users.find((u) => u.id === uid),
    school = state.schools.find((s) => s.id === user?.school),
    space = state.spaces[user?.school] || state.spaces.s1;
  const db = space.periods[space.active],
    { students, config, verified } = db,
    rules = config.rules,
    criteria = rules.map((r) => r.name),
    keys = ["NISN", "Nama", "Kelas", ...criteria];
  const blank = { id: "", name: "", cls: classes[0], v: rules.map(() => null) };
  const allowed =
    user?.role === "Super Admin"
      ? [7, 8, 6]
      : user?.role === "Guru BK"
        ? [0, 4, 5, 6]
        : [0, 1, 2, 3, 4, 5, 6];
  function commit(next) {
    localStorage.setItem("snbp-v2", JSON.stringify(next));
    D(next);
  }
  function setSpace(next) {
    commit({ ...state, spaces: { ...state.spaces, [user.school]: next } });
  }
  function update(changes, activity, dirty = false) {
    const next = {
      ...db,
      ...changes,
      activity,
      ...(dirty
        ? { stale: true, verified: [], decisions: {}, results: [] }
        : {}),
    };
    setSpace({ ...space, periods: { ...space.periods, [space.active]: next } });
    T(activity);
  }
  function nav(i) {
    P(i);
    M(false);
    Q("");
    F("");
    G("");
    U(null);
  }
  function logout() {
    sessionStorage.removeItem("snbp-session");
    sessionStorage.removeItem("snbp-user");
    A(null);
    nav(0);
  }
  const rows = db.stale ? [] : db.results,
    missing = students.filter((s) => !complete(s, rules)),
    seats = Math.floor(
      ((students.length - missing.length) * config.quota) / 100,
    ),
    eligible = rows.filter((s) => s.eligible).length;
  function resultStatus(s) {
    const d = db.decisions[s.id];
    return !d
      ? "Menunggu verifikasi"
      : d.final
        ? s.eligible
          ? "Ditetapkan eligible"
          : "Ditetapkan tidak eligible"
        : "Terverifikasi";
  }
  const match = (s) =>
    (!cls || s.cls === cls) &&
    (s.name + " " + s.id).toLowerCase().includes(q.toLowerCase());
  const filtered = rows.filter(
    (s) =>
      match(s) &&
      (!status ||
        (status === "eligible"
          ? s.eligible
          : status === "tidak"
            ? !s.eligible
            : status === "verified"
              ? verified.includes(s.id)
              : !verified.includes(s.id))),
  );
  const metrics = [
    ["Total siswa", students.length, Users, "blue"],
    ["Nilai lengkap", students.length - missing.length, ClipboardCheck, "blue"],
    ["Siswa eligible", eligible, CheckCircle2, "green"],
    ["Menunggu verifikasi", rows.length - verified.length, Clock3, "amber"],
  ];
  function filterBar(results = false) {
    return (
      <div className="filters">
        <div className="search">
          <Search size={16} />
          <input
            aria-label="Cari siswa"
            placeholder="Cari nama / NISN..."
            value={q}
            onChange={(e) => Q(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter kelas"
          value={cls}
          onChange={(e) => F(e.target.value)}
        >
          <option value="">Semua kelas</option>
          {classes.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {results && (
          <select
            aria-label="Filter status"
            value={status}
            onChange={(e) => G(e.target.value)}
          >
            <option value="">Semua status</option>
            <option value="eligible">Eligible</option>
            <option value="tidak">Tidak eligible</option>
            <option value="pending">Menunggu verifikasi</option>
            <option value="verified">Terverifikasi</option>
          </select>
        )}
      </div>
    );
  }
  function rankTable(data, preview = false) {
    return (
      <div className="scroll results">
        <table>
          <thead>
            <tr>
              {[
                "Peringkat",
                "NISN",
                "Nama siswa",
                "Kelas",
                "Nilai akhir",
                "Rekomendasi",
                "Status",
                ...(preview ? [] : ["Aksi"]),
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <Fragment key={s.id}>
                <tr>
                  <td>
                    <b className="rank">{s.rank}</b>
                  </td>
                  <td className="nisn">{s.id}</td>
                  <td>
                    <b>{s.name}</b>
                  </td>
                  <td>{s.cls}</td>
                  <td>
                    <b>{s.score.toFixed(2)}</b>
                  </td>
                  <td>
                    <Badge tone={s.eligible ? "green" : "red"}>
                      {s.eligible ? "Eligible" : "Tidak eligible"}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={verified.includes(s.id) ? "green" : "amber"}>
                      {resultStatus(s)}
                    </Badge>
                  </td>
                  {!preview && (
                    <td>
                      <button onClick={() => U({ type: "detail", s })}>
                        Detail
                      </button>
                    </td>
                  )}
                </tr>
                {!preview && s.rank === seats && (
                  <tr>
                    <td className="cut" colSpan="8">
                      Batas kuota · {seats} siswa ({config.quota}%)
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {!data.length && (
          <p className="empty">
            {db.stale
              ? "Data berubah. Jalankan Hitung SAW di Proses Seleksi."
              : "Tidak ada siswa yang sesuai."}
          </p>
        )}
      </div>
    );
  }
  async function importRows(e) {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try {
      const x = await import("xlsx"),
        book = x.read(await f.arrayBuffer(), { type: "array", raw: true });
      const raw = x.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], {
        header: 1,
        defval: "",
      });
      const header = raw.shift() || [],
        idx = keys.map((k) => header.indexOf(k));
      if (idx.includes(-1))
        throw Error("Gunakan kolom dari berkas ekspor data siswa.");
      const ids = new Set(students.map((s) => s.id));
      const added = raw
        .filter((row) => row.some((v) => v !== ""))
        .map((row) => {
          const [id, name, cls, ...v] = idx.map((j) =>
            String(row[j] ?? "").trim(),
          );
          if (
            !/^\d{10}$/.test(id) ||
            !name ||
            !classes.includes(cls) ||
            ids.has(id) ||
            v.some(
              (n) => n !== "" && (!Number.isFinite(+n) || +n < 0 || +n > 100),
            )
          )
            throw Error("Periksa NISN unik 10 digit, kelas, dan nilai 0–100.");
          ids.add(id);
          return { id, name, cls, v: v.map((n) => (n === "" ? null : +n)) };
        });
      if (!added.length) throw Error("Berkas kosong.");
      update(
        { students: [...students, ...added] },
        added.length + " siswa diimpor.",
        true,
      );
    } catch (err) {
      T("Impor gagal. " + err.message);
    }
  }
  function exports() {
    return exportFile(
      filtered.map((s) => ({
        Peringkat: s.rank,
        NISN: s.id,
        Nama: s.name,
        Kelas: s.cls,
        Nilai: +s.score.toFixed(2),
        Rekomendasi: s.eligible ? "Eligible" : "Tidak eligible",
        Status: resultStatus(s),
        Periode: config.period,
      })),
      "Hasil-Seleksi-SNBP",
    );
  }
  if (!user || (user.school && !school?.active))
    return (
      <Login
        state={state}
        enter={(id) => {
          sessionStorage.setItem("snbp-user", id);
          A(id);
          nav(
            state.users.find((u) => u.id === id).role === "Super Admin" ? 7 : 0,
          );
        }}
      />
    );
  const page = allowed.includes(pg) ? pg : allowed[0],
    initials = user.name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("");
  return (
    <div
      className={
        "shell " + (compact ? "compact " : "") + (mobile ? "mobileOpen" : "")
      }
    >
      <aside>
        <Brand school={school} subtitle="Pengelolaan sekolah" />
        {schoolPhoto(school) && <img className="sidebarPhoto" src={schoolPhoto(school)} alt="" />}
        <nav>
          {menus.map((l, i) => {
            if (!allowed.includes(i)) return null;
            const Icon = icons[i];
            return (
              <button
                key={l}
                title={l}
                aria-current={page === i ? "page" : undefined}
                className={page === i ? "active" : ""}
                onClick={() => nav(i)}
              >
                <Icon size={20} />
                <span>{l}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      {mobile && (
        <button
          className="scrim"
          aria-label="Tutup navigasi"
          onClick={() => M(false)}
        />
      )}
      <main className="workspace">
        <header>
          <button
            className="plain"
            aria-label="Buka atau tutup navigasi"
            onClick={() => (innerWidth < 850 ? M(!mobile) : C(!compact))}
          >
            <Menu />
          </button>
          <div className="user" onClick={() => nav(6)}>
            <div>
              <b>{user.name}</b>
              <small>{user.role}</small>
            </div>
            <button className="avatar" aria-label="Pengaturan akun">
              {initials}
            </button>
          </div>
        </header>
        <article>
          <div className="crumb">
            SPK SNBP <ChevronRight size={13} /> {menus[page]}
          </div>
          <h1>
            {page === 0
              ? "Selamat datang, " + user.name.split(",")[0]
              : menus[page]}
          </h1>
          <div className="period">
            <CalendarDays size={15} />
            {school
              ? school.name + " · " + config.period + " · " + config.year
              : "Pengelolaan sekolah dan pengguna"}
          </div>
          {page === 0 && (
            <>
              <Metrics items={metrics} />
              <div className="pair">
                <section className="card">
                  <h3>Distribusi kelayakan</h3>
                  {[
                    ["Eligible", eligible, "green"],
                    ["Tidak eligible", rows.length - eligible, "red"],
                    ["Data belum lengkap", missing.length, "amber"],
                  ].map(([l, n, color]) => (
                    <div className="barRow" key={l}>
                      <div>
                        {l}
                        <b>{n}</b>
                      </div>
                      <div className="track">
                        <i
                          className={color}
                          style={{
                            width:
                              (100 * n) / Math.max(1, students.length) + "%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </section>
                <section className="card">
                  <h3>Aktivitas & notifikasi</h3>
                  <p className="activity">
                    <CheckCheck size={18} />
                    {db.activity}
                  </p>
                  <div className="notice">
                    {missing.length} siswa belum mempunyai nilai lengkap.
                  </div>
                  <button
                    className="link"
                    onClick={() => nav(user.role === "Admin" ? 1 : 4)}
                  >
                    {user.role === "Admin"
                      ? "Periksa data siswa"
                      : "Periksa hasil"}{" "}
                    <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <section className="card">
                <div className="titleRow">
                  <h3>Pratinjau peringkat</h3>
                  <button className="primary" onClick={() => nav(4)}>
                    Lihat hasil seleksi <ArrowRight size={16} />
                  </button>
                </div>
                {rankTable(rows.slice(0, 5), true)}
              </section>
            </>
          )}
          {page === 1 && (
            <section className="card">
              <div className="titleRow">
                <h3>
                  Daftar siswa <small>({students.length})</small>
                </h3>
                <button
                  className="primary"
                  onClick={() => U({ type: "edit", s: blank })}
                >
                  <Plus size={16} />
                  Tambah siswa
                </button>
              </div>
              <div className="toolbar">
                {filterBar()}
                <button onClick={() => file.current.click()}>
                  <Upload size={14} />
                  Impor CSV/Excel
                </button>
                <input
                  hidden
                  ref={file}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={importRows}
                />
                <button
                  onClick={() =>
                    exportFile(
                      students.map((s) =>
                        Object.fromEntries(
                          keys.map((k, i) => [
                            k,
                            [s.id, s.name, s.cls, ...s.v][i],
                          ]),
                        ),
                      ),
                      "Data-Siswa",
                    )
                  }
                >
                  <Download size={14} />
                  Ekspor
                </button>
              </div>
              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        "NISN",
                        "Nama siswa",
                        "Kelas",
                        "Jurusan",
                        "Kelengkapan",
                        "Aksi",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.filter(match).map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>
                          <b>{s.name}</b>
                        </td>
                        <td>{s.cls}</td>
                        <td>{s.cls.split(" ")[1]}</td>
                        <td>
                          <Badge tone={complete(s, rules) ? "green" : "amber"}>
                            {complete(s, rules) ? "Lengkap" : "Belum lengkap"}
                          </Badge>
                        </td>
                        <td className="actions">
                          {[
                            ["detail", "Lihat"],
                            ["edit", "Ubah"],
                            ["delete", "Hapus"],
                          ].map(([type, l]) => (
                            <button
                              key={type}
                              onClick={() => U({ type, s, old: s.id })}
                            >
                              {l}
                            </button>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!students.some(match) && (
                  <p className="empty">Tidak ada siswa yang sesuai.</p>
                )}
              </div>
            </section>
          )}
          {page === 2 && (
            <>
              <Periods space={space} change={setSpace} />
              <CriteriaEditor
                key={space.active}
                config={config}
                notify={T}
                save={(c) =>
                  update(
                    {
                      config: c,
                      students: students.map((s) => ({
                        ...s,
                        v: c.rules.map((_, i) => s.v[i] ?? null),
                      })),
                    },
                    "Konfigurasi disimpan. Hitung ulang seleksi.",
                    true,
                  )
                }
              />
            </>
          )}
          {(page === 7 || page === 8) && (
            <Directory
              key={page}
              state={state}
              commit={commit}
              section={page === 7 ? "school" : "users"}
              notify={T}
              hash={digest}
            />
          )}
          {page === 3 && (
            <>
              <section className="card">
                <h3>Validasi kelengkapan data</h3>
                <p>
                  {config.period} · Kuota {seats} siswa ({config.quota}% dari
                  siswa dengan nilai lengkap)
                </p>
                <div className="notice ok">✓ Bobot kriteria valid (100%).</div>
                {missing.length > 0 && (
                  <>
                    <div className="notice">
                      {missing.length} siswa belum disertakan dalam seleksi.
                    </div>
                    <ul>
                      {missing.map((s) => (
                        <li key={s.id}>
                          {s.name} —{" "}
                          {criteria
                            .filter(
                              (_, i) => convert(s.v[i], rules[i]) === null,
                            )
                            .join(", ")}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button
                  className="primary"
                  onClick={() =>
                    update(
                      { stale: false, results: rank(students, config) },
                      "Perhitungan SAW selesai untuk " +
                        rank(students, config).length +
                        " siswa.",
                    )
                  }
                >
                  <ScanSearch size={16} />
                  Hitung SAW
                </button>
              </section>
              <section className="card">
                <h3>Hasil peringkat</h3>
                {filterBar(true)}
                {rankTable(filtered)}
              </section>
            </>
          )}
          {(page === 4 || page === 5) && (
            <>
              <div className="notice">
                <Info size={16} /> Rekomendasi simulasi sekolah untuk periode{" "}
                {config.period}.
              </div>
              <Metrics
                items={[
                  ["Total dinilai", rows.length, Users, "blue"],
                  ["Eligible", eligible, CheckCircle2, "green"],
                  [
                    "Tidak eligible",
                    rows.length - eligible,
                    ListOrdered,
                    "red",
                  ],
                  metrics[3],
                ]}
              />
              <section className="card">
                <div className="titleRow">
                  <h3>
                    {page === 4 ? "Hasil pemeringkatan" : "Rekap seleksi siswa"}
                  </h3>
                  <div className="buttons">
                    <button onClick={() => window.print()}>
                      <Printer size={15} />
                      Cetak / PDF
                    </button>
                    <button onClick={exports}>
                      <Download size={15} />
                      Ekspor Excel
                    </button>
                  </div>
                </div>
                {filterBar(true)}
                {rankTable(filtered)}
              </section>
            </>
          )}
          {page === 6 && (
            <div className="pair">
              <section className="card">
                <h3>Profil pengguna</h3>
                <div className="profile">
                  <i className="avatar">{initials}</i>
                  <div>
                    <b>{user.name}</b>
                    <p>
                      {user.role}
                      <br />
                      {school?.name || "Pengelola sekolah"}
                    </p>
                  </div>
                </div>
                <button onClick={logout}>
                  <LogOut size={16} />
                  Keluar
                </button>
              </section>
              <form
                className="card"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget,
                    f = new FormData(form),
                    old = user.hash || (await digest("snbp2026"));
                  if ((await digest(f.get("lama"))) !== old)
                    return T("Kata sandi lama salah.");
                  if (f.get("baru") !== f.get("ulang"))
                    return T("Konfirmasi kata sandi tidak cocok.");
                  const hash = await digest(f.get("baru"));
                  commit({
                    ...state,
                    users: state.users.map((u) =>
                      u.id === uid ? { ...u, hash } : u,
                    ),
                  });
                  form.reset();
                  T("Kata sandi diperbarui.");
                }}
              >
                <h3>Ubah kata sandi</h3>
                {[
                  ["lama", "Kata sandi lama"],
                  ["baru", "Kata sandi baru (minimal 6 karakter)"],
                  ["ulang", "Konfirmasi kata sandi baru"],
                ].map(([k, l]) => (
                  <label key={k}>
                    {l}
                    <input
                      type="password"
                      required
                      minLength={k === "lama" ? 1 : 6}
                      name={k}
                    />
                  </label>
                ))}
                <button className="primary">Ubah kata sandi</button>
              </form>
            </div>
          )}
        </article>
      </main>
      {modal && (
        <div className="overlay">
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Data siswa"
          >
            <div className="titleRow">
              <h3>
                {modal.type === "edit"
                  ? modal.old
                    ? "Ubah siswa"
                    : "Tambah siswa"
                  : modal.type === "delete"
                    ? "Hapus siswa?"
                    : "Detail siswa"}
              </h3>
              <button aria-label="Tutup" onClick={() => U(null)}>
                <X size={16} />
              </button>
            </div>
            {modal.type === "edit" ? (
              <StudentForm
                criteria={criteria}
                student={modal.s}
                save={(s) => {
                  if (
                    !s.name ||
                    students.some((t) => t.id === s.id && t.id !== modal.old)
                  )
                    return T("Nama wajib diisi dan NISN harus unik.");
                  update(
                    {
                      students: modal.old
                        ? students.map((t) => (t.id === modal.old ? s : t))
                        : [...students, s],
                    },
                    "Data siswa disimpan. Hitung ulang seleksi.",
                    true,
                  );
                  U(null);
                }}
              />
            ) : modal.type === "delete" ? (
              <>
                <p>Hapus data {modal.s.name} dari daftar seleksi?</p>
                <div className="buttons">
                  <button onClick={() => U(null)}>Batal</button>
                  <button
                    className="danger"
                    onClick={() => {
                      update(
                        {
                          students: students.filter((t) => t.id !== modal.s.id),
                        },
                        "Data siswa dihapus.",
                        true,
                      );
                      U(null);
                    }}
                  >
                    Hapus siswa
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{modal.s.name}</h2>
                <p>
                  {modal.s.id} · {modal.s.cls}
                </p>
                {criteria.map((c, i) => (
                  <div className="detail" key={c}>
                    <span>{c}</span>
                    <b>{modal.s.v[i] ?? "Belum diisi"}</b>
                  </div>
                ))}
                {modal.s.norm && (
                  <>
                    <h3>Perhitungan SAW</h3>
                    <p>
                      Nilai dikonversi sesuai parameter, dinormalisasi
                      berdasarkan jenis kriteria, lalu dikalikan bobot.
                    </p>
                    <div className="scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Kriteria</th>
                            <th>Konversi</th>
                            <th>Normalisasi</th>
                            <th>Bobot</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rules.map((r, i) => (
                            <tr key={r.id}>
                              <td>
                                {r.name} ({r.type})
                              </td>
                              <td>{modal.s.converted[i]}</td>
                              <td>{modal.s.norm[i].toFixed(3)}</td>
                              <td>{config.weights[i]}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p>
                      {modal.s.norm
                        .map((n, i) => n.toFixed(3) + " × " + config.weights[i])
                        .join(" + ")}{" "}
                      ≈ <b>{modal.s.score.toFixed(2)}</b>
                    </p>
                    <p>
                      Peringkat {modal.s.rank} ·{" "}
                      {modal.s.eligible ? "Eligible" : "Tidak eligible"}
                    </p>
                    {db.decisions[modal.s.id] && (
                      <p>
                        {resultStatus(modal.s)} · {db.decisions[modal.s.id].by}
                      </p>
                    )}
                    {user.role === "Guru BK" &&
                      verified.includes(modal.s.id) &&
                      !db.decisions[modal.s.id]?.final && (
                        <button
                          className="primary"
                          onClick={() => {
                            update(
                              {
                                decisions: {
                                  ...db.decisions,
                                  [modal.s.id]: { by: user.name, final: true },
                                },
                              },
                              "Status akhir siswa ditetapkan.",
                            );
                            U(null);
                          }}
                        >
                          Tetapkan{" "}
                          {modal.s.eligible ? "eligible" : "tidak eligible"}
                        </button>
                      )}
                    {user.role === "Guru BK" &&
                      !verified.includes(modal.s.id) && (
                        <button
                          className="primary"
                          onClick={() => {
                            update(
                              {
                                verified: [...verified, modal.s.id],
                                decisions: {
                                  ...db.decisions,
                                  [modal.s.id]: { by: user.name, final: false },
                                },
                              },
                              "Hasil siswa telah diverifikasi.",
                            );
                            U(null);
                          }}
                        >
                          Verifikasi hasil
                        </button>
                      )}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      )}
      {msg && (
        <div className="toast" role="status">
          {msg}
        </div>
      )}
    </div>
  );
}
