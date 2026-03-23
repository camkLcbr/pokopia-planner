# 🚀 Déploiement - Pokopia City Planner

## Options de déploiement (100% statique)

L'application est **100% front-end** sans backend, elle peut être déployée sur n'importe quel hébergement statique.

---

## 1️⃣ Netlify (Recommandé)

### Avantages
- ✅ Gratuit
- ✅ HTTPS automatique
- ✅ CDN global
- ✅ Deploy en 2 minutes

### Déploiement

**Option A : Drag & Drop**

1. Va sur [netlify.com](https://netlify.com)
2. Crée un compte (gratuit)
3. Drag & drop le dossier `Pokopia/` dans Netlify Drop
4. C'est tout ! URL : `https://pokopia-planner.netlify.app`

**Option B : CLI**

```bash
# Installe Netlify CLI
npm install -g netlify-cli

# Authentifie-toi
netlify login

# Deploy depuis le dossier
cd /Users/camillekoppel/Web/Pokopia
netlify deploy --prod
```

### Configuration (netlify.toml)

```toml
[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 2️⃣ Vercel

### Avantages
- ✅ Gratuit
- ✅ Performance excellente
- ✅ Git integration

### Déploiement

```bash
# Installe Vercel CLI
npm install -g vercel

# Deploy
cd /Users/camillekoppel/Web/Pokopia
vercel
```

**URL** : `https://pokopia-planner.vercel.app`

---

## 3️⃣ GitHub Pages

### Avantages
- ✅ 100% gratuit
- ✅ Intégration Git

### Déploiement

```bash
# Crée un repo GitHub
git init
git add .
git commit -m "Initial commit - Pokopia Planner v1.0.0"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/pokopia-planner.git
git push -u origin main

# Active GitHub Pages
# Settings → Pages → Source: main branch → Save
```

**URL** : `https://TON-USERNAME.github.io/pokopia-planner/`

---

## 4️⃣ Cloudflare Pages

### Avantages
- ✅ CDN ultra-rapide
- ✅ Gratuit
- ✅ Analytics inclus

### Déploiement

1. Push sur GitHub (voir ci-dessus)
2. Va sur [pages.cloudflare.com](https://pages.cloudflare.com)
3. Connecte ton repo GitHub
4. Build settings :
   - Build command : (vide)
   - Build output : `/`

**URL** : `https://pokopia-planner.pages.dev`

---

## 5️⃣ Firebase Hosting

### Avantages
- ✅ Google infrastructure
- ✅ SSL automatique
- ✅ Bon pour futures features (Auth, Firestore...)

### Déploiement

```bash
# Installe Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init
cd /Users/camillekoppel/Web/Pokopia
firebase init hosting

# Deploy
firebase deploy
```

**firebase.json** :

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**URL** : `https://pokopia-planner.web.app`

---

## 📋 Checklist Pré-Déploiement

Avant de déployer, vérifie :

- [ ] Tous les fichiers JSON sont dans `data/`
- [ ] `index.html` pointe vers les bons chemins (relatifs)
- [ ] Console (F12) ne montre aucune erreur
- [ ] Test en local fonctionne (http://localhost:8000)
- [ ] Sprites (si présents) sont dans `sprites/`
- [ ] `.gitignore` est configuré
- [ ] README.md est à jour

---

## 🌍 Configuration Domaine Custom

### Netlify

1. Settings → Domain management
2. Add custom domain : `pokopia.camillekoppel.fr`
3. Configure DNS :
   ```
   A     @     75.2.60.5
   CNAME www   pokopia-planner.netlify.app
   ```

### Vercel

1. Settings → Domains
2. Add : `pokopia.camillekoppel.fr`
3. Configure DNS (instructions Vercel)

---

## 📊 Analytics (optionnel)

### Google Analytics

Ajoute dans `index.html` avant `</head>` :

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible (Privacy-friendly)

```html
<script defer data-domain="pokopia-planner.netlify.app"
        src="https://plausible.io/js/script.js"></script>
```

---

## 🔧 Optimisations Production

### 1. Minify CSS/JS (optionnel)

```bash
# Installe terser + clean-css
npm install -g terser clean-css-cli

# Minify
terser main.js -o main.min.js -c -m
cleancss -o styles.min.css styles.css

# Update index.html pour pointer vers .min
```

### 2. Compression Gzip

La plupart des hébergeurs (Netlify, Vercel) activent Gzip automatiquement.

### 3. Cache Headers

**netlify.toml** :

```toml
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/data/*.json"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

---

## 🎯 Recommandation Finale

**Pour un déploiement rapide** : **Netlify** (drag & drop)

**Pour Git workflow** : **Vercel** ou **GitHub Pages**

**Pour évolution future** : **Firebase Hosting** (Auth, Database prêts)

---

## ✅ Déploiement Complet

Une fois déployé, teste :

1. [ ] URL fonctionne
2. [ ] HTTPS actif
3. [ ] Toutes les pages chargent
4. [ ] Console sans erreur
5. [ ] Sauvegarde localStorage fonctionne
6. [ ] Export PNG/JSON fonctionne

---

**URL de production** : `https://pokopia-planner.netlify.app` 🚀

**Bon déploiement !** 🎉
