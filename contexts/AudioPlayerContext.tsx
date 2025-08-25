import React, { createContext, useState, useCallback, useContext } from 'react';
import { Track } from '../types';

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPlayerVisible: boolean;
  playTrack: (track: Track) => void;
  closePlayer: () => void;
}

export const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setIsPlayerVisible(true);
  }, []);

  const closePlayer = useCallback(() => {
    setIsPlaying(false);
    setIsPlayerVisible(false);
    // Give time for closing animation before clearing track
    setTimeout(() => {
      setCurrentTrack(null);
    }, 300);
  }, []);

  const value = { currentTrack, isPlaying, isPlayerVisible, playTrack, closePlayer };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
