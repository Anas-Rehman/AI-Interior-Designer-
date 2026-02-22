import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DesignPlan, DesignStyle, EditableElement } from '../types';
import { MessageCircle, ArrowLeft, Download, RefreshCw, Sparkles, Loader2, CheckCircle } from 'lucide-react';

interface ResultScreenProps {
  plan: DesignPlan;
  onBack: () => void;
  onOpenChat: () => void;
  onRegenerate: (style: DesignStyle) => void;
  onEditElement: (elementName: string, instruction: string) => Promise<void>;
  onFinishDesign: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ plan, onBack, onOpenChat, onRegenerate, onEditElement, onFinishDesign }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [editInstruction, setEditInstruction] = useState('');
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const currentImage = showOriginal ? plan.originalImage : (plan.generatedImage || plan.originalImage);
  const imageUrl = `data:${currentImage.mimeType};base64,${currentImage.data}`;

  const handleEditSubmit = async () => {
    if (!selectedElement || !editInstruction.trim()) return;
    
    setIsEditing(true);
    
    let finalInstruction = editInstruction;
    if (scale !== 100 || rotation !== 0 || posX !== 0 || posY !== 0) {
      finalInstruction += ` (Adjustments - Scale: ${scale}%, Rotation: ${rotation} degrees, Position Shift: X:${posX}%, Y:${posY}%)`;
    }
    
    await onEditElement(selectedElement.name, finalInstruction);
    setIsEditing(false);
    setSelectedElement(null);
    setEditInstruction('');
    setScale(100);
    setRotation(0);
    setPosX(0);
    setPosY(0);
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col md:flex-row">
      {/* Left Panel: Images */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen sticky top-0 bg-black flex flex-col">
        <div className="flex-1 relative overflow-hidden group">
          <img 
            src={imageUrl} 
            alt="Room" 
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          
          {/* Editable Elements Overlay */}
          {!showOriginal && plan.editableElements && plan.editableElements.map((el, index) => (
            <div
              key={`${el.name}-${index}`}
              style={{
                top: `${el.box.ymin / 10}%`,
                left: `${el.box.xmin / 10}%`,
                height: `${(el.box.ymax - el.box.ymin) / 10}%`,
                width: `${(el.box.xmax - el.box.xmin) / 10}%`,
              }}
              className="absolute border-2 border-transparent hover:border-white/80 hover:bg-white/10 cursor-pointer transition-all group/box"
              onClick={() => setSelectedElement(el)}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/box:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                  Edit {el.name}
                </span>
              </div>
            </div>
          ))}
          
          {plan.generatedImage && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/20 z-10">
              <button
                onClick={() => setShowOriginal(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${showOriginal ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
              >
                Original
              </button>
              <button
                onClick={() => setShowOriginal(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!showOriginal ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
              >
                Redesigned
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="w-full md:w-1/2 h-[50vh] md:h-screen overflow-y-auto p-8 md:p-12 lg:p-16">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-12 uppercase tracking-widest text-xs font-semibold"
        >
          <ArrowLeft size={14} />
          Start Over
        </button>

        <div className="mb-12">
          <p className="text-[#8c7a6b] uppercase tracking-widest text-sm font-semibold mb-3">
            {plan.style} Style
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#1a1a1a] leading-tight mb-4">
            Designed by <br/>
            <span className="italic">{plan.persona}</span>
          </h1>
        </div>

        <div className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:text-[#8c7a6b]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {plan.textPlan}
          </ReactMarkdown>
        </div>

        {/* Alternative Styles Section */}
        {plan.suggestedStyles && plan.suggestedStyles.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h3 className="text-xl font-serif mb-6 text-[#1a1a1a]">Explore Alternative Visions</h3>
            <p className="text-sm text-gray-500 mb-6">Based on your room's architecture, these styles would also look stunning:</p>
            <div className="grid grid-cols-2 gap-4">
              {plan.suggestedStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => onRegenerate(style)}
                  className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-[#8c7a6b]/50 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                >
                  <span className="font-medium text-gray-800">{style}</span>
                  <RefreshCw size={14} className="text-gray-300 group-hover:text-[#8c7a6b] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={onOpenChat}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-[#1a1a1a] text-white px-6 py-3 rounded-full hover:bg-[#2a2a2a] transition-colors font-medium"
            >
              <MessageCircle size={18} />
              Discuss with Designer
            </button>
            <button 
              onClick={onFinishDesign}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#8c7a6b] text-white px-6 py-3 rounded-full hover:bg-[#7a6a5b] transition-colors font-medium"
            >
              <CheckCircle size={18} />
              Finish Design
            </button>
          </div>
          
          <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium">
            <Download size={18} />
            Save Plan
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedElement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-serif mb-4 text-[#1a1a1a]">Edit {selectedElement.name}</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Instruction</label>
              <input
                type="text"
                value={editInstruction}
                onChange={e => setEditInstruction(e.target.value)}
                placeholder={`e.g., Change to dark oak wood...`}
                className="w-full p-3 bg-[#f9f8f6] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8c7a6b]"
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleEditSubmit();
                }}
              />
            </div>

            <div className="space-y-5 mb-8 bg-[#f9f8f6] p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Fine-tuning</h4>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Scale</label>
                  <span className="text-xs text-gray-500">{scale}%</span>
                </div>
                <input type="range" min="50" max="150" value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full accent-[#8c7a6b]" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rotation</label>
                  <span className="text-xs text-gray-500">{rotation}°</span>
                </div>
                <input type="range" min="-180" max="180" value={rotation} onChange={e => setRotation(Number(e.target.value))} className="w-full accent-[#8c7a6b]" />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pos X</label>
                    <span className="text-xs text-gray-500">{posX}</span>
                  </div>
                  <input type="range" min="-50" max="50" value={posX} onChange={e => setPosX(Number(e.target.value))} className="w-full accent-[#8c7a6b]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pos Y</label>
                    <span className="text-xs text-gray-500">{posY}</span>
                  </div>
                  <input type="range" min="-50" max="50" value={posY} onChange={e => setPosY(Number(e.target.value))} className="w-full accent-[#8c7a6b]" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setSelectedElement(null);
                  setScale(100);
                  setRotation(0);
                  setPosX(0);
                  setPosY(0);
                }}
                className="px-4 py-2 text-gray-500 hover:text-gray-800 font-medium"
                disabled={isEditing}
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit}
                disabled={isEditing || !editInstruction.trim()}
                className="px-6 py-2 bg-[#1a1a1a] text-white rounded-xl hover:bg-[#2a2a2a] font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isEditing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isEditing ? 'Applying...' : 'Apply Edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
