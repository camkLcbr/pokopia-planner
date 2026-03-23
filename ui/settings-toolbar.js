/**
 * SettingsToolbar - Toolbar de paramètres en haut à droite
 * Contient : Historique, Fichier, Image de fond
 */

import { icon, initIcons, actionIcons } from '../utils/icons.js';
import { i18n, t } from '../utils/i18n.js';

export class SettingsToolbar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`SettingsToolbar: Container #${containerId} not found!`);
      return;
    }

    // Écoute les changements de langue pour re-render
    i18n.onChange(() => this.updateTooltips());

    this.render();
    this.setupEventListeners();
  }

  /**
   * Rendu de la toolbar
   */
  render() {
    const currentLang = i18n.getLang();
    const langFlag = currentLang === 'fr' ? '🇫🇷' : '🇬🇧';

    this.container.innerHTML = `
      <div class="settings-toolbar-content">
        <!-- Retour à l'accueil -->
        <button class="settings-btn home-btn" id="settings-home-btn" title="${t('tooltip.home')}">
          ${icon('home', 20, 'black')}
        </button>

        <div class="settings-separator"></div>

        <!-- Historique -->
        <button class="settings-btn undo-btn" id="settings-undo-btn" title="${t('tooltip.undo')}">
          ${icon(actionIcons.undo, 20, 'white')}
        </button>
        <button class="settings-btn redo-btn" id="settings-redo-btn" title="${t('tooltip.redo')}">
          ${icon(actionIcons.redo, 20, 'white')}
        </button>

        <div class="settings-separator"></div>

        <!-- Image de fond -->
        <label class="settings-btn background-image-btn" title="${t('tooltip.backgroundImage')}">
          <input type="file" accept="image/*" id="settings-background-input" style="display: none;" />
          ${icon(actionIcons.backgroundImage, 20, 'white')}
        </label>
        <button class="settings-btn background-toggle-btn" id="settings-background-toggle" style="display: none;" title="${t('tooltip.backgroundToggle')}">
          ${icon(actionIcons.backgroundToggle, 20, 'white')}
        </button>
        <div id="settings-opacity-control" style="display: none; width: 48px; padding: 8px 0;">
          <input type="range" min="0" max="100" value="50" id="settings-background-opacity"
                 orient="vertical"
                 style="width: 100%; height: 80px;" />
        </div>

        <div class="settings-separator"></div>

        <!-- Fichier -->
        <button class="settings-btn save-btn" id="settings-save-btn" title="${t('tooltip.save')}">
          ${icon(actionIcons.save, 20, 'white')}
        </button>
        <button class="settings-btn export-btn" id="settings-export-btn" title="${t('tooltip.export')}">
          ${icon(actionIcons.export, 20, 'white')}
        </button>
        <label class="settings-btn import-btn" title="${t('tooltip.import')}">
          <input type="file" accept=".json" id="settings-import-input" style="display: none;" />
          ${icon(actionIcons.import, 20, 'white')}
        </label>

        <div class="settings-separator"></div>

        <!-- Langue -->
        <button class="settings-btn language-btn" id="settings-language-btn" title="${t('tooltip.language')}">
          <span style="font-size: 20px; line-height: 1;">${langFlag}</span>
        </button>
      </div>
    `;

    // Initialise les icônes Lucide
    initIcons();
  }

  /**
   * Met à jour uniquement les tooltips (plus léger que re-render complet)
   */
  updateTooltips() {
    const buttons = {
      'settings-home-btn': 'tooltip.home',
      'settings-undo-btn': 'tooltip.undo',
      'settings-redo-btn': 'tooltip.redo',
      'settings-save-btn': 'tooltip.save',
      'settings-export-btn': 'tooltip.export',
      'settings-language-btn': 'tooltip.language',
      'settings-background-toggle': 'tooltip.backgroundToggle',
    };

    Object.entries(buttons).forEach(([id, key]) => {
      const btn = document.getElementById(id);
      if (btn) btn.title = t(key);
    });

    // Tooltips pour les labels (qui contiennent des inputs cachés)
    const backgroundImageLabel = this.container.querySelector('.background-image-btn');
    if (backgroundImageLabel) {
      backgroundImageLabel.title = t('tooltip.backgroundImage');
    }

    const importLabel = this.container.querySelector('.import-btn');
    if (importLabel) {
      importLabel.title = t('tooltip.import');
    }

    // Met à jour le drapeau
    const langBtn = document.getElementById('settings-language-btn');
    if (langBtn) {
      const currentLang = i18n.getLang();
      const langFlag = currentLang === 'fr' ? '🇫🇷' : '🇬🇧';
      const span = langBtn.querySelector('span');
      if (span) span.textContent = langFlag;
    }

    // Notifie le changement de langue
    if (this.onLanguageChange) {
      this.onLanguageChange(i18n.getLang());
    }
  }

  /**
   * Event listeners
   */
  setupEventListeners() {
    // Home
    const homeBtn = document.getElementById('settings-home-btn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        if (this.onHome) this.onHome();
      });
    }

    // Undo
    const undoBtn = document.getElementById('settings-undo-btn');
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        if (this.onUndo) this.onUndo();
      });
    }

    // Redo
    const redoBtn = document.getElementById('settings-redo-btn');
    if (redoBtn) {
      redoBtn.addEventListener('click', () => {
        if (this.onRedo) this.onRedo();
      });
    }

    // Background image load
    const bgInput = document.getElementById('settings-background-input');
    if (bgInput) {
      bgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && this.onBackgroundImageLoad) {
          this.onBackgroundImageLoad(file);
          // Affiche les contrôles
          document.getElementById('settings-background-toggle').style.display = 'inline-flex';
          document.getElementById('settings-opacity-control').style.display = 'block';
          this.setupBackgroundControls();
        }
      });
    }

    // Save
    const saveBtn = document.getElementById('settings-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (this.onSave) this.onSave();
      });
    }

    // Export
    const exportBtn = document.getElementById('settings-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (this.onExport) this.onExport();
      });
    }

    // Import
    const importInput = document.getElementById('settings-import-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && this.onImport) {
          this.onImport(file);
          e.target.value = '';
        }
      });
    }

    // Language toggle
    const langBtn = document.getElementById('settings-language-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        i18n.toggleLang();
      });
    }
  }

  /**
   * Configure les contrôles d'image de fond
   */
  setupBackgroundControls() {
    const toggleBtn = document.getElementById('settings-background-toggle');
    const opacitySlider = document.getElementById('settings-background-opacity');

    if (toggleBtn && !toggleBtn.dataset.listenerAttached) {
      toggleBtn.addEventListener('click', () => {
        if (this.onBackgroundToggle) this.onBackgroundToggle();
      });
      toggleBtn.dataset.listenerAttached = 'true';
    }

    if (opacitySlider && !opacitySlider.dataset.listenerAttached) {
      opacitySlider.addEventListener('input', (e) => {
        if (this.onBackgroundOpacityChange) {
          this.onBackgroundOpacityChange(e.target.value / 100);
        }
      });
      opacitySlider.dataset.listenerAttached = 'true';
    }
  }

  // Setters pour les callbacks
  setOnHome(callback) {
    this.onHome = callback;
  }

  setOnUndo(callback) {
    this.onUndo = callback;
  }

  setOnRedo(callback) {
    this.onRedo = callback;
  }

  setOnBackgroundImageLoad(callback) {
    this.onBackgroundImageLoad = callback;
  }

  setOnBackgroundToggle(callback) {
    this.onBackgroundToggle = callback;
  }

  setOnBackgroundOpacityChange(callback) {
    this.onBackgroundOpacityChange = callback;
  }

  setOnSave(callback) {
    this.onSave = callback;
  }

  setOnExport(callback) {
    this.onExport = callback;
  }

  setOnImport(callback) {
    this.onImport = callback;
  }

  setOnLanguageChange(callback) {
    this.onLanguageChange = callback;
  }
}
