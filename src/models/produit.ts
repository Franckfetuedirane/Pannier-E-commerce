// ========== MODÈLES ==========
// src/models/Produit.ts
export interface Produit {
    id: number;
    nom: string;
    categorie: string;
    prix: number;
    image: string;
    description: string;
    stock: number;
}