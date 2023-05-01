import AmagiClient from "../../instances/classes/client/AmagiClient";

module.exports = {
    name: "connected",
    execute(client: AmagiClient) {
        console.log(client.success("[CONNECTED] ") + "Database has been connected");
    }
}