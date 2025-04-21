import { PanierService } from './src/services/PanierService'; // Corrigez le chemin si nécessaire
const panierService = new PanierService(); // Initialisation du panier
// Mettre à jour l'affichage du panier
function mettreAJourPanier() {
    const contenuPanier = document.getElementById('contenu-panier');
    const totalPanier = document.getElementById('total-panier');
    const panierArticles = panierService.getArticles();
    if (contenuPanier && totalPanier) {
        // Effacer l'ancien contenu
        contenuPanier.innerHTML = '';
        totalPanier.innerHTML = '';
        if (panierArticles.length === 0) {
            contenuPanier.innerHTML = '<p>Votre panier est vide.</p>';
        }
        else {
            // Afficher les articles dans le panier
            panierArticles.forEach((article) => {
                const articleElement = document.createElement('div');
                articleElement.className = 'article-panier';
                articleElement.innerHTML = `
                    <div class="nom-article">${article.produit.nom}</div>
                    <div class="prix-article">${article.produit.prix.toFixed(2)} € / unité</div>
                    <div class="quantite-article">Quantité: ${article.quantite}</div>
                    <button class="btn-supprimer" data-id="${article.produit.id}">Supprimer</button>
                `;
                contenuPanier.appendChild(articleElement);
            });
            // Calculer et afficher le total
            const total = panierService.calculerTotal();
            totalPanier.innerHTML = `Total: ${total.toFixed(2)} €`;
        }
    }
}
// Mettre à jour le nombre d'articles dans le panier dans l'header
function mettreAJourNombreArticles() {
    const nombreArticlesElement = document.getElementById('nombre-articles');
    if (nombreArticlesElement) {
        nombreArticlesElement.textContent = panierService.getNombreArticles().toString();
    }
}
// Gestion des boutons de la page
document.addEventListener('DOMContentLoaded', () => {
    mettreAJourPanier();
    mettreAJourNombreArticles();
    // Gestion du bouton "Vider le panier"
    const btnVider = document.getElementById('btn-vider');
    if (btnVider) {
        btnVider.addEventListener('click', () => {
            panierService.viderPanier();
            mettreAJourPanier();
            mettreAJourNombreArticles();
        });
    }
    // Gestion du bouton "Commander"
    const btnCommander = document.getElementById('btn-commander');
    if (btnCommander) {
        btnCommander.addEventListener('click', async () => {
            const success = await panierService.effectuerPaiement();
            if (success) {
                alert('Votre commande a été passée avec succès!');
                panierService.viderPanier();
                mettreAJourPanier();
                mettreAJourNombreArticles();
            }
            else {
                alert('Échec de la commande. Essayez à nouveau.');
            }
        });
    }
    // Suppression des articles du panier
    const boutonsSupprimer = document.querySelectorAll('.btn-supprimer');
    boutonsSupprimer.forEach(button => {
        button.addEventListener('click', (e) => {
            const produitId = parseInt(e.target.getAttribute('data-id'), 10);
            panierService.supprimerArticle(produitId);
            mettreAJourPanier();
            mettreAJourNombreArticles();
        });
    });
});
//# sourceMappingURL=panierPage.js.map