// src/ui/PanierUI.ts
import { PanierService } from '../services/PanierService';
import { ArticlePanier } from '../models/ArticlePanier';

export class PanierUI {
    private panierService: PanierService;
    private panierElement!: HTMLElement;
    private contenuElement!: HTMLElement;
    private totalElement!: HTMLElement;
    private nombreArticlesElement!: HTMLElement;
    // État d'ouverture du panier
    private estOuvert: boolean = false;

    constructor(panierService: PanierService) {
        this.panierService = panierService;
        
        // Créer les éléments du DOM pour le panier
        this.creerElementsPanier();
        
        // S'abonner aux mises à jour du panier
        this.panierService.abonner(() => this.mettreAJourUI());
        
        // Mise à jour initiale
        this.mettreAJourUI();
    }

    // Création des éléments DOM du panier
    private creerElementsPanier(): void {
        // Création du conteneur principal
        this.panierElement = document.createElement('div');
        this.panierElement.className = 'mini-panier';
        document.body.appendChild(this.panierElement);

        // Bouton du panier
        const boutonPanier = document.createElement('div');
        boutonPanier.className = 'bouton-panier';
        boutonPanier.innerHTML = '<i class="fa fa-shopping-cart"></i>';
        this.nombreArticlesElement = document.createElement('span');
        this.nombreArticlesElement.className = 'nombre-articles';
        boutonPanier.appendChild(this.nombreArticlesElement);
        this.panierElement.appendChild(boutonPanier);

        // Contenu du panier (initialement caché)
        this.contenuElement = document.createElement('div');
        this.contenuElement.className = 'contenu-panier';
        this.contenuElement.style.display = 'none';
        this.panierElement.appendChild(this.contenuElement);

        // Total du panier
        this.totalElement = document.createElement('div');
        this.totalElement.className = 'total-panier';
        this.contenuElement.appendChild(this.totalElement);

        // Boutons d'action
        const boutonsActions = document.createElement('div');
        boutonsActions.className = 'boutons-actions';
        
        // Bouton pour valider la commande
        const boutonCommander = document.createElement('button');
        boutonCommander.className = 'bouton-commander';
        boutonCommander.textContent = 'Commander';
        boutonCommander.addEventListener('click', () => this.commander());
        boutonsActions.appendChild(boutonCommander);

        // Bouton pour vider le panier
        const boutonVider = document.createElement('button');
        boutonVider.className = 'bouton-vider';
        boutonVider.textContent = 'Vider le panier';
        boutonVider.addEventListener('click', () => this.panierService.viderPanier());
        boutonsActions.appendChild(boutonVider);
        
        this.contenuElement.appendChild(boutonsActions);

        // Événement pour ouvrir/fermer le panier
        boutonPanier.addEventListener('click', () => this.togglePanier());
    }

    // Mise à jour de l'interface utilisateur
    private mettreAJourUI(): void {
        // Mise à jour du nombre d'articles
        const nombreArticles = this.panierService.getNombreArticles();
        this.nombreArticlesElement.textContent = nombreArticles > 0 ? nombreArticles.toString() : '';

        // Mise à jour du contenu du panier
        this.mettreAJourContenu();

        // Mise à jour du total
        const total = this.panierService.calculerTotal();
        this.totalElement.textContent = `Total: ${total.toFixed(2)} €`;
    }

    // Mise à jour du contenu du panier
    private mettreAJourContenu(): void {
        // Supprimer les articles actuels (sauf le total et les boutons)
        const articles = this.contenuElement.querySelectorAll('.article-panier');
        articles.forEach(article => article.remove());
        
        // Supprimer le message "panier vide" s'il existe
        const panierVide = this.contenuElement.querySelector('.panier-vide');
        if (panierVide) {
            panierVide.remove();
        }

        // Ajouter les nouveaux articles
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

    // Création d'un élément article pour le panier
    private creerElementArticle(article: ArticlePanier): HTMLElement {
        const articleElement = document.createElement('div');
        articleElement.className = 'article-panier';

        // Image du produit
        const image = document.createElement('img');
        image.src = article.produit.image;
        image.alt = article.produit.nom;
        articleElement.appendChild(image);

        // Informations du produit
        const info = document.createElement('div');
        info.className = 'info-article';
        info.innerHTML = `
            <div class="nom-article">${article.produit.nom}</div>
            <div class="prix-article">${article.produit.prix.toFixed(2)} € / unité</div>
        `;
        articleElement.appendChild(info);

        // Contrôle de quantité
        const quantiteControl = document.createElement('div');
        quantiteControl.className = 'quantite-control';
        
        const btnMoins = document.createElement('button');
        btnMoins.textContent = '-';
        btnMoins.addEventListener('click', () => {
            this.panierService.modifierQuantite(article.produit.id, article.quantite - 1);
        });
        
        const quantiteSpan = document.createElement('span');
        quantiteSpan.textContent = article.quantite.toString();
        
        const btnPlus = document.createElement('button');
        btnPlus.textContent = '+';
        btnPlus.addEventListener('click', () => {
            this.panierService.modifierQuantite(article.produit.id, article.quantite + 1);
        });
        
        quantiteControl.appendChild(btnMoins);
        quantiteControl.appendChild(quantiteSpan);
        quantiteControl.appendChild(btnPlus);
        articleElement.appendChild(quantiteControl);

        // Bouton supprimer
        const btnSupprimer = document.createElement('button');
        btnSupprimer.className = 'btn-supprimer';
        btnSupprimer.innerHTML = '&times;';
        btnSupprimer.addEventListener('click', () => {
            this.panierService.supprimerArticle(article.produit.id);
        });
        articleElement.appendChild(btnSupprimer);

        return articleElement;
    }

    // Ouvrir/fermer le panier
    private togglePanier(): void {
        this.estOuvert = !this.estOuvert;
        this.contenuElement.style.display = this.estOuvert ? 'block' : 'none';
    }

    // Action de commander
    private async commander(): Promise<void> {
        const articles = this.panierService.getArticles();
        if (articles.length === 0) {
            alert('Votre panier est vide');
            return;
        }
        
        // Afficher un écran de chargement
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Traitement de votre paiement...</p>
        `;
        document.body.appendChild(loadingOverlay);
        
        try {
            // Simuler un processus de paiement
            const success = await this.panierService.effectuerPaiement();
            
            // Supprimer l'écran de chargement
            document.body.removeChild(loadingOverlay);
            
            if (success) {
                // Afficher un message de succès
                alert('Paiement réussi ! Votre commande a été traitée avec succès.');
                this.togglePanier(); // Fermer le panier
            } else {
                // Afficher un message d'erreur
                alert('Erreur lors du traitement du paiement. Veuillez réessayer.');
            }
        } catch (error) {
            // Supprimer l'écran de chargement en cas d'erreur
            document.body.removeChild(loadingOverlay);
            alert('Une erreur est survenue lors du traitement de votre commande.');
            console.error(error);
        }
    }
}