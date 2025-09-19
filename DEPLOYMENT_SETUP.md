# IPL Opposition Planning Tool - Deployment Setup Guide

This guide explains how to configure the application to work with both localhost and Railway deployment.

## 🚀 Quick Setup Summary

The application now supports **dual environment configuration**:
- **Local Development**: Backend on `localhost:8000`, Frontend on `localhost:3000`
- **Railway Production**: Backend on `https://iploppositionplanningbackend-game-planner.up.railway.app`

## 📁 Updated Project Structure

```
IPL_Opposition_planning_tool/
├── backend/
│   ├── config.py                 # ✨ NEW: Environment configuration
│   ├── .env.example             # ✨ NEW: Environment template
│   ├── main.py                  # ✅ UPDATED: Uses config.py
│   ├── requirements.txt         # ✅ UPDATED: Added python-dotenv
│   └── data/
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js          # ✨ NEW: API configuration
│   │   ├── App.js              # ✅ UPDATED: Uses API config
│   │   └── components/
│   │       ├── PlayerSlide.js  # ✅ UPDATED: Uses API config
│   │       ├── TeamSlide.js    # ✅ UPDATED: Uses API config
│   │       └── VenueSlide.js   # ✅ UPDATED: Uses API config
│   └── .env.example            # ✨ NEW: Frontend environment template
├── start_local.py              # ✨ NEW: Automated startup script
├── DEPLOYMENT_SETUP.md         # ✨ NEW: This guide
└── README.md                   # ✅ UPDATED: New setup instructions
```

## 🔧 Configuration Details

### Backend Configuration (`backend/config.py`)

The backend now automatically detects the environment and configures itself accordingly:

```python
class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    RAILWAY_HOST: str = "iploppositionplanningbackend-game-planner.up.railway.app"
    
    @property
    def api_url(self) -> str:
        if self.is_production:
            return f"https://{self.RAILWAY_HOST}"
        else:
            return f"http://{self.HOST}:{self.PORT}"
```

### Frontend Configuration (`frontend/src/config/api.js`)

The frontend automatically detects the environment and connects to the appropriate backend:

```javascript
const getApiBaseUrl = () => {
  // Check environment and return appropriate URL
  if (window.location.hostname === 'localhost') {
    // Try Railway first, fallback to localhost
    return 'https://iploppositionplanningbackend-game-planner.up.railway.app';
  }
  return 'https://iploppositionplanningbackend-game-planner.up.railway.app';
};
```

## 🏃‍♂️ Running the Application

### Option 1: Quick Start (Recommended)
```bash
python start_local.py
```

### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 🌐 Environment Configurations

### Local Development
- **Backend**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000`
- **API Docs**: `http://localhost:8000/docs`

### Railway Production
- **Backend**: `https://iploppositionplanningbackend-game-planner.up.railway.app`
- **Frontend**: Can be deployed to Netlify/Vercel and will automatically connect to Railway backend

## 🔄 API Connection Logic

The frontend uses smart connection logic:

1. **Health Check**: Tests if the configured API is responding
2. **Fallback**: If primary API fails, shows connection status
3. **Environment Detection**: Automatically chooses localhost vs Railway
4. **Status Indicators**: Shows API connection status in the UI

## 📝 Environment Variables

### Backend (.env file)
```bash
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
```

### Frontend (.env.local file)
```bash
REACT_APP_API_BASE_URL=https://iploppositionplanningbackend-game-planner.up.railway.app
REACT_APP_ENVIRONMENT=development
```

## 🚢 Deployment Steps

### To Deploy Backend Updates to Railway:
1. Push changes to your backend repository
2. Railway will automatically redeploy
3. Verify at: `https://iploppositionplanningbackend-game-planner.up.railway.app`

### To Deploy Frontend:
1. Set environment variables in your hosting platform
2. Build and deploy the React app
3. Frontend will automatically connect to Railway backend

## 🧪 Testing the Setup

### Test Backend Health:
```bash
# Local
curl http://localhost:8000/

# Railway
curl https://iploppositionplanningbackend-game-planner.up.railway.app/
```

### Test API Configuration:
```bash
# Local
curl http://localhost:8000/config

# Railway (after deployment)
curl https://iploppositionplanningbackend-game-planner.up.railway.app/config
```

## 🔍 Troubleshooting

### Backend Issues:
- **Port in use**: Change PORT environment variable
- **CORS errors**: Check CORS_ORIGINS in config.py
- **Module not found**: Run `pip install -r requirements.txt`

### Frontend Issues:
- **API connection failed**: Check API_BASE_URL in console logs
- **CORS blocked**: Ensure backend CORS is configured correctly
- **Build errors**: Clear node_modules and reinstall

### Railway Issues:
- **Deployment failed**: Check Railway logs
- **API not responding**: Verify Railway service is running
- **Environment variables**: Set them in Railway dashboard

## 📊 New Features Added

1. **Environment Detection**: Automatic local vs production detection
2. **Health Checks**: API availability testing
3. **Connection Status**: UI indicators for API status
4. **Flexible Configuration**: Easy switching between environments
5. **Error Handling**: Graceful fallbacks when API is unavailable

## 🎯 Next Steps

1. **Deploy Updated Backend**: Push the updated backend code to Railway
2. **Test Both Environments**: Verify localhost and Railway work correctly
3. **Deploy Frontend**: Configure frontend deployment with Railway backend URL
4. **Monitor**: Use the health check endpoints to monitor API status

The application is now configured to seamlessly work with both local development and Railway production environments! 🎉
