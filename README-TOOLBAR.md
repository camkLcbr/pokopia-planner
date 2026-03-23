# 🛠️ Nouveau système de Toolbar - Pokopia

## Vue d'ensemble

Le nouveau système de toolbar utilise une architecture à **deux niveaux** :

1. **Toolbar principale** (verticale, gauche) : Affiche les catégories d'éléments
2. **Toolbar secondaire** (verticale, à droite de la principale) : S'ouvre au clic pour montrer les options de la catégorie

## Catégories disponibles

### 🟩 Terrains
- Herbe, Sable, Eau, Roche, Terre, Chemin
- **Tuiles de base** pour créer le terrain de votre ville

### 🏠 Bâtiments
- PokéCenter, Labo du Prof. Chen, Arène Pokémon
- Petite maison, Maison moyenne
- **Structures habitables** et services

### 🌳 Décors
- Arbres (normal, grand), Fleurs (simple, parterre)
- Fontaine, Buisson, Rochers
- **Éléments décoratifs** pour embellir la ville

### 🐾 Habitats
- Champignons, Étang, Entrée de grotte
- Poteau électrique, Poubelle
- **Éléments spéciaux** qui attirent certains Pokémon

### 🛠️ Outils
- 🖌️ Brosse (B) : Dessiner tuile par tuile
- 🧹 Gomme (E) : Effacer
- 🪣 Remplir (F) : Remplir une zone
- ▭ Rectangle (R) : Dessiner un rectangle
- 💧 Pipette (I) : Copier une tuile existante

## Utilisation

### Navigation
1. **Cliquer sur une catégorie** (🟩, 🏠, etc.) pour ouvrir la toolbar secondaire
2. **Cliquer sur une tuile** dans la toolbar secondaire pour la sélectionner
3. **Cliquer à nouveau** sur la catégorie pour fermer la toolbar secondaire

### Raccourcis clavier
- `B` : Brosse
- `E` : Gomme
- `F` : Remplir
- `R` : Rectangle
- `I` : Pipette
- `Ctrl+Z` : Annuler
- `Ctrl+Y` : Rétablir
- `Ctrl+S` : Sauvegarder

### Contrôles de la carte
- **Zoom** : Molette de la souris ou pinch (Ctrl + molette sur macOS)
- **Pan** : Deux doigts sur trackpad, ou clic droit + glisser
- **Dessiner** : Clic gauche + glisser (avec outil sélectionné)

## Architecture technique

### Fichiers
- `ui/category-toolbar.js` : Logique de la toolbar à deux niveaux
- `styles.css` : Styles pour `.category-toolbar-main` et `.category-toolbar-secondary`

### Intégration
La CategoryToolbar remplace l'ancienne Toolbar et s'intègre avec :
- `ToolSystem` : Gestion des outils de dessin
- `MapGrid` : Gestion de la grille et des tuiles
- `tilesData` : Données des tuiles depuis `data/tiles.json`

### Données des tuiles
Chaque tuile dans `data/tiles.json` possède :
- `category` : `terrain`, `buildings`, `decor`, `habitat`
- `color` ou `gradient` : Couleur d'affichage
- `size` : Taille en tuiles `[width, height]`
- `cost` : Coût en ressources `{ wood, stone }`
- `habitat` : Types de Pokémon attirés
