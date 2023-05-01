import { readdirSync } from "fs";
import { connection } from "mongoose";
import AmagiClient from "../../instances/classes/client/AmagiClient";

module.exports = (client: AmagiClient) => {
  try {
    if (client.debugMode) {
      console.log(client.debug("[DEBUG] ") + `Begin loading events...`);
    }
    readdirSync("./build/events").forEach((folder) => {
      // Get all event files in event subdirectory
      const eventFiles = readdirSync(`./build/events/${folder}`).filter((file) =>
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

        case "mongo":
          eventFiles.forEach(file => {
            // Initialize events based on if the event happens only once
            const event = require(`../../events/${folder}/${file}`);
            if (event.once) {
              connection.once(event.name, (...args) =>
                event.execute(...args, client)
              );
            } else {
              connection.on(event.name, (...args) =>
                event.execute(...args, client)
              );
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
