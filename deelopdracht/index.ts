import * as readline from 'readline-sync';
import { Character, Group } from './interfaces';
import { connect, getCharacters } from "./database";
import { Console, error } from 'console';
import { read } from 'fs';
import express from 'express';
import ejs from "ejs";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.PORT);
console.log(process.env.MONGO_URI);

const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

let data : Character[];

app.get("/", async (req, res) => {
  res.render("index")
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
  
  const clickedCard = data.find(data => data.id === cardId);

  console.log(clickedCard);

  res.render("detail", {
      clickedCard: clickedCard
  });
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
  await connect();
  console.log("Server is running on port " + app.get("port"));
});
