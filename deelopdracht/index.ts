import * as readline from 'readline-sync';
import { Character, Group, User } from './types';
import { connect, getCharacters, updateCharacter, login } from "./database";
import { Console, error } from 'console';
import { read } from 'fs';
import express from 'express';
import ejs from "ejs";
import dotenv from "dotenv";
import path, { format } from "path";
import session from "./session";
import { secureMiddleware } from "./secureMiddleware";
import { loginRouter } from "./routes/loginRouter";
import { homeRouter } from "./routes/homeRouter";
import { flashMiddleware } from "./flashMiddleware";

dotenv.config();

console.log(process.env.PORT);
console.log(process.env.MONGO_URI);

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended:true}))

app.use(express.static("public"));

app.use(session);

app.use(flashMiddleware);

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

app.get("/", secureMiddleware, async(req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async(req, res) => {
  const email : string = req.body.email;
  const password : string = req.body.password;
  try {
      let user : User = await login(email, password);
      delete user.password; 
      req.session.user = user;
      req.session.message = {type: "success", message: "Login successful"};
      res.redirect("/");
  } catch (e : any) {
    req.session.message = {type: "error", message: e.message};
    res.redirect("/login");
  }
});

app.post("/logout", async(req, res) => {
  req.session.destroy(() => {
      res.redirect("/login");
  });
});

app.get("/characters", async (req, res) => {
  let data : Character[] = await getCharacters();

  let q = req.query.q as string ?? "";
  let filteredCharacters: Character[] = data.filter((character) => {
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
    } else if (sortField === "cost") {
      return sortDirection === "asc" ? a.cost - b.cost : b.cost - a.cost;
    } else if (sortField === "power") {
      return sortDirection === "asc" ? a.power - b.power : b.power - a.power;  
    } else if (sortField === "rarity") {
      return sortDirection === "asc" ? Number(b.upgradeable) - Number(a.upgradeable) : Number(a.upgradeable) - Number(b.upgradeable);
    } else {
      return 0;
    }
  });

  console.log('Sorted cards:', sortedCards);


  res.render("characters", {
    data: filteredCharacters,
    filteredCharacters: sortedCards,
    q: q 
  });
});



app.get("/detail/:id", async (req, res) => {
  let data : Character[] = await getCharacters();

  const cardId = req.params.id;
  
  const clickedCard = data.find(character => character.id === cardId);

  console.log(clickedCard);

  res.render("detail", {
      clickedCard: clickedCard
  });
});

app.post("/detail/:id/update", async(req, res) => {
  let id : string = req.params.id;
  let user : Character = req.body;
  await updateCharacter(id, user);
  res.redirect("/characters");
});

app.get("/groups", async (req, res) => {
  let data: Character[] = await getCharacters();

  res.render("groups", {
      data: data
  });
});

app.get("/groupdetail/:id", async (req, res) => {
    const groups: Character[] = await getCharacters();

    const groupId = req.params.id;
    
    const clickedGroup = groups.find(character => character.group.id === groupId);

    console.log(clickedGroup);

    res.render("groupdetail", {
        clickedGroup: clickedGroup
    });
});

app.listen(app.get("port"), async () => {
  try {
    await connect();
    console.log("Server started on http://localhost:" + app.get('port'));
} catch (e) {
    console.log(e);
    process.exit(1); 
}
});
