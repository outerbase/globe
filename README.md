# ASCII Globe Demo

An interactive ASCII art globe. The globe can be rotated by clicking and dragging, and automatically returns to its original position when released.

## Features

- Interactive ASCII art globe
- Click and drag rotation
- Automatic smooth reset animation
- Displays Cloudflare D1 read replica locations
- Responsive design for all screen sizes

## Project Structure

```
.
├── index.html          # Main HTML file
├── global.css          # Global styles
├── js/
│   └── Globe.js        # Globe rendering and interaction logic
├── textures/
│   └── earth.txt       # ASCII art texture for the globe
├── locations.json      # Location data for replica points
└── public/            
    └── img/           # Images and assets
```

## Running Locally

This is a static website with no dependencies. You can run it using any of these methods:

1. **Direct**: Open `index.html` in your web browser
2. **VS Code**: Use the "Live Server" extension
3. **Python**: Run `python -m http.server` in the project directory
4. **Any static file server** of your choice

## Deployment

Deploy to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any static file host

## Credits

This project's globe rendering is inspired by and adapted from:
- [adamsky/globe](https://github.com/adamsky/globe) - Interactive ASCII globe generator
- [DinoZ1729/Earth](https://github.com/DinoZ1729/Earth) - Original 3D rendering mathematics

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
