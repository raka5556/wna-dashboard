/**
 * chartHelper.js — Chart.js v4 wrappers (vivid colorful dark theme)
 * Requires Chart.js loaded before this file.
 */

/* ── Global Chart.js dark-theme defaults ─────────────────── */
Chart.defaults.color          = '#94a3b8';
Chart.defaults.borderColor    = 'rgba(36, 62, 106, 0.6)';
Chart.defaults.font.family    = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size      = 12;
Chart.defaults.animation.duration = 700;
Chart.defaults.animation.easing   = 'easeOutQuart';

/* Chart instance registry (prevents canvas leak) */
const _charts = {};
function _kill(id) {
  if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
}

/* Shared dark grid axis */
function _axis(opts = {}) {
  return {
    grid:  { color: 'rgba(36,62,106,.55)', drawTicks: false },
    ticks: { color: '#64748b', padding: 6, ...opts },
    beginAtZero: true,
  };
}

/* ── Vivid palette ───────────────────────────────────────── */
const PALETTE = {
  blue:   { solid: '#3b82f6', glow: 'rgba(59,130,246,.3)'  },
  green:  { solid: '#10b981', glow: 'rgba(16,185,129,.3)'  },
  red:    { solid: '#f43f5e', glow: 'rgba(244,63,94,.3)'   },
  yellow: { solid: '#f59e0b', glow: 'rgba(245,158,11,.3)'  },
  purple: { solid: '#8b5cf6', glow: 'rgba(139,92,246,.3)'  },
  teal:   { solid: '#06b6d4', glow: 'rgba(6,182,212,.3)'   },
  pink:   { solid: '#ec4899', glow: 'rgba(236,72,153,.3)'  },
  orange: { solid: '#f97316', glow: 'rgba(249,115,22,.3)'  },
};

/* ── 1. Monthly stacked bar (per-temuan breakdown) ───────── */
/**
 * @param {string} canvasId
 * @param {Array}  stats  [{lbl, tot, t1, t2, t3, sel, pro, bel}] × 12
 */
function createMonthlyChart(canvasId, stats) {
  _kill(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  _charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: stats.map(s => s.lbl),
      datasets: [
        {
          label: '✅ Tidak Ada Temuan',
          data:  stats.map(s => s.t1),
          backgroundColor: 'rgba(16,185,129,.8)',
          borderColor:     '#10b981',
          borderWidth: 1, borderRadius: 4, stack: 'a',
        },
        {
          label: '🔧 CM Tidak Jalan',
          data:  stats.map(s => s.t2),
          backgroundColor: 'rgba(244,63,94,.8)',
          borderColor:     '#f43f5e',
          borderWidth: 1, borderRadius: 4, stack: 'a',
        },
        {
          label: '⚠️ Tidak Ada Cek',
          data:  stats.map(s => s.t3),
          backgroundColor: 'rgba(245,158,11,.8)',
          borderColor:     '#f59e0b',
          borderWidth: 1, borderRadius: 4, stack: 'a',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true, position: 'top',
          labels: { boxWidth: 11, padding: 14, color: '#94a3b8', font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: 'rgba(10,20,40,.92)',
          borderColor: 'rgba(59,130,246,.4)', borderWidth: 1,
          titleColor: '#e2e8f0', bodyColor: '#94a3b8',
          padding: 10,
          callbacks: {
            footer: items => 'Total: ' + items.reduce((s, i) => s + i.parsed.y, 0),
          },
        },
      },
      scales: {
        x: _axis(),
        y: { ..._axis({ stepSize: 1 }), stacked: true },
      },
    },
  });
}

/* ── 2. Status & temuan horizontal bars ──────────────────── */
/**
 * @param {string} canvasId
 * @param {Array}  yearData  — filtered records array
 */
function createStatusChart(canvasId, yearData) {
  _kill(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const items = [
    { label: '✅ Tidak Ada Temuan', v: yearData.filter(r => r.pilihanTemuan   === 1).length,         c: PALETTE.green  },
    { label: '🔧 CM Tidak Jalan',   v: yearData.filter(r => r.pilihanTemuan   === 2).length,         c: PALETTE.red    },
    { label: '⚠️ Tidak Ada Cek',    v: yearData.filter(r => r.pilihanTemuan   === 3).length,         c: PALETTE.yellow },
    { label: '🏁 Selesai',          v: yearData.filter(r => r.statusPerbaikan === 'Selesai').length,  c: PALETTE.teal   },
    { label: '⏳ Proses',           v: yearData.filter(r => r.statusPerbaikan === 'Proses').length,   c: PALETTE.purple },
    { label: '❌ Belum',            v: yearData.filter(r => r.statusPerbaikan === 'Belum').length,    c: PALETTE.pink   },
  ];

  _charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        data:            items.map(i => i.v),
        backgroundColor: items.map(i => i.c.solid + 'bb'),
        borderColor:     items.map(i => i.c.solid),
        borderWidth: 1, borderRadius: 5,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10,20,40,.92)',
          borderColor: 'rgba(139,92,246,.4)', borderWidth: 1,
          titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 10,
        },
      },
      scales: {
        x: _axis({ stepSize: 1 }),
        y: _axis(),
      },
    },
  });
}

/* ── 3. Top-problem horizontal bar chart ─────────────────── */
/**
 * @param {string} canvasId
 * @param {Array}  items   [{prob, tm, cnt}]  (top N, sorted desc)
 * @param {number} total   grand total records
 */
function createProblemChart(canvasId, items, total) {
  _kill(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const COLOR_BY_TM = { 1: PALETTE.green, 2: PALETTE.red, 3: PALETTE.yellow };
  const shorten = s => s.length > 30 ? s.substring(0, 30) + '…' : s;

  _charts[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: items.map(i => shorten(i.prob)),
      datasets: [{
        data:            items.map(i => i.cnt),
        backgroundColor: items.map(i => (COLOR_BY_TM[i.tm] || PALETTE.blue).solid + 'bb'),
        borderColor:     items.map(i => (COLOR_BY_TM[i.tm] || PALETTE.blue).solid),
        borderWidth: 1, borderRadius: 5,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(10,20,40,.92)',
          borderColor: 'rgba(249,115,22,.4)', borderWidth: 1,
          titleColor: '#e2e8f0', bodyColor: '#94a3b8', padding: 10,
          callbacks: {
            label: item => {
              const pct = total ? Math.round(item.parsed.x / total * 100) : 0;
              return `  ${item.parsed.x} kali  (${pct}% dari total)`;
            },
          },
        },
      },
      scales: {
        x: _axis({ stepSize: 1 }),
        y: { ..._axis(), ticks: { color: '#94a3b8', font: { size: 11 }, padding: 6 } },
      },
    },
  });
}
