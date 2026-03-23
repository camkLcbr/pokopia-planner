/**
 * CategoryToolbar - Toolbar à deux niveaux avec catégories et sous-outils
 */

export class CategoryToolbar {
  constructor(containerId, tilesData, onTileSelect) {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`CategoryToolbar: Container #${containerId} not found!`);
      return;
    }

    this.tilesData = tilesData;
    this.onTileSelect = onTileSelect;

    this.currentCategory = null;
    this.currentTool = 'brush';

    // Définition des catégories avec leurs icônes
    this.categories = {
      terrain: {
        icon: '🟩',
        name: 'Terrains',
        filter: (tile) => tile.category === 'terrain'
      },
      buildings: {
        icon: '🏠',
        name: 'Bâtiments',
        filter: (tile) => tile.category === 'buildings'
      },
      decor: {
        icon: '🌳',
        name: 'Décors',
        filter: (tile) => tile.category === 'decor'
      },
      habitat: {
        icon: '🐾',
        name: 'Habitats',
        filter: (tile) => tile.category === 'habitat'
      },
      tools: {
        icon: '🛠️',
        name: 'Outils',
        special: true
      }
    };

    this.tools = {
      brush: { icon: '🖌️', name: 'Brosse' },
      erase: { icon: '🧹', name: 'Gomme' },
      fill: { icon: '🪣', name: 'Remplir' },
      rectangle: { icon: '▭', name: 'Rectangle' },
      eyedropper: { icon: '💧', name: 'Pipette' }
    };

    // Tailles de pinceau disponibles
    this.brushSizes = [1, 2, 4, 8];
    this.currentBrushSize = 1;
    this.onBrushSizeChange = null;

    this.render();
    this.setupEventListeners();
  }

  /**
   * Rendu de la toolbar principale (seulement les icônes de catégories)
   */
  render() {
    this.container.innerHTML = `
      <div class="category-toolbar-main">
        ${Object.entries(this.categories).map(([key, cat]) => `
          <button
            class="category-btn ${this.currentCategory === key ? 'active' : ''}"
            data-category="${key}"
            title="${cat.name}"
          >
            ${cat.icon}
          </button>
        `).join('')}
      </div>
    `;

    // Crée la toolbar secondaire à côté (initialement cachée)
    const secondaryToolbar = document.createElement('div');
    secondaryToolbar.className = 'category-toolbar-secondary';
    secondaryToolbar.id = 'secondary-toolbar';
    secondaryToolbar.style.display = 'none';
    this.container.appendChild(secondaryToolbar);
  }

  /**
   * Event listeners
   */
  setupEventListeners() {
    // Click sur les boutons de catégorie
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-btn');
      if (btn) {
        const category = btn.dataset.category;
        this.toggleCategory(category);
      }

      // Click sur un tile dans la toolbar secondaire
      const tileBtn = e.target.closest('.tile-btn');
      if (tileBtn) {
        const tileId = tileBtn.dataset.tile;
        this.selectTile(tileId);
      }

      // Click sur un outil
      const toolBtn = e.target.closest('.tool-btn');
      if (toolBtn) {
        const tool = toolBtn.dataset.tool;
        this.selectTool(tool);
      }

      // Click sur une taille de pinceau
      const brushSizeBtn = e.target.closest('.brush-size-btn');
      if (brushSizeBtn) {
        const size = parseInt(brushSizeBtn.dataset.size);
        this.setBrushSize(size);
      }
    });
  }

  /**
   * Toggle l'affichage d'une catégorie
   */
  toggleCategory(category) {
    const secondaryToolbar = document.getElementById('secondary-toolbar');

    // Si on clique sur la catégorie déjà active, on la ferme
    if (this.currentCategory === category) {
      this.currentCategory = null;
      secondaryToolbar.style.display = 'none';
      this.updateCategoryButtons();
      return;
    }

    this.currentCategory = category;
    this.updateCategoryButtons();

    // Affiche la toolbar secondaire avec le contenu approprié
    const categoryData = this.categories[category];

    if (categoryData.special) {
      // Cas spécial : outils
      this.renderToolsSecondary();
    } else {
      // Affiche les tiles de la catégorie
      this.renderTilesSecondary(categoryData);
    }

    secondaryToolbar.style.display = 'flex';
  }

  /**
   * Rendu de la toolbar secondaire avec les tiles
   */
  renderTilesSecondary(categoryData) {
    const secondaryToolbar = document.getElementById('secondary-toolbar');
    const tiles = Object.values(this.tilesData).filter(categoryData.filter);

    if (tiles.length === 0) {
      secondaryToolbar.innerHTML = '<div style="padding: 8px; color: #666; font-size: 12px;">Aucune tuile</div>';
      return;
    }

    secondaryToolbar.innerHTML = tiles.map(tile => `
      <button
        class="tile-btn"
        data-tile="${tile.id}"
        title="${tile.name}"
        style="background: ${tile.gradient || tile.color};"
      >
        <span class="tile-name">${tile.name}</span>
      </button>
    `).join('');
  }

  /**
   * Rendu de la toolbar secondaire avec les outils
   */
  renderToolsSecondary() {
    const secondaryToolbar = document.getElementById('secondary-toolbar');

    // Boutons d'outils
    const toolsHTML = Object.entries(this.tools).map(([key, tool]) => `
      <button
        class="tool-btn ${this.currentTool === key ? 'active' : ''}"
        data-tool="${key}"
        title="${tool.name}"
      >
        ${tool.icon}
        <span class="tool-label">${tool.name}</span>
      </button>
    `).join('');

    // Séparateur + Sélecteur de taille de pinceau
    const brushSizeHTML = `
      <div class="brush-size-separator"></div>
      <div class="brush-size-label">Taille</div>
      <div class="brush-size-selector">
        ${this.brushSizes.map(size => `
          <button
            class="brush-size-btn ${this.currentBrushSize === size ? 'active' : ''}"
            data-size="${size}"
            title="${size}×${size}"
          >
            ${size}×${size}
          </button>
        `).join('')}
      </div>
    `;

    secondaryToolbar.innerHTML = toolsHTML + brushSizeHTML;
  }

  /**
   * Met à jour l'état visuel des boutons de catégorie
   */
  updateCategoryButtons() {
    this.container.querySelectorAll('.category-btn').forEach(btn => {
      if (btn.dataset.category === this.currentCategory) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Sélectionne une tuile
   */
  selectTile(tileId) {
    const tile = this.tilesData[tileId];
    if (tile && this.onTileSelect) {
      this.onTileSelect(tileId, tile);
    }

    // Active automatiquement l'outil brush quand on sélectionne une tuile
    this.selectTool('brush');
  }

  /**
   * Sélectionne un outil
   */
  selectTool(tool) {
    this.currentTool = tool;

    // Met à jour l'affichage si la toolbar outils est ouverte
    if (this.currentCategory === 'tools') {
      this.renderToolsSecondary();
    }

    // Callback externe (vers ToolSystem)
    if (this.onToolSelect) {
      this.onToolSelect(tool);
    }
  }

  /**
   * Définit le callback de sélection d'outil
   */
  setOnToolSelect(callback) {
    this.onToolSelect = callback;
  }

  /**
   * Définit la taille du pinceau
   */
  setBrushSize(size) {
    this.currentBrushSize = size;

    // Met à jour l'affichage si la toolbar outils est ouverte
    if (this.currentCategory === 'tools') {
      this.renderToolsSecondary();
    }

    // Callback externe (vers ToolSystem)
    if (this.onBrushSizeChange) {
      this.onBrushSizeChange(size);
    }
  }

  /**
   * Définit le callback de changement de taille
   */
  setOnBrushSizeChange(callback) {
    this.onBrushSizeChange = callback;
  }

  /**
   * Obtient l'outil courant
   */
  getCurrentTool() {
    return this.currentTool;
  }
}
