/**
 * Icon Helper - Génère des icônes Lucide
 */

/**
 * Crée une icône Lucide
 * @param {string} name - Nom de l'icône (ex: 'save', 'brush', 'undo-2')
 * @param {number} size - Taille en pixels (défaut: 20)
 * @param {string} color - Couleur (défaut: 'currentColor')
 * @returns {string} HTML de l'icône
 */
export function icon(name, size = 20, color = 'currentColor') {
  return `<i data-lucide="${name}" style="width: ${size}px; height: ${size}px; color: ${color};"></i>`;
}

/**
 * Initialise toutes les icônes Lucide dans un conteneur
 * À appeler après avoir injecté du HTML contenant des icônes
 * @param {HTMLElement} container - Conteneur optionnel (défaut: document.body)
 */
export function initIcons(container = document.body) {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons({
      icons: lucide.icons,
      attrs: {
        'stroke-width': 2,
        'stroke': 'currentColor',
        'fill': 'none',
      }
    });
  } else {
    console.warn('Lucide Icons not loaded');
  }
}

/**
 * Mapping des catégories vers leurs icônes
 */
export const categoryIcons = {
  terrain: 'layout-grid',
  buildings: 'building',
  decor: 'trees',
  habitat: 'paw-print',
  tools: 'wrench',
};

/**
 * Mapping des outils vers leurs icônes
 */
export const toolIcons = {
  brush: 'brush',
  erase: 'eraser',
  fill: 'paint-bucket',
  rectangle: 'square',
  eyedropper: 'pipette',
};

/**
 * Mapping des actions vers leurs icônes
 */
export const actionIcons = {
  undo: 'undo-2',
  redo: 'redo-2',
  backgroundImage: 'image',
  backgroundToggle: 'eye',
  save: 'save',
  export: 'download',
  import: 'upload',
};
