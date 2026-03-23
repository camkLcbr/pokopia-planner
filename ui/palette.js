/**
 * Palette - Gestion de la palette de tuiles (drag & drop)
 */

export class Palette {
  constructor(containerId, tilesData, onTileSelect) {
    this.container = document.getElementById(containerId);
    this.tilesData = tilesData;
    this.onTileSelect = onTileSelect;

    this.selectedTile = null;

    this.render();
    this.setupEventListeners();
  }

  /**
   * Rendu de la palette par catégories
   */
  render() {
    const categories = {
      terrain: { icon: '🎨', title: 'Terrain' },
      buildings: { icon: '🏠', title: 'Bâtiments' },
      decor: { icon: '💧', title: 'Décor' },
      habitat: { icon: '🐾', title: 'Habitats' }
    };

    let html = '';

    for (const [categoryId, categoryInfo] of Object.entries(categories)) {
      const tiles = Object.entries(this.tilesData).filter(
        ([id, tile]) => tile.category === categoryId
      );

      if (tiles.length === 0) continue;

      html += `
        <h3>${categoryInfo.icon} ${categoryInfo.title}</h3>
        <div class="tile-group" data-category="${categoryId}">
          ${tiles.map(([tileId, tile]) => this.renderTile(tileId, tile)).join('')}
        </div>
      `;
    }

    this.container.innerHTML = html;
  }

  /**
   * Rendu d'une tuile individuelle
   */
  renderTile(tileId, tile) {
    const style = tile.gradient
      ? `background: ${tile.gradient};`
      : `background: ${tile.color};`;

    const tooltip = `${tile.name} (${tile.size[0]}×${tile.size[1]})`;

    return `
      <div
        class="tile"
        data-tile="${tileId}"
        draggable="true"
        style="${style}"
        title="${tooltip}"
        data-name="${tile.name}"
      ></div>
    `;
  }

  /**
   * Event listeners
   */
  setupEventListeners() {
    // Drag start
    this.container.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('tile')) {
        const tileId = e.target.dataset.tile;
        e.dataTransfer.setData('text/plain', tileId);
        e.dataTransfer.effectAllowed = 'copy';

        // Feedback visuel
        e.target.style.opacity = '0.5';
        setTimeout(() => {
          e.target.style.opacity = '1';
        }, 100);
      }
    });

    // Click pour sélectionner (alternative au drag)
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('tile')) {
        const tileId = e.target.dataset.tile;
        this.selectTile(tileId);
      }
    });
  }

  /**
   * Sélectionne une tuile
   */
  selectTile(tileId) {
    // Retire sélection précédente
    const prevSelected = this.container.querySelector('.tile.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }

    // Nouvelle sélection
    const tileElement = this.container.querySelector(`[data-tile="${tileId}"]`);
    if (tileElement) {
      tileElement.classList.add('selected');
      this.selectedTile = tileId;

      // Callback
      if (this.onTileSelect) {
        this.onTileSelect(tileId, this.tilesData[tileId]);
      }
    }
  }

  /**
   * Obtient la tuile sélectionnée
   */
  getSelectedTile() {
    return this.selectedTile;
  }

  /**
   * Filtre les tuiles par catégorie
   */
  filterByCategory(categoryId) {
    const groups = this.container.querySelectorAll('.tile-group');

    groups.forEach(group => {
      if (categoryId === 'all' || group.dataset.category === categoryId) {
        group.style.display = 'flex';
      } else {
        group.style.display = 'none';
      }
    });
  }

  /**
   * Recherche par nom
   */
  search(query) {
    const tiles = this.container.querySelectorAll('.tile');
    const lowerQuery = query.toLowerCase();

    tiles.forEach(tile => {
      const name = tile.dataset.name.toLowerCase();
      if (name.includes(lowerQuery)) {
        tile.style.display = 'block';
      } else {
        tile.style.display = 'none';
      }
    });
  }

  /**
   * Reset filtre
   */
  resetFilter() {
    this.filterByCategory('all');
    const tiles = this.container.querySelectorAll('.tile');
    tiles.forEach(tile => {
      tile.style.display = 'block';
    });
  }
}
