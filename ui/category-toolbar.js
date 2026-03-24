/**
 * CategoryToolbar - Toolbar à deux niveaux avec catégories et sous-outils
 */

import { icon, initIcons, categoryIcons, toolIcons } from '../utils/icons.js';
import { i18n, t } from '../utils/i18n.js';

export class CategoryToolbar {
  constructor(containerId, tilesData, buildingsData, onTileSelect) {
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`CategoryToolbar: Container #${containerId} not found!`);
      return;
    }

    this.tilesData = tilesData;
    this.buildingsData = buildingsData;
    this.onTileSelect = onTileSelect;

    this.currentCategory = null;
    this.currentSubcategory = null; // Nouvelle propriété pour la sous-catégorie
    this.currentTool = 'brush';

    // Définition des catégories avec leurs icônes
    this.categories = {
      terrain: {
        icon: categoryIcons.terrain,
        nameKey: 'category.terrain',
        filter: (tile) => tile.category === 'terrain',
        hasSubcategories: true, // Indique que cette catégorie a des sous-catégories
        subcategories: ['nature', 'chemins'] // Liste des sous-catégories
      },
      buildings: {
        icon: categoryIcons.buildings,
        nameKey: 'category.buildings',
        dataSource: 'buildings', // Indique qu'on utilise buildingsData au lieu de tilesData
        filter: (building) => building.category === 'buildings',
        hasSubcategories: true, // Indique que cette catégorie a des sous-catégories
        subcategories: ['kit'] // Liste des sous-catégories (pour l'instant seulement kit)
      },
      decor: {
        icon: categoryIcons.decor,
        nameKey: 'category.decor',
        filter: (tile) => tile.category === 'decor'
      },
      habitat: {
        icon: categoryIcons.habitat,
        nameKey: 'category.habitat',
        filter: (tile) => tile.category === 'habitat'
      },
      tools: {
        icon: categoryIcons.tools,
        nameKey: 'category.tools',
        special: true
      }
    };

    this.tools = {
      brush: { icon: toolIcons.brush, nameKey: 'tool.brush' },
      erase: { icon: toolIcons.erase, nameKey: 'tool.erase' },
      fill: { icon: toolIcons.fill, nameKey: 'tool.fill' },
      rectangle: { icon: toolIcons.rectangle, nameKey: 'tool.rectangle' },
      eyedropper: { icon: toolIcons.eyedropper, nameKey: 'tool.eyedropper' }
    };

    // Taille de pinceau
    this.currentBrushSize = 1;
    this.onBrushSizeChange = null;

    // Couleur de la tuile active (pour colorer les icônes)
    this.currentTileColor = '#726a5a'; // Couleur par défaut (gris terre)

    // Écoute les changements de langue pour re-render
    i18n.onChange(() => this.onLanguageChange());

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
            title="${t(cat.nameKey)}"
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

      // Click sur une sous-catégorie
      const subcategoryBtn = e.target.closest('.subcategory-btn');
      if (subcategoryBtn) {
        const subcategory = subcategoryBtn.dataset.subcategory;
        this.selectSubcategory(subcategory);
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
      this.currentSubcategory = null;
      secondaryToolbar.style.display = 'none';
      this.updateCategoryButtons();
      return;
    }

    this.currentCategory = category;
    this.currentSubcategory = null; // Reset la sous-catégorie
    this.updateCategoryButtons();

    // Affiche la toolbar secondaire avec le contenu approprié
    const categoryData = this.categories[category];

    if (categoryData.special) {
      // Cas spécial : outils
      this.renderToolsSecondary();
    } else if (categoryData.hasSubcategories) {
      // Affiche les sous-catégories
      this.renderSubcategoriesSecondary(categoryData);
    } else {
      // Affiche les tiles de la catégorie
      this.renderTilesSecondary(categoryData);
    }

    secondaryToolbar.style.display = 'flex';
  }

  /**
   * Rendu de la toolbar secondaire avec les sous-catégories
   */
  renderSubcategoriesSecondary(categoryData) {
    const secondaryToolbar = document.getElementById('secondary-toolbar');

    secondaryToolbar.innerHTML = categoryData.subcategories.map(subcategory => `
      <button
        class="subcategory-btn ${this.currentSubcategory === subcategory ? 'active' : ''}"
        data-subcategory="${subcategory}"
        title="${t('subcategory.' + subcategory)}"
      >
        <span class="subcategory-label">${t('subcategory.' + subcategory)}</span>
      </button>
    `).join('');
  }

  /**
   * Sélectionne une sous-catégorie et affiche ses tiles/buildings
   */
  selectSubcategory(subcategory) {
    this.currentSubcategory = subcategory;
    const categoryData = this.categories[this.currentCategory];

    // Filtre les items par catégorie ET sous-catégorie
    // Pour buildings, filter par la catégorie du building (ex: 'kit')
    // Pour tiles, filter par la subcategory du tile (ex: 'nature', 'chemins')
    const filter = categoryData.dataSource === 'buildings'
      ? (item) => item.category === subcategory
      : (item) => categoryData.filter(item) && item.subcategory === subcategory;

    this.renderTilesSecondary({ filter, dataSource: categoryData.dataSource });
  }

  /**
   * Rendu de la toolbar secondaire avec les tiles
   */
  renderTilesSecondary(categoryData) {
    const secondaryToolbar = document.getElementById('secondary-toolbar');

    // Détermine la source de données (buildings ou tiles)
    const dataSource = categoryData.dataSource === 'buildings' ? this.buildingsData : this.tilesData;
    const items = Object.values(dataSource).filter(categoryData.filter);

    if (items.length === 0) {
      secondaryToolbar.innerHTML = `<div style="padding: 8px; color: #666; font-size: 12px;">${t('brush.noTiles')}</div>`;
      return;
    }

    secondaryToolbar.innerHTML = items.map(item => {
      // Si l'item a un sprite, on affiche l'image, sinon on garde la couleur
      const backgroundStyle = item.sprite
        ? `background-image: url('${item.sprite}'); background-size: cover; background-position: center;`
        : `background: ${item.gradient || item.color};`;

      // Pour les bâtiments, affiche les dimensions dans le nom
      const displayName = item.width && item.depth
        ? `${item.name} (${item.width}×${item.depth})`
        : item.name;

      return `
        <button
          class="tile-btn ${item.sprite ? 'has-sprite' : ''}"
          data-tile="${item.id}"
          title="${displayName}"
          style="${backgroundStyle}"
        >
          <span class="tile-name">${displayName}</span>
        </button>
      `;
    }).join('');
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
          title="${t(tool.nameKey)}"
        >
          ${icon(tool.icon, 18, iconColor)}
          <span class="tool-label">${t(tool.nameKey)}</span>
        </button>
      `;
    }).join('');

    // Séparateur + Sélecteur de taille de pinceau
    const brushSizeHTML = `
      <div class="brush-size-separator"></div>
      <div class="brush-size-label">${t('brush.label')}</div>
      <div class="brush-size-control">
        <button class="brush-size-btn-minus" id="brush-size-minus" title="${t('brush.decrease')}">
          ${icon('minus', 16)}
        </button>
        <input
          type="number"
          id="brush-size-input"
          class="brush-size-input"
          value="${this.currentBrushSize}"
          min="1"
          max="16"
          title="${t('brush.size')}"
        />
        <button class="brush-size-btn-plus" id="brush-size-plus" title="${t('brush.increase')}">
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
   * Sélectionne une tuile ou un bâtiment
   */
  selectTile(tileId) {
    // Cherche dans les tiles ET dans les buildings
    const tile = this.tilesData[tileId] || this.buildingsData[tileId];

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

  /**
   * Gère les changements de langue
   */
  onLanguageChange() {
    // Re-render la toolbar principale pour mettre à jour les tooltips
    this.render();

    // Si une catégorie est ouverte, re-render la toolbar secondaire
    if (this.currentCategory) {
      const categoryData = this.categories[this.currentCategory];
      if (categoryData.special) {
        this.renderToolsSecondary();
      } else {
        this.renderTilesSecondary(categoryData);
      }
    }
  }
}
