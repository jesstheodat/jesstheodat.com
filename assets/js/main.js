/**
 * JESS THEODAT — PERSONAL WEBSITE JAVASCRIPT
 *
 * Features:
 * - Dynamic Speaking & Media rendering
 * - Interactive Career Stack
 * - Current year footer update
 * - Accessible keyboard and pointer interactions
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

    if (!Array.isArray(appearances) || appearances.length === 0) {
      return;
    }


    /*
     * Choose one featured appearance.
     *
     * speaking.json controls the editorial choice.
     * If none is explicitly featured, use the first item.
     */

    const featured =
      appearances.find(item => item.featured === true)
      || appearances[0];

    const remaining =
      appearances.filter(item => item !== featured);


    container.innerHTML = '';


    /* ==========================================================
       Featured Appearance
       ========================================================== */

    container.appendChild(
      createFeaturedAppearance(featured)
    );


    /* ==========================================================
       More Conversations
       ========================================================== */

    if (remaining.length > 0) {
      const heading = document.createElement('div');

      heading.className = 'media-more-header';

      heading.innerHTML = `
        <h3>More conversations</h3>
      `;

      container.appendChild(heading);


      const grid = document.createElement('div');

      grid.className = 'media-grid';


      remaining.forEach(item => {
        grid.appendChild(
          createMediaCard(item)
        );
      });


      container.appendChild(grid);
    }

  } catch (error) {
    /*
     * Keep the semantic HTML already embedded
     * in index.html if JSON fails.
     */
    console.info(
      'Using static fallback for speaking engagements.',
      error
    );
  }
}


/**
 * Featured editorial appearance.
 */
function createFeaturedAppearance(item) {
  const article = document.createElement('article');

  article.className = 'media-featured';


  const title =
    escapeHtml(item.title || '');

  const event =
    escapeHtml(item.event || item.publication || '');

  const role =
    escapeHtml(item.role || '');

  const topic =
    escapeHtml(item.topic || '');

  const summary =
    escapeHtml(item.summary || '');

  const dateLabel =
    formatMediaMonth(item.date);

  const url =
    item.url
      ? sanitizeUrl(item.url)
      : null;

  const thumbnail =
    item.thumbnail
      ? sanitizeUrl(item.thumbnail)
      : null;


  const meta = [
    event,
    role,
    dateLabel
  ]
    .filter(Boolean)
    .join(' · ');


  article.innerHTML = `
    ${
      thumbnail && url
        ? `
          <a
            href="${url}"
            class="media-featured-thumbnail"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Watch ${title}"
          >
            <img
              src="${thumbnail}"
              alt="Video thumbnail for ${title}"
              loading="lazy"
              decoding="async"
            >

            <span
              class="media-play media-play-large"
              aria-hidden="true"
            >
              ▶
            </span>
          </a>
        `
        : ''
    }


    <div class="media-featured-content">

      <span class="media-featured-label">
        Featured conversation
      </span>

      ${
        meta
          ? `<p class="media-meta">${meta}</p>`
          : ''
      }

      <h3 class="media-featured-title">
        ${title}
      </h3>

      ${
        summary
          ? `
            <p class="media-featured-summary">
              ${summary}
            </p>
          `
          : ''
      }

      ${
        topic
          ? `
            <div class="media-topic">
              ${topic}
            </div>
          `
          : ''
      }

      ${
        url
          ? `
            <a
              href="${url}"
              class="project-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch Video &rarr;
            </a>
          `
          : ''
      }

    </div>
  `;


  return article;
}


/**
 * Secondary appearance card.
 */
function createMediaCard(item) {
  const article = document.createElement('article');

  article.className = 'media-card';


  const title =
    escapeHtml(item.title || '');

  const event =
    escapeHtml(item.event || item.publication || '');

  const role =
    escapeHtml(item.role || '');

  const topic =
    escapeHtml(item.topic || '');

  const summary =
    escapeHtml(item.summary || '');

  const dateLabel =
    formatMediaMonth(item.date);

  const url =
    item.url
      ? sanitizeUrl(item.url)
      : null;

  const thumbnail =
    item.thumbnail
      ? sanitizeUrl(item.thumbnail)
      : null;


  const meta = [
    event,
    role,
    dateLabel
  ]
    .filter(Boolean)
    .join(' · ');


  article.innerHTML = `
    ${
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
        : ''
    }


    <div class="media-card-body">

      ${
        meta
          ? `<p class="media-meta">${meta}</p>`
          : ''
      }

      <h3 class="media-title">
        ${title}
      </h3>

      ${
        summary
          ? `
            <p class="media-summary">
              ${summary}
            </p>
          `
          : ''
      }

      ${
        topic
          ? `
            <div class="media-topic">
              ${topic}
            </div>
          `
          : ''
      }

      ${
        url
          ? `
            <div class="media-footer">
              <a
                href="${url}"
                class="project-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Video &rarr;
              </a>
            </div>
          `
          : ''
      }

    </div>
  `;


  return article;
}


/**
 * Compact date for media metadata:
 * "2025-05-21" -> "May 2025"
 */
function formatMediaMonth(dateString) {
  if (!dateString) return '';

  const date =
    new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      year: 'numeric'
    }
  ).format(date);
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
    section.querySelectorAll('.career-plane')
  );

  if (!cards.length || !triggers.length) return;

  let selectedLayer = 'security';

  function previewLayer(layer) {
    visualControls.forEach(control => {
      const isActive =
        control.dataset.careerTarget === layer;
  
      control.classList.toggle(
        'is-active',
        isActive
      );
    });
  }


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
        () => previewLayer(layer)
      );
  
      card.addEventListener(
        'mouseleave',
        () => previewLayer(selectedLayer)
      );
    });


   visualControls.forEach(control => {
      const layer =
        control.dataset.careerTarget;
  
      control.addEventListener(
        'mouseenter',
        () => previewLayer(layer)
      );
  
      control.addEventListener(
        'mouseleave',
        () => previewLayer(selectedLayer)
      );
    });
  }

  /*
   * Initial state.
   */

  setActiveLayer(selectedLayer);
}
