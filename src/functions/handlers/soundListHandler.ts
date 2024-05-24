import { readdirSync } from "fs"
import AmagiClient from "../../instances/classes/client/AmagiClient"

module.exports = async (client: AmagiClient) => {
    try {
        if (client.debugMode) {
            console.log(client.debug("[DEBUG] ") + "Begin loading sound files...");
        }
        const dirPath = "./assets/sounds";
        const { soundList } = client;
        readdirSync(dirPath).forEach((soundFile) => {
            if (soundFile.endsWith(".ogg")) {
                const soundName = soundFile.substring(0, soundFile.lastIndexOf(".")) || soundFile;
                const soundFilePath = dirPath + "/" + soundFile;
                soundList.set(soundName, soundFilePath);
            }
        });

        console.log(client.success("[SUCCESS] ") + "Sounds have been successfully loaded.");
    } catch (error) {
        console.log(client.failure("[ERROR] " + "Failed to load sound files. See error below."));
        console.error(error);
    }
}