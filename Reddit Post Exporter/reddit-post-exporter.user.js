// ==UserScript==
// @name         Reddit Post Exporter
// @namespace    https://github.com/0V3RR1DE0/Userscripts/tree/main/Reddit%20Post%20Exporter/
// @version      1.0
// @description  Export Reddit posts in various formats with a clean dropdown menu
// @author       0V3RR1DE0
// @license      MIT
// @match        https://www.reddit.com/r/*/comments/*
// @match        https://old.reddit.com/r/*/comments/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/turndown@7.1.1/dist/turndown.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Utility: wait for selector with improved timeout handling
    function waitFor(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            // Check immediately first
            const el = document.querySelector(selector);
            if (el) {
                resolve(el);
                return;
            }

            // Set up observer for dynamic content
            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Set timeout as fallback
            setTimeout(() => {
                observer.disconnect();
                const el = document.querySelector(selector);
                if (el) {
                    resolve(el);
                } else {
                    reject(new Error('Timeout waiting for ' + selector));
                }
            }, timeout);
        });
    }

    // Extract title and body with improved selector support
    function getPostElements() {
        // Try multiple selectors for different Reddit versions and layouts
        const titleSelectors = [
            'h1',
            '.Post h1',
            '[data-test-id="post-title"]',
            '.title'
        ];

        const bodySelectors = [
            '[data-test-id="post-content"]',
            '.Post .RichTextJSON-root',
            '.md',
            '.usertext-body',
            '.expando',
            '.text-neutral-content' // Added for new Reddit layout
        ];

        // Find first matching element
        const titleEl = titleSelectors.map(sel => document.querySelector(sel)).find(el => el);
        const bodyEl = bodySelectors.map(sel => document.querySelector(sel)).find(el => el);

        const title = titleEl ? titleEl.innerText.trim() : 'Reddit Post';
        const bodyHTML = bodyEl ? bodyEl.innerHTML.trim() : '';
        const bodyText = bodyEl ? bodyEl.innerText.trim() : '';

        return { title, bodyHTML, bodyText };
    }

    // Enhanced dark mode detection
    function detectTheme() {
        // Specific Reddit class checks
        const redditDarkClasses = [
            'theme-dark',
            'dark-mode',
            'nightmode',
            'res-nightmode'
        ];

        // Check for Reddit-specific dark mode indicators
        const hasDarkClass = redditDarkClasses.some(className =>
            document.documentElement.classList.contains(className) ||
            document.body.classList.contains(className)
        );

        // Check for dark mode in computed styles
        const bodyBgColor = getComputedStyle(document.body).backgroundColor;
        const isDarkBackground = isColorDark(bodyBgColor);

        // Check for system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        return {
            isDark: hasDarkClass || isDarkBackground || prefersDark
        };
    }

    // Helper function to determine if a color is dark
    function isColorDark(color) {
        // Extract RGB values
        const rgb = color.match(/\d+/g);
        if (!rgb || rgb.length < 3) return false;

        // Calculate relative luminance
        const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

        // Return true if color is dark (luminance < 0.5)
        return luminance < 0.5;
    }

    // Create export dropdown with improved UI
    function createExportDropdown() {
        const { isDark } = detectTheme();

        const dropdown = document.createElement('div');
        dropdown.id = 'post-exporter-dropdown';
        dropdown.innerHTML = `
            <button id="export-button" class="export-main-button">
                <span>Export</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div id="export-options" class="export-options">
                <div class="export-section">
                    <div class="export-section-title">Copy</div>
                    <button id="copy-md" class="export-option">
                        <svg class="export-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                        </svg>
                        Markdown
                    </button>
                    <button id="copy-txt" class="export-option">
                        <svg class="export-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                        </svg>
                        Plaintext
                    </button>
                    <button id="copy-html" class="export-option">
                        <svg class="export-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                        </svg>
                        HTML
                    </button>
                </div>
                <div class="export-section">
                    <div class="export-section-title">Download</div>
                    <button id="download-md" class="export-option">
                        <svg class="export-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                        Markdown (.md)
                    </button>
                    <button id="download-txt" class="export-option">
                        <svg class="export-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                        Plaintext (.txt)
                    </button>
                    <button id="download-html" class="export-option">
                        <svg class="export-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                        HTML (.html)
                    </button>
                    <button id="download-pdf" class="export-option">
                        <svg class="export-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                        PDF (.pdf)
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(dropdown);

        // Add styles with improved theme handling
        GM_addStyle(`
            #post-exporter-dropdown {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            }

            .export-main-button {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                border-radius: 20px;
                border: 1px solid ${isDark ? '#343536' : '#edeff1'};
                background-color: ${isDark ? '#1a1a1b' : '#ffffff'};
                color: ${isDark ? '#d7dadc' : '#1c1c1c'};
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 100px;
                box-shadow: 0 2px 8px rgba(0,0,0,${isDark ? '0.4' : '0.1'});
            }

            .export-main-button:hover {
                background-color: ${isDark ? '#2d2d2e' : '#f6f7f8'};
            }

            .export-options {
                display: none;
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 5px;
                background-color: ${isDark ? '#1a1a1b' : '#ffffff'};
                border: 1px solid ${isDark ? '#343536' : '#edeff1'};
                border-radius: 4px;
                box-shadow: 0 2px 12px rgba(0,0,0,${isDark ? '0.4' : '0.15'});
                width: 220px;
                overflow: hidden;
                animation: fadeIn 0.2s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .export-section {
                padding: 8px 0;
                border-bottom: 1px solid ${isDark ? '#343536' : '#edeff1'};
            }

            .export-section:last-child {
                border-bottom: none;
            }

            .export-section-title {
                padding: 4px 16px;
                font-size: 12px;
                font-weight: 500;
                color: ${isDark ? '#818384' : '#878a8c'};
                text-transform: uppercase;
            }

            .export-option {
                display: flex;
                align-items: center;
                width: 100%;
                text-align: left;
                padding: 10px 16px;
                background: none;
                border: none;
                font-size: 14px;
                color: ${isDark ? '#d7dadc' : '#1c1c1c'};
                cursor: pointer;
                transition: background-color 0.1s ease;
            }

            .export-option:hover {
                background-color: ${isDark ? '#272729' : '#f6f7f8'};
            }

            .export-icon {
                margin-right: 8px;
                opacity: 0.7;
            }

            .show-options {
                display: block;
            }

            .export-progress-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }

            .export-progress {
                background-color: ${isDark ? '#1a1a1b' : '#ffffff'};
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                text-align: center;
                color: ${isDark ? '#d7dadc' : '#1c1c1c'};
            }

            .export-spinner {
                border: 3px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                border-top: 3px solid ${isDark ? '#818384' : '#878a8c'};
                width: 24px;
                height: 24px;
                margin: 10px auto;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `);

        return dropdown;
    }

    // Download file helper with error handling
    function downloadFile(content, filename, type) {
        try {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error downloading file:', error);
            showNotification('Error downloading file: ' + error.message, 'error');
            return false;
        }
    }

    // Show notification with type (success, error, info)
    function showNotification(message, type = 'success') {
        // Remove any existing notification
        const existingNotif = document.querySelector('.export-notification');
        if (existingNotif) {
            document.body.removeChild(existingNotif);
        }

        const { isDark } = detectTheme();
        const notification = document.createElement('div');
        notification.className = `export-notification ${type}`;

        // Icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                break;
            case 'error':
                icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
                break;
            case 'info':
                icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
                break;
        }

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
        `;

        document.body.appendChild(notification);

        GM_addStyle(`
            .export-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: ${isDark ? '#1a1a1b' : '#ffffff'};
                color: ${isDark ? '#d7dadc' : '#1c1c1c'};
                border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
                border-radius: 4px;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,${isDark ? '0.4' : '0.1'});
                z-index: 10000;
                animation: fadeInOut 3s forwards;
                max-width: 300px;
            }

            .notification-icon {
                margin-right: 12px;
                color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
                display: flex;
                align-items: center;
            }

            .notification-message {
                flex: 1;
            }

            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(10px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }
        `);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    // Show loading spinner
    function showLoadingSpinner(message = 'Processing...') {
        const overlay = document.createElement('div');
        overlay.className = 'export-progress-overlay';
        overlay.innerHTML = `
            <div class="export-progress">
                <div class="export-spinner"></div>
                <div>${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    // Hide loading spinner
    function hideLoadingSpinner(overlay) {
        if (overlay && document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }

    // Process links in markdown
    function processMarkdownLinks(markdown) {
        // Replace markdown links with full URLs
        return markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            // If URL is relative, make it absolute
            if (url.startsWith('/')) {
                url = window.location.origin + url;
            }
            return `[${text}](${url})`;
        });
    }

    // Main initialization
    async function init() {
        try {
            const dropdown = createExportDropdown();
            const { title, bodyHTML, bodyText } = getPostElements();

            // Configure Turndown service with better options
            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
                emDelimiter: '_',
                bulletListMarker: '-',
                linkStyle: 'inlined'
            });

            // Improve code block handling
            turndownService.addRule('codeBlocks', {
                filter: ['pre'],
                replacement: function(content, node) {
                    const language = node.querySelector('code') ?
                        (node.querySelector('code').className.match(/language-(\w+)/) || [])[1] || '' : '';
                    return '\n\n```' + language + '\n' + node.textContent + '\n```\n\n';
                }
            });

            // Improve image handling
            turndownService.addRule('images', {
                filter: 'img',
                replacement: function(content, node) {
                    const alt = node.alt || '';
                    let src = node.getAttribute('src') || '';

                    // Make sure src is absolute
                    if (src.startsWith('/')) {
                        src = window.location.origin + src;
                    }

                    return `![${alt}](${src})`;
                }
            });

            let markdown = `# ${title}\n\n${turndownService.turndown(bodyHTML)}`;

            // Process links to make them absolute
            markdown = processMarkdownLinks(markdown);

            // Create HTML with better styling and meta tags
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Reddit Post Export</title>
    <meta name="description" content="Exported Reddit post: ${title}">
    <style>
        :root {
            --text-color: #1a1a1b;
            --bg-color: #ffffff;
            --link-color: #0079d3;
            --code-bg: #f6f8fa;
            --border-color: #edeff1;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --text-color: #d7dadc;
                --bg-color: #1a1a1b;
                --link-color: #4fbcff;
                --code-bg: #272729;
                --border-color: #343536;
            }
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: var(--text-color);
            background-color: var(--bg-color);
        }

        h1 {
            margin-top: 0;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border-color);
        }

        a {
            color: var(--link-color);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
        }

        pre {
            background-color: var(--code-bg);
            padding: 16px;
            overflow: auto;
            border-radius: 6px;
            margin: 16px 0;
        }

        code {
            font-family: Menlo, Monaco, 'Courier New', monospace;
            font-size: 0.9em;
            background-color: var(--code-bg);
            padding: 2px 4px;
            border-radius: 3px;
        }

        pre code {
            padding: 0;
            background-color: transparent;
        }

        blockquote {
            margin: 16px 0;
            padding-left: 16px;
            border-left: 4px solid var(--border-color);
            color: #808080;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }

        th, td {
            border: 1px solid var(--border-color);
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: var(--code-bg);
        }

        .meta {
            margin-top: 40px;
            font-size: 0.8em;
            color: #808080;
            border-top: 1px solid var(--border-color);
            padding-top: 16px;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>

    <div class="post-content">
        ${bodyHTML}
    </div>

    <div class="meta">
        <p>Exported from Reddit on ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`;

            const text = `${title}\n\n${bodyText}\n\n---\nExported from Reddit on ${new Date().toLocaleDateString()}`;
            const sanitizedTitle = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 50);

            // Toggle dropdown with improved click handling
            const exportButton = dropdown.querySelector('#export-button');
            const exportOptions = dropdown.querySelector('#export-options');

            exportButton.addEventListener('click', (e) => {
                e.stopPropagation();
                exportOptions.classList.toggle('show-options');

                // Add active state styling
                if (exportOptions.classList.contains('show-options')) {
                    exportButton.style.backgroundColor = detectTheme().isDark ? '#2d2d2e' : '#f6f7f8';
                } else {
                    exportButton.style.backgroundColor = '';
                }
            });

            // Close dropdown when clicking outside with improved event handling
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target)) {
                    exportOptions.classList.remove('show-options');
                    exportButton.style.backgroundColor = '';
                }
            });

            // Copy options with success feedback
            dropdown.querySelector('#copy-md').addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(markdown);
                    showNotification('Markdown copied to clipboard');
                } catch (error) {
                    console.error('Copy failed:', error);
                    showNotification('Failed to copy: ' + error.message, 'error');
                }
                exportOptions.classList.remove('show-options');
                exportButton.style.backgroundColor = '';
            });

            dropdown.querySelector('#copy-txt').addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(text);
                    showNotification('Plaintext copied to clipboard');
                } catch (error) {
                    showNotification('Failed to copy: ' + error.message, 'error');
                }
                exportOptions.classList.remove('show-options');
                exportButton.style.backgroundColor = '';
            });

            dropdown.querySelector('#copy-html').addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(html);
                    showNotification('HTML copied to clipboard');
                } catch (error) {
                    showNotification('Failed to copy: ' + error.message, 'error');
                }
                exportOptions.classList.remove('show-options');
                exportButton.style.backgroundColor = '';
            });

            // Download options with improved error handling
            dropdown.querySelector('#download-md').addEventListener('click', () => {
                if (downloadFile(markdown, `${sanitizedTitle}.md`, 'text/markdown')) {
                    showNotification('Markdown file downloaded');
                }
                exportOptions.classList.remove('show-options');
                exportButton.style.backgroundColor = '';
            });

            dropdown.querySelector('#download-txt').addEventListener('click', () => {
                if (downloadFile(text, `${sanitizedTitle}.txt`, 'text/plain')) {
                    showNotification('Text file downloaded');
                }
                exportOptions.classList.remove('show-options');
                exportButton.style.backgroundColor = '';
            });

            dropdown.querySelector('#download-html').addEventListener('click', () => {
                if (downloadFile(html, `${sanitizedTitle}.html`, 'text/html')) {
                    showNotification('HTML file downloaded');
                }
                exportOptions.classList.remove('show-options');
                exportButton.style.backgroundColor = '';
            });

            dropdown.querySelector('#download-pdf').addEventListener('click', async () => {
                const loading = showLoadingSpinner('Generating PDF...');

                try {
                    // Make sure jsPDF is loaded
                    if (typeof window.jspdf === 'undefined') {
                        throw new Error('jsPDF library not loaded');
                    }

                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });

                    // Add title with styling
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(16);
                    doc.text(title, 20, 20);

                    // Add horizontal line
                    doc.setLineWidth(0.5);
                    doc.line(20, 24, 190, 24);

                    // Add content with better formatting
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(11);

                    // Format text better for PDF
                    const formattedText = bodyText
                        .replace(/\n\s*\n/g, '\n\n') // Normalize paragraph breaks
                        .replace(/\t/g, '    ');      // Replace tabs with spaces

                    // Split text to pages with margins
                    const textLines = doc.splitTextToSize(formattedText, 170);

                    // Calculate how many lines can fit on a page
                    const pageHeight = doc.internal.pageSize.height;
                    const lineHeight = 7; // Approximate line height in mm
                    const linesPerPage = Math.floor((pageHeight - 40) / lineHeight); // 40mm for margins and header

                    // Add text with pagination
                    let currentPage = 1;
                    let startLine = 0;

                    while (startLine < textLines.length) {
                        if (currentPage > 1) {
                            doc.addPage();
                            // Add page header
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(12);
                            doc.text(title + ' (continued)', 20, 20);
                            doc.setLineWidth(0.3);
                            doc.line(20, 24, 190, 24);
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(11);
                        }

                        // Calculate end line for current page
                        const endLine = Math.min(startLine + linesPerPage, textLines.length);
                        const pageLines = textLines.slice(startLine, endLine);

                        // Add text to current page
                        doc.text(pageLines, 20, currentPage === 1 ? 30 : 30);

                        // Move to next page
                        startLine = endLine;
                        currentPage++;
                    }

                    // Add footer to all pages
                    const pageCount = doc.internal.getNumberOfPages();
                    for (let i = 1; i <= pageCount; i++) {
                        doc.setPage(i);
                        doc.setFontSize(8);
                        doc.setTextColor(150);
                        doc.text(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, 20, 287);
                    }

                    // Save PDF
                    doc.save(`${sanitizedTitle}.pdf`);
                    showNotification('PDF file downloaded');
                } catch (error) {
                    console.error('PDF generation error:', error);
                    showNotification('Failed to generate PDF: ' + error.message, 'error');
                } finally {
                    hideLoadingSpinner(loading);
                }

                exportOptions.classList.remove('show-options');
                exportButton.style.backgroundColor = '';
            });
        } catch (error) {
            console.error('Initialization error:', error);
            showNotification('Failed to initialize exporter: ' + error.message, 'error');
        }
    }

    // Check for Reddit redesign or old Reddit
    const isRedesign = window.location.href.includes('www.reddit.com');

    // Different initialization based on Reddit version
    if (isRedesign) {
        // Modern Reddit loads content dynamically
        waitFor('h1, .Post h1, [data-test-id="post-title"], shreddit-post h1')
            .then(() => {
                // Wait a bit more for post content to fully load
                setTimeout(init, 500);
            })
            .catch(error => {
                console.error('Failed to find post:', error);
                // Try to initialize anyway
                init();
            });
    } else {
        // Old Reddit loads more directly
        window.addEventListener('DOMContentLoaded', init);

        // Fallback if DOMContentLoaded already fired
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            init();
        }
    }
})();
