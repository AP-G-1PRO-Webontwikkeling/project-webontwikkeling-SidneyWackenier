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
    groupAbility: string;
    alignment: "Good" | "Evil";
    members: number;
}