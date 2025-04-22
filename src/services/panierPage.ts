import { PanierService } from './PanierService.js';
import { ArticlePanier } from '../models/ArticlePanier.js';

declare global {
  interface Window {
    jspdf: any;
  }
}

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
    } else {
      panierArticles.forEach((article: ArticlePanier) => {
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
          const produitId = parseInt((e.target as HTMLElement).getAttribute('data-id')!, 10);
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
          const produitId = parseInt((e.target as HTMLElement).getAttribute('data-id')!, 10);
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
          const produitId = parseInt((e.target as HTMLElement).getAttribute('data-id')!, 10);
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

  let y = 10;
  doc.text('Facture - MaBoutique', 10, y);
  y += 10;

  panierArticles.forEach((article: ArticlePanier) => {
    doc.text(`${article.produit.nom} x ${article.quantite} = ${(article.produit.prix * article.quantite).toFixed(2)} FCFA`, 10, y);
    y += 10;
  });

  doc.text(`Total: ${total.toFixed(2)} FCFA`, 10, y + 5);
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
