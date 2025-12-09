import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SlideExportWrapper from './SlideExportWrapper';
import PlayerSlide from './PlayerSlide';
import TeamSlide from './TeamSlide';
import OverByOverSlide from './OverByOverSlide';
import VenueSlide from './VenueSlide';

/**
 * ExportSlide - Dedicated route for screenshot capture
 * Renders slides at fixed 1920x1080 resolution for PPT export
 * 
 * URL Parameters:
 * - type: 'player' | 'team' | 'overbyover' | 'venue'
 * - player: Player name (for player slides)
 * - team: Team name (for team/overbyover slides)
 * - venue: Venue name (for venue slides)
 * - opposition: Opposition team name (optional, for player slides)
 */
export default function ExportSlide() {
  const [searchParams] = useSearchParams();
  const slideType = searchParams.get('type');
  const playerName = searchParams.get('player');
  const teamName = searchParams.get('team');
  const venueName = searchParams.get('venue');
  const opposition = searchParams.get('opposition');
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for all content to load (charts, images, data)
    const timer = setTimeout(() => {
      setIsReady(true);
      // Signal to Playwright that page is ready for screenshot
      window.slideReady = true;
      console.log('Slide ready for screenshot');
    }, 3000); // 3 second delay for all async data to load
    
    return () => clearTimeout(timer);
  }, [slideType, playerName, teamName, venueName]);

  return (
    <SlideExportWrapper>
      <div className="p-12" style={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
        {/* Player Analysis Slide */}
        {slideType === 'player' && playerName && (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">
              Player Analysis: {playerName}
            </h1>
            <PlayerSlide 
              playerName={playerName} 
              opposition={opposition}
              selectedPlayers={[playerName]}
            />
          </>
        )}
        
        {/* Team Analysis Slide */}
        {slideType === 'team' && teamName && (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">
              Opposition Analysis: {teamName}
            </h1>
            <TeamSlide teamName={teamName} />
          </>
        )}
        
        {/* Over-by-Over Analysis Slide */}
        {slideType === 'overbyover' && teamName && (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">
              Over-by-Over Analysis: {teamName}
            </h1>
            <OverByOverSlide teamName={teamName} />
          </>
        )}
        
        {/* Venue Analysis Slide */}
        {slideType === 'venue' && venueName && (
          <>
            <h1 className="text-4xl font-bold text-white mb-6">
              Venue Analysis: {venueName}
            </h1>
            <VenueSlide venueName={venueName} />
          </>
        )}

        {/* Loading indicator (hidden when ready) */}
        {!isReady && (
          <div className="absolute top-4 right-4 text-teal-500 text-sm">
            Loading...
          </div>
        )}
      </div>
    </SlideExportWrapper>
  );
}
