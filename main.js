/**
 * main.js - Point d'entrée principal
 * Orchestration de tous les modules
 */

import { MapGrid } from './core/map.js';
import { CanvasRenderer } from './core/render.js';
import { ToolSystem } from './core/tools.js';
import { CategoryToolbar } from './ui/category-toolbar.js';
import { SettingsToolbar } from './ui/settings-toolbar.js';
import { HomeScreen } from './ui/home.js';
import { MapLoader } from './core/map-loader.js';
import { BackgroundImage } from './core/background-image.js';
import { t } from './utils/i18n.js';

class PokopiaPlannerApp {
  constructor() {
    this.tilesData = null;
    this.citiesData = null;
    this.pokemonData = null;

    this.mapGrid = null;
    this.renderer = null;
    this.toolSystem = null;
    this.categoryToolbar = null;
    this.settingsToolbar = null;
    this.homeScreen = null;
    this.mapLoader = null;
    this.backgroundImage = null;

    this.currentCity = null;
    this.canvas = null;

    this.animationFrameId = null;

    // Tracking des modifications non sauvegardées
    this.hasUnsavedChanges = false;
  }

  /**
   * Initialisation de l'application
   */
  async init() {
    console.log('🚀 Pokopia Planner - Initialisation...');

    // Chargement des données JSON
    await this.loadData();

    // Setup UI
    this.setupUI();

    // Setup canvas & events
    this.setupCanvas();

    // Setup warning avant de quitter
    this.setupBeforeUnloadWarning();

    // Affiche l'écran d'accueil
    this.homeScreen.show();

    console.log('✅ Pokopia Planner - Prêt !');
  }

  /**
   * Chargement des données JSON
   */
  async loadData() {
    try {
      const [tilesRes, citiesRes, pokemonRes] = await Promise.all([
        fetch('./data/tiles.json'),
        fetch('./data/cities.json'),
        fetch('./data/pokemon.json')
      ]);

      this.tilesData = await tilesRes.json();
      this.citiesData = await citiesRes.json();
      this.pokemonData = await pokemonRes.json();

      console.log(`📦 Chargé: ${Object.keys(this.tilesData).length} tuiles, ${Object.keys(this.citiesData).length} villes, ${Object.keys(this.pokemonData).length} Pokémon`);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      alert('Erreur de chargement des données. Vérifie la console.');
    }
  }

  /**
   * Setup de l'UI
   */
  setupUI() {
    // Écran d'accueil
    this.homeScreen = new HomeScreen(
      'welcome',
      this.citiesData,
      (cityId, action) => this.handleCitySelect(cityId, action)
    );

    // Map loader
    this.mapLoader = new MapLoader();
  }

  /**
   * Setup du canvas
   */
  setupCanvas() {
    this.canvas = document.getElementById('mapCanvas');
    if (!this.canvas) {
      console.error('Canvas non trouvé !');
      return;
    }

    // Renderer
    this.renderer = new CanvasRenderer(this.canvas, this.tilesData);

    // Callback pour re-render lors des gestes tactiles
    this.renderer.onRenderNeeded = () => {
      this.render();
      this.updateZoomIndicator();
    };

    // Zoom indicator
    this.createZoomIndicator();

    // GitHub link
    this.createGitHubLink();

    // Event listeners canvas
    this.setupCanvasEvents();
  }

  /**
   * Configure le warning avant de quitter la page
   */
  setupBeforeUnloadWarning() {
    window.addEventListener('beforeunload', (e) => {
      if (this.hasUnsavedChanges) {
        // Message standard du navigateur (personnalisation limitée pour sécurité)
        e.preventDefault();
        e.returnValue = ''; // Chrome nécessite returnValue
        return ''; // Autres navigateurs
      }
    });
  }

