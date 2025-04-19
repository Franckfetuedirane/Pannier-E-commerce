// src/services/ProduitService.ts
import { Produit } from '../models/produit';

export class ProduitService {
    private produits: Produit[] = [];
    private listeners: ((produits: Produit[]) => void)[] = [];

    // Charger les produits depuis un fichier JSON
    async chargerProduits(): Promise<void> {
        try {
            // Dans un environnement réel, ceci serait un appel fetch
            // Pour cette démonstration, on utilise des données hardcodées
            this.produits = [
                {
                    id: 1,
                    nom: "Smartphone Galaxy S21",
                    categorie: "Électronique",
                    prix: 799.99,
                    image: "https://placeimg.com/250/250/tech",
                    description: "Smartphone haut de gamme avec appareil photo professionnel",
                    stock: 15
                },
                {
                    id: 2,
                    nom: "Laptop ProBook",
                    categorie: "Électronique",
                    prix: 1299.99,
                    image: "https://placeimg.com/250/250/tech",
                    description: "Ordinateur portable pour professionnels",
                    stock: 8
                },
                {
                    id: 3,
                    nom: "Casque Audio Premium",
                    categorie: "Audio",
                    prix: 249.99,
                    image: "https://placeimg.com/250/250/tech",
                    description: "Casque sans fil avec réduction de bruit active",
                    stock: 23
                },
                {
                    id: 4,
                    nom: "Montre Connectée Sport",
                    categorie: "Accessoires",
                    prix: 179.99,
                    image: "https://placeimg.com/250/250/tech",
                    description: "Suivi d'activité et notifications",
                    stock: 12
                },
                {
                    id: 5,
                    nom: "https://placeimg.com/250/250/tech",
                    categorie: "Audio",
                    prix: 89.99,
                    image: "https://via.placeholder.com/150",
                    description: "Son puissant et batterie longue durée",
                    stock: 30
                }
            ];
            
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

    // Trier les produits
    trierProduits(methode: 'prix-asc' | 'prix-desc' | 'nom'): Produit[] {
        const produitsTries = [...this.produits];
        
        switch (methode) {
            case 'prix-asc':
                return produitsTries.sort((a, b) => a.prix - b.prix);
            case 'prix-desc':
                return produitsTries.sort((a, b) => b.prix - a.prix);
            case 'nom':
                return produitsTries.sort((a, b) => a.nom.localeCompare(b.nom));
            default:
                return produitsTries;
        }
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
}