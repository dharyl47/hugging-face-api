import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream, StreamingTextResponse } from 'ai'
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts'

// Create a new HuggingFace Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

async function fetchLearningMaterials() {
  try {
    const response = await fetch('http://localhost:3000/api/learningMaterials'); // Replace with the correct URL
    const result = await response.json();
    if (result.success) {
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

function buildPrompt(messages: { content: string; role: 'system' | 'user' | 'assistant' }[]) {
  const lastUserMessage = messages
    .filter(({ role }) => role === 'user') // Only consider user messages
    .pop(); // Get the last user message

  return lastUserMessage ? lastUserMessage.content : '';
}

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  let { messages } = await req.json()

  const learningMaterials = await fetchLearningMaterials();
  const concatenatedPrompts = learningMaterials.map((material: { prompt: string }) => material.prompt).join('\n\n');

  const prompt = `
    Below is the information if someone ask anything:
    ${concatenatedPrompts}

    Below is the stages:
 
    Our goal is to help people in real estate and with that one of our goal is to create a user profile which we capture user information for us to decide
    situational conversation, If user provided a name, we will call that person by its name.
    There will be stages on how you communicate with the user. 
   
    Stage 1: Initial Selection

The user can select one of the following options: "Absolutely," "Tell me more," or "Not now."
If the user selects "Absolutely" or "Tell me more," respond with:
"Great Choice! Estate Planning can help ensure your assets are protected and distributed according to your wishes. I've got a short video that explains the basics. Want to watch?"
Stage 2: Video Initiation

If the user wants to watch the video, respond with:
"initiate video"
After responding with "initiate video," wait for the user to provide their name, then respond with:
"Nice to meet you, [user name]! 👋 Let's talk about your family life briefly. Are you married, single, divorced, or widowed?"
Stage 3: Marital Status

If the user says they are married, ask:
"Thanks! Are you married in community of property, or out of community of property?"
Stage 4: Dependents

After the user specifies "community of property" or "out of community of property," ask:
"Do you have dependents? Spouse, Children, Stepchildren, Grandchildren, Other Dependents?"
Stage 5: Major Assets

After the user confirms they have selected dependents, ask:
"What are your major assets you want to include in your estate plan?"
Stage 6: Understanding Assets

After the user confirms their assets, ask:
"Please list the asset and the people or organizations you want to leave them to, but Before we continue with your assets, did you know that estate planning isn't just about physical assets like your home or car?"
Stage 7: Investment Risk

After the user responds about uploading their asset, ask:
"When it comes to investments for your estate, how do you feel about risk?"
    
    `;

messages = messages.map((message: { content: string; role: 'system' | 'user' | 'assistant' }) => {
  if (message.role === 'user') {
    return { ...message, content: prompt + `Respond not exceeding 4 sentences ${message.content}` };
  } else {
    return message;
  }
});

  const response = Hf.textGenerationStream({
    model: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
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
