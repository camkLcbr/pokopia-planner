/**
 * MapGrid - Gestion de la grille 384×384
 * Historique undo/redo, persistance localStorage
 * Optimisé avec fillLine() pour polygones
 */

export class MapGrid {
  constructor(width = 384, height = 384, defaultTile = 'grass') {
    this.width = width;
    this.height = height;
    this.defaultTile = defaultTile;
    this.data = Array(height).fill().map(() => Array(width).fill(defaultTile));

    // Undo/Redo
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;

    // Stats
    this.modifiedCount = 0;
  }

  /**
   * Obtient la tuile à (x, y)
   */
  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.data[y][x];
  }

  /**
   * Place une tuile à (x, y)
   */
  setTile(x, y, tileId, skipHistory = false) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;

    if (!skipHistory) {
      this.saveToHistory();
    }

    this.data[y][x] = tileId;
    this.updateStats();
    return true;
  }

  /**
   * Remplit une zone rectangulaire
   */
  fillRect(x1, y1, x2, y2, tileId) {
    this.saveToHistory();

    const startX = Math.max(0, Math.min(x1, x2));
    const endX = Math.min(this.width - 1, Math.max(x1, x2));
    const startY = Math.max(0, Math.min(y1, y2));
    const endY = Math.min(this.height - 1, Math.max(y1, y2));

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        this.data[y][x] = tileId;
      }
    }

    this.updateStats();
  }

  /**
   * Remplit une ligne horizontale (optimisé pour polygones)
   */
  fillLine(y, startX, endX, tileId) {
    if (y < 0 || y >= this.height) return;

    const x1 = Math.max(0, startX);
    const x2 = Math.min(this.width - 1, endX);

    for (let x = x1; x <= x2; x++) {
      this.data[y][x] = tileId;
    }
  }

  /**
   * Efface une tuile (remet le terrain par défaut)
   */
  eraseTile(x, y) {
    return this.setTile(x, y, this.defaultTile);
  }

  /**
   * Sauvegarde l'état actuel dans l'historique
   */
  saveToHistory() {
    // Supprime les états "futurs" si on était en mode undo
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Clone profond de la grille
    const snapshot = this.data.map(row => [...row]);
    this.history.push(snapshot);

    // Limite la taille de l'historique
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  /**
   * Undo : retour à l'état précédent
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.data = this.history[this.historyIndex].map(row => [...row]);
      this.updateStats();
      return true;
    }
    return false;
  }

  /**
   * Redo : avance à l'état suivant
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.data = this.history[this.historyIndex].map(row => [...row]);
      this.updateStats();
      return true;
    }
    return false;
  }

  /**
   * Peut-on faire undo/redo ?
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Met à jour les statistiques
   */
  updateStats() {
    this.modifiedCount = this.data.flat().filter(t => t !== this.defaultTile).length;
  }

  /**
   * Compte les tuiles par type
   */
  countTiles() {
    const counts = {};
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.data[y][x];
        counts[tile] = (counts[tile] || 0) + 1;
      }
    }
    return counts;
  }

  /**
   * Export JSON compressé (RLE)
   */
  exportJSON() {
    const flat = this.data.flat();
    const rle = this.compressRLE(flat);

    return {
      width: this.width,
      height: this.height,
      defaultTile: this.defaultTile,
      encoding: 'rle',
      data: rle,
      stats: {
        modified: this.modifiedCount,
        totalTiles: this.width * this.height
      }
    };
  }

  /**
   * Import JSON
   */
  importJSON(json) {
    if (json.encoding === 'rle') {
      const flat = this.decompressRLE(json.data);
      this.data = [];
      for (let i = 0; i < this.height; i++) {
        this.data.push(flat.slice(i * this.width, (i + 1) * this.width));
      }
    } else {
      this.data = json.data;
    }

    this.width = json.width || 384;
    this.height = json.height || 384;
    this.defaultTile = json.defaultTile || 'grass';
    this.updateStats();
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Compression RLE simple
   */
  compressRLE(array) {
    let result = '';
    let current = array[0];
    let count = 1;

    for (let i = 1; i < array.length; i++) {
      if (array[i] === current) {
        count++;
      } else {
        result += `${current}*${count},`;
        current = array[i];
        count = 1;
      }
    }
    result += `${current}*${count}`;

    return result;
  }

  /**
   * Décompression RLE
   */
  decompressRLE(rle) {
    const result = [];
    const parts = rle.split(',');

    for (const part of parts) {
      const [tile, count] = part.split('*');
      for (let i = 0; i < parseInt(count); i++) {
        result.push(tile);
      }
    }

    return result;
  }

  /**
   * Sauvegarde dans localStorage
   */
  saveToLocalStorage(cityId) {
    const data = {
      cityId,
      map: this.exportJSON(),
      date: new Date().toISOString()
    };
    localStorage.setItem(`pokopia-${cityId}`, JSON.stringify(data));
  }

  /**
   * Chargement depuis localStorage
   */
  loadFromLocalStorage(cityId) {
    const saved = localStorage.getItem(`pokopia-${cityId}`);
    if (saved) {
      const data = JSON.parse(saved);
      this.importJSON(data.map);
      return true;
    }
    return false;
  }

  /**
   * Réinitialise la carte
   */
  clear() {
    this.saveToHistory();
    this.data = Array(this.height).fill().map(() => Array(this.width).fill(this.defaultTile));
    this.updateStats();
  }
}
