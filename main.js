/**
 * Aditya Singh - Client Script
 * Features:
 * - Theme toggle with clean, minimal SVG icons (Sun / Moon)
 * - Interactive radial layer/wipe transition traveling across the page (400-600ms)
 * - Respects prefers-reduced-motion
 * - Theme state persistence via localStorage
 * - View source inspector drawer
 */

(function () {
  'use strict';

  console.log("if you can read this, you're my favorite kind of nerd. email me: devdotaadi@gmail.com");

  const STORAGE_KEY = 'aditya_site_theme';
  const toggleBtn = document.getElementById('theme-toggle');
  const memoryStore = {};

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      memoryStore[key] = value;
    }
  }

  function getSavedTheme() {
    return safeGet(STORAGE_KEY);
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function updateIcon(theme) {
    if (!toggleBtn) return;
    const sunIcon = toggleBtn.querySelector('.sun-icon');
    const moonIcon = toggleBtn.querySelector('.moon-icon');
    
    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'inline-block';
      toggleBtn.setAttribute('aria-label', 'Switch to light mode');
      toggleBtn.setAttribute('title', 'Switch to light mode');
    } else {
      if (sunIcon) sunIcon.style.display = 'inline-block';
      if (moonIcon) moonIcon.style.display = 'none';
      toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      toggleBtn.setAttribute('title', 'Switch to dark mode');
    }
  }

  function applyThemeDirect(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    updateIcon(theme);
  }

  function performThemeSwap(newTheme, event) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    safeSet(STORAGE_KEY, newTheme);

    // No animation path: reduced motion, keyboard toggle, or no View Transitions support.
    // style.css color transitions morph the theme in place. Content never hides.
    if (prefersReducedMotion || !event || typeof document.startViewTransition !== 'function') {
      applyThemeDirect(newTheme);
      return;
    }

    // Circular reveal from the click point. The browser cross-fades
    // old to new snapshot, so content stays visible throughout.
    const rect = toggleBtn ? toggleBtn.getBoundingClientRect() : { left: window.innerWidth - 40, top: 40, width: 24, height: 24 };
    const x = event.clientX || (rect.left + rect.width / 2);
    const y = event.clientY || (rect.top + rect.height / 2);
    document.documentElement.style.setProperty('--wipe-x', x + 'px');
    document.documentElement.style.setProperty('--wipe-y', y + 'px');

    document.startViewTransition(() => {
      applyThemeDirect(newTheme);
    });
  }

  // Initialize theme on load
  const initialTheme = getSavedTheme() || getSystemTheme();
  applyThemeDirect(initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function (e) {
      const currentTheme = document.documentElement.getAttribute('data-theme') || getSystemTheme();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      performThemeSwap(newTheme, e);
    });
  }

  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function onColorSchemeChange(e) {
    if (!getSavedTheme()) {
      applyThemeDirect(e.matches ? 'dark' : 'light');
    }
  }

  if (typeof colorSchemeQuery.addEventListener === 'function') {
    colorSchemeQuery.addEventListener('change', onColorSchemeChange);
  } else if (typeof colorSchemeQuery.addListener === 'function') {
    colorSchemeQuery.addListener(onColorSchemeChange);
  }

  // View Source Drawer
  const viewSourceBtn = document.getElementById('view-source-btn');
  const sourceContainer = document.getElementById('source-view-container');

  if (viewSourceBtn && sourceContainer) {
    viewSourceBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (sourceContainer.hidden) {
        const htmlContent = document.doctype 
          ? new XMLSerializer().serializeToString(document.doctype) + "\n" + document.documentElement.outerHTML
          : document.documentElement.outerHTML;
        
        sourceContainer.textContent = htmlContent;
        sourceContainer.hidden = false;
        viewSourceBtn.textContent = '[hide source]';
      } else {
        sourceContainer.hidden = true;
        viewSourceBtn.textContent = '[View source]';
      }
    });
  }
})();
