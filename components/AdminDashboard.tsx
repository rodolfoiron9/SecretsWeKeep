
import React, { useState, useContext, ChangeEvent, FormEvent } from 'react';
import { DatabaseContext } from '../App';
import { Album, ThemeConfig, VisualizerPreset, HeroSlide, ArtistBioEntry, Track, BlogPost, KnowledgeBaseEntry } from '../types';
import { HeroIcon, AlbumIcon, BioIcon, VisualizerIcon, BlogIcon, KnowledgeIcon, ThemeIcon, CloseIcon, PlusIcon, EditIcon, TrashIcon, AiSparkleIcon } from './icons';
import { generateImagesFromPrompt, generateTextFromPrompt } from '../services/geminiService';

type TabName = 'Hero' | 'Albums' | 'Artist Bio' | '3D Audio Visualizer' | 'Blog' | 'Knowledge Base' | 'Theme UI';

const TABS: { name: TabName; icon: React.FC }[] = [
  { name: 'Hero', icon: HeroIcon },
  { name: 'Albums', icon: AlbumIcon },
  { name: 'Artist Bio', icon: BioIcon },
  { name: '3D Audio Visualizer', icon: VisualizerIcon },
  { name: 'Blog', icon: BlogIcon },
  { name: 'Knowledge Base', icon: KnowledgeIcon },
  { name: 'Theme UI', icon: ThemeIcon },
];

// Reusable Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[#2a2a3e] p-6 rounded-lg shadow-lg border border-gray-700 ${className}`}>
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

const Input: React.FC<{ value: string | number; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder: string; name: string; type?: string }> = ({ value, onChange, placeholder, name, type = 'text' }) => (
    <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#1a1a2e] border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
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

const Select: React.FC<{name: string, value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = ({name, value, onChange, children}) => (
    <select name={name} value={value} onChange={onChange} className="w-full bg-[#1a1a2e] border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]">
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
            <div className="space-y-4">
                {slides.map(slide => (
                    <Card key={slide.id} className="flex items-center gap-6">
                        <img src={slide.mediaUrl} alt={slide.title} className="w-48 h-24 object-cover rounded-md"/>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold">{slide.title}</h3>
                            <p className="text-gray-400">{slide.description}</p>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={() => openModalForEdit(slide)} className="bg-blue-600 hover:bg-blue-500 text-white"><EditIcon /></Button>
                             <Button onClick={() => db?.heroSlides.remove(slide.id)} className="bg-red-600 hover:bg-red-500 text-white"><TrashIcon /></Button>
                        </div>
                    </Card>
                ))}
            </div>
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
    const [newTrack, setNewTrack] = useState<Omit<Track, 'id'>>({ title: '', duration: 0, audioUrl: '', visualizationPresetId: '' });
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
        setNewTrack(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const addTrack = () => {
        if (!currentAlbum || !newTrack.title) return;
        const trackWithId: Track = { ...newTrack, id: `track-${Date.now()}` };
        setCurrentAlbum(prev => prev ? { ...prev, tracks: [...prev.tracks, trackWithId] } : null);
        setNewTrack({ title: '', duration: 0, audioUrl: '', visualizationPresetId: '' }); // Reset form
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end bg-[#1a1a2e] p-3 rounded-lg">
                                <Input name="title" value={newTrack.title} onChange={handleNewTrackChange} placeholder="Track Title" />
                                <Input name="duration" value={newTrack.duration} onChange={handleNewTrackChange} placeholder="Duration (s)" type="number" />
                                <div className="sm:col-span-2">
                                <Input name="audioUrl" value={newTrack.audioUrl} onChange={handleNewTrackChange} placeholder="Audio File URL" />
                                </div>
                                <div className="sm:col-span-2">
                                <Select name="visualizationPresetId" value={newTrack.visualizationPresetId || ''} onChange={handleNewTrackChange}>
                                    <option value="">Select Visualizer Preset...</option>
                                    {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </Select>
                                </div>
                                <PrimaryButton onClick={addTrack} className="sm:col-span-2">Add Track</PrimaryButton>
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setTheme(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) : value }));
    };

    const handleSave = () => {
        db?.themeConfig.update(theme);
        alert('Theme saved!');
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

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Customize Theme</h2>
            <Card>
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
        </div>
    );
};


const VisualizerTab: React.FC = () => {
    const db = useContext(DatabaseContext);
    const presets = db?.visualizerPresets.getAll() || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPreset, setCurrentPreset] = useState<Omit<VisualizerPreset, 'id'> | VisualizerPreset | null>(null);

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
                <PrimaryButton onClick={openModalForNew}><PlusIcon /> New Preset</PrimaryButton>
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
        const text = await generateTextFromPrompt(prompt);
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Manage Blog Posts</h2>
                <PrimaryButton onClick={openModalForNew}><PlusIcon /> New Post</PrimaryButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
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


// Main Dashboard Component
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('Albums');

  const renderTabContent = () => {
    switch (activeTab) {
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
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] mb-10 text-center font-orbitron">RUDYBTZ CMS</h1>
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
      `}</style>
    </div>
  );
};

export default AdminDashboard;