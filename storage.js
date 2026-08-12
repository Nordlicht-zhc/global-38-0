(() => {
  "use strict";

  const memory = {};
  let dbPromise = null;

  function openDatabase() {
    if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB unavailable"));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("g38-storage", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  function persist(key, value) {
    openDatabase()
      .then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").put(value, key);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      }))
      .catch(() => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // IndexedDB remains the primary store when localStorage is full.
        }
      });
  }

  async function load(legacyKeys = []) {
    try {
      const db = await openDatabase();
      const tx = db.transaction("kv", "readonly");
      const store = tx.objectStore("kv");
      const keysRequest = store.getAllKeys();
      const valuesRequest = store.getAll();
      const keys = await new Promise((resolve, reject) => {
        keysRequest.onsuccess = () => resolve(keysRequest.result || []);
        keysRequest.onerror = () => reject(keysRequest.error);
      });
      const values = await new Promise((resolve, reject) => {
        valuesRequest.onsuccess = () => resolve(valuesRequest.result || []);
        valuesRequest.onerror = () => reject(valuesRequest.error);
      });
      keys.forEach((key, index) => {
        if (index < values.length) memory[key] = values[index];
      });
    } catch {
      // Fall through to legacy localStorage migration.
    }
    for (const key of legacyKeys) {
      if (key in memory) continue;
      try {
        const value = localStorage.getItem(key);
        if (value) memory[key] = JSON.parse(value);
      } catch {
        // Ignore missing or corrupt legacy entries.
      }
    }
  }

  function get(key) {
    return key in memory ? memory[key] : null;
  }

  function set(key, value) {
    memory[key] = value;
    persist(key, value);
    return true;
  }

  window.G38Storage = { load, get, set };
})();
