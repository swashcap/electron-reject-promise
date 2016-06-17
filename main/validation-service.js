'use strict';

module.exports = {
  /**
   * @throws Error if invalid
   * @param {string} name
   * @returns {string} Original name (if valid)
   */
  validateSynchronously: function validateSynchronously(name) {
    if (!name || name.length < 4) {
      throw new Error('Name must have at least 4 characters');
    }

    return name;
  },

  /**
   * Validate a name.
   *
   * @param {string} name
   * @returns {Promise} Resolves if valid, rejects if invalid
   */
  validateWithPromise: function validateName(name) {
    if (!name || name.length < 4) {
      return Promise.reject(new Error('Name must have at least 4 characters'));
    }

    return Promise.resolve(name);
  },
};
