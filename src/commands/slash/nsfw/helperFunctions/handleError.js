
/**
 * Logs information about error to console
 * @param {String} error Text from error
 */
function handleError(error) {
    const time = new Date().toLocaleTimeString();
    console.error("ERROR HAS OCCURED!");
    console.error("\nTIME OF ERROR: " + time);
    console.trace();
}

module.exports = {
    handleError:handleError
}