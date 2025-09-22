import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SlideContainer from './components/SlideContainer';
import Sidebar from './components/Sidebar';
import { API_BASE_URL, checkApiHealth } from './config/api';

function App() {
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedOpposition, setSelectedOpposition] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSlides, setShowSlides] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');

  const fetchInitialData = async () => {
    try {
      // Check API health first
      const isApiHealthy = await checkApiHealth();
      setApiStatus(isApiHealthy ? 'connected' : 'disconnected');
      
      if (!isApiHealthy) {
        console.warn('API is not responding, using fallback data if available');
        setLoading(false);
        return;
      }

      const [teamsResponse, venuesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/teams`),
        axios.get(`${API_BASE_URL}/venues`)
      ]);
      
      setTeams(teamsResponse.data.teams);
      setVenues(venuesResponse.data.venues);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setApiStatus('error');
      setLoading(false);
    }
  };

  const fetchTeamPlayers = useCallback(async (teamName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${teamName}/players`);
      setTeamPlayers(response.data.players);
      
      // Preselect players for specific teams
      const preselectedPlayers = getPreselectedPlayers(teamName);
      setSelectedPlayers(preselectedPlayers);
    } catch (error) {
      console.error('Error fetching team players:', error);
      setTeamPlayers([]);
      setSelectedPlayers([]);
    }
  }, []);

  const getPreselectedPlayers = (teamName) => {
    const preselectedTeams = {
      'Rajasthan Royals': [
        'Jos Buttler', 'Yashasvi Jaiswal', 'Sanju Samson', 'Devdutt Padikkal', 
        'Shimron Hetmyer', 'Riyan Parag', 'Ravichandran Ashwin', 'Trent Boult',
        'Prasidh Krishna', 'Yuzvendra Chahal'
      ],
      'Royal Challengers Bangalore': [
        'Virat Kohli', 'Faf du Plessis', 'Rajat Patidar', 'Glenn Maxwell', 
        'AB de Villiers', 'Dinesh Karthik', 'Wanindu Hasaranga', 'Harshal Patel', 
        'Mohammed Siraj', 'Josh Hazlewood'
      ]
    };
    
    return preselectedTeams[teamName] || [];
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedOpposition) {
      fetchTeamPlayers(selectedOpposition);
    }
  }, [selectedOpposition, fetchTeamPlayers]);

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
    <div className="min-h-screen" style={{backgroundColor: '#1a1f2e'}}>
      <div className="flex">
        <Sidebar
          teams={teams}
          venues={venues}
          selectedTeam={selectedTeam}
          selectedOpposition={selectedOpposition}
          selectedVenue={selectedVenue}
          selectedPlayers={selectedPlayers}
          teamPlayers={teamPlayers}
          onTeamChange={setSelectedTeam}
          onOppositionChange={setSelectedOpposition}
          onVenueChange={setSelectedVenue}
          onPlayerSelection={handlePlayerSelection}
          onGenerateInsights={handleGenerateInsights}
          showSlides={showSlides}
        />

        <main className="flex-1 p-6">
          <SlideContainer
            selectedPlayers={selectedPlayers}
            selectedOpposition={selectedOpposition}
            selectedVenue={selectedVenue}
            showSlides={showSlides}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
