# IPL Opposition Planning AI Application

A comprehensive web application for analyzing IPL cricket players, teams, and venues to generate strategic insights for opposition planning.

## Features

- **Player Analysis**: Detailed insights, strengths, areas for improvement, scatter plots, and radar charts for individual players
- **Team Analysis**: Comprehensive team statistics and performance analysis against different bowling types
- **Venue Analysis**: Venue-specific insights and playing conditions
- **Interactive Visualizations**: Scatter plots and radar charts using Recharts
- **Modern UI**: Black background with teal accents, built with React and Tailwind CSS

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pandas**: Data analysis and manipulation
- **Uvicorn**: ASGI server for running FastAPI
- **SQLite**: Database for caching (if needed)

### Frontend
- **React**: JavaScript library for building user interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library for React
- **Axios**: HTTP client for API calls

## Project Structure

```
IPL_Opposition_planning_tool/
├── backend/
│   ├── data/
│   │   ├── IPL_21_24_Batting.csv
│   │   ├── Batters_StrikeRateVSBowlerType.csv
│   │   ├── Team_vs_BowlingType.csv
│   │   ├── IPL_Team_BattingData_21_24.csv
│   │   └── IPL_Venue_details.csv
│   ├── main.py
│   ├── insights.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── PlayerSlide.js
│   │   │   ├── TeamSlide.js
│   │   │   ├── VenueSlide.js
│   │   │   ├── ScatterPlot.js
│   │   │   └── RadarChart.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Installation & Setup

### Quick Start (Recommended)

Use the automated startup script to run both backend and frontend:

```bash
python start_local.py
```

This will start:
- Backend API at `http://localhost:8000`
- Frontend at `http://localhost:3000`

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Create a `.env` file for custom configuration:
```bash
cp .env.example .env
# Edit .env file with your preferred settings
```

4. Start the FastAPI server:
```bash
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. (Optional) Create environment configuration:
```bash
cp .env.example .env.local
# Edit .env.local with your API configuration
```

4. Start the React development server:
```bash
npm start
```

### Environment Configuration

#### Backend Environment Variables
- `ENVIRONMENT`: Set to "development" or "production"
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `RAILWAY_HOST`: Railway deployment host
- `CORS_ORIGINS`: Comma-separated list of allowed origins

#### Frontend Environment Variables
- `REACT_APP_API_BASE_URL`: Backend API URL
- `REACT_APP_ENVIRONMENT`: Environment setting
- `REACT_APP_RAILWAY_API_URL`: Railway backend URL

### Deployment Options

#### Local Development
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

#### Railway Deployment
- Backend: `https://iploppositionplanningbackend-game-planner.up.railway.app`
- Frontend: Configure to use Railway backend URL

The application automatically detects the environment and connects to the appropriate backend.

## API Endpoints

- `GET /` - API health check
- `GET /config` - Get API configuration and environment info
- `GET /teams` - Get all IPL teams
- `GET /teams/{team_name}/players` - Get players for a specific team
- `GET /venues` - Get all venues
- `GET /player/{player_name}/insights` - Get player insights
- `GET /team/{team_name}/insights` - Get team insights
- `GET /venue/{venue_name}/insights` - Get venue insights
- `GET /player/{player_name}/bowling-stats` - Get player stats vs bowling types
- `GET /team/{team_name}/bowling-stats` - Get team stats vs bowling types
- `GET /scatter-plot-data` - Get scatter plot data for players
- `GET /team-scatter-plot-data` - Get scatter plot data for teams

### API Documentation
Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage

1. **Select Team**: Choose your team from the dropdown
2. **Select Opposition**: Choose the opposition team
3. **Select Venue**: Choose the match venue
4. **Select Players**: Select one or multiple players from your team
5. **View Insights**: The application will generate slides with:
   - AI Insights
   - Strengths
   - Areas for Improvement
   - Scatter Plot Analysis
   - Radar Chart (Bowling Type Analysis)

## Data Sources

The application uses the following CSV datasets:
- `IPL_21_24_Batting.csv`: Player batting statistics
- `Batters_StrikeRateVSBowlerType.csv`: Player performance vs bowling types
- `Team_vs_BowlingType.csv`: Team performance vs bowling types
- `IPL_Team_BattingData_21_24.csv`: Team batting data
- `IPL_Venue_details.csv`: Venue statistics and details

## Features in Detail

### Player Slides
- Comprehensive AI-generated insights
- Performance strengths and improvement areas
- Scatter plot comparing 1st vs 2nd innings performance
- Radar chart showing strike rates against different bowling types

### Team Slides
- Team-level strategic insights
- Collective strengths and weaknesses
- Team scatter plot analysis
- Bowling type performance radar chart

### Venue Slides
- Venue-specific playing conditions
- Historical performance data
- Strategic recommendations for the venue

## Color Scheme
- **Background**: Black (#000000)
- **Primary Accent**: Teal (#4fd1c7)
- **Secondary**: Gray tones for cards and text
- **Text**: White and light gray

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
This project is for educational and analytical purposes.
