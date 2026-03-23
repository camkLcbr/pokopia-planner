# 🚀 Pokopia Planner - Démarrage Rapide

## Lancement immédiat

### Option 1 : Serveur Python (recommandé)

```bash
cd /Users/camillekoppel/Web/Pokopia
python3 -m http.server 8000
```

Puis ouvre : **http://localhost:8000**

### Option 2 : Serveur Node.js

```bash
cd /Users/camillekoppel/Web/Pokopia
npx http-server -p 8000
```

Puis ouvre : **http://localhost:8000**

### Option 3 : VS Code Live Server

1. Ouvre le dossier dans VS Code
2. Clic droit sur `index.html`
3. Sélectionne **"Open with Live Server"**

## Premier test

1. **Écran d'accueil** : Choisis "Bourg Palette" → Cliquer sur "Commencer"
2. **Palette gauche** : Drag & drop une tuile "Arbre" vers le canvas
3. **Zoom** : Molette de souris pour zoomer
4. **Pan** : Shift + Clic gauche pour déplacer la vue
5. **Stats** : Le panneau droit affiche les Pokémon attirés !

## Raccourcis utiles

- `B` : Brosse
- `E` : Gomme
- `F` : Remplir (flood fill)
- `Ctrl+Z` : Undo
- `Ctrl+S` : Sauvegarder

## Vérification

Ouvre la **console du navigateur** (F12) :

Tu devrais voir :
```
🚀 Pokopia Planner - Initialisation...
📦 Chargé: 25 tuiles, 5 villes, 25 Pokémon
✅ Pokopia Planner - Prêt !
```

Si tu vois des erreurs, vérifie que :
- Le serveur local est bien lancé
- Les fichiers JSON sont dans `data/`
- Ton navigateur supporte les modules ES (Chrome/Firefox/Safari récents)

## Problèmes courants

### ❌ "CORS error" ou "Failed to load module"

➡️ **Solution** : Lance un serveur local (Option 1 ou 2), ne pas ouvrir `index.html` directement

### ❌ "Cannot find module"

➡️ **Solution** : Vérifie que la structure des dossiers est correcte :
```
Pokopia/
├── index.html
├── main.js
├── core/
├── ui/
└── data/
```

### ❌ Canvas vide / Rien ne s'affiche

➡️ **Solution** : Ouvre la console (F12), regarde les erreurs. Vérifie que `tiles.json` se charge correctement.

## Support

- 📖 Documentation complète : [README.md](README.md)
- 🐛 Problème ? Ouvre la console du navigateur (F12)

---

**Bon dev ! 🎉**
