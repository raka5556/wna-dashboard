/**
 * dashboard.js — Dashboard Monitoring + Top Problem (async cloud version)
 */

let dyear = new Date().getFullYear();

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */
async function renderDash() {
  pageLoader('Memuat dashboard...');
  let all;
  try { all = await DB.all(); }
  catch (err) { showError(err.message, 'dashboard'); return; }

  const yd    = all.filter(r => r.tanggal.startsWith(String(dyear)));
  const total = yd.length;
  const t1    = yd.filter(r => r.pilihanTemuan   === 1).length;
  const t2    = yd.filter(r => r.pilihanTemuan   === 2).length;
  const t3    = yd.filter(r => r.pilihanTemuan   === 3).length;
  const sel   = yd.filter(r => r.statusPerbaikan === 'Selesai').length;
  const pro   = yd.filter(r => r.statusPerbaikan === 'Proses').length;
  const bel   = yd.filter(r => r.statusPerbaikan === 'Belum').length;
  const pct   = total ? Math.round(sel / total * 100) : 0;
  const lines = [...new Set(all.map(r => r.line))].sort();
  const ms    = _buildMonthStats(yd);
  const allYrs= [...new Set(all.map(r => r.tanggal.split('-')[0]))].sort();

  const yOpts = [2024,2025,2026,2027].map(y =>
    `<option value="${y}"${y==dyear?' selected':''}>${y}</option>`).join('');

  document.getElementById('app').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
      <h2 style="font-size:16px;font-weight:600">📊 Dashboard Monitoring</h2>
      <select onchange="dyear=parseInt(this.value);renderDash()" style="width:auto">${yOpts}</select>
      <span class="cloud-tag">☁️ Cloud — ${all.length} total record</span>
    </div>

    <div class="kgrid">
      <div class="kcard kb"><div class="ki">📊</div><div class="kv">${total}</div><div class="kl">Total Aktivitas ${dyear}</div></div>
      <div class="kcard kg"><div class="ki">✅</div><div class="kv">${t1}</div><div class="kl">Tidak Ada Temuan</div></div>
      <div class="kcard kr"><div class="ki">🔧</div><div class="kv">${t2}</div><div class="kl">CM Tidak Jalan</div></div>
      <div class="kcard ky"><div class="ki">⚠️</div><div class="kv">${t3}</div><div class="kl">Tidak Ada Cek</div></div>
      <div class="kcard kp"><div class="ki">🏁</div><div class="kv">${sel}</div><div class="kl">Selesai Diperbaiki</div></div>
      <div class="kcard kt"><div class="ki">📈</div><div class="kv">${pct}%</div><div class="kl">% Penyelesaian</div></div>
    </div>

    <div class="dgrid">
      <div class="card">
        <div class="ch"><h2>📅 Laporan Bulanan ${dyear}</h2></div>
        <div class="twrap"><table>
          <thead><tr><th>Bulan</th><th>Total</th><th>Tdk Temuan</th><th>CM Tdk Jln</th>
            <th>Tdk Cek</th><th>Selesai</th><th>Proses</th><th>Belum</th><th>%</th></tr></thead>
          <tbody>${_monthRows(ms)}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="ch"><h2>🏭 Status per Line ${dyear}</h2></div>
        <div class="twrap"><table>
          <thead><tr><th>Line</th><th>Total</th><th>Selesai</th><th>Proses</th><th>Belum</th><th>Progress</th></tr></thead>
          <tbody>${_lineRows(lines, yd)}</tbody>
        </table></div>
      </div>
    </div>

    <div class="card">
      <div class="ch"><h2>📆 Ringkasan Tahunan</h2></div>
      <div class="twrap"><table>
        <thead><tr><th>Tahun</th><th>Total</th><th>Tdk Temuan</th><th>CM Tdk Jln</th>
          <th>Tdk Cek</th><th>Selesai</th><th>% Selesai</th></tr></thead>
        <tbody>${_annualRows(all, allYrs)}</tbody>
      </table></div>
    </div>

    <div class="cgrid">
      <div class="cwrap"><div class="ctitle">📊 Aktivitas Bulanan ${dyear}</div><canvas id="ch-month"></canvas></div>
      <div class="cwrap"><div class="ctitle">📉 Distribusi Temuan &amp; Status ${dyear}</div><canvas id="ch-status"></canvas></div>
    </div>`;

  requestAnimationFrame(() => {
    createMonthlyChart('ch-month', ms);
    createStatusChart('ch-status', yd);
  });
}

/* ── Helpers ─────────────────────────────────────────────── */
function _buildMonthStats(yd) {
  return Array.from({ length: 12 }, (_, i) => {
    const m  = pad(i + 1);
    const md = yd.filter(r => r.tanggal.split('-')[1] === m);
    return {
      lbl: MONTHS[i].substring(0, 3), m: i + 1, tot: md.length,
      t1: md.filter(r => r.pilihanTemuan === 1).length,
      t2: md.filter(r => r.pilihanTemuan === 2).length,
      t3: md.filter(r => r.pilihanTemuan === 3).length,
      sel: md.filter(r => r.statusPerbaikan === 'Selesai').length,
      pro: md.filter(r => r.statusPerbaikan === 'Proses').length,
      bel: md.filter(r => r.statusPerbaikan === 'Belum').length,
    };
  });
}

function _monthRows(ms) {
  const active = ms.filter(m => m.tot > 0);
  if (!active.length) return `<tr><td colspan="9"><div class="empty"><div class="ei">📅</div>Belum ada data</div></td></tr>`;
  return active.map(m => `<tr>
    <td>${MONTHS[m.m-1]}</td><td><strong>${m.tot}</strong></td>
    <td><span class="tb tb1">${m.t1}</span></td><td><span class="tb tb2">${m.t2}</span></td>
    <td><span class="tb tb3">${m.t3}</span></td><td><span class="sb ss">${m.sel}</span></td>
    <td><span class="sb sp">${m.pro}</span></td><td><span class="sb sbl">${m.bel}</span></td>
    <td>${m.tot ? Math.round(m.sel/m.tot*100) : 0}%</td>
  </tr>`).join('');
}

function _lineRows(lines, yd) {
  if (!lines.length) return `<tr><td colspan="6"><div class="empty"><div class="ei">🏭</div>Belum ada data</div></td></tr>`;
  return lines.map(l => {
    const ld = yd.filter(r => r.line === l);
    const ls = ld.filter(r => r.statusPerbaikan === 'Selesai').length;
    const lp = ld.filter(r => r.statusPerbaikan === 'Proses').length;
    const lb = ld.filter(r => r.statusPerbaikan === 'Belum').length;
    const p  = ld.length ? Math.round(ls/ld.length*100) : 0;
    return `<tr>
      <td><strong>${l}</strong></td><td>${ld.length}</td>
      <td><span class="sb ss">${ls}</span></td><td><span class="sb sp">${lp}</span></td>
      <td><span class="sb sbl">${lb}</span></td>
      <td><div style="display:flex;align-items:center;gap:7px">
        <div class="pbar" style="width:80px"><div class="pfill" style="width:${p}%"></div></div>
        <span style="font-size:12px;font-weight:700;color:var(--grn)">${p}%</span>
      </div></td>
    </tr>`;
  }).join('');
}

function _annualRows(all, years) {
  if (!years.length) return `<tr><td colspan="7"><div class="empty"><div class="ei">📊</div>Belum ada data</div></td></tr>`;
  return years.map(y => {
    const yd = all.filter(r => r.tanggal.startsWith(y));
    const s  = yd.filter(r => r.statusPerbaikan === 'Selesai').length;
    return `<tr>
      <td><strong>${y}</strong></td><td>${yd.length}</td>
      <td><span class="tb tb1">${yd.filter(r=>r.pilihanTemuan===1).length}</span></td>
      <td><span class="tb tb2">${yd.filter(r=>r.pilihanTemuan===2).length}</span></td>
      <td><span class="tb tb3">${yd.filter(r=>r.pilihanTemuan===3).length}</span></td>
      <td><span class="sb ss">${s}</span></td>
      <td>${yd.length ? Math.round(s/yd.length*100) : 0}%</td>
    </tr>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   TOP PROBLEM
   ═══════════════════════════════════════════════════════════ */
async function renderTop() {
  pageLoader('Menganalisis top problem...');
  let data;
  try { data = await DB.all(); }
  catch (err) { showError(err.message, 'top'); return; }

  const filtered = data.filter(r => r.pilihanTemuan === 2 || r.pilihanTemuan === 3);
  const freq   = {};
  filtered.forEach(r => {
    const k = r.pilihanTemuan + '||' + r.problem;
    if (!freq[k]) freq[k] = { prob: r.problem, tm: r.pilihanTemuan, cnt: 0 };
    freq[k].cnt++;
  });
  const sorted = Object.values(freq).sort((a, b) => b.cnt - a.cnt);
  const total  = filtered.length;

  const tbody = sorted.length
    ? sorted.map((it, i) => _topRow(it, i, total)).join('')
    : `<tr><td colspan="5"><div class="empty"><div class="ei">🔍</div>Belum ada data problem</div></td></tr>`;

  document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="ch">
        <h2>🔍 Top Problem Analysis</h2>
        <span class="badge">${sorted.length} Jenis Problem</span>
        <span class="cloud-tag">☁️ ${total} temuan (CM Tdk Jalan &amp; Tdk Ada Cek)</span>
      </div>
      <div class="twrap"><table>
        <thead><tr><th>#</th><th>Problem</th><th>Jenis Temuan</th><th>Frekuensi</th><th>Persentase</th></tr></thead>
        <tbody>${tbody}</tbody>
      </table></div>
    </div>
    <div class="cwrap" style="margin-top:18px">
      <div class="ctitle">📊 Frekuensi Problem — Top 10</div>
      <canvas id="ch-prob"></canvas>
    </div>`;

  requestAnimationFrame(() => createProblemChart('ch-prob', sorted.slice(0, 10), total));
}

function _topRow(it, i, total) {
  const pct   = total ? Math.round(it.cnt / total * 100) : 0;
  const color = it.tm === 1 ? 'var(--grn)' : it.tm === 2 ? 'var(--red)' : 'var(--yel)';
  return `<tr>
    <td><strong>${i+1}</strong></td>
    <td style="max-width:240px;white-space:normal;min-width:130px">${it.prob}</td>
    <td><span class="tb ${TC[it.tm]}">${it.tm} — ${TM[it.tm]}</span></td>
    <td><strong style="font-size:16px">${it.cnt}</strong></td>
    <td><div style="display:flex;align-items:center;gap:7px">
      <div class="pbar" style="width:80px">
        <div class="pfill" style="width:${pct}%;background:${color}"></div>
      </div>
      <span style="font-size:12px;font-weight:600">${pct}%</span>
    </div></td>
  </tr>`;
}