  /**
   * Gestion de la sélection de ville
   */
  async handleCitySelect(cityId, action) {
    console.log(`🏙️ Ville sélectionnée: ${cityId} (${action})`);

    this.currentCity = this.citiesData[cityId];
    if (!this.currentCity) {
      console.error('Ville introuvable:', cityId);
      return;
    }

    // Crée la grille
    const defaultTerrain = this.currentCity.defaultTerrain || 'field-grass';
    this.mapGrid = new MapGrid(384, 384, defaultTerrain);

    // Setup des systèmes AVANT de charger le preset
    this.toolSystem = new ToolSystem(this.mapGrid, this.renderer);
    this.toolSystem.setTile(defaultTerrain);

    // Callback quand la pipette sélectionne une tuile
    this.toolSystem.onTilePicked = (tileId) => {
      const tile = this.tilesData[tileId];
      if (tile && this.categoryToolbar) {
        this.categoryToolbar.setCurrentTileColor(tile.color || tile.gradient || '#726a5a');
      }
    };

    // Initialise le système d'image de fond
    this.backgroundImage = new BackgroundImage(this.renderer);

    // Si load, charge depuis localStorage
    if (action === 'load') {
      const loaded = this.mapGrid.loadFromLocalStorage(cityId);
      if (!loaded) {
        console.warn('Aucune sauvegarde trouvée, chargement du preset...');
        // Charge le preset de la ville
        await this.mapLoader.loadAndApply(this.mapGrid, cityId);
        console.log('✅ Preset chargé');
      }
    } else if (action === 'new') {
      // Nouvelle carte : charge le preset par défaut
      console.log('🗺️ Chargement du preset de la ville...');
      await this.mapLoader.loadAndApply(this.mapGrid, cityId);
      console.log('✅ Preset chargé, rendu de la carte...');
    }

    // Affiche l'éditeur et masque l'écran d'accueil
    const welcomeScreen = document.getElementById('welcome');
    if (welcomeScreen) {
      welcomeScreen.classList.add('hidden');
    }

    const editor = document.getElementById('editor');
    editor.style.display = 'flex';

    // Fonction pour initialiser la CategoryToolbar une fois que l'élément est accessible
    const initCategoryToolbar = () => {
      const toolbarEl = document.getElementById('category-toolbar');

      if (toolbarEl) {
        // Element trouvé, on peut initialiser
        this.categoryToolbar = new CategoryToolbar(
          'category-toolbar',
          this.tilesData,
          (tileId, tile) => this.handleTileSelect(tileId, tile)
        );

        // Connecte les outils au ToolSystem
        if (this.categoryToolbar && this.categoryToolbar.container) {
          this.categoryToolbar.setOnToolSelect((tool) => {
            this.toolSystem.setTool(tool);
            this.updateCanvasCursor(tool);
          });

          // Connecte la taille de pinceau au ToolSystem
          this.categoryToolbar.setOnBrushSizeChange((size) => {
            this.toolSystem.setBrushSize(size);
          });

          // Initialise la couleur par défaut
          const defaultTile = this.tilesData[defaultTerrain];
          if (defaultTile) {
            this.categoryToolbar.setCurrentTileColor(defaultTile.color || defaultTile.gradient || '#726a5a');
          }
        }
      } else {
        // Element pas encore accessible, réessayer au prochain frame
        requestAnimationFrame(initCategoryToolbar);
      }
    };

    // Fonction pour initialiser la SettingsToolbar
    const initSettingsToolbar = () => {
      const settingsEl = document.getElementById('settings-toolbar');

      if (settingsEl) {
        // Element trouvé, on peut initialiser
        this.settingsToolbar = new SettingsToolbar('settings-toolbar');

        // Connecte le callback de retour à l'accueil
        this.settingsToolbar.setOnHome(() => {
          this.returnToHome();
        });

        // Connecte les callbacks Undo/Redo
        this.settingsToolbar.setOnUndo(() => {
          this.mapGrid.undo();
          this.render();
          this.onMapChanged();
        });

        this.settingsToolbar.setOnRedo(() => {
          this.mapGrid.redo();
          this.render();
          this.onMapChanged();
        });

        // Connecte le bouton d'image de fond
        this.settingsToolbar.setOnBackgroundImageLoad((file) => {
          this.loadBackgroundImage(file);
        });

        // Connecte les callbacks pour toggle et opacité
        this.settingsToolbar.setOnBackgroundToggle(() => {
          this.toggleBackgroundImage();
        });

        this.settingsToolbar.setOnBackgroundOpacityChange((opacity) => {
          this.setBackgroundOpacity(opacity);
        });

        // Connecte le callback de sauvegarde
        this.settingsToolbar.setOnSave(() => {
          this.saveMap();
        });

        // Connecte le callback d'export
        this.settingsToolbar.setOnExport(() => {
          this.exportMap();
        });

        // Connecte le callback d'import
        this.settingsToolbar.setOnImport((file) => {
          this.importMap(file);
        });
      } else {
        // Element pas encore accessible, réessayer au prochain frame
        requestAnimationFrame(initSettingsToolbar);
      }
    };

    // Démarre l'initialisation des deux toolbars
    requestAnimationFrame(initCategoryToolbar);
    requestAnimationFrame(initSettingsToolbar);

    // Centre la vue
    this.renderer.centerView(384, 384);

    // Premier rendu
    this.render();

    // Démarre la boucle de rendu
    this.startRenderLoop();
  }

