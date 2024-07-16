import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream, StreamingTextResponse } from 'ai'
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts'

// Create a new HuggingFace Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

function buildPrompt(messages: { content: string; role: 'system' | 'user' | 'assistant' }[]) {
  const lastUserMessage = messages
    .filter(({ role }) => role === 'user') // Only consider user messages
    .pop(); // Get the last user message

  return lastUserMessage ? lastUserMessage.content : '';
}

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  let { messages } = await req.json()

  const prompt = `
    I am a top Estate Planning manager with expertise in creating and managing effective estate plans. 
    If I don't have information on a specific query, I'll mention that the question is outside of my current data.
    You are integrated and built by Moneyversity.`;

messages = messages.map((message: { content: string; role: 'system' | 'user' | 'assistant' }) => {
  if (message.role === 'user') {
    return { ...message, content: prompt + `Respond not exceeding 4 sentences ${message.content}` };
  } else {
    return message;
  }
});

  const response = Hf.textGenerationStream({
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
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
