/**
 * rekapData.js — Rekap Data Aktivitas (async cloud version)
 */

let rfBulan = '';
let rfTahun = new Date().getFullYear();

/* ── RENDER ──────────────────────────────────────────────── */
async function renderRekap() {
  pageLoader('Memuat rekap data dari server...');
  let rows;
  try {
    rows = await DB.byYearMonth(rfTahun, rfBulan);
  } catch (err) {
    showError(err.message, 'rekap'); return;
  }
  rows.sort((a, b) => {
    const n = s => parseInt(s.replace(/\D/g, '')) || 0;
    return n(a.id) - n(b.id);
  });

  const YEARS = [2024, 2025, 2026, 2027];
  const yOpts = YEARS.map(y =>
    `<option value="${y}"${y == rfTahun ? ' selected' : ''}>${y}</option>`).join('');
  const mOpts = `<option value="">Semua Bulan</option>` +
    MONTHS.map((m, i) =>
      `<option value="${i+1}"${(i+1) == rfBulan ? ' selected' : ''}>${m}</option>`).join('');

  const tbody = rows.length
    ? rows.map(r => _row(r)).join('')
    : `<tr><td colspan="16"><div class="empty"><div class="ei">📭</div>Belum ada data untuk filter ini</div></td></tr>`;

  document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="ch">
        <h2>📋 Rekap Data Aktivitas</h2>
        <span class="badge">${rows.length} Record</span>
        <span class="cloud-tag">☁️ Cloud</span>
      </div>
      <div class="fbar">
        <select onchange="rfBulan=this.value;renderRekap()">${mOpts}</select>
        <select onchange="rfTahun=parseInt(this.value);renderRekap()">${yOpts}</select>
        <button class="btn btn-g btn-sm" onclick="rfBulan='';renderRekap()">↺ Reset</button>
        <div style="flex:1"></div>
        <button class="btn btn-g btn-sm" onclick="exportCSV()">📥 CSV</button>
        <button class="btn btn-g btn-sm" onclick="exportPDF()">🖨️ PDF</button>
        <button class="btn btn-g btn-sm" onclick="DB.downloadBackup()" title="Download backup JSON">☁️ Backup</button>
        <button class="btn btn-g btn-sm" onclick="openRestore()" title="Restore dari file backup">📂 Restore</button>
      </div>
      <input type="file" id="restore-file" accept=".json" style="display:none" onchange="doRestore(this)">
      <div class="twrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Problem</th><th>Foto Problem</th><th>Foto Activity</th><th>PIC</th>
            <th>Tanggal</th><th>Hari</th><th>Line</th>
            <th>Pilihan Temuan</th><th>Deskripsi</th><th>Status</th>
            <th>Foto Bukti</th><th>PIC Perbaikan</th><th>Deskripsi Perbaikan</th>
            <th>Approval</th><th>Aksi</th>
          </tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>
    </div>`;
}

function _row(r) {
  const probEntry = PROBLEMS.find(p => p.name === r.problem);
  const fotoProblem = probEntry
    ? `<img class="pt" src="${probEntry.img}" onclick="lightbox(this.src)">`
    : `<div class="np">🖼️</div>`;
  const foto  = r.fotoActivity
    ? `<img class="pt" src="${r.fotoActivity}" onclick="lightbox(this.src)">`
    : `<div class="np">📷</div>`;
  const bukti = r.fotoBukti
    ? `<img class="pt" src="${r.fotoBukti}" onclick="lightbox(this.src)">`
    : `<div class="np">🖼️</div>`;
  return `
    <tr class="rt${r.pilihanTemuan}">
      <td><strong>${r.id}</strong></td>
      <td style="max-width:160px;white-space:normal;min-width:110px">${r.problem}</td>
      <td>${fotoProblem}</td>
      <td>${foto}</td>
      <td>${r.pic}</td>
      <td style="white-space:nowrap">${fmtD(r.tanggal)}</td>
      <td>${r.hari}</td>
      <td>${r.line}</td>
      <td><span class="tb ${TC[r.pilihanTemuan]}">${r.pilihanTemuan} — ${TM_SHORT[r.pilihanTemuan]}</span></td>
      <td style="max-width:140px;white-space:normal;min-width:90px">${r.deskripsi || '-'}</td>
      <td><span class="sb ${SC[r.statusPerbaikan]}">${r.statusPerbaikan}</span></td>
      <td>${bukti}</td>
      <td>${r.picPerbaikan       || '-'}</td>
      <td style="max-width:160px;white-space:normal;min-width:100px">${r.deskripsiPerbaikan || '-'}</td>
      <td class="approval-cell">
        ${r.approved
          ? `<img src="img/Approved_Foreman.png" class="approval-stamp" title="Klik untuk batalkan" onclick="toggleApproval('${r.id}',false,this)">`
          : `<button class="btn-approve" onclick="toggleApproval('${r.id}',true,this)">Setujui</button>`
        }
      </td>
      <td><button class="btn btn-d btn-sm" onclick="delRec('${r.id}')">🗑</button></td>
    </tr>`;
}

/* ── ACTIONS ─────────────────────────────────────────────── */
async function toggleApproval(id, val, el) {
  try {
    await DB.upd(id, { approved: val });
    // Update sel langsung tanpa reload tabel
    const cell = el.closest('td');
    cell.innerHTML = val
      ? `<img src="img/Approved_Foreman.png" class="approval-stamp" title="Klik untuk batalkan" onclick="toggleApproval('${id}',false,this)">`
      : `<button class="btn-approve" onclick="toggleApproval('${id}',true,this)">Setujui</button>`;
    toast(val ? '✔ Disetujui' : 'Dibatalkan', val);
    refreshStatus();
  } catch (err) { toast(err.message, false); }
}

async function delRec(id) {
  if (!confirm(`Hapus record ${id}?\nData akan dihapus dari server.`)) return;
  try {
    await DB.del(id);
    toast('Record dihapus', false);
    refreshStatus();
    renderRekap();
  } catch (err) { toast(err.message, false); }
}

/* ── BACKUP / RESTORE ────────────────────────────────────── */
function openRestore() {
  document.getElementById('restore-file').click();
}

async function doRestore(input) {
  if (!input.files[0]) return;
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.records) throw new Error('Format file tidak valid');
      if (!confirm(`Restore ${data.records.length} record ke server?\nData saat ini akan digantikan.`)) return;
      const r = await DB.restore(data);
      toast(`✅ ${r.count} record berhasil di-restore ke server!`);
      refreshStatus();
      renderRekap();
    } catch (err) { toast('Restore gagal: ' + err.message, false); }
    input.value = '';
  };
  reader.readAsText(input.files[0]);
}

/* ── CSV EXPORT ──────────────────────────────────────────── */
async function exportCSV() {
  let data;
  try { data = await DB.all(); }
  catch (err) { toast(err.message, false); return; }
  if (!data.length) { toast('Tidak ada data', false); return; }

  const esc  = s => '"' + String(s || '').replace(/"/g, '""') + '"';
  const HDR  = ['ID','PIC','Tanggal','Hari','Line','Problem','Pilihan Temuan',
                'Deskripsi','Status Perbaikan','PIC Perbaikan','Deskripsi Perbaikan','Approved'];
  const rows = data.map(r => [
    esc(r.id), esc(r.pic), esc(r.tanggal), esc(r.hari), esc(r.line),
    esc(r.problem), esc(`${r.pilihanTemuan} - ${TM[r.pilihanTemuan]}`),
    esc(r.deskripsi), esc(r.statusPerbaikan),
    esc(r.picPerbaikan || ''), esc(r.deskripsiPerbaikan), esc(r.approved ? 'Ya' : 'Tidak'),
  ].join(','));

  const csv  = ['sep=,', HDR.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a    = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `wna_${rfTahun || 'all'}.csv`,
  });
  a.click(); URL.revokeObjectURL(a.href);
}

/* ── PDF EXPORT ──────────────────────────────────────────── */
async function exportPDF() {
  let data;
  try { data = await DB.byYearMonth(rfTahun, rfBulan); }
  catch (err) { toast(err.message, false); return; }
  if (!data.length) { toast('Tidak ada data', false); return; }
  data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const period = rfBulan ? `${MONTHS[rfBulan - 1]} ${rfTahun}` : `Tahun ${rfTahun}`;

  const rows = data.map(r => {
    const probEntry = PROBLEMS.find(p => p.name === r.problem);
    const fotoP  = probEntry ? `<img src="${probEntry.img}">` : '-';
    const fotoA  = r.fotoActivity ? `<img src="${r.fotoActivity}">` : '-';
    const fotoB  = r.fotoBukti    ? `<img src="${r.fotoBukti}">` : '-';
    const status = { Selesai: '✅ Selesai', Proses: '🔧 Proses', Belum: '❌ Belum' }[r.statusPerbaikan] || r.statusPerbaikan;
    const temuan = { 1: 'Tdk Temuan', 2: 'CM Tdk Jalan', 3: 'Tdk Ada Cek' }[r.pilihanTemuan] || r.pilihanTemuan;
    return `<tr>
      <td>${r.id}</td>
      <td>${r.pic}</td>
      <td>${fmtD(r.tanggal)}</td>
      <td>${r.line}</td>
      <td>${r.problem}</td>
      <td class="img-cell">${fotoP}</td>
      <td class="img-cell">${fotoA}</td>
      <td>${temuan}</td>
      <td>${r.deskripsi || '-'}</td>
      <td>${status}</td>
      <td>${r.picPerbaikan || '-'}</td>
      <td>${r.deskripsiPerbaikan || '-'}</td>
      <td class="img-cell">${fotoB}</td>
      <td>${r.approved ? '✅ Ya' : '-'}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head>
  <meta charset="utf-8">
  <title>Rekap WNA — ${period}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 9px; color: #111; padding: 12px; }
    h1 { font-size: 13px; margin-bottom: 4px; }
    p  { font-size: 9px; color: #555; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px 5px; vertical-align: middle; }
    th { background: #1e3a5f; color: #fff; font-size: 8.5px; text-align: center; }
    tr:nth-child(even) { background: #f5f7fa; }
    .img-cell { text-align: center; width: 60px; }
    .img-cell img { max-width: 56px; max-height: 56px; object-fit: cover; border-radius: 3px; }
    @media print {
      @page { size: A3 landscape; margin: 10mm; }
      body { padding: 0; }
    }
  </style>
  </head><body>
  <h1>📋 Rekap Data Aktivitas — ${period}</h1>
  <p>Dicetak: ${new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} &nbsp;|&nbsp; ${data.length} record</p>
  <table>
    <thead><tr>
      <th>ID</th><th>PIC</th><th>Tanggal</th><th>Line</th><th>Problem</th>
      <th>Foto Prob.</th><th>Foto Aktv.</th><th>Temuan</th><th>Deskripsi</th>
      <th>Status</th><th>PIC Prb.</th><th>Desk. Perbaikan</th><th>Foto Bukti</th><th>Approved</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload = () => { window.print(); }<\/script>
  </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}
