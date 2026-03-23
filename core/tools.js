/**
 * ToolSystem - Gestion des outils (brosse, gomme, remplir, etc.)
 */

export class ToolSystem {
  constructor(mapGrid, renderer) {
    this.mapGrid = mapGrid;
    this.renderer = renderer;

    this.currentTool = 'brush';
    this.currentTile = 'grass';
    this.isDrawing = false;
    this.brushSize = 1; // Taille du pinceau (1×1, 2×2, etc.)

    // Pour outil rectangle
    this.rectStart = null;
  }

  /**
   * Sélectionne l'outil actif
   */
  setTool(toolName) {
    this.currentTool = toolName;
    this.isDrawing = false;
    this.rectStart = null;
  }

  /**
   * Définit la tuile active
   */
  setTile(tileId) {
    this.currentTile = tileId;
  }

  /**
   * Définit la taille du pinceau
   */
  setBrushSize(size) {
    this.brushSize = Math.max(1, Math.min(10, size));
  }

  /**
   * Démarre le dessin
   */
  startDrawing(screenX, screenY) {
    const world = this.renderer.screenToWorld(screenX, screenY);

    if (world.x < 0 || world.x >= 384 || world.y < 0 || world.y >= 384) {
      return;
    }

    this.isDrawing = true;

    switch (this.currentTool) {
      case 'brush':
        this.applyBrush(world.x, world.y);
        break;

      case 'erase':
        this.applyErase(world.x, world.y);
        break;

      case 'fill':
        this.floodFill(world.x, world.y);
        break;

      case 'rectangle':
        this.rectStart = { x: world.x, y: world.y };
        break;

      case 'eyedropper':
        this.pickTile(world.x, world.y);
        break;
    }
  }

  /**
   * Continue le dessin (drag)
   */
  continueDrawing(screenX, screenY) {
    if (!this.isDrawing) return;

    const world = this.renderer.screenToWorld(screenX, screenY);

    if (world.x < 0 || world.x >= 384 || world.y < 0 || world.y >= 384) {
      return;
    }

    switch (this.currentTool) {
      case 'brush':
        this.applyBrush(world.x, world.y);
        break;

      case 'erase':
        this.applyErase(world.x, world.y);
        break;

      case 'rectangle':
        // Preview en temps réel (à implémenter si besoin)
        break;
    }
  }

  /**
   * Termine le dessin
   */
  endDrawing(screenX, screenY) {
    if (!this.isDrawing) return;

    const world = this.renderer.screenToWorld(screenX, screenY);

    if (this.currentTool === 'rectangle' && this.rectStart) {
      if (world.x >= 0 && world.x < 384 && world.y >= 0 && world.y < 384) {
        this.mapGrid.fillRect(
          this.rectStart.x,
          this.rectStart.y,
          world.x,
          world.y,
          this.currentTile
        );
      }
      this.rectStart = null;
    }

    this.isDrawing = false;
  }

  /**
   * Applique le pinceau
   */
  applyBrush(x, y) {
    const half = Math.floor(this.brushSize / 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        // Brosse circulaire
        if (dx * dx + dy * dy <= half * half + half) {
          this.mapGrid.setTile(x + dx, y + dy, this.currentTile, true);
        }
      }
    }

    // Sauvegarde historique à la fin du stroke
    if (!this.lastHistorySave || Date.now() - this.lastHistorySave > 500) {
      this.mapGrid.saveToHistory();
      this.lastHistorySave = Date.now();
    }
  }

  /**
   * Applique la gomme
   */
  applyErase(x, y) {
    const half = Math.floor(this.brushSize / 2);

    for (let dy = -half; dy <= half; dy++) {
      for (let dx = -half; dx <= half; dx++) {
        if (dx * dx + dy * dy <= half * half + half) {
          this.mapGrid.eraseTile(x + dx, y + dy);
        }
      }
    }

    if (!this.lastHistorySave || Date.now() - this.lastHistorySave > 500) {
      this.mapGrid.saveToHistory();
      this.lastHistorySave = Date.now();
    }
  }

  /**
   * Remplissage par inondation (flood fill)
   */
  floodFill(startX, startY) {
    const targetTile = this.mapGrid.getTile(startX, startY);
    if (targetTile === this.currentTile) return; // Déjà la bonne couleur

    this.mapGrid.saveToHistory();

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= 384 || y < 0 || y >= 384) continue;
      if (this.mapGrid.getTile(x, y) !== targetTile) continue;

      visited.add(key);
      this.mapGrid.setTile(x, y, this.currentTile, true);

      // 4-connexité
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
  }

  /**
   * Pipette : récupère la tuile sous le curseur
   */
  pickTile(x, y) {
    const tile = this.mapGrid.getTile(x, y);
    if (tile) {
      this.currentTile = tile;
      // Event pour UI (à écouter)
      this.onTilePicked?.(tile);
    }
  }

  /**
   * Place une tuile depuis drag & drop
   */
  placeTileFromDrop(screenX, screenY, tileId) {
    const world = this.renderer.screenToWorld(screenX, screenY);

    if (world.x >= 0 && world.x < 384 && world.y >= 0 && world.y < 384) {
      this.mapGrid.setTile(world.x, world.y, tileId);
      return true;
    }

    return false;
  }

  /**
   * Raccourcis clavier
   */
  handleKeyPress(key) {
    switch (key.toLowerCase()) {
      case 'b':
        this.setTool('brush');
        break;
      case 'e':
        this.setTool('erase');
        break;
      case 'f':
        this.setTool('fill');
        break;
      case 'r':
        this.setTool('rectangle');
        break;
      case 'i':
        this.setTool('eyedropper');
        break;
      case '[':
        this.setBrushSize(this.brushSize - 1);
        break;
      case ']':
        this.setBrushSize(this.brushSize + 1);
        break;
    }
  }

  /**
   * Obtient le nom de l'outil actif
   */
  getCurrentTool() {
    return this.currentTool;
  }

  /**
   * Obtient la tuile active
   */
  getCurrentTile() {
    return this.currentTile;
  }

  /**
   * Obtient la taille du pinceau
   */
  getBrushSize() {
    return this.brushSize;
  }
}
