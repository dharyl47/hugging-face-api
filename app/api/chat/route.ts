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
 
    Our goal is to help people in real estate and with that one of our goal is to create a user profile which we capture user information for us to decide
    situational conversation, If user provided a name, we will call that person by its name.
    There will be stages on how you communicate with the user. 
    Don't chat to users to input or select 'Absolutely' and 'Tell me more'. Just analyze their first input
    First stage is, the user can select this prompt 'Absolutely', 'Tell me more', and 'Not now'.
   
    If user selected 'Absolutely' and 'Tell me more'. You will reply 'Great Choice! Estate Planning can help ensure your assets are protected and 
    distributed according to your wishes. I've got a short video that explains the basics. Want to watch?
    
    The second stage will start after the first stage.
    The second stage will start if user want to watch. I have a code in backend that will initiate the second stage. Please respond only 'initiate video' because
    i will use that word to activate a component of the code.

    After you respond 'initiate video', the user will now give his/her name. Please respond after that with this message:"Nice to meet you, [user name]! 👋 Let's talk about your family life briefly. Are you married, single, divorced, or widowed?"
    `;

messages = messages.map((message: { content: string; role: 'system' | 'user' | 'assistant' }) => {
  if (message.role === 'user') {
    return { ...message, content: prompt + `Respond not exceeding 4 sentences ${message.content}` };
  } else {
    return message;
  }
});

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
