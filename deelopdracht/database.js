"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = exports.login = exports.updateCharacter = exports.connect = exports.loadUsersFromJson = exports.getCharacters = exports.userCollection = exports.collection = exports.client = exports.MONGODB_URI = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
exports.MONGODB_URI = (_a = process.env.MONGODB_URI) !== null && _a !== void 0 ? _a : "mongodb+srv://sidneywackenier:e0X8OSpnClO6gdtE@project.dvtvpzc.mongodb.net/?retryWrites=true&w=majority&appName=Project";
exports.client = new mongodb_1.MongoClient(exports.MONGODB_URI);
exports.collection = exports.client.db("Project").collection("Characters");
exports.userCollection = exports.client.db("Project").collection("Users");
const saltRounds = 10;
function getCharacters() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.collection.find({}).toArray();
    });
}
exports.getCharacters = getCharacters;
function exit() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.client.close();
            console.log("Disconnected from database");
        }
        catch (error) {
            console.error(error);
        }
        process.exit(0);
    });
}
function loadUsersFromJson() {
    return __awaiter(this, void 0, void 0, function* () {
        const characters = yield getCharacters();
        if (characters.length == 0) {
            console.log("Database is empty, loading characters from API");
            const response = yield fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-SidneyWackenier/main/deelopdracht/json/dc.json");
            const users = yield response.json();
            yield exports.collection.insertMany(users);
        }
    });
}
exports.loadUsersFromJson = loadUsersFromJson;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.client.connect();
            yield createInitialUser();
            yield loadUsersFromJson();
            console.log("Connected to database");
            process.on("SIGINT", exit);
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.connect = connect;
function updateCharacter(id, character) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.collection.updateOne({ id: id }, { $set: character });
    });
}
exports.updateCharacter = updateCharacter;
function createInitialUser() {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield exports.userCollection.countDocuments()) > 2) {
            return;
        }
        let email = process.env.ADMIN_EMAIL;
        let password = process.env.ADMIN_PASSWORD;
        if (email === undefined || password === undefined) {
            throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
        }
        yield exports.userCollection.insertOne({
            email: email,
            password: yield bcrypt_1.default.hash(password, saltRounds),
            role: "ADMIN"
        });
        const userEmail = process.env.USER_EMAIL;
        const userPassword = process.env.USER_PASSWORD;
        if (!userEmail || !userPassword) {
            throw new Error("USER_EMAIL and USER_PASSWORD must be set in environment");
        }
        yield exports.userCollection.insertOne({
            email: userEmail,
            password: yield bcrypt_1.default.hash(userPassword, saltRounds),
            role: "USER"
        });
    });
}
function login(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (email === "" || password === "") {
            throw new Error("Email and password required");
        }
        let user = yield exports.userCollection.findOne({ email: email });
        if (user) {
            if (yield bcrypt_1.default.compare(password, user.password)) {
                return user;
            }
            else {
                throw new Error("Password incorrect");
            }
        }
        else {
            throw new Error("User not found");
        }
    });
}
exports.login = login;
function registerUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUser = yield exports.userCollection.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists!");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const newUser = { email, password: hashedPassword, role: "USER" };
        yield exports.userCollection.insertOne(newUser);
        console.log(`User registered successfully: ${email}`);
        return newUser;
    });
}
exports.registerUser = registerUser;
//# sourceMappingURL=database.js.map