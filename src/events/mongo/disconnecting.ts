import AmagiClient from "../../instances/classes/client/AmagiClient";

module.exports = {
    name: "disconnecting",
    execute(client: AmagiClient) {
        console.log(client.warning("[PROCESSING] ") + "Disconnecting from database...");
    }
}