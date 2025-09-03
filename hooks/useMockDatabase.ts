
import { useState, useCallback } from 'react';
import { Album, ThemeConfig, VisualizerPreset, HeroSlide, ArtistBioEntry, BlogPost, KnowledgeBaseEntry, Track, SocialLink } from '../types';

// Sample audio - Royalty Free Music from Bensound
const sampleAudio1 = "https://www.bensound.com/bensound-music/bensound-beyondtheline.mp3";
const sampleAudio2 = "https://www.bensound.com/bensound-music/bensound-evolution.mp3";


// Initial data to make the dashboard look populated
const initialAlbums: Album[] = [
  { 
    id: 'album-1', 
    title: 'Cybernetic Dreams', 
    releaseDate: '2023-10-26', 
    coverArtUrl: 'https://picsum.photos/id/101/512/512', 
    tracks: [
        { id: 'track-1', title: 'Neon Run', duration: 185, audioUrl: sampleAudio1, visualizationPresetId: 'preset-1' },
        { id: 'track-2', title: 'Data Stream', duration: 210, audioUrl: sampleAudio2, visualizationPresetId: 'preset-2' }
    ], 
    genre: 'Synthwave', 
    mood: 'Energetic' 
  },
  { id: 'album-2', title: 'Future Echoes', releaseDate: '2024-03-15', coverArtUrl: 'https://picsum.photos/id/123/512/512', tracks: [], genre: 'Techno', mood: 'Introspective' },
];

const initialTheme: ThemeConfig = {
  primaryColor: '#7F00FF',
  secondaryColor: '#00FFFF',
  backgroundColor: '#1a1a2e',
  textColor: '#e0e0e0',
  headlineFont: 'Orbitron',
  bodyFont: 'Inter',
  baseFontSize: 16,
};

const initialPresets: VisualizerPreset[] = [
  { id: 'preset-1', name: 'Cyberpunk Pulse', cubeStyle: 'wireframe', edgeStyle: 'glowing', frequencyReactions: { bassScale: 80, midZoom: 30, highRotation: 50 }, lyricsDisplay: 'on_cube' },
  { id: 'preset-2', name: 'Minimalist Metal', cubeStyle: 'metallic', edgeStyle: 'sharp', frequencyReactions: { bassScale: 60, midZoom: 10, highRotation: 20 }, lyricsDisplay: 'below_cube' },
];

const initialSlides: HeroSlide[] = [
    { id: 'slide-1', mediaUrl: 'https://picsum.photos/seed/slide1/1920/1080', type: 'image', title: 'New Album Out Now', description: 'Listen to Cybernetic Dreams' },
];

const initialBio: ArtistBioEntry[] = [
    { id: 'bio-1', year: 2020, title: 'First Release', description: 'Released first EP on streaming platforms.', imageUrl: 'https://picsum.photos/seed/bio1/400/400' },
];

const initialBlogPosts: BlogPost[] = [
    { id: 'blog-1', title: 'The Rise of AI in Music', content: 'Exploring how AI is changing music production.', imageUrl: 'https://picsum.photos/seed/blog1/600/400', createdAt: new Date().toISOString() },
];

const initialKnowledge: KnowledgeBaseEntry[] = [
    { id: 'kb-1', title: 'Cyberpunk Preset Details', content: 'Technical details of the Cyberpunk Pulse preset.', type: 'preset', tags: ['visualizer', 'cyberpunk'] },
];

const initialSocialLinks: SocialLink[] = [
    { id: 'social-1', platform: 'Spotify', url: 'https://open.spotify.com' },
    { id: 'social-2', platform: 'YouTube', url: 'https://www.youtube.com' },
    { id: 'social-3', platform: 'SoundCloud', url: 'https://soundcloud.com' },
];


export const useMockDatabase = () => {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(initialTheme);
  const [presets, setPresets] = useState<VisualizerPreset[]>(initialPresets);
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [bioEntries, setBioEntries] = useState<ArtistBioEntry[]>(initialBio);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [knowledge, setKnowledge] = useState<KnowledgeBaseEntry[]>(initialKnowledge);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(initialSocialLinks);

  const createId = () => `id-${new Date().getTime()}`;

  const crud = useCallback(<T extends { id: string }>(state: T[], setState: React.Dispatch<React.SetStateAction<T[]>>) => ({
    getAll: () => state,
    add: (item: Omit<T, 'id'>) => {
      const newItem = { ...item, id: createId() } as T;
      setState(prev => [...prev, newItem]);
      return newItem;
    },
    update: (id: string, updatedItem: Partial<T>) => {
      setState(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
    },
    remove: (id: string) => {
      setState(prev => prev.filter(item => item.id !== id));
    },
  }), []);

  return {
    albums: crud(albums, setAlbums),
    themeConfig: {
      get: () => themeConfig,
      update: (newConfig: Partial<ThemeConfig>) => setThemeConfig(prev => ({...prev, ...newConfig})),
    },
    visualizerPresets: crud(presets, setPresets),
    heroSlides: crud(slides, setSlides),
    artistBio: crud(bioEntries, setBioEntries),
    blogPosts: crud(blogPosts, setBlogPosts),
    knowledgeBase: crud(knowledge, setKnowledge),
    socialLinks: crud(socialLinks, setSocialLinks),
  };
};

export type MockDatabase = ReturnType<typeof useMockDatabase>;
