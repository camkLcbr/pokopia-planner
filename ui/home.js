/**
 * HomeScreen - Écran d'accueil avec sélection des 5 villes
 */

import { icon, initIcons } from '../utils/icons.js';
import { i18n, t } from '../utils/i18n.js';

export class HomeScreen {
  constructor(containerId, citiesData, onCitySelect) {
    this.container = document.getElementById(containerId);
    this.citiesData = citiesData;
    this.onCitySelect = onCitySelect;

    // Écoute les changements de langue pour re-render
    i18n.onChange(() => this.render());

    this.render();
    this.setupEventListeners();
  }

  /**
   * Rendu de l'écran d'accueil
   */
  render() {
    const cities = Object.values(this.citiesData);

    this.container.innerHTML = `
      <h1>${icon('building-2', 32)} ${t('home.title')}</h1>
      <p class="welcome-subtitle">
        ${t('home.subtitle')}
      </p>

      <div class="cities-grid">
        ${cities.map(city => this.renderCityCard(city)).join('')}
      </div>
    `;

    // Initialise les icônes Lucide
    initIcons();
  }

  /**
   * Rendu d'une carte de ville
   */
  renderCityCard(city) {
    const hasSave = this.checkSave(city.id);
    const currentLang = i18n.getLang();
    const cityName = currentLang === 'fr' ? (city.name_fr || city.name) : city.name;

    return `
      <div class="city-card" data-city="${city.id}">
        <h3>${cityName}</h3>
        <p>${city.description}</p>

        <div class="city-card-actions">
          ${hasSave
            ? `<button class="city-btn" data-action="load" data-city="${city.id}">
                 ${icon('folder-open', 16)} ${t('home.load')}
               </button>`
            : ''
          }
          <button class="city-btn ${!hasSave ? '' : 'secondary'}" data-action="new" data-city="${city.id}">
            ${icon('sparkles', 16)} ${hasSave ? t('home.new') : t('home.start')}
          </button>
        </div>

        ${hasSave
          ? `<div style="margin-top: 12px; font-size: 12px; color: #999;">
               ${icon('save', 14)} ${t('home.lastSave')} : ${this.getLastSaveDate(city.id)}
             </div>`
          : ''
        }
      </div>
    `;
  }

  /**
   * Vérifie si une sauvegarde existe
   */
  checkSave(cityId) {
    return localStorage.getItem(`pokopia-${cityId}`) !== null;
  }

  /**
   * Obtient la date de dernière sauvegarde
   */
  getLastSaveDate(cityId) {
    const saved = localStorage.getItem(`pokopia-${cityId}`);
    if (!saved) return 'Jamais';

    try {
      const data = JSON.parse(saved);
      const date = new Date(data.date);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Inconnue';
    }
  }

  /**
   * Event listeners
   */
  setupEventListeners() {
    this.container.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const cityId = btn.dataset.city;

      if (action === 'load') {
        this.loadCity(cityId);
      } else if (action === 'new') {
        this.newCity(cityId);
      }
    });
  }

  /**
   * Charge une ville existante
   */
  loadCity(cityId) {
    if (this.onCitySelect) {
      this.onCitySelect(cityId, 'load');
    }
    this.hide();
  }

  /**
   * Crée une nouvelle ville
   */
  newCity(cityId) {
    if (this.checkSave(cityId)) {
      if (!confirm(t('home.confirmReplace'))) {
        return;
      }
    }

    if (this.onCitySelect) {
      this.onCitySelect(cityId, 'new');
    }
    this.hide();
  }

  /**
   * Affiche l'écran d'accueil
   */
  show() {
    this.container.classList.remove('hidden');
    this.render(); // Re-render pour mettre à jour les dates
  }

  /**
   * Cache l'écran d'accueil
   */
  hide() {
    this.container.classList.add('hidden');
  }

  /**
   * Vérifie si l'écran est visible
   */
  isVisible() {
    return !this.container.classList.contains('hidden');
  }
}
