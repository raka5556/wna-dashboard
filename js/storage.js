/**
 * storage.js — Cloud API client (replaces localStorage)
 *
 * All methods are async (return Promise).
 * Data lives in data/db.json on the server — survives browser clear.
 */

const DB = {
  BASE: '/api',

  _cache: null,
  _cacheTs: 0,
  _cacheTTL: 30_000,

  _invalidate() {
    this._cache = null;
    this._cacheTs = 0;
  },

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

  /** Return all records (array), cached for 30 s. */
  async all() {
    if (this._cache && Date.now() - this._cacheTs < this._cacheTTL) {
      return this._cache;
    }
    this._cache = await this._fetch('/records');
    this._cacheTs = Date.now();
    return this._cache;
  },

  /** Add a record. Returns the saved record with server-assigned ID. */
  async add(record) {
    const result = await this._fetch('/records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    this._invalidate();
    return result;
  },

  /** Partially update a record by ID. */
  async upd(id, updates) {
    const result = await this._fetch('/records/' + encodeURIComponent(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    this._invalidate();
    return result;
  },

  /** Delete a record by ID. */
  async del(id) {
    const result = await this._fetch('/records/' + encodeURIComponent(id), { method: 'DELETE' });
    this._invalidate();
    return result;
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
  async restore(dbObject) {
    const result = await this._fetch('/restore', {
      method: 'POST',
      body: JSON.stringify(dbObject),
    });
    this._invalidate();
    return result;
  },
};
