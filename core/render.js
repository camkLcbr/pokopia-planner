/**
 * CanvasRenderer - Gestion du rendu canvas avec zoom/pan
 * Optimisation : rendu uniquement de la zone visible
 */

export class CanvasRenderer {
  constructor(canvas, tilesData) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tilesData = tilesData;

    // Transformation viewport
    this.zoom = 0.4; // Niveau de zoom initial (40%)
    this.offsetX = 0;
    this.offsetY = 0;
    this.minZoom = 0.1;
    this.maxZoom = 4.0;

    // Taille d'une tuile dans le monde (en pixels logiques)
    this.tileSize = 4; // 384 blocs × 4px = 1536px canvas

    // Cache de sprites (pour future implémentation)
    this.spriteCache = {};
    this.gridVisible = true;

    // Pan state
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };

    // Touch state (mobile)
    this.touches = [];
    this.lastPinchDistance = 0;
    this.initialPinchDistance = 0;
    this.pinchThreshold = 10; // Seuil pour différencier pan vs zoom

    // Brush preview state
    this.brushPreviewPos = null; // { worldX, worldY }
    this.brushPreviewSize = 1;
    this.showBrushPreview = false;

    // Callback pour notifier qu'il faut re-render
    this.onRenderNeeded = null;

    // Paramètres de déplacement au clavier
    this.keyPanSpeed = 20; // pixels par appui

    this.setupCanvas();
    this.setupTouchEvents();
    this.setupKeyboardEvents();
  }

  setupCanvas() {
    // Canvas haute résolution
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 1536;
    const displayHeight = 1536;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;
    this.canvas.style.width = displayWidth + 'px';
    this.canvas.style.height = displayHeight + 'px';

    this.ctx.scale(dpr, dpr);
  }

  /**
   * Convertit coordonnées écran → monde (grille 384×384)
   */
  screenToWorld(screenX, screenY) {
    const worldX = (screenX - this.offsetX) / (this.tileSize * this.zoom);
    const worldY = (screenY - this.offsetY) / (this.tileSize * this.zoom);

    return {
      x: Math.floor(worldX),
      y: Math.floor(worldY)
    };
  }

  /**
   * Convertit coordonnées monde → écran
   */
  worldToScreen(worldX, worldY) {
    const screenX = worldX * this.tileSize * this.zoom + this.offsetX;
    const screenY = worldY * this.tileSize * this.zoom + this.offsetY;

    return { x: screenX, y: screenY };
  }

  /**
   * Zoom vers un point (centré souris)
   */
  zoomAt(screenX, screenY, delta) {
    const worldBefore = this.screenToWorld(screenX, screenY);

    // Ajuste le zoom
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomFactor));

    // Recalcule l'offset pour garder le point sous la souris
    const worldAfter = this.screenToWorld(screenX, screenY);
    this.offsetX += (worldAfter.x - worldBefore.x) * this.tileSize * this.zoom;
    this.offsetY += (worldAfter.y - worldBefore.y) * this.tileSize * this.zoom;
  }

  /**
   * Démarre le panning
   */
  startPan(screenX, screenY) {
    this.isPanning = true;
    this.panStart = {
      x: screenX - this.offsetX,
      y: screenY - this.offsetY
    };
  }

  /**
   * Met à jour le panning
   */
  updatePan(screenX, screenY) {
    if (!this.isPanning) return;

    this.offsetX = screenX - this.panStart.x;
    this.offsetY = screenY - this.panStart.y;
  }

  /**
   * Arrête le panning
   */
  endPan() {
    this.isPanning = false;
  }

  /**
   * Rendu de la carte complète
   */
  render(mapGrid, backgroundImage = null) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calcul zone visible (optimisation)
    const visibleBounds = this.getVisibleBounds();

    // Rendu tuiles visibles
    for (let y = visibleBounds.startY; y <= visibleBounds.endY; y++) {
      for (let x = visibleBounds.startX; x <= visibleBounds.endX; x++) {
        const tileId = mapGrid.getTile(x, y);
        if (tileId) {
          this.renderTile(x, y, tileId);
        }
      }
    }

    // Image de fond PAR-DESSUS les tuiles (pour trace mode)
    if (backgroundImage) {
      backgroundImage.render(this.ctx, this.zoom, this.offsetX, this.offsetY, this.tileSize);
    }

    // Grille (toujours visible, par-dessus l'image)
    if (this.gridVisible) {
      this.renderGrid(visibleBounds);
    }

    // Aperçu du pinceau
    if (this.showBrushPreview && this.brushPreviewPos) {
      this.renderBrushPreview();
    }
  }

  /**
   * Calcule les bornes de la zone visible
   */
  getVisibleBounds() {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(canvasWidth, canvasHeight);

    return {
      startX: Math.max(0, Math.floor(topLeft.x)),
      startY: Math.max(0, Math.floor(topLeft.y)),
      endX: Math.min(383, Math.ceil(bottomRight.x)),
      endY: Math.min(383, Math.ceil(bottomRight.y))
    };
  }

  /**
   * Rendu d'une tuile individuelle
   */
  renderTile(worldX, worldY, tileId) {
    const tileInfo = this.tilesData[tileId];
    if (!tileInfo) return;

    const screen = this.worldToScreen(worldX, worldY);
    const size = this.tileSize * this.zoom;

    // Si sprite disponible
    if (tileInfo.sprite && this.spriteCache[tileInfo.sprite]) {
      this.ctx.drawImage(
        this.spriteCache[tileInfo.sprite],
        screen.x,
        screen.y,
        size,
        size
      );
    } else {
      // Sinon, couleur de fallback
      this.ctx.fillStyle = tileInfo.color || '#90EE90';
      this.ctx.fillRect(screen.x, screen.y, size, size);
    }
  }

  /**
   * Rendu de la grille (style Happy Island Designer)
   */
  renderGrid(bounds) {
    const size = this.tileSize * this.zoom;

    // Ajuste l'épaisseur selon le zoom
    const lineWidth = Math.max(0.5, Math.min(2, this.zoom * 1.5));

    // Couleur de la grille : plus visible
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.lineWidth = lineWidth;

    // Dessine les lignes verticales
    for (let x = bounds.startX; x <= bounds.endX + 1; x++) {
      const screen = this.worldToScreen(x, 0);
      const startY = this.worldToScreen(0, bounds.startY).y;
      const endY = this.worldToScreen(0, bounds.endY + 1).y;

      this.ctx.beginPath();
      this.ctx.moveTo(screen.x, startY);
      this.ctx.lineTo(screen.x, endY);
      this.ctx.stroke();
    }

    // Dessine les lignes horizontales
    for (let y = bounds.startY; y <= bounds.endY + 1; y++) {
      const screen = this.worldToScreen(0, y);
      const startX = this.worldToScreen(bounds.startX, 0).x;
      const endX = this.worldToScreen(bounds.endX + 1, 0).x;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, screen.y);
      this.ctx.lineTo(endX, screen.y);
      this.ctx.stroke();
    }

    // Bordures épaisses tous les 16 blocs
    if (this.zoom > 0.3) {
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      this.ctx.lineWidth = lineWidth * 2;

      // Lignes verticales tous les 16 blocs
      for (let x = bounds.startX; x <= bounds.endX + 1; x++) {
        if (x % 16 === 0) {
          const screen = this.worldToScreen(x, 0);
          const startY = this.worldToScreen(0, bounds.startY).y;
          const endY = this.worldToScreen(0, bounds.endY + 1).y;

          this.ctx.beginPath();
          this.ctx.moveTo(screen.x, startY);
          this.ctx.lineTo(screen.x, endY);
          this.ctx.stroke();
        }
      }

      // Lignes horizontales tous les 16 blocs
      for (let y = bounds.startY; y <= bounds.endY + 1; y++) {
        if (y % 16 === 0) {
          const screen = this.worldToScreen(0, y);
          const startX = this.worldToScreen(bounds.startX, 0).x;
          const endX = this.worldToScreen(bounds.endX + 1, 0).x;

          this.ctx.beginPath();
          this.ctx.moveTo(startX, screen.y);
          this.ctx.lineTo(endX, screen.y);
          this.ctx.stroke();
        }
      }
    }
  }

  /**
   * Charge un sprite (async)
   */
  async loadSprite(tileId, url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.spriteCache[url] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Précharge tous les sprites
   */
  async preloadSprites(tilesData) {
    const promises = [];

    for (const [tileId, tileInfo] of Object.entries(tilesData)) {
      if (tileInfo.sprite) {
        promises.push(
          this.loadSprite(tileId, tileInfo.sprite).catch(() => {
            console.warn(`Failed to load sprite: ${tileInfo.sprite}`);
          })
        );
      }
    }

    await Promise.all(promises);
  }

  /**
   * Export canvas vers PNG
   */
  exportPNG(filename = 'pokopia-map.png') {
    // Rendu complet sans offset/zoom (optionnel)
    const tempZoom = this.zoom;
    const tempOffsetX = this.offsetX;
    const tempOffsetY = this.offsetY;

    // Reset pour export
    // this.zoom = 1;
    // this.offsetX = 0;
    // this.offsetY = 0;

    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL('image/png');
    link.click();

    // Restore
    // this.zoom = tempZoom;
    // this.offsetX = tempOffsetX;
    // this.offsetY = tempOffsetY;
  }

  /**
   * Toggle grille
   */
  toggleGrid() {
    this.gridVisible = !this.gridVisible;
  }

  /**
   * Centre la vue sur la carte avec zoom optimal
   */
  centerView(mapWidth = 384, mapHeight = 384) {
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);

    // Calcule le zoom optimal pour voir toute la carte avec un petit padding
    const zoomX = (canvasWidth * 0.85) / (mapWidth * this.tileSize);
    const zoomY = (canvasHeight * 0.85) / (mapHeight * this.tileSize);

    // Prend le zoom le plus petit pour que tout soit visible
    this.zoom = Math.min(zoomX, zoomY, this.maxZoom);
    this.zoom = Math.max(this.zoom, this.minZoom);

    // Centre la carte dans le canvas
    const worldWidth = mapWidth * this.tileSize * this.zoom;
    const worldHeight = mapHeight * this.tileSize * this.zoom;

    this.offsetX = (canvasWidth - worldWidth) / 2;
    this.offsetY = (canvasHeight - worldHeight) / 2;
  }

  /**
   * Setup des événements tactiles (mobile + trackpad)
   */
  setupTouchEvents() {
    // Touchstart
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touches = Array.from(e.touches);

      if (this.touches.length === 2) {
        // 2 doigts : prépare pan (zoom seulement si écartement)
        this.initialPinchDistance = this.getPinchDistance(this.touches[0], this.touches[1]);
        this.lastPinchDistance = this.initialPinchDistance;

        // Centre des 2 doigts pour le pan
        const rect = this.canvas.getBoundingClientRect();
        const centerX = (this.touches[0].clientX + this.touches[1].clientX) / 2 - rect.left;
        const centerY = (this.touches[0].clientY + this.touches[1].clientY) / 2 - rect.top;
        this.startPan(centerX, centerY);
      }
    });

    // Touchmove
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.touches = Array.from(e.touches);

      if (this.touches.length === 2) {
        const rect = this.canvas.getBoundingClientRect();
        const centerX = (this.touches[0].clientX + this.touches[1].clientX) / 2 - rect.left;
        const centerY = (this.touches[0].clientY + this.touches[1].clientY) / 2 - rect.top;

        // Pan avec le centre des 2 doigts (toujours actif)
        this.updatePan(centerX, centerY);

        // Pinch to zoom SEULEMENT si écartement significatif
        const newDistance = this.getPinchDistance(this.touches[0], this.touches[1]);
        const distanceChange = Math.abs(newDistance - this.initialPinchDistance);

        // Active le zoom seulement si écartement > seuil
        if (distanceChange > this.pinchThreshold && this.lastPinchDistance > 0) {
          const scale = newDistance / this.lastPinchDistance;
          this.pinchZoom(centerX, centerY, scale);
        }

        this.lastPinchDistance = newDistance;

        // Notifie qu'il faut re-render
        if (this.onRenderNeeded) {
          this.onRenderNeeded();
        }
      }
    });

    // Touchend
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touches = Array.from(e.touches);

      if (this.touches.length < 2) {
        // Moins de 2 doigts : arrête pan et zoom
        this.endPan();
        this.lastPinchDistance = 0;
        this.initialPinchDistance = 0;
      }
    });

    // Touchcancel
    this.canvas.addEventListener('touchcancel', () => {
      this.endPan();
      this.touches = [];
      this.lastPinchDistance = 0;
      this.initialPinchDistance = 0;
    });
  }

  /**
   * Setup des événements clavier pour déplacer la carte
   */
  setupKeyboardEvents() {
    window.addEventListener('keydown', (e) => {
      // Vérifie qu'on n'est pas dans un input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      let moved = false;

      switch (e.key) {
        case 'ArrowUp':
          this.offsetY += this.keyPanSpeed;
          moved = true;
          break;
        case 'ArrowDown':
          this.offsetY -= this.keyPanSpeed;
          moved = true;
          break;
        case 'ArrowLeft':
          this.offsetX += this.keyPanSpeed;
          moved = true;
          break;
        case 'ArrowRight':
          this.offsetX -= this.keyPanSpeed;
          moved = true;
          break;
      }

      if (moved) {
        e.preventDefault();
        // Notifie qu'il faut re-render
        if (this.onRenderNeeded) {
          this.onRenderNeeded();
        }
      }
    });
  }

  /**
   * Calcule la distance entre deux touches (pinch)
   */
  getPinchDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Zoom avec pinch (2 doigts)
   */
  pinchZoom(centerX, centerY, scale) {
    const worldBefore = this.screenToWorld(centerX, centerY);

    // Applique le zoom
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * scale));

    // Recalcule l'offset pour garder le centre sous les doigts
    const worldAfter = this.screenToWorld(centerX, centerY);
    this.offsetX += (worldAfter.x - worldBefore.x) * this.tileSize * this.zoom;
    this.offsetY += (worldAfter.y - worldBefore.y) * this.tileSize * this.zoom;
  }

  /**
   * Obtient le niveau de zoom en %
   */
  getZoomPercent() {
    return Math.round(this.zoom * 100);
  }

  /**
   * Met à jour la position de l'aperçu du pinceau
   */
  setBrushPreview(worldX, worldY, size, show) {
    this.brushPreviewPos = { worldX, worldY };
    this.brushPreviewSize = size;
    this.showBrushPreview = show;
  }

  /**
   * Rendu de l'aperçu du pinceau (overlay semi-transparent)
   */
  renderBrushPreview() {
    if (!this.brushPreviewPos) return;

    const { worldX, worldY } = this.brushPreviewPos;
    const size = this.brushPreviewSize;
    const half = Math.floor(size / 2);

    // Dessine un rectangle semi-transparent pour chaque tuile affectée
    this.ctx.fillStyle = 'rgba(76, 175, 80, 0.3)'; // Vert semi-transparent
    this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.8)'; // Bordure verte
    this.ctx.lineWidth = Math.max(1, this.zoom * 2);

    // Parcourt les tuiles du brush (pattern carré)
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const tx = worldX - half + dx;
        const ty = worldY - half + dy;

        // Vérifie que la tuile est dans les limites
        if (tx >= 0 && tx < 384 && ty >= 0 && ty < 384) {
          const screen = this.worldToScreen(tx, ty);
          const tileSize = this.tileSize * this.zoom;

          // Remplit la tuile
          this.ctx.fillRect(screen.x, screen.y, tileSize, tileSize);

          // Bordure
          this.ctx.strokeRect(screen.x, screen.y, tileSize, tileSize);
        }
      }
    }
  }
}
