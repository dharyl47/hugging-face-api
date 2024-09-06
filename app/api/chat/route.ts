import { HfInference } from '@huggingface/inference';
import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts';
import { encode } from 'gpt-tokenizer'; // Import a tokenizer library compatible with your model

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

function trimMessages(messages: Message[], maxTokens: number) {
    let totalTokens = 0;
    const trimmedMessages: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
        const messageTokens = messages[i].content.split(' ').length; // A rough estimate
        if (totalTokens + messageTokens > maxTokens) {
            break;
        }
        totalTokens += messageTokens;
        trimmedMessages.unshift(messages[i]);
    }

    return trimmedMessages;
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

async function fetchWithRetry(messages: Message[], retries = 10, delay = 1000) {
  let attempt = 0;

  while (attempt < retries) {
    try {
      // Trim messages to fit within the token limit
      messages = trimMessages(messages, 8192 - 100);
      
      // Attempt to call the Hugging Face text generation stream
      const response = await Hf.textGenerationStream({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        inputs: experimental_buildOpenAssistantPrompt(messages),
        parameters: {
          stop_sequences: ['<|endofresponse|>', '**Video Link:**', '<|endoftext|>'],
        }
      });

      // If the response is successful, return it
      return response;

    } catch (error : any) {
      attempt++;

      // Log the attempt and the error
      console.error(`Attempt ${attempt} failed: ${error.message}`);

      // Check if the error is specifically an ECONNRESET error
      if (error.code === 'ECONNRESET') {
        console.warn(`ECONNRESET encountered. Retrying in ${delay}ms...`);
      } else {
        console.warn(`Unknown error encountered. Retrying in ${delay}ms...`);
      }

      // If we've reached the retry limit, throw the error
      if (attempt >= retries) {
        throw new Error(`All ${retries} retry attempts failed.`);
      }

      // Wait for the specified delay before retrying (exponential backoff)
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; // Increase the delay for the next retry
    }
  }
}








function estimateTokens(text: string): number {
    return encode(text).length; // Estimate the number of tokens using a tokenizer library
}


function trimMessagesToFitTokenLimit(messages: Message[], maxTokens: number) {
    let totalTokens = 0;
    const trimmedMessages: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
        const messageTokens = estimateTokens(messages[i].content);
        if (totalTokens + messageTokens > maxTokens) {
            break;
        }
        totalTokens += messageTokens;
        trimmedMessages.unshift(messages[i]);
    }

    return trimmedMessages;
}

function sanitizeMessages(messages: Message[]): Message[] {
    return messages.map(message => ({
        ...message,
        content: message.content.replace(/<\|endoftext\|>/g, ''),
    }));
}


