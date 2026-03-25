/**
 * KellynePDF Graphics Helper
 * High-DPI (Retina) Canvas support for Mac, Windows, and Mobile.
 */

const GraphicsHelper = {
    // 1. Canvas ni High Definition (HD) ga set chestundi
    setupCanvas: function(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1; // Device pixel ratio (Mac lo 2 untundi)
        const rect = canvas.getBoundingClientRect();

        // Screen size ki thaggattu pixels ni adjust chestundi
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // CSS size ni constant ga unchuthundi
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Drawing scale ni dpr ki match chestundi (Blur avvakunda)
        ctx.scale(dpr, dpr);
        
        return ctx;
    },

    // 2. Image aspect ratio maintain chesthu resize cheyadaniki
    calculateAspectRatioFit: function(srcWidth, srcHeight, maxWidth, maxHeight) {
        const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth * ratio, height: srcHeight * ratio };
    }
};

// Global ga access cheyadaniki
window.GraphicsHelper = GraphicsHelper;