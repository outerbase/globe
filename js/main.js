import { Globe } from './Globe.js';

class GlobeApp {
    constructor() {
        this.container = document.getElementById('globe-container');
        // Create a larger globe to match the texture resolution
        this.globe = new Globe(160, 76);
        this.isAnimating = true;
        this.rotationSpeed = 0.003;
        
        this.init();
    }

    async init() {
        // Wait for texture to load
        await new Promise(resolve => setTimeout(resolve, 100));
        this.startAnimation();
    }

    startAnimation() {
        const animate = () => {
            if (this.isAnimating) {
                // Auto-rotate the globe
                this.globe.rotate(0, this.rotationSpeed, 0);
                
                // Render the globe
                const asciiOutput = this.globe.render();
                this.container.textContent = asciiOutput;
                
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GlobeApp();
}); 