function truncateConversationHistory(messages: Message[], maxMessages: number = 5): Message[] {
    return messages.slice(-maxMessages);
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

  messages = truncateConversationHistory(messages);
  messages = sanitizeMessages(messages);

  const maxAllowedTokens = 8192 - 100; // Considering 100 tokens for max_new_tokens
  messages = trimMessagesToFitTokenLimit(messages, maxAllowedTokens);



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

  //  Below are the previous conversation you have from the users, use this information and analyze it so that we can continue the conversation.
  //       This is the Start of the previous conversation
  //       ${cache.messagesCache}\n\n
  //       This is the End of the previous conversation

  //        Below are the instructions on how to interact with the user.
  //       \n
  //       ${cache.prompt.friendlyTone}\n\n

  //        Below is the information if someone asks anything:
  //       ${cache.concatenatedPrompts}
  //       \n\n

  messages = messages.map((message: Message) => {
    if (message.role === 'user') {
      return {
        ...message,
        content: `
        When responding to the user, do not include any stage numbers, instructions like "Save the...", or internal comments in your output. Only display the questions or statements that are meant to be shown directly to the user. Your role is to guide the user through the estate planning process seamlessly, ensuring clarity and simplicity. Follow the stages sequentially. Do not skip or jump to a different stage unless explicitly instructed within the stage.

        Below are different scenarios that could impact the estate:

Setting Up a Trust: Imagine you set up a trust to manage your assets. The trust could be used to provide for your children’s education and care until they reach adulthood. This can protect the assets from being mismanaged or spent too quickly. Additionally, trusts can offer tax benefits and ensure a smoother transfer of assets to your beneficiaries.

Dying Intestate (Without a Will): Suppose you pass away without a will. According to South Africa’s Intestate Succession Act, your estate will be distributed to your surviving spouse and children or other relatives if you have no spouse or children. This may not align with your personal wishes and could lead to disputes among family members.

Appointing a Power of Attorney: Consider appointing a trusted person as your power of attorney. This individual can manage your financial and legal affairs if you become incapacitated. For example, they could pay your bills, manage your investments, or make medical decisions on your behalf. This ensures that your affairs are handled according to your wishes, even if you’re unable to communicate them.

Tax Implications of Estate Planning Decisions: Imagine you decide to gift a portion of your assets to your children during your lifetime. While this can reduce the size of your taxable estate, it’s important to consider any potential gift taxes and how it might impact your overall estate plan. Consulting with a tax advisor can help you understand the best strategies for minimizing tax liabilities while achieving your estate planning goals.

Instructions if the user requests Account Deletion:

If the user requests the deletion of their Estate Planning Profile: Ask: "Can you please provide your username so I can assist you with deleting your Estate Planning Profile?"

Once the username is provided: Respond: "Your deletion request has been submitted. Your Estate Planning account will be deleted within 24 hours."

If the username is not found: Ask: "It seems the username you provided is not in our database. Can you please provide your username so I can assist you with deleting your Estate Planning Profile?"

Instructions for User Interaction:
Important Note: When interacting with the user, do not include stage numbers or prompt instructions in your responses. Focus only on the user-facing messages as specified.

Stage 1: Starting Message If the user responds with "yes" or "absolutely": Ask: "Great choice! Estate planning can help ensure your assets are protected and distributed according to your wishes. I've got a short video that explains the basics. Want to watch?" Proceed to Stage 2. Else: Proceed to Stage 3.

Stage 2: Initial Selection If the user responds with "yes" or "watch": Respond with exactly: "Initiate video." Else: Proceed to Stage 3.

Stage 3: Initiate Video If the user responds with "No, let's move on", proceed to Stage 4.

Stage 4: Ask for User Consent If the user consents to the Privacy Policy (https://moneyveristylms.vercel.app/privacy), proceed to Stage 5. Else if the user responds with "no" to the Privacy Policy: Respond: "I understand and respect your decision. Unfortunately, without your consent to collect and store your information, we won’t be able to proceed with creating your estate plan. If you have any questions or need further information about our data privacy practices, please let me know." Else: Inform the user that you understand if they change their mind or have questions, and stay in Stage 4.

Stage 5: Profiling - Name If the user provides their name: Save the name and proceed to Stage 6. Else: Ask for their name again.

Stage 6: Date of Birth If the user provides their date of birth: Save the date of birth and proceed to Stage 7. Else: Ask for their date of birth again.

Stage 7: Marital Status If the user responds with "Single," "Married," "Divorced," or "Widowed": Save the marital status. If the user is "Married": Ask: "Are you married in or out of community of property, and does your marriage include the accrual system?"

Stage 7.1: If the user cannot remember the type of marriage: Ask: "No worries! Here’s a brief description of each type to help you remember.".

Stage 7.2: If the user selects "Out of Community of Property with Accrual" or "Out of Community of Property without Accrual", 
Ask: "In order to calculate the accrual, we need to know the specifics of your antenuptial contract (ANC). Please upload your antenuptial contract." Save the document name. 
Else: Proceed to Stage 8.

Stage 8: Dependents If the user has dependents (Spouse, Children, Stepchildren, Grandchildren): Save dependents and proceed to Stage 9.

Stage 9: Dependents Under 18 Ask how many dependents are under 18. Save the number and proceed to Stage 9.1.

Stage 9.1: Dependents Over 18 Ask how many are over 18. Save the number and proceed to Stage 10.

Stage 10: Risk Tolerance If the user provides their risk tolerance: Save the risk tolerance and proceed to Stage 11. Else: Ask for their risk tolerance again.

Stage 11: Email Address If the user provides their email address: Save the email and conclude the conversation with: "Great! Let’s move on to the next section where we’ll discuss what estate planning is and why it is important. Ready?" Proceed to Stage 12. If the user responds with "no": Reply with: "Thanks for using our Estate Planning Chatbot! Have a great day, and we're looking forward to helping you secure your future!" Else: Continue assisting the user based on their response.




        \n\n${message.content}`,
      };
    } else {
      return message;
    }
  });

// console.log(cache.concatenatedPrompts); // Logging messages with all cached contents

  // Clear the cache after use
  cache.learningMaterials = null;
  cache.settings = null;
  cache.concatenatedPrompts = '';
  cache.combinedEngagement = '';

  try {
    const response = await fetchWithRetry(messages, 10, 1000); // No resumePoint needed now

    if (!response) {
      throw new Error("Failed to get a response from the model.");
    }

    // Convert the response into a friendly text-stream
    const stream = HuggingFaceStream(response);
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Error occurred during processing:", error);
    return new Response("An error occurred while generating the response. Please try again later.", { status: 500 });
  }
}