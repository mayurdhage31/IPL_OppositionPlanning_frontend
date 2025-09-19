# IPL Opposition Planning Tool - Deployment Guide

## Project Structure
- **Frontend**: React.js application (Create React App)
- **Backend**: FastAPI Python application with Docker support
- **Repositories**: 
  - Frontend: https://github.com/mayurdhage31/IPL_OppositionPlanning_frontend.git
  - Backend: https://github.com/mayurdhage31/IPL_OppositionPlanning_backend.git

## Frontend Deployment (Netlify/Vercel)

### Option 1: Netlify Deployment
1. **Login to Netlify**: Visit https://app.netlify.com and sign in
2. **Connect GitHub**: Link your GitHub account
3. **Import Project**: 
   - Click "New site from Git"
   - Select GitHub and authorize
   - Choose the `IPL_OppositionPlanning_frontend` repository
4. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: 18
5. **Deploy**: Click "Deploy site"

### Option 2: Vercel Deployment
1. **Login to Vercel**: Visit https://vercel.com and sign in
2. **Import Project**:
   - Click "New Project"
   - Import from GitHub: `IPL_OppositionPlanning_frontend`
3. **Framework**: Vercel will auto-detect Create React App
4. **Deploy**: Click "Deploy"

### Option 3: Manual Netlify CLI Deployment
```bash
cd frontend
npm run build
netlify login  # Follow browser authentication
netlify deploy --prod --dir=build
```

## Backend Deployment Options

### Option 1: Railway
1. Visit https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `IPL_OppositionPlanning_backend` repository
4. Railway will auto-detect the Dockerfile and deploy

### Option 2: Render
1. Visit https://render.com and sign in with GitHub
2. Click "New" → "Web Service"
3. Connect the `IPL_OppositionPlanning_backend` repository
4. Use Docker runtime environment
5. Set port to 8000

### Option 3: Docker + Cloud Provider
```bash
cd backend
docker build -t ipl-backend .
docker run -p 8000:8000 ipl-backend
```

## Environment Configuration

### Frontend Environment Variables
Create `.env` file in frontend directory:
```
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend Environment Variables
The backend is configured to run on port 8000 and serves data from the `/data` directory.

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

### Docker (Backend)
```bash
cd backend
docker-compose up
# Server runs on http://localhost:8000
```

## API Endpoints
- `GET /` - Health check
- `GET /teams` - Get all teams
- `GET /teams/{team_name}/players` - Get team players
- `GET /venues` - Get all venues
- `GET /player/{player_name}/insights` - Get player insights
- `GET /team/{team_name}/insights` - Get team insights
- `GET /venue/{venue_name}/insights` - Get venue insights
- `GET /scatter-plot-data` - Get player scatter plot data
- `GET /team-scatter-plot-data` - Get team scatter plot data

## Notes
- The frontend is built and ready for deployment
- The backend includes Docker configuration for easy deployment
- CORS is configured to allow all origins for deployment
- All code is pushed to the respective GitHub repositories
- The application provides comprehensive IPL team analysis and planning tools

## Troubleshooting
- Ensure Node.js version 18+ for frontend
- Ensure Python 3.11+ for backend
- Check that all CSV data files are included in the backend deployment
- Verify API URL configuration in frontend environment variables
