import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { DesignStyle, DesignerPersona, RoomImage } from '../types';

interface UploadScreenProps {
  onGenerate: (image: RoomImage, style: DesignStyle, persona: DesignerPersona) => void;
}

const STYLES: DesignStyle[] = [
  'Modern', 'Minimalist', 'Industrial', 'Bohemian', 
  'Scandinavian', 'Mid-Century Modern', 'Classic/Traditional', 
  'Japandi', 'Art Deco'
];

const PERSONAS: DesignerPersona[] = [
  'The Minimalist Guru',
  'The Color Maximalist',
  'The Vintage Curator',
  'The Luxury Specialist',
  'The Eco-Friendly Innovator'
];

export const UploadScreen: React.FC<UploadScreenProps> = ({ onGenerate }) => {
  const [image, setImage] = useState<RoomImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<DesignStyle>('Modern');
  const [persona, setPersona] = useState<DesignerPersona>('The Luxury Specialist');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      
      const base64Data = result.split(',')[1];
      setImage({
        data: base64Data,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f9f8f6]">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-serif mb-6 text-[#1a1a1a] leading-tight">
            Reimagine <br/>
            <span className="italic text-[#8c7a6b]">Your Space</span>
          </h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Upload a photo of your room and let our AI interior designers transform it while preserving your existing layout and furniture.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">
                Design Style
              </label>
              <select 
                value={style}
                onChange={(e) => setStyle(e.target.value as DesignStyle)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8c7a6b] focus:border-transparent outline-none transition-all"
              >
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">
                Designer Persona
              </label>
              <select 
                value={persona}
                onChange={(e) => setPersona(e.target.value as DesignerPersona)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8c7a6b] focus:border-transparent outline-none transition-all"
              >
                {PERSONAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div 
            className={`flex-1 min-h-[400px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all ${previewUrl ? 'border-[#8c7a6b] bg-white' : 'border-gray-300 hover:border-[#8c7a6b] hover:bg-white/50 cursor-pointer'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            {previewUrl ? (
              <div className="relative w-full h-full group">
                <img 
                  src={previewUrl} 
                  alt="Room preview" 
                  className="w-full h-full object-cover rounded-xl shadow-sm"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewUrl(null);
                    setImage(null);
                  }}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                  <Upload size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#f0edea] rounded-full flex items-center justify-center mx-auto mb-4 text-[#8c7a6b]">
                  <ImageIcon size={32} />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-1">Upload Room Photo</p>
                <p className="text-sm text-gray-500">Drag and drop or click to browse</p>
              </div>
            )}
          </div>

          <button
            onClick={() => image && onGenerate(image, style, persona)}
            disabled={!image}
            className="mt-6 w-full py-4 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={20} />
            Generate Design Plan
          </button>
        </div>
      </div>
    </div>
  );
};
