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

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY);
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

  function performThemeWipe(newTheme, event) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || !event) {
      localStorage.setItem(STORAGE_KEY, newTheme);
      applyThemeDirect(newTheme);
      return;
    }

    // Origin of wipe animation (button click location or top right default)
    const rect = toggleBtn ? toggleBtn.getBoundingClientRect() : { left: window.innerWidth - 40, top: 40, width: 24, height: 24 };
    const x = event.clientX || (rect.left + rect.width / 2);
    const y = event.clientY || (rect.top + rect.height / 2);

    // Calculate maximum radius to cover the entire screen
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // Target background color for the incoming theme
    const nextBgColor = newTheme === 'dark' ? '#110e19' : '#ffffff';

    // Create transient layer wipe overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = nextBgColor;
    overlay.style.zIndex = '99999';
    overlay.style.pointerEvents = 'none';
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
    overlay.style.transition = 'clip-path 500ms cubic-bezier(0.4, 0, 0.2, 1)';
    document.body.appendChild(overlay);

    // Trigger expansion
    requestAnimationFrame(() => {
      overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;
    });

    // Apply actual DOM theme change halfway through the wipe transition
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, newTheme);
      applyThemeDirect(newTheme);
    }, 250);

    // Remove wipe overlay smoothly upon completion
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 150ms ease';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 150);
    }, 520);
  }

  // Initialize theme on load
  const initialTheme = getSavedTheme() || getSystemTheme();
  applyThemeDirect(initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function (e) {
      const currentTheme = document.documentElement.getAttribute('data-theme') || getSystemTheme();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      performThemeWipe(newTheme, e);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!getSavedTheme()) {
      applyThemeDirect(e.matches ? 'dark' : 'light');
    }
  });

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
