/**
 * CategoryToolbar - Toolbar à deux niveaux avec catégories et sous-outils
 */

import { icon, initIcons, categoryIcons, toolIcons } from '../utils/icons.js';

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
        icon: categoryIcons.terrain,
        name: 'Terrains',
        filter: (tile) => tile.category === 'terrain'
      },
      buildings: {
        icon: categoryIcons.buildings,
        name: 'Bâtiments',
        filter: (tile) => tile.category === 'buildings'
      },
      decor: {
        icon: categoryIcons.decor,
        name: 'Décors',
        filter: (tile) => tile.category === 'decor'
      },
      habitat: {
        icon: categoryIcons.habitat,
        name: 'Habitats',
        filter: (tile) => tile.category === 'habitat'
      },
      tools: {
        icon: categoryIcons.tools,
        name: 'Outils',
        special: true
      }
    };

    this.tools = {
      brush: { icon: toolIcons.brush, name: 'Brosse' },
      erase: { icon: toolIcons.erase, name: 'Gomme' },
      fill: { icon: toolIcons.fill, name: 'Remplir' },
      rectangle: { icon: toolIcons.rectangle, name: 'Rectangle' },
      eyedropper: { icon: toolIcons.eyedropper, name: 'Pipette' }
    };

    // Taille de pinceau
    this.currentBrushSize = 1;
    this.onBrushSizeChange = null;

    // Couleur de la tuile active (pour colorer les icônes)
    this.currentTileColor = '#726a5a'; // Couleur par défaut (gris terre)

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
            ${icon(cat.icon, 24)}
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

    // Initialise les icônes Lucide
    initIcons();
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

    // Boutons d'outils avec couleur dynamique pour brush, fill et rectangle
    const toolsHTML = Object.entries(this.tools).map(([key, tool]) => {
      // Outils qui doivent être colorés avec la couleur de la tuile active
      const coloredTools = ['brush', 'fill', 'rectangle'];
      const iconColor = coloredTools.includes(key) ? this.currentTileColor : 'currentColor';

      return `
        <button
          class="tool-btn ${this.currentTool === key ? 'active' : ''}"
          data-tool="${key}"
          title="${tool.name}"
        >
          ${icon(tool.icon, 18, iconColor)}
          <span class="tool-label">${tool.name}</span>
        </button>
      `;
    }).join('');

    // Séparateur + Sélecteur de taille de pinceau
    const brushSizeHTML = `
      <div class="brush-size-separator"></div>
      <div class="brush-size-label">Taille du pinceau</div>
      <div class="brush-size-control">
        <button class="brush-size-btn-minus" id="brush-size-minus" title="Diminuer (Min: 1)">
          ${icon('minus', 16)}
        </button>
        <input
          type="number"
          id="brush-size-input"
          class="brush-size-input"
          value="${this.currentBrushSize}"
          min="1"
          max="16"
          title="Taille du pinceau (1-16)"
        />
        <button class="brush-size-btn-plus" id="brush-size-plus" title="Augmenter (Max: 16)">
          ${icon('plus', 16)}
        </button>
      </div>
      <div class="brush-size-preview">${this.currentBrushSize}×${this.currentBrushSize}</div>
    `;

    secondaryToolbar.innerHTML = toolsHTML + brushSizeHTML;

    // Initialise les icônes Lucide
    initIcons();

    // Setup des événements pour les contrôles de taille
    this.setupBrushSizeControls();
  }

  /**
   * Configure les événements pour les contrôles de taille de pinceau
   */
  setupBrushSizeControls() {
    const minusBtn = document.getElementById('brush-size-minus');
    const plusBtn = document.getElementById('brush-size-plus');
    const input = document.getElementById('brush-size-input');

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        const newSize = Math.max(1, this.currentBrushSize - 1);
        this.setBrushSize(newSize);
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        const newSize = Math.min(16, this.currentBrushSize + 1);
        this.setBrushSize(newSize);
      });
    }

    if (input) {
      input.addEventListener('input', (e) => {
        let value = parseInt(e.target.value);
        if (isNaN(value)) value = 1;
        value = Math.max(1, Math.min(16, value));
        this.setBrushSize(value);
      });

      input.addEventListener('blur', (e) => {
        // Force la valeur correcte si l'input est vide
        if (!e.target.value) {
          e.target.value = this.currentBrushSize;
        }
      });
    }
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

    // Met à jour la couleur de la tuile active
    if (tile) {
      this.setCurrentTileColor(tile.color || tile.gradient || '#726a5a');
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
    this.currentBrushSize = Math.max(1, Math.min(16, size));

    // Met à jour l'input et le preview
    const input = document.getElementById('brush-size-input');
    const preview = document.querySelector('.brush-size-preview');

    if (input) {
      input.value = this.currentBrushSize;
    }

    if (preview) {
      preview.textContent = `${this.currentBrushSize}×${this.currentBrushSize}`;
    }

    // Callback externe (vers ToolSystem)
    if (this.onBrushSizeChange) {
      this.onBrushSizeChange(this.currentBrushSize);
    }
  }

  /**
   * Définit le callback de changement de taille
   */
  setOnBrushSizeChange(callback) {
    this.onBrushSizeChange = callback;
  }

  /**
   * Définit la couleur de la tuile active
   */
  setCurrentTileColor(color) {
    this.currentTileColor = color;

    // Met à jour l'affichage des outils si la toolbar outils est ouverte
    if (this.currentCategory === 'tools') {
      this.renderToolsSecondary();
    }
  }

  /**
   * Obtient l'outil courant
   */
  getCurrentTool() {
    return this.currentTool;
  }
}