  /**
   * Met à jour le curseur du canvas selon l'outil actif
   */
  updateCanvasCursor(tool) {
    // Retire toutes les classes d'outil
    this.canvas.classList.remove('tool-brush', 'tool-erase', 'tool-fill', 'tool-rectangle', 'tool-eyedropper');

    // Ajoute la classe correspondant à l'outil actif
    if (tool) {
      this.canvas.classList.add(`tool-${tool}`);
    }
  }

  /**
   * Gestion de la sélection de tuile
   */
  handleTileSelect(tileId) {
    console.log('🎨 Tuile sélectionnée:', tileId);

    if (this.toolSystem) {
      this.toolSystem.setTile(tileId);
    }

    // Met à jour le curseur pour le brush (activé automatiquement)
    this.updateCanvasCursor('brush');
  }

  /**
   * Event listeners du canvas
   */
  setupCanvasEvents() {
  }

  /**
   * Event listeners du canvas
   */
  setupCanvasEvents() {
    const canvas = this.canvas;

    // Mouse wheel (zoom ET pan sur trackpad macOS)
    canvas.addEventListener('wheel', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Sur macOS, pinch = ctrlKey + wheel, pan = shift ou deux doigts sans pinch
      if (e.ctrlKey) {
        // Pinch to zoom
        e.preventDefault();
        this.renderer.zoomAt(mouseX, mouseY, e.deltaY);
        this.updateZoomIndicator();
        this.render();
      } else if (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0) {
        // Pan avec deux doigts (deltaX/Y sans ctrl)
        e.preventDefault();
        this.renderer.offsetX -= e.deltaX;
        this.renderer.offsetY -= e.deltaY;
        this.render();
      }
    });

