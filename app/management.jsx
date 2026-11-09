"use client";
import { useState } from "react";
import { School, Users, Plus } from "lucide-react";
import { emptyPeriod } from "./model.mjs";
import { prepareLogo } from "./logo.mjs";
export function Directory({ state, commit, section, notify, hash }) {
  const [editing, edit] = useState(null);
  async function saveSchool(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      name = f.get("name").trim();
    if (!name) return notify("Nama sekolah wajib diisi.");
    const id = editing?.id || crypto.randomUUID(),
      school = {
        id,
        name,
        active: f.get("active") === "on",
        logo: editing.logo || "",
        photo: editing.photo ?? (editing.id === "s1" ? "/sidebar.jpg" : ""),
      };
    const file = f.get("logo");
    if (file?.name) {
      try {
        school.logo = await prepareLogo(file);
      } catch (error) {
        return notify(error.message);
      }
    }
    const schools = editing.id
      ? state.schools.map((s) => (s.id === id ? school : s))
      : [...state.schools, school];
    const spaces = editing.id
      ? state.spaces
      : {
          ...state.spaces,
          [id]: {
            active: "p1",
            periods: {
              p1: emptyPeriod("Seleksi SNBP Gelombang 1", "2026/2027"),
            },
          },
        };
    try { commit({ ...state, schools, spaces }); } catch { return notify("Penyimpanan penuh. Pilih gambar berukuran lebih kecil."); }
    edit(null);
    notify("Data sekolah disimpan.");
  }
  async function saveUser(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      username = f.get("username").trim().toLowerCase(),
      name = f.get("name").trim();
    if (!name || !username || state.users.some((u) => u.username === username))
      return notify("Isi nama dan pilih username yang unik.");
    const u = {
      id: crypto.randomUUID(),
      name,
      username,
      role: f.get("role"),
      school: f.get("school"),
      hash: await hash(f.get("pass")),
    };
    commit({ ...state, users: [...state.users, u] });
    edit(null);
    notify("Akun sekolah ditambahkan.");
  }
  const schoolMode = section === "school";
  return (
    <>
      <section className="card">
        <div className="titleRow">
          <h3>{schoolMode ? "Daftar sekolah" : "Akun sekolah"}</h3>
          <button className="primary" onClick={() => edit({})}>
            <Plus size={16} />
            {schoolMode ? "Tambah sekolah" : "Tambah pengguna"}
          </button>
        </div>
        <div className="directory">
          {(schoolMode ? state.schools : state.users).map((item) => (
            <div key={item.id} className="directoryRow">
              <i>
                {schoolMode ? (
                  item.logo ? (
                    <img src={item.logo} alt="Logo sekolah" />
                  ) : (
                    <School size={22} />
                  )
                ) : (
                  <Users size={22} />
                )}
              </i>
              <div>
                <b>{item.name}</b>
                <small>
                  {schoolMode
                    ? item.active
                      ? "Aktif"
                      : "Nonaktif"
                    : [
                        item.role,
                        item.username,
                        state.schools.find((s) => s.id === item.school)?.name,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                </small>
              </div>
              {schoolMode && <button onClick={() => edit(item)}>Ubah</button>}
            </div>
          ))}
        </div>
      </section>
      {editing && (
        <section className="card">
          <form onSubmit={schoolMode ? saveSchool : saveUser}>
            <h3>{schoolMode ? "Profil sekolah" : "Pengguna baru"}</h3>
            <label>
              Nama {schoolMode ? "sekolah" : "lengkap"}
              <input
                name="name"
                required
                defaultValue={editing.name}
                key={editing.id}
              />
            </label>
            {schoolMode ? (
              <>
                <label>
                  Logo sekolah
                  {editing.logo && <img className="mediaPreview" src={editing.logo} alt="Logo sekolah" />}
                  <input key={editing.id || "new"} name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
                  <small>PNG, JPEG, atau WebP · maksimal 10 MB</small>
                </label>
                <label className="inline">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editing.active ?? true}
                    key={editing.id}
                  />
                  Sekolah aktif
                </label>
              </>
            ) : (
              <>
                <label>
                  Username
                  <input name="username" required pattern="[a-zA-Z0-9._-]+" />
                </label>
                <label>
                  Kata sandi awal
                  <input name="pass" type="password" minLength="6" required />
                </label>
                <label>
                  Peran
                  <select name="role">
                    <option>Admin</option>
                    <option>Guru BK</option>
                  </select>
                </label>
                <label>
                  Sekolah
                  <select name="school" required>
                    {state.schools
                      .filter((s) => s.active)
                      .map((s) => (
                        <option value={s.id} key={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </label>
              </>
            )}
            <div className="buttons">
              <button type="button" onClick={() => edit(null)}>
                Batal
              </button>
              <button className="primary">Simpan</button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
export function Periods({ space, change }) {
  return (
    <section className="card">
      <h3>Periode sekolah</h3>
      {Object.entries(space.periods).map(([id, period]) => (
        <div className="directoryRow" key={id}>
          <div>
            <b>{period.config.period}</b>
            <small>
              {period.config.year} · {period.students.length} siswa
            </small>
          </div>
          {space.active === id ? (
            <span className="badge green">Aktif</span>
          ) : (
            <button onClick={() => change({ ...space, active: id })}>
              Aktifkan
            </button>
          )}
        </div>
      ))}
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget),
            id = crypto.randomUUID(),
            label = f.get("name").trim(),
            year = f.get("year").trim();
          if (!label || !year) return;
          change({
            ...space,
            active: id,
            periods: {
              ...space.periods,
              [id]: emptyPeriod(
                label,
                year,
                space.periods[space.active].config,
              ),
            },
          });
          e.currentTarget.reset();
        }}
      >
        <input
          aria-label="Nama periode baru"
          placeholder="Nama periode baru"
          name="name"
          required
        />
        <input
          aria-label="Tahun ajaran baru"
          placeholder="2027/2028"
          name="year"
          pattern="[0-9]{4}/[0-9]{4}"
          required
        />
        <button className="primary">Tambah dan aktifkan</button>
      </form>
    </section>
  );
}
export function CriteriaEditor({ config, save, notify }) {
  const [c, set] = useState(config);
  function rule(index, patch) {
    set({
      ...c,
      rules: c.rules.map((r, i) => (index === i ? { ...r, ...patch } : r)),
    });
  }
  function submit(e) {
    e.preventDefault();
    if (c.weights.reduce((a, b) => a + b, 0) !== 100)
      return notify("Total bobot harus 100%.");
    if (
      c.rules.some((r) => !r.name.trim()) ||
      new Set(c.rules.map((r) => r.name.trim().toLowerCase())).size !==
        c.rules.length
    )
      return notify("Nama kriteria harus terisi dan unik.");
    for (const r of c.rules) {
      const sorted = [...r.params].sort((a, b) => a.min - b.min);
      if (
        sorted.some(
          (p, i) =>
            !p.name.trim() ||
            p.min > p.max ||
            (i && p.min <= sorted[i - 1].max),
        )
      )
        return notify(
          "Periksa nama dan rentang parameter agar tidak tumpang tindih.",
        );
    }
    save(c);
  }
  return (
    <form className="card" onSubmit={submit}>
      <h3>Kriteria dan kuota</h3>
      <div className="formgrid">
        {[
          ["Nama periode", "period"],
          ["Tahun ajaran", "year"],
        ].map(([l, k]) => (
          <label key={k}>
            {l}
            <input
              required
              value={c[k]}
              onChange={(e) => set({ ...c, [k]: e.target.value })}
            />
          </label>
        ))}
        <label>
          Kuota (%)
          <input
            type="number"
            required
            min="0"
            max="100"
            value={c.quota}
            onChange={(e) => set({ ...c, quota: +e.target.value })}
          />
        </label>
      </div>
      {c.rules.map((r, i) => (
        <section className="rule" key={r.id}>
          <div className="ruleHead">
            <small>{r.id}</small>
            <b>{r.name}</b>
          </div>
          <div className="formgrid">
            <label>
              Nama kriteria
              <input
                required
                value={r.name}
                onChange={(e) => rule(i, { name: e.target.value })}
              />
            </label>
            <label>
              Jenis
              <select
                value={r.type}
                onChange={(e) => rule(i, { type: e.target.value })}
              >
                <option value="benefit">Benefit</option>
                <option value="cost">Cost</option>
              </select>
            </label>
            <label>
              Bobot (%)
              <input
                required
                type="number"
                min="0"
                max="100"
                value={c.weights[i]}
                onChange={(e) =>
                  set({
                    ...c,
                    weights: c.weights.map((n, j) =>
                      j === i ? +e.target.value : n,
                    ),
                  })
                }
              />
            </label>
          </div>
          <details>
            <summary>Parameter konversi ({r.params.length})</summary>
            <p>
              Tanpa parameter, gunakan nilai asli. Jika ada parameter, setiap
              nilai harus masuk ke salah satu rentang.
            </p>
            {r.params.map((p, j) => (
              <div className="params" key={j}>
                {[
                  ["Nama", "name"],
                  ["Minimum", "min"],
                  ["Maksimum", "max"],
                  ["Skor", "score"],
                ].map(([l, k]) => (
                  <label key={k}>
                    {l}
                    <input
                      required
                      type={k === "name" ? "text" : "number"}
                      step="any"
                      min="0"
                      max="100"
                      value={p[k]}
                      onChange={(e) =>
                        rule(i, {
                          params: r.params.map((v, n) =>
                            n === j
                              ? {
                                  ...v,
                                  [k]:
                                    k === "name"
                                      ? e.target.value
                                      : +e.target.value,
                                }
                              : v,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    rule(i, { params: r.params.filter((_, n) => n !== j) })
                  }
                >
                  Hapus
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                rule(i, {
                  params: [
                    ...r.params,
                    { name: "", min: 0, max: 100, score: 100 },
                  ],
                })
              }
            >
              Tambah parameter
            </button>
          </details>
        </section>
      ))}
      <div className="buttons">
        <button
          type="button"
          onClick={() =>
            set({
              ...c,
              rules: [
                ...c.rules,
                {
                  id: "C" + (c.rules.length + 1),
                  name: "",
                  type: "benefit",
                  params: [],
                },
              ],
              weights: [...c.weights, 0],
            })
          }
        >
          Tambah kriteria
        </button>
        <button className="primary">
          Simpan · Total {c.weights.reduce((a, b) => a + b, 0)}%
        </button>
      </div>
    </form>
  );
}
