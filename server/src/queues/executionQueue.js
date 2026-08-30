const env = require('../config/env');

let queue = null;
let memoryQueue = [];

const initQueue = async () => {
  if (env.REDIS_URL) {
    try {
      const { Queue } = require('bullmq');
      queue = new Queue('executions', { connection: { url: env.REDIS_URL } });
      console.log('BullMQ queue initialized with Redis');
      return true;
    } catch (err) {
      console.warn('Redis unavailable, using in-memory queue:', err.message);
    }
  } else {
    console.log('No REDIS_URL configured, using in-memory queue');
  }
  return false;
};

const addJob = async (data, opts = {}) => {
  if (queue) {
    return queue.add('execute', data, {
      attempts: opts.attempts || 3,
      backoff: { type: 'exponential', delay: opts.delay || 2000 },
      ...opts,
    });
  }

  const job = { id: `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`, data, opts, status: 'waiting' };
  memoryQueue.push(job);
  return job;
};

const getJob = async (jobId) => {
  if (queue) {
    return queue.getJob(jobId);
  }
  return memoryQueue.find((j) => j.id === jobId);
};

const removeJob = async (jobId) => {
  if (queue) {
    const job = await queue.getJob(jobId);
    if (job) await job.remove();
    return;
  }
  memoryQueue = memoryQueue.filter((j) => j.id !== jobId);
};

const processQueue = async (handler) => {
  if (queue) {
    const worker = new (require('bullmq').Worker)('executions', async (job) => handler(job.data, job), {
      connection: { url: env.REDIS_URL },
    });
    worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err.message));
    return worker;
  }

  console.log('Processing in-memory queue');
  const processNext = async () => {
    while (memoryQueue.length > 0) {
      const job = memoryQueue.shift();
      if (job) {
        try {
          job.status = 'processing';
          await handler(job.data, job);
          job.status = 'completed';
        } catch (err) {
          console.error(`In-memory job failed:`, err.message);
          job.status = 'failed';
        }
      }
    }
    setTimeout(processNext, 1000);
  };
  processNext();
};

module.exports = { initQueue, addJob, getJob, removeJob, processQueue };
