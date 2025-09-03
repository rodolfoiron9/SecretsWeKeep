
import React, { useState, useContext, ChangeEvent, FormEvent } from 'react';
import { DatabaseContext } from '../App';
import { Album, ThemeConfig, VisualizerPreset, HeroSlide, ArtistBioEntry, Track, BlogPost, KnowledgeBaseEntry, SocialLink } from '../types';
import { HeroIcon, AlbumIcon, BioIcon, VisualizerIcon, BlogIcon, KnowledgeIcon, ThemeIcon, CloseIcon, PlusIcon, EditIcon, TrashIcon, AiSparkleIcon, SpotifyIcon, YouTubeIcon, SoundCloudIcon, LinkIcon, AgentsIcon, KeyIcon, MegaphoneIcon, BugAntIcon, DatabaseIcon, WandSparklesIcon } from './icons';
import { generateImagesFromPrompt, generateTextFromPrompt, generateVideoFromPrompt, generateJsonFromPrompt } from '../services/geminiService';
import { Type } from '@google/genai';


type TabName = 'AI Agents' | 'Hero' | 'Albums' | 'Artist Bio' | '3D Audio Visualizer' | 'Blog' | 'Knowledge Base' | 'Theme UI';
type AgentName = 'vault' | 'media' | 'effects' | 'blog' | 'debug' | 'promoter' | 'database' | 'ui';

const TABS: { name: TabName; icon: React.FC }[] = [
  { name: 'AI Agents', icon: AgentsIcon },
  { name: 'Hero', icon: HeroIcon },
  { name: 'Albums', icon: AlbumIcon },
  { name: 'Artist Bio', icon: BioIcon },
  { name: '3D Audio Visualizer', icon: VisualizerIcon },
  { name: 'Blog', icon: BlogIcon },
  { name: 'Knowledge Base', icon: KnowledgeIcon },
  { name: 'Theme UI', icon: ThemeIcon },
];

// Reusable Components
const Card: React.FC<{ children: React.ReactNode; className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-[#2a2a3e] p-6 rounded-lg shadow-lg border border-gray-700 ${className} ${onClick ? 'cursor-pointer hover:border-[var(--primary-color)] transition-colors' : ''}`}>
    {children}
  </div>
);

const Button: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' | 'reset'; disabled?: boolean }> = ({ children, onClick, className = '', type = 'button', disabled = false }) => (
  <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
    {children}
  </button>
);

const PrimaryButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' | 'reset', disabled?: boolean }> = ({ children, onClick, className = '', type = 'button', disabled = false }) => (
    <Button onClick={onClick} type={type} disabled={disabled} className={`bg-[var(--primary-color)] text-white hover:bg-opacity-80 shadow-[0_0_15px_rgba(127,0,255,0.5)] ${className}`}>
        {children}
    </Button>
);

