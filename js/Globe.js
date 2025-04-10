export class Globe {
    // Initialize the globe with default dimentions (typo intentional)
    constructor(container, width = 80, height = 40) {
        this.container = container;
        this.width = width;
        this.height = height;
        this.radius = Math.min(width, height) / 3;
        this.K1 = 40; // Magic number for perspective projection, tweaked for best visual effect
        
        // Set initial rotation angles for traditional globe view
        // We tilt it slightly up and rotate to show the Americas first
        this.angleX = -Math.PI / 2.2; // Slightly less than -90 degrees for better vertical tilt
        this.angleY = Math.PI * 1.15; // ~207 degrees - show Africa/Europe with slight horizontal tilt
        
        this.zoom = 2; // Default zoom level, can be adjusted for different sizes
        this.texture = null; // Will hold the ASCII texture once loaded
        this.textureWidth = 1;
        this.textureHeight = 0;
        this.animationFrame = null; // For smooth animations
        this.isAnimating = true; // Start with animation enabled
        this.targetRotation = null; // For smooth rotation to target angles
        
        // ASCII shading characters from darkest to lightest
        // These are used to create the 3D effect with different shades
        this.shades = ['░', '▒', '▓', '█', '█', '█', '█', '█', '█', '█'];
        
        // Create sphere points with UV coordinates
        // This is where we generate the 3D points that make up our globe
        this.points = this.createSpherePoints();
        
        // Load the texture
        // This is the ASCII art that will be mapped onto our sphere
        this.loadTexture();
        
        // Store initial angles for resetting
        this.initialAngleX = this.angleX;
        this.initialAngleY = this.angleY;

        // Add mouse interaction properties
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Bind the event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        // Add event listeners
        if (this.container) {
            this.container.addEventListener('mousedown', this.handleMouseDown);
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        }
        
        // Start animation
        // Let's get this globe spinning!
        this.startAnimation();
    }

    // Handle mouse down event
    handleMouseDown(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        
        // Stop auto-rotation while dragging
        this.isAutoRotating = false;
    }

    // Handle mouse move event
    handleMouseMove(event) {
        if (!this.isDragging) return;

        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        // Convert pixel movement to rotation angles
        // Adjust these multipliers to control rotation speed
        this.angleY += deltaX * 0.01;
        this.angleX += deltaY * 0.01;

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    // Handle mouse up event
    handleMouseUp() {
        this.isDragging = false;
        
        // Smoothly animate back to initial position
        this.setTargetRotation(this.initialAngleX, this.initialAngleY);
    }

    // Clean up event listeners when needed
    destroy() {
        if (this.container) {
            this.container.removeEventListener('mousedown', this.handleMouseDown);
            document.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('mouseup', this.handleMouseUp);
        }
        this.stopAnimation();
    }

    // Start the animation loop
    // This is where the magic happens - we update the globe's position and render it
    startAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.isAnimating = true;
        this.targetRotation = null;
        
        const animate = () => {
            if (this.isAnimating) {
                if (this.targetRotation && !this.isDragging) {
                    // Smoothly rotate to target
                    const dx = (this.targetRotation.x - this.angleX) * 0.1;
                    const dy = (this.targetRotation.y - this.angleY) * 0.1;
                    
                    this.angleX += dx;
                    this.angleY += dy;
                    
                    // Check if we've reached the target
                    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
                        this.targetRotation = null;
                    }
                } else if (!this.isDragging) {
                    // Only auto-rotate when not dragging
                    this.rotate(0, 0.009);
                }
                
                // Render the globe
                const asciiOutput = this.render();
                if (this.container) {
                    this.container.innerHTML = `<pre>${asciiOutput}</pre>`;
                }
                
                this.animationFrame = requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Stop the animation loop
    // Useful when we don't need the globe to move anymore
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    // Set a target rotation for smooth movement
    // This is used when we want to rotate to a specific view
    setTargetRotation(x, y) {
        this.targetRotation = { x, y };
        this.isAnimating = true;
        if (!this.animationFrame) {
            this.startAnimation();
        }
    }

    // Load the ASCII texture from a file
    // The texture is a simple text file with ASCII characters
    async loadTexture() {
        try {
            const response = await fetch('/textures/earth.txt');
            const text = await response.text();
            const lines = text.split('\n');
            this.textureHeight = lines.length;
            this.textureWidth = lines[0].length;
            this.texture = lines;
        } catch (error) {
            console.error('Failed to load texture:', error);
        }
    }

    // Create points on a sphere using spherical coordinates
    // This is where we generate the 3D points that make up our globe
    // We use phi and theta for spherical coordinates (typo in comment)
    createSpherePoints() {
        const points = [];
        // Generate points on a sphere using spherical coordinates
        // More points for better resolution
        for (let phi = 0; phi < Math.PI * 2; phi += Math.PI / 60) {
            for (let theta = 0; theta < Math.PI; theta += Math.PI / 60) {
                const x = Math.sin(theta) * Math.cos(phi);
                const y = Math.sin(theta) * Math.sin(phi);
                const z = Math.cos(theta);
                
                // Calculate UV coordinates for texture mapping
                // Flip v coordinate to match original implementation
                const u = phi / (Math.PI * 2);
                const v = 1 - (theta / Math.PI); // Flipped v coordinate
                
                points.push({ x, y, z, u, v });
            }
        }
        return points;
    }

    // Rotate a point around the X axis
    // Basic 3D rotation math here
    rotateX(point, angle) {
        const y = point.y * Math.cos(angle) - point.z * Math.sin(angle);
        const z = point.y * Math.sin(angle) + point.z * Math.cos(angle);
        return { ...point, y, z };
    }

    // Rotate a point around the Y axis
    // More 3D rotation math, but for Y axis this time
    rotateY(point, angle) {
        const x = point.x * Math.cos(angle) - point.z * Math.sin(angle);
        const z = point.x * Math.sin(angle) + point.z * Math.cos(angle);
        return { ...point, x, z };
    }

    // Project a 3D point to 2D screen coordinates
    // This is where we convert our 3D points to 2D for display
    project(point) {
        const factor = this.K1 / (this.K1 + point.z * this.zoom);
        const x = point.x * factor * this.radius + this.width / 2;
        const y = point.y * factor * this.radius + this.height / 2;
        return { ...point, screenX: x, screenY: y, factor };
    }

    // Calculate lighting for a point
    // Simple lighting based on z-coordinate (how "facing" the point is)
    calculateLighting(point) {
        // Simple lighting calculation based on z-coordinate
        const intensity = (point.z + 1) / 2;
        const shadeIndex = Math.floor(intensity * (this.shades.length - 1));
        return this.shades[shadeIndex];
    }

    // Get the texture character for a UV coordinate
    // This maps our 3D points to the ASCII texture
    getTextureChar(u, v) {
        if (!this.texture) return ' ';
        
        // Convert UV coordinates to texture coordinates
        const tx = Math.floor(u * (this.textureWidth - 1));
        const ty = Math.floor(v * (this.textureHeight - 1));
        
        // Ensure we're within bounds
        if (ty >= 0 && ty < this.textureHeight && tx >= 0 && tx < this.textureWidth) {
            return this.texture[ty][tx] || ' ';
        }
        return ' ';
    }

    // Render the entire globe
    // This is the main rendering function that puts it all together
    render() {
        if (!this.texture) return '';
        
        // Create a 2D array to store the ASCII characters
        const buffer = Array(this.height).fill().map(() => Array(this.width).fill(' '));
        const zBuffer = Array(this.height).fill().map(() => Array(this.width).fill(-Infinity));

        // Process each point
        for (const point of this.points) {
            // Apply rotations
            let p = this.rotateX(point, this.angleX);
            p = this.rotateY(p, this.angleY);

            // Only render points that are facing the camera
            if (p.z > -0.15) {  // Show slightly more than hemisphere but not too much
                // Project 3D point to 2D
                const projected = this.project(p);
                
                const x = Math.round(projected.screenX);
                const y = Math.round(projected.screenY);

                // Check if point is within bounds and in front of what's already there
                if (x >= 0 && x < this.width && y >= 0 && y < this.height && p.z > zBuffer[y][x]) {
                    zBuffer[y][x] = p.z;
                    // Just use the texture character - keep it simple
                    buffer[y][x] = this.getTextureChar(p.u, p.v);
                }
            }
        }

        // Convert buffer to string
        return buffer.map(row => row.join('')).join('\n');
    }

    // Rotate the globe by given angles
    // This is used for both manual rotation and auto-rotation
    rotate(dx = 0, dy = 0) {
        this.angleX += dx;
        this.angleY += dy;
    }

    setZoom(zoom) {
        this.zoom = Math.max(0.1, Math.min(5, zoom));
    }
} 