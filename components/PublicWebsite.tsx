import React, { useContext, useState, useEffect } from 'react';
import { DatabaseContext } from '../App';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { Album, ArtistBioEntry, HeroSlide, BlogPost, SocialLink } from '../types';
import { AlbumIcon, BioIcon, BlogIcon, LinkIcon, SoundCloudIcon, SpotifyIcon, YouTubeIcon } from './icons';

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#1a1a2e] bg-opacity-80 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
            <nav className="container mx-auto max-w-6xl px-4 py-4 flex justify-between items-center">
                <a href="#" className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]">RudyBtz</a>
                <div className="hidden md:flex gap-6 items-center">
                    <button onClick={() => scrollTo('music')} className="hover:text-[var(--secondary-color)] transition-colors">Music</button>
                    <button onClick={() => scrollTo('bio')} className="hover:text-[var(--secondary-color)] transition-colors">Bio</button>
                    <button onClick={() => scrollTo('blog')} className="hover:text-[var(--secondary-color)] transition-colors">Blog</button>
                </div>
            </nav>
        </header>
    )
}

const Hero: React.FC<{ slides: HeroSlide[] }> = ({ slides }) => {
    const [isTextVisible, setIsTextVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsTextVisible(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (!slides.length) return <div className="h-screen bg-gray-900 flex items-center justify-center"><h2 className="text-2xl">Set a hero slide in the admin panel.</h2></div>;
    const slide = slides[0];

    return (
        <section className="relative h-screen bg-cover bg-center text-white flex items-center justify-center" style={{ backgroundImage: `url(${slide.mediaUrl})` }}>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isTextVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <h1 className="text-6xl md:text-9xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] drop-shadow-[0_0_20px_rgba(127,0,255,0.8)] animate-fade-in-out">
                    RudyBtz
                </h1>
            </div>
            <div className="relative z-10 text-center animate-content-fade-in">
                <h2 className="text-4xl md:text-6xl font-bold font-orbitron">{slide.title}</h2>
                <p className="mt-4 text-lg md:text-xl">{slide.description}</p>
            </div>
             <style>{`
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: scale(0.8); }
                    20% { opacity: 1; transform: scale(1); }
                    80% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.2); }
                }
                .animate-fade-in-out { animation: fade-in-out 5s ease-in-out forwards; }
                
                @keyframes content-fade-in {
                    0% { opacity: 0; }
                    80% { opacity: 0; }
                    100% { opacity: 1; }
                }
                .animate-content-fade-in { animation: content-fade-in 6s ease-in-out forwards; }
            `}</style>
        </section>
    );
};

const AlbumSection: React.FC<{ albums: Album[] }> = ({ albums }) => {
    const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(albums.length > 0 ? albums[0].id : null);
    
    if(!albums.length) return null;

    const handleAlbumClick = (albumId: string) => {
        setSelectedAlbumId(prevId => (prevId === albumId ? null : albumId));
    };
    
    const selectedAlbum = albums.find(a => a.id === selectedAlbumId);

    return (
        <section id="music" className="py-20 px-4 md:px-8 bg-[#151522]">
            <div className="container mx-auto max-w-6xl">
                 <h2 className="text-4xl font-bold font-orbitron text-center mb-12 flex items-center justify-center gap-4"><AlbumIcon /> Discography</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {albums.map((album) => (
                        <div key={album.id} className="text-center" onClick={() => handleAlbumClick(album.id)}>
                            <img 
                                src={album.coverArtUrl} 
                                alt={album.title}
                                className={`w-full rounded-lg shadow-lg aspect-square object-cover cursor-pointer transition-all duration-300 hover:scale-105 ${selectedAlbumId === album.id ? 'ring-4 ring-[var(--primary-color)]' : 'ring-0'}`}
                            />
                            <h3 className="font-semibold mt-3">{album.title}</h3>
                            <p className="text-sm text-gray-400">{new Date(album.releaseDate).getFullYear()}</p>
                        </div>
                    ))}
                </div>

                {selectedAlbum && (
                    <div className="mt-12 bg-[#2a2a3e] p-8 rounded-xl shadow-2xl border border-gray-700">
                         <h3 className="text-3xl font-bold font-orbitron">{selectedAlbum.title}</h3>
                        <p className="text-gray-400 mb-6">{new Date(selectedAlbum.releaseDate).getFullYear()} • {selectedAlbum.genre}</p>
                         <div className="space-y-3">
                            {selectedAlbum.tracks.length > 0 ? selectedAlbum.tracks.map((track, i) => {
                                const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                                return (
                                <button key={track.id} onClick={() => playTrack(track)} className={`w-full flex justify-between items-center p-3 rounded-md transition-colors duration-300 group ${isCurrentlyPlaying ? 'bg-[var(--primary-color)]' : 'bg-[#1a1a2e] hover:bg-opacity-70 hover:bg-[var(--primary-color)]'}`}>
                                    <div className="flex items-center gap-4">
                                        <span className={`${isCurrentlyPlaying ? 'text-white' : 'text-gray-400'} group-hover:text-white`}>{i + 1}</span>
                                        <span className="font-semibold text-white">{track.title}</span>
                                    </div>
                                    <span className={`text-sm ${isCurrentlyPlaying ? 'text-gray-200' : 'text-gray-500'} group-hover:text-gray-200`}>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                                </button>
                                );
                            }) : (
                                <p className="text-gray-500">Tracklist coming soon...</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

const BioSection: React.FC<{ entries: ArtistBioEntry[] }> = ({ entries }) => {
    return (
        <section id="bio" className="py-20 px-4 md:px-8">
             <div className="container mx-auto max-w-4xl">
                 <h2 className="text-4xl font-bold font-orbitron text-center mb-16 flex items-center justify-center gap-4"><BioIcon/> Artist Bio</h2>
                 <div className="relative border-l-2 border-[var(--primary-color)] ml-4 md:ml-0">
                    {entries.map((entry, index) => (
                        <div key={entry.id} className={`mb-12 pl-8 md:pl-12 relative ${index % 2 === 1 ? 'md:ml-[50%]' : ''}`}>
                            <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[var(--secondary-color)] rounded-full border-4 border-[#1a1a2e]"></div>
                            <div className={`p-6 rounded-xl shadow-lg border border-gray-700 bg-[#2a2a3e] ${index % 2 === 1 ? 'md:-ml-12' : ''}`}>
                                <p className="text-xl font-bold font-orbitron text-[var(--secondary-color)]">{entry.year}</p>
                                <h3 className="text-2xl font-bold mt-1">{entry.title}</h3>
                                <p className="mt-2 text-gray-300">{entry.description}</p>
                            </div>
                        </div>
                    ))}
                 </div>
             </div>
        </section>
    );
};

const BlogSection: React.FC<{ posts: BlogPost[] }> = ({ posts }) => {
    if (!posts.length) return null;
    
    return (
        <section id="blog" className="py-20 px-4 md:px-8 bg-[#151522]">
            <div className="container mx-auto max-w-6xl">
                <h2 className="text-4xl font-bold font-orbitron text-center mb-12 flex items-center justify-center gap-4"><BlogIcon /> From the Blog</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.slice(0, 3).map(post => (
                        <div key={post.id} className="bg-[#2a2a3e] rounded-xl shadow-lg border border-gray-700 overflow-hidden group">
                            <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="p-6">
                                <p className="text-sm text-gray-400 mb-2">{new Date(post.createdAt).toLocaleDateString()}</p>
                                <h3 className="text-xl font-bold mb-3 h-14">{post.title}</h3>
                                <p className="text-gray-300 text-sm h-20 overflow-hidden text-ellipsis">{post.content}</p>
                                <a href="#" className="font-semibold text-[var(--secondary-color)] hover:underline mt-4 inline-block">Read More &rarr;</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


const Footer: React.FC = () => {
    const db = useContext(DatabaseContext);
    const socialLinks = db?.socialLinks.getAll() || [];

    const socialIconMap: { [key in SocialLink['platform']]: React.ReactElement } = {
        Spotify: <SpotifyIcon />,
        YouTube: <YouTubeIcon />,
        SoundCloud: <SoundCloudIcon />,
        Other: <LinkIcon />,
    };

    return (
        <footer className="bg-[#1a1a2e] text-center p-8 border-t border-gray-800">
            <div className="flex justify-center gap-6 mb-4">
                {socialLinks.map(link => (
                    <a 
                        key={link.id} 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        className="text-gray-400 hover:text-[var(--primary-color)] transition-transform duration-300 hover:scale-110"
                    >
                        {socialIconMap[link.platform]}
                    </a>
                ))}
            </div>
            <p>&copy; {new Date().getFullYear()} RudyBtz. All rights reserved.</p>
        </footer>
    );
};


const PublicWebsite: React.FC = () => {
    const db = useContext(DatabaseContext);
    
    const albums = db?.albums.getAll().sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()) || [];
    const bioEntries = db?.artistBio.getAll().sort((a,b) => b.year - a.year) || [];
    const slides = db?.heroSlides.getAll() || [];
    const posts = db?.blogPosts.getAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

    return (
        <main>
            <Header />
            <Hero slides={slides} />
            <AlbumSection albums={albums}/>
            <BioSection entries={bioEntries} />
            <BlogSection posts={posts} />
            <Footer />
        </main>
    );
};

export default PublicWebsite;
