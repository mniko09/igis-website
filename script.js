'use strict';

// ============================================================
// 1. INIT & RÉFÉRENCES DOM
// Sélection de tous les éléments interactifs de la page
// ============================================================

const header       = document.getElementById('site-header');
const burgerBtn    = document.getElementById('burger-btn');
const mainNav      = document.getElementById('main-nav');
const navOverlay   = document.getElementById('nav-overlay');
const navLinks     = document.querySelectorAll('.nav-link');
const filterBtns   = document.querySelectorAll('.filter-btn');
const etudeCards   = document.querySelectorAll('.etude-card');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');
const backToTop    = document.getElementById('back-to-top');
const contactForm  = document.getElementById('contact-form');
const footerYear   = document.getElementById('footer-year');


// ============================================================
// 2. HEADER SCROLL EFFECT
// Ajoute la classe 'scrolled' au header après 50px de défilement
// Affiche/cache également le bouton retour en haut de page
// ============================================================

const handleScroll = () => {
  // Effet de fond opaque sur le header après 50px de scroll
  if (window.scrollY > 50) {
    header && header.classList.add('scrolled');
  } else {
    header && header.classList.remove('scrolled');
  }

  // Affichage du bouton "back to top" après 400px de scroll
  if (backToTop) {
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
};

window.addEventListener('scroll', handleScroll, { passive: true });

// Appel initial pour gérer le cas où la page est rechargée à mi-hauteur
handleScroll();


// ============================================================
// 3. MENU BURGER (MOBILE)
// Gestion de l'ouverture/fermeture du menu de navigation mobile
// ============================================================

/** Indique si le menu est actuellement ouvert */
let menuOpen = false;

/**
 * Ouvre le menu de navigation mobile.
 * Bloque également le défilement de l'arrière-plan.
 */
const openMenu = () => {
  if (!burgerBtn || !mainNav || !navOverlay) return;
  burgerBtn.classList.add('active');
  mainNav.classList.add('open');
  navOverlay.classList.add('active');
  burgerBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden'; // Empêche le scroll du fond
  menuOpen = true;
};

/**
 * Ferme le menu de navigation mobile.
 * Rétablit le défilement de l'arrière-plan.
 */
const closeMenu = () => {
  if (!burgerBtn || !mainNav || !navOverlay) return;
  burgerBtn.classList.remove('active');
  mainNav.classList.remove('open');
  navOverlay.classList.remove('active');
  burgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = ''; // Rétablit le scroll
  menuOpen = false;
};

// Clic sur le bouton burger : bascule entre ouverture et fermeture
if (burgerBtn) {
  burgerBtn.addEventListener('click', () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

// Clic sur l'overlay (fond semi-transparent) : ferme le menu
if (navOverlay) {
  navOverlay.addEventListener('click', closeMenu);
}

// Clic sur un lien de navigation : ferme le menu et défile vers la section
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
    // Le défilement fluide est géré dans la section 4
  });
});


// ============================================================
// 4. DÉFILEMENT FLUIDE (SMOOTH SCROLL)
// Intercepte les clics sur tous les liens ancre (#...) de la page
// et applique un défilement animé en tenant compte de la hauteur du header
// ============================================================

const HEADER_HEIGHT = 80; // Hauteur fixe du header en pixels

/**
 * Fait défiler la page vers un élément cible de façon fluide.
 * @param {HTMLElement} targetEl - L'élément vers lequel défiler
 */
const smoothScrollTo = (targetEl) => {
  if (!targetEl) return;
  const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
};

// Interception de tous les liens ancres du document
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    // Ignorer les liens vides ou qui ne pointent qu un "#"
    if (!href || href === '#') return;

    const targetEl = document.querySelector(href);
    if (targetEl) {
      e.preventDefault();
      smoothScrollTo(targetEl);

      // Mise à jour de l état active des liens de navigation
      navLinks.forEach((link) => link.classList.remove('active'));
      const matchingNavLink = document.querySelector(`.nav-link[href="${href}"]`);
      if (matchingNavLink) matchingNavLink.classList.add('active');
    }
  });
});


// ============================================================
// 5. NAV ACTIVE AU SCROLL (INTERSECTION OBSERVER)
// Met en évidence le lien de navigation correspondant à la section
// actuellement visible dans le viewport
// ============================================================

