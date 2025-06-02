// EXTREME JAVASCRIPT: STRICT, EFFICIENT, NO MERCY.
'use strict';

// DOM Elements - CACHE THEM!
const emojiInputElement = document.getElementById('emojiInput');
const emojiPreviewElement = document.getElementById('emojiPreview');
const generateBtnElement = document.getElementById('generateBtn');
const statusElement = document.getElementById('status');
const fileListElement = document.getElementById('fileList');
const renderAreaElement = document.getElementById('renderArea');

// Constants - IMMUTABLE TRUTHS!
const IMAGE_CONFIGS = [
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 96, name: 'favicon-96x96.png' },
    { size: 32, name: 'favicon.ico' }, // ICO (as PNG), THE ONE TRUE FAVICON!
    { name: 'emoji-social-640x360.jpg', width: 640, height: 360, quality: 0.9, type: 'image/jpeg' } // JPG for social
];

function updatePreview() {
    const emoji = emojiInputElement.value;
    // Use textContent for security and performance. NO INNERHTML ABUSE!
    emojiPreviewElement.textContent = emoji;
}

function updateStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.className = 'status' + (isError ? ' error' : '');
}

function addToFileList(filename) {
    const fileEntry = document.createElement('div');
    fileEntry.textContent = `✓ Generated: ${filename}`;
    fileListElement.appendChild(fileEntry);
}

async function downloadImage(canvas, filename, type = 'image/png', quality = 0.95) {
    // Promises, because async is the ONLY way.
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas toBlob failed. Is the canvas tainted or empty?'));
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link); // Clean up your DOM, always.
            
            // Delay revokeObjectURL to ensure download starts, especially in Safari.
            setTimeout(() => {
                URL.revokeObjectURL(url);
                resolve();
            }, 200); // Slightly longer for safety
        }, type, quality);
    });
}

async function generateImages() {
    generateBtnElement.disabled = true;
    updateStatus('Engaging generation matrix...');

    const emoji = emojiInputElement.value.trim();
    if (!emoji) {
        updateStatus('CRITICAL FAILURE: Emoji input is void. Aborting.', true);
        generateBtnElement.disabled = false;
        return;
    }

    // Sanitize emoji - one grapheme cluster, or things get weird.
    // This is a simple check; true grapheme splitting is complex.
    // For an extremist, one character means one visual symbol.
    const graphemes = [...emoji];
    if (graphemes.length > 2 && !(graphemes.length <= 4 && graphemes.some(g => /\uFE0F|\u200D/.test(g)))) { // Allow ZWJ and variation selectors for complex emoji
        // A more robust check would involve a grapheme splitter library, but this is client-side extremist.
        // If it's a single emoji character (possibly with skin tone or ZWJ sequence), it should be fine.
        // If it's multiple separate emojis, it might look bad.
        console.warn("Multiple distinct emoji characters detected. Results may vary.");
    }


    fileListElement.innerHTML = ''; // CLEAR PREVIOUS RESULTS. NO TRACE.

    try {
        for (const config of IMAGE_CONFIGS) {
            const width = config.width || config.size;
            const height = config.height || config.size;
            const imageType = config.type || 'image/png';
            const imageQuality = config.quality || (imageType === 'image/jpeg' ? 0.9 : undefined);


            // Dynamically create the render element. EFFICIENCY.
            const emojiRenderDiv = document.createElement('div');
            emojiRenderDiv.id = 'tempEmojiRender'; // ID for targeting, though direct ref is better
            emojiRenderDiv.style.width = `${width}px`;
            emojiRenderDiv.style.height = `${height}px`;
            emojiRenderDiv.style.background = 'transparent'; // Transparent background for PNGs
            if (imageType === 'image/jpeg') {
                emojiRenderDiv.style.background = 'white'; // JPG needs a background
            }
            emojiRenderDiv.style.display = 'flex';
            emojiRenderDiv.style.alignItems = 'center';
            emojiRenderDiv.style.justifyContent = 'center';
            // Adjust font size dynamically. Make it FIT.
            // This is a heuristic. Perfect centering and sizing of varied emojis is hard.
            const fontSize = Math.min(width, height) * 0.8; // 80% of the smallest dimension
            emojiRenderDiv.style.fontSize = `${fontSize}px`;
            emojiRenderDiv.style.lineHeight = '1'; // Critical for vertical alignment
            emojiRenderDiv.style.fontFamily = '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif'; // Force emoji fonts
            emojiRenderDiv.textContent = emoji;

            renderAreaElement.appendChild(emojiRenderDiv);

            // Ensure rendering before capture. Wait for the machine.
            await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0))); // RAF + timeout for good measure

            const canvas = await html2canvas(emojiRenderDiv, {
                backgroundColor: null, // Use element's background (transparent for PNG)
                scale: window.devicePixelRatio > 1 ? 2 : 1, // Higher res for crisp images, then downscale if needed by canvas element.
                logging: false, // NO CHATTER.
                width: width,
                height: height,
                useCORS: true // If emoji are ever loaded from external, though unlikely here
            });

            renderAreaElement.removeChild(emojiRenderDiv); // CLEAN UP.

            await downloadImage(canvas, config.name, imageType, imageQuality);
            addToFileList(config.name);
            updateStatus(`Generated ${config.name}...`);
        }
        updateStatus('MISSION ACCOMPLISHED: All images generated.');
    } catch (error) {
        console.error('GENERATION CORE MELTDOWN:', error);
        updateStatus(`ERROR: ${error.message}. System compromised. Try again.`, true);
    } finally {
        generateBtnElement.disabled = false; // Re-arm the weapon.
        renderAreaElement.innerHTML = ''; // Ensure render area is absolutely empty.
    }
}

// Event Listeners - THE TRIGGERS
emojiInputElement.addEventListener('input', updatePreview);
generateBtnElement.addEventListener('click', generateImages);

// Initial state - READY FOR ACTION
updatePreview();
console.log("Emoji Annihilator Systems: ONLINE. Waiting for target...");