import { OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';

// Initialize the OpenAI client with the API key
// The API key should be stored in an environment variable in production
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-placeholder',
  dangerouslyAllowBrowser: true // Allow API key usage in browser (note: in production, use a backend proxy)
});

// Define the message type
export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

// Define the service
export const openaiService = {
  // Send a message to the OpenAI API and get a response
  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('API Key being used:', import.meta.env.VITE_OPENAI_API_KEY ? 'API key exists' : 'No API key found');
      
      // Format messages for the OpenAI API
      const formattedMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));

      // Add system message to provide context about Sweeply
      const systemMessage: ChatCompletionMessageParam = {
        role: 'system',
        content: 'You are an AI assistant for Sweeply, a cleaning business management software. You help users with questions about scheduling, client management, invoicing, team management, and other cleaning business operations. Be helpful, concise, and professional.'
      };

      console.log('Making OpenAI API call with messages:', formattedMessages.length);
      
      // Make the API call
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Using a more widely available model
        messages: [
          systemMessage,
          ...formattedMessages
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      console.log('OpenAI API response received:', response.choices.length > 0 ? 'Success' : 'No choices returned');
      
      // Return the AI's response text
      return response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        code: error.code,
        param: error.param,
        status: error.status,
        stack: error.stack
      });
      return "Sorry, I encountered an error. Please try again later.";
    }
  }
};
