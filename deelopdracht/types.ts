import { ObjectId } from "mongodb";


export interface Character {
    id: string;
    name: string;
    description: string;
    cost: number;
    power: number;
    upgradeable: boolean;
    dateadded: string;
    card: string;
    rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Ultra";
    tags: string[];
    group: Group;
        
}

export interface Group {
    id: string;
    name: string;
    logo: string;
    groupAbility: string;
    alignment: "Good" | "Evil";
    members: number;
}

export interface User {
    _id?: ObjectId;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
}

export interface FlashMessage {
    type: "error" | "success"
    message: string;
}