/**
 * StatsPanel - Panneau de statistiques temps réel
 * Calcule les Pokémon attirés selon les habitats
 */

export class StatsPanel {
  constructor(containerId, tilesData, pokemonData) {
    this.container = document.getElementById(containerId);
    this.tilesData = tilesData;
    this.pokemonData = pokemonData;

    this.currentStats = {
      modified: 0,
      pokemonCount: 0,
      score: 0,
      resources: { wood: 0, stone: 0 },
      attractedPokemon: []
    };
  }

  /**
   * Met à jour les stats depuis la grille
   */
  update(mapGrid) {
    const tileCounts = mapGrid.countTiles();

    // Calcul ressources
    let woodCost = 0;
    let stoneCost = 0;

    for (const [tileId, count] of Object.entries(tileCounts)) {
      const tileInfo = this.tilesData[tileId];
      if (tileInfo && tileInfo.cost) {
        woodCost += (tileInfo.cost.wood || 0) * count;
        stoneCost += (tileInfo.cost.stone || 0) * count;
      }
    }

    // Calcul Pokémon attirés
    const attractedPokemon = this.calculateAttractedPokemon(tileCounts);

    // Score habitat (% de tuiles modifiées)
    const totalTiles = mapGrid.width * mapGrid.height;
    const score = Math.min(100, Math.round((mapGrid.modifiedCount / totalTiles) * 100));

    this.currentStats = {
      modified: mapGrid.modifiedCount,
      pokemonCount: attractedPokemon.length,
      score,
      resources: { wood: woodCost, stone: stoneCost },
      attractedPokemon
    };

    this.render();
  }

  /**
   * Calcule les Pokémon attirés selon habitats
   */
  calculateAttractedPokemon(tileCounts) {
    const attracted = [];

    for (const [pokemonId, pokemonInfo] of Object.entries(this.pokemonData)) {
      let probability = pokemonInfo.baseChance;
      let meetsRequirements = true;

      // Vérifie les exigences minimales
      if (pokemonInfo.requirements && pokemonInfo.requirements.minTiles) {
        for (const [requiredTile, minCount] of Object.entries(pokemonInfo.requirements.minTiles)) {
          const actualCount = tileCounts[requiredTile] || 0;
          if (actualCount < minCount) {
            meetsRequirements = false;
            break;
          }
        }
      }

      if (!meetsRequirements) continue;

      // Calcul de la probabilité basée sur les habitats préférés
      let habitatScore = 0;
      for (const habitat of pokemonInfo.preferredHabitats) {
        const count = tileCounts[habitat] || 0;
        habitatScore += count;
      }

      // Bonus de probabilité
      if (habitatScore > 0) {
        probability = Math.min(1, probability + (habitatScore / 1000));
      }

      if (probability > 0) {
        attracted.push({
          id: pokemonId,
          name: pokemonInfo.name,
          number: pokemonInfo.number,
          probability: Math.round(probability * 100),
          types: pokemonInfo.types
        });
      }
    }

    // Trie par probabilité décroissante
    attracted.sort((a, b) => b.probability - a.probability);

    return attracted.slice(0, 20); // Top 20
  }

  /**
   * Rendu du panneau
   */
  render() {
    if (!this.container) return;

    const { modified, pokemonCount, score, resources, attractedPokemon } = this.currentStats;

    this.container.innerHTML = `
      <h3>📊 Statistiques</h3>

      <div class="stat">
        <span class="stat-label">Cases modifiées</span>
        <span class="stat-value">${modified.toLocaleString()}</span>
      </div>

      <div class="stat">
        <span class="stat-label">Pokémon attirés</span>
        <span class="stat-value">${pokemonCount}/300</span>
      </div>

      <div class="stat">
        <span class="stat-label">Score habitat</span>
        <span class="stat-value">${score}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${score}%"></div>
      </div>

      <h4>💰 Ressources</h4>
      <div class="stat">
        <span class="stat-label">🪵 Bois</span>
        <span class="stat-value">${resources.wood}</span>
      </div>
      <div class="stat">
        <span class="stat-label">🪨 Pierre</span>
        <span class="stat-value">${resources.stone}</span>
      </div>

      <h4>🐾 Pokémon probables</h4>
      <div class="pokemon-list">
        ${this.renderPokemonList(attractedPokemon)}
      </div>
    `;
  }

  /**
   * Rendu de la liste des Pokémon
   */
  renderPokemonList(pokemonList) {
    if (pokemonList.length === 0) {
      return `
        <div style="text-align: center; padding: 20px; color: #999; font-size: 13px;">
          Aucun Pokémon attiré pour le moment.<br>
          Ajoute des habitats spécifiques !
        </div>
      `;
    }

    return pokemonList
      .map(pokemon => {
        const probabilityColor = this.getProbabilityColor(pokemon.probability);
        return `
          <div class="pokemon-item">
            <div class="pokemon-info">
              <span class="pokemon-name">#${pokemon.number} ${pokemon.name}</span>
              <div style="font-size: 11px; color: #999; margin-top: 2px;">
                ${pokemon.types.map(t => `<span style="background: ${this.getTypeColor(t)}; padding: 2px 6px; border-radius: 3px; color: white; font-size: 10px; margin-right: 3px;">${t}</span>`).join('')}
              </div>
            </div>
            <span class="pokemon-probability" style="color: ${probabilityColor};">
              ${pokemon.probability}%
            </span>
          </div>
        `;
      })
      .join('');
  }

  /**
   * Couleur selon probabilité
   */
  getProbabilityColor(probability) {
    if (probability >= 50) return '#4CAF50';
    if (probability >= 25) return '#FFC107';
    return '#FF5722';
  }

  /**
   * Couleur selon type Pokémon
   */
  getTypeColor(type) {
    const colors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };

    return colors[type] || '#999';
  }

  /**
   * Export des stats
   */
  exportStats() {
    return this.currentStats;
  }
}
