export class ProduitService {
    constructor() {
        this.produits = [];
        this.listeners = [];
    }
    // Charger les produits depuis un fichier JSON
    async chargerProduits() {
        try {
            const response = await fetch('../../data/produit.json');
            if (!response.ok) {
                throw new Error("Fichier JSON introuvable");
            }
            this.produits = await response.json();
            this.notifierObservateurs();
        }
        catch (error) {
            console.error("Erreur lors du chargement des produits:", error);
        }
    }
    // Obtenir tous les produits
    getProduits() {
        return [...this.produits];
    }
    // Obtenir un produit par son ID
    getProduitById(id) {
        return this.produits.find(p => p.id === id);
    }
    // Filtrer les produits par catégorie
    filtrerParCategorie(categorie) {
        if (categorie === "Tous") {
            return this.getProduits();
        }
        return this.produits.filter(p => p.categorie === categorie);
    }
    // Rechercher des produits par nom
    rechercherProduits(terme) {
        const termeMinuscule = terme.toLowerCase();
        return this.produits.filter(p => p.nom.toLowerCase().includes(termeMinuscule) ||
            p.description.toLowerCase().includes(termeMinuscule));
    }
    // S'abonner aux changements
    abonner(callback) {
        this.listeners.push(callback);
    }
    // Se désabonner
    desabonner(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }
    // Notifier les observateurs
    notifierObservateurs() {
        this.listeners.forEach(callback => callback(this.getProduits()));
    }
    // Trier les produits selon le critère spécifié
    trierProduits(produits, critere) {
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
//# sourceMappingURL=ProduitService.js.map