import React, { useState, useRef } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultScreen } from './components/ResultScreen';
import { Chatbot } from './components/Chatbot';
import { ActionPlanScreen } from './components/ActionPlanScreen';
import { DesignStyle, DesignerPersona, RoomImage, DesignPlan, ChatMessage } from './types';
import { generateDesignPlan, generateRedesignedImage, createChatSession, suggestAlternativeStyles, extractEditableElements, editRoomElement, extractSpecificDesignChange, applySpecificEditToImage, generateActionPlan } from './services/geminiService';

export default function App() {
  const [appState, setAppState] = useState<'upload' | 'loading' | 'result' | 'actionPlan'>('upload');
  const [plan, setPlan] = useState<DesignPlan | null>(null);
  const [actionPlanText, setActionPlanText] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const chatSessionRef = useRef<any>(null);

  const handleGenerate = async (image: RoomImage, style: DesignStyle, persona: DesignerPersona) => {
    setAppState('loading');

    try {
      // Run these in parallel for better performance
      const [textPlan, generatedImage, suggestedStyles, editableElements] = await Promise.all([
        generateDesignPlan(image, style, persona),
        generateRedesignedImage(image, style),
        suggestAlternativeStyles(image, style),
        extractEditableElements(image)
      ]);

      const newPlan: DesignPlan = {
        originalImage: image,
        generatedImage,
        textPlan,
        style,
        persona,
        suggestedStyles,
        editableElements
      };

      setPlan(newPlan);

      chatSessionRef.current = createChatSession(image, textPlan, style, persona);
      setChatMessages([
        {
          role: 'model',
          text: `Hello! I'm ${persona}. I've just finished designing your room in the ${style} style. What do you think? Do you have any questions about the materials, colors, or layout?`
        }
      ]);

      setAppState('result');
    } catch (error) {
      console.error("Error generating design:", Object.keys(error as object).length ? error : String(error));
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      alert(`There was an error generating your design: ${error instanceof Error ? error.message : "Unknown error"}. Please check the console.`);
      setAppState('upload');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    const newUserMsg: ChatMessage = { role: 'user', text };
    setChatMessages(prev => [...prev, newUserMsg]);
    setIsChatLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: text });
      const newModelMsg: ChatMessage = { role: 'model', text: response.text };
      setChatMessages(prev => [...prev, newModelMsg]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error processing your request." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleEditElement = async (elementName: string, instruction: string) => {
    if (!plan) return;

    const currentImage = plan.generatedImage || plan.originalImage;

    try {
      const newImage = await editRoomElement(currentImage, elementName, instruction);
      if (newImage) {
        setPlan({
          ...plan,
          generatedImage: newImage
        });
      }
    } catch (error) {
      console.error("Error editing element:", error);
      alert("Failed to apply edit. Please try again.");
    }
  };

  const handleApplySpecificChange = async (messageIndex: number) => {
    if (!plan) return;
    setIsChatLoading(true);

    try {
      const message = chatMessages[messageIndex];
      const changes = await extractSpecificDesignChange(message.text);

      if (!changes) {
        alert("No specific design changes were found in this message to apply.");
        setIsChatLoading(false);
        return;
      }

      const currentImage = plan.generatedImage || plan.originalImage;
      const newImage = await applySpecificEditToImage(currentImage, changes);

      if (newImage) {
        setPlan({
          ...plan,
          generatedImage: newImage
        });
        setChatMessages(prev => [...prev, { role: 'model', text: `I've applied the changes: ${changes}. You can see the updated image now!` }]);
      }
    } catch (error) {
      console.error("Error applying chat changes:", error);
      alert("Failed to apply changes. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleFinishDesign = async () => {
    if (!plan) return;
    setAppState('loading');

    try {
      const currentImage = plan.generatedImage || plan.originalImage;
      const text = await generateActionPlan(plan.originalImage, currentImage, plan.style, plan.persona);
      setActionPlanText(text);
      setAppState('actionPlan');
    } catch (error) {
      console.error("Error generating action plan:", error);
      alert("Failed to generate action plan. Please try again.");
      setAppState('result');
    }
  };

  return (
    <div className="font-sans text-[#1a1a1a] bg-[#f9f8f6] min-h-screen">
      {appState === 'upload' && (
        <UploadScreen onGenerate={handleGenerate} />
      )}

      {appState === 'loading' && (
        <LoadingScreen />
      )}

      {appState === 'result' && plan && (
        <>
          <ResultScreen
            plan={plan}
            onBack={() => {
              setAppState('upload');
              setPlan(null);
              setIsChatOpen(false);
            }}
            onOpenChat={() => setIsChatOpen(true)}
            onRegenerate={(newStyle) => handleGenerate(plan.originalImage, newStyle, plan.persona)}
            onEditElement={handleEditElement}
            onFinishDesign={handleFinishDesign}
          />
          <Chatbot
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            persona={plan.persona}
            onApplySpecificChange={handleApplySpecificChange}
          />
        </>
      )}
      {appState === 'actionPlan' && plan && actionPlanText && (
        <ActionPlanScreen
          plan={plan}
          actionPlanText={actionPlanText}
          onBack={() => setAppState('result')}
        />
      )}
    </div>
  );
}
