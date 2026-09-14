/**
 * Aditya Singh - Client Script
 * Features:
 * - Theme toggle with clean, minimal SVG icons (Sun / Moon)
 * - Circular theme reveal via View Transitions (content stays visible)
 * - Smooth in-place color morph fallback, no animation on page load
 * - Respects prefers-reduced-motion
 * - Theme state persistence via safe storage (localStorage with fallback)
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
    // Per-element color transitions are disabled during the reveal
    // (html.vt) so the GPU does one animation instead of dozens.
    const rect = toggleBtn ? toggleBtn.getBoundingClientRect() : { left: window.innerWidth - 40, top: 40, width: 24, height: 24 };
    const x = event.clientX || (rect.left + rect.width / 2);
    const y = event.clientY || (rect.top + rect.height / 2);
    document.documentElement.style.setProperty('--wipe-x', x + 'px');
    document.documentElement.style.setProperty('--wipe-y', y + 'px');

    document.documentElement.classList.add('vt');
    const transition = document.startViewTransition(() => {
      applyThemeDirect(newTheme);
    });
    const clearVt = () => {
      document.documentElement.classList.remove('vt');
    };
    if (transition && transition.finished) {
      transition.finished.then(clearVt, clearVt);
    }
    // Safety net in case the transition promise never settles.
    setTimeout(clearVt, 600);
  }

  // Initialize theme on load (before first paint morph: transitions
  // only activate once the .ready class is added below).
  const initialTheme = getSavedTheme() || getSystemTheme();
  applyThemeDirect(initialTheme);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('ready');
    });
  });

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
})();
