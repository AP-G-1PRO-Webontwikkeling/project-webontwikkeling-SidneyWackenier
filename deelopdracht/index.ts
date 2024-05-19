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

  let q: string = req.query.q as string ?? "";

  let filteredCharacters: Character[] = data.filter((character) => {
      return character.name.toLowerCase().includes(q.toLowerCase());
  });

console.log('Query parameter q:', q);
console.log('Filtered characters:', filteredCharacters);


  res.render("index", {
      data: data,
      filteredCharacters: filteredCharacters,
      q: q 
  });
});


app.listen(app.get("port"), () => {
  console.log("[server] http://localhost:" + app.get("port"));
});
