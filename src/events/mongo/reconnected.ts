import AmagiClient from "../../instances/classes/client/AmagiClient";

module.exports = {
    name: "reconnected",
    execute(client: AmagiClient) {
        console.log(client.success("[CONNECTED] ") + "Database has been reconnected");
    }
}