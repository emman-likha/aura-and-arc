/**
 * Aura & Arc — Hero Interactive Lighting & Cursor Spotlight
 * Implements architectural light tracking and smooth flashlight illumination.
 */
(function () {
  'use strict';

  function initHeroLighting(container) {
    const hero = container.classList.contains('aura-arc-hero')
      ? container
      : container.querySelector('.aura-arc-hero');

    if (!hero) return;

    // Check if cursor spotlight is enabled on this section
    const spotlight = hero.querySelector('.aura-arc-hero__cursor-spotlight');
    if (!spotlight) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovering = false;
    let rafId = null;

    function onPointerEnter(e) {
      if (e.pointerType === 'touch') return;
      isHovering = true;
      hero.classList.add('is-spotlight-active');
      const rect = hero.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      currentX = targetX;
      currentY = targetY;
      hero.style.setProperty('--hero-cursor-x', `${currentX}px`);
      hero.style.setProperty('--hero-cursor-y', `${currentY}px`);
      if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    }

    function onPointerMove(e) {
      if (e.pointerType === 'touch') return;
      const rect = hero.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      if (!isHovering) {
        isHovering = true;
        hero.classList.add('is-spotlight-active');
      }
      if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    }

    function onPointerLeave() {
      isHovering = false;
      hero.classList.remove('is-spotlight-active');
    }

    function render() {
      if (!isHovering && Math.abs(targetX - currentX) < 0.5 && Math.abs(targetY - currentY) < 0.5) {
        rafId = null;
        return;
      }

      // Smooth organic lerp (easing) for light feel
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      hero.style.setProperty('--hero-cursor-x', `${currentX.toFixed(2)}px`);
      hero.style.setProperty('--hero-cursor-y', `${currentY.toFixed(2)}px`);

      rafId = requestAnimationFrame(render);
    }

    hero.addEventListener('pointerenter', onPointerEnter, { passive: true });
    hero.addEventListener('pointermove', onPointerMove, { passive: true });
    hero.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Expand flame on interactive targets (buttons, links)
    const interactives = hero.querySelectorAll('a, button, input');
    interactives.forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        hero.classList.add('is-spotlight-magnetic');
      });
      el.addEventListener('pointerleave', function () {
        hero.classList.remove('is-spotlight-magnetic');
      });
    });

    // Cleanup method attached to DOM for reloads
    hero._cleanupHeroLighting = function () {
      hero.removeEventListener('pointerenter', onPointerEnter);
      hero.removeEventListener('pointermove', onPointerMove);
      hero.removeEventListener('pointerleave', onPointerLeave);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
  }

  function initAllHeroes() {
    document.querySelectorAll('.aura-arc-hero').forEach(function (hero) {
      if (hero._cleanupHeroLighting) {
        hero._cleanupHeroLighting();
      }
      initHeroLighting(hero);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllHeroes);
  } else {
    initAllHeroes();
  }

  // Shopify Theme Editor live reload events
  document.addEventListener('shopify:section:load', function (event) {
    initHeroLighting(event.target);
  });

  document.addEventListener('shopify:section:unload', function (event) {
    const hero = event.target.querySelector('.aura-arc-hero');
    if (hero && hero._cleanupHeroLighting) {
      hero._cleanupHeroLighting();
    }
  });
})();
