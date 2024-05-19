import * as readline from 'readline-sync';
import { Character, Group } from './interfaces';
import { Console, error } from 'console';
import { read } from 'fs';
import express from 'express';
import ejs from "ejs";


const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("port", 3000);

let data : Character[];

app.get("/", async (req, res) => {
  let response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-SidneyWackenier/main/deelopdracht/json/dc.json");
  data = await response.json();

  // Filter-functie
  let q = req.query.q as string ?? "";
  let filteredCharacters: Character[] = data.filter((character) => {
    return character.name.toLowerCase().includes(q.toLowerCase());
  });

  // Sorteer-functie
  const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
  const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

  let sortedCards = [...filteredCharacters].sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (sortField === "cost") {
      return sortDirection === "asc" ? a.cost - b.cost : b.cost - a.cost;
    } else if (sortField === "power") {
      return sortDirection === "asc" ? a.power - b.power : b.power - a.power;  
    } else {
      return 0;
    }
  });

  console.log('Sorted cards:', sortedCards);


  res.render("index", {
    data: filteredCharacters,
    filteredCharacters: sortedCards,
    q: q 
  });
});


app.listen(app.get("port"), () => {
  console.log("[server] http://localhost:" + app.get("port"));
});
