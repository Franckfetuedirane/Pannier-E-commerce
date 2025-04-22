// src/ui/PanierUI.ts
import { PanierService } from '../services/PanierService.js';
import { ArticlePanier } from '../models/ArticlePanier.js';

export class PanierUI {
    private panierService: PanierService;
    private panierElement!: HTMLElement;
    private contenuElement!: HTMLElement;
    private totalElement!: HTMLElement;
    private nombreArticlesElement!: HTMLElement;
    private estOuvert: boolean = false;

    constructor(panierService: PanierService) {
        this.panierService = panierService;

        const boutonPanier = document.getElementById('bouton-panier');
        this.nombreArticlesElement = document.getElementById('nombre-articles') as HTMLElement;

        const estPagePanier = document.getElementById('conteneur-panier') !== null;

        if (estPagePanier) {
            this.contenuElement = document.getElementById('contenu-panier')!;
            this.totalElement = document.getElementById('total-panier')!;
            document.getElementById('btn-commander')?.addEventListener('click', () => this.commander());
            document.getElementById('btn-vider')?.addEventListener('click', () => this.panierService.viderPanier());
        } else {
            this.creerElementsPanier();
            boutonPanier?.addEventListener('click', () => this.togglePanier());
        }

        this.panierService.abonner(() => this.mettreAJourUI());
        this.mettreAJourUI();
    }

    private creerElementsPanier(): void {
        this.panierElement = document.createElement('div');
        this.panierElement.className = 'mini-panier';
        document.body.appendChild(this.panierElement);

        const boutonPanier = document.getElementById('bouton-panier');
        if (boutonPanier) {
            boutonPanier.addEventListener('click', () => {
                window.location.href = 'panier.html';
            });
        }

        this.contenuElement = document.createElement('div');
        this.contenuElement.className = 'contenu-panier';
        this.contenuElement.style.display = 'none';
        this.panierElement.appendChild(this.contenuElement);

        this.totalElement = document.createElement('div');
        this.totalElement.className = 'total-panier';
        this.contenuElement.appendChild(this.totalElement);

        const boutonsActions = document.createElement('div');
        boutonsActions.className = 'boutons-actions';

        const boutonCommander = document.createElement('button');
        boutonCommander.className = 'bouton-commander';
        boutonCommander.textContent = 'Commander';
        boutonCommander.addEventListener('click', () => this.commander());
        boutonsActions.appendChild(boutonCommander);

        const boutonVider = document.createElement('button');
        boutonVider.className = 'bouton-vider';
        boutonVider.textContent = 'Vider le panier';
        boutonVider.addEventListener('click', () => this.panierService.viderPanier());
        boutonsActions.appendChild(boutonVider);

        this.contenuElement.appendChild(boutonsActions);
    }

    private mettreAJourUI(): void {
        const nombreArticles = this.panierService.getNombreArticles();
        this.nombreArticlesElement.textContent = nombreArticles > 0 ? nombreArticles.toString() : '';
        this.mettreAJourContenu();
        const total = this.panierService.calculerTotal();
        this.totalElement.textContent = `Total: ${total.toFixed(2)} €`;
    }

    private mettreAJourContenu(): void {
        const articles = this.contenuElement.querySelectorAll('.article-panier');
        articles.forEach(article => article.remove());

        const panierVide = this.contenuElement.querySelector('.panier-vide');
        if (panierVide) panierVide.remove();

        const panierArticles = this.panierService.getArticles();

        if (panierArticles.length === 0) {
            const panierVideMsg = document.createElement('div');
            panierVideMsg.className = 'panier-vide';
            panierVideMsg.textContent = 'Votre panier est vide';
            this.contenuElement.insertBefore(panierVideMsg, this.totalElement);
        } else {
            panierArticles.forEach(article => {
                const articleElement = this.creerElementArticle(article);
                this.contenuElement.insertBefore(articleElement, this.totalElement);
            });
        }
    }

    private creerElementArticle(article: ArticlePanier): HTMLElement {
        const articleElement = document.createElement('div');
        articleElement.className = 'article-panier';

        const image = document.createElement('img');
        image.src = article.produit.image;
        image.alt = article.produit.nom;
        articleElement.appendChild(image);

        const info = document.createElement('div');
        info.className = 'info-article';
        info.innerHTML = `
            <div class="nom-article">${article.produit.nom}</div>
            <div class="prix-article">${article.produit.prix.toFixed(2)} € / unité</div>
        `;
        articleElement.appendChild(info);

        const quantiteControl = document.createElement('div');
        quantiteControl.className = 'quantite-control';

        const btnMoins = document.createElement('button');
        btnMoins.textContent = '-';
        btnMoins.addEventListener('click', () => {
            const success = this.panierService.modifierQuantite(article.produit.id, article.quantite - 1);
            if (success) this.mettreAJourUI();
        });

        const quantiteSpan = document.createElement('span');
        quantiteSpan.textContent = article.quantite.toString();

        const btnPlus = document.createElement('button');
        btnPlus.textContent = '+';
        btnPlus.addEventListener('click', () => {
            const success = this.panierService.modifierQuantite(article.produit.id, article.quantite + 1);
            if (success) this.mettreAJourUI();
        });

        quantiteControl.appendChild(btnMoins);
        quantiteControl.appendChild(quantiteSpan);
        quantiteControl.appendChild(btnPlus);
        articleElement.appendChild(quantiteControl);

        const btnSupprimer = document.createElement('button');
        btnSupprimer.className = 'btn-supprimer';
        btnSupprimer.innerHTML = '&times;';
        btnSupprimer.addEventListener('click', () => {
            this.panierService.supprimerArticle(article.produit.id);
        });
        articleElement.appendChild(btnSupprimer);

        return articleElement;
    }

    private togglePanier(): void {
        this.estOuvert = !this.estOuvert;
        this.contenuElement.style.display = this.estOuvert ? 'block' : 'none';
    }

    private async commander(): Promise<void> {
        const articles = this.panierService.getArticles();
        if (articles.length === 0) {
            alert('Votre panier est vide');
            return;
        }

        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Traitement de votre paiement...</p>
        `;
        document.body.appendChild(loadingOverlay);

        try {
            const success = await this.panierService.effectuerPaiement();
            document.body.removeChild(loadingOverlay);

            if (success) {
                alert('Paiement réussi ! Votre commande a été traitée avec succès.');
                this.togglePanier();
            } else {
                alert('Erreur lors du traitement du paiement. Veuillez réessayer.');
            }
        } catch (error) {
            document.body.removeChild(loadingOverlay);
            alert('Une erreur est survenue lors du traitement de votre commande.');
            console.error(error);
        }
    }
}
