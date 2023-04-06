const { readdirSync } = require("fs");

module.exports = (client) => {
  try {
    readdirSync("./src/events").forEach((folder) => {
      // Get all event files in event subdirectory
      const eventFiles = readdirSync(`./src/events/${folder}`).filter((file) =>
        file.endsWith(".js")
      );

      // Sets up events based on subdirectorys
      switch (folder) {
        case "client":
          eventFiles.forEach((file) => {
            // Initialize events based on if the event happens only once
            const event = require(`../events/${folder}/${file}`);
            if (event.once) {
              client.once(event.name, (...args) =>
                event.execute(...args, client)
              );
            } else {
              client.on(event.name, (...args) =>
                event.execute(...args, client)
              );
            }
          });
          break;

        default:
          break;
      }
    });

    console.log("Events successfully loaded.");
  } catch (error) {
    console.log("Failed to load events. See error below.");
    console.error(error);
  }
};
