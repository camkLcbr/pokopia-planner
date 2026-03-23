/**
 * BackgroundImage - Gestion de l'image de référence en arrière-plan
 */

export class BackgroundImage {
  constructor(renderer) {
    this.renderer = renderer;
    this.image = null;
    this.opacity = 0.5; // Opacité par défaut
    this.enabled = false;
    this.scale = 1; // Échelle de l'image (pour ajuster la taille)
    this.offsetX = 0;
    this.offsetY = 0;
  }

  /**
   * Charge une image depuis un File
   */
  async loadFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          this.image = img;
          this.enabled = true;

          // Ne fait pas de scaling - l'image doit couvrir 384×384 tuiles
          // On assume que l'image fournie correspond déjà à la grille
          this.scale = 1;

          console.log(`✅ Image chargée: ${img.width}×${img.height}`);
          resolve(img);
        };

        img.onerror = reject;
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Active/désactive l'affichage
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Change l'opacité
   */
  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  /**
   * Dessine l'image en arrière-plan
   */
  render(ctx, zoom, offsetX, offsetY, tileSize) {
    if (!this.enabled || !this.image) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    // L'image couvre 384×384 tuiles
    const gridSizeInPixels = 384 * tileSize;

    // Position de l'image dans le monde (coordonnées 0,0 de la grille)
    const screenX = offsetX + this.offsetX * zoom;
    const screenY = offsetY + this.offsetY * zoom;

    // Taille de l'image à l'écran (384 tuiles avec le zoom)
    const displayWidth = gridSizeInPixels * zoom;
    const displayHeight = gridSizeInPixels * zoom;

    ctx.drawImage(
      this.image,
      screenX,
      screenY,
      displayWidth,
      displayHeight
    );

    ctx.restore();
  }

  /**
   * Supprime l'image
   */
  clear() {
    this.image = null;
    this.enabled = false;
  }
}
