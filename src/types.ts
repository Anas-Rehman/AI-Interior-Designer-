export type DesignStyle =
  | 'Modern'
  | 'Minimalist'
  | 'Industrial'
  | 'Bohemian'
  | 'Scandinavian'
  | 'Mid-Century Modern'
  | 'Classic/Traditional'
  | 'Japandi'
  | 'Art Deco';

export type DesignerPersona =
  | 'The Minimalist Guru'
  | 'The Color Maximalist'
  | 'The Vintage Curator'
  | 'The Luxury Specialist'
  | 'The Eco-Friendly Innovator';

export interface RoomImage {
  data: string; // base64
  mimeType: string;
}

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface EditableElement {
  name: string;
  box: BoundingBox;
}

export interface ShoppableItem {
  id: string;
  name: string;
  estimatedPrice: string;
  searchUrl: string;
}

export interface DesignPlan {
  originalImage: RoomImage;
  generatedImage: RoomImage | null;
  textPlan: string;
  style: DesignStyle;
  persona: DesignerPersona;
  suggestedStyles: DesignStyle[];
  editableElements: EditableElement[];
  shoppableItems?: ShoppableItem[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
