import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { Character, Group } from "./interfaces";
import { channel } from "diagnostics_channel";

dotenv.config();
export const client = new MongoClient(process.env.MONGO_URI || "mongodb+srv://sidneywackenier:e0X8OSpnClO6gdtE@project.dvtvpzc.mongodb.net/?retryWrites=true&w=majority&appName=Project");

export const collection : Collection<Character> = client.db("Project").collection<Character>("Characters");

export async function getCharacters() {
    return await collection.find({}).toArray();
}

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function loadUsersFromJson() {
    const characters : Character[] = await getCharacters();
    if (characters.length == 0) {
        console.log("Database is empty, loading characters from API")
        const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-SidneyWackenier/main/deelopdracht/json/dc.json");
        const users : Character[] = await response.json();
        await collection.insertMany(users);
    }
}

export async function connect() {
    try {
        await client.connect();
        await loadUsersFromJson();   
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}

export async function updateCharacter(id: string, character: Character) {
    return await collection.updateOne({ id : id }, { $set:  character });
}