/**
 * MapLoader - Charge et applique les presets de cartes prédéfinies
 */

export class MapLoader {
  constructor() {
    this.mapsCache = {};
  }

  /**
   * Charge les données d'une carte depuis le JSON
   */
  async loadMapData(cityId) {
    if (this.mapsCache[cityId]) {
      return this.mapsCache[cityId];
    }

    try {
      const response = await fetch(`./data/maps/${cityId}.json`);
      if (!response.ok) {
        console.warn(`Aucune carte prédéfinie pour ${cityId}`);
        return null;
      }

      const data = await response.json();
      this.mapsCache[cityId] = data;
      return data;
    } catch (error) {
      console.error(`Erreur chargement carte ${cityId}:`, error);
      return null;
    }
  }

  /**
   * Applique un preset de carte sur une MapGrid
   */
  applyPreset(mapGrid, preset) {
    if (!preset || !Array.isArray(preset)) {
      console.warn('Preset invalide');
      return;
    }

    console.log(`📋 Application de ${preset.length} instructions`);

    preset.forEach((instruction, index) => {
      console.log(`▶️ Instruction ${index + 1}: ${instruction.type}`);

      switch (instruction.type) {
        case 'fill':
          this.applyFill(mapGrid, instruction);
          break;
        case 'rect':
          this.applyRect(mapGrid, instruction);
          break;
        case 'island':
          this.applyIsland(mapGrid, instruction);
          break;
        default:
          console.warn(`Type d'instruction inconnu: ${instruction.type}`);
      }
    });

    console.log('✅ Toutes les instructions appliquées');
  }

  /**
   * Remplit toute la carte avec une tuile
   */
  applyFill(mapGrid, instruction) {
    const { tile, x = 0, y = 0, width, height } = instruction;
    const w = width || mapGrid.width;
    const h = height || mapGrid.height;

    console.log(`🎨 Fill: ${tile} (${w}x${h})`);

    // Utilise fillRect pour optimiser (pas de boucle)
    mapGrid.fillRect(x, y, x + w - 1, y + h - 1, tile);

    console.log(`✅ Fill terminé`);
  }

  /**
   * Dessine un rectangle
   */
  applyRect(mapGrid, instruction) {
    const { tile, x, y, width, height } = instruction;

    console.log(`📐 Rect: ${tile} (${width}x${height})`);

    // Utilise fillRect pour optimiser
    mapGrid.fillRect(x, y, x + width - 1, y + height - 1, tile);

    console.log(`✅ Rect terminé`);
  }

  /**
   * Dessine une île avec contour et intérieur
   */
  applyIsland(mapGrid, instruction) {
    const { outline, terrain, interior, name } = instruction;

    if (!outline || !Array.isArray(outline) || outline.length < 3) {
      console.warn('Outline invalide pour île');
      return;
    }

    console.log(`🏝️ Île: ${name || 'Sans nom'} - Contour: ${terrain}, Intérieur: ${interior}`);

    // 1. Remplit l'intérieur avec l'algorithme de scan-line
    if (interior) {
      this.fillPolygon(mapGrid, outline, interior);
    }

    // 2. Dessine le contour (bord de sable)
    if (terrain) {
      this.drawPolygonOutline(mapGrid, outline, terrain);
    }
  }

  /**
   * Remplit un polygone avec une tuile (optimisé)
   */
  fillPolygon(mapGrid, outline, tile) {
    // Trouve les limites du polygone
    const xs = outline.map(p => p[0]);
    const ys = outline.map(p => p[1]);
    const minX = Math.max(0, Math.min(...xs));
    const maxX = Math.min(mapGrid.width - 1, Math.max(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxY = Math.min(mapGrid.height - 1, Math.max(...ys));

    // Sauvegarde l'historique une seule fois
    mapGrid.saveToHistory();

    // Pour chaque ligne Y
    for (let y = minY; y <= maxY; y++) {
      // Trouve toutes les intersections avec cette ligne horizontale
      const intersections = [];

      for (let i = 0; i < outline.length; i++) {
        const [x1, y1] = outline[i];
        const [x2, y2] = outline[(i + 1) % outline.length];

        // Vérifie si le segment croise la ligne y
        if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
          // Calcule l'intersection X
          const x = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
          intersections.push(x);
        }
      }

      // Trie les intersections
      intersections.sort((a, b) => a - b);

      // Remplit entre les paires d'intersections avec fillLine (optimisé)
      for (let i = 0; i < intersections.length - 1; i += 2) {
        const startX = Math.max(minX, Math.ceil(intersections[i]));
        const endX = Math.min(maxX, Math.floor(intersections[i + 1]));

        // Utilise fillLine au lieu de boucle pixel par pixel
        mapGrid.fillLine(y, startX, endX, tile);
      }
    }

    mapGrid.updateStats();
  }

  /**
   * Dessine le contour d'un polygone (1 pixel d'épaisseur)
   */
  drawPolygonOutline(mapGrid, outline, tile) {
    for (let i = 0; i < outline.length; i++) {
      const [x1, y1] = outline[i];
      const [x2, y2] = outline[(i + 1) % outline.length];

      this.drawLine(mapGrid, x1, y1, x2, y2, tile);
    }
  }

  /**
   * Dessine une ligne avec l'algorithme de Bresenham (optimisé)
   */
  drawLine(mapGrid, x1, y1, x2, y2, tile) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      // Place la tuile (écriture directe pour optimiser)
      if (x >= 0 && x < mapGrid.width && y >= 0 && y < mapGrid.height) {
        mapGrid.data[y][x] = tile;
      }

      // Fin de ligne
      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * Charge et applique une carte complète
   */
  async loadAndApply(mapGrid, cityId) {
    const mapData = await this.loadMapData(cityId);

    if (!mapData) {
      console.warn(`Aucune carte trouvée pour ${cityId}`);
      return false;
    }

    // Cas 1 : Carte RLE-encoded (format d'export complet)
    if (mapData.encoding === 'rle' && mapData.data) {
      console.log(`📍 Chargement carte RLE pour ${cityId}`);
      mapGrid.importJSON(mapData);
      return true;
    }

    // Cas 2 : Carte preset-based (format ancien avec instructions)
    if (mapData.presets && mapData.presets.default) {
      console.log(`📍 Application du preset pour ${cityId}`);
      this.applyPreset(mapGrid, mapData.presets.default);
      return true;
    }

    console.warn(`Format de carte non supporté pour ${cityId}`);
    return false;
  }
}
