const { readdirSync } = require("fs");
module.exports = async (client) => {
  try {
    if (client.debugMode) {
      console.log(client.debug("DEBUG: ") + "Begin loading prefix commands...");
    }
    readdirSync("./src/commands/prefix").forEach((folder) => {
      // Get all slash script files in slash subdirectory
      const prefixFiles = readdirSync(`./src/commands/prefix/${folder}`).filter(
        (file) => file.endsWith(".js")
      );

      const { prefixCommands } = client;

      prefixFiles.forEach((file) => {
        const command = require(`../../commands/prefix/${folder}/${file}`);
        prefixCommands.set(command.name, command);
        if (client.debugMode) {
          console.log(client.debug("DEBUG: ") + `Prefix command ${command.name} has been passed.`);
        }
      });

    });
    console.log(
      client.success("SUCCESS: ") +
        "Successfully loaded prefix commands."
    );
  } catch (error) {
    console.log(
      client.failure("ERROR: ") +
        "Failed to load prefix commands. See error below."
    );
    console.error(error);
  }
};