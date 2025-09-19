import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlayerSlide from './components/PlayerSlide';
import TeamSlide from './components/TeamSlide';
import VenueSlide from './components/VenueSlide';
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
        />

        <main className="flex-1 p-6">
          {selectedPlayers.map((player, index) => (
            <PlayerSlide 
              key={`player-${index}`} 
              playerName={player} 
              opposition={selectedOpposition}
            />
          ))}
          
          {selectedOpposition && (
            <TeamSlide teamName={selectedOpposition} />
          )}
          
          {selectedVenue && (
            <VenueSlide venueName={selectedVenue} />
          )}
          
          {selectedPlayers.length === 0 && !selectedOpposition && !selectedVenue && (
            <div className="text-center mt-20" style={{color: '#10b981'}}>
              <h2 className="text-2xl mb-4">Welcome to Opposition Planning AI</h2>
              <p className="text-lg">Select teams, players, and venue from the sidebar to generate insights</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
