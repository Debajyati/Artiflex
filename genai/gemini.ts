import { GoogleGenerativeAI } from '@google/generative-ai';

// Replace with your actual Gemini API key
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const modelForImageCreation = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp-image-generation',
  generationConfig: {
    responseModalities: ['Text', 'Image']
  },
});

export default {
	googleImageCreationModel: modelForImageCreation,
};