    // Mouse down
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (e.button === 0) {
        // Clic gauche
        if (e.shiftKey || e.altKey || e.ctrlKey) {
          // Pan si Shift/Alt/Ctrl enfoncé (ou 2 doigts trackpad)
          this.renderer.startPan(mouseX, mouseY);
          // Cache l'aperçu pendant le pan
          this.renderer.setBrushPreview(0, 0, 1, false);
        } else {
          // Sinon, dessin
          this.toolSystem.startDrawing(mouseX, mouseY);
          // Cache l'aperçu pendant le dessin
          this.renderer.setBrushPreview(0, 0, 1, false);
        }
      } else if (e.button === 1 || e.button === 2) {
        // Clic molette ou droit = pan
        e.preventDefault();
        this.renderer.startPan(mouseX, mouseY);
        // Cache l'aperçu pendant le pan
        this.renderer.setBrushPreview(0, 0, 1, false);
      }
    });

    // Mouse move
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.renderer.isPanning) {
        this.renderer.updatePan(mouseX, mouseY);
        this.render();
      } else if (this.toolSystem && this.toolSystem.isDrawing) {
        this.toolSystem.continueDrawing(mouseX, mouseY);
        this.render();
        this.onMapChanged();
      } else {
        // Mise à jour de l'aperçu du pinceau
        this.updateBrushPreview(mouseX, mouseY);
      }
    });

    // Mouse up
    canvas.addEventListener('mouseup', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.renderer.endPan();

      if (this.toolSystem) {
        this.toolSystem.endDrawing(mouseX, mouseY);
        this.render();
        this.onMapChanged();
      }
    });

    // Désactive menu contextuel
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Raccourcis clavier pour les outils
    document.addEventListener('keydown', (e) => {
      // Ignore si focus dans input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Raccourcis outils
      const toolKeys = {
        'b': 'brush',
        'e': 'erase',
        'f': 'fill',
        'r': 'rectangle',
        'i': 'eyedropper'
      };

      if (toolKeys[e.key.toLowerCase()] && this.categoryToolbar) {
        this.categoryToolbar.selectTool(toolKeys[e.key.toLowerCase()]);
      }

      // Ctrl+Z / Ctrl+Y pour undo/redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          this.mapGrid.undo();
          this.render();
          this.onMapChanged();
        } else if (e.key === 'y') {
          e.preventDefault();
          this.mapGrid.redo();
          this.render();
          this.onMapChanged();
        } else if (e.key === 's') {
          e.preventDefault();
          this.saveMap();
        }
      }
    });

    // Mouse leave - cache l'aperçu
    canvas.addEventListener('mouseleave', () => {
      if (this.renderer) {
        this.renderer.setBrushPreview(0, 0, 1, false);
        this.render();
      }
    });

    // Drag & drop
    canvas.addEventListener('dragover', (e) => e.preventDefault());

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();

      const tileId = e.dataTransfer.getData('text/plain');
      if (!tileId) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.toolSystem.placeTileFromDrop(mouseX, mouseY, tileId)) {
        this.render();
        this.onMapChanged();
      }
    });
  }

  /**
   * Callback quand la map change
   */
  onMapChanged() {
    // Marque la carte comme ayant des modifications non sauvegardées
    this.hasUnsavedChanges = true;
  }

  /**
   * Sauvegarde la carte
   */
  saveMap() {
    const cityId = this.currentCity?.id || 'palette-town';
    this.mapGrid.saveToLocalStorage(cityId);
    this.hasUnsavedChanges = false; // Réinitialise le flag
    this.showSaveIndicator();
  }

  /**
   * Retour à l'écran d'accueil
   */
  returnToHome() {
    // Si des modifications non sauvegardées existent, demander confirmation
    if (this.hasUnsavedChanges) {
      const result = confirm(t('message.confirmLeave'));

      if (result === true) {
        // L'utilisateur a cliqué sur "OK" - sauvegarder et quitter
        this.saveMap();
      } else if (result === false) {
        // L'utilisateur a cliqué sur "Annuler" - ne rien faire
        console.log(t('message.leaveCancelled'));
        return;
      }
    }

    // Masque l'éditeur
    const editor = document.getElementById('editor');
    if (editor) {
      editor.style.display = 'none';
    }

    // Affiche l'écran d'accueil
    if (this.homeScreen) {
      this.homeScreen.show();
    }

    // Réinitialise l'état
    this.hasUnsavedChanges = false;
    this.currentCity = null;
  }

  /**
   * Exporte la carte en JSON
   */
  exportMap() {
    const cityId = this.currentCity?.id || 'palette-town';
    const cityName = this.currentCity?.name_fr || this.currentCity?.name || 'Carte';

    const data = {
      cityId,
      cityName,
      map: this.mapGrid.exportJSON(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    // Crée un blob JSON
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    // Crée un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokopia-${cityId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Carte exportée:', a.download);
  }

  /**
   * Importe une carte depuis un fichier JSON
   */
  async importMap(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.map) {
        throw new Error(t('message.invalidFormat'));
      }

      // Demande confirmation avant d'écraser la carte actuelle
      const cityName = data.cityName || data.cityId || 'cette carte';
      const confirmMsg = t('message.confirmImport', { name: cityName });

      if (!confirm(confirmMsg)) {
        console.log(t('message.importCancelled'));
        return;
      }

      // Import les données
      this.mapGrid.importJSON(data.map);

      // Re-render
      this.render();

      console.log('✅ Carte importée:', cityName);
      alert(t('message.imported'));
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
      alert(`${t('message.importError')}:\n${error.message}`);
    }
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

    indicator.textContent = t('message.saved');
    indicator.classList.add('show');

    setTimeout(() => {
      indicator.classList.remove('show');
    }, 2000);
  }

  /**
   * Rendu unique
   */
  render() {
    if (this.renderer && this.mapGrid) {
      this.renderer.render(this.mapGrid, this.backgroundImage);
    }
  }

  /**
   * Charge une image de fond
   */
  async loadBackgroundImage(file) {
    try {
      await this.backgroundImage.loadFromFile(file);
      this.render();

      // Affiche les contrôles d'opacité dans la SettingsToolbar
      const toggleBtn = document.getElementById('settings-background-toggle');
      const opacityControl = document.getElementById('settings-opacity-control');

      if (toggleBtn) toggleBtn.style.display = 'inline-flex';
      if (opacityControl) opacityControl.style.display = 'block';

      // Attache les event listeners si nécessaire
      if (this.settingsToolbar) {
        this.settingsToolbar.setupBackgroundControls();
      }

      console.log(t('message.imageLoaded'));
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'image:', error);
      alert(t('message.imageError'));
    }
  }

  /**
   * Toggle l'affichage de l'image de fond
   */
  toggleBackgroundImage() {
    if (this.backgroundImage) {
      const enabled = this.backgroundImage.toggle();
      this.render();
      console.log(enabled ? t('message.imageToggleOn') : t('message.imageToggleOff'));
    }
  }

  /**
   * Ajuste l'opacité de l'image de fond
   */
  setBackgroundOpacity(opacity) {
    if (this.backgroundImage) {
      this.backgroundImage.setOpacity(opacity);
      this.render();
    }
  }

  /**
   * Boucle de rendu (pour animations futures)
   */
  startRenderLoop() {
    const loop = () => {
      // Pour l'instant, on ne re-render que sur événements
      // this.render();
      // this.animationFrameId = requestAnimationFrame(loop);
    };

    // loop(); // Désactivé pour économiser CPU
  }

  /**
   * Indicateur de zoom
   */
  createZoomIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'zoom-indicator';
    indicator.id = 'zoom-indicator';

    // Bouton zoom out
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.textContent = '-';
    zoomOutBtn.onclick = () => this.zoomOut();

    // Span pour le texte de zoom
    const zoomText = document.createElement('span');
    zoomText.id = 'zoom-text';

    // Bouton zoom in
    const zoomInBtn = document.createElement('button');
    zoomInBtn.textContent = '+';
    zoomInBtn.onclick = () => this.zoomIn();

    // Assemble les éléments
    indicator.appendChild(zoomOutBtn);
    indicator.appendChild(zoomText);
    indicator.appendChild(zoomInBtn);

    document.querySelector('.main').appendChild(indicator);

    this.updateZoomIndicator();
  }

  updateZoomIndicator() {
    const zoomText = document.getElementById('zoom-text');
    if (zoomText && this.renderer) {
      zoomText.textContent = `Zoom: ${this.renderer.getZoomPercent()}%`;
    }
  }

  /**
   * Zoom in (augmente le zoom)
   */
  zoomIn() {
    if (!this.renderer || !this.canvas) return;

    // Zoom vers le centre du canvas
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Delta négatif = zoom in
    this.renderer.zoomAt(centerX, centerY, -100);
    this.updateZoomIndicator();
    this.render();
  }

  /**
   * Zoom out (diminue le zoom)
   */
  zoomOut() {
    if (!this.renderer || !this.canvas) return;

    // Zoom vers le centre du canvas
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Delta positif = zoom out
    this.renderer.zoomAt(centerX, centerY, 100);
    this.updateZoomIndicator();
    this.render();
  }

  /**
   * Crée le lien GitHub
   */
  createGitHubLink() {
    const link = document.createElement('a');
    link.className = 'github-link';
    link.href = 'https://github.com/camkLcbr/pokopia-planner';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      GitHub
    `;

    document.querySelector('.main').appendChild(link);
  }

  /**
   * Met à jour l'aperçu du pinceau
   */
  updateBrushPreview(mouseX, mouseY) {
    if (!this.toolSystem || !this.renderer) return;

    const currentTool = this.toolSystem.currentTool;

    // Affiche l'aperçu seulement pour brush et erase
    const showPreview = currentTool === 'brush' || currentTool === 'erase';

    if (showPreview) {
      // Convertit position souris en coordonnées grille
      const world = this.renderer.screenToWorld(mouseX, mouseY);

      // Met à jour l'aperçu dans le renderer
      this.renderer.setBrushPreview(
        world.x,
        world.y,
        this.toolSystem.brushSize,
        true
      );

      // Re-render pour afficher l'aperçu
      this.render();
    } else {
      // Cache l'aperçu pour les autres outils
      this.renderer.setBrushPreview(0, 0, 1, false);
      this.render();
    }
  }

}

// Lancement de l'application
document.addEventListener('DOMContentLoaded', () => {
  const app = new PokopiaPlannerApp();
  app.init();

  // Export global pour debug
  window.pokopiaApp = app;
});
