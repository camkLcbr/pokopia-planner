# 👋 Bienvenue dans Pokopia City Planner !

## 🚀 Démarrage Ultra-Rapide (30 secondes)

```bash
# 1. Ouvre un terminal
cd /Users/camillekoppel/Web/Pokopia

# 2. Lance le serveur
python3 -m http.server 8000

# 3. Ouvre ton navigateur
open http://localhost:8000
```

**C'est tout !** 🎉

---

## 📚 Documentation Complète

Choisis ton parcours :

### 🆕 Débutant : "Je veux juste tester"

1. Lis **[QUICKSTART.md](QUICKSTART.md)** (2 min)
2. Lance l'application (ci-dessus)
3. Suis le **[TEST.md](TEST.md)** pour découvrir toutes les fonctionnalités

### 👨‍💻 Développeur : "Je veux comprendre le code"

1. Lis **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** (5 min)
2. Parcours **[README.md](README.md)** (10 min)
3. Explore le code dans `core/` et `ui/`

### 🚀 DevOps : "Je veux déployer en prod"

1. Lis **[DEPLOY.md](DEPLOY.md)** (3 min)
2. Choisis une plateforme (Netlify recommandé)
3. Drag & drop le dossier → C'est en ligne !

### 🎨 Designer : "Je veux ajouter des sprites"

1. Lis **[SPRITES.md](SPRITES.md)** (5 min)
2. Crée tes sprites 32×32 PNG
3. Place-les dans `sprites/`
4. Update `data/tiles.json`

---

## 📁 Structure du Projet

```
pokopia-planner/
│
├── 🚀 START_HERE.md         ← TU ES ICI
├── 📖 README.md             ← Documentation complète
├── ⚡ QUICKSTART.md         ← Guide 3 étapes
├── 📦 PROJECT_SUMMARY.md    ← Récap technique
├── 🎯 FINAL_REPORT.md       ← Rapport final
│
├── 🛠️ core/                 ← Logique métier (map, render, tools)
├── 🎨 ui/                   ← Composants UI (palette, toolbar, stats)
├── 📊 data/                 ← JSON (villes, tuiles, Pokémon)
│
├── 📄 index.html            ← Point d'entrée
├── 🎨 styles.css            ← Styles globaux
└── ⚙️ main.js               ← Orchestrateur
```

---

## ✨ Fonctionnalités Principales

### 🗺️ Éditeur de Carte

- Grille **384×384 blocs**
- **Zoom** : Molette de souris (10% → 400%)
- **Pan** : Shift+Clic ou Clic droit
- **5 Outils** : Brosse, Gomme, Remplir, Rectangle, Pipette

### 🏙️ 5 Villes Pokémon

1. **Bourg Palette** (Palette Town)
2. **Jadielle** (Viridian City)
3. **Argenta** (Pewter City)
4. **Azuria** (Cerulean City)
5. **Carmin-sur-Mer** (Vermilion City)

### 🧩 25+ Tuiles

- **Terrain** : Herbe, sable, eau, roche, terre
- **Bâtiments** : PokéCenter, Labo Prof. Chen, Arènes
- **Décor** : Arbres, fleurs, fontaines, buissons
- **Habitats** : Champignons, étangs, grottes, poteaux

### 🐾 25+ Pokémon

Système d'**attraction intelligent** :

- Place des **champignons** → Attire **Paras** (35%)
- Place un **poteau électrique** → Attire **Pikachu** (15%)
- Place 50+ **herbe** + 5+ **fleurs** → Attire **Évoli** (8%, rare !)

### 💾 Sauvegarde & Export

- **localStorage** : Sauvegarde auto par ville
- **Export PNG** : Image haute résolution
- **Export JSON** : Backup compressé (< 50 Ko)

---

## ⌨️ Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `B` | Brosse |
| `E` | Gomme |
| `F` | Remplir |
| `R` | Rectangle |
| `I` | Pipette |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+S` | Sauvegarder |
| `Shift+Clic` | Pan |

---

## 🎯 Quick Tests

### Test 1 : Attirer Pikachu ⚡

1. Lance l'app → Choisis "Bourg Palette"
2. Palette gauche → Onglet **Habitats**
3. Drag & drop **Poteau électrique** sur le canvas
4. Panneau droit → **Pikachu** apparaît avec 15% !

### Test 2 : Créer une forêt 🌳

1. Palette → Onglet **Décor**
2. Clic sur **Arbre**
3. Touche `F` (remplir)
4. Clic sur le canvas → Inondation d'arbres !

### Test 3 : Undo/Redo ↶↷

1. Dessine quelques tuiles
2. `Ctrl+Z` → Annule
3. `Ctrl+Y` → Rétablit
4. Magie ! ✨

---

## 🐛 Problèmes ?

### ❌ "Cannot find module"

➡️ **Solution** : Lance un serveur local (pas de `file://`)

```bash
python3 -m http.server 8000
```

### ❌ Console affiche des erreurs

➡️ **Solution** : Vérifie que tous les fichiers sont présents :

```bash
./check.sh
```

### ❌ Canvas vide

➡️ **Solution** : Ouvre F12 (console) et regarde les erreurs

---

## 🎓 Apprendre en Explorant

Le code est **simple et commenté** :

1. **core/map.js** (250 lignes) : Gestion de la grille
2. **core/render.js** (280 lignes) : Rendu Canvas optimisé
3. **core/tools.js** (220 lignes) : 5 outils de dessin
4. **ui/stats.js** (200 lignes) : Calcul des Pokémon attirés

**Total** : ~1,500 lignes de JavaScript propre et maintenable

---

## 🌟 Prochaines Étapes

### Option 1 : Utilisation

→ Lis **QUICKSTART.md** et commence à créer ta ville !

### Option 2 : Développement

→ Lis **PROJECT_SUMMARY.md** et explore le code

### Option 3 : Déploiement

→ Lis **DEPLOY.md** et mets l'app en ligne

### Option 4 : Contribution

→ Ajoute des sprites dans `sprites/` (voir **SPRITES.md**)

---

## 📞 Support

- 📖 Documentation : Tous les fichiers `.md`
- 🧪 Tests : `TEST.md` (30+ tests)
- ✅ Vérification : `./check.sh`
- 🐛 Debug : Ouvre F12 dans le navigateur

---

## 🎉 Have Fun!

**Pokopia City Planner** est prêt à l'emploi.

Crée ta ville Pokémon de rêve ! 🏗️✨

---

**Version** : 1.0.0 | **Licence** : MIT | **Développé avec ❤️**

🔗 **Liens Rapides** :

- [README.md](README.md) - Documentation complète
- [QUICKSTART.md](QUICKSTART.md) - Démarrage 3 étapes
- [TEST.md](TEST.md) - Checklist tests
- [DEPLOY.md](DEPLOY.md) - Déploiement prod

**Prêt ? Lance l'app et amuse-toi bien ! 🚀**