/**
 * Met à jour le lien de navigation actif selon l ID de la section visible.
 * @param {string} sectionId - L identifiant de la section visible
 */
const setActiveNavLink = (sectionId) => {
  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${sectionId}`) {
      link.classList.add('active');
    }
  });
};

// Configuration de l observateur : la section est active quand elle occupe
// la zone centrale du viewport (entre 30% et 35% depuis le haut)
const sectionObserverOptions = {
  rootMargin: '-30% 0px -65% 0px',
  threshold: 0,
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      setActiveNavLink(entry.target.id);
    }
  });
}, sectionObserverOptions);

// Observer toutes les sections ayant un ID référencé dans la navigation
document.querySelectorAll('section[id]').forEach((section) => {
  sectionObserver.observe(section);
});


// ============================================================
// 6. FILTRE DES ÉTUDES DE CAS
// Filtrage interactif des cartes d études par catégorie
// ============================================================

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    // 1. Désactiver tous les boutons de filtre
    filterBtns.forEach((b) => b.classList.remove('filter-btn--active'));

    // 2. Activer le bouton cliqué
    btn.classList.add('filter-btn--active');

    // 3. Récupérer la valeur du filtre sélectionné
    const filter = btn.dataset.filter;

    // 4. Compteur pour le stagger d animation (délai progressif)
    let visibleIndex = 0;

    // 5. Afficher/cacher les cartes selon leur catégorie
    etudeCards.forEach((card) => {
      const category = card.dataset.category || '';
      const isVisible = filter === 'all' || category.includes(filter);

      if (isVisible) {
        card.classList.remove('hidden');
        // Délai d apparition progressif (stagger) : 80ms par carte visible
        card.style.transitionDelay = `${visibleIndex * 80}ms`;
        visibleIndex++;
      } else {
        card.classList.add('hidden');
        card.style.transitionDelay = '0ms';
      }
    });
  });
});


// ============================================================
// 7. MODAL — ZOOM SUR UNE ÉTUDE DE CAS
// Affiche les détails d une étude dans une fenêtre modale
// ============================================================

// Références aux éléments internes du modal
const modalImage    = document.getElementById('modal-image');
const modalCategory = document.getElementById('modal-category');
const modalTitle    = document.getElementById('modal-title');
const modalMeta     = document.getElementById('modal-meta');
const modalDesc     = document.getElementById('modal-desc');

/**
 * Ouvre le modal et le remplit avec les données de la carte cliquée.
 * @param {HTMLElement} card - La carte d étude de cas cliquée
 */
const openModal = (card) => {
  if (!modalOverlay) return;

  // Récupération des données depuis la carte
  const imgEl      = card.querySelector('.etude-image');
  const categoryEl = card.querySelector('.etude-category-badge');
  const titleEl    = card.querySelector('.etude-title');
  const metaEl     = card.querySelector('.etude-meta');
  const descEl     = card.querySelector('.etude-desc');

  // Remplissage des éléments du modal
  if (modalImage && imgEl) {
    modalImage.src = imgEl.src;
    modalImage.alt = imgEl.alt || '';
  }
  if (modalCategory && categoryEl) modalCategory.textContent = categoryEl.textContent;
  if (modalTitle    && titleEl)    modalTitle.textContent    = titleEl.textContent;
  if (modalMeta     && metaEl)     modalMeta.textContent     = metaEl.textContent;
  if (modalDesc     && descEl)     modalDesc.textContent     = descEl.textContent;

  // Affichage du modal
  modalOverlay.removeAttribute('hidden');
  // Léger délai pour que la transition CSS se déclenche correctement
  requestAnimationFrame(() => {
    modalOverlay.classList.add('active');
  });

  // Bloquer le scroll de l arrière-plan
  document.body.style.overflow = 'hidden';

  // Focaliser le bouton de fermeture pour l accessibilité clavier
  if (modalClose) {
    setTimeout(() => modalClose.focus(), 100);
  }
};

/**
 * Ferme le modal et rétablit le scroll de la page.
 */
const closeModal = () => {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('active');

  // Attendre la fin de la transition CSS avant de masquer
  modalOverlay.addEventListener('transitionend', () => {
    modalOverlay.setAttribute('hidden', '');
  }, { once: true });

  // Rétablir le scroll du body
  document.body.style.overflow = '';
};

// Clic sur chaque carte d étude : ouvre le modal correspondant
etudeCards.forEach((card) => {
  card.addEventListener('click', () => openModal(card));

  // Accessibilité : ouverture au clavier (Entrée ou Espace)
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card);
    }
  });
});

// Clic sur le bouton de fermeture du modal
if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

// Clic sur l overlay du modal (hors du contenu) : fermer le modal
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    // Ferme uniquement si le clic est sur l overlay lui-même, pas son contenu
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
}


// ============================================================
// 8. ANIMATION D ENTRÉE (INTERSECTION OBSERVER)
// Anime les éléments avec un effet fondu + translation vers le haut
// lorsqu ils entrent dans le viewport
// ============================================================

// Sélection des éléments à animer à l entrée dans le viewport
const animatedEls = document.querySelectorAll(
  '.expertise-card, .etude-card, .about-text, .about-visual, .contact-item'
);

const entranceObserverOptions = {
  threshold: 0.1, // Se déclenche quand 10% de l élément est visible
};

const entranceObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // On arrête d observer une fois l animation jouée (optimisation)
      entranceObserver.unobserve(entry.target);
    }
  });
}, entranceObserverOptions);

// Application du stagger (délai progressif) aux cartes dans une grille
// et observation de chaque élément animable
animatedEls.forEach((el, index) => {
  // Délai de 0 à 300ms selon la position dans le groupe, remis à 0 tous les 4
  const staggerDelay = (index % 4) * 80;
  el.style.transitionDelay = `${staggerDelay}ms`;

  entranceObserver.observe(el);
});


// ============================================================
// 9. FORMULAIRE DE CONTACT — VALIDATION & SIMULATION D ENVOI
// Valide les champs, simule l envoi et affiche un message de succès
// ============================================================

if (contactForm) {
  const submitBtn   = contactForm.querySelector('[type="submit"]');
  const formSuccess = document.getElementById('form-success');
  // Regex simple pour la validation du format email
  const emailRegex  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // --- Validation des champs requis ---
    const requiredFields = contactForm.querySelectorAll('[required]');
    requiredFields.forEach((field) => {
      // Supprimer les erreurs précédentes
      field.classList.remove('error');

      if (!field.value.trim()) {
        field.classList.add('error');
        isValid = false;
      }
    });

    // --- Validation du format email ---
    const emailField = contactForm.querySelector('[type="email"]');
    if (emailField && emailField.value.trim() && !emailRegex.test(emailField.value.trim())) {
      emailField.classList.add('error');
      isValid = false;
    }

    // --- Si le formulaire est invalide : stopper ici ---
    if (!isValid) return;

    // --- Simulation de l envoi ---
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
    }

    setTimeout(() => {
      // Afficher le message de succès
      if (formSuccess) {
        formSuccess.removeAttribute('hidden');
        formSuccess.focus(); // Accessibilité : focaliser le message
      }

      // Réinitialiser le formulaire
      contactForm.reset();

      // Réactiver le bouton d envoi
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer le message';
      }
    }, 1500); // Délai simulé de 1,5 secondes
  });

  // Effacer l état d erreur d un champ dès que l utilisateur commence à saisir
  contactForm.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
    });
  });
}


// ============================================================
// 10. MISE À JOUR DE L ANNÉE EN FOOTER
// Affiche automatiquement l année courante dans le pied de page
// ============================================================

if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}


// ============================================================
// 11. BOUTON RETOUR EN HAUT DE PAGE (BACK TO TOP)
// Défile en douceur vers le haut de la page au clic
// ============================================================

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


// ============================================================
// 12. GESTION GLOBALE DE LA TOUCHE ESCAPE
// Ferme le menu mobile ET/OU le modal si la touche Echap est pressée
// ============================================================

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Fermer le menu burger si ouvert
    if (menuOpen) {
      closeMenu();
    }

    // Fermer le modal si visible
    if (modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  }
});


// ============================================================
// FIN DU SCRIPT — IGIS Group
// Toutes les fonctionnalites sont initialisees au chargement du DOM
// ============================================================