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
  rows.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

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
    r.id, r.pic, r.tanggal, r.hari, r.line,
    esc(r.problem), `${r.pilihanTemuan} - ${TM[r.pilihanTemuan]}`,
    esc(r.deskripsi), r.statusPerbaikan,
    r.picPerbaikan || '', esc(r.deskripsiPerbaikan), r.approved ? 'Ya' : 'Tidak',
  ].join(','));

  const csv  = [HDR.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a    = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `wna_${rfTahun || 'all'}.csv`,
  });
  a.click(); URL.revokeObjectURL(a.href);
}
