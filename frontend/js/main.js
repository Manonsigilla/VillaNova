/**
 * main.js - VillaNova
 * Point d'entrée principal de l'application
 * Charge les événements et initialise l'interface
 */

import { searchModernEvents } from './api.js';
import { transformEventsToVillaNova } from './eventTransformer.js';
import {
    renderEventCards,
    showLoadingState,
    showErrorState,
    announceToScreenReader,
    initializeTheme,
    toggleTheme,
    initializeNavigation,
    initializeFilters,
    initializeSPATabs,
    initializeDynamicCategories,
    initializeContactForm
} from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Vérification basique de l'authentification via localStorage
    const isAuthenticated = localStorage.getItem('vn_authenticated');
    
    if (!isAuthenticated) {
        // Redirection vers la page de connexion si non authentifié
        window.location.href = 'login.html';
        return;
    }

    // Gestion de la déconnexion
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // Suppression de la clé d'authentification
            localStorage.removeItem('vn_authenticated');
            // Redirection vers la page de connexion
            window.location.href = 'login.html';
        });
    }
});

/* Stockage global des événements pour les filtres */
let allEvents = [];

/**
 * Récupère et affiche les événements
 * Utilise l'API OpenAgenda avec transformation locale
 */
async function loadEvents() {
    const container = document.getElementById('events-container');
    
    try {
        /* Afficher l'état de chargement */
        showLoadingState(container);
        console.log('Chargement des événements modernes...');
        
        /* Récupérer les événements via la recherche intelligente */
        const data = await searchModernEvents({
            size: 15
        });
        
        console.log('Événements bruts OpenAgenda:', data);
        
        /* Transformer les événements pour VillaNova */
        const villanovaEvents = transformEventsToVillaNova(data.events);
        console.log('Événements transformés pour VillaNova:', villanovaEvents);
        
        /* Stocker globalement pour les filtres */
        allEvents = villanovaEvents;
        
        /* Afficher les cartes */
        renderEventCards(villanovaEvents, container);
        
        /* Initialiser le menu des catégories dynamiques */
        initializeDynamicCategories(allEvents);
        
        /* Initialiser les filtres */
        initializeFilters(allEvents);
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showErrorState(
            container,
            'Impossible de charger les événements. Veuillez réessayer plus tard.'
        );
    }
}

/**
 * Initialise tous les éléments de l'interface
 */
function initializeUI() {
    /* Initialiser le thème (sombre/clair) */
    initializeTheme();
    
    /* Ajouter le gestionnaire du bouton toggle thème */
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    /* Initialiser la navigation mobile */
    initializeNavigation();
    
    /* Initialiser la navigation SPA (onglets) */
    initializeSPATabs();
    
    /* Initialiser le formulaire de contact */
    initializeContactForm();
}

/**
 * Lance l'application au chargement du DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('VillaNova - Application démarrée');
    initializeUI();
    loadEvents();
});

/* Gestion des erreurs non capturées */
window.addEventListener('error', (event) => {
    console.error('Erreur non capturée:', event.error);
});