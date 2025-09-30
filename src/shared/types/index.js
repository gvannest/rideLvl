/**
 * @typedef {Object} Metrics
 * @property {number} speedKmh - Speed in kilometers per hour
 * @property {number} overall - Overall score (0-100)
 * @property {number} technical - Technical score (0-100)
 * @property {string[]} positives - Array of positive feedback strings
 * @property {string[]} improvements - Array of improvement suggestions
 */

/**
 * @typedef {Object} VideoItem
 * @property {string} id - Unique identifier for the video
 * @property {string} name - Display name of the video
 * @property {string} url - URL or blob URL for the video
 * @property {Metrics} metrics - Performance metrics for the video
 */

/**
 * @typedef {'upload' | 'library'} Tab
 */