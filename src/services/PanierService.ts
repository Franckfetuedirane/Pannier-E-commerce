// src/services/PanierService.ts
import { ArticlePanier } from '../models/ArticlePanier';
import { Produit } from '../models/produit';

export class PanierService {
    private articles: ArticlePanier[] = [];
    private listeners: (() => void)[] = [];

    constructor() {
        this.chargerPanier();
    }

    // Ajouter un produit au panier
    ajouterProduit(produit: Produit, quantite: number = 1): boolean {
        if (produit.stock < quantite) {
            alert(`Désolé, il n'y a que ${produit.stock} unités disponibles en stock.`);
            return false;
        }

        const articleExistant = this.articles.find(a => a.produit.id === produit.id);
        
        if (articleExistant) {
            // Vérifier si le stock est suffisant
            if (produit.stock < articleExistant.quantite + quantite) {
                alert(`Désolé, il n'y a que ${produit.stock} unités disponibles en stock.`);
                return false;
            }
            
            articleExistant.quantite += quantite;
        } else {
            this.articles.push({ produit, quantite });
        }
        
        this.notifierObservateurs();
        return true;
    }

    // Supprimer un article du panier
    supprimerArticle(produitId: number): void {
        this.articles = this.articles.filter(a => a.produit.id !== produitId);
        this.notifierObservateurs();
    }

    // Modifier la quantité d'un article
    modifierQuantite(produitId: number, quantite: number): boolean {
        const article = this.articles.find(a => a.produit.id === produitId);
        
        if (article) {
            if (quantite <= 0) {
                this.supprimerArticle(produitId);
                return true;
            }
            
            
            // Vérifier si le stock est suffisant
            if (article.produit.stock < quantite) {
                alert(`Désolé, il n'y a que ${article.produit.stock} unités disponibles en stock.`);
                return false;
            }
            
            article.quantite = quantite;
            this.notifierObservateurs();
            return true;
        }
        
        return false;
    }

    // Vider le panier
    viderPanier(): void {
        this.articles = [];
        this.notifierObservateurs();
    }

    // Obtenir tous les articles du panier
    getArticles(): ArticlePanier[] {
        return [...this.articles];
    }

    // Calculer le total du panier
    calculerTotal(): number {
        return this.articles.reduce((total, article) => 
            total + (article.produit.prix * article.quantite), 0);
    }

    // Nombre total d'articles dans le panier
    getNombreArticles(): number {
        return this.articles.reduce((count, article) => count + article.quantite, 0);
    }

    // S'abonner aux changements du panier
    abonner(callback: () => void): void {
        this.listeners.push(callback);
    }

    // Se désabonner aux changements
    desabonner(callback: () => void): void {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    // Notifier tous les observateurs d'un changement
    private notifierObservateurs(): void {
        this.listeners.forEach(callback => callback());
        this.sauvegarderPanier();
    }

    // Sauvegarder le panier dans le localStorage
    private sauvegarderPanier(): void {
        localStorage.setItem('panier', JSON.stringify(this.articles));
    }

    // Charger le panier depuis le localStorage
    private chargerPanier(): void {
        const panierSauvegarde = localStorage.getItem('panier');
        if (panierSauvegarde) {
            try {
                this.articles = JSON.parse(panierSauvegarde);
                this.notifierObservateurs();
            } catch (e) {
                console.error("Erreur lors du chargement du panier:", e);
            }
        }
    }

    // Simuler un paiement
    effectuerPaiement(): Promise<boolean> {
        return new Promise((resolve) => {
            // Simuler un délai de traitement
            setTimeout(() => {
                const success = Math.random() > 0.1; // 90% de chance de succès
                
                if (success) {
                    this.viderPanier();
                }
                
                resolve(success);
            }, 1500);
        });
    }
}