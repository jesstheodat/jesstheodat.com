/**
 * JESS THEODAT — PERSONAL WEBSITE JAVASCRIPT
 * Features:
 * - Dynamic rendering of verified speaking appearances from data/speaking.json
 * - Current year dynamic footer update
 * - Accessible UI enhancements
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Set current copyright year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Fetch and render structured speaking/media data safely
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

        // Render only if verified items exist
        if (Array.isArray(appearances) && appearances.length > 0) {
            container.innerHTML = ''; // Clear fallback state
            
            appearances.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card media-card';

                const platformLabel = escapeHtml(item.platform || item.type || 'Media');
                const dateLabel = escapeHtml(item.date || '');
                const title = escapeHtml(item.title || '');
                const pub = escapeHtml(item.publication || '');
                const summary = escapeHtml(item.summary || '');
                const url = item.url ? escapeHtml(item.url) : null;

                card.innerHTML = `
                    <div class="media-header">
                        <span class="platform-badge">${platformLabel} ${pub ? '• ' + pub : ''}</span>
                        <span class="media-date">${dateLabel}</span>
                    </div>
                    <h3 class="media-title">${title}</h3>
                    <p class="media-summary">${summary}</p>
                    <div class="media-footer">
                        ${url ? `<a href="${url}" class="project-link" target="_blank" rel="noopener noreferrer">View/Listen Canonical Recording &rarr;</a>` : '<span class="badge-pending">Recording Link Pending Verification</span>'}
                    </div>
                `;

                container.appendChild(card);
            });
        }
    } catch (error) {
        // Quietly failover to static HTML embedded in index.html for maximum resilience
        console.info('Using static fallback for speaking engagements.');
    }
}

// Utility function to prevent XSS in dynamic rendering
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
