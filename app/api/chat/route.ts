import { HfInference } from '@huggingface/inference';
import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts';

// Create a new HuggingFace Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

// In-memory cache objects
interface Cache {
  learningMaterials: any | null;
  settings: any | null;
   prompt: any | null;
  concatenatedPrompts: string;
  combinedEngagement: string;
  messagesCache: string[]; // Explicitly define messagesCache as an array of strings
}

// Initialize cache with proper types
const cache: Cache = {
  learningMaterials: null,
  settings: null,
   prompt: null,
  concatenatedPrompts: '',
  combinedEngagement: '',
  messagesCache: [] // Initialize as an empty array of strings
};

interface Message {
  content: string;
  role: 'system' | 'user' | 'assistant';
}
// Fetch learning materials
async function fetchLearningMaterials() {
  if (cache.learningMaterials) {
    return cache.learningMaterials;
  }

  try {
    const response = await fetch('https://moneyversity-ai-chat.vercel.app/api/learningMaterials'); // This is for testing 
    const result = await response.json();
    if (result.success) {
      cache.learningMaterials = result.data;
      cache.concatenatedPrompts = result.data.map((material: { prompt: string }) => material.prompt).join('\n\n');
      return result.data;
    } else {
      console.error('Error fetching learning materials:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching learning materials:', error);
    return [];
  }
}

// Fetch settings
async function fetchSettings() {
  if (cache.settings) {
    return cache.settings;
  }

  try {
    const response = await fetch('https://moneyversity-ai-chat.vercel.app/api/settings');
    const result = await response.json();
    if (result.success) {
      cache.settings = result.data;
      cache.combinedEngagement = result.data.map((setting: any) => {
        const prompt = setting.engagingPrompt || '';
        const video = setting.engagingVideo ? `Watch this video: ${setting.engagingVideo}` : '';
        const image = setting.engagingImage ? `Here is an image related to the topic: ${setting.engagingImage}` : '';

        return [prompt, video, image].filter(Boolean).join('\n\n');
      }).join('\n\n');
      return result.data;
    } else {
      console.error('Error fetching settings:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return [];
  }
}

// Build the prompt with context from previous messages
function buildPrompt(messages: { content: string; role: 'system' | 'user' | 'assistant' }[]) {
  const context = messages.map(({ role, content }) => {
    if (role === 'user') {
      return `User: ${content}`;
    } else if (role === 'assistant') {
      return `Assistant: ${content}`;
    }
    return '';
  }).filter(Boolean).join('\n');

  return context;
}

async function fetchChatSettings() {
  // if (cache.prompt) {
  //   return cache.prompt;
  // }

  try {
    const response = await fetch('https://moneyversity-ai-chat.vercel.app/api/chatSettings');
    const result = await response.json();
    if (result.success) {
      cache.prompt = result.data;
      return result.data;
    } else {
      console.error('Error fetching chat settings:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching chat settings:', error);
    return [];
  }
}


export async function POST(req: Request) {
  let { messages }: { messages: Message[] } = await req.json();

  // Ensure learning materials and settings are cached
  await fetchLearningMaterials();
  await fetchSettings();
   await fetchChatSettings();

   

  // Fetch the existing messagesCache
  const existingMessages = cache.messagesCache;

  // Append new messages to the cache
  cache.messagesCache = [...existingMessages, ...messages.map((message: Message) => message.content)];

  // Build the context from previous messages
  const context = buildPrompt(messages);

  // Construct the prompt with dynamic content
  // const prompt = `
  //   Here is the context of the conversation:
  //   ${context}

  //   Below is the information if someone asks anything:
  //   ${cache.concatenatedPrompts}

  //   Below is a fun fact you can share with the user if it’s relevant to the question or fits naturally into the conversation, always include the video and image if it is not empty:
  //   If the user specifically asks for a fun fact please provide our current fun fact data below.
  //   ${cache.combinedEngagement}

  //   End of Fun Fact
  //   After the fun fact is inserted, ask if they want to continue with building their user profile or if they have any additional questions.

  //   Note: Only ask one question at a time. Don't ask the same question if the user already provided an answer.
    
  //   After asking the consent, ask below:
  //   Insert fun fact-  Start and End of "components of estate planning" in Fun Fact. 
  //   Please only ask questions if the user has not provided an answer already:

  //   Name: 'What is your name?'
  //   Date of Birth: 'What is your date of birth?'

  //   After asking the date of birth two questions, ask below:
  //   'Before we proceed, I want to ensure you're comfortable with us collecting and storing this information securely. This data will only be used to help create your estate plan. Do you consent to this?'
   
  //   Marital Status: 'What is your marital status? (Single, Married)'
  //   If married, ask: 'What type of marriage do you have? (Community of Property, Out of Community of Property with Accrual, Out of Community of Property without Accrual, I can’t remember)'

  //   Dependents: 
  //   'Please list the types of dependents you have. (Spouse, Children, Stepchildren, Grandchildren, Other dependents)'
  //   'How many dependents are over the age of 18?'
  //   'How many dependents are under the age of 18?'

  //   Risk Tolerance: Ask this question: 'How do you feel about risk when it comes to investing in your estate? (Low Risk, Medium Risk, High Risk)'

  //   Email Address: Ask this question: 'What is your email address?'
  // `;

  messages = messages.map((message: Message) => {
    if (message.role === 'user') {
      return {
        ...message,
        content: `
        Below are the instructions on how to interact with the user.
        \n
        ${cache.prompt.friendlyTone}\n\n
        ${cache.prompt.mainPrompt}
        \n\n${message.content}`,
      };
    } else {
      return message;
    }
  });

 // console.log(messages); // Logging messages with all cached contents

  // Clear the cache after use
  cache.learningMaterials = null;
  cache.settings = null;
  cache.concatenatedPrompts = '';
  cache.combinedEngagement = '';

  const response = Hf.textGenerationStream({
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    inputs: experimental_buildOpenAssistantPrompt(messages),
    parameters: {
      max_new_tokens: 200,
      // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
      typical_p: 0.2,
      repetition_penalty: 1,
      truncate: 1000,
      return_full_text: false
    }
  });

  // Convert the response into a friendly text-stream
  const stream = HuggingFaceStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}