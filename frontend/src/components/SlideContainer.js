import React, { useState, useRef } from 'react';
import PlayerSlide from './PlayerSlide';
import TeamSlide from './TeamSlide';
import VenueSlide from './VenueSlide';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SlideContainer = ({ 
  selectedPlayers, 
  selectedOpposition, 
  selectedVenue, 
  showSlides 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef(null);

  if (!showSlides) {
    return (
      <div className="text-center mt-20" style={{color: '#10b981'}}>
        <h2 className="text-2xl mb-4">Welcome to Opposition Planning AI</h2>
        <p className="text-lg">Select teams, players, and venue from the sidebar, then click "Generate Insights" to view analysis</p>
      </div>
    );
  }

  // Create slides array
  const slides = [];
  
  // Add player slides
  selectedPlayers.forEach((player, index) => {
    slides.push({
      type: 'player',
      data: player,
      title: `Player Analysis: ${player}`,
      index: index + 1
    });
  });

  // Add opposition team slide
  if (selectedOpposition) {
    slides.push({
      type: 'team',
      data: selectedOpposition,
      title: `Opposition Analysis: ${selectedOpposition}`,
      index: slides.length + 1
    });
  }

  // Add venue slide
  if (selectedVenue) {
    slides.push({
      type: 'venue',
      data: selectedVenue,
      title: `Venue Analysis: ${selectedVenue}`,
      index: slides.length + 1
    });
  }

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const downloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const slideWidth = 210; // A4 width in mm
    const slideHeight = 297; // A4 height in mm

    for (let i = 0; i < slides.length; i++) {
      // Temporarily show the slide we want to capture
      setCurrentSlide(i);
      
      // Wait a bit for the slide to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Capture the slide
      const canvas = await html2canvas(slideRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#1a1f2e'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculate dimensions to fit the page
      const imgWidth = slideWidth;
      const imgHeight = (canvas.height * slideWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, slideHeight));
    }

    pdf.save('ipl-opposition-analysis.pdf');
  };

  if (totalSlides === 0) {
    return (
      <div className="text-center mt-20" style={{color: '#10b981'}}>
        <h2 className="text-2xl mb-4">No Data Selected</h2>
        <p className="text-lg">Please select players, opposition team, or venue to generate insights</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full">
      {/* Navigation Controls - Moved to Top */}
      <div className="flex justify-between items-center mb-6">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          disabled={totalSlides <= 1}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        {/* Slide Indicators */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide 
                  ? 'bg-teal-500' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          disabled={totalSlides <= 1}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>Next</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Slide Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentSlideData.title}
          </h2>
          <p className="text-gray-400">
            Slide {currentSlide + 1} of {totalSlides}
          </p>
        </div>
        
        {/* Download PDF Button */}
        <button
          onClick={downloadPDF}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download PDF</span>
        </button>
      </div>

      {/* Slide Content */}
      <div ref={slideRef} className="slide-content bg-gray-800 rounded-lg p-6 min-h-[600px]">
        {currentSlideData.type === 'player' && (
          <PlayerSlide 
            playerName={currentSlideData.data} 
            opposition={selectedOpposition}
            selectedPlayers={selectedPlayers}
          />
        )}
        
        {currentSlideData.type === 'team' && (
          <TeamSlide teamName={currentSlideData.data} />
        )}
        
        {currentSlideData.type === 'venue' && (
          <VenueSlide venueName={currentSlideData.data} />
        )}
      </div>


      {/* Slide Counter */}
      <div className="text-center mt-4 text-gray-400 text-sm">
        {slides.map((slide, index) => (
          <span key={index} className="mx-1">
            {slide.type === 'player' && '👤'}
            {slide.type === 'team' && '🏏'}
            {slide.type === 'venue' && '🏟️'}
            {slide.title.split(': ')[1]}
            {index < slides.length - 1 && ' → '}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SlideContainer;
