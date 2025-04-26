import { PanierService } from './PanierService.js';
const panierService = new PanierService();
//  Mettre à jour l'affichage du panier
function mettreAJourPanier() {
    const contenuPanier = document.getElementById('contenu-panier');
    const totalPanier = document.getElementById('total-panier');
    const panierArticles = panierService.getArticles();
    if (contenuPanier && totalPanier) {
        contenuPanier.innerHTML = '';
        totalPanier.innerHTML = '';
        if (panierArticles.length === 0) {
            contenuPanier.innerHTML = '<p>Votre panier est vide.</p>';
        }
        else {
            panierArticles.forEach((article) => {
                const articleElement = document.createElement('div');
                articleElement.className = 'article-panier';
                articleElement.innerHTML = `
          <div class="nom-article">${article.produit.nom}</div>
          <div class="prix-article">${article.produit.prix.toFixed(2)} FCFA / unité</div>
          <div class="quantite-article">
            <button class="btn-moins" data-id="${article.produit.id}">-</button>
            <span>${article.quantite}</span>
            <button class="btn-plus" data-id="${article.produit.id}">+</button>
          </div>
          <button class="btn-supprimer" data-id="${article.produit.id}">Supprimer</button>
        `;
                contenuPanier.appendChild(articleElement);
            });
            // Gestion des boutons +/-
            contenuPanier.querySelectorAll('.btn-moins').forEach(button => {
                button.addEventListener('click', (e) => {
                    const produitId = parseInt(e.target.getAttribute('data-id'), 10);
                    const article = panierService.getArticles().find(a => a.produit.id === produitId);
                    if (article) {
                        panierService.modifierQuantite(produitId, article.quantite - 1);
                        mettreAJourPanier();
                        mettreAJourNombreArticles();
                    }
                });
            });
            contenuPanier.querySelectorAll('.btn-plus').forEach(button => {
                button.addEventListener('click', (e) => {
                    const produitId = parseInt(e.target.getAttribute('data-id'), 10);
                    const article = panierService.getArticles().find(a => a.produit.id === produitId);
                    if (article) {
                        panierService.modifierQuantite(produitId, article.quantite + 1);
                        mettreAJourPanier();
                        mettreAJourNombreArticles();
                    }
                });
            });
            // Boutons supprimer
            contenuPanier.querySelectorAll('.btn-supprimer').forEach(button => {
                button.addEventListener('click', (e) => {
                    const produitId = parseInt(e.target.getAttribute('data-id'), 10);
                    panierService.supprimerArticle(produitId);
                    mettreAJourPanier();
                    mettreAJourNombreArticles();
                });
            });
            const total = panierService.calculerTotal();
            totalPanier.innerHTML = `Total: ${total.toFixed(2)} FCFA`;
        }
    }
}
//  Mettre à jour le nombre dans l'icône du panier
function mettreAJourNombreArticles() {
    const nombreArticlesElement = document.getElementById('nombre-articles');
    if (nombreArticlesElement) {
        nombreArticlesElement.textContent = panierService.getNombreArticles().toString();
    }
}
//  Générer une facture PDF
function genererFacturePDF() {
    const panierArticles = panierService.getArticles();
    const total = panierService.calculerTotal();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    // === Petite icône au lieu du logo ===
    doc.setFontSize(30);
    doc.text('', 105, y, { align: 'center' });
    y += 20;
    // === Titre principal ===
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185); // Bleu doux
    doc.setFont("helvetica", "bold");
    doc.text('FACTURE', 105, y, { align: 'center' });
    y += 10;
    // === Sous-titre ===
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("times", "italic");
    doc.text('Merci pour votre commande chez MaBoutique !', 105, y, { align: 'center' });
    y += 20;
    // === En-tête du tableau ===
    doc.setFillColor(41, 128, 185); // Bleu clair
    doc.rect(10, y, 190, 10, 'F'); // Rectangle coloré
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Produit', 15, y + 7);
    doc.text('Quantité', 85, y + 7);
    doc.text('Prix Unitaire', 120, y + 7);
    doc.text('Total', 170, y + 7);
    y += 15;
    // === Corps du tableau ===
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    panierArticles.forEach((article) => {
        doc.text(article.produit.nom, 15, y);
        doc.text(`${article.quantite}`, 90, y);
        doc.text(`${article.produit.prix.toFixed(2)} FCFA`, 120, y);
        const prixTotal = (article.produit.prix * article.quantite).toFixed(2);
        doc.text(`${prixTotal} FCFA`, 170, y);
        y += 10;
    });
    // === Ligne de séparation ===
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(10, y, 200, y);
    y += 10;
    // === Total général ===
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Total à payer :', 120, y);
    doc.text(`${total.toFixed(2)} FCFA`, 170, y);
    // === Date et Remerciement en bas ===
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    y += 30;
    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Date : ${dateStr}`, 10, 290);
    doc.text('À très bientôt sur MaBoutique', 105, 290, { align: 'center' });
    // === Sauvegarder le PDF ===
    doc.save('facture.pdf');
}
//  Initialisation
document.addEventListener('DOMContentLoaded', () => {
    mettreAJourPanier();
    mettreAJourNombreArticles();
    const btnVider = document.getElementById('btn-vider');
    btnVider?.addEventListener('click', () => {
        panierService.viderPanier();
        mettreAJourPanier();
        mettreAJourNombreArticles();
    });
    const btnCommander = document.getElementById('btn-commander');
    btnCommander?.addEventListener('click', async () => {
        const numeroCarte = prompt("💳 Entrez le numéro de votre carte bancaire (16 chiffres) :");
        if (!numeroCarte || numeroCarte.trim().length < 16) {
            alert("❌ Numéro de carte invalide. Veuillez réessayer.");
            return;
        }
        const codeSecurite = prompt("🔒 Entrez le code de sécurité (CVV - 3 chiffres) :");
        if (!codeSecurite || codeSecurite.trim().length !== 3 || isNaN(Number(codeSecurite))) {
            alert("❌ Code de sécurité invalide. Veuillez réessayer.");
            return;
        }
        genererFacturePDF(); // D'abord générer la facture
        const success = await panierService.effectuerPaiement();
        if (success) {
            // genererFacturePDF(); // D'abord générer la facture
            alert('✅ Votre commande a été validée avec succès ! Merci pour votre achat.');
            mettreAJourPanier();
            panierService.viderPanier(); //  Ensuite vider le panier
            mettreAJourNombreArticles();
        }
        else {
            alert('❌ Échec de la commande. Essayez à nouveau.');
        }
    });
    const btnFacture = document.getElementById("btn-facture");
    btnFacture?.addEventListener("click", () => {
        genererFacturePDF();
    });
});
//# sourceMappingURL=panierPage.js.map