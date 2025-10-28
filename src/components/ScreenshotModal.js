import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import PlayerSlide from './PlayerSlide';
import TeamSlide from './TeamSlide';
import OverByOverSlide from './OverByOverSlide';
import VenueSlide from './VenueSlide';

const ScreenshotModal = ({ 
  isOpen, 
  onClose, 
  slides, 
  selectedOpposition, 
  selectedVenue,
  selectedPlayers
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const slideRef = useRef(null);
  const hiddenSlideRef = useRef(null);

  const captureSlideScreenshot = async (slideElement) => {
    try {
      // Ensure the slide is fully rendered
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const canvas = await html2canvas(slideElement, {
        backgroundColor: '#1f2937', // Match the slide background
        scale: 1.5, // Good balance of quality and performance
        useCORS: true,
        allowTaint: true,
        width: slideElement.offsetWidth,
        height: slideElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        removeContainer: true
      });
      
      return canvas.toDataURL('image/png', 0.9);
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  };

  const renderSlideComponent = (slide) => {
    switch (slide.type) {
      case 'player':
        return (
          <PlayerSlide 
            playerName={slide.data} 
            opposition={selectedOpposition}
            selectedPlayers={selectedPlayers}
          />
        );
      case 'team':
        return <TeamSlide teamName={slide.data} />;
      case 'overbyover':
        return <OverByOverSlide teamName={slide.data} />;
      case 'venue':
        return <VenueSlide venueName={slide.data} />;
      default:
        return <div>Unknown slide type</div>;
    }
  };

  const generatePowerPointWithScreenshots = async () => {
    if (!slides || slides.length === 0) {
      alert('No slides to generate PowerPoint from');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Initializing...');

    try {
      // Create new presentation
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE'; // 16:9 aspect ratio
      pptx.author = 'IPL Opposition Planning Tool';
      pptx.company = 'Cricket Analytics';
      pptx.title = `IPL Opposition Analysis - ${selectedOpposition}`;
      pptx.subject = 'Cricket Team Analysis';

      // Create a hidden container for rendering slides
      let hiddenContainer = document.getElementById('hidden-slide-container');
      if (!hiddenContainer) {
        hiddenContainer = document.createElement('div');
        hiddenContainer.id = 'hidden-slide-container';
        hiddenContainer.style.position = 'fixed';
        hiddenContainer.style.top = '-9999px';
        hiddenContainer.style.left = '-9999px';
        hiddenContainer.style.width = '1200px';
        hiddenContainer.style.height = '800px';
        hiddenContainer.style.backgroundColor = '#1f2937';
        hiddenContainer.style.zIndex = '-1';
        document.body.appendChild(hiddenContainer);
      }

      for (let i = 0; i < slides.length; i++) {
        setCurrentStep(`Capturing slide ${i + 1} of ${slides.length}...`);
        setProgress(((i) / slides.length) * 80); // 80% for screenshots, 20% for generation

        try {
          // Create slide wrapper
          const slideWrapper = document.createElement('div');
          slideWrapper.className = 'slide-content bg-gray-800 rounded-lg p-6 min-h-[600px]';
          slideWrapper.style.width = '1200px';
          slideWrapper.style.minHeight = '600px';
          
          // Add slide title
          const titleElement = document.createElement('h2');
          titleElement.className = 'text-2xl font-bold text-white mb-6';
          titleElement.textContent = slides[i].title;
          slideWrapper.appendChild(titleElement);
          
          // Create content container
          const contentContainer = document.createElement('div');
          slideWrapper.appendChild(contentContainer);
          
          // Clear and add to hidden container
          hiddenContainer.innerHTML = '';
          hiddenContainer.appendChild(slideWrapper);
          
          // Render React component into the content container
          const slideComponent = renderSlideComponent(slides[i]);
          ReactDOM.render(slideComponent, contentContainer);

          // Wait for content to render
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Capture screenshot
          const screenshot = await captureSlideScreenshot(slideWrapper);

          // Add slide to presentation
          const slide = pptx.addSlide();
          
          // Add the screenshot as the main content
          slide.addImage({
            data: screenshot,
            x: 0.2,
            y: 0.5,
            w: 12.6,
            h: 7.5,
            sizing: {
              type: 'contain',
              w: 12.6,
              h: 7.5
            }
          });

          // Add slide number in corner
          slide.addText(`${i + 1} / ${slides.length}`, {
            x: 12.5,
            y: 8.2,
            w: 0.8,
            h: 0.3,
            fontSize: 10,
            fontFace: 'Arial',
            color: '999999',
            align: 'right'
          });

        } catch (slideError) {
          console.error(`Error processing slide ${i + 1}:`, slideError);
          
          // Add error slide
          const slide = pptx.addSlide();
          slide.addText(`Error loading slide: ${slides[i].title}`, {
            x: 1,
            y: 3,
            w: 11,
            h: 2,
            fontSize: 24,
            fontFace: 'Arial',
            color: 'FF0000',
            align: 'center'
          });
          
          slide.addText('Please try again or contact support if the issue persists.', {
            x: 1,
            y: 4,
            w: 11,
            h: 1,
            fontSize: 14,
            fontFace: 'Arial',
            color: '666666',
            align: 'center'
          });
        }
      }

      // Clean up hidden container
      if (hiddenContainer && hiddenContainer.parentNode) {
        document.body.removeChild(hiddenContainer);
      }

      setCurrentStep('Generating PowerPoint file...');
      setProgress(90);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `IPL_Opposition_Analysis_${selectedOpposition?.replace(/\s+/g, '_')}_${timestamp}.pptx`;

      // Save the presentation
      await pptx.writeFile({ fileName: filename });

      setProgress(100);
      setCurrentStep('Complete!');
      
      // Show success message
      setTimeout(() => {
        alert(`PowerPoint generated successfully: ${filename}`);
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      alert('Error generating PowerPoint. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Generate PowerPoint with Screenshots
          </h2>
          
          {!isGenerating ? (
            <>
              <p className="text-gray-300 mb-6">
                This will capture screenshots of all {slides?.length || 0} slides and create a PowerPoint presentation with the actual visual content from the web app.
              </p>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-teal-400 mb-2">What's included:</h3>
                <ul className="text-sm text-gray-300 text-left space-y-1">
                  <li>• High-resolution screenshots of each slide</li>
                  <li>• All charts, tables, and visualizations</li>
                  <li>• Exact colors and formatting from web app</li>
                  <li>• Editable text overlays for titles</li>
                  <li>• Professional presentation layout</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePowerPointWithScreenshots}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Generate PowerPoint
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="text-lg font-semibold text-teal-400 mb-2">
                  {currentStep}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                  <div 
                    className="bg-teal-500 h-4 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400">
                  {Math.round(progress)}% complete
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Please wait while we capture screenshots and generate your presentation...
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotModal;
