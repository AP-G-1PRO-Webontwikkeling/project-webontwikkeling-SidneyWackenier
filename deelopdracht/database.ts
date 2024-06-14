import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { Character, Group, User } from "./types";
import { channel } from "diagnostics_channel";
import bcrypt from "bcrypt";

dotenv.config();

export const MONGODB_URI = "mongodb+srv://sidneywackenier:fYa5m759VGhw2lTR@project.dvtvpzc.mongodb.net/?retryWrites=true&w=majority&appName=Project";

export const client = new MongoClient(MONGODB_URI);

export const collection : Collection<Character> = client.db("Project").collection<Character>("Characters");
export const userCollection = client.db("Project").collection<User>("Users");

const saltRounds : number = 10;

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
        await createInitialUser();
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



async function createInitialUser() {
    if (await userCollection.countDocuments() > 2) {
        return;
    }
    let email : string | undefined = process.env.ADMIN_EMAIL;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    if (email === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    });

    const userEmail: string | undefined = process.env.USER_EMAIL;
    const userPassword: string | undefined = process.env.USER_PASSWORD;
    if (!userEmail || !userPassword) {
        throw new Error("USER_EMAIL and USER_PASSWORD must be set in environment");
    }

    await userCollection.insertOne({
        email: userEmail,
        password: await bcrypt.hash(userPassword, saltRounds),
        role: "USER"
    });
}


export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user : User | null = await userCollection.findOne<User>({email: email});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

export async function registerUser(email: string, password: string) {
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists!");
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser: User = { email, password: hashedPassword, role: "USER" };
    await userCollection.insertOne(newUser);
    console.log(`User registered successfully: ${email}`);
    return newUser;
}