/**
 * Resume Parser Worker Process
 * ============================
 *
 * Separate worker process for handling resume parsing jobs from the queue.
 * Run this in a separate terminal or container process for production.
 *
 * Usage:
 *   node parser-worker.js
 *
 * Environment Variables:
 *   REDIS_URL - Redis connection URL (default: redis://localhost:6379)
 *   WORKER_CONCURRENCY - Number of concurrent jobs (default: 2)
 *   LOG_LEVEL - Logging level: DEBUG, INFO, WARN, ERROR (default: INFO)
 */

require("dotenv").config();

const logger = require("./parser/utils/logger");
const { startWorker, stopWorker } = require("./parser/workers/resume-parser.worker");
const { initDatabase } = require("./parser/config/database");

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initializeWorkerProcess() {
  try {
    logger.info("Starting Resume Parser Worker Process");

    // Initialize database
    await initDatabase();
    logger.info("Database initialized");

    // Start worker
    const worker = await startWorker();

    // Handle graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      await stopWorker(worker);

      logger.info("Worker process shut down successfully");
      process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    logger.info("Resume Parser Worker is ready and processing jobs");
  } catch (error) {
    logger.error("Failed to start worker process", error);
    process.exit(1);
  }
}

// Start the worker process
if (require.main === module) {
  initializeWorkerProcess();
}

module.exports = { initializeWorkerProcess };
