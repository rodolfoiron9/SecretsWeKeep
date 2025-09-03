
export interface Track {
  id: string;
  title: string;
  duration: number; // in seconds
  audioUrl: string;
  visualizationPresetId?: string;
}

export interface Album {
  id: string;
  title: string;
  releaseDate: string; // ISO string for simplicity
  coverArtUrl: string;
  tracks: Track[];
  genre: string;
  mood: string;
}

export interface HeroSlide {
  id: string;
  mediaUrl: string;
  type: 'image' | 'video';
  title: string;
  description: string;
}

export interface ArtistBioEntry {
  id:string;
  year: number;
  title: string;
  description: string;
  imageUrl: string;
}

export interface VisualizerPreset {
  id: string;
  name: string;
  cubeStyle: 'wireframe' | 'metallic' | 'realist' | 'glass';
  edgeStyle: 'sharp' | 'glowing' | 'pulsing';
  frequencyReactions: {
    bassScale: number; // 0-100
    midZoom: number;   // 0-100
    highRotation: number; // 0-100
  };
  lyricsDisplay: 'on_cube' | 'below_cube' | 'none';
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string; // ISO string
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  type: 'preset' | 'blog_snippet' | 'artist_fact' | 'research';
  tags: string[];
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headlineFont: string;
  bodyFont: string;
  baseFontSize: number; // in px
}

export interface SocialLink {
  id: string;
  platform: 'Spotify' | 'YouTube' | 'SoundCloud' | 'Other';
  url: string;
}
