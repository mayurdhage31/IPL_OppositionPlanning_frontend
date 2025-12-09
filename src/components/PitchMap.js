import React from 'react';

const PitchMap = ({ data, playerName }) => {
  if (!data || !data.dismissal_locations || data.dismissal_locations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-800 rounded-lg">
        <div className="text-gray-400 text-lg mb-2">No dismissal data available</div>
        <div className="text-gray-500 text-sm">for {playerName}</div>
      </div>
    );
  }

  // Define fielding position coordinates (relative to 400x400 SVG)
  // Batsman faces up (towards y=120), bowler bowls from top
  // Off-side = Right side of batsman (left in our view)
  // On/Leg-side = Left side of batsman (right in our view)
  const fieldingPositions = {
    // Wicket-keeper (behind stumps at striker's end)
    'wicket-keeper': { x: 200, y: 290 },
    
    // Slip cordon (behind wicket-keeper on off-side)
    'slip': { x: 230, y: 310 },
    'first slip': { x: 230, y: 310 },
    'second slip': { x: 250, y: 320 },
    'third slip': { x: 270, y: 330 },
    'gully': { x: 280, y: 300 },
    'leg slip': { x: 170, y: 310 },
    'leg gully': { x: 120, y: 300 },
    'fly slip': { x: 240, y: 280 },
    
    // Off-side positions (right side of batsman = left in our view)
    'point': { x: 120, y: 200 },
    'cover point': { x: 140, y: 180 },
    'cover': { x: 160, y: 160 },
    'short cover': { x: 180, y: 180 },
    'extra cover': { x: 140, y: 140 },
    'deep cover': { x: 100, y: 120 },
    'deep cover point': { x: 80, y: 140 },
    'deep point': { x: 60, y: 180 },
    'deep extra cover': { x: 120, y: 80 },
    'backward point': { x: 100, y: 220 },
    'deep backward point': { x: 60, y: 240 },
    'forward point': { x: 140, y: 160 },
    
    // Third man area (off-side behind wicket-keeper)
    'third man': { x: 320, y: 280 },
    'deep third man': { x: 350, y: 320 },
    'fine third man': { x: 300, y: 260 },
    'short third man': { x: 280, y: 240 },
    'square third man': { x: 320, y: 200 },
    
    // Straight positions (behind bowler)
    'mid-off': { x: 160, y: 120 },
    'short mid-off': { x: 180, y: 140 },
    'silly mid-off': { x: 190, y: 160 },
    'deep mid-off': { x: 140, y: 60 },
    'long-off': { x: 160, y: 40 },
    'straight long off': { x: 200, y: 30 },
    'wide long off': { x: 120, y: 50 },
    
    'mid-on': { x: 240, y: 120 },
    'short mid-on': { x: 220, y: 140 },
    'silly mid-on': { x: 210, y: 160 },
    'deep mid-on': { x: 260, y: 60 },
    'long-on': { x: 240, y: 40 },
    'straight long on': { x: 200, y: 30 },
    'wide long on': { x: 280, y: 50 },
    'straight hit': { x: 200, y: 50 },
    
    // On-side/leg-side positions (left side of batsman = right in our view)
    'square leg': { x: 280, y: 200 },
    'short square leg': { x: 260, y: 180 },
    'forward square leg': { x: 260, y: 160 },
    'deep square leg': { x: 320, y: 160 },
    'deep backward square leg': { x: 340, y: 220 },
    'backward square leg': { x: 300, y: 220 },
    
    'mid-wicket': { x: 260, y: 160 },
    'short mid-wicket': { x: 240, y: 180 },
    'deep mid-wicket': { x: 300, y: 120 },
    'deep forward mid-wicket': { x: 320, y: 140 },
    
    // Fine leg area (on-side behind wicket-keeper)
    'fine leg': { x: 160, y: 280 },
    'short fine leg': { x: 180, y: 260 },
    'square fine leg': { x: 200, y: 240 },
    'deep fine leg': { x: 120, y: 320 },
    'deep backward fine leg': { x: 100, y: 340 },
    'straight fine leg': { x: 160, y: 300 },
    
    // Special positions
    'silly point': { x: 140, y: 180 },
    "non-striker's end": { x: 200, y: 120 },
    "striker's end": { x: 200, y: 280 }
  };

  // Get max count for scaling dot sizes
  const maxCount = Math.max(...data.dismissal_locations.map(d => d.count));
  
  // Function to get dot size based on count
  const getDotSize = (count) => {
    const minSize = 4;
    const maxSize = 16;
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  // Function to get dot color based on count (intensity)
  const getDotColor = (count) => {
    const intensity = count / maxCount;
    if (intensity >= 0.8) return '#ef4444'; // Red for highest
    if (intensity >= 0.6) return '#f97316'; // Orange for high
    if (intensity >= 0.4) return '#eab308'; // Yellow for medium
    if (intensity >= 0.2) return '#22c55e'; // Green for low
    return '#06b6d4'; // Cyan for lowest
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-2">Pitch Map Visualisations: Dismissal Location</h3>
      <div className="text-xs text-gray-400 mb-3">for {playerName}</div>
      
      <div className="flex justify-center items-center flex-1">
        <svg width="380" height="380" viewBox="0 0 400 400" className="bg-green-600 rounded-full">
          {/* Cricket Ground (Green Circle) */}
          <circle cx="200" cy="200" r="190" fill="#16a34a" stroke="#15803d" strokeWidth="2"/>
          
          {/* Pitch (Brown Rectangle in center) */}
          <rect x="190" y="120" width="20" height="160" fill="#92400e" stroke="#78350f" strokeWidth="1"/>
          
          {/* Wickets - Bowler's end (top) */}
          <rect x="195" y="125" width="10" height="3" fill="#fbbf24"/>
          {/* Wickets - Striker's end (bottom) */}
          <rect x="195" y="272" width="10" height="3" fill="#fbbf24"/>
          
          {/* Crease lines */}
          <line x1="185" y1="130" x2="215" y2="130" stroke="#fbbf24" strokeWidth="1"/>
          <line x1="185" y1="270" x2="215" y2="270" stroke="#fbbf24" strokeWidth="1"/>
          
          {/* Popping crease */}
          <line x1="185" y1="275" x2="215" y2="275" stroke="#fbbf24" strokeWidth="2"/>
          
          {/* 30-yard circle */}
          <circle cx="200" cy="200" r="80" fill="none" stroke="#15803d" strokeWidth="1" strokeDasharray="5,5"/>
          
          {/* Boundary rope */}
          <circle cx="200" cy="200" r="185" fill="none" stroke="#ffffff" strokeWidth="2"/>
          
          {/* Dismissal location dots */}
          {data.dismissal_locations.map((dismissal, index) => {
            let position = fieldingPositions[dismissal.position.toLowerCase()];
            if (!position) {
              // If position not found, place it randomly on the field
              const angle = Math.random() * 2 * Math.PI;
              const radius = 60 + Math.random() * 120;
              position = {
                x: 200 + radius * Math.cos(angle),
                y: 200 + radius * Math.sin(angle)
              };
            }
            
            return (
              <g key={index}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={getDotSize(dismissal.count)}
                  fill={getDotColor(dismissal.count)}
                  stroke="#ffffff"
                  strokeWidth="1"
                  opacity="0.8"
                />
                {/* Tooltip on hover */}
                <title>
                  {dismissal.position}: {dismissal.count} dismissal{dismissal.count > 1 ? 's' : ''}
                </title>
              </g>
            );
          })}
          
          {/* Labels for orientation */}
          <text x="100" y="200" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
            Off-side
          </text>
          <text x="300" y="200" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
            On/Leg-side
          </text>
          <text x="200" y="30" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            Bowler's End
          </text>
          <text x="200" y="385" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
            Striker's End
          </text>
        </svg>
      </div>
      
      {/* Legend - Compact */}
      <div className="mt-2">
        <div className="text-xs font-semibold text-white mb-1">Legend</div>
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-300">Highest</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-300">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-300">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-300">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <span className="text-xs text-gray-300">Lowest</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchMap;
