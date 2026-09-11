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
