/**
 * Evaluates whether an observation is novel or a duplicate.
 * 
 * @param {string} previous - The last stored observation.
 * @param {string} current - The newly generated observation.
 * @returns {string} 'STORE' or 'SKIP'
 */
function evaluateObservation(previous, current) {
    if (!previous || !current) return 'STORE';

    const prevNormalized = previous.trim().toLowerCase();
    const currNormalized = current.trim().toLowerCase();

    if (prevNormalized === currNormalized) {
        return 'SKIP';
    }

    return 'STORE';
}

module.exports = { evaluateObservation };