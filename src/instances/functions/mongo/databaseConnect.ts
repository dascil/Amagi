import AmagiClient from "../../classes/client/AmagiClient";
import { connect } from "mongoose";
require("dotenv").config();

const dbToken: string = process.env['DB_TOKEN']!;

export async function databaseConnect(client: AmagiClient) {
    try {
        await connect(dbToken);
    } catch(error) {
        console.log(client.failure("[ERROR] ") + "Unable to log in to database.");
        console.error(error);
    }
}