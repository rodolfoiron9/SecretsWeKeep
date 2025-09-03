import React, { useEffect, useRef, useState } from 'react';
import { VisualizerPreset, Track } from '../types';
import { VisualizerIcon } from './icons';

interface CubeVisualizerProps {
  track: Track | null;
  preset: VisualizerPreset | null;
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

// Singleton AudioContext
let audioContext: AudioContext | null = null;
let audioSource: MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;


const CubeVisualizer: React.FC<CubeVisualizerProps> = ({ track, preset, audioElement, isPlaying }) => {
  const cubeRef = useRef<HTMLDivElement>(null);
  // FIX: Initialize useRef with null. `useRef<number>()` is invalid as it requires an initial value of type number.
  const animationFrameId = useRef<number | null>(null);
  
  const cubeStyle = preset?.cubeStyle || 'wireframe';
  
  useEffect(() => {
    if (audioElement && isPlaying) {
      // Initialize AudioContext and nodes
      if (!audioContext) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        } else {
            console.error("AudioContext is not supported in this browser.");
            return;
        }
      }
      if (!audioSource) {
        try {
            audioSource = audioContext.createMediaElementSource(audioElement);
            analyser = audioContext.createAnalyser();
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);
        } catch (e) {
            console.error("Error setting up audio source:", e);
            // This can happen if the audio element is from a different origin without CORS,
            // or if the source has already been created for this element.
            return;
        }
      }
      analyser!.fftSize = 256;
      const bufferLength = analyser!.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animate = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        
        // Simple bass detection (average of first few frequency bins)
        const bassAmount = (dataArray[0] + dataArray[1] + dataArray[2] + dataArray[3]) / 4;
        const bassScaleFactor = preset?.frequencyReactions.bassScale || 50;
        const scale = 1 + (bassAmount / 255) * (bassScaleFactor / 100);
        
        if (cubeRef.current) {
          cubeRef.current.style.transform = `scale3d(${scale}, ${scale}, ${scale})`;
        }
        
        animationFrameId.current = requestAnimationFrame(animate);
      };

      animate();

    } else {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [audioElement, isPlaying, preset]);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-30 p-8 perspective-1000">
        <div className="w-64 h-64 md:w-96 md:h-96 relative cube-container">
            <div ref={cubeRef} className={`cube ${cubeStyle}`}>
                <div className="face front">RUDY</div>
                <div className="face back">BTZ</div>
                <div className="face right"><VisualizerIcon /></div>
                <div className="face left"><VisualizerIcon /></div>
                <div className="face top"></div>
                <div className="face bottom"></div>
            </div>
        </div>
        {track && (
            <div className="text-center mt-8 z-10">
                <h2 className="text-3xl font-bold font-orbitron">{track.title}</h2>
                <p className="text-lg text-gray-300">Now Playing</p>
            </div>
        )}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .cube-container { transform-style: preserve-3d; animation: rotate-cube 20s infinite linear; }
        .cube { 
            position: absolute; 
            width: 100%; 
            height: 100%; 
            transform-style: preserve-3d;
            transition: transform 0.1s ease-out; /* Smooth scaling */
        }
        .face { position: absolute; width: 100%; height: 100%; border: 2px solid var(--primary-color, #7F00FF); background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; font-family: 'Orbitron', sans-serif; color: var(--secondary-color, #00FFFF); text-shadow: 0 0 10px var(--secondary-color, #00FFFF);}
        .cube.wireframe .face { background: transparent; }
        .cube.metallic .face { background: linear-gradient(45deg, #7d7d7d, #ffffff, #7d7d7d); color: #1a1a2e; text-shadow: none; border-color: #fff;}
        .cube.glass .face { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .front  { transform: rotateY(0deg) translateZ(128px); }
        .back   { transform: rotateY(180deg) translateZ(128px); }
        .right  { transform: rotateY(90deg) translateZ(128px); }
        .left   { transform: rotateY(-90deg) translateZ(128px); }
        .top    { transform: rotateX(90deg) translateZ(128px); }
        .bottom { transform: rotateX(-90deg) translateZ(128px); }
        @media (min-width: 768px) {
          .front  { transform: rotateY(0deg) translateZ(192px); }
          .back   { transform: rotateY(180deg) translateZ(192px); }
          .right  { transform: rotateY(90deg) translateZ(192px); }
          .left   { transform: rotateY(-90deg) translateZ(192px); }
          .top    { transform: rotateX(90deg) translateZ(192px); }
          .bottom { transform: rotateX(-90deg) translateZ(192px); }
        }
        @keyframes rotate-cube { from { transform: rotateY(0deg) rotateX(0deg); } to { transform: rotateY(360deg) rotateX(360deg); } }
      `}</style>
    </div>
  );
};

export default CubeVisualizer;
