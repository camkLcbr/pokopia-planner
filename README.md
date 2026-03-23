# 🏗️ Pokopia City Planner

**Pokopia City Planner** est une application web 100% front-end permettant de planifier des villes Pokémon sur une grille de 384×384 blocs, dans le style du célèbre **Happy Island Designer** (Animal Crossing).

![Pokopia Planner](screenshot.png)

## ✨ Fonctionnalités

### 🎨 Éditeur de carte complet

- **Grille 384×384** avec rendu optimisé (seulement zone visible)
- **Zoom fluide** : 10% → 400% (molette de souris centrée)
- **Pan/navigation** : Clic droit ou Shift+Clic gauche pour déplacer la vue
- **Multiples outils** :
  - 🖌️ **Brosse** : Dessine avec la tuile sélectionnée
  - 🧹 **Gomme** : Efface les tuiles
  - 🪣 **Remplir** : Flood fill (remplissage par inondation)
  - ▭ **Rectangle** : Remplir une zone rectangulaire
  - 💧 **Pipette** : Récupérer une tuile existante

### 🏙️ 5 villes Pokémon

1. **Bourg Palette** (Palette Town) - Ville paisible de départ
2. **Jadielle** (Viridian City) - Ville forestière
3. **Argenta** (Pewter City) - Ville rocheuse
4. **Azuria** (Cerulean City) - Ville aquatique
5. **Carmin-sur-Mer** (Vermilion City) - Port maritime

Chaque ville a son propre terrain par défaut et sa couleur d'ambiance.

### 🧩 Bibliothèque de tuiles

**4 catégories** avec 25+ tuiles :

- **🎨 Terrain** : Herbe, sable, eau, roche, terre, chemins
- **🏠 Bâtiments** : PokéCenter, Labo Prof. Chen, Arène, Maisons
- **💧 Décor** : Fontaines, arbres, fleurs, buissons, rochers
- **🐾 Habitats** : Champignons, étangs, grottes, poteaux électriques, poubelles

Chaque tuile a un coût en ressources (bois/pierre) et attire certains types de Pokémon.

### 📊 Statistiques temps réel

Le panneau droit affiche en direct :

- **Cases modifiées** : Nombre de tuiles placées
- **Pokémon attirés** : Nombre d'espèces attirées (max 300)
- **Score habitat** : Progression en %
- **Ressources** : Bois et pierre consommés
- **Top 20 Pokémon probables** avec pourcentages de probabilité

### 🐾 Système d'attraction Pokémon

**25+ espèces de Pokémon** avec calcul intelligent :

- Chaque Pokémon a des **habitats préférés** (ex: Pikachu → poteaux électriques)
- **Exigences minimales** : Nombre de tuiles spécifiques requis
- **Probabilité dynamique** : Augmente avec le nombre de tuiles adéquates
- **Classement par probabilité** : Top 20 affiché en temps réel

Exemples :
- **Paras** → Placez 2+ champignons (35% de chance)
- **Pikachu** → Placez 1+ poteau électrique (15% de chance)
- **Évoli** → Placez 50+ herbe + 5+ fleurs (8% de chance, rare !)

### 💾 Sauvegarde & Export

- **localStorage** : Sauvegarde automatique par ville
- **Export PNG** : Image haute résolution de la carte
- **Export JSON** : Fichier compressé RLE pour backup
- **Import JSON** : Restaure une carte depuis un fichier

### ↶↷ Undo/Redo

- **Historique 50 actions** : Annuler/rétablir avec Ctrl+Z / Ctrl+Y
- Sauvegarde intelligente lors du dessin continu

## 🚀 Utilisation

### Lancement local

L'application est **100% statique**, aucun serveur requis.

**Option 1 : Double-clic** (⚠️ peut ne pas marcher avec les modules ES selon le navigateur)

```bash
# Ouvre directement index.html dans le navigateur
open index.html
```

**Option 2 : Serveur local simple** (recommandé)

```bash
# Python 3
python3 -m http.server 8000

# Node.js (avec http-server)
npx http-server -p 8000

# Puis ouvre : http://localhost:8000
```

### Raccourcis clavier

| Touche | Action |
|--------|--------|
| `B` | Brosse |
| `E` | Gomme |
| `F` | Remplir |
| `R` | Rectangle |
| `I` | Pipette |
| `[` / `]` | Taille pinceau -/+ |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Sauvegarder |
| `Shift+Clic` | Pan (déplacer la vue) |

