# Wallpaly - Social Wallpaper Platform

A modern social platform for generating, sharing, and discovering procedural wallpapers. Create stunning abstract wallpapers using mathematical curves and share them with the community.

## Features

### 🎨 Wallpaper Generator
- **Procedural generation** using fuzzy wobbling circles and Catmull-Rom splines
- **Customizable parameters**: lines, anchor points, jitter, colors, and more
- **Multiple resolutions**: From 1080p to 5K ultrawide support
- **Real-time preview** with instant parameter updates
- **Seeded randomness** for reproducible results

### 🌟 Social Features
- **GitHub OAuth authentication** - Sign in with your GitHub account
- **Community voting** - Upvote and downvote wallpapers
- **Collections** - Create and organize wallpaper collections
- **User profiles** - Browse creators and their work
- **Trending algorithms** - Discover popular wallpapers

### 📊 Discovery & Browsing
- **Gallery views**: Recent, Trending, Popular
- **Advanced filtering**: Resolution, tags, search
- **Leaderboards**: Daily, Weekly, Monthly, All-time
- **Comments system** for community discussions

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI** for components and styling
- **Three.js** for mathematical curve generation
- **Canvas API** for pixel-level image manipulation
- **Emotion** for styled components

### Backend
- **Node.js + Express** with TypeScript
- **Prisma ORM** with PostgreSQL
- **Passport.js** for GitHub OAuth
- **Sharp** for image processing
- **JWT** authentication
- **Rate limiting** and security middleware

### Deployment
- **Railway** for hosting and database
- **PostgreSQL** managed database
- **File storage** via Railway volumes
- **Automatic deployments** from Git

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- GitHub OAuth app credentials

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL, JWT secret, and GitHub OAuth credentials

# Set up database
npm run db:migrate
npm run db:generate

# Start development server
npm run dev
```

### Environment Variables

Create `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/wallpaly"
JWT_SECRET="your-super-secret-jwt-key"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
```

Create `.env.local` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Railway Deployment

### Backend Deployment
1. Create new Railway project
2. Add PostgreSQL database service
3. Connect your GitHub repository
4. Set environment variables in Railway dashboard
5. Deploy automatically triggers on git push

### Environment Variables for Railway
- `DATABASE_URL` (automatically set by Railway PostgreSQL)
- `JWT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `CORS_ORIGIN` (your frontend domain)

### GitHub OAuth Setup
1. Create GitHub OAuth app at https://github.com/settings/developers
2. Set Authorization callback URL to: `https://your-api-domain.railway.app/api/auth/github/callback`
3. Add Client ID and Secret to environment variables

## API Endpoints

### Authentication
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Wallpapers
- `GET /api/wallpapers` - Browse wallpapers
- `POST /api/wallpapers` - Upload wallpaper
- `GET /api/wallpapers/:id` - Get specific wallpaper
- `DELETE /api/wallpapers/:id` - Delete wallpaper
- `POST /api/wallpapers/:id/vote` - Vote on wallpaper

### Users
- `GET /api/users/:username` - User profile
- `GET /api/users/:username/collections` - User collections

### Collections
- `POST /api/collections` - Create collection
- `GET /api/collections/:id` - Get collection
- `POST /api/collections/:id/items` - Add to collection
- `DELETE /api/collections/:id/items/:wallpaperId` - Remove from collection

## Usage

1. **Generate**: Use the built-in generator to create unique wallpapers
2. **Customize**: Adjust parameters like colors, complexity, and resolution
3. **Share**: Sign in with GitHub to upload and share your creations
4. **Discover**: Browse the gallery to find wallpapers from other creators
5. **Vote**: Help curate the best content by voting on wallpapers
6. **Collect**: Organize your favorites into themed collections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details