/**
 * formInput.js — Form Input Harian (Bagian 1–4)
 * All DB calls are async.
 */

const PROBLEMS = [
  { name: 'FB Langkah Jahitan Tidak Standar',                        img: 'img/problems/prob_0.png'  },
  { name: 'FB Bahan Seperti Sobek',                                  img: 'img/problems/prob_1.png'  },
  { name: 'FB Bahan Balap Tidak Standar',                            img: 'img/problems/prob_2.jpg'  },
  { name: 'FB Point Tidak Center',                                   img: 'img/problems/prob_3.png'  },
  { name: 'FB Langkah Jahitan Tidak Standar (Variant)',              img: 'img/problems/prob_4.png'  },
  { name: 'FB Jahitan Keriput',                                      img: 'img/problems/prob_5.png'  },
  { name: 'FB Jahitan Gelombang',                                    img: 'img/problems/prob_6.png'  },
  { name: 'FB Jahitan Tidak Standar (Bablas 1 Langkah)',             img: 'img/problems/prob_7.png'  },
  { name: 'FB Label Tidak Terpasang',                                img: 'img/problems/prob_8.png'  },
  { name: 'FB Part Salah Pasang (Seka Belakang)',                    img: 'img/problems/prob_9.png'  },
  { name: 'FB Ukuran Hook Tidak Standar',                            img: 'img/problems/prob_10.png' },
  { name: 'FB Part Tidak Terpasang (Sus)',                           img: 'img/problems/prob_11.png' },
  { name: 'FB Part Salah Pasang (Seka)',                             img: 'img/problems/prob_12.png' },
  { name: 'FB Jahitan Seka Jebol',                                   img: 'img/problems/prob_13.png' },
  { name: 'FB Part Salah Pasang',                                    img: 'img/problems/prob_14.png' },
  { name: 'FC Part Tidak Terpasang',                                 img: 'img/problems/prob_15.png' },
  { name: 'FC Bahan Terlipat/Terjahit',                              img: 'img/problems/prob_16.png' },
  { name: 'FC Bahan Terlipat (Kamachi Inner)',                       img: 'img/problems/prob_17.png' },
  { name: 'FC Bahan Terlipat (Kamachi Front)',                       img: 'img/problems/prob_18.png' },
  { name: 'FC Jahitan Putus (After Market)',                         img: 'img/problems/prob_19.png' },
  { name: 'FC Suspender Terpasang Terbalik',                         img: 'img/problems/prob_20.png' },
  { name: 'FC Bahan Terjahit',                                       img: 'img/problems/prob_21.png' },
  { name: 'FC Part Tidak Terpasang (G-Hook)',                        img: 'img/problems/prob_22.png' },
  { name: 'FC Jahitan Sutechi Tidak Ada',                            img: 'img/problems/prob_23.png' },
  { name: 'FC Point Tidak Center',                                   img: 'img/problems/prob_24.png' },
  { name: 'FC Part Tidak Terpasang (Resin Button)',                  img: 'img/problems/prob_25.png' },
  { name: 'FC Over Part (Kain Ate)',                                  img: 'img/problems/prob_26.png' },
  { name: 'FC Tenban Side Salah Spec',                               img: 'img/problems/prob_27.png' },
  { name: 'FC Part Tidak Terpasang (G-Hook) Variant',               img: 'img/problems/prob_28.png' },
];

let _tmpFD = {};

