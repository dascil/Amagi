import chalk from "chalk";


/**
 * Logs information about error to console
 * @param {any} error Text from error
 */
export default function handleError(error: any) {
    const time = new Date().toLocaleTimeString();
    console.error(chalk.red("ERROR: ") + error.message);
    console.error(chalk.yellow("TIME OF ERROR: " + time));
    console.error(error);
}