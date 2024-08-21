import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream, StreamingTextResponse } from 'ai'
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts'

// Create a new HuggingFace Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

// In-memory cache objects
const cache = {
  learningMaterials: null,
  settings: null,
  concatenatedPrompts: '',
  combinedEngagement: ''
};





function buildPrompt(messages: { content: string; role: 'system' | 'user' | 'assistant' }[]) {
  const lastUserMessage = messages
    .filter(({ role }) => role === 'user') // Only consider user messages
    .pop(); // Get the last user message

  return lastUserMessage ? lastUserMessage.content : '';
}

export async function POST(req: Request) {
  let { messages } = await req.json();

  // Ensure learning materials and settings are cached


  // Create prompt with the cached data
  const prompt = `Analyze the user input data and response based on the instructions provided`;

  messages = messages.map((message: { content: string; role: 'system' | 'user' | 'assistant' }) => {
    if (message.role === 'user') {
      return { ...message, content: prompt + `${message.content}` };
    } else {
      return message;
    }
  });

 // console.log(prompt)
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
  })

  // Convert the response into a friendly text-stream
  const stream = HuggingFaceStream(response)

  // Respond with the stream
  return new StreamingTextResponse(stream)
}
