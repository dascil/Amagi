import AmagiClient from "../../instances/classes/client/AmagiClient";

module.exports = {
    name: "connecting",
    execute(client: AmagiClient) {
        console.log(client.warning("[PROCESSING] ") + "Connecting to database...");
    }
}