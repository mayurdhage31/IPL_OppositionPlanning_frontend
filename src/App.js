import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SlideContainer from './components/SlideContainer';
import Sidebar from './components/Sidebar';

const API_BASE_URL = 'http://localhost:8000';

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

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedOpposition) {
      fetchTeamPlayers(selectedOpposition);
    }
  }, [selectedOpposition]);

  const fetchInitialData = async () => {
    try {
      const [teamsResponse, venuesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/teams`),
        axios.get(`${API_BASE_URL}/venues`)
      ]);
      
      setTeams(teamsResponse.data.teams);
      setVenues(venuesResponse.data.venues);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setLoading(false);
    }
  };

  const fetchTeamPlayers = async (teamName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teams/${teamName}/players`);
      setTeamPlayers(response.data.players);
      setSelectedPlayers([]); // Clear selected players when opposition changes
    } catch (error) {
      console.error('Error fetching team players:', error);
      setTeamPlayers([]);
    }
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
        <div className="text-xl" style={{color: '#10b981'}}>Loading...</div>
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
