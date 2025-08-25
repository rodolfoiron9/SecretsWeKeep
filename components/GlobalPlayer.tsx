
import React, { useContext, useEffect, useRef } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { DatabaseContext } from '../App';
import CubeVisualizer from './CubeVisualizer';
import { CloseIcon } from './icons';

const GlobalPlayer: React.FC = () => {
  const { isPlayerVisible, currentTrack, closePlayer, isPlaying } = useAudioPlayer();
  const db = useContext(DatabaseContext);
  const presets = db?.visualizerPresets.getAll() || [];
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const preset = presets.find(p => p.id === currentTrack?.visualizationPresetId) || presets[0] || null;

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying && currentTrack) {
        if (audioElement.src !== currentTrack.audioUrl) {
            audioElement.src = currentTrack.audioUrl;
        }
        audioElement.play().catch(e => console.error("Audio play failed:", e));
        audioElement.crossOrigin = "anonymous";
    } else {
        audioElement.pause();
    }
  }, [isPlaying, currentTrack]);
  
  if (!isPlayerVisible && !currentTrack) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center transition-opacity duration-300 ${isPlayerVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <audio ref={audioRef} onEnded={closePlayer} />
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
    </div>
  );
};

export default GlobalPlayer;