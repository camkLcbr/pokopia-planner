/**
 * Toolbar - Barre d'outils flottante
 */

export class Toolbar {
  constructor(containerId, toolSystem, mapGrid, renderer) {
    this.container = document.getElementById(containerId);
    this.toolSystem = toolSystem;
    this.mapGrid = mapGrid;
    this.renderer = renderer;

    this.render();
    this.setupEventListeners();
  }

  /**
   * Rendu de la toolbar (vertical, compact)
   */
  render() {
    this.container.innerHTML = `
      <button class="tool-btn active" data-tool="brush" title="Brush">
        🖌️
      </button>
      <button class="tool-btn" data-tool="erase" title="Erase">
        🧹
      </button>
      <button class="tool-btn" data-tool="fill" title="Fill">
        🪣
      </button>
      <button class="tool-btn" data-tool="rectangle" title="Rect">
        ▭
      </button>
      <button class="tool-btn" data-tool="eyedropper" title="Picker">
        💧
      </button>

      <div class="toolbar-separator"></div>

      <button class="tool-btn" data-action="undo" title="Undo">
        ↶
      </button>
      <button class="tool-btn" data-action="redo" title="Redo">
        ↷
      </button>

      <div class="toolbar-separator"></div>

      <button class="tool-btn" data-action="save" title="Save">
        💾
      </button>
      <button class="tool-btn" data-action="export-png" title="PNG">
        📤
      </button>
      <button class="tool-btn" data-action="export-json" title="JSON">
        📥
      </button>

      <div class="toolbar-separator"></div>

      <button class="tool-btn" data-action="clear" title="Clear">
        🗑️
      </button>
    `;
  }

  /**
   * Event listeners
   */
  setupEventListeners() {
    // Click sur les boutons
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.tool-btn');
      if (!btn) return;

      const tool = btn.dataset.tool;
      const action = btn.dataset.action;

      if (tool) {
        this.selectTool(tool, btn);
      } else if (action) {
        this.handleAction(action);
      }
    });

    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
      // Ignore si focus dans input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+Z / Ctrl+Y
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          this.handleAction('undo');
        } else if (e.key === 'y') {
          e.preventDefault();
          this.handleAction('redo');
        } else if (e.key === 's') {
          e.preventDefault();
          this.handleAction('save');
        }
      } else {
        // Lettres simples pour outils
        this.toolSystem.handleKeyPress(e.key);
        this.updateActiveButton();
      }
    });
  }

  /**
   * Sélectionne un outil
   */
  selectTool(toolName, button) {
    // Retire active
    this.container.querySelectorAll('[data-tool]').forEach(btn => {
      btn.classList.remove('active');
    });

    // Active le nouveau
    if (button) {
      button.classList.add('active');
    }

    this.toolSystem.setTool(toolName);
  }

  /**
   * Met à jour le bouton actif (après raccourci clavier)
   */
  updateActiveButton() {
    const currentTool = this.toolSystem.getCurrentTool();

    this.container.querySelectorAll('[data-tool]').forEach(btn => {
      if (btn.dataset.tool === currentTool) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Gère les actions (save, export, etc.)
   */
  handleAction(action) {
    switch (action) {
      case 'undo':
        if (this.mapGrid.undo()) {
          this.onMapChanged?.();
        }
        break;

      case 'redo':
        if (this.mapGrid.redo()) {
          this.onMapChanged?.();
        }
        break;

      case 'save':
        this.saveMap();
        break;

      case 'export-png':
        this.exportPNG();
        break;

      case 'export-json':
        this.exportJSON();
        break;

      case 'clear':
        if (confirm('Effacer toute la carte ? Cette action est irréversible.')) {
          this.mapGrid.clear();
          this.onMapChanged?.();
        }
        break;
    }

    this.updateButtonStates();
  }

  /**
   * Sauvegarde dans localStorage
   */
  saveMap() {
    const cityId = this.currentCityId || 'palette-town';
    this.mapGrid.saveToLocalStorage(cityId);

    this.showSaveIndicator();
  }

  /**
   * Export PNG
   */
  exportPNG() {
    const cityId = this.currentCityId || 'palette-town';
    this.renderer.exportPNG(`pokopia-${cityId}.png`);
  }

  /**
   * Export JSON
   */
  exportJSON() {
    const cityId = this.currentCityId || 'palette-town';
    const data = this.mapGrid.exportJSON();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `pokopia-${cityId}.json`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Indicateur de sauvegarde
   */
  showSaveIndicator() {
    let indicator = document.querySelector('.save-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'save-indicator';
      document.body.appendChild(indicator);
    }

    indicator.textContent = '✓ Sauvegardé';
    indicator.classList.add('show');

    setTimeout(() => {
      indicator.classList.remove('show');
    }, 2000);
  }

  /**
   * Met à jour l'état des boutons (enable/disable)
   */
  updateButtonStates() {
    const undoBtn = this.container.querySelector('[data-action="undo"]');
    const redoBtn = this.container.querySelector('[data-action="redo"]');

    if (undoBtn) {
      undoBtn.disabled = !this.mapGrid.canUndo();
    }

    if (redoBtn) {
      redoBtn.disabled = !this.mapGrid.canRedo();
    }
  }

  /**
   * Définit l'ID de la ville courante
   */
  setCityId(cityId) {
    this.currentCityId = cityId;
  }

  /**
   * Callback quand la map change
   */
  setOnMapChanged(callback) {
    this.onMapChanged = callback;
  }
}
