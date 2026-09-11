/**
 * JESS THEODAT — PERSONAL WEBSITE JAVASCRIPT
 *
 * Features:
 * - Dynamic rendering of verified speaking appearances from data/speaking.json
 * - YouTube/static thumbnail support for speaking cards
 * - Current year dynamic footer update
 * - Accessible UI enhancements
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Set current copyright year
  const yearSpan = document.getElementById('current-year');

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 2. Fetch and render structured speaking/media data
  loadSpeakingAppearances();
  initCareerStack();
});


async function loadSpeakingAppearances() {
  const container = document.getElementById('speaking-container');

  if (!container) return;

  try {
    const response = await fetch('data/speaking.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const appearances = await response.json();

    // Render only when structured data contains appearances.
    // Otherwise preserve the static HTML fallback in index.html.
    if (!Array.isArray(appearances) || appearances.length === 0) {
      return;
    }

    container.innerHTML = '';

    appearances.forEach(item => {
      const card = document.createElement('article');
      card.className = 'card media-card';

      const platformLabel = escapeHtml(
        item.platform || item.type || 'Media'
      );

      const dateValue = escapeHtml(item.date || '');
      const dateLabel = formatDate(item.date);

      const title = escapeHtml(item.title || '');

      const eventName = escapeHtml(
        item.event || item.publication || ''
      );

      const role = escapeHtml(item.role || '');
      const summary = escapeHtml(item.summary || '');

      const url = item.url
        ? sanitizeUrl(item.url)
        : null;

      const thumbnail = item.thumbnail
        ? sanitizeUrl(item.thumbnail)
        : null;

      const mediaType = String(item.type || '').toLowerCase();

      const actionLabel =
        mediaType === 'podcast' && !isYouTubeUrl(url)
          ? 'Listen &rarr;'
          : 'Watch Video &rarr;';

      const thumbnailMarkup =
        thumbnail && url
          ? `
            <a
              href="${url}"
              class="media-thumbnail-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch ${title}"
            >
              <img
                src="${thumbnail}"
                alt="Video thumbnail for ${title}"
                class="media-thumbnail"
                loading="lazy"
                decoding="async"
              >

              <span
                class="media-play"
                aria-hidden="true"
              >
                ▶
              </span>
            </a>
          `
          : thumbnail
            ? `
              <div class="media-thumbnail-link media-thumbnail-static">
                <img
                  src="${thumbnail}"
                  alt="Thumbnail for ${title}"
                  class="media-thumbnail"
                  loading="lazy"
                  decoding="async"
                >
              </div>
            `
            : '';

      const eventMarkup = eventName
        ? ` · ${eventName}`
        : '';

      const dateMarkup = dateLabel
        ? `
          <time
            class="media-date"
            ${dateValue ? `datetime="${dateValue}"` : ''}
          >
            ${escapeHtml(dateLabel)}
          </time>
        `
        : '';

      const roleMarkup = role
        ? `<p class="text-muted media-role">${role}</p>`
        : '';

      const summaryMarkup = summary
        ? `<p class="media-summary">${summary}</p>`
        : '';

      const actionMarkup = url
        ? `
          <div class="media-footer">
            <a
              href="${url}"
              class="project-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${actionLabel}
            </a>
          </div>
        `
        : '';

      card.innerHTML = `
        ${thumbnailMarkup}

        <div class="media-card-body">

          <div class="media-header">

            <span class="platform-badge">
              ${platformLabel}${eventMarkup}
            </span>

            ${dateMarkup}

          </div>

          <h3 class="media-title">
            ${title}
          </h3>

          ${roleMarkup}
          ${summaryMarkup}
          ${actionMarkup}

        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    // Preserve the static HTML embedded in index.html as a resilient fallback.
    console.info(
      'Using static fallback for speaking engagements.',
      error
    );
  }
}


/**
 * Format ISO-style dates from speaking.json into a short,
 * human-readable representation such as "Jun 10, 2026".
 */
function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}


/**
 * Allow only normal HTTP(S) URLs before inserting them
 * into href/src attributes.
 */
function sanitizeUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value, window.location.origin);

    if (
      url.protocol !== 'http:' &&
      url.protocol !== 'https:'
    ) {
      return null;
    }

    return escapeHtml(url.href);

  } catch {
    return null;
  }
}


/**
 * Used to choose a more accurate action label.
 */
