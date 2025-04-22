// src/services/ProduitService.ts
import { Produit } from '../models/produit.js';

export class ProduitService {
    private produits: Produit[] = [];
    private listeners: ((produits: Produit[]) => void)[] = [];

    // Charger les produits depuis un fichier JSON
    async chargerProduits(): Promise<void> {
        try {
            const response = await fetch('../../data/produit.json');
            if (!response.ok) {
                throw new Error("Fichier JSON introuvable");
            }
            this.produits = await response.json();
            this.notifierObservateurs();
        } catch (error) {
            console.error("Erreur lors du chargement des produits:", error);
        }
    }

    // Obtenir tous les produits
    getProduits(): Produit[] {
        return [...this.produits];
    }

    // Obtenir un produit par son ID
    getProduitById(id: number): Produit | undefined {
        return this.produits.find(p => p.id === id);
    }

    // Filtrer les produits par catégorie
    filtrerParCategorie(categorie: string): Produit[] {
        if (categorie === "Tous") {
            return this.getProduits();
        }
        return this.produits.filter(p => p.categorie === categorie);
    }

    // Rechercher des produits par nom
    rechercherProduits(terme: string): Produit[] {
        const termeMinuscule = terme.toLowerCase();
        return this.produits.filter(p => 
            p.nom.toLowerCase().includes(termeMinuscule) || 
            p.description.toLowerCase().includes(termeMinuscule)
        );
    }

   

    // S'abonner aux changements
    abonner(callback: (produits: Produit[]) => void): void {
        this.listeners.push(callback);
    }

    // Se désabonner
    desabonner(callback: (produits: Produit[]) => void): void {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    // Notifier les observateurs
    private notifierObservateurs(): void {
        this.listeners.forEach(callback => callback(this.getProduits()));
    }


 // Trier les produits selon le critère spécifié

    trierProduits(produits: Produit[], critere: 'prix-asc' | 'prix-desc' | 'nom'): Produit[] {
        switch (critere) {
            case 'prix-asc':
                return produits.sort((a, b) => a.prix - b.prix);
            case 'prix-desc':
                return produits.sort((a, b) => b.prix - a.prix);
            case 'nom':
                return produits.sort((a, b) => a.nom.localeCompare(b.nom));
            default:
                return produits;
        }
    }
    
}

