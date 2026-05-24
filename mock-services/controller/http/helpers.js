const Project = require('../../model/projects');
const writeLogs = require('../writeLogs');
const redis = require('../../caching/connect');

const PROJECT_CACHE_TTL = Number(process.env.PROJECT_CACHE_TTL || 60); // Default 60 seconds

function scheduleLog(res, logData) {
  const startTime = res.req?._startTime || Date.now();
  res.once('finish', () => {
    const responseTime = Date.now() - startTime;
    setImmediate(() => {
      writeLogs({ ...logData, responseTime }).catch((err) => {
        console.error('Failed to schedule mock log:', err);
      });
    });
  });
}

async function getProjectAuth(projectId) {
  const cacheKey = `project:${projectId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error("Valkey get project error:", err);
  }

  const project = await Project.findOne({ projectId }).lean();
  if (project) {
    try {
      await redis.set(cacheKey, JSON.stringify(project), 'EX', PROJECT_CACHE_TTL);
    } catch (err) {
      console.error("Valkey set project error:", err);
    }
  }

  return project;
}

module.exports = {
  getProjectAuth,
  scheduleLog,
};
