# 🎨 Guide d'intégration des Sprites

## Format requis

- **Taille** : 32×32 pixels
- **Format** : PNG avec transparence
- **Emplacement** : `sprites/` à la racine

## Structure recommandée

```
sprites/
├── terrain/
│   ├── grass.png
│   ├── sand.png
│   ├── water.png
│   └── rock.png
│
├── buildings/
│   ├── pokecenter.png (4×4 = 128×128px)
│   ├── oak-house.png (3×3 = 96×96px)
│   └── gym.png
│
├── decor/
│   ├── tree.png
│   ├── fountain.png
│   └── flowers.png
│
└── habitat/
    ├── mushroom.png
    ├── pond.png
    └── cave.png
```

## Bâtiments multi-cases

Pour les bâtiments plus grands que 1×1 :

- **PokéCenter (4×4)** : Sprite de 128×128px (4 × 32)
- **Maison Oak (3×3)** : Sprite de 96×96px (3 × 32)

Le renderer ajustera automatiquement la taille selon `size` dans `tiles.json`.

## Intégration dans tiles.json

```json
{
  "grass": {
    "id": "grass",
    "sprite": "sprites/terrain/grass.png",
    "color": "#90EE90"  // Fallback si sprite ne charge pas
  }
}
```

## Création automatique de sprites (placeholder)

Si tu n'as pas encore de sprites, voici un script Node.js pour générer des placeholders :

```javascript
// generate-sprites.js
const { createCanvas } = require('canvas');
const fs = require('fs');

const tiles = require('./data/tiles.json');

Object.entries(tiles).forEach(([id, tile]) => {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  // Remplit avec la couleur
  ctx.fillStyle = tile.color || '#90EE90';
  ctx.fillRect(0, 0, 32, 32);

  // Bordure
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 32, 32);

  // Sauvegarde
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`sprites/${id}.png`, buffer);
});

console.log('✅ Sprites générés !');
```

Lancer avec :
```bash
npm install canvas
node generate-sprites.js
```

## Ressources gratuites

Sites pour trouver des sprites Pokémon 32×32 :

- [PokéCommunity Pixel Art](https://www.pokecommunity.com/forumdisplay.php?f=54)
- [Spriters Resource](https://www.spriters-resource.com/)
- [OpenGameArt](https://opengameart.org/)

## Préchargement des sprites

Les sprites sont préchargés au démarrage via `CanvasRenderer.preloadSprites()`.

Pour forcer le rechargement :

```javascript
// Console du navigateur
await pokopiaApp.renderer.preloadSprites(pokopiaApp.tilesData);
pokopiaApp.render();
```

## Performance

- **Cache automatique** : Les sprites sont mis en cache après premier chargement
- **Fallback couleur** : Si sprite manquant, affiche la couleur de `tiles.json`
- **Async loading** : Pas de blocage du rendu pendant le chargement

## TODO Sprites prioritaires

Pour un rendu visuel de base, commence par :

1. ✅ Terrains de base (herbe, eau, sable, roche)
2. ✅ Arbres et fleurs
3. ✅ PokéCenter et maisons
4. ⏳ Détails (champignons, poubelles, poteaux...)

---

**Note** : L'application fonctionne parfaitement sans sprites (mode couleurs). Les sprites sont un bonus visuel !
