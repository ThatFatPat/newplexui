# NewPlexUI

A modern, mobile-compatible React application that serves as an alternative frontend for Plex Media Server with Sonarr and Radarr integration. Built with TypeScript, React, and Tailwind CSS.

## Features

- 🎬 **Plex Integration**: Browse and play your media collection
- 📺 **Sonarr Integration**: Manage TV shows and automatic downloads
- 🎥 **Radarr Integration**: Manage movies and automatic downloads
- 🔍 **Advanced Search**: Search across all your media libraries
- 📱 **Mobile-First Design**: Responsive design that works on all devices
- ✨ **Modern UI**: Beautiful animations and smooth transitions
- ⚡ **Fast Performance**: Built with Vite for optimal performance

## Screenshots

*Screenshots will be added here*

## Getting Started

### Prerequisites

- Node.js 16+ (recommended: Node.js 20+)
- npm or yarn
- Plex Media Server
- Sonarr (optional)
- Radarr (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd newplexui/app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Configuration

On first launch, you'll be guided through the setup process:

1. **Plex Configuration**:
   - Host: Your Plex server hostname or IP
   - Port: Default is 32400
   - Access Token: Find this in Plex Web App → Settings → Account

2. **Sonarr Configuration** (optional):
   - Host: Your Sonarr server hostname or IP
   - Port: Default is 8989
   - API Key: Find this in Sonarr → Settings → General

3. **Radarr Configuration** (optional):
   - Host: Your Radarr server hostname or IP
   - Port: Default is 7878
   - API Key: Find this in Radarr → Settings → General

## Usage

### Home Page
- View recently added content
- Continue watching from where you left off
- Quick access to different media types

### Search
- Search across all your media libraries
- Filter by type (movies, TV shows) and source (Plex, Sonarr, Radarr)
- Real-time search results

### Libraries
- Browse movies, TV shows, music, and photos
- Grid layout with hover effects
- Quick play and add to list options

### Media Details
- View detailed information about media items
- Cast, crew, ratings, and metadata
- Direct play and add to list functionality

### Settings
- Configure your media services
- Test connections
- Reset to defaults

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Lucide React** - Icons
- **Axios** - HTTP client
- **@lukehagar/plexjs** - Plex API client

## API Integration

### Plex
Uses the official Plex API through the `@lukehagar/plexjs` library for:
- Media browsing and search
- Playback control
- Metadata retrieval
- User management

### Sonarr
REST API integration for:
- TV show management
- Episode tracking
- Download monitoring
- Quality profiles

### Radarr
REST API integration for:
- Movie management
- Download monitoring
- Quality profiles
- Collection management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Plex](https://www.plex.tv/) for the media server platform
- [Sonarr](https://sonarr.tv/) for TV show management
- [Radarr](https://radarr.video/) for movie management
- [LukeHagar/plexjs](https://github.com/LukeHagar/plexjs) for the Plex API client

## Support

If you encounter any issues or have questions, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your configuration (without sensitive data)
4. Provide error logs if applicable

## Roadmap

- [ ] Video player integration
- [ ] User authentication
- [ ] Watchlist functionality
- [ ] Recommendations
- [ ] Mobile app (React Native)
- [ ] Docker support
- [ ] Theme customization
- [ ] Multi-language support
