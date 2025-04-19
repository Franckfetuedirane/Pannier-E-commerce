// ========== POINT D'ENTRÉE ==========
// src/main.ts
// import { ProduitService } from './services/ProduitService';
// import { PanierService } from './services/PanierService';
// import { ProduitUI } from './ui/produitUI';
// import { PanierUI } from './ui/PanierUI';


// src/main.ts
import { ProduitUI } from './ui/produitUI.js';
import { PanierUI } from './ui/PanierUI.js';
import { ProduitService } from './services/ProduitService.js';
import { PanierService } from './services/PanierService.js';




document.addEventListener('DOMContentLoaded', async () => {
    // Créer le header
    // const header = document.createElement('header');
    // header.innerHTML = `
    //     <div class="header-content">
    //         <h1>Mini E-commerce</h1>
    //     </div>
    // `;
    // document.body.appendChild(header);
    
    // Initialiser les services
    const produitService = new ProduitService();
    const panierService = new PanierService();
    
    // Initialiser les interfaces
    const produitUI = new ProduitUI(produitService, panierService);
    const panierUI = new PanierUI(panierService);
    
    // Initialiser l'application
    await produitUI.initialiser();
});