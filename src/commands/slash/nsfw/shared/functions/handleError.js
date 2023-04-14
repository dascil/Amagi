const chalk = require("chalk");

/**
 * Logs information about error to console
 * @param {String} error Text from error
 * @param {Function} errorColor Function to change console text to this color
 * @param {Function} warningColor Function to change console text to this color
 */
function handleError(error) {
    const time = new Date().toLocaleTimeString();
    console.error(chalk.red("ERROR: ") + error.message);
    console.error(chalk.yellow("TIME OF ERROR: " + time));
    console.error(error);
}

module.exports = {
    handleError:handleError
 };