function isYouTubeUrl(url) {
  if (!url) return false;

  try {
    const decodedUrl = decodeHtml(url);
    const parsed = new URL(decodedUrl);

    return (
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtu.be' ||
      parsed.hostname === 'www.youtu.be'
    );

  } catch {
    return false;
  }
}


/**
 * Decode text previously escaped for HTML.
 */
function decodeHtml(str) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}


/**
 * Utility function to prevent XSS in dynamic text rendering.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/**
 * Interactive Career Stack
 *
 * Synchronizes:
 * - career narrative cards
 * - isometric stack planes
 * - defensive privacy branch
 *
 * Click/tap is persistent.
 * Hover previews a layer on pointer devices.
 * Keyboard interaction works through native buttons.
 */
function initCareerStack() {
  const section = document.getElementById('journey');

  if (!section) return;

  const cards = Array.from(
    section.querySelectorAll('.career-layer-card')
  );

  const triggers = Array.from(
    section.querySelectorAll('.career-layer-trigger')
  );

  const visualControls = Array.from(
    section.querySelectorAll(
      '.career-plane, .career-privacy-plane'
    )
  );

  if (!cards.length || !triggers.length) return;

  let selectedLayer = 'security';


  function getCard(layer) {
    return section.querySelector(
      `.career-layer-card[data-career-layer="${layer}"]`
    );
  }


  function getTrigger(layer) {
    return section.querySelector(
      `.career-layer-trigger[data-career-target="${layer}"]`
    );
  }


  function setActiveLayer(layer, options = {}) {
    const {
      persist = true,
      moveFocus = false
    } = options;

    const selectedCard = getCard(layer);

    if (!selectedCard) return;

    cards.forEach(card => {
      const isActive =
        card.dataset.careerLayer === layer;

      card.classList.toggle('is-active', isActive);

      const trigger =
        card.querySelector('.career-layer-trigger');

      const panel =
        card.querySelector('.career-layer-details');

      if (trigger) {
        trigger.setAttribute(
          'aria-selected',
          isActive ? 'true' : 'false'
        );
      }

      if (panel) {
        panel.hidden = !isActive;
      }
    });


    visualControls.forEach(control => {
      const isActive =
        control.dataset.careerTarget === layer;

      control.classList.toggle(
        'is-active',
        isActive
      );
    });


    if (persist) {
      selectedLayer = layer;
    }


    if (moveFocus) {
      const trigger = getTrigger(layer);

      if (trigger) {
        trigger.focus();
      }
    }
  }


  function restoreSelectedLayer() {
    setActiveLayer(selectedLayer, {
      persist: false
    });
  }


  /*
   * Narrative cards
   */

  triggers.forEach(trigger => {
    const layer =
      trigger.dataset.careerTarget;

    trigger.addEventListener('click', () => {
      setActiveLayer(layer);
    });


    /*
     * Optional keyboard arrow navigation between
     * career-layer tabs.
     */
    trigger.addEventListener('keydown', event => {
      const index =
        triggers.indexOf(trigger);

      let targetIndex = null;

      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowRight'
      ) {
        targetIndex =
          (index + 1) % triggers.length;
      }

      if (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowLeft'
      ) {
        targetIndex =
          (index - 1 + triggers.length)
          % triggers.length;
      }

      if (targetIndex === null) return;

      event.preventDefault();

      const next =
        triggers[targetIndex];

      setActiveLayer(
        next.dataset.careerTarget,
        {
          moveFocus: true
        }
      );
    });
  });


  /*
   * Isometric planes
   */

  visualControls.forEach(control => {
    const layer =
      control.dataset.careerTarget;

    control.addEventListener('click', () => {
      setActiveLayer(layer);
    });
  });


  /*
   * Hover previews only for devices that
   * actually support hover.
   */

  const hoverQuery =
    window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    );

  if (hoverQuery.matches) {

    cards.forEach(card => {
      const layer =
        card.dataset.careerLayer;

      card.addEventListener(
        'mouseenter',
        () => {
          setActiveLayer(layer, {
            persist: false
          });
        }
      );

      card.addEventListener(
        'mouseleave',
        restoreSelectedLayer
      );
    });


    visualControls.forEach(control => {
      const layer =
        control.dataset.careerTarget;

      control.addEventListener(
        'mouseenter',
        () => {
          setActiveLayer(layer, {
            persist: false
          });
        }
      );

      control.addEventListener(
        'mouseleave',
        restoreSelectedLayer
      );
    });
  }


  /*
   * Initial state.
   */

  setActiveLayer(selectedLayer);
}
