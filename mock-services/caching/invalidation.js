const redis = require('./connect');
const Resource = require('../model/resources');

/**
 * Generates a standardized cache key.
 */
const getCacheKey = (projectId, endpoint) => `resource:${projectId}:${endpoint}`;

/**
 * Retrieves resource from cache or database.
 * If cache is missing, it fetches from DB and populates the cache.
 * 
 * @param {string} projectId 
 * @param {string} endpoint 
 * @returns {Promise<Object|null>}
 */
const getCachedResource = async (projectId, endpoint) => {
    const cacheKey = getCacheKey(projectId, endpoint);
    
    try {
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (err) {
        console.error("Cache get error:", err);
    }

    // Cache miss or error, fetch from DB
    const resourceDoc = await Resource.findOne({ projectId, endpoint }).select('records').lean();
    
    if (resourceDoc) {
        try {
            // Set cache with 1 hour expiration
            await redis.set(cacheKey, JSON.stringify(resourceDoc), 'EX', 3600);
        } catch (err) {
            console.error("Cache set error:", err);
        }
    }
    
    return resourceDoc;
};

/**
 * Invalidates (deletes) the cache for a specific resource.
 * This should be called whenever data is modified (POST, PUT, PATCH, DELETE).
 * 
 * @param {string} projectId 
 * @param {string} endpoint 
 */
const invalidateCache = async (projectId, endpoint) => {
    const cacheKey = getCacheKey(projectId, endpoint);
    try {
        await redis.del(cacheKey);
    } catch (err) {
        console.error("Cache invalidation error:", err);
    }
};

module.exports = {
    getCachedResource,
    invalidateCache
};
