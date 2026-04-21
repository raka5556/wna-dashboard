/**
 * storage.js — Cloud API client (replaces localStorage)
 *
 * All methods are async (return Promise).
 * Data lives in data/db.json on the server — survives browser clear.
 */

const DB = {
  BASE: '/api',

  /* Fetch helper with error unwrapping */
  async _fetch(path, opts = {}) {
    const res = await fetch(this.BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /** Return all records (array). */
  all() {
    return this._fetch('/records');
  },

  /** Add a record. Returns the saved record with server-assigned ID. */
  add(record) {
    return this._fetch('/records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },

  /** Partially update a record by ID. */
  upd(id, updates) {
    return this._fetch('/records/' + encodeURIComponent(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /** Delete a record by ID. */
  del(id) {
    return this._fetch('/records/' + encodeURIComponent(id), { method: 'DELETE' });
  },

  /** Filter by year and optionally month (client-side after full fetch). */
  async byYearMonth(year, month = '') {
    const all = await this.all();
    return all.filter(r => {
      const [y, m] = r.tanggal.split('-');
      if (year  && y !== String(year))                        return false;
      if (month && m !== String(month).padStart(2, '0'))      return false;
      return true;
    });
  },

  /** Health-check: returns { ok, count, ts } or throws. */
  status() {
    return this._fetch('/status');
  },

  /** Download full database as JSON file. */
  downloadBackup() {
    window.location.href = '/api/backup';
  },

  /** Restore database from a parsed JSON object. */
  restore(dbObject) {
    return this._fetch('/restore', {
      method: 'POST',
      body: JSON.stringify(dbObject),
    });
  },
};
