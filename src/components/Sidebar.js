import React from 'react';

const Sidebar = ({
  teams,
  venues,
  selectedTeam,
  selectedOpposition,
  selectedVenue,
  selectedPlayers,
  teamPlayers,
  onTeamChange,
  onOppositionChange,
  onVenueChange,
  onPlayerSelection,
  onGenerateInsights,
  showSlides
}) => {
  return (
    <div className="w-80 sidebar p-6 min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-6">Team Selection</h2>
        
        <div className="space-y-4">
          {/* Your Team */}
          <div>
            <label className="block text-white font-medium mb-2">Your Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => onTeamChange(e.target.value)}
              className="dropdown-select w-full"
            >
              <option value="">Select Your Team</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Opposition */}
          <div>
            <label className="block text-white font-medium mb-2">Opposition</label>
            <select
              value={selectedOpposition}
              onChange={(e) => onOppositionChange(e.target.value)}
              className="dropdown-select w-full"
            >
              <option value="">Select Opposition</option>
              {teams.filter(team => team !== selectedTeam).map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-white font-medium mb-2">Venue</label>
            <select
              value={selectedVenue}
              onChange={(e) => onVenueChange(e.target.value)}
              className="dropdown-select w-full"
            >
              <option value="">Select Venue</option>
              {venues.map(venue => (
                <option key={venue} value={venue}>{venue}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Opposition Players */}
      {selectedOpposition && (
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Opposition Players</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {teamPlayers.map(player => (
              <div key={player} className="flex items-center">
                <input
                  type="checkbox"
                  id={player}
                  checked={selectedPlayers.includes(player)}
                  onChange={() => onPlayerSelection(player)}
                  className="mr-3 w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <label 
                  htmlFor={player} 
                  className="text-sm text-white cursor-pointer hover:text-green-400"
                >
                  {player}
                </label>
              </div>
            ))}
          </div>
          
          <button 
            className="generate-button mt-4"
            onClick={onGenerateInsights}
            disabled={selectedPlayers.length === 0 && !selectedOpposition && !selectedVenue}
          >
            Generate Insights
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
