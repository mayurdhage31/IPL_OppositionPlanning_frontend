import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SlideContainer from './components/SlideContainer';
import Sidebar from './components/Sidebar';
import { API_BASE_URL } from './config/api';

function App() {
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedOpposition, setSelectedOpposition] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSlides, setShowSlides] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setApiStatus('checking');
      
      const [teamsResponse, venuesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/teams`),
        axios.get(`${API_BASE_URL}/venues`)
      ]);
      
      setTeams(teamsResponse.data.teams);
      setVenues(venuesResponse.data.venues);
      setApiStatus('connected');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setApiStatus('error');
      setLoading(false);
    }
  }, []);

  const fetchTeamPlayers = useCallback(async (teamName) => {
    if (!teamName) {
      setTeamPlayers([]);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${encodeURIComponent(teamName)}/players`);
      setTeamPlayers(response.data.players);
    } catch (error) {
      console.error('Error fetching players:', error);
      setTeamPlayers([]);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleTeamChange = (team) => {
    setSelectedTeam(team);
  };

  const handleOppositionChange = (team) => {
    setSelectedOpposition(team);
    
    // Fetch players for the selected opposition team
    if (team) {
      fetchTeamPlayers(team);
      
      // Set preselected players for specific teams
      if (team === 'Rajasthan Royals') {
        setSelectedPlayers([
          'Jos Buttler',
          'Yashasvi Jaiswal',
          'Sanju Samson',
          'Shimron Hetmyer',
          'Riyan Parag',
          'Devdutt Padikkal',
          'Ravichandran Ashwin',
          'Trent Boult',
          'Prasidh Krishna'
        ]);
      } else if (team === 'Royal Challengers Bangalore') {
        setSelectedPlayers([
          'Virat Kohli',
          'Faf du Plessis',
          'Glenn Maxwell',
          'Will Jacks',
          'Cameron Green',
          'Rajat Patidar',
          'Dinesh Karthik',
          'Lockie Ferguson',
          'Mohammed Siraj'
        ]);
      } else {
        setSelectedPlayers([]);
      }
    } else {
      setTeamPlayers([]);
      setSelectedPlayers([]);
    }
  };

  const handleVenueChange = (venue) => {
    setSelectedVenue(venue);
  };

  const handlePlayerSelection = (player) => {
    setSelectedPlayers(prev => {
      if (prev.includes(player)) {
        return prev.filter(p => p !== player);
      } else {
        return [...prev, player];
      }
    });
  };

  const handleGenerateInsights = () => {
    setShowSlides(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#1a1f2e'}}>
        <div className="text-center">
          <div className="text-xl mb-4" style={{color: '#10b981'}}>Loading...</div>
          <div className="text-sm" style={{color: '#6b7280'}}>
            Connecting to API: {API_BASE_URL}
          </div>
          {apiStatus === 'checking' && (
            <div className="text-sm mt-2" style={{color: '#f59e0b'}}>Checking API status...</div>
          )}
          {apiStatus === 'disconnected' && (
            <div className="text-sm mt-2" style={{color: '#ef4444'}}>API not responding</div>
          )}
          {apiStatus === 'error' && (
            <div className="text-sm mt-2" style={{color: '#ef4444'}}>Connection error</div>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="App">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Debug info - remove in production */}
        <div className="fixed top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 z-50">
          v2.0-overbyover
        </div>
        <Sidebar 
          teams={teams}
          venues={venues}
          selectedTeam={selectedTeam}
          selectedOpposition={selectedOpposition}
          selectedVenue={selectedVenue}
          teamPlayers={teamPlayers}
          selectedPlayers={selectedPlayers}
          onTeamChange={handleTeamChange}
          onOppositionChange={handleOppositionChange}
          onVenueChange={handleVenueChange}
          onPlayerSelection={handlePlayerSelection}
          onGenerateInsights={handleGenerateInsights}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        <div className="transition-all duration-300" style={{ marginLeft: isSidebarCollapsed ? '0' : '320px' }}>
          {showSlides && (
            <SlideContainer 
              selectedPlayers={selectedPlayers}
              selectedOpposition={selectedOpposition}
              selectedVenue={selectedVenue}
              showSlides={showSlides}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
