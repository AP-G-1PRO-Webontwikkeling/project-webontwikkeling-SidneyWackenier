export interface Character {
    id: string;
    name: string;
    bio: string;
    firstAppearance: number;
    hero: boolean;
    birthdate: string;
    logo: string;
    type: string;
    abilities: string[];
    group: Group;
        
}

export interface Group {
    id: string;
    name: string;
    foundingYear: number;
    base: string;
}