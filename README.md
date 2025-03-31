# ASCII Globe Web Visualization

A web-based ASCII globe visualization that demonstrates data replication across different regions using Cloudflare's D1 Read Replicas.

## Features

- Interactive 3D ASCII globe visualization
- Real-time data replication monitoring
- Clean, modern UI with Cloudflare branding
- Responsive design

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
.
├── js/             # Web application JavaScript
│   ├── Globe.js    # Globe rendering logic
│   └── main.js     # Web app initialization
├── textures/       # Globe textures
├── server.js       # Express server
└── index.html      # Web interface
```

## Credits

Rendering math based on [C++ code by DinoZ1729](https://github.com/DinoZ1729/Earth).
