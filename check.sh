#!/bin/bash

# Pokopia Planner - Script de vérification
# Vérifie que tous les fichiers requis sont présents

echo "🔍 Vérification du projet Pokopia Planner..."
echo ""

errors=0

# Fonction de vérification
check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1"
  else
    echo "❌ $1 MANQUANT"
    ((errors++))
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo "✅ $1/"
  else
    echo "❌ $1/ MANQUANT"
    ((errors++))
  fi
}

# Fichiers principaux
echo "📄 Fichiers HTML/CSS/JS:"
check_file "index.html"
check_file "styles.css"
check_file "main.js"
echo ""

# Modules core
echo "🔧 Modules core:"
check_file "core/map.js"
check_file "core/render.js"
check_file "core/tools.js"
echo ""

# Modules UI
echo "🖼️ Modules UI:"
check_file "ui/home.js"
check_file "ui/palette.js"
check_file "ui/toolbar.js"
check_file "ui/stats.js"
echo ""

# Données JSON
echo "📊 Fichiers de données:"
check_file "data/tiles.json"
check_file "data/cities.json"
check_file "data/pokemon.json"
echo ""

# Dossiers
echo "📁 Dossiers:"
check_dir "sprites"
check_dir "core"
check_dir "ui"
check_dir "data"
echo ""

# Documentation
echo "📚 Documentation:"
check_file "README.md"
check_file "QUICKSTART.md"
check_file "CHANGELOG.md"
check_file "PROJECT_SUMMARY.md"
check_file "SPRITES.md"
check_file "DEPLOY.md"
check_file "TEST.md"
echo ""

# Test JSON syntax
echo "🧪 Test syntaxe JSON:"

if command -v python3 &> /dev/null; then
  if python3 -c "import json; json.load(open('data/tiles.json'))" 2>/dev/null; then
    echo "✅ data/tiles.json (syntaxe valide)"
  else
    echo "❌ data/tiles.json (ERREUR SYNTAXE)"
    ((errors++))
  fi

  if python3 -c "import json; json.load(open('data/cities.json'))" 2>/dev/null; then
    echo "✅ data/cities.json (syntaxe valide)"
  else
    echo "❌ data/cities.json (ERREUR SYNTAXE)"
    ((errors++))
  fi

  if python3 -c "import json; json.load(open('data/pokemon.json'))" 2>/dev/null; then
    echo "✅ data/pokemon.json (syntaxe valide)"
  else
    echo "❌ data/pokemon.json (ERREUR SYNTAXE)"
    ((errors++))
  fi
else
  echo "⚠️  Python3 non trouvé, skip test JSON"
fi

echo ""

# Résumé
if [ $errors -eq 0 ]; then
  echo "✅ SUCCÈS : Tous les fichiers sont présents !"
  echo ""
  echo "🚀 Pour lancer l'application:"
  echo "   python3 -m http.server 8000"
  echo "   puis ouvre http://localhost:8000"
  exit 0
else
  echo "❌ ERREUR : $errors fichier(s) manquant(s)"
  exit 1
fi
