import * as readline from 'readline-sync';
import { Character, Group } from './interfaces';
import { Console, error } from 'console';
import { read } from 'fs';
import express from 'express';
import ejs from "ejs";


const app = express();

app.set("view engine", "ejs");
app.set("port", 3000);

let data : Character[];

app.get("/", async (req, res) => {
      let response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-SidneyWackenier/main/deelopdracht/json/dc.json");
      data = await response.json();
      res.render("index", { data });
});

app.listen(app.get("port"), () => {
  console.log("[server] http://localhost:" + app.get("port"));
});
