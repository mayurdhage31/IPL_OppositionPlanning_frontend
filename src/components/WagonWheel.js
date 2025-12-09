import React from 'react';

const WagonWheel = ({ data }) => {
  if (!data || !data.zones || data.zones.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <p className="text-gray-400">No wagon wheel data available</p>
      </div>
    );
  }

  // Map field zones to angles (in degrees, 0° = top/straight)
  // Based on cricket field positions from the reference image
  const zoneAngles = {
    'Straight (off-side) / long-off': 0,
    'Extra cover': 30,
    'Cover': 45,
    'Point': 60,
    'Backward point': 75,
    'Third man': 90,
    'Short third man': 100,
    'Fine leg': 270,
    'Short fine leg': 260,
    'Backward square leg': 240,
    'Square leg': 225,
    'Midwicket': 210,
    'Long-on': 180,
    'Straight (leg-side)': 180,
  };

  // Get max boundaries for scaling
  const maxBoundaries = Math.max(...data.zones.map(z => z.n_boundaries));
  
  // SVG dimensions
  const width = 500;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 200;
  const minRadius = 40;

  // Color scale based on boundaries
  const getColor = (boundaries) => {
    const ratio = boundaries / maxBoundaries;
    if (ratio > 0.7) return '#10B981'; // Green for high
    if (ratio > 0.4) return '#F59E0B'; // Orange for medium
    return '#EF4444'; // Red for low
  };

  // Convert zone data to individual boundary lines
  // Each boundary in a zone gets its own line with slight angle variation
  const boundaryLines = [];
  data.zones.forEach((zone) => {
    const baseAngle = zoneAngles[zone.field_zone] !== undefined 
      ? zoneAngles[zone.field_zone] 
      : 0;
    
    const color = getColor(zone.n_boundaries);
    
    // Create individual lines for each boundary in this zone
    for (let i = 0; i < zone.n_boundaries; i++) {
      // Spread boundaries within a 20-degree arc around the base angle
      const angleSpread = 20;
      const angleOffset = (i - zone.n_boundaries / 2) * (angleSpread / Math.max(zone.n_boundaries, 1));
      const angle = baseAngle + angleOffset;
      
      // Extend lines to reach the boundary edge (maxRadius)
      const radius = maxRadius;
      
      boundaryLines.push({
        zone: zone.field_zone,
        angle,
        radius,
        color
      });
    }
  });

  // Function to create a line from center to boundary
  const createBoundaryLine = (angle, radius) => {
    const radian = (angle - 90) * (Math.PI / 180);
    const x1 = centerX + minRadius * Math.cos(radian);
    const y1 = centerY + minRadius * Math.sin(radian);
    const x2 = centerX + radius * Math.cos(radian);
    const y2 = centerY + radius * Math.sin(radian);
    
    return { x1, y1, x2, y2 };
  };

  // Function to get label position
  const getLabelPosition = (angle, radius) => {
    const labelRadius = radius + 20;
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: centerX + labelRadius * Math.cos(radian),
      y: centerY + labelRadius * Math.sin(radian)
    };
  };

  // Simplified zone names for display
  const getShortZoneName = (zoneName) => {
    const shortNames = {
      'Straight (off-side) / long-off': 'Long Off',
      'Extra cover': 'Extra Cover',
      'Cover': 'Cover',
      'Point': 'Point',
      'Backward point': 'Bwd Point',
      'Third man': 'Third Man',
      'Short third man': 'Short 3rd',
      'Fine leg': 'Fine Leg',
      'Short fine leg': 'Short Fine',
      'Backward square leg': 'Bwd Sq Leg',
      'Square leg': 'Square Leg',
      'Midwicket': 'Mid-wicket',
      'Long-on': 'Long On',
      'Straight (leg-side)': 'Straight',
    };
    return shortNames[zoneName] || zoneName;
  };

  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold text-white mb-3">Wagon Wheel – Boundary Distribution</h3>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Wagon Wheel Visualization */}
        <div className="flex-1 flex items-center justify-center">
          <svg width={width} height={height} className="bg-green-900 rounded-full">
            {/* Cricket field background circles */}
            <circle cx={centerX} cy={centerY} r={maxRadius} fill="#166534" opacity="0.3" />
            <circle cx={centerX} cy={centerY} r={maxRadius * 0.75} fill="#166534" opacity="0.2" />
            <circle cx={centerX} cy={centerY} r={maxRadius * 0.5} fill="#166534" opacity="0.2" />
            <circle cx={centerX} cy={centerY} r={maxRadius * 0.25} fill="#166534" opacity="0.2" />
            
            {/* Center pitch */}
            <rect 
              x={centerX - 3} 
              y={centerY - 30} 
              width={6} 
              height={60} 
              fill="#F59E0B" 
              opacity="0.6"
            />
            
            {/* Batsman position */}
            <circle cx={centerX} cy={centerY} r={8} fill="#FFFFFF" />
            
            {/* Individual boundary lines */}
            {boundaryLines.map((boundary, index) => {
              const line = createBoundaryLine(boundary.angle, boundary.radius);
              return (
                <line
                  key={index}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={boundary.color}
                  strokeWidth="3"
                  opacity="0.7"
                  strokeLinecap="round"
                >
                  <title>{boundary.zone}</title>
                </line>
              );
            })}
            
            {/* Field orientation labels */}
            <text x={30} y={centerY} textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" transform={`rotate(-90 30 ${centerY})`}>
              Off-side
            </text>
            <text x={width - 30} y={centerY} textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" transform={`rotate(90 ${width - 30} ${centerY})`}>
              Leg-side
            </text>
          </svg>
        </div>
        
        {/* Summary Only - No Legend */}
        <div className="lg:w-64 space-y-3">
          {/* Summary Statistics */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-base font-semibold text-white mb-2">Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Boundaries:</span>
                <span className="text-white font-semibold">{data.total_boundaries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Zones:</span>
                <span className="text-white font-semibold">{data.summary.zones_with_data}</span>
              </div>
              {data.summary.most_productive_zone && (
                <>
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <p className="text-gray-300 text-xs mb-1">Most Productive:</p>
                    <p className="text-green-400 font-semibold text-xs">
                      {getShortZoneName(data.summary.most_productive_zone)}
                    </p>
                    <p className="text-white text-sm font-bold">
                      {data.summary.most_productive_boundaries} boundaries
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <p className="text-gray-300 text-xs mb-1">Least Productive:</p>
                    <p className="text-red-400 font-semibold text-xs">
                      {getShortZoneName(data.summary.least_productive_zone)}
                    </p>
                    <p className="text-white text-sm font-bold">
                      {data.summary.least_productive_boundaries} boundaries
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Top Zones List */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="text-base font-semibold text-white mb-2">Top Zones</h4>
            <div className="space-y-1">
              {[...data.zones]
                .sort((a, b) => b.n_boundaries - a.n_boundaries)
                .slice(0, 5)
                .map((zone, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 truncate flex-1">
                      {getShortZoneName(zone.field_zone)}
                    </span>
                    <span className="text-white font-semibold ml-2">
                      {zone.n_boundaries}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WagonWheel;
