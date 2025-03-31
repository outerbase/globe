export class Globe {
    constructor(width = 80, height = 40) {
        this.width = width;
        this.height = height;
        this.radius = Math.min(width, height) / 3;
        this.K1 = 40;
        
        // Set initial rotation angles for traditional globe view
        this.angleX = -Math.PI / 2.2; // Slightly less than -90 degrees for better vertical tilt
        this.angleY = Math.PI * 1.15; // ~207 degrees - show Africa/Europe with slight horizontal tilt
        this.angleZ = 0;
        
        this.zoom = 2;
        this.texture = null;
        this.textureWidth = 1;
        this.textureHeight = 0;
        
        // ASCII shading characters from darkest to lightest
        this.shades = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
        
        // Create sphere points with UV coordinates
        this.points = this.createSpherePoints();
        
        // Load the texture
        this.loadTexture();
    }

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

    rotateX(point, angle) {
        const y = point.y * Math.cos(angle) - point.z * Math.sin(angle);
        const z = point.y * Math.sin(angle) + point.z * Math.cos(angle);
        return { ...point, y, z };
    }

    rotateY(point, angle) {
        const x = point.x * Math.cos(angle) - point.z * Math.sin(angle);
        const z = point.x * Math.sin(angle) + point.z * Math.cos(angle);
        return { ...point, x, z };
    }

    rotateZ(point, angle) {
        const x = point.x * Math.cos(angle) - point.y * Math.sin(angle);
        const y = point.x * Math.sin(angle) + point.y * Math.cos(angle);
        return { ...point, x, y };
    }

    project(point) {
        const factor = this.K1 / (this.K1 + point.z * this.zoom);
        const x = point.x * factor * this.radius + this.width / 2;
        const y = point.y * factor * this.radius + this.height / 2;
        return { ...point, screenX: x, screenY: y, factor };
    }

    calculateLighting(point) {
        // Simple lighting calculation based on z-coordinate
        const intensity = (point.z + 1) / 2;
        const shadeIndex = Math.floor(intensity * (this.shades.length - 1));
        return this.shades[shadeIndex];
    }

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
            p = this.rotateZ(p, this.angleZ);

            // Only render points facing the camera
            if (p.z > -1) {
                // Project 3D point to 2D
                const projected = this.project(p);
                
                const x = Math.round(projected.screenX);
                const y = Math.round(projected.screenY);

                // Check if point is within bounds and in front of what's already there
                if (x >= 0 && x < this.width && y >= 0 && y < this.height && p.z > zBuffer[y][x]) {
                    zBuffer[y][x] = p.z;
                    buffer[y][x] = this.getTextureChar(p.u, p.v);
                }
            }
        }

        // Convert buffer to string
        return buffer.map(row => row.join('')).join('\n');
    }

    rotate(dx = 0, dy = 0, dz = 0) {
        this.angleX += dx;
        this.angleY += dy;
        this.angleZ += dz;
    }

    setZoom(zoom) {
        this.zoom = Math.max(0.1, Math.min(5, zoom));
    }
} 