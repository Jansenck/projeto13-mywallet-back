import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await mongoClient.connect();
} catch (error) {
    console.error(error.message);
    res.sendStatus(500);
}
const db = mongoClient.db("mywallet_database");

export default db;