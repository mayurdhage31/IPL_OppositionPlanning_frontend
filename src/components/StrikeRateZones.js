import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const StrikeRateZones = ({ playerName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStrikeRateData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/player/${playerName}/strike-rate-zones`);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching strike rate zones:', err);
        setError('Failed to load strike rate data');
      } finally {
        setLoading(false);
      }
    };

    if (playerName) {
      fetchStrikeRateData();
    }
  }, [playerName]);


  // Get strike rate for a specific zone
  const getStrikeRate = (line, length) => {
    if (!data || !data.zones) return 0;
    const zone = data.zones.find(z => z.line_bin === line && z.length_bin === length);
    return zone ? Math.round(zone.SR) : 0;
  };

  // Get color based on strike rate ranking (top 6 green, middle 6 yellow, bottom 6 red)
  const getZoneColor = (strikeRate, allStrikeRates) => {
    if (strikeRate === 0) return 'bg-gray-600 bg-opacity-85';
    
    // Sort all non-zero strike rates to determine ranking
    const validRates = allStrikeRates.filter(rate => rate > 0).sort((a, b) => b - a);
    const rank = validRates.indexOf(strikeRate);
    
    if (rank < 6) return 'bg-green-500 bg-opacity-85'; // Top 6 - Green (Good)
    if (rank < 12) return 'bg-yellow-500 bg-opacity-85'; // Middle 6 - Yellow
    return 'bg-red-500 bg-opacity-85'; // Bottom 6 - Red (Bad)
  };

  // Get text color for contrast with shadow for better visibility
  const getTextColor = () => {
    return 'text-white drop-shadow-lg';
  };

  // Get all strike rates for ranking
  const getAllStrikeRates = () => {
    if (!data || !data.zones) return [];
    return data.zones.map(zone => Math.round(zone.SR));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400">Loading strike rate zones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const allStrikeRates = getAllStrikeRates();

  return (
    <div className="w-full">
      <div className="mb-3">
        <h4 className="text-base font-semibold text-white mb-2">Strike Rate Zones</h4>
        {/* Player Note */}
        <div className="bg-teal-600 text-white px-2 py-1 rounded-md text-xs font-medium inline-block">
          Showing stats for: {playerName}
        </div>
      </div>

      {/* Heatmap Grid with Batter Silhouette */}
      <div className="flex items-start gap-3">
        {/* Strike Rate Zones Table */}
        <div className="relative rounded-lg p-4 overflow-hidden flex-1 bg-gray-800">
        <div className="relative z-10">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-1 mb-1 max-w-md">
            <div></div> {/* Empty space for length labels */}
            <div className="text-center text-xs font-semibold text-white py-1">Off</div>
            <div className="text-center text-xs font-semibold text-white py-1">Line</div>
            <div className="text-center text-xs font-semibold text-white py-1">Leg</div>
          </div>

          {/* Data Rows */}
          <div className="max-w-md">
            {['bouncer', 'short', 'back of length', 'length', 'full', 'yorker'].map((length, rowIndex) => (
              <div key={length} className="mb-1">
                <div className="grid grid-cols-4 gap-1 items-center">
                  {/* Length Label - left side, same size as headers */}
                  <div className="text-left text-xs font-semibold text-white py-1">
                    {length.charAt(0).toUpperCase() + length.slice(1)}
                  </div>
                  
                  {/* Strike Rate Cells */}
                  {['off', 'line', 'leg'].map((line) => {
                    const strikeRate = getStrikeRate(line, length);
                    return (
                      <div
                        key={`${line}-${length}`}
                        className={`
                          flex items-center justify-center py-1 px-1 rounded
                          ${getZoneColor(strikeRate, allStrikeRates)} ${getTextColor()}
                          transition-all duration-200 hover:scale-105 hover:shadow-lg
                          border border-gray-600 hover:border-gray-400
                          h-8 text-xs font-bold
                        `}
                        style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)' }}
                      >
                        {strikeRate}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Batter Silhouette - Aligned with grid */}
        <div className="flex items-start justify-center pt-6" style={{ width: '120px' }}>
          <img 
            src="/batter_silhoutte.webp" 
            alt="Batter Stance" 
            className="opacity-70"
            style={{ width: '120px', height: 'auto' }}
          />
        </div>
      </div>


      {/* Color Legend */}
      <div className="mt-2">
        <h5 className="text-xs font-semibold text-white mb-1">Performance Legend</h5>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-300">Best 6 zones</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-300">Middle 6 zones</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-300">Worst 6 zones</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StrikeRateZones;
