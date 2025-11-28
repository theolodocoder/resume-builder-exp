/**
 * BullMQ Resume Parsing Queue
 * ===========================
 *
 * Sets up BullMQ queue for async resume parsing jobs.
 * Handles job queueing, status tracking, and retry logic.
 */

const { Queue, Worker } = require("bullmq");
const logger = require("../utils/logger");

const QUEUE_NAME = "resume-parsing";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Queue options
const queueOptions = {
  connection: {
    url: REDIS_URL,
  },
};

// Job options
const jobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000,
  },
  removeOnComplete: {
    age: 3600, // Keep completed jobs for 1 hour
  },
  removeOnFail: {
    age: 86400, // Keep failed jobs for 24 hours
  },
};

let resumeQueue = null;

/**
 * Initialize the resume parsing queue
 *
 * @returns {Queue}
 */
function initializeQueue() {
  if (!resumeQueue) {
    resumeQueue = new Queue(QUEUE_NAME, queueOptions);

    // Queue event listeners
    // Note: Redis connection errors are silently ignored since Redis is optional for development
    resumeQueue.on("error", () => {
      // Intentionally suppress all queue errors - Redis is optional
      // The server works fine without Redis for basic resume parsing
    });

    resumeQueue.on("waiting", (job) => {
      logger.debug("Job waiting", { jobId: job.id });
    });

    logger.info("Resume parsing queue initialized", { queueName: QUEUE_NAME });
  }

  return resumeQueue;
}

/**
 * Get or create the queue
 *
 * @returns {Queue}
 */
function getQueue() {
  if (!resumeQueue) {
    return initializeQueue();
  }
  return resumeQueue;
}

/**
 * Add a resume parsing job to the queue
 *
 * @param {object} jobData - Job data object
 * @returns {Promise<Job>}
 */
async function addParsingJob(jobData) {
  try {
    const queue = getQueue();

    const job = await queue.add(QUEUE_NAME, jobData, jobOptions);

    logger.info("Parsing job added to queue", {
      jobId: job.id,
      fileName: jobData.fileName,
    });

    return job;
  } catch (error) {
    logger.error("Failed to add parsing job", error);
    throw error;
  }
}

/**
 * Get job status
 *
 * @param {string|number} jobId
 * @returns {Promise<object>}
 */
async function getJobStatus(jobId) {
  try {
    const queue = getQueue();
    const job = await queue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();

    // Safely get progress - in BullMQ, access internal _progress property
    let progress = 0;
    try {
      progress = job._progress || 0;
    } catch (progressError) {
      logger.debug("Could not get job progress", { error: progressError.message });
      progress = 0;
    }

    const attempts = job.attemptsMade;

    return {
      id: job.id,
      state,
      progress,
      attempts,
      data: job.data,
      result: job.returnvalue,
      error: job.failedReason,
    };
  } catch (error) {
    logger.error("Failed to get job status", error);
    throw error;
  }
}

/**
 * Remove a job from the queue
 *
 * @param {string|number} jobId
 * @returns {Promise<number>}
 */
async function removeJob(jobId) {
  try {
    const queue = getQueue();
    const job = await queue.getJob(jobId);

    if (job) {
      const result = await job.remove();
      logger.info("Job removed", { jobId });
      return result;
    }

    return null;
  } catch (error) {
    logger.error("Failed to remove job", error);
    throw error;
  }
}

/**
 * Get queue statistics
 *
 * @returns {Promise<object>}
 */
async function getQueueStats() {
  try {
    const queue = getQueue();

    const counts = await queue.getJobCounts(
      "wait",
      "active",
      "completed",
      "failed"
    );

    return {
      waiting: counts.wait,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
    };
  } catch (error) {
    logger.error("Failed to get queue stats", error);
    throw error;
  }
}

/**
 * Close the queue connection
 *
 * @returns {Promise<void>}
 */
async function closeQueue() {
  if (resumeQueue) {
    await resumeQueue.close();
    resumeQueue = null;
    logger.info("Resume queue closed");
  }
}

module.exports = {
  QUEUE_NAME,
  initializeQueue,
  getQueue,
  addParsingJob,
  getJobStatus,
  removeJob,
  getQueueStats,
  closeQueue,
};
