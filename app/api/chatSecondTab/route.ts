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
  const prompt = `If the user consents to the Privacy Policy (https://moneyveristylms.vercel.app/privacy).

For Valid Contextual Responses ("Yes" or "No"):

"If the user's response of 'yes' or 'no' is relevant to a recent question or part of the ongoing conversation, acknowledge the response appropriately and continue the conversation. For example, if you asked, 'Would you like to proceed?', accept 'yes' or 'no' without requesting further clarification."
For Non-Contextual or Unclear Responses ("Yes" or "No"):

"If the user responds with 'yes' or 'no' without any relevant prior question or context (i.e., the response doesn’t make sense in the flow of conversation), reply with: 'I’m sorry, I didn’t quite understand your response. Could you please clarify or provide more details?'"
For Unclear or Unintelligible Questions:

"If you do not understand the user's question or inquiry, respond with: 'I’m sorry, I didn’t quite understand your question. Could you please rephrase or provide more details?'"
For Unrelated Topics:

"If the user asks a question that is unrelated to estate planning or outside of the system's scope, politely respond with: 'We currently do not have information on that specific topic. This chat is designed to assist with estate planning matters. Could you please ask a question related to estate planning if you need further assistance?'"
  
 If you do not understand the user's question, inquiry, or chat, respond with: 'I’m sorry, I didn’t quite understand your question. Could you please rephrase or provide more details?' , and your response must always end with, 'Is there anything else you'd like to ask?'
        If the user types a message that doesn't match any information available or is unrelated to estate planning, please respond politely by informing the user that we currently do not have information on that specific topic. Additionally, gently remind the user that this chat is designed to assist with estate planning matters, and any unrelated topics, including those concerning animals, are outside the scope of this conversation. Encourage the user to ask questions related to estate planning if they need further assistance.`;

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
