import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { RoomImage, DesignStyle, DesignerPersona, EditableElement, ChatMessage, ShoppableItem } from '../types';

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    // Vite uses import.meta.env, but we also check process.env for Node/testing environments
    const apiKey = typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY
      ? process.env.GEMINI_API_KEY
      : (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing! It must be provided in the environment.");
    }

    aiInstance = new GoogleGenAI({ apiKey: apiKey as string });
  }
  return aiInstance;
};

export const extractEditableElements = async (image: RoomImage): Promise<EditableElement[]> => {
  const ai = getAI();
  const prompt = `Analyze this room image and identify 5-8 main distinct elements that could be redesigned (e.g., Flooring, Walls, Ceiling, Sofa, Rug, Windows).
For each element, provide its name and a bounding box in the format [ymin, xmin, ymax, xmax] where values are normalized between 0 and 1000.
Return ONLY a JSON array of objects with 'name' (string) and 'box' (array of 4 numbers) properties.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: image.data, mimeType: image.mimeType } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            box: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER }
            }
          }
        }
      }
    }
  });

  try {
    const rawElements = JSON.parse(response.text || '[]');
    return rawElements.map((el: any) => ({
      name: el.name,
      box: {
        ymin: el.box[0],
        xmin: el.box[1],
        ymax: el.box[2],
        xmax: el.box[3]
      }
    }));
  } catch (e) {
    return [];
  }
};

export const editRoomElement = async (
  image: RoomImage,
  element: string,
  instruction: string
): Promise<RoomImage | null> => {
  const ai = getAI();
  const prompt = `Change the ${element} to ${instruction}. Keep the exact same layout, perspective, and all other objects exactly the same. Highly realistic, professional architectural photography.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: image.data,
            mimeType: image.mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      };
    }
  }

  return null;
};

export const suggestAlternativeStyles = async (
  image: RoomImage,
  currentStyle: DesignStyle
): Promise<DesignStyle[]> => {
  const ai = getAI();
  const prompt = `Based on this room image, suggest 4 alternative interior design styles that would work well here.
Exclude the current style: "${currentStyle}".
Choose from this list: Modern, Minimalist, Industrial, Bohemian, Scandinavian, Mid-Century Modern, Classic/Traditional, Japandi, Art Deco.
Return ONLY a JSON array of strings.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: image.data, mimeType: image.mimeType } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const styles = JSON.parse(response.text || '[]');
    return styles.slice(0, 4) as DesignStyle[];
  } catch (e) {
    return [];
  }
};

export const generateDesignPlan = async (
  image: RoomImage,
  style: DesignStyle,
  persona: DesignerPersona
): Promise<string> => {
  const ai = getAI();
  const prompt = `Act as an interior designer known as "${persona}".
I want to redesign this room in a "${style}" style.
CRITICAL INSTRUCTION: You MUST keep all of the objects and the layout of the room exactly the same. Only change the colors, materials, textures, lighting, and surface finishes.
Provide a highly detailed, professional interior design plan. Include:
1. Overall Vision & Mood
2. Color Palette (with specific hex codes or paint names)
3. Material & Texture Recommendations
4. Lighting Strategy
5. Specific Furniture/Surface Updates (how to treat existing items)
Be extremely professional, thorough, and creative within the constraints.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: image.data, mimeType: image.mimeType } },
          { text: prompt },
        ],
      },
    ],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  });

  return response.text || '';
};