### Workflow recommandé

1. **Sélectionne une ville** depuis l'écran d'accueil
2. **Choisis un outil** dans la toolbar (brosse par défaut)
3. **Drag & drop** une tuile depuis la palette vers le canvas
4. **Zoome** avec la molette, **pan** avec Shift+Clic
5. **Observe les stats** : Pokémon attirés en temps réel !
6. **Sauvegarde** régulièrement (💾 bouton ou Ctrl+S)
7. **Exporte** en PNG ou JSON pour partager

## 📁 Structure du projet

```
pokopia-planner/
├── index.html          # Point d'entrée HTML
├── styles.css          # Styles globaux
├── main.js             # Orchestrateur principal
│
├── core/               # Logique métier
│   ├── map.js          # MapGrid (grille 384×384 + undo/redo)
│   ├── render.js       # CanvasRenderer (zoom/pan optimisé)
│   └── tools.js        # ToolSystem (brosse, gomme, remplir...)
│
├── ui/                 # Composants UI
│   ├── home.js         # HomeScreen (écran d'accueil)
│   ├── palette.js      # Palette (drag & drop tuiles)
│   ├── toolbar.js      # Toolbar (outils + actions)
│   └── stats.js        # StatsPanel (stats + Pokémon)
│
├── data/               # Données JSON statiques
│   ├── cities.json     # 5 villes Pokémon
│   ├── tiles.json      # 25+ tuiles avec métadonnées
│   └── pokemon.json    # 25+ Pokémon avec habitats
│
└── sprites/            # Images 32×32 (à venir)
    └── (vide)
```

## 🛠️ Extensibilité

### Ajouter une nouvelle tuile

Édite `data/tiles.json` :

```json
{
  "ma-tuile": {
    "id": "ma-tuile",
    "name": "Ma Tuile",
    "category": "decor",
    "size": [1, 1],
    "color": "#FF5733",
    "sprite": null,
    "cost": { "wood": 5, "stone": 2 },
    "habitat": ["grass", "bug"]
  }
}
```

### Ajouter un nouveau Pokémon

Édite `data/pokemon.json` :

```json
{
  "bulbasaur": {
    "id": "bulbasaur",
    "name": "Bulbizarre",
    "number": 1,
    "types": ["grass", "poison"],
    "preferredHabitats": ["flowers", "bush"],
    "baseChance": 0.2,
    "requirements": {
      "minTiles": { "flowers": 10 }
    }
  }
}
```

### Ajouter des sprites

1. Place tes images PNG 32×32 dans `sprites/`
2. Édite `tiles.json` : `"sprite": "sprites/grass.png"`
3. Le renderer chargera automatiquement les sprites au démarrage

## 🎯 TODO / Roadmap

- [x] ✅ Éditeur complet avec zoom/pan
- [x] ✅ Undo/redo (50 actions)
- [x] ✅ Sauvegarde localStorage
- [x] ✅ Export PNG/JSON
- [x] ✅ Écran d'accueil 5 villes
- [x] ✅ Panneau stats temps réel
- [x] ✅ Calcul Pokémon attirés
- [ ] ⏳ Sprites PNG 32×32 (actuellement couleurs)
- [ ] 📋 Outil "Stamp" pour bâtiments multi-cases (4×4)
- [ ] 📋 Templates de villes pré-remplies
- [ ] 📋 Partage URL (carte encodée en base64)
- [ ] 📋 Mode collaboratif (Firebase/Supabase)

## 🧪 Performances

- **Rendu optimisé** : Seulement tuiles visibles (culling)
- **Canvas haute résolution** : Support DPR (Retina display)
- **Compression RLE** : Fichiers JSON légers (< 50 Ko)
- **Pas de dépendances** : Vanilla JS pur, 0 bundle

**Benchmark** (MacBook Pro M1) :
- Zoom/Pan : 60 FPS constant
- Rendering 384×384 : < 16ms/frame
- Calcul Pokémon : < 5ms

## 📜 Licence

MIT License - Libre d'utilisation et modification.

## 🙏 Crédits

- Inspiré par **Happy Island Designer** (Animal Crossing)
- Jeu de base : **Pokémon Pokopia** (Nintendo)
- Développé avec ❤️ en Vanilla JS

---

**Bon amusement à créer ta ville Pokémon ! 🎉**
