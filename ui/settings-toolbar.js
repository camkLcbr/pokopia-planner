/**
 * SettingsToolbar - Toolbar de paramètres en haut à droite
 * Contient : Historique, Fichier, Image de fond
 */

import { icon, initIcons, actionIcons } from '../utils/icons.js';

export class SettingsToolbar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`SettingsToolbar: Container #${containerId} not found!`);
      return;
    }

    this.render();
    this.setupEventListeners();
  }

  /**
   * Rendu de la toolbar
   */
  render() {
    this.container.innerHTML = `
      <div class="settings-toolbar-content">
        <!-- Historique -->
        <button class="settings-btn undo-btn" id="settings-undo-btn" title="Annuler (Ctrl+Z)">
          ${icon(actionIcons.undo, 20, 'white')}
        </button>
        <button class="settings-btn redo-btn" id="settings-redo-btn" title="Refaire (Ctrl+Y)">
          ${icon(actionIcons.redo, 20, 'white')}
        </button>

        <div class="settings-separator"></div>

        <!-- Image de fond -->
        <label class="settings-btn background-image-btn" title="Charger image de fond">
          <input type="file" accept="image/*" id="settings-background-input" style="display: none;" />
          ${icon(actionIcons.backgroundImage, 20, 'white')}
        </label>
        <button class="settings-btn background-toggle-btn" id="settings-background-toggle" style="display: none;" title="Toggle image">
          ${icon(actionIcons.backgroundToggle, 20, 'white')}
        </button>
        <div id="settings-opacity-control" style="display: none; width: 48px; padding: 8px 0;">
          <input type="range" min="0" max="100" value="50" id="settings-background-opacity"
                 orient="vertical"
                 style="width: 100%; height: 80px;" />
        </div>

        <div class="settings-separator"></div>

        <!-- Fichier -->
        <button class="settings-btn save-btn" id="settings-save-btn" title="Sauvegarder (Ctrl+S)">
          ${icon(actionIcons.save, 20, 'white')}
        </button>
        <button class="settings-btn export-btn" id="settings-export-btn" title="Exporter en JSON">
          ${icon(actionIcons.export, 20, 'white')}
        </button>
        <label class="settings-btn import-btn" title="Importer JSON">
          <input type="file" accept=".json" id="settings-import-input" style="display: none;" />
          ${icon(actionIcons.import, 20, 'white')}
        </label>
      </div>
    `;

    // Initialise les icônes Lucide
    initIcons();
  }

  /**
   * Event listeners
   */
  setupEventListeners() {
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
}