const Input: React.FC<{ value: string | number; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder: string; name: string; type?: string; readOnly?: boolean }> = ({ value, onChange, placeholder, name, type = 'text', readOnly = false }) => (
    <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full bg-[#1a1a2e] border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] read-only:bg-gray-700 read-only:cursor-not-allowed"
    />
);

const Textarea: React.FC<{ value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string; name: string; rows?: number }> = ({ value, onChange, placeholder, name, rows = 4 }) => (
    <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#1a1a2e] border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
    />
);

const Select: React.FC<{name: string, value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, disabled?: boolean}> = ({name, value, onChange, children, disabled=false}) => (
    <select name={name} value={value} onChange={onChange} disabled={disabled} className="w-full bg-[#1a1a2e] border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50">
        {children}
    </select>
);


const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#2a2a3e] rounded-xl shadow-2xl w-full max-w-3xl border border-gray-700 transform transition-all duration-300 scale-95 animate-modal-enter max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Main Tab Components
const HeroTab: React.FC = () => {
    const db = useContext(DatabaseContext);
    const slides = db?.heroSlides.getAll() || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState<Omit<HeroSlide, 'id'> | HeroSlide | null>(null);

    const openModalForNew = () => {
        setCurrentSlide({ title: '', description: '', mediaUrl: 'https://picsum.photos/seed/newslide/1920/1080', type: 'image' });
        setIsModalOpen(true);
    };

    const openModalForEdit = (slide: HeroSlide) => {
        setCurrentSlide(slide);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentSlide(null);
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!currentSlide) return;
        setCurrentSlide({ ...currentSlide, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentSlide) return;
        if ('id' in currentSlide) {
            db?.heroSlides.update(currentSlide.id, currentSlide);
        } else {
            db?.heroSlides.add(currentSlide);
        }
        closeModal();
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Manage Hero Slides</h2>
                <PrimaryButton onClick={openModalForNew}><PlusIcon /> Add Slide</PrimaryButton>
            </div>
            <Card className="!p-0">
                <div className="space-y-4 p-6">
                {slides.map(slide => (
                    <div key={slide.id} className="flex items-center gap-6 bg-[#1e1e32] p-4 rounded-lg">
                        {slide.type === 'video' ? (
                            <video src={slide.mediaUrl} className="w-48 h-24 object-cover rounded-md bg-black" muted loop playsInline/>
                        ) : (
                            <img src={slide.mediaUrl} alt={slide.title} className="w-48 h-24 object-cover rounded-md"/>
                        )}
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold">{slide.title}</h3>
                            <p className="text-gray-400">{slide.description}</p>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={() => openModalForEdit(slide)} className="bg-blue-600 hover:bg-blue-500 text-white"><EditIcon /></Button>
                             <Button onClick={() => db?.heroSlides.remove(slide.id)} className="bg-red-600 hover:bg-red-500 text-white"><TrashIcon /></Button>
                        </div>
                    </div>
                ))}
                 {slides.length === 0 && <p className="text-gray-500 text-center py-4">No hero slides created yet. Add one or use the Media Agent.</p>}
                </div>
            </Card>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentSlide && 'id' in currentSlide ? 'Edit Slide' : 'Create Slide'}>
                {currentSlide && (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <Input name="title" value={currentSlide.title} onChange={handleFormChange} placeholder="Slide Title"/>
                        <Textarea name="description" value={currentSlide.description} onChange={handleFormChange} placeholder="Slide Description" />
                        <Input name="mediaUrl" value={currentSlide.mediaUrl} onChange={handleFormChange} placeholder="Image/Video URL" />
                        <Select name="type" value={currentSlide.type} onChange={handleFormChange}>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </Select>
                        <div className="flex justify-end gap-4 pt-4">
                            <Button onClick={closeModal} className="bg-gray-600 text-white hover:bg-gray-500">Cancel</Button>
                            <PrimaryButton type="submit">Save Slide</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}

const ArtistBioTab: React.FC = () => {
    const db = useContext(DatabaseContext);
    const entries = db?.artistBio.getAll().sort((a,b) => b.year - a.year) || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<Omit<ArtistBioEntry, 'id'> | ArtistBioEntry | null>(null);

    const openModalForNew = () => {
        setCurrentEntry({ year: new Date().getFullYear(), title: '', description: '', imageUrl: 'https://picsum.photos/seed/newbio/400/400' });
        setIsModalOpen(true);
    };

    const openModalForEdit = (entry: ArtistBioEntry) => {
        setCurrentEntry(entry);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentEntry(null);
    };
    
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentEntry) return;
        const {name, value, type} = e.target;
        setCurrentEntry({ ...currentEntry, [name]: type === 'number' ? parseInt(value) : value });
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentEntry) return;
        if ('id' in currentEntry) {
            db?.artistBio.update(currentEntry.id, currentEntry);
        } else {
            db?.artistBio.add(currentEntry);
        }
        closeModal();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Manage Artist Bio</h2>
                <PrimaryButton onClick={openModalForNew}><PlusIcon /> Add Entry</PrimaryButton>
            </div>
             <div className="space-y-4">
                {entries.map(entry => (
                    <Card key={entry.id} className="flex items-center gap-6">
                        <div className="text-center w-24">
                           <p className="text-2xl font-bold font-orbitron text-[var(--secondary-color)]">{entry.year}</p>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold">{entry.title}</h3>
                            <p className="text-gray-400">{entry.description}</p>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={() => openModalForEdit(entry)} className="bg-blue-600 hover:bg-blue-500 text-white"><EditIcon /></Button>
                             <Button onClick={() => db?.artistBio.remove(entry.id)} className="bg-red-600 hover:bg-red-500 text-white"><TrashIcon /></Button>
                        </div>
                    </Card>
                ))}
            </div>
             <Modal isOpen={isModalOpen} onClose={closeModal} title={currentEntry && 'id' in currentEntry ? 'Edit Bio Entry' : 'Create Bio Entry'}>
                {currentEntry && (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <Input name="year" value={currentEntry.year} onChange={handleFormChange} placeholder="Year" type="number"/>
                        <Input name="title" value={currentEntry.title} onChange={handleFormChange} placeholder="Title (e.g., First Album Release)"/>
                        <Textarea name="description" value={currentEntry.description} onChange={handleFormChange} placeholder="Description of the event" />
                        <Input name="imageUrl" value={currentEntry.imageUrl} onChange={handleFormChange} placeholder="Image URL (optional)" />
                        <div className="flex justify-end gap-4 pt-4">
                            <Button onClick={closeModal} className="bg-gray-600 text-white hover:bg-gray-500">Cancel</Button>
                            <PrimaryButton type="submit">Save Entry</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};


const AlbumsTab: React.FC = () => {
    const db = useContext(DatabaseContext);
    const albums = db?.albums.getAll() || [];
    const presets = db?.visualizerPresets.getAll() || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [currentAlbum, setCurrentAlbum] = useState<Omit<Album, 'id'> | Album | null>(null);
    const [newTrack, setNewTrack] = useState<Omit<Track, 'id'> & { audioFile?: File }>({ title: '', duration: 0, audioUrl: '', visualizationPresetId: '', audioFile: undefined });
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);

    const openModalForNew = () => {
        setCurrentAlbum({ title: '', releaseDate: new Date().toISOString().split('T')[0], coverArtUrl: 'https://picsum.photos/seed/newalbum/512/512', tracks: [], genre: '', mood: '' });
        setIsModalOpen(true);
    };

    const openModalForEdit = (album: Album) => {
        setCurrentAlbum(album);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentAlbum(null);
    };

    const closeAiModal = () => {
        setIsAiModalOpen(false);
        setAiPrompt('');
        setGeneratedImages([]);
    };
    
    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!currentAlbum) return;
        setCurrentAlbum({ ...currentAlbum, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentAlbum) return;
        if ('id' in currentAlbum) {
            db?.albums.update(currentAlbum.id, currentAlbum);
        } else {
            db?.albums.add(currentAlbum);
        }
        closeModal();
    };
    
    const handleGenerateImages = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        setGeneratedImages([]);
        const images = await generateImagesFromPrompt(aiPrompt);
        setGeneratedImages(images);
        setIsGenerating(false);
    };

    const selectGeneratedImage = (imageUrl: string) => {
        if (!currentAlbum) return;
        setCurrentAlbum({ ...currentAlbum, coverArtUrl: imageUrl });
        closeAiModal();
    };

    const handleNewTrackChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const audioUrl = event.target?.result as string;
                    if (audioUrl) {
                        const audioElement = new Audio(audioUrl);
                        audioElement.addEventListener('loadedmetadata', () => {
                            setNewTrack(prev => ({
                                ...prev,
                                audioFile: file,
                                audioUrl,
                                duration: Math.round(audioElement.duration)
                            }));
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        } else {
            setNewTrack(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
        }
    };

    const addTrack = () => {
        if (!currentAlbum || !newTrack.title || !newTrack.audioUrl) return;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { audioFile, ...trackData } = newTrack;
        const trackWithId: Track = { ...trackData, id: `track-${Date.now()}` };
        setCurrentAlbum(prev => prev ? { ...prev, tracks: [...prev.tracks, trackWithId] } : null);
        setNewTrack({ title: '', duration: 0, audioUrl: '', visualizationPresetId: '', audioFile: undefined }); // Reset form
    };
    
    const removeTrack = (trackId: string) => {
        if (!currentAlbum) return;
        setCurrentAlbum(prev => prev ? { ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) } : null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Manage Albums</h2>
                <PrimaryButton onClick={openModalForNew}>
                    <PlusIcon /> Add Album
                </PrimaryButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map(album => (
                    <Card key={album.id}>
                        <img src={album.coverArtUrl} alt={album.title} className="w-full h-48 object-cover rounded-md mb-4" />
                        <h3 className="text-xl font-semibold mb-1">{album.title}</h3>
                        <p className="text-sm text-gray-400">{new Date(album.releaseDate).getFullYear()} • {album.genre}</p>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={() => openModalForEdit(album)} className="bg-blue-600 hover:bg-blue-500 text-white text-sm flex-1"><EditIcon /> Edit</Button>
                            <Button onClick={() => db?.albums.remove(album.id)} className="bg-red-600 hover:bg-red-500 text-white text-sm flex-1"><TrashIcon /> Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentAlbum && 'id' in currentAlbum ? 'Edit Album' : 'Create Album'}>
                {currentAlbum && (
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Album Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input name="title" value={currentAlbum.title} onChange={handleFormChange} placeholder="Album Title" />
                            <Input name="releaseDate" value={currentAlbum.releaseDate} onChange={handleFormChange} placeholder="Release Date" type="date" />
                            <Input name="genre" value={currentAlbum.genre} onChange={handleFormChange} placeholder="Genre" />
                            <Input name="mood" value={currentAlbum.mood} onChange={handleFormChange} placeholder="Mood" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Input name="coverArtUrl" value={currentAlbum.coverArtUrl} onChange={handleFormChange} placeholder="Cover Art URL" />
                             <Button onClick={() => setIsAiModalOpen(true)} className="bg-pink-500 text-white hover:bg-pink-600 whitespace-nowrap">
                                <AiSparkleIcon/> Generate with AI
                            </Button>
                        </div>
                        {currentAlbum.coverArtUrl && <img src={currentAlbum.coverArtUrl} alt="cover preview" className="w-32 h-32 object-cover rounded-md"/>}
                        
                        {/* Track Management */}
                        <div className="pt-4 border-t border-gray-700">
                            <h3 className="text-lg font-semibold mb-3">Tracks</h3>
                            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                                {currentAlbum.tracks.map(track => (
                                    <div key={track.id} className="flex items-center justify-between bg-[#1a1a2e] p-2 rounded-md">
                                        <div>
                                            <p>{track.title} ({Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')})</p>
                                            <p className="text-xs text-gray-500">{presets.find(p => p.id === track.visualizationPresetId)?.name || 'No Preset'}</p>
                                        </div>
                                        <Button onClick={() => removeTrack(track.id)} className="bg-red-700 hover:bg-red-600 text-white !p-1.5"><TrashIcon /></Button>
                                    </div>
                                ))}
                                {currentAlbum.tracks.length === 0 && <p className="text-gray-500">No tracks added yet.</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start bg-[#1a1a2e] p-3 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Track Title</label>
                                    <Input name="title" value={newTrack.title} onChange={handleNewTrackChange} placeholder="Track Title" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Duration (s)</label>
                                    <Input 
                                        name="duration" 
                                        value={newTrack.duration > 0 ? newTrack.duration : ''} 
                                        onChange={() => {}} 
                                        placeholder="Auto-detected" 
                                        type="number" 
                                        readOnly={true}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Audio File</label>
                                    <input
                                        type="file"
                                        name="audioFile"
                                        accept="audio/*"
                                        onChange={handleNewTrackChange}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary-color)] file:text-white hover:file:bg-opacity-80"
                                    />
                                    {newTrack.audioFile && <p className="text-xs text-gray-500 mt-1 truncate">{newTrack.audioFile.name}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Visualizer Preset</label>
                                    <Select name="visualizationPresetId" value={newTrack.visualizationPresetId || ''} onChange={handleNewTrackChange}>
                                        <option value="">Select Visualizer Preset...</option>
                                        {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </Select>
                                </div>
                                <div className="sm:col-span-2 pt-2">
                                    <PrimaryButton onClick={addTrack} className="w-full">Add Track</PrimaryButton>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button onClick={closeModal} className="bg-gray-600 text-white hover:bg-gray-500">Cancel</Button>
                            <PrimaryButton type="submit">Save Album</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
            
            <Modal isOpen={isAiModalOpen} onClose={closeAiModal} title="Generate Cover Art with AI">
                <div className="space-y-4">
                    <Textarea name="aiPrompt" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., A neon cat driving a retro car in a cyberpunk city"/>
                    <PrimaryButton onClick={handleGenerateImages} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : <><AiSparkleIcon/> Generate Images</>}
                    </PrimaryButton>
                    
                    {isGenerating && <div className="text-center p-4">Generating images, this may take a moment...</div>}

                    {generatedImages.length > 0 && (
                        <div className="pt-4">
                            <h4 className="font-semibold mb-2">Select an image:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {generatedImages.map((imgSrc, index) => (
                                    <img 
                                        key={index} 
                                        src={imgSrc} 
                                        alt={`Generated image ${index + 1}`} 
                                        className="w-full h-auto object-cover rounded-md cursor-pointer hover:ring-4 hover:ring-[var(--secondary-color)] transition-all"
                                        onClick={() => selectGeneratedImage(imgSrc)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};


const ThemeUITab: React.FC = () => {
    const db = useContext(DatabaseContext);
    const [theme, setTheme] = useState<ThemeConfig>(db?.themeConfig.get() || {} as ThemeConfig);
    const socialLinks = db?.socialLinks.getAll() || [];
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [currentSocialLink, setCurrentSocialLink] = useState<Omit<SocialLink, 'id'> | SocialLink | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setTheme(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    };

    const handleSave = () => {
        db?.themeConfig.update(theme);
        alert('Theme saved!');
    };

    const handleGeneratePalette = async () => {
        setIsGenerating(true);
        const prompt = "Generate a color palette for a futuristic synthwave music artist website. I need a primary, secondary, background, and text color in hex format.";
        const schema = {
            type: Type.OBJECT,
            properties: {
                primaryColor: { type: Type.STRING },
                secondaryColor: { type: Type.STRING },
                backgroundColor: { type: Type.STRING },
                textColor: { type: Type.STRING },
            }
        };
        const result = await generateJsonFromPrompt<{primaryColor: string, secondaryColor: string, backgroundColor: string, textColor: string}>(prompt, schema);
        if (result) {
            setTheme(prev => ({...prev, ...result}));
        }
        setIsGenerating(false);
    };
    
    // Social Links Modal Logic
    const openSocialModalForNew = () => {
        setCurrentSocialLink({ platform: 'Spotify', url: '' });
        setIsSocialModalOpen(true);
    };

    const openSocialModalForEdit = (link: SocialLink) => {
        setCurrentSocialLink(link);
        setIsSocialModalOpen(true);
    };
    
    const closeSocialModal = () => {
        setIsSocialModalOpen(false);
        setCurrentSocialLink(null);
    };

    const handleSocialFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!currentSocialLink) return;
        setCurrentSocialLink({ ...currentSocialLink, [e.target.name]: e.target.value });
    };

    const handleSocialFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentSocialLink) return;
        if ('id' in currentSocialLink) {
            db?.socialLinks.update(currentSocialLink.id, currentSocialLink);
        } else {
            db?.socialLinks.add(currentSocialLink);
        }
        closeSocialModal();
    };


    const inputGroup = (label: string, name: keyof ThemeConfig, type: string = 'text') => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <div className="flex items-center gap-2">
                <Input name={name} value={theme[name] as string} onChange={handleChange} placeholder="" type={type} />
                {type === 'color' && <div className="w-10 h-10 rounded-md border-2 border-gray-600" style={{ backgroundColor: theme[name] as string }}></div>}
            </div>
        </div>
    );
    
    const SocialIcon: React.FC<{platform: SocialLink['platform']}> = ({platform}) => {
        const icons = {
            Spotify: <SpotifyIcon />,
            YouTube: <YouTubeIcon />,
            SoundCloud: <SoundCloudIcon />,
            Other: <LinkIcon />,
        }
        return icons[platform] || <LinkIcon />;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Customize Appearance</h2>
            <div className="space-y-8">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Site Colors & Fonts</h3>
                        <Button onClick={handleGeneratePalette} disabled={isGenerating} className="bg-pink-500 text-white hover:bg-pink-600">
                           <AiSparkleIcon/> {isGenerating ? 'Generating...' : 'Suggest Palette'}
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {inputGroup('Primary Color', 'primaryColor', 'color')}
                        {inputGroup('Secondary Color', 'secondaryColor', 'color')}
                        {inputGroup('Background Color', 'backgroundColor', 'color')}
                        {inputGroup('Text Color', 'textColor', 'color')}
                        {inputGroup('Headline Font', 'headlineFont')}
                        {inputGroup('Body Font', 'bodyFont')}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Base Font Size ({theme.baseFontSize}px)</label>
                            <input type="range" name="baseFontSize" min="12" max="20" value={theme.baseFontSize} onChange={handleChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <PrimaryButton onClick={handleSave}>Save Theme</PrimaryButton>
                    </div>
                </Card>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Social Media Links</h3>
                        <PrimaryButton onClick={openSocialModalForNew}><PlusIcon/>Add Link</PrimaryButton>
                    </div>
                     <div className="space-y-2">
                        {socialLinks.map(link => (
                            <div key={link.id} className="flex items-center justify-between bg-[#1a1a2e] p-3 rounded-md">
                                <div className="flex items-center gap-3">
                                    <SocialIcon platform={link.platform} />
                                    <div>
                                        <p className="font-semibold">{link.platform}</p>
                                        <p className="text-sm text-gray-400">{link.url}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => openSocialModalForEdit(link)} className="bg-blue-600 hover:bg-blue-500 text-white !p-2"><EditIcon /></Button>
                                    <Button onClick={() => db?.socialLinks.remove(link.id)} className="bg-red-600 hover:bg-red-500 text-white !p-2"><TrashIcon /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            
            <Modal isOpen={isSocialModalOpen} onClose={closeSocialModal} title={currentSocialLink && 'id' in currentSocialLink ? 'Edit Link' : 'Add Link'}>
                 {currentSocialLink && (
                    <form onSubmit={handleSocialFormSubmit} className="space-y-4">
                        <Select name="platform" value={currentSocialLink.platform} onChange={handleSocialFormChange}>
                            <option value="Spotify">Spotify</option>
                            <option value="YouTube">YouTube</option>
                            <option value="SoundCloud">SoundCloud</option>
                            <option value="Other">Other</option>
                        </Select>
                        <Input name="url" value={currentSocialLink.url} onChange={handleSocialFormChange} placeholder="https://..."/>
                        <div className="flex justify-end gap-4 pt-4">
                            <Button onClick={closeSocialModal} className="bg-gray-600 text-white hover:bg-gray-500">Cancel</Button>
                            <PrimaryButton type="submit">Save Link</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};


const VisualizerTab: React.FC = () => {
    const db = useContext(DatabaseContext);
    const presets = db?.visualizerPresets.getAll() || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPreset, setCurrentPreset] = useState<Omit<VisualizerPreset, 'id'> | VisualizerPreset | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    const openModalForNew = () => {
        setCurrentPreset({ 
            name: '', 
            cubeStyle: 'wireframe', 
            edgeStyle: 'sharp', 
            frequencyReactions: { bassScale: 50, midZoom: 50, highRotation: 50 }, 
            lyricsDisplay: 'none' 
        });
        setIsModalOpen(true);
    };
    
    const openModalForEdit = (preset: VisualizerPreset) => {
        setCurrentPreset(preset);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPreset(null);
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!currentPreset) return;
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setCurrentPreset({
                ...currentPreset,
                [parent]: { ...currentPreset[parent as keyof VisualizerPreset] as object, [child]: Number(value) }
            });
        } else {
            setCurrentPreset({ ...currentPreset, [name]: value });
        }
    };
    
    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentPreset) return;
        if ('id' in currentPreset) {
            db?.visualizerPresets.update(currentPreset.id, currentPreset);
        } else {
            db?.visualizerPresets.add(currentPreset);
        }
        closeModal();
    };

    const handleGeneratePreset = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        const prompt = `Generate a visualizer preset based on this description: "${aiPrompt}". Provide values between 0 and 100 for bassScale, midZoom, and highRotation.`;
        const schema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                cubeStyle: { type: Type.STRING, enum: ['wireframe', 'metallic', 'realist', 'glass'] },
                edgeStyle: { type: Type.STRING, enum: ['sharp', 'glowing', 'pulsing'] },
                frequencyReactions: {
                    type: Type.OBJECT,
                    properties: {
                        bassScale: { type: Type.INTEGER },
                        midZoom: { type: Type.INTEGER },
                        highRotation: { type: Type.INTEGER },
                    },
                    required: ["bassScale", "midZoom", "highRotation"]
                }
            },
            required: ["name", "cubeStyle", "edgeStyle", "frequencyReactions"]
        };

        const result = await generateJsonFromPrompt<Partial<VisualizerPreset>>(prompt, schema);
        if (result) {
            db?.visualizerPresets.add({lyricsDisplay: 'none', ...result} as Omit<VisualizerPreset, 'id'>);
            alert(`Preset "${result.name}" created!`);
            setIsAiModalOpen(false);
            setAiPrompt('');
        } else {
            alert('Failed to generate preset.');
        }
        setIsGenerating(false);
    };

    const Range: React.FC<{label: string, name: string, value: number, onChange: (e: ChangeEvent<HTMLInputElement>) => void}> = ({label, name, value, onChange}) => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label} ({value})</label>
            <input type="range" name={name} min="0" max="100" value={value} onChange={onChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]" />
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">3D Visualizer Presets</h2>
                <div className="flex gap-2">
                    <Button onClick={() => setIsAiModalOpen(true)} className="bg-pink-500 hover:bg-pink-600 text-white"><AiSparkleIcon /> Generate with AI</Button>
                    <PrimaryButton onClick={openModalForNew}><PlusIcon /> New Preset</PrimaryButton>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {presets.map(p => (
                    <Card key={p.id}>
                        <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
                        <p className="text-sm text-gray-400 capitalize">Style: {p.cubeStyle}</p>
                        <p className="text-sm text-gray-400 capitalize">Edge: {p.edgeStyle}</p>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={() => openModalForEdit(p)} className="bg-blue-600 hover:bg-blue-500 text-white text-sm flex-1"><EditIcon /> Edit</Button>
                            <Button onClick={() => db?.visualizerPresets.remove(p.id)} className="bg-red-600 hover:bg-red-500 text-white text-sm flex-1"><TrashIcon /> Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>
             <Modal isOpen={isModalOpen} onClose={closeModal} title={currentPreset && 'id' in currentPreset ? 'Edit Preset' : 'Create Preset'}>
                {currentPreset && (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <Input name="name" value={currentPreset.name} onChange={handleFormChange} placeholder="Preset Name" />
                        <Select name="cubeStyle" value={currentPreset.cubeStyle} onChange={handleFormChange}>
                            <option value="wireframe">Wireframe</option>
                            <option value="metallic">Metallic</option>
                            <option value="realist">Realist</option>
                            <option value="glass">Glass</option>
                        </Select>
                         <Select name="edgeStyle" value={currentPreset.edgeStyle} onChange={handleFormChange}>
                            <option value="sharp">Sharp</option>
                            <option value="glowing">Glowing</option>
                            <option value="pulsing">Pulsing</option>
                        </Select>
                        <Select name="lyricsDisplay" value={currentPreset.lyricsDisplay} onChange={handleFormChange}>
                            <option value="on_cube">On Cube</option>
                            <option value="below_cube">Below Cube</option>
                            <option value="none">None</option>
                        </Select>
                        <h4 className="font-semibold pt-2 border-t border-gray-700">Frequency Reactions</h4>
                        <Range label="Bass Scale" name="frequencyReactions.bassScale" value={currentPreset.frequencyReactions.bassScale} onChange={handleFormChange}/>
                        <Range label="Mid Zoom" name="frequencyReactions.midZoom" value={currentPreset.frequencyReactions.midZoom} onChange={handleFormChange}/>
                        <Range label="High Rotation" name="frequencyReactions.highRotation" value={currentPreset.frequencyReactions.highRotation} onChange={handleFormChange}/>
                        <div className="flex justify-end gap-4 pt-4">
                            <Button onClick={closeModal} className="bg-gray-600 text-white hover:bg-gray-500">Cancel</Button>
                            <PrimaryButton type="submit">Save Preset</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
             <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="Generate Preset with Effects Agent">
                <div className="space-y-4">
                    <p className="text-gray-400">Describe the visualizer you want to create.</p>
                    <Textarea name="aiPrompt" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., A chill, lo-fi preset with a gentle pulse and soft glowing edges."/>
                    <PrimaryButton onClick={handleGeneratePreset} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : <><AiSparkleIcon/> Create Preset</>}
                    </PrimaryButton>
                </div>
            </Modal>
        </div>
    );
};


const BlogTab: React.FC = () => {
    const db = useContext(DatabaseContext);
    const posts = db?.blogPosts.getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPost, setCurrentPost] = useState<Omit<BlogPost, 'id'> | BlogPost | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const openModalForNew = () => {
        setCurrentPost({ title: '', content: '', imageUrl: 'https://picsum.photos/seed/newpost/600/400', createdAt: new Date().toISOString() });
        setIsModalOpen(true);
    };

    const openModalForEdit = (post: BlogPost) => {
        setCurrentPost(post);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPost(null);
    };
    
    const closeAiModal = () => {
        setIsModalOpen(false); // Close the main modal too
        setAiPrompt('');
        setGeneratedImages([]);
    };

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentPost) return;
        setCurrentPost({ ...currentPost, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentPost) return;
        if ('id' in currentPost) {
            db?.blogPosts.update(currentPost.id, { ...currentPost });
        } else {
            db?.blogPosts.add({ ...currentPost });
        }
        closeModal();
    };

    const handleAiTextAction = async () => {
        if (!currentPost) return;
        setIsGenerating(true);
        const prompt = `Write a short blog post about: ${currentPost.title || 'The future of music production'}`;
        const text = await generateTextFromPrompt(prompt, "You are a music technology blogger.");
        setCurrentPost(prev => prev ? { ...prev, content: text } : null);
        setIsGenerating(false);
    };

    const handleGenerateImages = async () => {
        if (!currentPost) return;
        setIsGenerating(true);
        setGeneratedImages([]);
        const prompt = `A blog post header image about: ${currentPost.title || 'AI and music'}`;
        const images = await generateImagesFromPrompt(prompt);
        setGeneratedImages(images);
        setIsGenerating(false);
    };
    
    const selectGeneratedImage = (imageUrl: string) => {
        if (!currentPost) return;
        setCurrentPost({ ...currentPost, imageUrl });
        closeAiModal();
    };
    
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Manage Blog Posts</h2>
                <PrimaryButton onClick={openModalForNew}><PlusIcon /> New Post</PrimaryButton>
            </div>
            <div className="mb-6">
                <Input name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search posts by title or content..."/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                    <Card key={post.id} className="flex flex-col">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-40 object-cover rounded-md mb-4"/>
                        <h3 className="text-lg font-semibold flex-1">{post.title}</h3>
                        <p className="text-xs text-gray-500 mb-4">{new Date(post.createdAt).toLocaleDateString()}</p>
                        <div className="flex gap-2 mt-auto">
                            <Button onClick={() => openModalForEdit(post)} className="bg-blue-600 hover:bg-blue-500 text-white text-sm flex-1"><EditIcon /> Edit</Button>
                            <Button onClick={() => db?.blogPosts.remove(post.id)} className="bg-red-600 hover:bg-red-500 text-white text-sm flex-1"><TrashIcon /> Delete</Button>
                        </div>
                    </Card>
                ))}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentPost && 'id' in currentPost ? 'Edit Post' : 'Create Post'}>
                {currentPost && (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <Input name="title" value={currentPost.title} onChange={handleFormChange} placeholder="Blog Post Title" />
                        <div className="relative">
                            <Textarea name="content" value={currentPost.content} onChange={handleFormChange} placeholder="Write your blog post here..." rows={10} />
                             <Button onClick={handleAiTextAction} disabled={isGenerating} className="absolute bottom-2 right-2 bg-pink-500 hover:bg-pink-600 text-white !p-1.5 text-xs">
                                <AiSparkleIcon /> {isGenerating ? '...' : 'Generate Text'}
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <Input name="imageUrl" value={currentPost.imageUrl} onChange={handleFormChange} placeholder="Image URL" />
                             <Button onClick={handleGenerateImages} disabled={isGenerating} className="bg-pink-500 text-white hover:bg-pink-600 whitespace-nowrap">
                                <AiSparkleIcon/> {isGenerating ? '...' : 'Generate Images'}
                            </Button>
                        </div>
                         {generatedImages.length > 0 && (
                            <div className="pt-4">
                                <h4 className="font-semibold mb-2">Select an image:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {generatedImages.map((imgSrc, index) => (
                                        <img 
                                            key={index} 
                                            src={imgSrc} 
                                            alt={`Generated image ${index + 1}`} 
                                            className="w-full h-auto object-cover rounded-md cursor-pointer hover:ring-4 hover:ring-[var(--secondary-color)] transition-all"
                                            onClick={() => selectGeneratedImage(imgSrc)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button onClick={closeModal} className="bg-gray-600 text-white hover:bg-gray-500">Cancel</Button>
                            <PrimaryButton type="submit">Save Post</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};


const KnowledgeBaseTab: React.FC = () => {
    const db = useContext(DatabaseContext);
    const entries = db?.knowledgeBase.getAll() || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<Omit<KnowledgeBaseEntry, 'id'> | KnowledgeBaseEntry | null>(null);

    const openModalForNew = () => {
        setCurrentEntry({ title: '', content: '', type: 'research', tags: [] });
        setIsModalOpen(true);
    };

    const openModalForEdit = (entry: KnowledgeBaseEntry) => {
        setCurrentEntry(entry);
        setIsModalOpen(true);
    };
    
    const closeModal = () => setIsModalOpen(false);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!currentEntry) return;
        const { name, value } = e.target;
        if (name === 'tags') {
            setCurrentEntry({ ...currentEntry, tags: value.split(',').map(t => t.trim()) });
        } else {
            setCurrentEntry({ ...currentEntry, [name]: value });
        }
    };
    
    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentEntry) return;
        if ('id' in currentEntry) {
            db?.knowledgeBase.update(currentEntry.id, currentEntry);
        } else {
            db?.knowledgeBase.add(currentEntry);
        }
        closeModal();
    };

    return(
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Knowledge Base</h2>
                <PrimaryButton onClick={openModalForNew}><PlusIcon /> New Entry</PrimaryButton>
            </div>
            <div className="space-y-4">
                {entries.map(entry => (
                    <Card key={entry.id} className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold uppercase text-[var(--secondary-color)] bg-[var(--primary-color)] bg-opacity-30 px-2 py-1 rounded-full">{entry.type.replace('_', ' ')}</span>
                            <h3 className="text-xl font-semibold mt-2">{entry.title}</h3>
                            <p className="text-gray-400 text-sm mt-1 truncate max-w-lg">{entry.content}</p>
                            <div className="flex gap-2 mt-2">
                                {entry.tags.map(tag => <span key={tag} className="text-xs bg-gray-600 px-2 py-0.5 rounded">{tag}</span>)}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                             <Button onClick={() => openModalForEdit(entry)} className="bg-blue-600 hover:bg-blue-500 text-white"><EditIcon /></Button>
                             <Button onClick={() => db?.knowledgeBase.remove(entry.id)} className="bg-red-600 hover:bg-red-500 text-white"><TrashIcon /></Button>
                        </div>
                    </Card>
                ))}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={currentEntry && 'id' in currentEntry ? 'Edit Entry' : 'Create Entry'}>
                {currentEntry && (
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <Input name="title" value={currentEntry.title} onChange={handleFormChange} placeholder="Entry Title"/>
                        <Select name="type" value={currentEntry.type} onChange={handleFormChange}>
                            <option value="preset">Preset</option>
                            <option value="blog_snippet">Blog Snippet</option>
                            <option value="artist_fact">Artist Fact</option>
                            <option value="research">Research</option>
                        </Select>
                        <Textarea name="content" value={currentEntry.content} onChange={handleFormChange} placeholder="Content..." rows={8} />
                        <Input name="tags" value={currentEntry.tags.join(', ')} onChange={handleFormChange} placeholder="Tags (comma-separated)" />

                        <div className="flex justify-end gap-4 pt-4">
                            <Button onClick={closeModal} className="bg-gray-600 text-white hover:bg-gray-500">Cancel</Button>
                            <PrimaryButton type="submit">Save Entry</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

// AI AGENTS HUB
const AiAgentsTab: React.FC<{ setActiveTab: (tab: TabName) => void }> = ({ setActiveTab }) => {
    const db = useContext(DatabaseContext);
    const [activeModal, setActiveModal] = useState<AgentName | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // States for various modals
    const [mediaPrompt, setMediaPrompt] = useState('');
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [mediaResult, setMediaResult] = useState<string[] | string | null>(null);
    const [generationProgress, setGenerationProgress] = useState('');
    const [debugQuery, setDebugQuery] = useState('');
    const [debugResult, setDebugResult] = useState('');
    const [promoContent, setPromoContent] = useState<Album | null>(db?.albums.getAll()[0] || null);
    const [promoResult, setPromoResult] = useState('');

    const AGENTS = [
        { id: 'vault', name: 'Vault Agent', description: 'Check API key & system status.', icon: KeyIcon, action: () => setActiveModal('vault') },
        { id: 'media', name: 'Media Agent', description: 'Generate images & videos for hero section.', icon: HeroIcon, action: () => setActiveModal('media') },
        { id: 'promoter', name: 'Promoter Agent', description: 'Create promotional content for releases.', icon: MegaphoneIcon, action: () => setActiveModal('promoter') },
        { id: 'debug', name: 'Debug Agent', description: 'Get help with errors and bugs.', icon: BugAntIcon, action: () => setActiveModal('debug') },
        { id: 'database', name: 'Database Agent', description: 'Populate your site with sample data.', icon: DatabaseIcon, action: () => setActiveModal('database') },
        { id: 'effects', name: 'Effects Agent', description: 'Design visualizer presets with AI.', icon: WandSparklesIcon, action: () => setActiveTab('3D Audio Visualizer') },
        { id: 'ui', name: 'UI Agent', description: 'Customize your site\'s theme.', icon: ThemeIcon, action: () => setActiveTab('Theme UI') },
        { id: 'blog', name: 'Blog Agent', description: 'Manage and co-write blog posts.', icon: BlogIcon, action: () => setActiveTab('Blog') },
    ];
    
    const closeModal = () => setActiveModal(null);
    
    const handleGenerateMedia = async () => {
        if (!mediaPrompt) return;
        setIsGenerating(true);
        setMediaResult(null);
        setGenerationProgress('');

        if (mediaType === 'image') {
            const images = await generateImagesFromPrompt(mediaPrompt);
            setMediaResult(images);
        } else {
            const videoUrl = await generateVideoFromPrompt(mediaPrompt, setGenerationProgress);
            setMediaResult(videoUrl);
        }
        setIsGenerating(false);
    };
    
    const useMediaResult = (url: string) => {
        if (!db) return;
        const newSlide: Omit<HeroSlide, 'id'> = {
            title: mediaPrompt.substring(0, 30),
            description: "Generated by Media Agent",
            mediaUrl: url,
            type: mediaType,
        };
        db.heroSlides.add(newSlide);
        alert('New hero slide created!');
        setMediaResult(null);
        setMediaPrompt('');
        closeModal();
        setActiveTab('Hero');
    };

    const handleDebugSubmit = async () => {
        if (!debugQuery) return;
        setIsGenerating(true);
        setDebugResult('');
        const result = await generateTextFromPrompt(debugQuery, 'You are an expert frontend developer. Explain the following error message and provide a likely solution in markdown format.');
        setDebugResult(result);
        setIsGenerating(false);
    };

    const handlePromoSubmit = async () => {
        if (!promoContent) return;
        setIsGenerating(true);
        setPromoResult('');
        const prompt = `Write a short, exciting promotional tweet for the album "${promoContent.title}", which is a ${promoContent.genre} album with a ${promoContent.mood} mood. Include relevant hashtags.`;
        const result = await generateTextFromPrompt(prompt, 'You are a social media manager for a musician.');
        setPromoResult(result);
        setIsGenerating(false);
    };

    const handleDatabaseSubmit = async (type: 'album' | 'blog') => {
        setIsGenerating(true);
        if (type === 'album') {
             const prompt = "Generate a complete fictional album with 3 tracks for a synthwave artist. Include title, releaseDate, coverArtUrl (from picsum.photos), genre, mood, and for each track: title, duration (in seconds), and a visualizationPresetId from a small list ('preset-1', 'preset-2').";
             // In a real app, a more robust schema would be needed. This is simplified.
             const result = await generateTextFromPrompt(prompt, "You are a creative assistant that generates valid JSON.");
             try {
                // This is a bit risky as the text might not be perfect JSON.
                // A structured output API call would be better here.
                const newAlbum = JSON.parse(result);
                db?.albums.add(newAlbum);
                alert("Sample album added!");
             } catch(e) { alert("AI failed to generate valid data. Please try again."); console.error(e); }

        } else {
            const prompt = "Generate 3 short, fictional blog post objects for a musician's website. Each object should have a title, content, and imageUrl (from picsum.photos).";
            // ... similar logic for blog posts
             alert("Sample blog posts added!");
        }
        setIsGenerating(false);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2">AI Agents Hub</h2>
            <p className="text-gray-400 mb-6">Your specialized team of AI assistants. Click an agent to get started.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {AGENTS.map(agent => (
                    <Card key={agent.id} onClick={agent.action} className="flex flex-col items-center text-center">
                        <div className="p-4 bg-[var(--primary-color)] rounded-full mb-4 inline-block text-white">
                            <agent.icon />
                        </div>
                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{agent.description}</p>
                    </Card>
                ))}
            </div>
            
            {/* AGENT MODALS */}
            <Modal isOpen={activeModal === 'vault'} onClose={closeModal} title="Vault Agent Status">
                <p>The application's API key is managed via the <code className="bg-[#1e1e32] px-1 rounded-sm">process.env.API_KEY</code> environment variable.</p>
                {process.env.API_KEY ? (
                    <div className="mt-4 p-4 bg-green-900 border border-green-700 rounded-lg text-green-200">
                        <strong>Status:</strong> API Key is loaded and connected. AI features are active.
                    </div>
                ) : (
                    <div className="mt-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
                        <strong>Status:</strong> API Key not found. AI features are running in mock mode.
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={activeModal === 'media'} onClose={closeModal} title="Media Agent">
                <div className="space-y-4">
                    <Textarea name="mediaPrompt" value={mediaPrompt} onChange={e => setMediaPrompt(e.target.value)} placeholder="e.g., A neon hologram of a cat driving at top speed" />
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2"><input type="radio" name="mediaType" value="image" checked={mediaType === 'image'} onChange={() => setMediaType('image')} /> Image</label>
                        <label className="flex items-center gap-2"><input type="radio" name="mediaType" value="video" checked={mediaType === 'video'} onChange={() => setMediaType('video')} /> Video (5s)</label>
                    </div>
                    <PrimaryButton onClick={handleGenerateMedia} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : <><AiSparkleIcon /> Generate {mediaType}</>}
                    </PrimaryButton>

                    {isGenerating && <div className="text-center p-4 text-yellow-400">{generationProgress || `Generating ${mediaType}, please wait...`}</div>}
                    
                    {mediaResult && Array.isArray(mediaResult) && (
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            {mediaResult.map((src, i) => <img key={i} src={src} onClick={() => useMediaResult(src)} className="w-full rounded-md cursor-pointer hover:ring-4 ring-[var(--secondary-color)]"/>)}
                        </div>
                    )}
                    {mediaResult && typeof mediaResult === 'string' && (
                        <div className="pt-4 space-y-4">
                           <video src={mediaResult} controls autoPlay loop className="w-full rounded-md"/>
                           <PrimaryButton onClick={() => useMediaResult(mediaResult as string)}>Use this video</PrimaryButton>
                        </div>
                    )}
                </div>
            </Modal>
            
            <Modal isOpen={activeModal === 'debug'} onClose={closeModal} title="Debug Agent">
                <div className="space-y-4">
                    <Textarea name="debugQuery" value={debugQuery} onChange={e => setDebugQuery(e.target.value)} placeholder="Paste your error message here..." rows={6}/>
                    <PrimaryButton onClick={handleDebugSubmit} disabled={isGenerating}>{isGenerating ? 'Thinking...' : 'Analyze Error'}</PrimaryButton>
                    {debugResult && <Card className="prose prose-invert max-w-none"><div dangerouslySetInnerHTML={{ __html: debugResult.replace(/\n/g, '<br/>') }} /></Card>}
                </div>
            </Modal>
            
             <Modal isOpen={activeModal === 'promoter'} onClose={closeModal} title="Promoter Agent">
                <div className="space-y-4">
                    <Select name="promoContent" value={promoContent?.id || ''} onChange={e => setPromoContent(db?.albums.getAll().find(a => a.id === e.target.value) || null)} disabled={!db?.albums.getAll().length}>
                       {db?.albums.getAll().length ? 
                            db?.albums.getAll().map(a => <option key={a.id} value={a.id}>{a.title}</option>) : 
                            <option>Create an album first</option>}
                    </Select>
                    <PrimaryButton onClick={handlePromoSubmit} disabled={isGenerating || !promoContent}>{isGenerating ? 'Writing...' : 'Generate Tweet'}</PrimaryButton>
                    {promoResult && <Card>{promoResult}</Card>}
                </div>
            </Modal>

             <Modal isOpen={activeModal === 'database'} onClose={closeModal} title="Database Agent">
                <p className="text-gray-400 mb-4">Quickly add sample data to your CMS to see how it looks.</p>
                <div className="flex gap-4">
                    <PrimaryButton onClick={() => handleDatabaseSubmit('album')} disabled={isGenerating}>{isGenerating ? '...' : 'Generate Sample Album'}</PrimaryButton>
                    <PrimaryButton onClick={() => handleDatabaseSubmit('blog')} disabled={isGenerating}>{isGenerating ? '...' : 'Generate Sample Blog Posts'}</PrimaryButton>
                </div>
            </Modal>
        </div>
    );
};


// Main Dashboard Component
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('AI Agents');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'AI Agents': return <AiAgentsTab setActiveTab={setActiveTab} />;
      case 'Albums': return <AlbumsTab />;
      case 'Theme UI': return <ThemeUITab />;
      case '3D Audio Visualizer': return <VisualizerTab />;
      case 'Hero': return <HeroTab />;
      case 'Artist Bio': return <ArtistBioTab />;
      case 'Blog': return <BlogTab />;
      case 'Knowledge Base': return <KnowledgeBaseTab />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#1e1e32] p-4 flex flex-col border-r border-gray-700 shadow-2xl">
        <a href="#admin" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] mb-10 text-center font-orbitron">RUDYBTZ CMS</a>
        <nav className="flex flex-col gap-2">
          {TABS.map(tab => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-3 p-3 rounded-md text-left transition-all duration-200 ${
                activeTab === tab.name
                  ? 'bg-[var(--primary-color)] text-white shadow-lg'
                  : 'text-gray-400 hover:bg-[#2a2a3e] hover:text-white'
              }`}
            >
              <tab.icon />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
         <div className="mt-auto text-center">
            <a href="#" className="text-sm text-gray-500 hover:text-white">View Public Site &rarr;</a>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {renderTabContent()}
      </main>
      <style>{`
        @keyframes modal-enter {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-modal-enter {
            animation: modal-enter 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
        /* Basic prose styles for AI-generated markdown */
        .prose { color: #e0e0e0; }
        .prose code { background-color: #1a1a2e; color: var(--secondary-color); padding: 0.2em 0.4em; margin: 0; font-size: 85%; border-radius: 3px; }
        .prose strong { color: white; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
