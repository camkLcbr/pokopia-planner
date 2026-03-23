/**
 * i18n - Système de traduction simple FR/EN
 */

const translations = {
  fr: {
    // Home screen
    'home.title': 'Pokopia City Planner',
    'home.subtitle': 'Planifie ta ville Pokémon',
    'home.load': 'Charger',
    'home.new': 'Nouveau',
    'home.start': 'Commencer',
    'home.lastSave': 'Dernière sauvegarde',
    'home.confirmReplace': 'Une sauvegarde existe déjà. La remplacer ?',

    // Category Toolbar - Categories
    'category.terrain': 'Terrains',
    'category.buildings': 'Bâtiments',
    'category.decor': 'Décors',
    'category.habitat': 'Habitats',
    'category.tools': 'Outils',

    // Category Toolbar - Subcategories
    'subcategory.nature': 'Nature',
    'subcategory.chemins': 'Chemins',

    // Category Toolbar - Tools
    'tool.brush': 'Brosse',
    'tool.erase': 'Gomme',
    'tool.fill': 'Remplir',
    'tool.rectangle': 'Rectangle',
    'tool.eyedropper': 'Pipette',

    // Category Toolbar - Brush size
    'brush.label': 'Taille du pinceau',
    'brush.decrease': 'Diminuer (Min: 1)',
    'brush.increase': 'Augmenter (Max: 16)',
    'brush.size': 'Taille du pinceau (1-16)',
    'brush.noTiles': 'Aucune tuile',

    // Tooltips
    'tooltip.undo': 'Annuler (Ctrl+Z)',
    'tooltip.redo': 'Refaire (Ctrl+Y)',
    'tooltip.backgroundImage': 'Charger image de fond',
    'tooltip.backgroundToggle': 'Afficher/Masquer image',
    'tooltip.save': 'Sauvegarder (Ctrl+S)',
    'tooltip.export': 'Exporter en JSON',
    'tooltip.import': 'Importer JSON',
    'tooltip.language': 'Changer la langue',
    'tooltip.home': 'Retour à l\'accueil',

    // Messages
    'message.saved': '✓ Sauvegardé',
    'message.exported': 'Carte exportée',
    'message.imported': 'Carte importée avec succès',
    'message.importError': "Erreur lors de l'import du fichier",
    'message.invalidFormat': 'Format JSON invalide',
    'message.confirmImport': 'Importer "{name}" ?\n\nCette action écrasera la carte actuelle.',
    'message.importCancelled': 'Import annulé par l\'utilisateur',
    'message.imageLoaded': 'Image de fond chargée',
    'message.imageError': "Erreur lors du chargement de l'image",
    'message.imageToggleOn': 'Image de fond : activée',
    'message.imageToggleOff': 'Image de fond : désactivée',
    'message.confirmLeave': 'Vous avez des modifications non sauvegardées.\n\nVoulez-vous sauvegarder avant de quitter ?',
    'message.leaveCancelled': 'Retour à l\'accueil annulé',
  },
  en: {
    // Home screen
    'home.title': 'Pokopia City Planner',
    'home.subtitle': 'Plan your Pokémon city',
    'home.load': 'Load',
    'home.new': 'New',
    'home.start': 'Start',
    'home.lastSave': 'Last save',
    'home.confirmReplace': 'A save already exists. Replace it?',

    // Category Toolbar - Categories
    'category.terrain': 'Terrain',
    'category.buildings': 'Buildings',
    'category.decor': 'Decor',
    'category.habitat': 'Habitats',
    'category.tools': 'Tools',

    // Category Toolbar - Subcategories
    'subcategory.nature': 'Nature',
    'subcategory.chemins': 'Paths',

    // Category Toolbar - Tools
    'tool.brush': 'Brush',
    'tool.erase': 'Erase',
    'tool.fill': 'Fill',
    'tool.rectangle': 'Rectangle',
    'tool.eyedropper': 'Eyedropper',

    // Category Toolbar - Brush size
    'brush.label': 'Brush size',
    'brush.decrease': 'Decrease (Min: 1)',
    'brush.increase': 'Increase (Max: 16)',
    'brush.size': 'Brush size (1-16)',
    'brush.noTiles': 'No tiles',

    // Tooltips
    'tooltip.undo': 'Undo (Ctrl+Z)',
    'tooltip.redo': 'Redo (Ctrl+Y)',
    'tooltip.backgroundImage': 'Load background image',
    'tooltip.backgroundToggle': 'Show/Hide image',
    'tooltip.save': 'Save (Ctrl+S)',
    'tooltip.export': 'Export to JSON',
    'tooltip.import': 'Import JSON',
    'tooltip.language': 'Change language',
    'tooltip.home': 'Back to home',

    // Messages
    'message.saved': '✓ Saved',
    'message.exported': 'Map exported',
    'message.imported': 'Map imported successfully',
    'message.importError': 'Error importing file',
    'message.invalidFormat': 'Invalid JSON format',
    'message.confirmImport': 'Import "{name}"?\n\nThis will overwrite the current map.',
    'message.importCancelled': 'Import cancelled by user',
    'message.imageLoaded': 'Background image loaded',
    'message.imageError': 'Error loading image',
    'message.imageToggleOn': 'Background image: enabled',
    'message.imageToggleOff': 'Background image: disabled',
    'message.confirmLeave': 'You have unsaved changes.\n\nDo you want to save before leaving?',
    'message.leaveCancelled': 'Return to home cancelled',
  }
};

class I18n {
  constructor() {
    // Charge la langue sauvegardée ou utilise le français par défaut
    this.currentLang = localStorage.getItem('pokopia-lang') || 'fr';
    this.listeners = [];
  }

  /**
   * Obtient la langue actuelle
   */
  getLang() {
    return this.currentLang;
  }

  /**
   * Change la langue
   */
  setLang(lang) {
    if (!translations[lang]) {
      console.warn(`Langue "${lang}" non supportée`);
      return;
    }

    this.currentLang = lang;
    localStorage.setItem('pokopia-lang', lang);

    // Notifie tous les listeners
    this.listeners.forEach(callback => callback(lang));
  }

  /**
   * Bascule entre FR et EN
   */
  toggleLang() {
    const newLang = this.currentLang === 'fr' ? 'en' : 'fr';
    this.setLang(newLang);
  }

  /**
   * Traduit une clé
   */
  t(key, params = {}) {
    let text = translations[this.currentLang]?.[key] || translations.fr[key] || key;

    // Remplace les paramètres {name} dans la traduction
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  }

  /**
   * Ajoute un listener pour les changements de langue
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Retire un listener
   */
  offChange(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }
}

// Instance singleton
export const i18n = new I18n();

// Export de la fonction t pour simplifier l'usage
export const t = (key, params) => i18n.t(key, params);
