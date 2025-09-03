
import React, { useContext, useEffect, useRef, useCallback } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { DatabaseContext } from '../App';
import CubeVisualizer from './CubeVisualizer';
import { CloseIcon, PlayIcon, PauseIcon } from './icons';

const GlobalPlayer: React.FC = () => {
  const { 
    isPlayerVisible, 
    currentTrack, 
    closePlayer, 
    isPlaying,
    togglePlayPause,
    updatePlaybackTime,
    initialTime
  } = useAudioPlayer();
  const db = useContext(DatabaseContext);
  const presets = db?.visualizerPresets.getAll() || [];
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const preset = presets.find(p => p.id === currentTrack?.visualizationPresetId) || presets[0] || null;

  // Effect to control audio playback (play/pause, src change)
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (currentTrack) {
        const isNewSource = audioElement.src !== currentTrack.audioUrl;

        if (isNewSource) {
            audioElement.src = currentTrack.audioUrl;
            // Explicitly load the new source. This helps prevent race conditions.
            audioElement.load();
        }

        // Set the current time from saved state. Modern browsers handle this well
        // even if called immediately after setting the src.
        if (isNewSource && initialTime > 0) {
            audioElement.currentTime = initialTime;
        }

        if (isPlaying) {
            // play() returns a promise. It's good practice to handle it.
            audioElement.play().catch(e => console.error("Audio play failed:", e));
            audioElement.crossOrigin = "anonymous";
        } else {
            audioElement.pause();
        }
    } else {
        // If there's no track, ensure we stop and clear the source.
        audioElement.pause();
        audioElement.src = '';
    }
  }, [isPlaying, currentTrack, initialTime]);


  // Effect to periodically update playback time in localStorage
  useEffect(() => {
    const audioElement = audioRef.current;
    if (isPlaying && audioElement) {
        const intervalId = setInterval(() => {
            updatePlaybackTime(audioElement.currentTime);
        }, 3000); // Save every 3 seconds
        return () => clearInterval(intervalId);
    }
  }, [isPlaying, updatePlaybackTime]);
  
  const handleEnded = useCallback(() => {
    // Ensure final time is reset before closing
    updatePlaybackTime(0);
    closePlayer();
  }, [closePlayer, updatePlaybackTime]);

  
  if (!isPlayerVisible && !currentTrack) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center transition-opacity duration-300 ${isPlayerVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <audio ref={audioRef} onEnded={handleEnded} />
        <div className="absolute top-0 left-0 w-full h-full">
            <CubeVisualizer track={currentTrack} preset={preset} audioElement={audioRef.current} isPlaying={isPlaying} />
        </div>
        <button
            onClick={closePlayer}
            className="absolute top-6 right-6 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors z-20"
            aria-label="Close player"
        >
            <CloseIcon />
        </button>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
             <button
                onClick={togglePlayPause}
                className="text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-75 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
             >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
             </button>
        </div>
    </div>
  );
};

export default GlobalPlayer;
