const Project = require('../../model/projects');
const writeLogs = require('../writeLogs');

const PROJECT_CACHE_TTL_MS = Number(process.env.PROJECT_CACHE_TTL_MS || 60_000);
const projectCache = new Map();

function scheduleLog(res, logData) {
  res.once('finish', () => {
    setImmediate(() => {
      writeLogs(logData).catch((err) => {
        console.error('Failed to schedule mock log:', err);
      });
    });
  });
}

async function getProjectAuth(projectId) {
  const cached = projectCache.get(projectId);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.project;
  }

  const project = await Project.findOne({ projectId }).select('+apiKey').lean();
  if (project) {
    projectCache.set(projectId, {
      project,
      expiresAt: now + PROJECT_CACHE_TTL_MS,
    });
  }

  return project;
}

module.exports = {
  getProjectAuth,
  scheduleLog,
};
