import AmagiClient from "../../instances/classes/client/AmagiClient";

module.exports = {
    name: "disconnected",
    execute(client: AmagiClient) {
        console.log(client.failure("[DISCONNECTED] ") + "Disconnecting from database...");
    }
}