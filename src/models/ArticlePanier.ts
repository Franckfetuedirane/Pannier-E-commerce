// src/models/ArticlePanier.ts
 import { Produit } from '../models/produit';

export interface ArticlePanier {
    produit: Produit;
    quantite: number;
}