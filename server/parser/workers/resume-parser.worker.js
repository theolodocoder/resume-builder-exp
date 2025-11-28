/**
 * Resume Parser Worker
 * ===================
 *
 * BullMQ worker that processes resume parsing jobs from the queue.
 * Executes the full parsing pipeline for each job.
 */

const { Worker } = require("bullmq");
const fs = require("fs-extra");
const logger = require("../utils/logger");
const parserOrchestrator = require("../services/parser-orchestrator.service");
const { QUEUE_NAME } = require("../queues/resume-queue");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Job processor function
 * Handles the actual resume parsing for each job
 *
 * @param {Job} job - BullMQ job object
 * @returns {Promise<object>} - Parsing result
 */
async function processParsingJob(job) {
  try {
    const { filePath, fileType, fileName } = job.data;

    logger.info("Processing parsing job", {
      jobId: job.id,
      fileName,
      fileType,
    });

    // Update job progress (safely handle progress updates)
    if (job && typeof job.progress === 'function') {
      try {
        await job.progress(10);
      } catch (progressError) {
        logger.debug("Progress update failed (non-critical)", { error: progressError.message });
      }
    }

    // Verify file exists
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Parse the resume
    if (job && typeof job.progress === 'function') {
      try {
        await job.progress(20);
      } catch (progressError) {
        logger.debug("Progress update failed (non-critical)", { error: progressError.message });
      }
    }

    const parseResult = await parserOrchestrator.parseResume(
      filePath,
      fileType,
      fileName,
      job.data.options || {}
    );

    if (job && typeof job.progress === 'function') {
      try {
        await job.progress(80);
      } catch (progressError) {
        logger.debug("Progress update failed (non-critical)", { error: progressError.message });
      }
    }

    // Save result to database
    const resumeId = await parserOrchestrator.saveParseResult(
      job.id,
      parseResult.parsed,
      {
        fileName,
        fileType,
        confidence: parseResult.confidence,
        userId: job.data.userId || null, // Preserve userId for user tracking
        ...parseResult.metadata,
      }
    );

    if (job && typeof job.progress === 'function') {
      try {
        await job.progress(95);
      } catch (progressError) {
        logger.debug("Progress update failed (non-critical)", { error: progressError.message });
      }
    }

    // Clean up uploaded file ONLY on success
    try {
      await fs.remove(filePath);
      logger.debug("Uploaded file cleaned up", { filePath });
    } catch (error) {
      logger.warn("Failed to clean up file", { filePath, error: error.message });
    }

    if (job && typeof job.progress === 'function') {
      try {
        await job.progress(100);
      } catch (progressError) {
        logger.debug("Progress update failed (non-critical)", { error: progressError.message });
      }
    }

    const result = {
      jobId: job.id,
      resumeId,
      parsed: parseResult.parsed,
      confidence: parseResult.confidence,
      metadata: parseResult.metadata,
    };

    logger.info("Parsing job completed successfully", {
      jobId: job.id,
      resumeId,
      confidence: parseResult.confidence.toFixed(2),
    });

    return result;
  } catch (error) {
    logger.error("Parsing job failed", error);

    // Do NOT clean up file on error - let it be available for retries
    // File will only be cleaned up on successful completion
    // If job fails after all retries, file will remain for debugging

    throw error;
  }
}

/**
 * Initialize the parsing worker
 *
 * @returns {Worker}
 */
function initializeWorker() {
  const worker = new Worker(QUEUE_NAME, processParsingJob, {
    connection: {
      url: REDIS_URL,
    },
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || "2"),
  });

  // Worker event listeners
  worker.on("completed", (job, result) => {
    logger.info("Job completed", {
      jobId: job.id,
      result: result?.resumeId,
    });
  });

  worker.on("failed", (job, err) => {
    logger.error("Job failed", {
      jobId: job?.id,
      error: err.message,
      attempts: job?.attemptsMade,
    });
  });

  worker.on("error", (err) => {
    // Suppress Redis connection errors - Redis is optional for development
    if (err.code === "ECONNREFUSED" || err.message?.includes("ECONNREFUSED")) {
      logger.debug("Worker Redis connection attempt (non-critical)", { code: err.code });
    } else {
      logger.error("Worker error", err);
    }
  });

  logger.info("Resume parser worker initialized", {
    queue: QUEUE_NAME,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || "2"),
  });

  return worker;
}

/**
 * Start the worker
 *
 * @returns {Promise<Worker>}
 */
async function startWorker() {
  const worker = initializeWorker();

  logger.info("Resume parser worker started and listening for jobs");

  return worker;
}

/**
 * Stop the worker
 *
 * @param {Worker} worker
 * @returns {Promise<void>}
 */
async function stopWorker(worker) {
  if (worker) {
    await worker.close();
    logger.info("Resume parser worker stopped");
  }
}

module.exports = {
  processParsingJob,
  initializeWorker,
  startWorker,
  stopWorker,
};