/* ── RENDER ──────────────────────────────────────────────── */
function renderForm() {
  setTimeout(_preloadProbImages, 500);
  document.getElementById('app').innerHTML = `
  <form id="frm" onsubmit="return false">

    <div class="card">
      <div class="ch"><span class="sec-lbl s1">Bagian 1</span><h2>Identitas PIC</h2></div>
      <div class="fgrid">
        <div class="fg full">
          <label>Nama PIC <span style="color:#f43f5e">*</span></label>
          <select id="f-pic">
            <option value="">-- Pilih PIC --</option>
            <option value="Febi">Febi</option>
            <option value="Novi">Novi</option>
            <option value="Dina">Dina</option>
            <option value="Rostika">Rostika</option>
            <option value="Maulidia">Maulidia</option>
            <option value="Aditya">Aditya</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="ch"><span class="sec-lbl s2">Bagian 2</span><h2>Data Aktivitas</h2></div>
      <div class="fgrid">
        <div class="fg">
          <label>Tanggal <span style="color:#f43f5e">*</span></label>
          <input type="date" id="f-tgl" value="${todayStr()}">
        </div>
        <div class="fg">
          <label>Line <span style="color:#f43f5e">*</span></label>
          <select id="f-line">
            <option value="">-- Pilih Line --</option>
            <optgroup label="FB Line">
              <option value="FB Line 1">FB Line 1</option>
              <option value="FB Line 2">FB Line 2</option>
              <option value="FB Line 3">FB Line 3</option>
              <option value="FB Line 4">FB Line 4</option>
            </optgroup>
            <optgroup label="FC Line">
              <option value="FC Line 1">FC Line 1</option>
              <option value="FC Line 2">FC Line 2</option>
              <option value="FC Line 3">FC Line 3</option>
              <option value="FC Line 4">FC Line 4</option>
            </optgroup>
          </select>
        </div>
        <div class="fg full">
          <label>Problem / Keterangan <span style="color:#f43f5e">*</span></label>
          <select id="f-prob" onchange="showProbImg(this.value)">
            <option value="">-- Pilih Problem --</option>
            ${PROBLEMS.map((p, i) => `<option value="${p.name}">${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="fg full" id="prob-img-wrap" style="display:none">
          <div class="prob-img-box">
            <img id="prob-img" src="" alt="Problem Image">
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="ch"><span class="sec-lbl s3">Bagian 3</span><h2>Dokumentasi &amp; Temuan</h2></div>
      <div class="fgrid">
        <div class="fg full">
          <label>Foto Activity</label>
          <div class="fwrap" id="fw-act">
            <div class="fi" id="fi-act">📷</div>
            <div class="ft" id="ft-act">
              Klik atau tap untuk pilih foto<br>
              <small style="color:var(--txt3)">JPG / PNG — maks 5 MB</small>
            </div>
            <input type="file" id="f-foto" accept="image/*" capture="environment"
                   onchange="handleImg(this,'prev-act','fi-act','ft-act')">
          </div>
          <img id="prev-act" class="prev" alt="">
        </div>
        <div class="fg full">
          <label>Pilihan Temuan <span style="color:#f43f5e">*</span></label>
          <div class="rgrp">
            <div class="ropt t1"><input type="radio" name="tm" id="t1" value="1">
              <label for="t1"><span class="rdot"></span>1 — Tidak Ada Temuan</label></div>
            <div class="ropt t2"><input type="radio" name="tm" id="t2" value="2">
              <label for="t2"><span class="rdot"></span>2 — CM Tidak Jalan</label></div>
            <div class="ropt t3"><input type="radio" name="tm" id="t3" value="3">
              <label for="t3"><span class="rdot"></span>3 — Tidak Ada Cek</label></div>
          </div>
        </div>
        <div class="fg full">
          <label>Deskripsi Temuan</label>
          <textarea id="f-desk" placeholder="Detail temuan (opsional)..."></textarea>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="ch"><span class="sec-lbl s4">Bagian 4</span><h2>Tindak Lanjut &amp; Perbaikan</h2></div>
      <div class="fgrid">
        <div class="fg">
          <label>Status Perbaikan <span style="color:#f43f5e">*</span></label>
          <select id="f-stat">
            <option value="">-- Pilih Status --</option>
            <option value="Selesai">✅ Selesai</option>
            <option value="Proses">⏳ Proses</option>
            <option value="Belum">❌ Belum</option>
          </select>
        </div>
        <div class="fg">
          <label>PIC Perbaikan</label>
          <input type="text" id="f-pic-prb" placeholder="Nama PIC Perbaikan">
        </div>
        <div class="fg full">
          <label>Deskripsi Perbaikan</label>
          <textarea id="f-desk-prb" placeholder="Jelaskan tindakan perbaikan yang dilakukan..."></textarea>
        </div>
        <div class="fg full">
          <label>Foto Bukti Perbaikan</label>
          <div class="fwrap" id="fw-bkt">
            <div class="fi" id="fi-bkt">🖼️</div>
            <div class="ft" id="ft-bkt">
              Klik atau tap untuk pilih foto bukti<br>
              <small style="color:var(--txt3)">JPG / PNG — maks 5 MB (opsional)</small>
            </div>
            <input type="file" id="f-bukti" accept="image/*" capture="environment"
                   onchange="handleImg(this,'prev-bkt','fi-bkt','ft-bkt')">
          </div>
          <img id="prev-bkt" class="prev" alt="">
        </div>
      </div>
      <div class="faction">
        <button type="button" class="btn btn-g" onclick="resetFrm()">↺ Reset Form</button>
        <button type="button" class="btn btn-p" onclick="previewFrm()">👁 Preview &amp; Submit</button>
      </div>
    </div>
  </form>`;
}

/* ── IMAGE HANDLER ───────────────────────────────────────── */
async function handleImg(input, prevId, fiId, ftId) {
  if (!input.files[0]) return;
  try {
    const compressed  = await compressImg(input.files[0]);
    input._compressed = compressed;
    const prev = document.getElementById(prevId);
    prev.src = compressed; prev.style.display = 'block';
    document.getElementById(fiId).textContent = '✅';
    document.getElementById(ftId).textContent = input.files[0].name;
  } catch { toast('Gagal memproses foto', false); }
}

/* ── PROBLEM IMAGE PREVIEW ───────────────────────────────── */
function showProbImg(val) {
  const wrap = document.getElementById('prob-img-wrap');
  const img  = document.getElementById('prob-img');
  if (!val) { wrap.style.display = 'none'; return; }
  const p = PROBLEMS.find(p => p.name === val);
  if (p) {
    wrap.style.display = 'block';
    img.style.opacity = '0.2';
    img.onload = () => { img.style.opacity = '1'; };
    img.onerror = () => { img.style.opacity = '1'; };
    img.src = p.img;
  } else {
    wrap.style.display = 'none';
  }
}

function _preloadProbImages() {
  PROBLEMS.forEach(p => { const i = new Image(); i.src = p.img; });
}

/* ── COLLECT & VALIDATE ──────────────────────────────────── */
function _getFD() {
  const tmEl  = document.querySelector('input[name="tm"]:checked');
  const foto  = document.getElementById('f-foto');
  const bukti = document.getElementById('f-bukti');
  return {
    pic:   document.getElementById('f-pic').value.trim(),
    tgl:   document.getElementById('f-tgl').value,
    line:  document.getElementById('f-line').value.trim(),
    prob:  document.getElementById('f-prob').value.trim(),
    tm:    tmEl ? tmEl.value : '',
    desk:  document.getElementById('f-desk').value.trim(),
    stat:  document.getElementById('f-stat').value,
    picPrb:  document.getElementById('f-pic-prb').value.trim(),
    deskPrb: document.getElementById('f-desk-prb').value.trim(),
    foto:  foto?._compressed  || '',
    bukti: bukti?._compressed || '',
  };
}

function _validate(d) {
  const e = [];
  if (!d.pic)  e.push('Nama PIC');
  if (!d.tgl)  e.push('Tanggal');
  if (!d.line) e.push('Line');
  if (!d.prob) e.push('Problem');
  if (!d.tm)   e.push('Pilihan Temuan');
  if (!d.stat) e.push('Status Perbaikan');
  return e;
}

/* ── PREVIEW ─────────────────────────────────────────────── */
function previewFrm() {
  const d    = _getFD();
  const errs = _validate(d);
  if (errs.length) { toast('Lengkapi: ' + errs.join(', '), false); return; }

  _tmpFD = d;
  const tc   = parseInt(d.tm);
  const tcol = tc === 1 ? '#34d399' : tc === 2 ? '#fb7185' : '#fbbf24';
  const scol = d.stat === 'Selesai' ? '#34d399' : d.stat === 'Proses' ? '#fbbf24' : '#fb7185';
  const ph   = (src, lbl) => src
    ? `<div class="pph"><div class="ppl">${lbl}</div><img src="${src}" alt=""></div>`
    : `<div class="pph"><div class="ppl">${lbl}</div><div class="noph">Tidak ada foto</div></div>`;

  document.getElementById('preview-body').innerHTML = `
    <div class="pgrid">
      <div class="pi"><div class="pl">Nama PIC</div><div class="pv">${d.pic}</div></div>
      <div class="pi"><div class="pl">Tanggal</div><div class="pv">${fmtD(d.tgl)} (${hari(d.tgl)})</div></div>
      <div class="pi"><div class="pl">Line</div><div class="pv">${d.line}</div></div>
      <div class="pi"><div class="pl">Pilihan Temuan</div>
        <div class="pv" style="color:${tcol};font-weight:700">${d.tm} — ${TM[tc]}</div></div>
      <div class="pi" style="grid-column:1/-1"><div class="pl">Problem</div><div class="pv">${d.prob}</div></div>
      <div class="pi" style="grid-column:1/-1"><div class="pl">Deskripsi</div><div class="pv">${d.desk || '-'}</div></div>
      <div class="pi"><div class="pl">Status Perbaikan</div>
        <div class="pv" style="color:${scol};font-weight:700">${d.stat}</div></div>
      <div class="pi"><div class="pl">PIC Perbaikan</div><div class="pv">${d.picPrb || '-'}</div></div>
      <div class="pi" style="grid-column:1/-1"><div class="pl">Deskripsi Perbaikan</div><div class="pv">${d.deskPrb || '-'}</div></div>
    </div>
    <div class="pphoto">${ph(d.foto,'📷 Foto Activity')}${ph(d.bukti,'🖼️ Foto Bukti')}</div>`;

  document.getElementById('ov-preview').className = 'ov on';
}

/* ── SUBMIT (async) ──────────────────────────────────────── */
async function doSubmit() {
  const d   = _tmpFD;
  const btn = document.querySelector('#ov-preview .btn-s');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Menyimpan...'; }

  try {
    await DB.add({
      pic:             d.pic,
      tanggal:         d.tgl,
      hari:            hari(d.tgl),
      line:            d.line,
      problem:         d.prob,
      fotoActivity:    d.foto,
      pilihanTemuan:   parseInt(d.tm),
      deskripsi:       d.desk,
      statusPerbaikan:   d.stat,
      fotoBukti:         d.bukti,
      picPerbaikan:      d.picPrb,
      deskripsiPerbaikan: d.deskPrb,
    });
    if (btn) { btn.disabled = false; btn.innerHTML = '✓ Inject Data'; }
    closeOv('ov-preview');
    toast('Data tersimpan ke cloud ☁️');
    resetFrm();
    refreshStatus();
  } catch (err) {
    toast('Gagal menyimpan: ' + err.message, false);
    if (btn) { btn.disabled = false; btn.innerHTML = '✓ Inject Data'; }
  }
}

/* ── RESET ───────────────────────────────────────────────── */
function resetFrm() {
  const frm = document.getElementById('frm');
  if (!frm) return;
  frm.reset();
  document.getElementById('f-tgl').value = todayStr();
  [
    ['prev-act','fi-act','ft-act','📷','Klik atau tap untuk pilih foto','JPG / PNG — maks 5 MB'],
    ['prev-bkt','fi-bkt','ft-bkt','🖼️','Klik atau tap untuk pilih foto bukti','JPG / PNG — maks 5 MB (opsional)'],
  ].forEach(([pid,fiid,ftid,icon,l1,l2]) => {
    const p = document.getElementById(pid); if (p) p.style.display = 'none';
    const fi = document.getElementById(fiid); if (fi) fi.textContent = icon;
    const ft = document.getElementById(ftid);
    if (ft) ft.innerHTML = `${l1}<br><small style="color:var(--txt3)">${l2}</small>`;
  });
  const foto  = document.getElementById('f-foto');
  const bukti = document.getElementById('f-bukti');
  if (foto)  foto._compressed  = '';
  if (bukti) bukti._compressed = '';
  const probWrap = document.getElementById('prob-img-wrap');
  if (probWrap) probWrap.style.display = 'none';
}
