/**
 * Database Configuration and Initialization
 * ==========================================
 *
 * Uses JSON file-based storage for parsing results.
 * Simple, cross-platform, no dependencies on SQLite or C++ build tools.
 */

const fs = require("fs-extra");
const path = require("path");

const DB_DIR = path.join(__dirname, "../../", "data");
const DB_FILE = path.join(DB_DIR, "resume_parser.json");
const DB_LOCK_FILE = path.join(DB_DIR, ".db.lock");

// In-memory cache
let db = {
  resumes: {},
  jobs: {},
};

// Simple lock mechanism to prevent concurrent writes
let writeInProgress = false;
const writeQueue = [];

/**
 * Initialize database
 * @returns {Promise<void>}
 */
async function initDatabase() {
  try {
    await fs.ensureDir(DB_DIR);

    if (await fs.pathExists(DB_FILE)) {
      const content = await fs.readFile(DB_FILE, "utf-8");
      db = JSON.parse(content);
    } else {
      await saveDatabaseToDisk();
    }

    console.log(`✓ Database initialized at ${DB_FILE}`);
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

/**
 * Get database instance
 * @returns {Object}
 */
function getDatabase() {
  return db;
}

/**
 * Save database to disk with atomic writes (prevents corruption)
 * Uses a simple queue to serialize concurrent writes
 * @returns {Promise<void>}
 */
async function saveDatabaseToDisk() {
  return new Promise((resolve, reject) => {
    // Add to write queue
    writeQueue.push({ resolve, reject });

    // If write not in progress, start one
    if (!writeInProgress) {
      processWriteQueue();
    }
  });
}

/**
 * Process the write queue one at a time (prevents concurrent writes)
 */
async function processWriteQueue() {
  if (writeQueue.length === 0) {
    writeInProgress = false;
    return;
  }

  writeInProgress = true;
  const { resolve, reject } = writeQueue.shift();

  try {
    // Write to temporary file first (atomic operation)
    const tempFile = DB_FILE + ".tmp";
    const content = JSON.stringify(db, null, 2);

    // Write to temp file
    await fs.writeFile(tempFile, content, "utf-8");

    // Atomically rename temp to actual file
    await fs.rename(tempFile, DB_FILE);

    resolve();
  } catch (error) {
    console.error("Failed to save database:", error);
    reject(error);
  } finally {
    // Process next write in queue
    if (writeQueue.length > 0) {
      processWriteQueue();
    } else {
      writeInProgress = false;
    }
  }
}

/**
 * Run a query-like operation (wrapper for consistency with original API)
 * @param {string} type - Type of operation: 'insert_resume', 'insert_job', etc.
 * @param {Object} data - Data to insert or update
 * @returns {Promise<Object>}
 */
async function dbRun(type, data) {
  const now = new Date().toISOString();

  switch (type) {
    case "insert_resume":
      db.resumes[data.id] = {
        ...data,
        created_at: now,
        updated_at: now,
      };
      await saveDatabaseToDisk();
      return { id: data.id, changes: 1 };

    case "insert_job":
      db.jobs[data.id] = {
        ...data,
        created_at: now,
        updated_at: now,
      };
      await saveDatabaseToDisk();
      return { id: data.id, changes: 1 };

    case "update_resume":
      if (db.resumes[data.id]) {
        db.resumes[data.id] = {
          ...db.resumes[data.id],
          ...data,
          updated_at: now,
        };
        await saveDatabaseToDisk();
        return { changes: 1 };
      }
      return { changes: 0 };

    default:
      throw new Error(`Unknown operation: ${type}`);
  }
}

/**
 * Get all records matching a query
 * @param {string} type - Type to query: 'resumes', 'jobs'
 * @param {Object} filter - Filter object (e.g., { user_id: 'user123' })
 * @returns {Promise<Array>}
 */
async function dbAll(type, filter = {}) {
  let results = [];

  switch (type) {
    case "resumes":
      results = Object.values(db.resumes).filter((item) => {
        return Object.keys(filter).every((key) => item[key] === filter[key]);
      });
      break;

    case "jobs":
      results = Object.values(db.jobs).filter((item) => {
        return Object.keys(filter).every((key) => item[key] === filter[key]);
      });
      break;

    default:
      throw new Error(`Unknown type: ${type}`);
  }

  return results.sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    return bTime - aTime;
  });
}

/**
 * Get a single record
 * @param {string} type - Type to query
 * @param {string} id - Record ID
 * @returns {Promise<Object|null>}
 */
async function dbGet(type, id) {
  switch (type) {
    case "resume":
      return db.resumes[id] || null;
    case "job":
      return db.jobs[id] || null;
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

/**
 * Delete a record
 * @param {string} type - Type to delete
 * @param {string} id - Record ID
 * @returns {Promise<number>}
 */
async function dbDelete(type, id) {
  switch (type) {
    case "resume":
      if (db.resumes[id]) {
        delete db.resumes[id];
        await saveDatabaseToDisk();
        return 1;
      }
      return 0;

    case "job":
      if (db.jobs[id]) {
        delete db.jobs[id];
        await saveDatabaseToDisk();
        return 1;
      }
      return 0;

    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  saveDatabaseToDisk,
  dbRun,
  dbAll,
  dbGet,
  dbDelete,
  DB_PATH: DB_FILE,
  DB_DIR,
};
