import AmagiClient from "../../instances/classes/client/AmagiClient";

module.exports = {
    name: "error",
    execute(error: any, client: AmagiClient) {
        console.log(client.failure("[ERROR] ") + `Error has occured with the database connection.\n${error}`);
    }
}