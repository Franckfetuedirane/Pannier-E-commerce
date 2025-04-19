export class ProduitUI {
    constructor(produitService, panierService) {
        this.categoriesUniques = new Set();
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
    async initialiser() {
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
    creerFiltresEtTris() {
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
        const rechercheInput = document.getElementById('recherche');
        const categorieSelect = document.getElementById('filtre-categorie');
        const triSelect = document.getElementById('tri-produits');
        rechercheInput.addEventListener('input', () => this.filtrerProduits());
        categorieSelect.addEventListener('change', () => this.filtrerProduits());
        triSelect.addEventListener('change', () => this.filtrerProduits());
    }
    // Filtrer et trier les produits selon les sélections
    filtrerProduits() {
        const recherche = document.getElementById('recherche').value;
        const categorie = document.getElementById('filtre-categorie').value;
        const tri = document.getElementById('tri-produits').value;
        // Appliquer les filtres
        let produitsFiltres = this.produitService.getProduits();
        // Filtrer par catégorie si nécessaire
        if (categorie !== "Tous") {
            produitsFiltres = produitsFiltres.filter(p => p.categorie === categorie);
        }
        // Filtrer par recherche si nécessaire
        if (recherche.trim() !== "") {
            const termeLower = recherche.toLowerCase();
            produitsFiltres = produitsFiltres.filter(p => p.nom.toLowerCase().includes(termeLower) ||
                p.categorie.toLowerCase().includes(termeLower));
        }
        // Trier les produits
        produitsFiltres = this.produitService.trierProduits(tri);
        // Mettre à jour l'affichage
        this.afficherProduits(produitsFiltres);
    }
    // Afficher les produits dans le conteneur
    afficherProduits(produits) {
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
                    <span class="prix">${produit.prix.toFixed(2)} €</span>
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
//# sourceMappingURL=produitUI.js.map