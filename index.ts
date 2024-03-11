import * as readline from 'readline-sync';
import { Character, Group } from './interfaces';
import { Console, error } from 'console';
import { read } from 'fs';

async function requestAllData(choice: number) {
    const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-SidneyWackenier/main/json/dc.json")
    if(!response.ok) {
        throw new Error("Watchtower connection failed. Try again.")
    }
    const characters: Character[] = await response.json();
    return characters;
}

async function filterByID(choice: number) {
    const response = await fetch("https://raw.githubusercontent.com/AP-G-1PRO-Webontwikkeling/project-webontwikkeling-SidneyWackenier/main/json/dc.json")
    if (!response.ok) {
        throw new Error("Watchtower connection failed. Try again.")
    }
    const characters: Character[] = await response.json();

    const id: string = readline.question("Enter the ID: "); 
    const filteredCharacter = characters.filter(characters => characters.id === id)
    console.log(filteredCharacter);
    
}


async function main() {
    console.log("Welcome to the Hall of Justice Archives!");
    console.log("Please select one of the following: \n1. View all files \n2. Filter by ID \n3. Exit");
    
    const selection: number = readline.questionInt("Your selection: ");

    if (selection === 1) {
        const characters = await requestAllData(selection);
        console.log(characters);
    }
    else if (selection ===2) {
        await filterByID(selection);
    }
    else if (selection === 3) {
        console.log("Exiting..")
    }
}

main();
