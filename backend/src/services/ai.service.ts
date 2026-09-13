import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY || 'dummy_key' });

export const aiService = {
  // Generate description and tags from an image Buffer
  generateDescription: async (imageBuffer: Buffer, mimeType: string, providedCategory?: string): Promise<{ description: string, tags: string[], category: string }> => {
    try {
      if (!process.env.AI_API_KEY) {
        return {
          description: `This ${providedCategory || 'item'} has distinctive features. (AI functionality requires API Key configuration)`,
          tags: [],
          category: providedCategory || 'Other',
        };
      }

      // Use the provided buffer directly
      const base64Image = imageBuffer.toString('base64');

      const prompt = `
        Analyze this image of a lost or found item.
        Provide a JSON response with the following structure:
        {
          "description": "A highly detailed description of the item, noting any unique marks, brand, colors, condition, and identifiable features. (max 3 sentences)",
          "tags": ["keyword1", "keyword2", "color", "brand", "type", "material"],
          "category": "Choose the most appropriate category from: Electronics, Bags & Wallets, Keys, Documents, Jewelry, Clothing, Pets, Other."
        }
        Do not include markdown blocks, just return raw valid JSON.
        ${providedCategory ? `The user suggested the category might be: ${providedCategory}` : ''}
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { data: base64Image, mimeType } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temp for more deterministic output
        }
      });

      const text = result.text || '{}';
      const parsed = JSON.parse(text);
      return {
        description: parsed.description || 'Description could not be generated.',
        tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: string) => t.toLowerCase()) : [],
        category: parsed.category || providedCategory || 'Other',
      };
    } catch (error) {
      console.error('[AI Service] generateDescription error:', error);
      throw new Error('Failed to generate description with AI');
    }
  },

  // Extract structured search filters from natural language query
  extractSearchFilters: async (query: string): Promise<{ tags: string[], category?: string, location?: string }> => {
    try {
      if (!process.env.AI_API_KEY) {
        return { tags: query.split(' ').map(w => w.toLowerCase()) };
      }

      const prompt = `
        A user is searching for a lost or found item with the following natural language query: "${query}"
        Extract the search intent into structured filters.
        Return a JSON response with this structure:
        {
          "tags": ["array", "of", "extracted", "keywords", "colors", "brands", "item type"],
          "category": "One of: Electronics, Bags & Wallets, Keys, Documents, Jewelry, Clothing, Pets, Other (or null if unknown)",
          "location": "Any extracted location, city, or address (or null if unknown)"
        }
        Only return raw valid JSON.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const text = result.text || '{}';
      const parsed = JSON.parse(text);
      return {
        tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: string) => t.toLowerCase()) : [],
        category: parsed.category || undefined,
        location: parsed.location || undefined,
      };
    } catch (error) {
      console.error('[AI Service] extractSearchFilters error:', error);
      return { tags: query.split(' ').map(w => w.toLowerCase()) };
    }
  },

  // Chatbot conversation handler
  handleChat: async (messages: { role: string, content: string }[]): Promise<string> => {
    try {
      if (!process.env.AI_API_KEY) {
        return "I am currently running in offline mode. Please configure the AI API Key to enable my full capabilities!";
      }

      const systemPrompt = `
        You are the FindIt AI Assistant, a helpful customer support chatbot for a Lost & Found platform.
        Your goal is to help users report lost items, find found items, claim items, and navigate the platform.
        Keep responses concise, friendly, and formatted with markdown (bolding, lists) when helpful.
        If they ask how to report an item, tell them to click the "Report" button in the navigation bar.
        If they ask how to search, tell them they can browse or use the global search by clicking the search icon.
        If they ask for specific items, tell them they can use the search bar.
      `;

      // Convert standard { role, content } into Gemini format
      const geminiMessages = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Add system prompt as the first message from the user, or use systemInstruction
      // The GenAI SDK supports systemInstruction in config
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: geminiMessages,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      return result.text || "I'm sorry, I couldn't understand that.";
    } catch (error) {
      console.error('[AI Service] handleChat error:', error);
      return "I'm having trouble connecting to my brain right now. Please try again later!";
    }
  },

  // Match items based on image and description
  findMatches: async (itemId: string): Promise<void> => {
    console.log(`[AI] findMatches triggered for item ${itemId}`);
    // TODO: Implement actual vector search / matching logic
  },
};
