# 📋 Changelog - Pokopia City Planner

## [1.0.0] - 2026-03-22

### 🎉 Version initiale complète

#### ✨ Fonctionnalités principales

- **Architecture modulaire ES6**
  - `core/map.js` : Grille 384×384 avec undo/redo (50 actions)
  - `core/render.js` : Renderer Canvas optimisé avec zoom/pan
  - `core/tools.js` : Système d'outils (brosse, gomme, remplir, rectangle, pipette)
  - `ui/palette.js` : Palette drag & drop
  - `ui/toolbar.js` : Toolbar avec raccourcis clavier
  - `ui/stats.js` : Panneau statistiques temps réel
  - `ui/home.js` : Écran d'accueil 5 villes

#### 🏙️ Contenu

- **5 villes Pokémon**
  - Bourg Palette (Palette Town)
  - Jadielle (Viridian City)
  - Argenta (Pewter City)
  - Azuria (Cerulean City)
  - Carmin-sur-Mer (Vermilion City)

- **25+ tuiles**
  - Terrains : herbe, sable, eau, roche, terre, chemins
  - Bâtiments : PokéCenter, Labo Prof. Chen, Arène, maisons
  - Décor : arbres, fleurs, fontaines, buissons, rochers
  - Habitats : champignons, étangs, grottes, poteaux électriques, poubelles

- **25+ Pokémon**
  - Système d'attraction basé sur habitats
  - Calcul de probabilité dynamique
  - Top 20 affichés en temps réel

#### 🛠️ Outils implémentés

- 🖌️ **Brosse** : Dessin libre avec taille variable (1-10)
- 🧹 **Gomme** : Efface les tuiles
- 🪣 **Remplir** : Flood fill (remplissage par inondation)
- ▭ **Rectangle** : Remplir une zone rectangulaire
- 💧 **Pipette** : Récupérer une tuile existante

#### 📊 Statistiques

- Cases modifiées en temps réel
- Pokémon attirés avec probabilités
- Score habitat (%)
- Ressources consommées (bois/pierre)
- Top 20 Pokémon probables triés par probabilité

#### 💾 Persistance

- **localStorage** : Sauvegarde automatique par ville
- **Export PNG** : Image haute résolution
- **Export JSON** : Format compressé RLE
- **Import JSON** : Restauration depuis fichier

#### ⌨️ Raccourcis clavier

- `B` : Brosse
- `E` : Gomme
- `F` : Remplir
- `R` : Rectangle
- `I` : Pipette
- `[` / `]` : Taille pinceau -/+
- `Ctrl+Z` : Undo
- `Ctrl+Y` : Redo
- `Ctrl+S` : Sauvegarder
- `Shift+Clic` : Pan

#### 🎨 Interface

- **Style Happy Island Designer**
- Palette gauche (220px)
- Canvas central avec toolbar flottant
- Panneau stats droit (280px)
- Zoom indicator
- Save indicator animé

#### 🚀 Performances

- Rendu optimisé : Seulement zone visible
- Canvas haute résolution (DPR support)
- Compression RLE : < 50 Ko par carte
- 60 FPS constant en zoom/pan

#### 📚 Documentation

- `README.md` : Documentation complète
- `QUICKSTART.md` : Démarrage rapide
- `SPRITES.md` : Guide intégration sprites
- `CHANGELOG.md` : Historique des versions

---

## 🔮 Roadmap Future

### [1.1.0] - Sprites & Visuel

- [ ] Sprites PNG 32×32 pour toutes les tuiles
- [ ] Animations (eau, arbres...)
- [ ] Mode nuit/jour
- [ ] Météo (pluie, neige)

### [1.2.0] - Outils Avancés

- [ ] Outil "Stamp" pour bâtiments multi-cases
- [ ] Outil "Ligne" pour chemins
- [ ] Outil "Cercle"
- [ ] Brosse texture (patterns)

### [1.3.0] - Templates & Partage

- [ ] Templates de villes pré-remplies
- [ ] Galerie communautaire
- [ ] Partage URL (carte encodée base64)
- [ ] QR Code de la carte

### [2.0.0] - Multijoueur

- [ ] Mode collaboratif temps réel (Firebase)
- [ ] Chat intégré
- [ ] Compétitions de design
- [ ] Leaderboard communautaire

---

**Développé avec ❤️ en Vanilla JS**