export const generateRedesignedImage = async (
  image: RoomImage,
  style: DesignStyle,
  additionalInstructions?: string
): Promise<RoomImage | null> => {
  const ai = getAI();
  let prompt = `Redesign this room in a ${style} interior design style. Keep the exact same layout, perspective, and objects. Only change the materials, colors, textures, and lighting to match the ${style} aesthetic. Highly realistic, professional architectural photography.`;

  if (additionalInstructions) {
    prompt = `Redesign this room in a ${style} interior design style. Keep the exact same layout, perspective, and objects. Only change the materials, colors, textures, and lighting to match the ${style} aesthetic. 
CRITICAL ADDITIONAL INSTRUCTIONS TO APPLY: ${additionalInstructions}
Highly realistic, professional architectural photography.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: image.data,
            mimeType: image.mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      };
    }
  }

  return null;
};

export const createChatSession = (
  image: RoomImage,
  plan: string,
  style: DesignStyle,
  persona: DesignerPersona
) => {
  const ai = getAI();
  const systemInstruction = `You are an AI interior designer known as "${persona}".
You just provided a detailed design plan for a room in a "${style}" style.
The user will now ask you follow-up questions about the design, or ask you to change specific things.
Be extremely professional, helpful, and maintain your persona.
If the user asks to change something, acknowledge it and say you can implement it.
Here is the plan you provided:
${plan}
`;

  return ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  });
};

export const applySpecificEditToImage = async (
  image: RoomImage,
  instruction: string
): Promise<RoomImage | null> => {
  const ai = getAI();
  const prompt = `Modify this room image. CRITICAL INSTRUCTION: Keep the exact same layout, perspective, and ALL objects exactly the same. ONLY apply the following specific changes: ${instruction}. Do not change anything else. Highly realistic, professional architectural photography.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: image.data,
            mimeType: image.mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      };
    }
  }

  return null;
};

export const extractSpecificDesignChange = async (messageText: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Analyze this message from an interior designer.
Extract the specific visual changes proposed or agreed upon in this message (e.g., "make the rug red", "change the curtains to velvet", "add floral wallpaper").
Summarize these changes into a clear, concise list of instructions for an image generation model.
If the message doesn't contain specific visual changes to apply, return the exact string "NO_CHANGES".

Message:
"${messageText}"
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
  });

  const text = response.text?.trim() || 'NO_CHANGES';
  return text === 'NO_CHANGES' ? '' : text;
};

export const generateActionPlan = async (
  originalImage: RoomImage,
  finalImage: RoomImage,
  style: DesignStyle,
  persona: DesignerPersona
): Promise<string> => {
  const ai = getAI();
  const prompt = `Act as an interior designer known as "${persona}".
I have finished redesigning my room in a "${style}" style.
Compare the ORIGINAL room image (first image) with the FINAL REDESIGNED room image (second image).
Provide a highly practical, step-by-step action plan on how to convert the original room into the redesigned one.
Include:
1. What to Keep (items that remained the same)
2. What to Change/Paint/Modify (DIY tasks, painting, refinishing)
3. Shopping List (what new items, materials, or furniture to buy to achieve the look)
4. Step-by-Step Execution Plan
Be specific and practical.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { data: originalImage.data, mimeType: originalImage.mimeType } },
          { inlineData: { data: finalImage.data, mimeType: finalImage.mimeType } },
          { text: prompt },
        ],
      },
    ],
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  });

  return response.text || '';
};

export const extractShoppableItems = async (
  textPlan: string,
  style: DesignStyle
): Promise<ShoppableItem[]> => {
  const ai = getAI();
  const prompt = `Act as an expert personal shopper and interior designer.
I have a room design plan in a "${style}" style.
Analyze the following design plan and extract 3-5 distinct, key pieces of furniture, decor, or materials mentioned that the user needs to buy to achieve this look.

For each item, provide:
1. A descriptive, search-friendly 'name' (e.g., "Mid-Century Modern Walnut Accent Chair").
2. A very realistic 'estimatedPrice' as a string (e.g., "$150 - $300").
3. A 'searchUrl' which should be a valid Amazon or Wayfair search URL encoding the item name (e.g., https://www.amazon.com/s?k=mid+century+modern+walnut+accent+chair).

Design Plan to Analyze:
"""
${textPlan}
"""

Return ONLY a valid JSON array of objects with 'id' (a unique string like "item-1"), 'name', 'estimatedPrice', and 'searchUrl' properties.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            estimatedPrice: { type: Type.STRING },
            searchUrl: { type: Type.STRING }
          }
        }
      }
    }
  });

  try {
    const rawItems = JSON.parse(response.text || '[]');
    return rawItems as ShoppableItem[];
  } catch (e) {
    console.error("Error parsing shoppable items:", e);
    return [];
  }
};

