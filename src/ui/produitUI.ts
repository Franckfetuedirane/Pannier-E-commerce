// ========== UI ==========
// src/ui/ProduitUI.ts
import { Produit } from '../models/produit.js';
import { ProduitService } from '../services/ProduitService.js';
import { PanierService } from '../services/PanierService.js';

export class ProduitUI {
    private produitService: ProduitService;
    private panierService: PanierService;
    private produitsContainer: HTMLElement;
    private filtresContainer: HTMLElement;
    private categoriesUniques: Set<string> = new Set();

    constructor(produitService: ProduitService, panierService: PanierService) {
        this.produitService = produitService;
        this.panierService = panierService;
        
        // Créer les conteneurs
        this.produitsContainer = document.createElement('div');
        this.produitsContainer.className = 'produits-container';
        
        this.filtresContainer = document.createElement('div');
        this.filtresContainer.className = 'filtres-container';
        
        // Ajouter les conteneurs au DOM
        const main = document.createElement('main');
        main.className = 'main-content';
        
        document.body.appendChild(main);
        main.appendChild(this.filtresContainer);
        main.appendChild(this.produitsContainer);
        
        // S'abonner aux changements de produits
        this.produitService.abonner(produits => this.afficherProduits(produits));
    }

    // Initialiser l'UI
    async initialiser(): Promise<void> {
        // Charger les produits
        await this.produitService.chargerProduits();
        
        // Récupérer toutes les catégories
        const produits = this.produitService.getProduits();
        produits.forEach(p => this.categoriesUniques.add(p.categorie));
        
        // Créer les filtres et tris
        this.creerFiltresEtTris();
        
        // Afficher les produits initiaux
        this.afficherProduits(produits);
    }

    // Créer les filtres et options de tri
    private creerFiltresEtTris(): void {
        // Conteneur pour les filtres
        this.filtresContainer.innerHTML = ` 
            <div class="recherche">
                <input type="text" id="recherche" placeholder="Rechercher un produit...">
            </div>
            <div class="categories">
                <label>Catégorie:</label>
                <select id="filtre-categorie">
                    <option value="Tous">Tous les produits</option>
                    ${Array.from(this.categoriesUniques)
                        .map(cat => `<option value="${cat}">${cat}</option>`)
                        .join('')}
                </select>
            </div>
            <div class="tri">
                <label>Trier par:</label>
                <select id="tri-produits">
                    <option value="prix-asc">Prix croissant</option>
                    <option value="prix-desc">Prix décroissant</option>
                    <option value="nom">Nom</option>
                </select>
            </div>
        `;
        
        // Ajouter les écouteurs d'événements
        const rechercheInput = document.getElementById('recherche') as HTMLInputElement;
        const categorieSelect = document.getElementById('filtre-categorie') as HTMLSelectElement;
        const triSelect = document.getElementById('tri-produits') as HTMLSelectElement;
        
        rechercheInput.addEventListener('input', () => this.filtrerProduits());
        categorieSelect.addEventListener('change', () => this.filtrerProduits());
        triSelect.addEventListener('change', () => this.filtrerProduits());
    }

    // Filtrer et trier les produits selon les sélections
    private filtrerProduits(): void {
        const recherche = (document.getElementById('recherche') as HTMLInputElement).value.trim().toLowerCase();
        const categorie = (document.getElementById('filtre-categorie') as HTMLSelectElement).value;
        const tri = (document.getElementById('tri-produits') as HTMLSelectElement).value as 'prix-asc' | 'prix-desc' | 'nom';
        
        // Appliquer les filtres
        let produitsFiltres = this.produitService.getProduits();
        
        // Filtrer par catégorie si nécessaire
        if (categorie !== "Tous") {
            produitsFiltres = produitsFiltres.filter(p => p.categorie.toLowerCase() === categorie.toLowerCase());
        }
        
        // Filtrer par recherche si nécessaire
        if (recherche !== "") {
            produitsFiltres = produitsFiltres.filter(p => 
                p.nom.toLowerCase().includes(recherche) || 
                p.categorie.toLowerCase().includes(recherche)
            );
        }
        
        // Trier les produits
        produitsFiltres = this.produitService.trierProduits(produitsFiltres, tri);
        
        // Mettre à jour l'affichage
        this.afficherProduits(produitsFiltres);
    }

    // Afficher les produits dans le conteneur
    private afficherProduits(produits: Produit[]): void {
        // Vider le conteneur
        this.produitsContainer.innerHTML = '';
        
        if (produits.length === 0) {
            this.produitsContainer.innerHTML = '<p class="no-products">Aucun produit ne correspond à vos critères.</p>';
            return;
        }
        
        // Créer une carte pour chaque produit
        produits.forEach(produit => {
            const produitElement = document.createElement('div');
            produitElement.className = 'produit-carte';
            
            produitElement.innerHTML = `
                <img src="${produit.image}" alt="${produit.nom}">
                <h3>${produit.nom}</h3>
                <p class="categorie">${produit.categorie}</p>
                <p class="description">${produit.description}</p>
                <div class="prix-stock">
                    <span class="prix">${produit.prix.toFixed(2)} FCFA</span>
                    <span class="stock">Stock: ${produit.stock}</span>
                </div>
            `;
            
            // Bouton d'ajout au panier
            const btnAjouter = document.createElement('button');
            btnAjouter.className = 'btn-ajouter';
            btnAjouter.textContent = 'Ajouter au panier';
            btnAjouter.disabled = produit.stock <= 0;
            
            if (produit.stock <= 0) {
                btnAjouter.classList.add('out-of-stock');
                btnAjouter.textContent = 'Rupture de stock';
            }
            
            btnAjouter.addEventListener('click', () => {
                this.panierService.ajouterProduit(produit);
            });
            
            produitElement.appendChild(btnAjouter);
            this.produitsContainer.appendChild(produitElement);
        });
    }
}
                               