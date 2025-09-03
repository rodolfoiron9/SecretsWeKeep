import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { Track } from '../types';

const PLAYER_STATE_KEY = 'rudybtz-player-state';

interface SavedPlayerState {
  track: Track;
  time: number;
}

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isPlayerVisible: boolean;
  playTrack: (track: Track) => void;
  closePlayer: () => void;
  togglePlayPause: () => void;
  updatePlaybackTime: (time: number) => void;
  initialTime: number;
}

export const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [initialTime, setInitialTime] = useState(0);

  useEffect(() => {
    try {
      const savedStateRaw = localStorage.getItem(PLAYER_STATE_KEY);
      if (savedStateRaw) {
        const savedState: SavedPlayerState = JSON.parse(savedStateRaw);
        if (savedState.track) {
          setCurrentTrack(savedState.track);
          setInitialTime(savedState.time || 0);
          setIsPlayerVisible(true);
          // Do not set isPlaying to true, to prevent auto-play on refresh
        }
      }
    } catch (error) {
      console.error("Could not load player state:", error);
      localStorage.removeItem(PLAYER_STATE_KEY);
    }
  }, []);


  const playTrack = useCallback((track: Track) => {
    // If it's the same track, just toggle play/pause
    if (currentTrack?.id === track.id) {
        setIsPlaying(prev => !prev);
    } else {
        setCurrentTrack(track);
        setIsPlaying(true);
        setIsPlayerVisible(true);
        setInitialTime(0);
        localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify({ track, time: 0 }));
    }
  }, [currentTrack]);

  const closePlayer = useCallback(() => {
    setIsPlaying(false);
    setIsPlayerVisible(false);
    localStorage.removeItem(PLAYER_STATE_KEY);
    // Give time for closing animation before clearing track
    setTimeout(() => {
      setCurrentTrack(null);
    }, 300);
  }, []);

  const togglePlayPause = useCallback(() => {
    if(!currentTrack) return;
    setIsPlaying(prev => !prev);
  }, [currentTrack]);

  const updatePlaybackTime = useCallback((time: number) => {
    if (currentTrack) {
      const state: SavedPlayerState = { track: currentTrack, time };
      localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(state));
    }
  }, [currentTrack]);

  const value = { currentTrack, isPlaying, isPlayerVisible, playTrack, closePlayer, togglePlayPause, updatePlaybackTime, initialTime };

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
