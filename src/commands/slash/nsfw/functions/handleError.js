const chalk = require("chalk");

/**
 * Logs information about error to console
 * @param {String} error Text from error
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