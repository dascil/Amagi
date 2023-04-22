import { readdirSync } from "fs";
import AmagiClient from "../../client/AmagiClient";

module.exports = (client: AmagiClient) => {
  try {
    if (client.debugMode) {
      console.log(client.debug("DEBUG: ") + `Begin loading events...`);
    }
    readdirSync("./built/events").forEach((folder) => {
      // Get all event files in event subdirectory
      const eventFiles = readdirSync(`./built/events/${folder}`).filter((file) =>
        file.endsWith(".js")
      );

      // Sets up events based on subdirectorys
      switch (folder) {
        case "client":
          eventFiles.forEach((file) => {
            // Initialize events based on if the event happens only once
            const event = require(`../../events/${folder}/${file}`);
            if (event.once) {
              client.once(event.name, (...args) =>
                event.execute(...args, client)
              );
            } else {
              client.on(event.name, (...args) =>
                event.execute(...args, client)
              );
            }
            if (client.debugMode) {
              console.log(client.debug("DEBUG: ") + `Event ${event.name} has been passed.`);
            }
          });
          break;

        default:
          break;
      }
    });
    console.log(client.success("SUCCESS: ") + "Successfully loaded events.");
  } catch (error) {
    console.log(client.failure("ERROR: ") + "Failed to load events. See error below.");
    console.error(error);
  }
};
