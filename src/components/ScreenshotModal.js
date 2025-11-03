// ScreenshotModal.jsx
import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import PlayerSlide from './PlayerSlide';
import TeamSlide from './TeamSlide';
import OverByOverSlide from './OverByOverSlide';
import VenueSlide from './VenueSlide';

const WIDTH = 1920;   // px
const HEIGHT = 1080;  // px
const BG = '#1f2937'; // tailwind gray-800

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
  const hiddenSlideRef = useRef(null);

  // Renders the correct React component for each slide
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

  // Capture the given element at a fixed 1920x1080, scale=2 for crispness
  const captureFrameScreenshot = async (frameEl) => {
    const canvas = await html2canvas(frameEl, {
      backgroundColor: BG,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      width: WIDTH,
      height: HEIGHT,
      scrollX: 0,
      scrollY: 0,
      logging: false,
      removeContainer: true,
      windowWidth: WIDTH,
      windowHeight: HEIGHT
    });
    return canvas.toDataURL('image/png', 0.9);
  };

  const generatePowerPointWithScreenshots = async () => {
    if (!slides || slides.length === 0) {
      alert('No slides to generate PowerPoint from');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Initializing...');

    // Create hidden container (off-screen), but DO NOT clip overflow
    let hiddenContainer = document.getElementById('hidden-slide-container');
    if (!hiddenContainer) {
      hiddenContainer = document.createElement('div');
      hiddenContainer.id = 'hidden-slide-container';
      hiddenContainer.style.position = 'fixed';
      hiddenContainer.style.top = '-99999px';
      hiddenContainer.style.left = '-99999px';
      hiddenContainer.style.width = 'auto';
      hiddenContainer.style.height = 'auto';
      hiddenContainer.style.backgroundColor = BG;
      hiddenContainer.style.zIndex = '-1';
      hiddenContainer.style.overflow = 'visible';
      document.body.appendChild(hiddenContainer);
    }
    hiddenSlideRef.current = hiddenContainer;

    try {
      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE'; // 16:9 (13.33in x 7.5in)
      pptx.author = 'IPL Opposition Planning Tool';
      pptx.company = 'Cricket Analytics';
      pptx.title = `IPL Opposition Analysis - ${selectedOpposition || ''}`;
      pptx.subject = 'Cricket Team Analysis';

      for (let i = 0; i < slides.length; i++) {
        setCurrentStep(`Rendering slide ${i + 1} of ${slides.length}...`);
        setProgress((i / slides.length) * 80);

        try {
          // === Build a fixed frame we will capture ===
          const frame = document.createElement('div');
          frame.style.width = `${WIDTH}px`;
          frame.style.height = `${HEIGHT}px`;
          frame.style.backgroundColor = BG;
          frame.style.position = 'relative';
          frame.style.boxSizing = 'border-box';
          frame.style.overflow = 'hidden';

          // === Natural-size content container ===
          const slideWrapper = document.createElement('div');
          slideWrapper.className = 'slide-content bg-gray-800';
          slideWrapper.style.boxSizing = 'border-box';
          slideWrapper.style.padding = '20px';
          slideWrapper.style.transformOrigin = 'top left';
          slideWrapper.style.position = 'absolute'; // allow centering after scale

          // Title
          const titleElement = document.createElement('h2');
          titleElement.className = 'text-2xl font-bold text-white mb-2';
          titleElement.textContent = slides[i].title || '';
          slideWrapper.appendChild(titleElement);

          // React content mount point
          const contentContainer = document.createElement('div');
          slideWrapper.appendChild(contentContainer);

          // Add to DOM
          hiddenContainer.innerHTML = '';
          frame.appendChild(slideWrapper);
          hiddenContainer.appendChild(frame);

          // Render React component
          const slideComponent = renderSlideComponent(slides[i]);
          ReactDOM.render(slideComponent, contentContainer);

          // Wait for charts/tables to render
          await new Promise((resolve) => setTimeout(resolve, 2500));

          // Measure natural content size
          const contentW = Math.max(
            slideWrapper.scrollWidth,
            slideWrapper.offsetWidth
          );
          const contentH = Math.max(
            slideWrapper.scrollHeight,
            slideWrapper.offsetHeight
          );

          // Scale to fit the 1920x1080 frame without cropping
          const scale = Math.min(WIDTH / contentW, HEIGHT / contentH);
          slideWrapper.style.width = contentW + 'px';
          slideWrapper.style.height = contentH + 'px';
          slideWrapper.style.transform = `scale(${scale})`;

          // Center inside the frame after scaling
          const left = (WIDTH - contentW * scale) / 2;
          const top = (HEIGHT - contentH * scale) / 2;
          slideWrapper.style.left = `${Math.max(0, left)}px`;
          slideWrapper.style.top = `${Math.max(0, top)}px`;

          // Screenshot the fixed frame
          const screenshot = await captureFrameScreenshot(frame);

          // ===== Build PPT slide =====
          const slide = pptx.addSlide();

          // Add the screenshot to fill the slide (no cropping because we pre-fit)
          slide.addImage({
            data: screenshot,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            sizing: { type: 'contain', w: '100%', h: '100%' }
          });

          // Slide number
          slide.addText(`${i + 1} / ${slides.length}`, {
            x: 12.3,
            y: 7.0,
            w: 0.8,
            h: 0.3,
            fontSize: 10,
            fontFace: 'Arial',
            color: '999999',
            align: 'right'
          });

          // === Editable "Analyst Comments" area (bottom-right) ===
          // Layout wide ~13.33in x 7.5in. Place a 3.6in-wide note box at ~9.6,5.55
          slide.addText('Analyst Comments:', {
            x: 9.6,
            y: 5.55,
            w: 3.6,
            h: 0.3,
            fontFace: 'Arial',
            fontSize: 12,
            bold: true,
            color: 'FFFFFF',
            align: 'left'
          });
          slide.addText('Click to type your notes…', {
            x: 9.6,
            y: 5.85,
            w: 3.6,
            h: 1.6,
            shape: 'rect',
            fill: { color: 'FFFFFF' },
            line: { color: 'CCCCCC' },
            margin: 0.08, // inner padding (in)
            fontFace: 'Arial',
            fontSize: 12,
            color: '000000',
            align: 'left',
            valign: 'top',
            wrap: true
          });

          // Optional: also put an empty Notes pane entry (editable in PPT Notes)
          // slide.addNotes('Analyst Notes: ');

          // Clean up React mount between slides
          try {
            ReactDOM.unmountComponentAtNode?.(contentContainer);
          } catch (_) {}
        } catch (slideError) {
          console.error(`Error processing slide ${i + 1}:`, slideError);
          const errorSlide = pptx.addSlide();
          errorSlide.addText(`Error loading slide: ${slides[i].title || ''}`, {
            x: 1,
            y: 3,
            w: 11,
            h: 2,
            fontSize: 24,
            fontFace: 'Arial',
            color: 'FF0000',
            align: 'center'
          });
          errorSlide.addText(
            'Please try again or contact support if the issue persists.',
            {
              x: 1,
              y: 4,
              w: 11,
              h: 1,
              fontSize: 14,
              fontFace: 'Arial',
              color: '666666',
              align: 'center'
            }
          );
        }
      }

      // Remove hidden container
      if (hiddenContainer && hiddenContainer.parentNode) {
        hiddenContainer.parentNode.removeChild(hiddenContainer);
      }

      setCurrentStep('Generating PowerPoint file…');
      setProgress(90);

      const timestamp = new Date().toISOString().split('T')[0];
      const safeOpp = (selectedOpposition || 'Opposition')
        .replace(/\s+/g, '_')
        .replace(/[^\w\-]+/g, '');
      const filename = `IPL_Opposition_Analysis_${safeOpp}_${timestamp}.pptx`;

      await pptx.writeFile({ fileName: filename });

      setProgress(100);
      setCurrentStep('Complete!');
      setTimeout(() => {
        alert(`PowerPoint generated successfully: ${filename}`);
        onClose?.();
      }, 600);
    } catch (err) {
      console.error('Error generating PowerPoint:', err);
      alert('Error generating PowerPoint. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
      // Safety cleanup
      const ctnr = hiddenSlideRef.current;
      if (ctnr && ctnr.parentNode) {
        try {
          ctnr.parentNode.removeChild(ctnr);
        } catch (_) {}
      }
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
                This will capture optimized screenshots of all{' '}
                {slides?.length || 0} slides. Content is auto-scaled to fit the
                full slide (no cropping) and an editable “Analyst Comments” box
                is added to each slide.
              </p>

              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-teal-400 mb-2">
                  What&apos;s included:
                </h3>
                <ul className="text-sm text-gray-300 text-left space-y-1">
                  <li>• High-resolution 16:9 export (1920×1080)</li>
                  <li>• Auto-fit scaling (no bottom cut-off)</li>
                  <li>• Exact app colors/formatting</li>
                  <li>• Editable “Analyst Comments” text box</li>
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
                  />
                </div>
                <div className="text-sm text-gray-400">
                  {Math.round(progress)}% complete
                </div>
              </div>

              <div className="text-sm text-gray-400">
                Please wait while we capture screenshots and generate your
                presentation...
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotModal;
