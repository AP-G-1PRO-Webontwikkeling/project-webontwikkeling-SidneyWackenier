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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./database");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const session_1 = __importDefault(require("./session"));
const secureMiddleware_1 = require("./secureMiddleware");
const loginRouter_1 = require("./routes/loginRouter");
const homeRouter_1 = require("./routes/homeRouter");
const flashMiddleware_1 = require("./flashMiddleware");
dotenv_1.default.config();
console.log(process.env.PORT);
console.log(process.env.MONGO_URI);
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.use(session_1.default);
app.use((0, loginRouter_1.loginRouter)());
app.use((0, homeRouter_1.homeRouter)());
app.use(flashMiddleware_1.flashMiddleware);
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);
app.get("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render("register");
}));
app.post("/register/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    try {
        yield (0, database_1.registerUser)(email, password);
        req.session.message = { type: "success", message: "Registration successful. Please log in." };
        res.redirect("/login");
    }
    catch (e) {
        req.session.message = { type: "error", message: e.message };
        res.redirect("/register");
    }
}));
app.get("/characters", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let data = yield (0, database_1.getCharacters)();
    let q = (_a = req.query.q) !== null && _a !== void 0 ? _a : "";
    let filteredCharacters = data.filter((character) => {
        return character.name.toLowerCase().includes(q.toLowerCase());
    });
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    const rarityOrder = {
        "Common": 1,
        "Uncommon": 2,
        "Rare": 3,
        "Epic": 4,
        "Legendary": 5,
        "Ultra": 6
    };
    let sortedCards = [...filteredCharacters].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        else if (sortField === "cost") {
            return sortDirection === "asc" ? a.cost - b.cost : b.cost - a.cost;
        }
        else if (sortField === "power") {
            return sortDirection === "asc" ? a.power - b.power : b.power - a.power;
        }
        else if (sortField === "rarity") {
            return sortDirection === "asc" ? Number(b.upgradeable) - Number(a.upgradeable) : Number(a.upgradeable) - Number(b.upgradeable);
        }
        else {
            return 0;
        }
    });
    console.log('Sorted cards:', sortedCards);
    res.render("characters", {
        data: filteredCharacters,
        filteredCharacters: sortedCards,
        q: q
    });
}));
app.get("/detail/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield (0, database_1.getCharacters)();
    const cardId = req.params.id;
    const clickedCard = data.find(character => character.id === cardId);
    console.log(clickedCard);
    res.render("detail", {
        clickedCard: clickedCard,
        isAdmin: req.session.user && req.session.user.role === 'ADMIN'
    });
}));
app.post("/detail/:id/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let user = req.body;
    yield (0, database_1.updateCharacter)(id, user);
    res.redirect("/characters");
}));
app.get("/groups", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield (0, database_1.getCharacters)();
    res.render("groups", {
        data: data
    });
}));
app.get("/groupdetail/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield (0, database_1.getCharacters)();
    const groupId = req.params.id;
    const clickedGroup = groups.find(character => character.group.id === groupId);
    console.log(clickedGroup);
    res.render("groupdetail", {
        clickedGroup: clickedGroup
    });
}));
app.listen(app.get("port"), () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, database_1.connect)();
        console.log("Server started on http://localhost:" + app.get('port'));
    }
    catch (e) {
        console.log(e);
        process.exit(1);
    }
}));
//# sourceMappingURL=index.js.map