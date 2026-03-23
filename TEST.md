# ✅ Checklist de Test - Pokopia Planner

## 🚀 Lancement

- [x] Serveur lancé sur http://localhost:8000
- [ ] Page index.html se charge sans erreur
- [ ] Console affiche "✅ Pokopia Planner - Prêt !"
- [ ] Aucune erreur dans la console F12

## 🏠 Écran d'accueil

- [ ] 5 villes affichées dans la grille
- [ ] Boutons "Commencer" / "Charger" fonctionnels
- [ ] Clic sur "Bourg Palette" → Ouvre l'éditeur

## 🎨 Palette gauche

- [ ] 4 catégories affichées (Terrain, Bâtiments, Décor, Habitats)
- [ ] 25+ tuiles visibles avec couleurs
- [ ] Drag & drop fonctionne vers le canvas
- [ ] Clic sur une tuile la sélectionne (border bleue)
- [ ] Tooltip au survol affiche le nom

## 🖼️ Canvas central

- [ ] Canvas 1536×1536 affiché
- [ ] Grille 384×384 visible
- [ ] Couleur de fond correspond à la ville (vert pour Palette Town)
- [ ] Zoom avec molette (10% → 400%)
- [ ] Pan avec Shift+Clic ou clic droit
- [ ] Indicateur de zoom en bas à gauche

## 🛠️ Toolbar

- [ ] 5 boutons d'outils visibles
- [ ] Bouton "Brosse" actif par défaut (vert)
- [ ] Undo/Redo boutons désactivés au départ
- [ ] Bouton "Sauvegarder" cliquable
- [ ] Bouton "PNG" exporte une image
- [ ] Bouton "JSON" télécharge un fichier

## ✏️ Outils de dessin

### Brosse
- [ ] Clic sur canvas place une tuile
- [ ] Drag continue le dessin
- [ ] Touche `B` active la brosse
- [ ] Touche `[` / `]` change la taille

### Gomme
- [ ] Touche `E` active la gomme
- [ ] Clic efface une tuile (remet terrain par défaut)

### Remplir
- [ ] Touche `F` active le remplissage
- [ ] Clic remplit une zone de même couleur (flood fill)

### Rectangle
- [ ] Touche `R` active le rectangle
- [ ] Clic + drag crée un rectangle

### Pipette
- [ ] Touche `I` active la pipette
- [ ] Clic récupère la tuile sous le curseur
- [ ] Palette sélectionne automatiquement la tuile récupérée

## 📊 Panneau de stats (droite)

- [ ] "Cases modifiées" augmente quand on dessine
- [ ] "Pokémon attirés" se met à jour
- [ ] "Score habitat" affiche un %
- [ ] Barre de progression verte
- [ ] Section "Ressources" affiche Bois/Pierre
- [ ] Section "Pokémon probables" affiche une liste
- [ ] Liste vide au départ ("Aucun Pokémon...")

## 🐾 Système Pokémon

### Test avec champignons
- [ ] Place 2+ tuiles "Champignon" depuis Habitats
- [ ] Stats affichent "Paras" avec ~35% de chance
- [ ] Type "Bug/Grass" affiché avec badges colorés

### Test avec poteau électrique
- [ ] Place 1+ tuile "Poteau électrique"
- [ ] Stats affichent "Pikachu" avec ~15% de chance

### Test avec fleurs
- [ ] Place 10+ tuiles "Fleurs"
- [ ] Stats affichent plusieurs Pokémon (Nidoran, Oddish, etc.)

## ↶↷ Undo/Redo

- [ ] Place quelques tuiles
- [ ] Ctrl+Z annule la dernière action
- [ ] Bouton "Undo" devient actif après première action
- [ ] Ctrl+Y rétablit l'action annulée
- [ ] Bouton "Redo" devient actif après undo

## 💾 Sauvegarde/Export

### localStorage
- [ ] Dessine quelques tuiles
- [ ] Clic sur "💾 Sauvegarder"
- [ ] Notification "✓ Sauvegardé" apparaît en bas à droite
- [ ] Rafraîchit la page (F5)
- [ ] Retour à l'écran d'accueil
- [ ] Ville affiche "📂 Charger" + date de sauvegarde
- [ ] Clic "Charger" → Carte restaurée

### Export PNG
- [ ] Clic sur "📤 PNG"
- [ ] Fichier `pokopia-palette-town.png` téléchargé
- [ ] Image contient la carte visible

### Export JSON
- [ ] Clic sur "📥 JSON"
- [ ] Fichier `pokopia-palette-town.json` téléchargé
- [ ] JSON contient `width`, `height`, `data` (RLE)

## ⌨️ Raccourcis clavier

- [ ] `B` → Active brosse
- [ ] `E` → Active gomme
- [ ] `F` → Active remplir
- [ ] `R` → Active rectangle
- [ ] `I` → Active pipette
- [ ] `Ctrl+Z` → Undo
- [ ] `Ctrl+Y` → Redo
- [ ] `Ctrl+S` → Sauvegarde

## 🏙️ Multi-villes

- [ ] Sauvegarde dans Palette Town
- [ ] Retour à l'accueil (rafraîchir)
- [ ] Clic sur "Viridian City" → Nouvelle carte
- [ ] Terrain par défaut différent (selon ville)
- [ ] Sauvegarde séparée (ne remplace pas Palette Town)

## 🎨 Interface

- [ ] Palette scroll si trop de tuiles
- [ ] Panneau stats scroll si trop de Pokémon
- [ ] Toolbar centré en haut
- [ ] Pas de clignotement lors du rendu
- [ ] Curseur change (grab/grabbing) selon action

## 🐛 Edge Cases

- [ ] Zoom à 400% → Tuiles individuelles visibles
- [ ] Zoom à 10% → Carte entière visible
- [ ] Pan hors limites → Pas de crash
- [ ] Drag tuile hors canvas → Rien ne se passe
- [ ] Clic rapide multiple → Pas de lag
- [ ] 50+ undo → Historique limité correctement
- [ ] Effacer toute la carte → Confirmation demandée

## 📱 Responsive (bonus)

- [ ] Fenêtre < 1024px → Interface s'adapte
- [ ] Palette/Stats réduites en largeur
- [ ] Scrollbars customisées (vert Pokémon)

---

## ✅ Résultat Attendu

**Tous les tests passés** → L'application est 100% fonctionnelle ! 🎉

**Quelques tests échoués** → Note les erreurs dans la console et vérifie :
1. Tous les fichiers JSON sont bien dans `data/`
2. Le serveur local est lancé (pas de `file://`)
3. Navigateur supporte ES6 modules (Chrome/Firefox/Safari récents)

---

**Date du test** : _____________________

**Testeur** : _____________________

**Résultat global** : ⬜ PASS   ⬜ FAIL

**Notes** :
```
