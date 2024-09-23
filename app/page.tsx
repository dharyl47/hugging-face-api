"use client";
import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import CustomInput from "@/app/components/CustomInput";
import CustomCheckBox from "@/app/components/CustomCheckBox"; // Import the CustomCheckBox component
import EmbeddedVideo from "@/app/components/EmbeddedVideo";
import Calendar from "@/app/components/Calendar";
import Image from "next/image"; // Import the Image component
import BusinessImportanceSlider from "./components/BusinessImportanceSlider"
import TaxesSlider from "./components/TaxesSlider"
import Navbar from "@/app/components/Navbar";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import "./globals.css"

interface Checkboxes {
  spouse: boolean;
  children: boolean;
  stepchildren: boolean;
  grandchildren: boolean;
  factualDependents: boolean;
  other: boolean;
}

interface CheckboxesAsset {
  primaryResidents: boolean;
  otherRealEstate: boolean;
  bankAccounts: boolean;
  investmentAccounts: boolean;
  businessInterests: boolean;
  personalProperty: boolean;
  otherAsset: boolean;
}

interface Message {
  id: string;
  content: string;
  role: "assistant" | "user"; // Restrict role to valid values
  encryptedName?: string;
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat();
const [consent, setConsent] = useState<string>("");

  const handleButtonConsentData = (value: string) => {
    setConsent(value);
  };
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
   const terms = [
    "Wills",
    "Trusts",
    "Power of Attorney",
    "Living Will",
    "Beneficiaries",
    "Beneficiary Designation Forms",
    "Executor",
    "Guardian",
  ];

    const [selectedScenario, setSelectedScenario] = useState<string[]>([]);
   const scenario = [
    "Scenario 1",
    "Scenario 2",
    "Scenario 3",
    "Scenario 4",
    "All Scenarios",
    
  ];

const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
   const strategies = [
    "Establish a Trust",
    "Set Up Insurance Policies",
    "Legal Agreements",
    "Buy-Sell Agreement",
    "Contingent Liability Insurance",
    "Diversified Investment Strategy",
    "Business Succession Planning",
    "Debt Repayment Plan",
    "Asset Protection Planning",
    "Separation of Personal & Business Finances",
    "Other",
    "Tell Me More About Each Option",
  ];

  const [selectedStrategiesv2, setSelectedStrategiesv2] = useState<string[]>([]);
   const strategiesv2 = [
    "Establish a Trust",
    "Set Up Insurance Policies",
    "Legal Agreements",
    "Buy-Sell Agreement",
    "Contingent Liability Insurance",
    "Diversified Investment Strategy",
    "Business Succession Planning",
    "Debt Repayment Plan",
    "Asset Protection Planning",
    "Separation of Personal & Business Finances",
    "Other",
  ];

  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [inputStr, setInputStr] = useState(input);
  const [userExists, setUserExists] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [submitOnNextUpdate, setSubmitOnNextUpdate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [videoTriggerMessageId, setVideoTriggerMessageId] = useState<
    string | null
  >(null);
  const [nextResponse, setNextResponse] = useState("");
  let isResponse = useRef("0");
  const [isChecked, setIsChecked] = useState(false);
  const [userName, setUserName] = useState("");
  const [userNameDelete, setUserNameDelete] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [encryptedName, setEncryptedName] = useState("");
  const [isUserNameCollected, setIsUserNameCollected] = useState(false);
  const [propertyRegime, setPropertyRegime] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [dependentsOver, setDependentsOver] = useState("");
  const [dependentsUnder, setDependentsUnder] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [dependentsOverStage, setDependentsOverStage] = useState(false);
  const [dependentsUnderStage, setDependentsUnderStage] = useState(false);
  const [userEmailStage, setUserEmailStage] = useState(false);
  const [dateOfBirthStage, setDateOfBirthStage] = useState(false);
  const [dateC, setDateC] = useState();

  const [currentStage, setCurrentStage] = useState(1); // Stores current stage
  const [previousStage, setPreviousStage] = useState(null); // Stores previous stage
  const [showQuestionButtons, setShowQuestionButtons] = useState(false); // Controls when to show question buttons

  const [deletionRequestData, setDeletionRequestData] = useState("");

 
  const chatboxRef = useRef<HTMLDivElement | null>(null); 
 useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to handle the button click and append the "Hello" response
  const handleAddAIResponse = (message: any) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user", // This should be 'user' for the right-side alignment
      content: inputStr, // This will be the user's input
    };

    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Must be a valid role
      content: message, // AI response content
    };

    // Append both the user input and AI response to the messages
    setMessages([...messages, userMessage, aiMessage]);

    // Clear the input field after sending
    setInputStr("");
  };

   const handleDateSelection = (year : any, month  : any, day : any) => {
    const selectedDate = `${day}-${month + 1}-${year}`; // Format the date as DD-MM-YYYY
    setInputStr(selectedDate);
  };


 // Handle the proceed button click - send definitions for selected terms
  const handleProceed = () => {
    //selectedTerms.forEach((term) => {
      handleButtonComponent(selectedTerms);
   // });
  };
   const handleProceedScenario = () => {
    //selectedTerms.forEach((term) => {
      handleButtonComponentScenario(selectedScenario);
   // });
  };
   const handleProceedStrategy = () => {
    //selectedTerms.forEach((term) => {
      handleButtonComponentStrategy(selectedStrategies);
   // });
  };
  const handleProceedStrategyv2 = () => {
    //selectedTerms.forEach((term) => {
      handleButtonComponentStrategyv2(selectedStrategiesv2);
   // });
  };
  const handleButtonComponentStrategyv2 = (messagesData: string[]) => {
    let response = "";
   if(messagesData.includes("Other")){
      response = "Please provide details of your arrangement."
    } else {
      response = "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?"
    }
    
     const userResponse = messagesData.join(", ");
   
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: userResponse, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };
   const handleButtonComponentStrategy = (messagesData: string[]) => {
    let response = "";
    if(messagesData.includes("Tell Me More About Each Option")){
      response = "That's okay! It can be overwhelming to decide on the best measures without more information. Here’s a brief overview to help you:"
    } else
    if(messagesData.includes("Other")){
      response = "Please provide details of your arrangement."
    } else {
      response = "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?"
    }
    
     const userResponse = messagesData.join(", ");
   
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: userResponse, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };
  //Here are the definition of key terms:
  const handleButtonComponentScenario = (messagesData: string[]) => {
    let response = "Here are the potential outcomes of each scenario:";
    
     const userResponse = messagesData.join(", ");
   
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: userResponse, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };
//Here are the definition of key terms:
  const handleButtonComponent = (messagesData: string[]) => {
    let response = "Here are the definition of key terms:";
    
     const userResponse = messagesData.join(", ");
   
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: userResponse, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonQuestion = (message: any) => {
    let response = "";
    if (message == "Is there anything else you'd like to ask?") {
      response = "What is your question?";
      isResponse.current = "1";
    }

    if (message == "Continue") {
      response = nextResponse;
      isResponse.current = "0";
    }

    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  
  const handleButtonConsent = (message: any) => {
     setConsent(message);
    let response = "";
    if (message == "Yes, I consent") {
      response = "Hello and welcome to Moneyversity’s Estate Planning Consultant.";
    }

    if (message == "No, I do not consent") {
      response =
        "If you have any questions or need further information about our data privacy practices, please let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  
  const handleButtonStage0 = (message: any) => {
    let response = "";
     if (message == "Let's chat again!") {
      response = "Let’s dive into the world of estate planning!";
    }
    if (message == "Absolutely") {
      response = "Let’s dive into the world of estate planning!";
    }

    if (message == "Tell me more") {
      response =
        "Let’s dive into the world of estate planning!";
    }
     if (message == "Not now") {
      response =
        "No problem at all. If you ever have questions or decide to start your estate planning, I’m here to help. Have a great day!";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };
  const handleButtonStage1 = (message: any) => {
    let response = "";
    if (message == "Tell me more") {
      response = "There are a few documents and phrases that are important when you are doing your estate planning:";
    }
 if (message == "Skip Estate Planning Explanation") {
      response = "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

 const handleButtonStage2 = (message: any) => {
    let response = "";
    if (message == "Single") {
   //   response = "There are 9 key components of estate planning:";
    }
 if (message == "Married") {
      response = "Excellent. Are you married in or out of community of property? If married out of community of property, is it with or without the accrual system?";
    }
    saveMarriage(message);

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

const handleButtonStage3 = async (message: any) => {
    let response = "";
    
    if (message == "Continue") {
      response = "Do you currently have a will in place?";
    }
    if (message == "In Community of Property") {
       await saveUserProfile({ propertyRegime: message });
      response = "Do you currently have a will in place?";
    }
    if (message == "Out of Community of Property with Accrual") {
      await saveUserProfile({ propertyRegime: message });
      response = "Excellent. In order to calculate the accrual, we need to know the specifics of your antenuptial contract (ANC). We will ask for your antenuptial contract at the end of this chat.";
    }
     if (message == "Out of Community of Property without Accrual") {
      await saveUserProfile({ propertyRegime: message });
      response = "Excellent. In order to calculate the accrual, we need to know the specifics of your antenuptial contract (ANC). We will ask for your antenuptial contract at the end of this chat.";
    }
    if (message == "I can't remember") {
      response = "No worries! Here’s a brief description of each type to help you remember:";
    }
    if (message == "What is Accrual?") {
      response = "Accrual is a concept in marriage where the growth in wealth during the marriage is shared between spouses. When a couple marries under the accrual system, each spouse keeps the assets they had before the marriage. However, any increase in their respective estates during the marriage is shared equally when the marriage ends, either through divorce or death.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

const handleButtonStage4 = async (message: any) => {
    let response = "";
     if (message == "Continue") {
      response = "Do you currently have a trust in place?";
    }
    if (message == "Yes") {
      await saveUserProfile({ will: message });
      response = "When was the last time you reviewed your will? It’s a good idea to keep it up-to-date with any changes in your life";
    }
    if (message == "No") {
       await saveUserProfile({ will: message });
      response = "Creating a will is an important step in securing your assets and ensuring your wishes are followed. We can start drafting your will right here by answering a few questions about your estate and preferences a little later in the chat.";
    }
    

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

const handleButtonStage5 = async (message: any) => {
    let response = "";
    
    if (message == "Will is up to date") {
        await saveUserProfile({ willStatus: message });
      response = "Do you currently have a trust in place?";
    }
    if (message == "Will needs to be reviewed & updated") {
        await saveUserProfile({ willStatus: message });
      response = "Do you currently have a trust in place";
    }
    

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };


const handleButtonStage6 = (message: any) => {
    let response = "";
    
    if (message == "Yes") {
      response = "Do you have any dependents?";
    }
    if (message == "No") {
      response = "Do you have any dependents?";
    }
    

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };


const handleButtonStage7 = (message: any) => {
    let response = "";
    
    if (message == "Yes, I have a question") {
       response = "Of course, I'm here to help. What would you like to know or discuss?";

      setNextResponse(
        "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs"
      );
      isResponse.current = "1";
    }
    if (message == "No, let’s move on") {
    //  response = "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs";
    response = "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs!";
    
  
  }
    

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };


































  const handleButtonStage12 = (message: any) => {
    let response = "";
    if (message == "I have a question.") {
      response = "What is your question?";

      setNextResponse(
        "It’s important to understand the legal requirements and considerations specific to South Africa:"
      );
      isResponse.current = "1";
    }

    if (message == "No, let’s move on") {
      response =
        "It’s important to understand the legal requirements and considerations specific to South Africa:";
    }
     if (message == "Proceed") {
      // response =
      //   "It’s important to understand the legal requirements and considerations specific to South Africa:";
        response =
        "Is there anything else you’d like to know about estate planning or any questions you have at this stage?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

const handleButtonStage13v1 = (message: any) => {
    let response = "";
    if (message == "Yes, I’m ready to move on") {
      response = "Let’s check out some examples to understand these options better. Here are a few examples we can simulate:";

    }

    if (message == "Skip") {
      response =
        "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs.";
    }
     

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };
  


const handleButtonStage13v2v1 = (message: any) => {
  
  let response = "";

    if (message == "Yes, I have a question.") {
      response = "What is your question?";

      setNextResponse(
        "Estate duty is a tax that has an impact on your estate. Do you want to explore estate duty further?"
      );
      isResponse.current = "1";
    }

    if (message == "No, let’s move on") {
      response =
        "Estate duty is a tax that has an impact on your estate. Do you want to explore estate duty further?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };
  
  const handleButtonStage13EstateDuty = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response = "This tax is levied on the total value of a deceased person’s estate. The conditions include:";
    }

    if (message == "No, let’s move on") {
      response =
        "Property is a common asset that is bequeathed in estate plans. Farms in particular have specific bequeathing conditions. Do you want to explore these conditions further?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

const handleButtonStage13v2 = (message: any) => {
    let response = "";

    if (message == "Yes, I have a question.") {
      response = "What is your question?";

      setNextResponse(
        "Property is a common asset that is bequeathed in estate plans. Farms in particular have specific bequeathing conditions. Do you want to explore these conditions further?"
      );
      isResponse.current = "1";
    }

    if (message == "No, let’s move on") {
      response =
        "Property is a common asset that is bequeathed in estate plans. Farms in particular have specific bequeathing conditions. Do you want to explore these conditions further?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

const handleButtonStage13v3 = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response = "A farm may only be sold to one person or entity and as such, the offer to purchase cannot be made by more than one person. An exception to this would be if a couple is married in community of property as South African law views their estate as one.";
    }

    if (message == "No, does not apply to me") {
      response =
        "Are you ready to explore some potential outcomes of different estate planning choices?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };








  const handleButtonStage13 = (message: any) => {
    let response = "";

    
    if (message == "Yes, I have a question") {
      response = "What is your question?";

      setNextResponse(
        "Would you like to see how different scenarios could impact your estate? Here are a few examples we can simulate:"
      );
      isResponse.current = "1";
    }

    if (message == "I have a question.") {
      response = "What is your question?";

      setNextResponse(
        "Would you like to see how different scenarios could impact your estate? Here are a few examples we can simulate:"
      );
      isResponse.current = "1";
    }

    if (message == "Yes, Im ready to explore some potential outcomes.") {
      response =
        "Would you like to see how different scenarios could impact your estate? Here are a few examples we can simulate:";
    }
    if (message == "No, let’s move on") {
      response =
        "Are you ready to explore some potential outcomes of different estate planning choices?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage13Component = (message: any) => {
    let response = "";

    if (message == "Scenario 1") {
      response =
        "Setting Up a Trust: Imagine you set up a trust to manage your assets. The trust could be used to provide for your children’s education and care until they reach adulthood. This can protect the assets from being mismanaged or spent too quickly. Additionally, trusts can offer tax benefits and ensure a smoother transfer of assets to your beneficiaries. Would you like to see another scenario or move on to the next step?";
    }
    if (message == "Scenario 2") {
      response =
        "Dying Intestate (Without a Will): Suppose you pass away without a will. According to South Africa’s Intestate Succession Act, your estate will be distributed to your surviving spouse and children, or other relatives if you have no spouse or children. This may not align with your personal wishes and could lead to disputes among family members. Would you like to see another scenario or move on to the next step?";
    }
    if (message == "Scenario 3") {
      response =
        "Appointing a Power of Attorney: Consider appointing a trusted person as your power of attorney. This individual can manage your financial and legal affairs if you become incapacitated. For example, they could pay your bills, manage your investments, or make medical decisions on your behalf. This ensures that your affairs are handled according to your wishes, even if you’re unable to communicate them. Would you like to see another scenario or move on to the next step?";
    }
    if (message == "Scenario 4") {
      response =
        "Tax Implications of Estate Planning Decisions: Imagine you decide to gift a portion of your assets to your children during your lifetime. While this can reduce the size of your taxable estate, it’s important to consider any potential gift taxes and how it might impact your overall estate plan. Consulting with a tax adviser can help you understand the best strategies for minimising tax liabilities while achieving your estate planning goals. Would you like to see another scenario or move on to the next step?";
    }
    if (message == "All Scenario") {
      response = "Here are the all scenario";
    }

    if (message == "No, let's move on") {
      response =
        "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation.";
    }
    if (message == "Yes, I have a question") {
      response =
        "Certainly! Let me know what you'd like to know.";
  
      setNextResponse(
        "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation."
      );
      isResponse.current = "1";
      }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage14 = (message: any) => {
    let response = "";

    if (message == "No, let’s move on") {
      response =
        "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage14Component = (message: any) => {
    let response = "";

    if (message == "No, let's move on") {
      response =
        "Great! To help you stay organised throughout the estate planning process, here are some checklists for different stages:";
    }
    if (message == "Yes") {
      response =
        "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs!";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage14Template = (message: any) => {
    let response = "";

    if (message == "Download Will Template") {
      response = "Templates are downloaded";
    }
    if (message == "Download Trust Template") {
      response = "Templates are downloaded";
    }
    if (message == "Download Power of Attorney Template") {
      response = "Templates are downloaded";
    }
    if (message == "Download Living Will Template") {
      response = "Templates are downloaded";
    }
    if (message == "Download All Templates") {
      response = "Templates are downloaded";
    }
    if (message == "Skip") {
      response = "Now that we’ve covered your personal details, let’s talk about your objectives for estate planning. Understanding your goals will help us create a plan that fits your needs perfectly. Ready to dive in?";
    }

    
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage14Checklist = (message: any) => {
    let response = "";

    if (message == "Download Checklist") {
      response = "Checklist is downloaded";
    }
    if (message == "Let’s move on") {
      response =
        "While these templates and checklists can help you get started, there are times when seeking professional legal advice is essential. Consider getting legal advice* if the following applies to you:";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage14Contact = (message: any) => {
    let response = "";

    if (
      message == "Yes" ||
      message == "Get in touch with an Old Mutual Financial Advisor"
    ) {
      response =
        "Fantastic! Our financial advisors at Old Mutual are ready to assist you in filling out these templates. Please reach out to us directly to schedule a consultation and receive personalised guidance. Here’s how you can get in touch:";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage15 = (message: any) => {
    let response = "";

    if (message == "No, let's move on") {
      response =
        "Great! To help you stay organised throughout the estate planning process, here are some checklists for different stages:";
    }
    if (message == "Continue") {
      response =
        "Great! Let’s move on to the next section where we’ll discuss your objectives for estate planning. Ready?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };
  const handleButtonStage15v2 = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Now that we’ve covered your personal details, let’s talk about your objectives for estate planning. Understanding your goals will help us create a plan that fits your needs perfectly. Ready to dive in?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage15v1 = (message: any) => {
    let response = "";

  
    if (message == "Continue") {
      response =
        "Great! To help you stay organised throughout the estate planning process, here are some checklists for different stages:";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage15Component = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Great! Here are a few key considerations to keep in mind while planning your estate. I’ll ask you some questions to get a better understanding of your specific needs and goals.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage15No = (message: any) => {
    let response = "";

    if (message == "No") {
      response =
        "No problem, I understand that estate planning can be a lot to think about. Is there something specific you'd like to discuss or any concerns you have that I can address?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage15Financial = (message: any) => {
    let response = "";

    if (message == "Yes" || message == "No") {
      response =
        "Do you own a business? If so, how important is it to you that your estate plan protects your business interests, especially in terms of its continuation if you were to pass away or become disabled?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage15TellMe = (message: any) => {
    let response = "";

    if (message == "Yes" || message == "No") {
      response =
        "Flexibility in an estate plan means it can be adjusted without major legal hurdles if your circumstances change. For instance, if tax laws change or you acquire new assets, a flexible plan allows for these updates to ensure your wishes are still carried out effectively. This can save time, reduce legal costs, and provide peace of mind knowing your plan remains relevant. Does that make sense, or would you like more details?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage16Business = (message: any) => {
    let response = "";

    if (message == "Not important") {
      response =
        "What strategies and measures would you like to have in place to ensure the financial resources set aside for retirement are safeguarded, particularly regarding your business assets or investments?";
    }
    if (message == "Average Importance") {
      response =
        "What strategies and measures would you like to have in place to ensure the financial resources set aside for retirement are safeguarded, particularly regarding your business assets or investments?";
    }
    if (message == "Very Important") {
      response =
        "What strategies and measures would you like to have in place to ensure the financial resources set aside for retirement are safeguarded, particularly regarding your business assets or investments?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage17Strategies = (message: any) => {
    let response = "";

    if (message == "No, let's move on") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Establish a Trust") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Set Up Insurance Policies") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Legal Agreement") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Buy-Sell Agreement") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Contingent Liability Insurance") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Diversified Investment Strategy") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Business Succession Planning") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Debt Repayment Plan") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Asset Protection Planning") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Separation of Personal & Business Finances") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Continue") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage17Other = (message: any) => {
    let response = "";

    if (message == "Other") {
      response = "Please provide details of your arrangement.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage17Undecided = (message: any) => {
    let response = "";

    if (message == "Tell Me More About Each Option") {
      response =
        "That's okay! It can be overwhelming to decide on the best measures without more information. Here’s a brief overview to help you:";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage18Administration = (message: any) => {
    let response = "";

    if (message == "Not important") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Average Importance") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }
    if (message == "Very Important") {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage18Component = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "To prevent any cash shortfall in your estate, how important is it to have provisions in place for your dependants' maintenance? For instance, would you want to ensure there’s enough capital to cover any immediate expenses and ongoing support for your dependants?";
    }

    if (message == "Yes") {
      response =
        "To prevent any cash shortfall in your estate, how important is it to have provisions in place for your dependants' maintenance? For instance, would you want to ensure there’s enough capital to cover any immediate expenses and ongoing support for your dependants?";
    }
    if (message == "No") {
      response =
        "To prevent any cash shortfall in your estate, how important is it to have provisions in place for your dependants' maintenance? For instance, would you want to ensure there’s enough capital to cover any immediate expenses and ongoing support for your dependants?";
    }
    if (message == "Maybe") {
      response =
        "It's understandable to be uncertain about this. Protecting assets from potential insolvency can be crucial for maintaining financial stability. Here are some points to consider";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage19Capital = (message: any) => {
    let response = "";

    if (message == "Not important") {
      response =
        "Reducing taxes and expenses payable upon your death can help maximise the value passed on to your heirs. How high a priority is it for you to minimise these costs?";
    }
    if (message == "Average Importance") {
      response =
        "Reducing taxes and expenses payable upon your death can help maximise the value passed on to your heirs. How high a priority is it for you to minimise these costs?";
    }
    if (message == "Very Important") {
      response =
        "Reducing taxes and expenses payable upon your death can help maximise the value passed on to your heirs. How high a priority is it for you to minimise these costs?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage20Final = (message: any) => {
    let response = "";

    if (message == "Yes, I have a question") {
      response = "I’m here to help! Feel free to ask any questions you have.";
       setNextResponse(
        "Let’s dive into the details of what you own to ensure we have a comprehensive understanding of your estate. Your assets play a crucial role in your estate plan."
      );
      isResponse.current = "1";
    }
    if (message == "No") {
      response =
        "Let’s dive into the details of what you own to ensure we have a comprehensive understanding of your estate. Your assets play a crucial role in your estate plan.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage21Asset = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan.";
    }
    if (message == "Upload Document at End of Chat") {
      response = "Estate Document Uploaded";
    }
    if (message == "Yes, specify detail") {
      response = "Great! Please provide the above mentioned details.";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of any of your real estate, just let me know.";
    }
    if (message == "I’m unsure of the details") {
      response =
        "To help you estimate the value of your property, let’s go through a few simple steps. This will give you a rough idea of what your property could be worth.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage21Calculator = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage20Payable = (message: any) => {
    let response = "";

    if (message == "Low") {
      response =
        "The success of your estate plan relies on accurate information about your assets, liabilities, and clear communication of your wishes. How confident are you in the accuracy of the details you’ve provided so far? And would you be open to regularly reviewing and updating your estate plan to reflect any changes?";
    }
    if (message == "Average") {
      response =
        "The success of your estate plan relies on accurate information about your assets, liabilities, and clear communication of your wishes. How confident are you in the accuracy of the details you’ve provided so far? And would you be open to regularly reviewing and updating your estate plan to reflect any changes?";
    }
    if (message == "High") {
      response =
        "The success of your estate plan relies on accurate information about your assets, liabilities, and clear communication of your wishes. How confident are you in the accuracy of the details you’ve provided so far? And would you be open to regularly reviewing and updating your estate plan to reflect any changes?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage20 = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Thanks for sharing your thoughts, "+userName+". It’s important to have a clear understanding of your objectives so we can tailor your estate plan to meet your needs. Is there anything else you’d like to add before we move on?";
    }
    if (message == "No") {
      response =
        "Thanks for sharing your thoughts, "+userName+". It’s important to have a clear understanding of your objectives so we can tailor your estate plan to meet your needs. Is there anything else you’d like to add before we move on?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage22Farm = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of the farm";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of the farm, just let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage22Vehicle = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your vehicle";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your vehicle, just let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage23Jewelry = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan.?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan.?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your valuable possessions";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your valuable possessions, just let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage24Household = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your household";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your household";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage25Portfolio = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account.";
    }

    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your investment portfolio";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your investment portfolio";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage25Cash = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your cash savings or deposits in bank accounts";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your cash savings or deposits in bank accounts";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage26BusinessInterest = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your business interest";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your business interest";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage27SignificantAssets = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your significant assets";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your significant assets";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage28Intellectual = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your intellectual property rights";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your intellectual property rights";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage29LegalEntities = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your legal entities";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your legal entities";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage30Mortgage = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your outstanding mortgage loan";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your outstanding mortgage loan";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage31PersonalLoan = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your current personal loan";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your current personal loan";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage32CreditCardDebt = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your credit card debt";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your credit card debt";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage33VehicleLoan = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your vehicle loan";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your vehicle loan";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage34OutstandingDebt = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have a strategy in place for managing and reducing your liabilities over time?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have a strategy in place for managing and reducing your liabilities over time?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your outstanding debt";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your outstanding debt";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage35Strategy = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any significant changes expected in your liabilities in the foreseeable future?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any significant changes expected in your liabilities in the foreseeable future?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your strategy";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your strategy";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage36SignificantChanges = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your significant changes expected in your liabilities";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your significant changes expected in your liabilities";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage37LifeInsurance = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are you covered by any health insurance policies/plans that is not a Medical Aid? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are you covered by any health insurance policies/plans that is not a Medical Aid? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your life insurance policies";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your life insurance policies";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage38HealthInsurance = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your health insurance policies";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your health insurance policies";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage39HoldingsInsured = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your insurance provider";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your insurance provider";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage40VehicleInsured = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your vehicle insurance provider";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your vehicle insurance provider";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage41Disability = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Disability insurance can be structured as a single capital lump sum or monthly income replacer. Which type of disability insurance do you currently have, or are you considering?";
    }
    if (message == "No") {
      response =
        "Disability insurance can provide financial security if you’re unable to work due to illness or injury. It ensures that you have a source of income to cover living expenses and maintain your standard of living. Would you like more information or assistance in obtaining disability insurance and understanding its benefits?";
    }
    if (message == "Not Sure") {
      response =
        "Disability insurance can provide financial security if you’re unable to work due to illness or injury. It ensures that you have a source of income to cover living expenses and maintain your standard of living. Would you like more information or assistance in obtaining disability insurance and understanding its benefits?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };
  const handleButtonStage41DisabilitySecurity = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Do you have contingent liability insurance to cover unexpected liabilities that may arise?";
    }

    if (message == "Yes") {
      response =
        "Great, I will have one of our financial advisors get in touch regarding obtaining disability insurance";
    }
    if (message == "No") {
      response =
        "Do you have contingent liability insurance to cover unexpected liabilities that may arise?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage41DisabilityInsurance = (message: any) => {
    let response = "";

    if (message == "Single Capital Lump Sum") {
      response =
        "It's important to note that the coverage you can take may be limited. Are you aware of any limitations on your disability insurance coverage?";
    }
    if (message == "Monthly Income Replacer") {
      response =
        "It's important to note that the coverage you can take may be limited. Are you aware of any limitations on your disability insurance coverage?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage41DisabilityCoverage = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Do you have contingent liability insurance to cover unexpected liabilities that may arise?";
    }
    if (message == "Yes") {
      response =
        "Do you have contingent liability insurance to cover unexpected liabilities that may arise?";
    }
    if (message == "No, I'm not aware") {
      response =
        "I recommend reviewing your current disability insurance policy to understand any limitations it may have. Checking details like maximum benefit amounts, coverage duration, and specific conditions that are excluded will help ensure you have adequate protection. Please get back to me once you've reviewed your policy.";
    }
    if (message == "I'm not sure.") {
      response =
        "I recommend reviewing your current disability insurance policy to understand any limitations it may have. Checking details like maximum benefit amounts, coverage duration, and specific conditions that are excluded will help ensure you have adequate protection. Please get back to me once you've reviewed your policy.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage41ContingentInsurance = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "If you own a business, have you considered buy and sell insurance to protect your business partners and family?";
    }
    if (message == "Yes") {
      response =
        "If you own a business, have you considered buy and sell insurance to protect your business partners and family?";
    }
    if (message == "No") {
      response =
        "I recommend considering contingent liability insurance as it can protect you against unexpected financial obligations. It’s especially useful if you've provided personal guarantees or securities for business obligations. Please think about whether this might be a valuable addition to your insurance portfolio and let me know if you have any questions or need assistance with this.";
    }
    if (message == "I'm not sure.") {
      response =
        "I recommend considering contingent liability insurance as it can protect you against unexpected financial obligations. It’s especially useful if you've provided personal guarantees or securities for business obligations. Please think about whether this might be a valuable addition to your insurance portfolio and let me know if you have any questions or need assistance with this.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage42BuyAndSell = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "For business owners, key person insurance can help the business survive the loss of a crucial employee. Do you have this in place?";
    }
    if (message == "Yes") {
      response =
        "For business owners, key person insurance can help the business survive the loss of a crucial employee. Do you have this in place?";
    }
    if (message == "No, I don't have a business") {
      response =
        "Buy and sell insurance is designed to ensure that, in the event of your death or disability, your business can continue to operate smoothly. It provides funds to your business partners to buy out your share, protecting both your family’s financial interests and the business’s continuity. It might be worth exploring this option to safeguard your business and your loved ones. Please review your current situation and get back to me if you have any questions or need further assistance.";
    }
    if (message == "No, I haven't considered it") {
      response =
        "Buy and sell insurance is designed to ensure that, in the event of your death or disability, your business can continue to operate smoothly. It provides funds to your business partners to buy out your share, protecting both your family’s financial interests and the business’s continuity. It might be worth exploring this option to safeguard your business and your loved ones. Please review your current situation and get back to me if you have any questions or need further assistance.";
    }
    if (message == "Unsure") {
      response =
        "Buy and sell insurance is designed to ensure that, in the event of your death or disability, your business can continue to operate smoothly. It provides funds to your business partners to buy out your share, protecting both your family’s financial interests and the business’s continuity. It might be worth exploring this option to safeguard your business and your loved ones. Please review your current situation and get back to me if you have any questions or need further assistance.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage43BusinessOwner = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Do you have any other types of insurance not already covered? Please provide details about the type of coverage and the insurance provider.";
    }
    if (message == "Yes") {
      response =
        "Do you have any other types of insurance not already covered? Please provide details about the type of coverage and the insurance provider.";
    }
    if (message == "No") {
      response =
        "Key person insurance provides financial support to your business if a key employee, whose expertise and skills are critical to the company's success, passes away or becomes disabled. It can help cover the cost of finding and training a replacement, as well as mitigate potential financial losses. If you think this could benefit your business, consider discussing it further with our financial adviser to ensure your business is protected.";
    }
    if (message == "Unsure") {
      response =
        "Key person insurance provides financial support to your business if a key employee, whose expertise and skills are critical to the company's success, passes away or becomes disabled. It can help cover the cost of finding and training a replacement, as well as mitigate potential financial losses. If you think this could benefit your business, consider discussing it further with our financial adviser to ensure your business is protected.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage44InsuranceConvered = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details about any other type of insurance you have";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details about any other type of insurance you have, just let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage45ReviewedInsurance = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }

    if (message == "Upload Document at End of Chat") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Now, let's discuss funeral cover. Funeral cover provides liquidity to your beneficiaries within a short time frame after submitting a claim. Have you considered obtaining funeral cover?";
    }
    if (message == "No, let’s move on") {
      response =
        "Now, let's discuss funeral cover. Funeral cover provides liquidity to your beneficiaries within a short time frame after submitting a claim. Have you considered obtaining funeral cover?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage46Continue = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "Understanding your investment holdings helps us assess your overall financial position and develop strategies to maximise the value of your estate. Please provide as much detail as possible for each of the following questions.";
    }

    if (message == "No") {
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Understanding your investment holdings helps us assess your overall financial position and develop strategies to maximise the value of your estate. Please provide as much detail as possible for each of the following questions."
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage47InvestmentHolding = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date.";
    }

    if (message == "Upload Document at End of Chat") {
      response =
        "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your stocks or equities";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your stocks or equities";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage48FixedIncome = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund.";
    }

    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund.";
    }
    if (message == "Yes, specify detail") {
      response = "Great! Please provide the types of bonds mentioned above.";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready, please provide the types of bonds you are interested in.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage48MutualFunds = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account.";
    }

    if (message == "Upload Document at End of Chat") {
      response =
        "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your investments in mutual funds.";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your investments in mutual funds.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage49RetirementFunds = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties.";
    }

    if (message == "Upload Document at End of Chat") {
      response =
        "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your type of retirement account.";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your type of retirement account.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage50EstateHoldings = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value.";
    }

    if (message == "Upload Document at End of Chat") {
      response =
        "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value.";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your investment properties or real estate holdings";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your investment properties or real estate holdings";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage51AssetClasses = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?";
    }

    if (message == "Upload Document at End of Chat") {
      response =
        "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your asset classes.";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details of your asset classes.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage52InvestmentGoals = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any specific changes or adjustments you're considering making to your investment portfolio in the near future?";
    }
    if (message == "Yes") {
      response =
        "Are there any specific changes or adjustments you're considering making to your investment portfolio in the near future?";
    }
    if (message == "No") {
      response =
        "Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial adviser can help you define these parameters and create a tailored investment strategy.";
    }
    if (message == "Unsure") {
      response =
        "Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial adviser can help you define these parameters and create a tailored investment strategy.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage53SpecificChanges = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response = "Great! Next, we’ll discuss estate duty. Shall we continue?";
    }
    if (message == "Yes") {
      response = "Great! Next, we’ll discuss estate duty. Shall we continue?";
    }
    if (message == "No") {
      response =
        "It's always a good idea to periodically review your investment portfolio to ensure it aligns with your financial goals and risk tolerance. If you're not currently considering any changes, it might be helpful to schedule a regular review with a financial adviser to stay informed about potential opportunities or necessary adjustments based on market conditions and your evolving financial situation.";
    }
    if (message == "Unsure") {
      response =
        "It's always a good idea to periodically review your investment portfolio to ensure it aligns with your financial goals and risk tolerance. If you're not currently considering any changes, it might be helpful to schedule a regular review with a financial adviser to stay informed about potential opportunities or necessary adjustments based on market conditions and your evolving financial situation.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage54Final = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Now let's discuss estate duty, the tax on the total value of your estate if you were to pass away today with your current will or distribution wishes in place. Understanding this helps us ensure your estate plan minimises taxes and maximises what is passed on to your heirs. Ready to get started?";
    }
    if (message == "No") {
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage55EstateDuty = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response = "Do you bequeath your estate to your spouse?";
    }
    if (message == "No") {
      response =
        "No problem, I understand that there's a lot to think about. Is there something specific you'd like to discuss or any concerns you have that I can address?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage56CurrentWill = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "When was the last time you reviewed your will? It’s a good idea to keep it up to date with any changes in your life.";
    }
    if (message == "No") {
      response =
        "Creating a will is an important step in securing your assets and ensuring your wishes are followed. We can start drafting your will right here by answering a few questions about your estate and preferences.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage57ImportantStep = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response = "Do you bequeath your estate to your spouse?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage57ReviewedWill = (message: any) => {
    let response = "";

    if (message == "Will is up to date") {
      response =
        "Let's go over the details of your current will. How are your assets distributed according to your current will? Here are some specific questions to help clarify this:";
    }
    if (message == "Will needs to be reviewed & updated") {
      response =
        "Let's go over the details of your current will. How are your assets distributed according to your current will? Here are some specific questions to help clarify this:";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage58EstateSpouse = (message: any) => {
    let response = "";

    if (message == "Yes, my entire estate") {
      response =
        "That's a significant decision. To ensure we capture your wishes accurately, could you specify if there are any conditions or limitations attached to this bequest?";
    }
    if (message == "Yes, a significant portion of my estate") {
      response =
        "Thank you for sharing. Could you clarify what percentage or which assets you intend to leave to your spouse?";
    }
    if (message == "No, estate divided among other beneficiaries") {
      response =
        "Understood. Could you provide details on how you would like your estate to be distributed among the other beneficiaries?";
    }
    if (message == "No, spouse receives only a specific portion") {
      response =
        "I see. Could you specify the percentage or assets you'd like your spouse to receive?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage59Residue = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Do you bequeath any portion of your estate to the Trustees of any specific trust?";
    }
    if (message == "No") {
      response =
        "Do you bequeath any portion of your estate to the Trustees of any specific trust?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage60Bequeath = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Please provide the trustees and beneficiaries for this trust. Are the beneficiaries an income beneficiary or a capital beneficiary? For example, the asset in question is a house, the income beneficiary is entitled to receive the rental from the property. If the house is sold, then the capital beneficiary is entitled to receive the proceeds from the sale.";
    }
    if (message == "No") {
      response =
        "Does your will include a plan for setting up a trust after you pass away?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage61PassAway = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response = "Who are the beneficiaries of this trust?";
    }
    if (message == "No") {
      response =
        "Do you have a farm or any specific property bequeathed to a trust?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage62Bequeathed = (message: any) => {
    let response = "";

    if (message == "Yes") {
      firstTip.current = 1;
      response =
        "USEFUL TIP";
        
    }
    if (message == "No") {
      response =
        "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage63AssetsManaged = (message: any) => {
    let response = "";

    response =
      "Certain third parties may be responsible for estate duty based on the assets they receive. Do you have any specific instructions or details about third-party liability for estate duty in your current will?";

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage64ThirdParties = (message: any) => {
    let response = "";

    if (message == "Yes, I have it in my current will") {
      response =
        "USEFUL TIP";
       
    }
    if (message == "No, I have not included specific instructions") {
      response =
        "Understood. It's crucial to consider this aspect carefully. Would you like to discuss potential options for addressing third-party liability in your estate plan?";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage65Stages = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Great, one of our financial advisors will be in touch in this regard.";
    }
    if (message == "No") {
      response =
        "Great, one of our financial advisors will be in touch in this regard.";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage65CurrentWill = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Great! Next, we’ll look at the executor’s fees. Shall we continue?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Great! Next, we’ll look at the executor’s fees. Shall we continue?";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready to provide the details, just let me know.";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage65PotentialOption = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Excellent! There are several strategies we can explore to address third-party liability in your estate plan. One option is to include specific provisions in your will outlining how estate duty should be handled for third parties. We can also consider setting up trusts or other structures to manage these liabilities effectively. Would you like to explore these options further?";
    }
    if (message == "No") {
      response =
        "Excellent! There are several strategies we can explore to address third-party liability in your estate plan. One option is to include specific provisions in your will outlining how estate duty should be handled for third parties. We can also consider setting up trusts or other structures to manage these liabilities effectively. Would you like to explore these options further?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage66EstateDutyCurrentWillFinal = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated.";
    }
    if (message == "No") {
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated."
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage67ExecutorFee = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Remember, no executor’s fees are payable on proceeds from policies with a beneficiary nomination, as these are paid directly to the nominated beneficiary by the insurance company. Do you have any such policies?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage68Payable = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response = "Great! Please provide the policy details.";
    }

    if (message == "No") {
      response =
        "Thank you for providing these details. Now, we can move on to the next part of your estate planning. Ready to continue?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage69ExecutorFinal = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Now, let's talk about the liquidity position of your estate. This helps us understand if there are enough liquid assets available to cover estate costs without having to sell off assets. Ready to proceed?";
    }

    if (message == "No") {
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Now, let's talk about the liquidity position of your estate. This helps us understand if there are enough liquid assets available to cover estate costs without having to sell off assets. Ready to proceed?"
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage70Liquidity = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Liquidity is essential to cover estate costs without having to sell assets. Are you aware of any sources of liquidity in your estate, such as cash reserves or liquid investments?";
    }

    if (message == "No") {
      response =
        "No problem, I understand that there is a lot to think about. Is there something specific you'd like to discuss or any concerns you have that I can address?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage71LiquidityEssential = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "If there's a shortfall, there are a few options. The executor may ask heirs to contribute cash to prevent asset sales. Are you open to this option?";
    }
    if (message == "Yes, specify") {
      response =
        "Great! Please provide the details of the sources of liquidity.";
    }

    if (message == "No, I have no significant sourced of liquidity") {
      response =
        "If there's a shortfall, there are a few options. The executor may ask heirs to contribute cash to prevent asset sales. Are you open to this option?";
    }

    if (message == "Unsure, will need assistance") {
      response =
        "Great! Based on the information you've provided earlier, we can review your existing financial assets and investments to assess their liquidity. We will include this information in the report shared at the end of this conversation.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage72Shortfall = (message: any) => {
    let response = "";

    if (message == "Yes, with considerations") {
      response =
        "Thank you for your openness to this option. When considering this approach, it's essential to assess the financial impact on each heir and ensure fairness in the distribution of responsibilities. Factors such as each heir's financial situation, willingness to contribute, and the impact on their inheritance should be carefully considered. Would you like guidance on how to navigate these considerations?";
    }
    if (message == "No, assets should be sold to cover shortfall") {
      response =
        "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?";
    }

    if (message == "I need more information before deciding") {
      response =
        "Sure! In the event of a shortfall, the executor may explore various options to cover expenses without liquidating assets prematurely. These options could include negotiating payment terms with creditors, utilising existing insurance policies, or securing a loan against estate assets. Each option comes with its own set of considerations and implications. Would you like further details on these options to help you make an informed decision?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage73FinancialImpact = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?";
    }
    if (message == "Yes") {
      response =
        "Great! Our financial advisors at Old Mutual can help you and your heirs understand the financial implications and create a fair strategy. They can assist in evaluating each heir’s ability to contribute, ensure clear communication among all parties, and develop a plan that respects everyone's circumstances. We'll include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage74Shortfall = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?";
    }
    if (message == "Yes") {
      response = "Excellent! Here are some details on the potential options:";
    }
    if (message == "No") {
      response =
        "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage75SellingAsset = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Borrowing funds is another option, but it could be costly and limit asset use if assets are used as security. Have you considered this option?";
    }
    if (message == "I am open to selling assets") {
      response =
        "Borrowing funds is another option, but it could be costly and limit asset use if assets are used as security. Have you considered this option?";
    }
    if (message == "I am against selling assets") {
      response =
        "Borrowing funds is another option, but it could be costly and limit asset use if assets are used as security. Have you considered this option?";
    }
    if (message == "I need more information before deciding") {
      response =
        "It's understandable to have reservations about selling assets, especially if it affects your long-term plans for asset distribution or business continuity. Selling assets can impact the legacy you wish to leave behind and may disrupt the stability of family businesses. However, it's essential to balance these concerns with the immediate need to cover a shortfall. Exploring alternative financing options or negotiating payment terms with creditors could help alleviate the need for asset liquidation. Would you like to explore these alternatives further?";
    }
    if (message == "I’d like to explore alternative financing options") {
      response =
        "Absolutely! When facing a shortfall, selling assets isn't the only option available. Alternative financing strategies, such as securing loans against estate assets, negotiating payment terms with creditors, or utilising existing insurance policies, can provide additional flexibility without compromising your long-term goals for asset distribution. Each option comes with its own set of considerations and implications, so it's essential to weigh them carefully. Our financial advisors can help you set this up.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage76Reservation = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Borrowing funds is another option, but it could be costly and limit asset use if assets are used as security. Have you considered this option?";
    }
    if (message == "Yes") {
      response = "Great! Here are some alternative options you might consider:";
    }
    if (message == "No") {
      response =
        "Borrowing funds is another option, but it could be costly and limit asset use if assets are used as security. Have you considered this option?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage77BorrowingFunds = (message: any) => {
    let response = "";
    if (message == "I am open to borrowing funds") {
      response =
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route?";
    }
    if (message == "I am against borrowing funds") {
      response =
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route?";
    }
    if (message == "I need more information before deciding") {
      response =
        "Absolutely, it's essential to fully understand the implications before making a decision. Borrowing funds can indeed be costly, especially if assets are used as security, as it may limit their use and potentially increase financial risk. I can provide more detailed information on the costs involved, potential risks, and alternative financing options to help you make an informed decision. Would you like to explore these aspects further?";
    }
    if (message == "I’d like to explore alternative financing options") {
      response =
        "Exploring alternative financing options is a prudent approach to ensure you make the best decision for your estate. There are various strategies available, such as negotiating payment terms with creditors, utilising existing insurance policies, or seeking financial assistance from family members or business partners. Each option has its pros and cons, so it's essential to weigh them carefully. Would you like more information on these alternative financing options?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage77FinancialRisk = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route";
    }
    if (message == "Yes") {
      response = "Great! Here are some important aspects to consider:";
    }
    if (message == "No") {
      response =
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage77Alternative = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route?";
    }
    if (message == "Yes") {
      response =
        "Great! Here are some alternative financing options to consider:";
    }
    if (message == "No") {
      response =
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage78LifeInsurance = (message: any) => {
    let response = "";
    if (message == "Against") {
      response =
        "Thank you for discussing your estate's liquidity position. Let's discuss maintenance claims. Ready?";
    }
    if (message == "Considering") {
      response =
        "Thank you for discussing your estate's liquidity position. Let's discuss maintenance claims. Ready?";
    }
    if (message == "Agree") {
      response =
        "Thank you for discussing your estate's liquidity position. Let's discuss maintenance claims. Ready?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage79LiquidityEnd = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "Let's discuss maintenance claims in terms of court orders. If you pass away while there are maintenance obligations towards children or a former spouse, they will have a maintenance claim against your estate. Are you aware of any existing maintenance obligations or court orders?";
    }
    if (message == "No") {
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Let's discuss maintenance claims in terms of court orders. If you pass away while there are maintenance obligations towards children or a former spouse, they will have a maintenance claim against your estate. Are you aware of any existing maintenance obligations or court orders?"
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage80Claims = (message: any) => {
    let response = "";
    if (message == "I have court ordered maintenance obligations") {
      response =
        "It's crucial to consider these maintenance obligations in your estate planning to ensure they are adequately addressed. Court-ordered maintenance obligations typically take precedence and must be factored into your estate plan to avoid potential disputes or legal complications. Would you like assistance in incorporating these obligations into your estate plan? If so, please provide the details of the court order.";
    }
    if (message == "I have informal agreements, not court orders") {
      response =
        "While informal agreements may not have the same legal standing as court orders, they are still important to consider in your estate planning. Even informal arrangements could result in maintenance claims against your estate if not addressed properly. Would you like guidance on how to formalise these agreements or ensure they are appropriately accounted for in your estate plan?";
    }
    if (message == "I don’t have any maintenance obligations") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }
    if (
      message ==
      "I haven’t considered maintenance claims in relation to my estate planning"
    ) {
      response =
        "It's essential to assess any potential maintenance claims in relation to your estate to avoid unexpected complications for your heirs. Even if you haven't formalised maintenance obligations through court orders or agreements, they may still arise based on legal obligations. Would you like assistance in evaluating and addressing any potential maintenance claims in your estate planning?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage81Obligations = (message: any) => {
    let response = "";
    if (message == "Upload Document at End of Chat") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above-mentioned details about your life insurance policy and how it will be payable to the testamentary trust.";
    }
    if (message == "No, let’s move on") {
      response =
        "No problem. Whenever you're ready, please provide the details about your life insurance policy.";
    }
    if (message == "Continue") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage81Agreements = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about life insurance policy in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }
    if (message == "Maybe") {
      response =
        "No problem. Whenever you're ready to provide the details about life insurance policy, just let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage81Complications = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about life insurance policy in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }
    if (message == "Maybe") {
      response =
        "No problem. Whenever you're ready to provide the details about life insurance policy option, just let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage82LifeInsurance = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "That's a proactive approach to ensuring adequate provision for maintenance obligations. Have you already taken steps to set up such a policy, or would you like assistance in exploring this option further?";
    }
    if (message == "No") {
      response =
        "It's an important consideration to ensure that your loved ones are provided for in the event of your passing. If you'd like, we can discuss the benefits and implications of setting up a life insurance policy payable to a testamentary trust to cover maintenance obligations. Would you like more information on this option?";
    }
    if (message == "Unsure") {
      response =
        "It's an important consideration to ensure that your loved ones are provided for in the event of your passing. If you'd like, we can discuss the benefits and implications of setting up a life insurance policy payable to a testamentary trust to cover maintenance obligations. Would you like more information on this option?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage83Proactive = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?";
    }
    if (message == "I have set up a policy") {
      response =
        "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?";
    }
    if (message == "I need assistance in setting up a policy") {
      response =
        "We will include information about assistance with setting up a policy in the report that will be shared at the end of this conversation.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage83Passing = (message: any) => {
    let response = "";
    if (message == "No") {
      response =
        "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?";
    }
    if (message == "Continue") {
      response =
        "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?";
    }
    if (message == "Yes") {
      response =
        "Setting up a life insurance policy payable to a testamentary trust can ensure that maintenance obligations are met without burdening your estate. This approach provides a reliable income stream for your beneficiaries. Our financial advisors at Old Mutual can provide detailed guidance and help you explore this option further.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage84Provision = (message: any) => {
    let response = "";
    if (message == "I have provisions in place") {
      response =
        "It's great that you've already made provisions for your surviving spouse. Would you like to review your existing provisions to ensure they align with your current goals and circumstances?";
    }
    if (message == "I want to make provisions in my estate planning") {
      response =
        "Making provisions for your surviving spouse ensures their financial security after you're gone. We can discuss various options for including these provisions in your estate plan. Would you like more information on this?";
    }
    if (message == "I don’t want to make provisions in my estate planning") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }
    if (message == "I need more information before deciding") {
      response =
        "Sure, understanding the implications and options for provisions for your surviving spouse is crucial. Would you like more information on how this can be incorporated into your estate planning?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage84ExistingProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }
    if (message == "Yes") {
      response =
        "Reviewing your existing provisions can ensure they are still appropriate and effective given your current situation and goals. We will include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage84OptionProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }
    if (message == "Yes") {
      response =
        "Providing for your surviving spouse can be done through various means, such as setting up a trust, designating life insurance benefits, or specifying direct bequests in your will. Our financial advisors at Old Mutual can guide you through these options to find the best solution for your needs. We will include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage84CrucialProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }
    if (message == "Yes") {
      response =
        "Incorporating provisions for your surviving spouse can be an essential part of a comprehensive estate plan. Understanding the legal and financial implications will help you make an informed decision. Our financial advisors at Old Mutual can provide you with the necessary information and advice. We will include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage85FactorsProvision = (message: any) => {
    let response = "";
    if (
      message ==
      "Yes, I have considered them and have factored them into my estate planning"
    ) {
      response =
        "It's excellent that you've already considered these factors in your estate planning. Would you like to discuss how they can further inform your decisions and ensure your plan aligns with your goals?";
    }
    if (
      message ==
      "I am aware of these factors but haven’t considered them in my estate planning"
    ) {
      response =
        "Understanding these factors is essential for effective estate planning. Would you like assistance in incorporating them into your estate plan to ensure it reflects your wishes and circumstances?";
    }
    if (message == "No, I haven’t thought about these factors yet") {
      response =
        "No worries, considering these factors can help you create a more comprehensive estate plan. Would you like assistance in understanding how they may impact your estate planning decisions?";
    }
    if (message == "I need more information before I can respond") {
      response =
        "Sure, understanding these factors is crucial for effective estate planning. Would you like more information on how they can influence your estate planning decisions before you respond?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage85GoalsProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?";
    }
    if (message == "Yes") {
      response =
        "Great! When these factors are considered, it helps ensure that your estate plan is tailored to meet your specific circumstances. For example, longer marriages or significant disparities in earning capacity might necessitate larger or longer-term maintenance provisions. Keeping your plan flexible and periodically reviewing it can help accommodate any changes in your situation. Would you like to delve deeper into any particular area?";
    }
    if (message == "No") {
      response =
        "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage85UnderstandingProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?";
    }
    if (message == "Yes") {
      response =
        "Excellent! Incorporating these factors into your estate plan ensures a fair and well-thought-out approach to maintenance and asset distribution. For instance, ensuring that your plan addresses the financial needs of a surviving spouse based on their age and earning capacity can provide long-term security. We will include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage85ComprehensiveProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?";
    }
    if (message == "Yes") {
      response =
        "Wonderful! Understanding how these factors impact your estate planning can help you make more informed decisions. For example, considering the spouse's earning capacity can guide how much and how long maintenance should be provided, and knowing the size of your assets helps in deciding the distribution method. We will include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage85EffectiveProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?";
    }
    if (message == "Yes") {
      response =
        "Perfect! Knowing how these factors influence your estate planning can help ensure your plan is both fair and effective. For instance, a longer marriage might lead to more substantial maintenance claims, and a larger estate might require more detailed planning to minimize tax implications. We will include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage85MaintenanceProvision = (message: any) => {
    let response = "";
    if (
      message == "Insurance policy with my spouse as the nominated beneficiary"
    ) {
      response =
        "Do your dependents require any income per month for maintenance?";
    }
    if (message == "Testamentary trust for spouse outlines in my will") {
      response =
        "Do your dependents require any income per month for maintenance?";
    }
    if (message == "I’m open to either option") {
      response =
        "Both options have their advantages. With an insurance policy, the benefit is usually paid out quickly and directly to your spouse, providing immediate financial support. On the other hand, setting up a testamentary trust in your will offers more control over how the funds are managed and distributed, ensuring long-term financial security for your spouse and potential tax benefits. We can discuss the specifics of each option further and tailor the solution to best meet your needs. Would you like to explore these options in more detail?";
    }
    if (message == "I’m not sure, I need more information of each option") {
      response =
        "Absolutely! Let's delve deeper into both options. An insurance policy with your spouse as the nominated beneficiary provides immediate liquidity and financial support to your spouse upon your passing. However, a testamentary trust outlined in your will can offer ongoing financial security, asset protection, and control over how the funds are used and distributed. We can discuss the benefits, considerations, and implications of each option to help you make an informed decision. How does that sound?";
    }
    if (message == "I’d like to explore other options") {
      response =
        "Certainly! Besides the options mentioned, there are alternative ways to provision for maintenance, such as setting up annuities, creating specific bequests in your will, or establishing a family trust. Each option has its unique advantages and considerations. We can explore these alternatives further and tailor a solution that aligns with your estate planning goals. Would you like to discuss these options in more detail?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage85BenefitProvision = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response = "Great! Here’s a brief overview of each option:";
    }
    if (message == "No") {
      response =
        "Do your dependents require any income per month for maintenance?";
    }
    if (message == "Continue") {
      response =
        "Do your dependents require any income per month for maintenance?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage86DeeperProvision = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response = "Great! Here’s a brief overview of each option:";
    }
    if (message == "No") {
      response =
        "Do your dependents require any income per month for maintenance?";
    }
    if (message == "Continue") {
      response =
        "Do your dependents require any income per month for maintenance?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage86AnnuitiesProvision = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "Certainly! Besides insurance policies and testamentary trusts, you might consider options such as:";
    }
    if (message == "No") {
      response =
        "Do your dependents require any income per month for maintenance?";
    }
    if (message == "Continue") {
      response =
        "Do your dependents require any income per month for maintenance?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage87ShortFall = (message: any) => {
    let response = "";
    if (
      message ==
      "I have capital available to generate an income for my dependents"
    ) {
      response =
        "Additional life assurance can provide the capital required for the income needs of dependents. Have you considered obtaining additional life insurance for this purpose?";
    }
    if (
      message == "I have capital but unsure if it will generate enough income"
    ) {
      response =
        "It's essential to ensure that the capital you have can generate sufficient income to support your dependents after your passing. We can work together to assess your current financial situation, projected expenses, and income needs to determine if any adjustments or additional planning are necessary to bridge any potential income shortfalls. Would you like to review your financial situation in more detail?";
    }
    if (
      message == "I haven’t thought of this aspect of financial planning yet"
    ) {
      response =
        "Planning for the financial well-being of your dependents is a crucial aspect of estate planning. We can assist you in evaluating your current financial situation, projected expenses, and income needs to ensure that your loved ones are adequately provided for in the event of your passing. Would you like to explore this aspect of financial planning further?";
    }
    if (message == "I need more information to determine this") {
      response =
        "Understanding the capital available to your dependents and its potential to generate income is essential for effective estate planning. We can help you gather the necessary information and provide guidance to evaluate your current financial situation, projected expenses, and income needs. Together, we can determine the most suitable strategies to ensure financial security for your loved ones. Would you like assistance in assessing your financial situation?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage87Capital = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Additional life assurance can provide the capital required for the income needs of dependents. Have you considered obtaining additional life insurance for this purpose?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about your financial situation and any necessary adjustments in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Additional life assurance can provide the capital required for the income needs of dependents. Have you considered obtaining additional life insurance for this purpose?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage87Planning = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Additional life assurance can provide the capital required for the income needs of dependents. Have you considered obtaining additional life insurance for this purpose?";
    }
    if (message == "Yes") {
      response =
        "We'll include this financial planning information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Additional life assurance can provide the capital required for the income needs of dependents. Have you considered obtaining additional life insurance for this purpose?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage87Dependents = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Additional life assurance can provide the capital required for the income needs of dependents. Have you considered obtaining additional life insurance for this purpose?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about your financial situation and strategies in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Additional life assurance can provide the capital required for the income needs of dependents. Have you considered obtaining additional life insurance for this purpose?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage88Additional = (message: any) => {
    let response = "";
    if (message == "My current life insurance coverage is sufficient") {
      response =
        "Excellent! Now, let's continue with your estate planning. Ready?";
    }
    if (
      message ==
      "I’m currently reviewing my options for additional life insurance"
    ) {
      response =
        "It's prudent to periodically review your life insurance coverage to ensure that it aligns with your current financial situation and the needs of your dependents. We can assist you in evaluating your insurance needs and exploring suitable options for additional coverage based on your evolving circumstances. Would you like guidance in assessing your life insurance needs and exploring available options?";
    }
    if (
      message ==
      "No, I haven’t considered obtaining M additional life insurance"
    ) {
      response =
        "Life insurance can play a vital role in providing financial security for your dependents in the event of your passing. If you haven't considered obtaining additional coverage, it may be worthwhile to explore your options and ensure that your loved ones are adequately protected. We can help you evaluate your insurance needs and identify suitable coverage options. Would you like assistance in exploring the benefits of additional life insurance?";
    }
    if (
      message ==
      "I’m unsure if additional life insurance is necessary given my current financial situation"
    ) {
      response =
        "Understanding the necessity of additional life insurance coverage requires a thorough assessment of your current financial situation and the future needs of your dependents. We can assist you in evaluating your financial circumstances and determining whether additional coverage is warranted based on your specific situation. Would you like to review your financial situation and assess the potential benefits of additional life insurance?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage88Coverage = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Excellent! Now, let's continue with your estate planning. Ready?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about your life insurance needs and options in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Excellent! Now, let's continue with your estate planning. Ready?";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage88LifeInsurance = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Excellent! Now, let's continue with your estate planning. Ready?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about your life insurance needs and coverage options in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Excellent! Now, let's continue with your estate planning. Ready?";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage88Assessment = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Excellent! Now, let's continue with your estate planning. Ready?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about your financial situation and potential life insurance needs in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Excellent! Now, let's continue with your estate planning. Ready?";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage89Final = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?";
    }
    if (message == "No") {
      response =
        "Absolutely! I'm here to assist. What would you like to ask?";
      setNextResponse(
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?"
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage90FuneralCover = (message: any) => {
    let response = "";
    if (message == "Yes, I have funeral cover in place") {
      response =
        "It's recommended to nominate a beneficiary on the funeral cover to ensure prompt payment to your beneficiaries. Have you nominated a beneficiary on your funeral cover policy?";
    }
    if (message == "No, I haven’t considered obtaining funeral cover") {
      response =
        "Funeral cover can offer peace of mind by providing financial assistance to your loved ones during a challenging time. If you haven't considered obtaining funeral cover, it may be worth exploring to ensure that your family is financially prepared to cover funeral expenses. We can help you understand the benefits of funeral cover and assist you in finding a suitable policy that meets your needs. Would you like more information on the benefits of funeral cover and how it can benefit your family?";
    }
    if (message == "I need more information before deciding") {
      response =
        "Understanding the specifics of funeral cover and its benefits can help you make an informed decision about whether it's the right choice for you. We're here to provide you with all the information you need to assess the value of funeral cover and its relevance to your financial planning. Is there any specific information you'd like to know about funeral cover to help you make a decision?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage90NominateFuneralCover = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?";
    }
    if (message == "No") {
      response =
        "Nominating a beneficiary on your funeral cover policy ensures that the benefit is paid directly to the intended recipient without delays. It's a simple step that can provide peace of mind to your loved ones during a difficult time. Would you like assistance in nominating a beneficiary on your funeral cover policy?";
    }
    if (message == "Wasn’t aware this was an option") {
      response =
        "Nominating a beneficiary on your funeral cover policy ensures that the benefit is paid directly to the intended recipient without delays. It's a simple step that can provide peace of mind to your loved ones during a difficult time. Would you like assistance in nominating a beneficiary on your funeral cover policy?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage90BeneficiaryFuneralCover = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about nominating a beneficiary on your funeral cover policy in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage90AssistanceFuneralCover = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response = "Here’s an outline of the benefits of funeral cover:";
    }
    if (message == "No") {
      response =
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage90ImmediateFuneralCover = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?";
    }
    if (message == "Yes") {
      response =
        "We will include details on tailoring funeral cover to your needs or finding a suitable policy in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage90specificsFuneralCover = (message: any) => {
    let response = "";
    if (message == "Yes, I have a question") {
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?"
      );
      isResponse.current = "1";
    }

    if (message == "No") {
      response =
        "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage91Trust = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "There are two types of trusts: inter vivos trusts and testamentary trusts. Inter vivos trusts are established during your lifetime, while testamentary trusts are created in your will and come into effect after your death. Have you considered setting up a trust?";
    }

    if (message == "No") {
      response =
        "Trusts are an integral part of estate planning and can offer various benefits such as asset protection, tax efficiency, and control over asset distribution. They involve a legal arrangement where a trustee holds and manages assets for the benefit of beneficiaries. Trusts can be useful for preserving wealth, providing for loved ones, and ensuring your wishes are carried out. Would you like to explore how trusts can be tailored to meet your specific needs?";
    }
    if (message == "Tell me more") {
      response =
        "Trusts are an integral part of estate planning and can offer various benefits such as asset protection, tax efficiency, and control over asset distribution. They involve a legal arrangement where a trustee holds and manages assets for the benefit of beneficiaries. Trusts can be useful for preserving wealth, providing for loved ones, and ensuring your wishes are carried out. Would you like to explore how trusts can be tailored to meet your specific needs?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage91Integral = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "There are two types of trusts: inter vivos trusts and testamentary trusts. Inter vivos trusts are established during your lifetime, while testamentary trusts are created in your will and come into effect after your death. Have you considered setting up a trust?";
    }
    if (message == "Yes") {
      response =
        "We will include information on how trusts can be tailored to your specific needs in the report shared at the end of this conversation.";
    }

    if (message == "No") {
      response =
        "There are two types of trusts: inter vivos trusts and testamentary trusts. Inter vivos trusts are established during your lifetime, while testamentary trusts are created in your will and come into effect after your death. Have you considered setting up a trust?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage92Vivos = (message: any) => {
    let response = "";
    if (message == "Yes, I have considered setting up a trust") {
      response =
        "Yes, I have considered setting up a trustTrusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?";
    }
    if (message == "No, I haven’t thought about setting up a trust yet") {
      response =
        "No, I haven’t thought about setting up a trust yetSetting up a trust can be a valuable component of your estate plan, providing various benefits such as asset protection, wealth preservation, and efficient distribution of assets to beneficiaries. Would you like more information on how trusts can benefit your specific situation?";
    }

    if (
      message == "I’m currently exploring the possibility of setting up a trust"
    ) {
      response =
        "Exploring the possibility of setting up a trust is a proactive step in your estate planning journey. Trusts offer numerous advantages, including privacy, control over asset distribution, and tax efficiency. If you have any questions or need guidance on this process, feel free to ask.";
    }

    if (message == "I’m not sure if setting up a trust is necessary for me") {
      response =
        "It's understandable to have reservations or uncertainty about setting up a trust. Trusts can be customised to suit your unique needs and goals, offering flexibility and protection for your assets. If you're unsure about whether a trust is right for you, we can discuss your concerns and explore alternative options.";
    }

    if (
      message == "I have some knowledge about trusts but need more information"
    ) {
      response =
        "I have some knowledge about trusts but need more informationHaving some knowledge about trusts is a great starting point. However, it's essential to have a clear understanding of how trusts work and how they can benefit your estate planning strategy. If you need more information or have specific questions, feel free to ask, and I'll be happy to assist you.";
    }

    if (
      message ==
      "I have specific concerns or questions about setting up a trust"
    ) {
      response =
        "Addressing specific concerns or questions about setting up a trust is crucial for making informed decisions about your estate plan. Whether you're unsure about the process, concerned about potential implications, or have questions about trust administration, I'm here to provide guidance and support. Feel free to share your concerns, and we can discuss them further.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage92Setting = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage93Beneficial = (message: any) => {
    let response = "";
    if (
      message ==
      "Yes, protecting my estate against insolvency is a priority for me"
    ) {
      response =
        "Additionally, transferring assets to a trust can save on executor's fees and exclude assets from your estate for estate duty purposes. Have you thought about these advantages in relation to your estate planning?";
    }
    if (
      message == "I’m concerned about safeguarding assets in case of divorce"
    ) {
      response =
        "Additionally, transferring assets to a trust can save on executor's fees and exclude assets from your estate for estate duty purposes. Have you thought about these advantages in relation to your estate planning?";
    }
    if (
      message == "Pegging growth in my estate sounds like a beneficial strategy"
    ) {
      response =
        "Additionally, transferring assets to a trust can save on executor's fees and exclude assets from your estate for estate duty purposes. Have you thought about these advantages in relation to your estate planning?";
    }
    if (message == "All of these reasons are relevant to my estate planning") {
      response =
        "Additionally, transferring assets to a trust can save on executor's fees and exclude assets from your estate for estate duty purposes. Have you thought about these advantages in relation to your estate planning?";
    }
    if (message == "None of these reasons are currently a priority for me") {
      response =
        "Additionally, transferring assets to a trust can save on executor's fees and exclude assets from your estate for estate duty purposes. Have you thought about these advantages in relation to your estate planning?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage94Executor = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Donation of assets to a trust. This can remove assets from your estate and allow further growth within the trust and not increasing the value of your personal estate. Are you considering donating assets to a trust?";
    }
    if (
      message ==
      "Yes, saving on executor’s fees is an important consideration for me"
    ) {
      response =
        "Donation of assets to a trust. This can remove assets from your estate and allow further growth within the trust and not increasing the value of your personal estate. Are you considering donating assets to a trust?";
    }
    if (
      message ==
      "Excluding assets from my estate for estate duty purposes is a key factor in my planning"
    ) {
      response =
        "Donation of assets to a trust. This can remove assets from your estate and allow further growth within the trust and not increasing the value of your personal estate. Are you considering donating assets to a trust?";
    }
    if (
      message ==
      "I’m interested in exploring how transferring assets to a trust could benefit me"
    ) {
      response =
        "Exploring how transferring assets to a trust could benefit you is a wise decision in estate planning. It offers various advantages, such as reducing executor's fees and estate duty obligations, as well as providing asset protection and efficient distribution to beneficiaries. If you're interested in learning more about these benefits and how they apply to your specific situation, I am here to provide further information and guidance.";
    }
    if (
      message ==
      "I haven’t considered these advantages before, but they sound appealing"
    ) {
      response =
        "Exploring how transferring assets to a trust could benefit you is a wise decision in estate planning. It offers various advantages, such as reducing executor's fees and estate duty obligations, as well as providing asset protection and efficient distribution to beneficiaries. If you're interested in learning more about these benefits and how they apply to your specific situation, I'm here to provide further information and guidance.";
    }
    if (
      message ==
      "I’m not sure how significant these advantages before would be for my estate planning"
    ) {
      response =
        "Understanding the significance of advantages like saving on executor's fees and excluding assets from your estate for estate duty purposes is essential in crafting an effective estate plan. These benefits can have a significant impact on preserving your wealth and ensuring efficient asset distribution. If you're uncertain about their significance or how they apply to your estate planning, I can provide more details and clarify any questions you may have.";
    }
    if (
      message ==
      "I need more information to understand how these advantages would apply to my situation"
    ) {
      response =
        "It's understandable to need more information to fully grasp how the advantages of transferring assets to a trust would apply to your situation. These advantages, such as saving on executor's fees and estate duty obligations, can vary depending on individual circumstances. If you require further clarification or personalised insights into how these benefits would impact your estate planning, I'm here to assist you and provide the information you need.";
    }
    if (
      message ==
      "I’m primarily focused on other aspects of my estate planning right now"
    ) {
      response =
        "Addressing specific concerns or questions about setting up a trust is crucial for making informed decisions about your estate plan. Whether you're unsure about the process, concerned about potential implications, or have questions about trust administration, I'm here to provide guidance and support. Feel free to share your concerns, and we can discuss them further.";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage95Donation = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "It's important to note that while this strategy can reduce estate duty, there may be tax implications. Are you aware of the potential donations tax liability?";
    }
    if (message == "Yes, I’m interested in exploring this option") {
      response =
        "It's important to note that while this strategy can reduce estate duty, there may be tax implications. Are you aware of the potential donations tax liability?";
    }
    if (
      message ==
      "I’m not sure if donating assets to a trust aligns with my estate planning goals"
    ) {
      response =
        "Understanding how donating assets to a trust aligns with your estate planning goals is crucial for making informed decisions. Donating assets to a trust can offer various benefits, including asset protection, estate tax reduction, and efficient wealth transfer. However, it's essential to ensure that this strategy aligns with your overall estate planning objectives. If you're unsure about its compatibility with your goals, I can provide more information and help you evaluate whether it's the right choice for your estate plan.";
    }
    if (message == "I need more information before deciding") {
      response =
        "Gathering more information before deciding on donating assets to a trust is a prudent approach. This strategy involves transferring assets to a trust, which can have implications for asset protection, tax planning, and wealth preservation. If you require additional details about how this option works, its potential benefits, and any considerations specific to your situation, I'm here to provide the necessary information and support your decision-making process.";
    }
    if (
      message ==
      "I’m not comfortable with the idea of donating assets to a trust"
    ) {
      response =
        "I’m not comfortable with the idea of donating assets to a trustIt's important to note that while this strategy can reduce estate duty, there may be tax implications. Are you aware of the potential donations tax liability?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage96Strategy = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "Next, let's talk about selling assets to the trust. This can be a strategic way to remove assets from your estate. However, it’s important to note that a loan account is not automaticaaly created unless there’s a difference between the sale price and the value of the asset. Have you considered selling assets to the trust in this way?";
    }
    if (message == "No") {
      response =
        "Donations tax is a tax imposed on the transfer of assets to a trust or natural person without receiving adequate consideration in return. It's important to understand that while transferring assets to a trust can help reduce estate duty, it may trigger donations tax liabilities. The amount of donations tax payable depends on several factors, including the value of the assets transferred, any available exemptions or deductions, and the relationship between the donor and the recipient. The donations tax threshold is R100 000 per year.";
    }
    if (message == "Tell me more") {
      response =
        "Donations tax is a tax imposed on the transfer of assets to a trust or natural person without receiving adequate consideration in return. It's important to understand that while transferring assets to a trust can help reduce estate duty, it may trigger donations tax liabilities. The amount of donations tax payable depends on several factors, including the value of the assets transferred, any available exemptions or deductions, and the relationship between the donor and the recipient. The donations tax threshold is R100 000 per year.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage97Donation = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Next, let's talk about selling assets to the trust. This can be a strategic way to remove assets from your estate. However, it’s important to note that a loan account is not automaticaaly created unless there’s a difference between the sale price and the value of the asset. Have you considered selling assets to the trust in this way?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage98Assets = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Selling assets to the trust might reduce estate duty, but a sale and loan agreement should be in place if a loan account is to be created. Are you familiar with the terms and conditions of such agreements?";
    }
    if (message == "Yes, I’m interested in exploring this option") {
      response =
        "Selling assets to a trust can help minimize estate duty and protect your assets. However, remember that if the sale price matches the asset's value, a loan account won't be created. Additionally, capital gains tax and transfer duty may apply if the asset is a capital asset like property. We can discuss how this option fits with your estate planning goals.";
    }
    if (
      message ==
      "I’m not sure if selling assets to a trust aligns with my estate planning goals"
    ) {
      response =
        "It's crucial to align your estate planning strategies with your goals. Selling assets to a trust can offer benefits, such as reducing estate duty, but it also comes with implications like capital gains tax and transfer duty. If you're unsure whether this strategy is right for you, we can discuss it further to ensure it aligns with your specific needs and circumstances.";
    }
    if (message == "I need more information before deciding") {
      response =
        "Understanding the full implications of selling assets to a trust is key. While it can offer estate planning benefits, it's important to consider the potential tax implications, like capital gains tax and transfer duty. If you need more information on how this works and its impact on your estate planning, I’m here to provide the necessary details.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage99Selling = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Lastly, let's discuss the costs and tax consequences of transferring assets to a trust. This may include capital gains tax, transfer duty (for immovable property), and possible donations tax. Have you taken these factors into account?";
    }
    if (message == "I have some understanding but need more clarity") {
      response =
        "It’s great that you have some understanding of sale and loan agreements. These agreements outline the sale terms and the loan's repayment terms if a loan account is created. If you need more clarity or have questions about specific aspects of these agreements, feel free to ask. I’m here to help provide additional information and support your understanding.";
    }
    if (
      message == "I need assistance in understanding the terms and conditions"
    ) {
      response =
        "Sale and loan agreements can be complex, especially when transferring assets to a trust. These agreements detail the sale transaction and the loan terms, if applicable. If you need help understanding these terms and conditions, or have questions about how they apply to your situation, I’m here to provide guidance and support.";
    }
    if (
      message ==
      "I prefer not to engage in agreements that involve selling assets to a trust"
    ) {
      response =
        "Lastly, let's discuss the costs and tax consequences of transferring assets to a trust. This may include capital gains tax, transfer duty (for immovable property), and possible donations tax. Have you taken these factors into account?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage99Final = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Now, let's explore the concept of an investment trust. This structure allows for annual donations to the trust, reducing your estate over time. Are you interested in setting up an investment trust?";
    }
    if (message == "Yes, I am familiar") {
      response =
        "Selling assets to a trust can be a strategic way to transfer assets out of your estate, potentially reducing estate duty and protecting your wealth. However, it’s important to consider the potential tax implications, such as capital gains tax and transfer duty, and whether a loan account will actually be created. If you’re interested in exploring this option further, we can dive into the specifics and see how it aligns with your overall estate planning goals.";
    }
    if (message == "I have some understanding but need more clarity") {
      response =
        "It's good to hear that you have some understanding of the costs and tax consequences associated with transferring assets to a trust. These factors can indeed be complex, and it's important to have a clear understanding to make informed decisions. If you need more clarity on any specific aspects of these costs and tax implications or if you have any questions about how they may impact your estate planning, feel free to ask. I'm here to provide additional information and support your understanding.";
    }
    if (message == "I need more information before deciding") {
      response =
        "Understanding the costs and tax implications of transferring assets to a trust is crucial for making informed decisions in your estate planning. If you need more information before deciding, I'm here to help. We can discuss these factors in more detail, clarify any questions you may have, and ensure that you have a comprehensive understanding of how they may affect your estate plan. Feel free to ask any questions or raise any concerns you may have.";
    }
    if (
      message ==
      "I’m not comfortable with the potential costs & tax implications at this time"
    ) {
      response =
        "Now, let's explore the concept of an investment trust. This structure allows for annual donations to the trust, reducing your estate over time. Are you interested in setting up an investment trust?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage100Investment = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "An investment trust can provide flexibility for the trust beneficiaries to receive income and borrow funds. Does this align with your estate planning goals?";
    }
    if (message == "Yes, I’m interested") {
      response =
        "Setting up an investment trust can be a strategic way to manage your assets and reduce your estate over time. It allows for annual donations to the trust, which can have various benefits for your estate planning. If you're interested in exploring this option further, we can discuss the specifics of how an investment trust could align with your estate planning goals and tailor a plan to suit your needs.";
    }
    if (
      message ==
      "I’m not sure if an investment trust aligns with my estate planning goals"
    ) {
      response =
        "It's understandable to have questions about whether an investment trust aligns with your estate planning goals. An investment trust can offer unique advantages, but it's essential to ensure that it fits your specific needs and objectives. If you're uncertain, we can delve deeper into how an investment trust works and explore whether it's the right option for you.";
    }
    if (message == "I prefer to explore other options") {
      response =
        "Exploring different options is an important part of estate planning, and it's essential to find the approach that best suits your needs and objectives. If you prefer to explore other options besides setting up an investment trust, we can discuss alternative strategies and find the solution that aligns most closely with your estate planning goals.";
    }
    if (message == "I need more information before deciding") {
      response =
        "Making an informed decision about whether to set up an investment trust requires a clear understanding of how it works and how it may impact your estate planning goals. If you need more information before deciding, feel free to ask any questions you may have. We can discuss the specifics of an investment trust, its benefits, and how it may fit into your overall estate plan.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage101InvestmentFlexibility = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Thanks! Do you have anything you’d like to add or any questions that I can help you with today?";
    }
    if (message == "Yes") {
      response =
        "Thanks! Do you have anything you’d like to add or any questions that I can help you with today?";
    }
    if (message == "No") {
      response =
        "If an investment trust doesn't align with your estate planning goals, we can explore other options that may better suit your needs. Estate planning is a personalised process, and it's essential to find strategies that align closely with your objectives and preferences. Let's discuss alternative approaches to ensure your estate plan reflects your wishes and priorities.";
    }
    if (message == "Tell me more") {
      response =
        "An investment trust offers flexibility for beneficiaries to receive income and borrow funds, providing potential advantages for estate planning. With an investment trust, you can structure distributions in a way that aligns with your goals and preferences. If you're interested in learning more about how an investment trust could benefit your estate plan, I can provide further details on how it works and its potential advantages.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleButtonStage101Final = (message: any) => {
    let response = "";
    if (message == "Yes, I have a question") {
      response =
        "Thanks! Do you have anything you’d like to add or any questions that I can help you with today?";
      setNextResponse(
        "Thanks for your time today! Your information will be reviewed by a financial adviser, and you can expect to hear back soon with a detailed report.Have a great day, and we’re looking forward to helping you secure your future!"
      );
      isResponse.current = "1";
    }
    if (message == "No") {
      response =
        "Thanks for your time today! Your information will be reviewed by a financial adviser, and you can expect to hear back soon with a detailed report.Have a great day, and we’re looking forward to helping you secure your future!";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "user", // User message role
      content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, userMessage, aiMessage]);
  };

  const saveUserProfile = async (update: any) => {
    let retries = 0;

    // Show the loading indicator
    setLoading(true);
    setError("");

    const profile = {
      name: userName || "",
      deletionRequest: deletionRequestData || "",
      dateCreated: dateC || "",
      dateOfBirth: dateOfBirth || "",
      emailAddress: userEmail || "",
      dependentsOver: dependentsOver || "",
      dependentsUnder: dependentsUnder || "",
      propertyRegime: propertyRegime || "",
      encryptedName: encryptedName || "",
      checkboxes: checkboxes || {},
      checkboxesAsset: checkboxesAsset || {},
      maritalStatus: maritalStatus || "",
      ...update,
    };

    // Don't include `dateCreated` in updates, unless it's a new profile

    while (retries < MAX_RETRIES) {
      try {
        const response = await axios.post("/api/userProfiles", profile);
        if (response.status === 200) {
          setLoading(false); // Success, hide the loading indicator
          return response.data;
        }
      } catch (err: any) {
        // Check for specific error like ECONNRESET
        if (err.code === "ECONNRESET") {
          retries += 1;
          setRetryCount(retries);
          console.error(`Retry ${retries}/${MAX_RETRIES}: Connection reset`);

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        } else {
          setError("Failed to save profile. Please try again.");
          break;
        }
      }
    }

    setLoading(false); // Stop loading if retries exceed limit
  };

  useEffect(() => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
        "Before we start the chat, we want to ensure you’re comfortable with us collecting and storing your personal information securely. This data will only be used to help create your estate plan. Do you consent to this?"
         // "Hello 😊 and welcome to Moneyversity's Estate Planning Consultant 🤖. I'm here to help you navigate the estate planning process with ease. Together, we'll ensure your assets and wishes are well- documented and protected. Ready to get started on this important journey?",
      },
    ]);
  }, [setMessages]);

  useEffect(() => {
    if (submitOnNextUpdate) {
      const formEvent = { preventDefault: () => {} };
      handleSubmit(formEvent as React.FormEvent<HTMLFormElement>);
      setSubmitOnNextUpdate(false);
    }
  }, [submitOnNextUpdate, handleSubmit]);

  useEffect(() => {
    const triggerMessage = messages.find(
      (message) =>
        message.content.includes("initiate video") ||
        message.content.includes("Initiate video")
    );
    if (triggerMessage) {
      setVideoTriggerMessageId(triggerMessage.id);
    }
  }, [messages]);

  const [checkboxes, setCheckboxes] = useState<Checkboxes>({
    spouse: false,
    children: false,
    stepchildren: false,
    grandchildren: false,
    factualDependents: false,
    other: false,
  });

  // Function to format camelCase keys into readable text
  const formatLabel = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camelCase words
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // Add space between uppercase letters
      .toLowerCase() // Convert all text to lowercase
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
  };

  const [checkboxesAsset, setCheckboxesAsset] = useState<CheckboxesAsset>({
    primaryResidents: false,
    otherRealEstate: false,
    bankAccounts: false,
    investmentAccounts: false,
    businessInterests: false,
    personalProperty: false,
    otherAsset: false,
  });

  const updateInputStr = (assetState: any, otherState: any) => {
    const checkedItems = [
      ...Object.keys(assetState).filter((key) => assetState[key]),
      ...Object.keys(otherState).filter((key) => otherState[key]),
    ];
    setInputStr(checkedItems.join(", "));
  };

  const handleSubmitWithRetry = async (
    event: React.FormEvent<HTMLFormElement>,
    retries = MAX_RETRIES
  ) => {
    event.preventDefault();
    let attempt = 0;

    while (attempt < retries) {
      try {
        handleSubmit(event); // Try submitting the message
        setRetryCount(0); // Reset retry count if successful
        setError(""); // Clear any previous errors
        break; // Exit the loop if submission is successful
      } catch (error: any) {
        attempt += 1;
        setRetryCount(attempt);
        setError(`Attempt ${attempt}/${MAX_RETRIES} failed. Retrying...`);

        if (attempt >= retries) {
          setError("Failed to submit after several attempts.");
          break;
        }

        // Wait for the retry delay before the next attempt
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  };

  // Automatically resubmit previous user input after error
  useEffect(() => {
    if (submitOnNextUpdate && inputStr.trim()) {
      const formEvent = { preventDefault: () => {} };
      handleSubmitWithRetry(formEvent as React.FormEvent<HTMLFormElement>);
      setSubmitOnNextUpdate(false);
    }
  }, [submitOnNextUpdate, inputStr]);

  useEffect(() => {
    handleInputChange({
      target: { value: inputStr },
    } as React.ChangeEvent<HTMLInputElement>);
  }, [inputStr]);

  const handleCheckboxChangeAsset = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, checked } = e.target;
    const updatedCheckboxesAsset = { ...checkboxesAsset, [id]: checked };

    setCheckboxesAsset(updatedCheckboxesAsset);
    updateInputStr(updatedCheckboxesAsset, checkboxes);

    await saveUserProfile({ checkboxesAsset: updatedCheckboxesAsset });
  };

    // Handle checkbox change
  const handleCheckboxChangeTerms = (event: React.ChangeEvent<HTMLInputElement>) => {
     const term = event.target.value;
    if (selectedTerms.includes(term)) {
      setSelectedTerms(selectedTerms.filter((item) => item !== term));
    } else {
      setSelectedTerms([...selectedTerms, term]);
    }
  };

    // Handle checkbox change
  const handleCheckboxChangeScenario = (event: React.ChangeEvent<HTMLInputElement>) => {
     const Scenario = event.target.value;
    if (selectedScenario.includes(Scenario)) {
      setSelectedScenario(selectedScenario.filter((item) => item !== Scenario));
    } else {
      setSelectedScenario([...selectedScenario, Scenario]);
    }
  };

      // Handle checkbox change
  const handleCheckboxChangeStrategies = (event: React.ChangeEvent<HTMLInputElement>) => {
     const Strategies = event.target.value;
    if (selectedStrategies.includes(Strategies)) {
      setSelectedStrategies(selectedStrategies.filter((item) => item !== Strategies));
    } else {
      setSelectedStrategies([...selectedStrategies, Strategies]);
    }
  };

    const handleCheckboxChangeStrategiesv2 = (event: React.ChangeEvent<HTMLInputElement>) => {
     const Strategiesv2 = event.target.value;
    if (selectedStrategiesv2.includes(Strategiesv2)) {
      setSelectedStrategiesv2(selectedStrategiesv2.filter((item) => item !== Strategiesv2));
    } else {
      setSelectedStrategiesv2([...selectedStrategiesv2, Strategiesv2]);
    }
  };

  const handleCheckboxChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, checked } = e.target;
    const updatedCheckboxes = { ...checkboxes, [id]: checked };
    console.log("Updated Checkboxes:", updatedCheckboxes); // Log the updated checkboxes

    setCheckboxes(updatedCheckboxes);
    updateInputStr(checkboxesAsset, updatedCheckboxes);

    await saveUserProfile({ checkboxes: updatedCheckboxes });
  };
  const handleButtonPrivacy = async (message: any) => {
    setPrivacyPolicy(true);
    handleInputChange({
      target: { value: message },
    } as React.ChangeEvent<HTMLInputElement>);
    setSubmitOnNextUpdate(true);
  };

  const handleButtonFunFact = async (message: any) => {
    handleInputChange({
      target: { value: message },
    } as React.ChangeEvent<HTMLInputElement>);
    setSubmitOnNextUpdate(true);
  };
  const handleButtonClick = async (message: any) => {
    const allowedStatuses = ["Single", "Married", "Divorced", "Widowed"];

    if (allowedStatuses.includes(message)) {
      setMaritalStatus(message);
      await saveUserProfile({ maritalStatus: message });
    }
    handleInputChange({
      target: { value: message },
    } as React.ChangeEvent<HTMLInputElement>);
    setSubmitOnNextUpdate(true);
  };

  const saveDependentsOver = async (message: any) => {
    await saveUserProfile({ dependentsOver: message });
  };
  const saveDependentsUnder = async (message: any) => {
    await saveUserProfile({ dependentsUnder: message });
  };
  const saveUserEmail = async (message: any) => {
    await saveUserProfile({ emailAddress: message });
  };
  const saveDateOfBirth = async (message: any) => {
    await saveUserProfile({ dateOfBirth: message });
  };
  const saveTypeOfMarriage = async (message: any) => {
    await saveUserProfile({ propertyRegime: message });
  };
  const saveMarriage = async (message: any) => {
    await saveUserProfile({ maritalStatus: message });
  };
  const saveDeletionRequest = async (message: any, messageName: any) => {
    setDeletionRequestData("true");

    setUserName(messageName);
    console.log(userName + " " + message);
    await saveUserProfile({ name: messageName, deletionRequest: "true" });
  };

  const handleButtonClickRegime = async (message: any) => {
    const allowedStatuses = [
      "In Community of Property",
      "Out of Community of Property with Accrual",
      "Out of Community of Property without Accrual",
      "I can't remember",
      "What is Accrual?",
    ];
    await saveUserProfile({ propertyRegime: message });
    // if (allowedStatuses.includes(message)) {
    //   setPropertyRegime(message);
    //   await saveUserProfile({ propertyRegime: message });
    //   console.log("savedatahere", message)
    // }
    handleInputChange({
      target: { value: message },
    } as React.ChangeEvent<HTMLInputElement>);
    setSubmitOnNextUpdate(true);
  };

  const setAllCheckboxesFalse = () => {
    setCheckboxes((prevState) => {
      const newState: Checkboxes = {
        spouse: false,
        children: false,
        stepchildren: false,
        grandchildren: false,
        factualDependents: false,
        other: false,
      };

      return newState;
    });

    setCheckboxesAsset((prevState) => {
      const newState: CheckboxesAsset = {
        primaryResidents: false,
        otherRealEstate: false,
        bankAccounts: false,
        investmentAccounts: false,
        businessInterests: false,
        personalProperty: false,
        otherAsset: false,
      };

      return newState;
    });
  };

  // const savePropertyRegime = async (input: any) => {
  //   const validInputs = ['community of property', 'out of community of property'];

  //   if (validInputs.includes(input.toLowerCase())) {
  //     // Call saveUserProfile with the property regime
  //     setRegime(input);
  //     await saveUserProfile({ propertyRegime: input });
  //     console.log("data22", regime)
  //   } else {
  //     console.log('Invalid input.');
  //   }
  // };

  const saveUserName = async (message: any, dateNow: any) => {
    const secretKey = "MLKN87y8VSH&Y*SF"; // Replace with your own secret key
    const encryptedName = CryptoJS.AES.encrypt(message, secretKey).toString();
    setDateC(dateNow);
    setUserName(message);
    setEncryptedName(encryptedName);
    setIsUserNameCollected(true);

    await saveUserProfile({
      name: message,
      dateCreated: dateNow,
      dateOfBirth: "N/A",
      emailAddress: "N/A",
      dependentsOver: "N/A",
      dependentsUnder: "N/A",
      propertyRegime: "N/A",
      mvID: encryptedName,
      encryptedName,
      checkboxes: {},
      checkboxesAsset: {},
      maritalStatus: "",
    });
  };

  async function userProfile(messageAI: any) {
    console.log(isUserNameCollected);
    // if (isUserNameCollected) {
    //   return; // Exit the function if the username has already been collected
    // }

    try {
      // const response = await axios.post("/api/chatAnalyze", {
      //   messages: [
      //     {
      //       content:
      //         "Please analyze the provided data and extract the user name. Respond solely with the user name in the format '{name}'. If the data does not contain a name, respond only with '404'." +
      //         messageAI,
      //       role: "user",
      //       createdAt: new Date(),
      //     },
      //   ],
      // });

      // let newMessages: Message[] = [];
      // if (typeof response.data === "string") {
      //   const responseLines = response.data
      //     .split("\n")
      //     .filter((line) => line.trim() !== "");
      //   newMessages = responseLines.map((content) => ({
      //     id: uuidv4(),
      //     content,
      //     role: "assistant", // Ensure role is set if not in the response
      //   }));
      // } else if (Array.isArray(response.data.messages)) {
      //   newMessages = response.data.messages.map((msg: any) => ({
      //     ...msg,
      //     id: uuidv4(),
      //   }));
      // } else {
      //   throw new Error("Invalid response format");
      // }

      // const userName = newMessages[0].content;

      // // Check if the response contains '404'
      // if (userName.includes("404")) {
      //   return; // Exit the function if the response contains '404'
      // }
      const cleanedUserName = messageAI.replace(/<\|[^|]*\|>/g, "");
      // Encrypt the user name
      const secretKey = "MLKN87y8VSH&Y*SF"; // Replace with your own secret key
      const encryptedName = CryptoJS.AES.encrypt(
        cleanedUserName,
        secretKey
      ).toString();

      // Update state variables

      setUserName(cleanedUserName);
      setEncryptedName(encryptedName);
      setIsUserNameCollected(true);

      // Log the name and encrypted name
      console.log(`Name: ${cleanedUserName}`);
      console.log(`Encrypted Name: ${encryptedName}`);

      // Save the username to the database with default values for other fields
      await saveUserProfile({
        name: cleanedUserName,
        dateOfBirth: "N/A",
        deletionRequest: "N/A",
        emailAddress: "N/A",
        dependentsOver: "N/A",
        dependentsUnder: "N/A",
        propertyRegime: "N/A",
        encryptedName,
        checkboxes: {},
        checkboxesAsset: {},
        maritalStatus: "",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const getImageUrl = (filename: string) => {
    try {
      // Create the URL with query parameters
      const url = `https://moneyversity-ai-chat.vercel.app/api/uploads?filename=${encodeURIComponent(
        filename
      )}`;
      console.log("Generated URL:", url);
      return url;
    } catch (error) {
      console.error("Error generating image URL:", error);
      return "";
    }
  };
  const [loading, setLoading] = useState(true);
  const handleImageLoad = () => {
    setLoading(false);
  };

  // Function to handle image load errors (optional)
  const handleImageError = () => {
    setLoading(false);
  };

  const messageData = useRef("");
  const firstTip = useRef(0);
  const trigger = useRef(false);

  const checkUserExists = async (username: string) => {
    try {
      setIsCheckingUser(true);
      const response = await axios.get(`/api/checkUser?username=${username}`);
      setUserExists(response.data.exists);
      setIsCheckingUser(false);
    } catch (error) {
      console.error("Error checking user:", error);
      setUserExists(false);
      setIsCheckingUser(false);
    }
  };
  useEffect(() => {
    if (
      inputStr.trim() !== "" &&
      messageData.current.includes(
        "Can you please provide your user name so I can assist you with deleting"
      )
    ) {
      checkUserExists(inputStr);
    }
  }, [inputStr]);
  const renderMessages = () => {
    return messages.map((message, index) => {
      const isVideoTrigger = message.id === videoTriggerMessageId;
      const questionResponseStage12 = message.content.includes(
        "Is there anything else you’d like to know about estate planning, or any questions you have at this stage?"
      );

      const triggerPoint = message.content.includes(
        "Great! Let’s move on to the next section where we’ll discuss what estate planning is and why it is important."
      );
      trigger.current = triggerPoint;

      const questionResponse1 =
        message.content.includes(
          "we’ll discuss what estate planning is and why it is important. Ready?"
        ) ||
        message.content.includes(
          "Do you have any other questions or need further information?"
        ) ||
        message.content.includes("why it is important, Ready?");
      const potentialOutcomes =
        message.content.includes("Setting Up a Trust:") ||
        message.content.includes("Dying Intestate (Without a Will):") ||
        message.content.includes("Appointing a Power of Attorney:") ||
        message.content.includes(
          "Tax Implications of Estate Planning Decisions:"
        ) ||
        (message.content.includes(
          "Would you like to see how this scenario could impact your estate?"
        ) &&
          !message.content.includes("Here are a few examples"));

      const educationInformation = message.content.includes(
        "There are a few documents and phrases that are important when you are doing your estate planning:"
      );
      const legalRequirement = message.content.includes(
        "It’s important to understand the legal requirements and considerations specific to South Africa:"
      );
      const scenarioSimulation = message.content.includes(
        "Would you like to see how different scenarios could impact your estate? Here are a few examples we can simulate"
      );
      const templateButton = message.content.includes(
        "let’s create a customised estate planning process tailored to your needs!"
      );
      const faqStage = message.content.includes(
        "Now that we’ve explored these scenarios, would you like to move on to some frequently asked questions about estate planning in South Africa? This will help you understand more about the process and address any additional concerns you might have."
      );
      const stepByStep = message.content.includes(
        "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs"
      );
      const isMaritalStatusQuestion =
        message.content.includes("Single, Married") ||
        message.content.includes("Are you married") ||
        message.content.includes("your marital status") ||
        message.content.includes("current marital status") ||
        (message.content.includes("single, married") &&
          !message.content.includes("accrual"));
      const isDependentsQuestion =
        message.content.includes("any dependents") &&
        !message.content.includes("18");
      const isMajorAsset = message.content.includes(
        "What are your major assets"
      );
      const funFact = message.content.includes(
        "Before we continue with your assets"
      );
      const reg =
        message.content.includes("type of marriage") ||
        message.content.includes("marriage include the accrual system") ||
        (message.content.includes("kind of marriage do you have") &&
          !message.content.includes("Spouse") &&
          !message.content.includes("spouse"));
      const birth =
        message.content.includes("tell me your date of birth.") ||
        message.content.includes("please provide your date of birth?") ||
        message.content.includes("provide your date of birth.") ||
        message.content.includes("provide your date of birth") ||
        message.content.includes("date of birth?") ||
        message.content.includes("have your date of birth") ||
        message.content.includes("What is your date of") ||
        message.content.includes("your date of birth.") ||
        message.content.includes("about your date of birth.") ||
        message.content.includes("were you born") ||
        message.content.includes("ask for your date of birth");
      const video = message.content.includes("I've got a short video");
      const askingConsent =
        message.content.includes("Do you consent") ||
        message.content.includes("consent to our Privacy Policy") ||
        message.content.includes(
          "Please confirm that you have read and agree to our Privacy"
        );
      const privacy = message.content.includes(
        "I understand and respect your decision"
      );
      const uploadDocumentANC =
        message.content.includes("upload your antenuptial contract") ||
        message.content.includes("please upload your ANC");
      // const dependents_over =
      //   messageData.current.includes("dependents over") ||
      //   messageData.current.includes("Dependents over");
      // const dependents_under =
      //   message.content.includes("dependents under") ||
      //   message.content.includes("Dependents under");
      // const user_email =
      //   message.content.includes("email") || message.content.includes("Email");

      messageData.current = message.content;

      // Split message content by "<prompt>" and take the first part

      const videoUrlMatch = message.content.match(
        /(https:\/\/www\.youtube\.com\/embed\/[^\s]+)/
      );
      const imageFilenameMatch = message.content.match(
        /([\w-]+\.(?:png|jpg|jpeg|gif))/
      );

      const videoUrl = videoUrlMatch ? videoUrlMatch[0] : null;
      const imageFilename = imageFilenameMatch ? imageFilenameMatch[0] : null;
      //console.log(imageFilename);

      const filteredContent = message.content.split("<|prompter|>")[0];

      return (
        <div
          key={message.id}
          className={message.role === "user" ? "text-white" : "text-white"}
        >
          {message.role === "assistant" && index === 0 ? (
            <>
              <div className="flex items-start mb-4">
                {/* SVG Icon */}
                

                {/* AI Message Bubble */}
                <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  {filteredContent.replace(/<\|endoftext\|>/g, "")}
                </p>
              </div>
              <div className="flex space-x-2 mt-2">
              <div className="space-y-2 mt-2">
  {/* Yes, I consent checkbox */}
  <div
  onClick={() =>  handleButtonStage64ThirdParties("Yes, I have it in my current will")}  // Add onClick event
  className={`flex items-center space-x-2 px-4 py-2 w-[400px] rounded-md border cursor-pointer ${
    consent === "Yes, I consent"
      ? "bg-[#8DC63F] text-white border-transparent"
      : "border-[#8DC63F] text-[#8DC63F] bg-transparent"
  }`}
>
  <input
    type="checkbox"
    id="consentYes"
    name="consent"
    value="Yes, I consent"
    checked={consent === "Yes, I consent"}
    // onChange={() => handleButtonConsent("Yes, I consent")}
    className="custom-checkbox h-6 w-6 rounded-sm focus:ring-0"
  />
  
     &nbsp;&nbsp;&nbsp;Yes, I consent
  
</div>

{/* No, I do not consent checkbox */}
<div
  onClick={() => handleButtonConsent("No, I do not consent")} // Add onClick event
  className={`flex items-center space-x-2 px-4 py-2 rounded-md border cursor-pointer ${
    consent === "No, I do not consent"
      ? "bg-[#8DC63F] text-white border-transparent"
      : "border-[#8DC63F] text-[#8DC63F] bg-transparent"
  }`}
>
  <input
    type="checkbox"
    id="consentNo"
    name="consent"
    value="No, I do not consent"
    checked={consent === "No, I do not consent"}
    // onChange={() => handleButtonConsent("No, I do not consent")}
    className="custom-checkbox h-6 w-6 rounded-sm focus:ring-0"
  />
 
    &nbsp;&nbsp;&nbsp;No, I do not consent
 
</div>
</div>


              </div>
            </>
          ) : (
            
            <div
              className={
                message.role === "user" ? "mb-2 text-right mt-4" : "mb-2"
              }
            >
            



            
            
              
              {isVideoTrigger ? (
                <>
                  <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Here you go! 🎥
                  </p>
                  <EmbeddedVideo embedUrl="https://www.youtube.com/embed/cMoaGEpffds" />
                  <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block mt-2">
                    Is there anything else you'd like to know about estate
                    planning or any questions you have at this stage? 🤔
                  </p>
                  <button
                    onClick={() => handleButtonClick("Yes, I have a question")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes, I have a question
                  </button>
                  <button
                    onClick={() => handleButtonClick("No, Let's move on")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    No, Let's move on
                  </button>
                </>
              ) : (
                <p
                  className={
                    message.role === "user"
                      ? "bg-[#8dc63f] text-white rounded-lg py-2 px-4 inline-block"
                      : "bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block"
                  }
                >
                  {` ${filteredContent.replace(/<\|endoftext\|>/g, "")}`}
                </p>
              )}

              {questionResponse1 && (
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonFunFact("I have a question.")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    I have a question.
                  </button>
                  <button
                    onClick={() => handleButtonFunFact("Yes, I'm ready.")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes, I'm ready.
                  </button>
                </div>
              )}
              {questionResponseStage12 && (
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonStage12("I have a question.")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    I have a question.
                  </button>
                  <button
                    onClick={() => handleButtonStage12("No, Let's move on")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    No, Let's move on
                  </button>
                </div>
              )}
               {message.content.includes(
                "Are you ready to explore some potential outcomes of different estate planning choices?"
              ) && (
                <>
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonStage13v1("Yes, I’m ready to move on")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes, I’m ready to move on
                  </button>
                  <button
                    onClick={() => handleButtonStage13v1("Skip")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Skip
                  </button>
                </div>
                </>)}
              {message.content.includes(
                "Let’s check out some examples to understand these options better. Here are a few examples we can simulate:"
              ) && (
                <>
                <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
      <b>Scenario 1</b>: 📜 How will setting up a trust affect the management and distribution of your assets?
      <br />
      Setting up a trust can provide asset protection, control, and tax benefits. It allows you to transfer assets to a trustee who manages them according to the trust's terms. This can ensure that your beneficiaries receive assets at appropriate times, minimizing delays and potential conflicts in estate administration.
      <br />
      <br />
      <b>Scenario 2</b>: ⚖️ What happens if you pass away without a will (intestate)?
      <br />
      If you pass away without a will, the Intestate Succession Act will govern the distribution of your assets. This may not align with your wishes and can result in assets being distributed to heirs according to law, potentially leading to disputes or unintended consequences.
      <br />
      <br />
      <b>Scenario 3</b>: 🖋️ How will appointing a power of attorney impact your estate during your lifetime?
      <br />
      Appointing a power of attorney allows someone you trust to make decisions on your behalf if you become incapacitated. This can cover financial, legal, and healthcare matters. It ensures your estate and personal matters are managed according to your wishes during your lifetime.
      <br />
      <br />
      <b>Scenario 4</b>: 💼 What are the potential tax implications of your estate planning decisions?
      <br /><br />
      Choose a scenario you’d like to explore, and I’ll show you the potential outcomes:
      <br />
    </div>
     <br /> 
                {scenario.map((scenarios) => (
  <>
    <br /> {/* Adjust margin as needed */}
    <label
      key={scenarios}
      htmlFor={scenarios}
      className={`flex items-center space-x-2 px-4 py-2 w-[400px] -my-2 rounded-md border cursor-pointer ${
        selectedScenario.includes(scenarios)
          ? "bg-[#8DC63F] text-white border-transparent"
          : "border-[#8DC63F] text-[#8DC63F] bg-transparent"
      }`}
    >
      <input
        type="checkbox"
        id={scenarios}
        onChange={handleCheckboxChangeScenario}
        name={scenarios}
        value={scenarios}
        checked={selectedScenario.includes(scenarios)}
        className="custom-checkbox h-6 w-6 rounded-sm focus:ring-0"
      />
      &nbsp;&nbsp;&nbsp;{scenarios}
    </label>
  </>
))}
<button
        onClick={handleProceedScenario}
        className="mt-4 px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition"
      >
        Proceed
      </button>
                </>
              )}

              {/* {message.content.includes("Do you have any other questions or need further information? I’m here to help!") && (
                <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage14("Yes, I have a question")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have a question
                    </button>
                    <button
                      onClick={() => handleButtonStage14("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      "No, let’s move on
                    </button>
                    </div>
                )} */}
              {message.content.includes("Templates are downloaded") && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Would you like any assistance filling out any of these
                    templates?
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage15("No, let's move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let's move on
                    </button>
                    <button
                      onClick={() => handleButtonStage14Contact("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage18Component("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage18Component("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage18Component("Maybe")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Maybe
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Fantastic! Our financial advisors at Old Mutual are ready to assist you in filling out these templates. Please reach out to us directly to schedule a consultation and receive personalised guidance. Here’s how you can get in touch:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    • Phone: Call us at [insert phone number] to speak with an
                    adviser.
                    <br />
                    <br />
                    • Email: Send us an email at [insert email address] with
                    your contact details, and we’ll get back to you promptly.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage15v1("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {/* {message.content.includes("Here are the all scenario") && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Scenario 1 - Setting Up a Trust: Imagine you set up a trust
                    to manage your assets. The trust could be used to provide
                    for your children’s education and care until they reach
                    adulthood. This can protect the assets from being mismanaged
                    or spent too quickly. Additionally, trusts can offer tax
                    benefits and ensure a smoother transfer of assets to your
                    beneficiaries. 🔐💼
                    <br />
                    Scenario 2 - Dying Intestate (Without a Will):
                    <br />
                    Suppose you pass away without a will. According to South
                    Africa’s Intestate Succession Act, your estate will be
                    distributed to your surviving spouse and children, or other
                    relatives if you have no spouse or children. This may not
                    align with your personal wishes and could lead to disputes
                    among family members. 📜👨‍👩‍👧‍👦
                    <br />
                    <br />
                    Scenario 3 - Appointing a Power of Attorney:
                    <br />
                    Consider appointing a trusted person as your power of
                    attorney. This individual can manage your financial and
                    legal affairs if you become incapacitated. For example, they
                    could pay your bills, manage your investments, or make
                    medical decisions on your behalf. This ensures that your
                    affairs are handled according to your wishes, even if you’re
                    unable to communicate them. 🗝️📋
                    <br />
                    <br />
                    Scenario 4 - Tax Implications of Estate Planning Decisions:
                    <br />
                    Imagine you decide to gift a portion of your assets to your
                    children during your lifetime. While this can reduce the
                    size of your taxable estate, it’s important to consider any
                    potential gift taxes and how it might impact your overall
                    estate plan. Consulting with a tax adviser can help you
                    understand the best strategies for minimising tax
                    liabilities while achieving your estate planning goals. 💰📊
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage13Component("Scenario 1")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Scenario 1
                    </button>
                    <button
                      onClick={() => handleButtonStage13Component("Scenario 2")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Scenario 2
                    </button>
                    <button
                      onClick={() => handleButtonStage13Component("Scenario 3")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Scenario 3
                    </button>
                    <button
                      onClick={() => handleButtonStage13Component("Scenario 4")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Scenario 4
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage13Component("All Scenario")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      All Scenarios
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage13Component("No, Let's move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, Let's move on
                    </button>
                  </div>
                </>
              )} */}

              

              {/* {templateButton && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Based on your profile, here’s a suggested plan:
                    <br />
                    <br />
                    📝 Wills: Given your marital status and number of
                    dependents, it’s essential to have a will to ensure your
                    assets are distributed according to your wishes. 📜👨‍👩‍👧‍👦
                    <br />
                    <br />
                    🏦 Trusts: If you have significant assets or minor
                    children, setting up a trust might be beneficial. This can
                    help manage and protect assets for your beneficiaries. 🔐💼
                    <br />
                    <br />
                    🤝 Power of Attorney: Appointing a trusted person to
                    make decisions on your behalf if you’re unable to is
                    crucial. 🗝️📋
                    <br />
                    <br />
                    💉 Living Will: Consider a living will to outline your
                    medical treatment preferences in case you’re incapacitated.
                    This helps ensure your wishes are followed in medical
                    situations. ⚖️🏥
                    <br />
                    <br />
                    Would you like me to share some templates to help you get
                    started? 📄🔖
                  </div>
                </>
              )}
              {stepByStep && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Based on your profile, here’s a suggested plan:
                    <br />
                    <br />
                    📝 Wills: Given your marital status and number of
                    dependents, it’s essential to have a will to ensure your
                    assets are distributed according to your wishes.
                    <br />
                    <br />
                    🏦 Trusts: If you have significant assets or minor children,
                    setting up a trust might be beneficial. This can help manage
                    and protect assets for your beneficiaries.
                    <br />
                    <br />
                    🤝 Power of Attorney: Appointing a trusted person to make
                    decisions on your behalf if you’re unable to is crucial.
                    <br />
                    <br />
                    💉 Living Will: Consider a living will to outline your
                    medical treatment preferences in case you’re incapacitated.
                    <br />
                    <br />
                    Would you like me to share some templates to help you get
                    started? I’m here to help! 🤝💬
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage14Component("No, let's move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let's move on
                    </button>
                    <button
                      onClick={() => handleButtonStage14Component("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                  </div>
                </>
              )} */}

              {message.content.includes(
                "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs!"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Here are some templates to help you get started with your estate planning documents:
                    <br/>
                    📝 <b>Will:</b> 
                    <br />
                    A basic template for drafting your will.
                    <br />
                    🏦 <b>Trusts: </b>
                    <br />
                    A template to set up a simple trust.
                    <br />
                    🤝 <b>Power of Attorney: </b>
                    <br />
                    A template for appointing a power of
                    attorney.
                    <br />
                    💉 <b>Living Will: </b>
                    <br/>
                    A template to specify your medical treatment preferences.
                    <br/><br/>
                    These templates are for your perusal, you can either fill them in and share at the end of this chat or simply store the copy for reference at any point in your estate planning journey.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage14Template("Download Will Template")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Download Will Template
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Template("Download Trust Template")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Download Trust Template
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Template(
                          "Download Power of Attorney Template"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Download Power of Attorney Template
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Template(
                          "Download Living Will Template"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Download Living Will Template
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Template("Download All Templates")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Download All Templates
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage14Template("Skip")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Skip
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Now that we’ve covered your personal details, let’s talk about your objectives for estate planning. Understanding your goals will help us create a plan that fits your needs perfectly. Ready to dive in?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage15Component("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage15No("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! Here are a few key considerations to keep in mind while planning your estate. I’ll ask you some questions to get a better understanding of your specific needs and goals."
              ) && (
                <>
                  <br />
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Firstly, how important is it for your estate plan to be
                    flexible and adapt to changes in your personal, financial,
                    and legislative environment?
                    <br />
                    <br />
                    For example, would you want your plan to easily adjust if
                    there are changes in laws or your financial situation?
                  </div>
                  <>
                    <div className="space-x-2">
                    <br/><button
                        onClick={() => handleButtonStage15Financial("Yes")}
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleButtonStage15Financial("No")}
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        No
                      </button>
                      <button
                        onClick={() => handleButtonStage15TellMe("No")}
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        Not sure, tell me more
                      </button>
                    </div>
                  </>
                </>
              )}
              {message.content.includes(
                "No problem, I understand that estate planning can be a lot to think about. Is there something specific you'd like to discuss or any concerns you have that I can address?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage15Financial("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "Do you own a business? If so, how important is it to you that your estate plan protects your business interests, especially in terms of its continuation if you were to pass away or become disabled"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/>  <BusinessImportanceSlider onProceed={handleButtonStage16Business} />
                  </div>
                </>
              )}

              {message.content.includes(
                "Please provide details of your arrangement."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage17Strategies("No, let's move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let's move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "What strategies and measures would you like to have in place to ensure the financial resources set aside for retirement are safeguarded, particularly regarding your business assets or investments?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/>
                      {strategies.map((strategy) => (
  <>
    <br /> {/* Adjust margin as needed */}
    <label
      key={strategy}
      htmlFor={strategy}
      className={`flex items-center space-x-2 px-4 py-2 w-[600px] -my-2 rounded-md border cursor-pointer ${
        selectedStrategies.includes(strategy)
          ? "bg-[#8DC63F] text-white border-transparent"
          : "border-[#8DC63F] text-[#8DC63F] bg-transparent"
      }`}
    >
      <input
        type="checkbox"
        id={strategy}
        onChange={handleCheckboxChangeStrategies}
        name={strategy}
        value={strategy}
        checked={selectedStrategies.includes(strategy)}
        className="custom-checkbox h-6 w-6 rounded-sm focus:ring-0"
      />
      &nbsp;&nbsp;&nbsp;{strategy}
    </label>
  </>
))}
                  <button
        onClick={handleProceedStrategy}
        className="mt-4 px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition"
      >
        Proceed
      </button>  
                    
                    
                    
                  </div>
                </>
              )}

              {message.content.includes(
                "That's okay! It can be overwhelming to decide on the best measures without more information. Here’s a brief overview to help you:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    🏦 <b>Establish a Trust:</b> <br />Protects your assets and ensures they
                    are distributed according to your wishes.
                    <br />
                    🛡️ <b>Set Up Insurance Policies:</b> <br />Provides financial security in
                    case of unforeseen events.
                    <br />
                    📜 <b>Legal Agreements:</b> <br />Formalizes arrangements to manage and
                    protect your business interests.
                    <br />
                    🤝 <b>Buy-Sell Agreement:</b> <br />Ensures smooth transition and fair
                    value if a business partner exits.
                    <br />
                    🏢 <b>Contingent Liability Insurance:</b> <br />Covers potential business
                    liabilities.
                    <br />
                    📊 <b>Diversified Investment Strategy:</b> <br />Spreads risk across
                    different investments.
                    <br />
                    🔄 <b>Regular Financial Reviews:</b> <br />Keeps your financial plan up
                    to date with your current situation.
                    <br />
                    💳 <b>Business Succession Plan:</b> 
                    <br />A business strategy companies use to pass leadership roles down to another employee or group of employees
                    <br />
                    🛡️ <b>Asset Protection Planning:</b> <br />Safeguards your personal and
                    business assets from risks.
                    <br />
                    🔄 <b>Separation of Personal & Business Finances:</b> <br />Keeps your
                    personal and business finances distinct to avoid
                    complications.
                    <br />
                    <br />
                    Would you like to discuss any of these options further, or
                    do you need more details on any specific measure?
                  </div>
                  <div className="space-x-2">
                    <br/>  {strategiesv2.map((strategyv2) => (
  <>
    <br /> {/* Adjust margin as needed */}
    <label
      key={strategyv2}
      htmlFor={strategyv2}
      className={`flex items-center space-x-2 px-4 py-2 w-[600px] -my-2 rounded-md border cursor-pointer ${
        selectedStrategiesv2.includes(strategyv2)
          ? "bg-[#8DC63F] text-white border-transparent"
          : "border-[#8DC63F] text-[#8DC63F] bg-transparent"
      }`}
    >
      <input
        type="checkbox"
        id={strategyv2}
        onChange={handleCheckboxChangeStrategiesv2}
        name={strategyv2}
        value={strategyv2}
        checked={selectedStrategiesv2.includes(strategyv2)}
        className="custom-checkbox h-6 w-6 rounded-sm focus:ring-0"
      />
      &nbsp;&nbsp;&nbsp;{strategyv2}
    </label>
  </>
))}
                  <button
        onClick={handleProceedStrategyv2}
        className="mt-4 px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition"
      >
        Proceed
      </button>  
                  </div>
                </>
              )}

              {message.content.includes(
                "Flexibility in an estate plan means it can be adjusted without major legal hurdles if your circumstances change. For instance,"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage15Financial("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage15Financial("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {/* {message.content.includes(
                "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage18Administration("Not important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Not important
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage18Administration("Average Importance")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Average Importance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage18Administration("Very Important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Very Important
                    </button>
                  </div>
                </>
              )} */}

              {message.content.includes(
                "Great! To help you stay organised throughout the estate planning process, here are some checklists for different stages:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    <b>Initial Stage:</b>
                    <br />
                    ✅ Gather personal information (name, age, marital status,
                    dependents)
                    <br />
                    ✅ List all assets and liabilities
                    <br />
                    ✅ Identify beneficiaries
                    <br />
                    ✅ Consider your wishes for asset distribution and
                    guardianship
                    <br />
                    <br />
                    <b>Creating Documents:</b>
                    <br />
                    ✅ Draft your will
                    <br />
                    ✅ Set up any necessary trusts
                    <br />
                    ✅ Prepare power of attorney documents
                    <br />
                    💉 Create a living will
                    <br />
                    <br />
                    <b>Review and Update:</b>
                    <br />
                    ✅Regularly review your documents (annually or after major
                    life events)
                    <br />
                    ✅ Update beneficiaries as needed
                    <br />
                    ✅ Ensure all documents are properly signed and witnessed
                    <br />
                    <br />
                    <b>Final Steps:</b>
                    <br />
                    ✅ Store your documents in a safe place
                    <br />
                    ✅ Inform your executor and loved ones where to find your
                    documents
                    <br />
                    ✅ Keep a copy with a trusted person or legal adviser
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage14Checklist("Download Checklist")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Download Checklist
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Checklist("Let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Let’s move on
                    </button>
                  </div>
                </>
              )}

              {/* {message.content.includes(
                "Describe the condition of your property (new, good, fair, needs renovation). Also, mention any special features (e.g., swimming pool, garden, garage)"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    🏘️ Describe the condition of your property (new, good, fair,
                    needs renovation).
                    <br />
                    🌳 Also, mention any special features (e.g., swimming pool,
                    garden, garage).
                    <br />
                    <br />
                    💰 The estimated value of your property based on the
                    information you provided is: (value displayed).
                    <br />
                    Please note that this is a rough estimate and should not be
                    considered an official appraisal.
                    <br />
                    📉 The actual value of your property may vary based on
                    additional factors such as market conditions, recent sales
                    data, and property-specific details not accounted for in
                    this calculation.
                    <br />
                    For a precise valuation, we recommend consulting a property
                    appraiser or real estate agent.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage21Calculator("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )} */}

              {message.content.includes(
                "It's understandable to be uncertain about this. Protecting assets from potential insolvency can be crucial for maintaining financial stability. Here are some points to consider"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    🏦 Trusts: Placing assets in a trust can shield them from
                    creditors.
                    <br />
                    🛡️ Insurance: Certain insurance policies can provide a
                    safety net.
                    <br />
                    📜 Legal Structures: Properly structuring your business and
                    personal finances can offer protection.
                    <br />
                    📊 Asset Diversification: Spreading assets across various
                    investments can mitigate risk.
                    <br />
                    📝 Estate Planning: Comprehensive estate planning can help
                    safeguard your heirs’ inheritance.
                    <br />
                    <br />
                    Would you like to explore these options further to see which
                    might be the best fit for your situation?
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage18Component("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Is there anything else you'd like to ask?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonQuestion(
                          "Is there anything else you'd like to ask?"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Is there anything else you?
                    </button>
                    <button
                      onClick={() => handleButtonQuestion("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "To prevent any cash shortfall in your estate, how important is it to have provisions in place for your dependants' maintenance? For instance, would you want to ensure there’s enough capital to cover any immediate expenses and ongoing support for your dependants?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/>
                    <BusinessImportanceSlider onProceed={handleButtonStage19Capital} />
                    
                    
                    
                    {/* <button
                      onClick={() =>
                        handleButtonStage19Capital("Not important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Not important
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage19Capital("Average Importance")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Average Importance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage19Capital("Very Important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Very Important
                    </button> */}
                  </div>
                </>
              )}

              {message.content.includes(
                "Let’s dive into the details of what you own to ensure we have a comprehensive understanding of your estate. Your assets play a crucial role in your estate plan."
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Do you own any real estate properties, such as houses, apartments, or land? If so, could you provide details about each property, including location, estimated current market value, outstanding mortgage amount (if any), and any significant improvements made? 🏡
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage21Asset("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage21Asset("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() => handleButtonStage21Asset("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage21Asset("I’m unsure of the details")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m unsure of the details
                    </button>
                  </div>
                </>
              )}

{message.content.includes(
                "To help you estimate the value of your property, let’s go through a few simple steps. This will give you a rough idea of what your property could be worth."
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                   First, please specify the type of property you have (e.g. house, apartment, land).
                  </div>
                </>
              )}
              

              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of any of your real estate, just let me know."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage21Asset("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "The estimated value of your property based on the information you provided is"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    (value displayed)
                    <br />
                    <b>Please note</b> that this is a rough estimate and should not
                    be considered an official appraisal. The actual value of
                    your property may vary based on additional factors such as
                    market conditions, recent sales data, and property- specific
                    details not accounted for in this calculation. For a precise
                    valuation, we recommend consulting a property appraiser or
                    real estate agent
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage21Calculator("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage22Farm("Upload Document at End of Chat")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage22Farm("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() => handleButtonStage22Farm("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage22Vehicle("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage22Vehicle("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() => handleButtonStage22Vehicle("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage23Jewelry("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage23Jewelry("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() => handleButtonStage23Jewelry("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage24Household("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage24Household("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage24Household("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage25Portfolio("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage25Portfolio("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage25Portfolio("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage25Cash("Upload Document at End of Chat")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage25Cash("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() => handleButtonStage25Cash("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage26BusinessInterest("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage26BusinessInterest("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage26BusinessInterest("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage27SignificantAssets("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage27SignificantAssets("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage27SignificantAssets("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage28Intellectual("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage28Intellectual("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage28Intellectual("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage29LegalEntities("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage29LegalEntities("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage29LegalEntities("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage30Mortgage("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage30Mortgage("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() => handleButtonStage30Mortgage("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage31PersonalLoan("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage31PersonalLoan("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage31PersonalLoan("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage32CreditCardDebt("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage32CreditCardDebt("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage32CreditCardDebt("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage33VehicleLoan("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage33VehicleLoan("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage33VehicleLoan("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage34OutstandingDebt("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage34OutstandingDebt("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage34OutstandingDebt("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have a strategy in place for managing and reducing your liabilities over time?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage35Strategy("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage35Strategy("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() => handleButtonStage35Strategy("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are there any significant changes expected in your liabilities in the foreseeable future?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage36SignificantChanges("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage36SignificantChanges("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage36SignificantChanges("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage37LifeInsurance("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage37LifeInsurance("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage37LifeInsurance("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are you covered by any health insurance policies/plans that is not a Medical Aid? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage38HealthInsurance("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage38HealthInsurance("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage38HealthInsurance("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage39HoldingsInsured("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage39HoldingsInsured("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage39HoldingsInsured("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage40VehicleInsured("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage40VehicleInsured("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage40VehicleInsured("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage41Disability("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage41Disability("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage41Disability("Not Sure")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Not Sure
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Disability insurance can provide financial security if you’re unable to work due to illness or injury. It ensures that you have a source of income to cover living expenses and maintain your standard of living. Would you like more information or assistance in obtaining disability insurance and understanding its benefits?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage41DisabilitySecurity("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilitySecurity("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great, I will have one of our financial advisors get in touch regarding obtaining disability insurance"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage41DisabilitySecurity("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Disability insurance can be structured as a single capital lump sum or monthly income replacer. Which type of disability insurance do you currently have, or are you considering?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage41DisabilityInsurance(
                          "Single Capital Lump Sum"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Single Capital Lump Sum
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilityInsurance(
                          "Monthly Income Replacer"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Monthly Income Replacer
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's important to note that the coverage you can take may be limited. Are you aware of any limitations on your disability insurance coverage?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage41DisabilityCoverage("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilityCoverage(
                          "No, I'm not aware"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I'm not aware
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilityCoverage("I'm not sure.")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I'm not sure.
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "I recommend reviewing your current disability insurance policy to understand any limitations it may have. Checking details like maximum benefit amounts, coverage duration, and specific conditions that are excluded will help ensure you have adequate protection. Please get back to me once you've reviewed your policy."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage41DisabilityCoverage("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have contingent liability insurance to cover unexpected liabilities that may arise?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage41ContingentInsurance("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage41ContingentInsurance("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage41ContingentInsurance("I'm not sure.")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I'm not sure.
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "I recommend considering contingent liability insurance as it can protect you against unexpected financial obligations. It’s especially useful if you've provided personal guarantees or securities for business obligations. Please think about whether this might be a valuable addition to your insurance portfolio and let me know if you have any questions or need assistance with this."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage41ContingentInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "If you own a business, have you considered buy and sell insurance to protect your business partners and family?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage42BuyAndSell("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage42BuyAndSell(
                          "No, I don't have a business"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I don't have a business
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage42BuyAndSell(
                          "No, I haven't considered it"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I haven't considered it
                    </button>
                    <button
                      onClick={() => handleButtonStage42BuyAndSell("Unsure")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Buy and sell insurance is designed to ensure that, in the event of your death or disability, your business can continue to operate smoothly. It provides funds to your business partners to buy out your share, protecting both your family’s financial interests and the business’s continuity. It might be worth exploring this option to safeguard your business and your loved ones. Please review your current situation and get back to me if you have any questions or need further assistance."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage42BuyAndSell("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "For business owners, key person insurance can help the business survive the loss of a crucial employee. Do you have this in place?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage43BusinessOwner("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage43BusinessOwner("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage43BusinessOwner("Unsure")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Key person insurance provides financial support to your business if a key employee, whose expertise and skills are critical to the company's success, passes away or becomes disabled. It can help cover the cost of finding and training a replacement, as well as mitigate potential financial losses. If you think this could benefit your business, consider discussing it further with our financial adviser to ensure your business is protected."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage43BusinessOwner("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have any other types of insurance not already covered? Please provide details about the type of coverage and the insurance provider."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage44InsuranceConvered("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage44InsuranceConvered("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage44InsuranceConvered("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/>
                    {/* <button
                      onClick={() =>
                        handleButtonStage45ReviewedInsurance("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button> */}
                    <button
                      onClick={() =>
                        handleButtonStage45ReviewedInsurance("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage45ReviewedInsurance("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your insurance policies"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage45ReviewedInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details about any other type of insurance you have, just let me know."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage44InsuranceConvered("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your vehicle insurance provider"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage40VehicleInsured("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your insurance provider"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage39HoldingsInsured("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your health insurance policies"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage38HealthInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your life insurance policies"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage37LifeInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your significant changes expected in your liabilities"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage36SignificantChanges("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your strategy"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage35Strategy("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your outstanding debt"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage34OutstandingDebt("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your vehicle loan"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage33VehicleLoan("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your credit card debt"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage32CreditCardDebt("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your current personal loan"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage31PersonalLoan("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your outstanding mortgage loan"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage30Mortgage("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your legal entities"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage29LegalEntities("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your intellectual property rights"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage28Intellectual("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your significant assets"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage27SignificantAssets("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your business interest"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage26BusinessInterest("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your cash savings or deposits in bank accounts"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage25Cash("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your investment portfolio"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage25Portfolio("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your household"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage24Household("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your valuable possessions, just let me know."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage23Jewelry("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your vehicle, just let me know."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage22Vehicle("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of the farm, just let me know."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage22Farm("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage46Continue("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage46Continue("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding your investment holdings helps us assess your overall financial position and develop strategies to maximise the value of your estate. Please provide as much detail as possible for each of the following questions"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Do you currently hold any stocks or equities in your
                    investment portfolio? If yes, please specify the name of the
                    stocks, the number of shares held, and the current market
                    value of each stock 🔐💼
                    <br />
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage47InvestmentHolding("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage47InvestmentHolding("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage47InvestmentHolding("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your stocks or equities"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage47InvestmentHolding("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage48FixedIncome("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage48FixedIncome("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage48FixedIncome("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready, please provide the types of bonds you are interested in."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage48FixedIncome("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage48MutualFunds("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage48MutualFunds("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage48MutualFunds("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your investments in mutual funds."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage48MutualFunds("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage49RetirementFunds("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage49RetirementFunds("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage49RetirementFunds("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your type of retirement account."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage49RetirementFunds("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage50EstateHoldings("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage50EstateHoldings("Yes, specify detail")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage50EstateHoldings("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your investment properties or real estate holdings"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage50EstateHoldings("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage51AssetClasses("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage51AssetClasses("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage51AssetClasses("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready to provide the details of your asset classes."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage51AssetClasses("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage52InvestmentGoals("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage52InvestmentGoals("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage52InvestmentGoals("Unsure")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial adviser can help you define these parameters and create a tailored investment strategy."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage52InvestmentGoals("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Are there any specific changes or adjustments you're considering making to your investment portfolio in the near future?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage53SpecificChanges("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage53SpecificChanges("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage53SpecificChanges("Unsure")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's always a good idea to periodically review your investment portfolio to ensure it aligns with your financial goals and risk tolerance. If you're not currently considering any changes, it might be helpful to schedule a regular review with a financial adviser to stay informed about potential opportunities or necessary adjustments based on market conditions and your evolving financial situation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage53SpecificChanges("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! Next, we’ll discuss estate duty. Shall we continue?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage54Final("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage54Final("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Now let's discuss estate duty, the tax on the total value of your estate if you were to pass away today with your current will or distribution wishes in place. Understanding this helps us ensure your estate plan minimises taxes and maximises what is passed on to your heirs. Ready to get started?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage55EstateDuty("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage55EstateDuty("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have a current will in place?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage56CurrentWill("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage56CurrentWill("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Creating a will is an important step in securing your assets and ensuring your wishes are followed. We can start drafting your will right here by answering a few questions about your estate and preferences."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage57ImportantStep("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "When was the last time you reviewed your will? It’s a good idea to keep it up to date with any changes in your life."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage57ReviewedWill("Will is up to date")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Will is up to date
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage57ReviewedWill(
                          "Will needs to be reviewed & updated"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Will needs to be reviewed & updated
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Let's go over the details of your current will. How are your assets distributed according to your current will? Here are some specific questions to help clarify this:"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage57ImportantStep("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you bequeath your estate to your spouse?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage58EstateSpouse("Yes, my entire estate")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, my entire estate
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage58EstateSpouse(
                          "Yes, a significant portion of my estate"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, a significant portion of my estate
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage58EstateSpouse(
                          "No, estate divided among other beneficiaries"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, estate divided among other beneficiaries
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage58EstateSpouse(
                          "No, spouse receives only a specific portion"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, spouse receives only a specific portion
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage59Residue("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage59Residue("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you bequeath any portion of your estate to the Trustees of any specific trust?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage60Bequeath("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage60Bequeath("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Does your will include a plan for setting up a trust after you pass away?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage61PassAway("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage61PassAway("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Do you have a farm or any specific property bequeathed to a trust?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage62Bequeathed("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage62Bequeathed("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}
              {(message.content.includes(
                "USEFUL TIP"
              )) && (firstTip.current==1) && (
                <>
                 <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    For estate duty: When farms are bequeathed (whether to trust or natural person) and the farm was used for bona fide farming purposes, the market value less 30% is included as the value of the farm for estate duty purposes.
                  </div>
                   <br/>
                <div className="flex items-start space-x-4 mt-2">
        {/* Image on the left */}
        <Image
          src="/images/usefulTip.png" // Path to your image
          alt="Useful tip"
          width={500} // Adjust width
          height={300} // Adjust height
          className="rounded-md" // Adds rounded corners (5px)
        />
      </div>
                  
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Please provide details of the trust.
                  </div>
                  
                </>
              )}

              
              {message.content.includes(
                "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?"
              ) && (
                <>
                  <div className="grid grid-cols-2 gap-2 mt-3">
  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "Yes, the difference should be considered a loan to the specific beneficiary"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    Yes, the difference should be considered a loan to the specific beneficiary
  </button>
  
  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "No, the difference should be considered a gift and not a loan"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    No, the difference should be considered a gift and not a loan
  </button>

  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "The difference should be treated as a loan with interest payable by the beneficiary"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    The difference should be treated as a loan with interest payable by the beneficiary
  </button>

  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "The difference should be adjusted through other assets or cash to balance the value"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    The difference should be adjusted through other assets or cash to balance the value
  </button>

  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "A family trust should manage the difference to ensure equitable distribution"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    A family trust should manage the difference to ensure equitable distribution
  </button>

  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "The surviving spouse should decide on how to manage the difference based on circumstance"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    The surviving spouse should decide on how to manage the difference based on circumstance
  </button>

  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "The difference should be documented but forgiven upon the death of the surviving spouse"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    The difference should be documented but forgiven upon the death of the surviving spouse
  </button>

  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "The estate should sell specific assets to cover the difference and distribute proceeds accordingly"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    The estate should sell specific assets to cover the difference and distribute proceeds accordingly
  </button>

  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "A clause should be added to the will to allow for flexibility in handling the difference"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    A clause should be added to the will to allow for flexibility in handling the difference
  </button>

  <button
    onClick={() =>
      handleButtonStage63AssetsManaged(
        "The difference should be split among all beneficiaries to evenly distribute the value"
      )
    }
    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition text-left"
  >
    The difference should be split among all beneficiaries to evenly distribute the value
  </button>
</div>


                </>
              )}

              {message.content.includes(
                "Certain third parties may be responsible for estate duty based on the assets they receive. Do you have any specific instructions or details about third-party liability for estate duty in your current will?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage64ThirdParties(
                          "Yes, I have it in my current will"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have it in my current will
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage64ThirdParties(
                          "No, I have not included specific instructions"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I have not included specific instructions
                    </button>
                  </div>
                </>
              )}

              {(message.content.includes(
                "USEFUL TIP"
              )) && (firstTip.current!=1) && (
                <>
                <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                If your spouse were to pass away immediately after you, there are specific estate duty implications and/or arrangements you would need to consider? All the more reason to get in touch with our Financial Advisors. This will be noted and added to the report supplied to you at the end of this chat.
                  </div>
                   <div className="flex items-start space-x-4 mt-2">
        {/* Image on the left */}
        <Image
          src="/images/investment.png" // Path to your image
          alt="Useful tip"
          width={500} // Adjust width
          height={300} // Adjust height
          className="rounded-md" // Adds rounded corners (5px)
        />
      </div>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Thank you for providing all these details. This helps us
                    understand the estate duty implications of your current
                    will. Please share your current will. 🔐💼
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage65CurrentWill("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage65CurrentWill("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready to provide the details, just let me know."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage65CurrentWill("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understood. It's crucial to consider this aspect carefully. Would you like to discuss potential options for addressing third-party liability in your estate plan?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage65PotentialOption("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage65PotentialOption("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Excellent! There are several strategies we can explore to address third-party liability in your estate plan. One option is to include specific provisions in your will outlining how estate duty should be handled for third parties. We can also consider setting up trusts or other structures to manage these liabilities effectively. Would you like to explore these options further?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage65Stages("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage65Stages("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great, one of our financial advisors will be in touch in this regard."
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    <strong>DID YOU KNOW</strong>:
                    <br />
                    💡 If your spouse were to pass away immediately after you,
                    there are specific estate duty implications and/or
                    arrangements you would need to consider? All the more reason
                    to get in touch with our Financial Advisors. This will be
                    noted and added to the report supplied to you at the end of
                    this chat.
                  </div>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Thank you for providing all these details. This helps us
                    understand the estate duty implications of your current
                    will. Please share your current will. 🔐💼
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage65CurrentWill("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage65CurrentWill("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! Next, we’ll look at the executor’s fees. Shall we continue?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage66EstateDutyCurrentWillFinal("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage66EstateDutyCurrentWillFinal("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated."
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Now, let's discuss the fees that will be charged for the
                    administration of your estate. The executor's fees can be a
                    significant part of the costs, so it's important to
                    understand how these are calculated.
                    <br />
                    <br />
                    💰 The maximum fee that can be charged for executor’s fees
                    is 3.5%, plus VAT (15%), which totals 4.03%. You can leave
                    instructions in your will to stipulate what percentage you
                    wish to set for the executor’s fees.
                    <br />
                    <br />
                    <strong>DID YOU KNOW</strong>:
                    <br />
                    👪 Family members are also entitled to executor’s fees. The
                    advantage of family members as executors is that they may be
                    open to waive or negotiate lower compensation.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage67ExecutorFee("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Remember, no executor’s fees are payable on proceeds from policies with a beneficiary nomination, as these are paid directly to the nominated beneficiary by the insurance company. Do you have any such policies?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage68Payable("Yes, specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify
                    </button>
                    <button
                      onClick={() => handleButtonStage68Payable("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Thank you for providing these details. Now, we can move on to the next part of your estate planning. Ready to continue?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage69ExecutorFinal("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage69ExecutorFinal("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Now, let's talk about the liquidity position of your estate. This helps us understand if there are enough liquid assets available to cover estate costs without having to sell off assets. Ready to proceed?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage70Liquidity("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage70Liquidity("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Liquidity is essential to cover estate costs without having to sell assets. Are you aware of any sources of liquidity in your estate, such as cash reserves or liquid investments?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage71LiquidityEssential("Yes, specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage71LiquidityEssential(
                          "No, I have no significant sourced of liquidity"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I have no significant sourced of liquidity
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage71LiquidityEssential(
                          "Unsure, will need assistance"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Unsure, will need assistance
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! Based on the information you've provided earlier, we can review your existing financial assets and investments to assess their liquidity. We will include this information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage71LiquidityEssential("Yes, specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "If there's a shortfall, there are a few options. The executor may ask heirs to contribute cash to prevent asset sales. Are you open to this option?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage72Shortfall("Yes, with considerations")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, with considerations
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage72Shortfall(
                          "No, assets should be sold to cover shortfall"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, assets should be sold to cover shortfall
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage72Shortfall(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Thank you for your openness to this option. When considering this approach, it's essential to assess the financial impact on each heir and ensure fairness in the distribution of responsibilities. Factors such as each heir's financial situation, willingness to contribute, and the impact on their inheritance should be carefully considered. Would you like guidance on how to navigate these considerations?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage73FinancialImpact("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage73FinancialImpact("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "Great! Our financial advisors at Old Mutual can help you and your heirs understand the financial implications and create a fair strategy. They can assist in evaluating each heir’s ability to contribute, ensure clear communication among all parties, and develop a plan that respects everyone's circumstances. We'll include this information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage73FinancialImpact("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Sure! In the event of a shortfall, the executor may explore various options to cover expenses without liquidating assets prematurely. These options could include negotiating payment terms with creditors, utilising existing insurance policies, or securing a loan against estate assets. Each option comes with its own set of considerations and implications. Would you like further details on these options to help you make an informed decision?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage74Shortfall("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage74Shortfall("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Excellent! Here are some details on the potential options:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Excellent! Here are some details on the potential options:
                    <br />
                    <br />
                    💬 Negotiating Payment Terms with Creditors:
                    <br />
                    This involves discussing with creditors to extend payment
                    deadlines or set up a payment plan, allowing more time to
                    manage the estate without immediate asset liquidation.
                    <br />
                    <br />
                    🛡️ Utilizing Existing Insurance Policies:
                    <br />
                    Life insurance policies or other relevant insurance can
                    provide liquidity to cover shortfalls. Reviewing existing
                    policies can be a valuable step.
                    <br />
                    <br />
                    💰 Securing a Loan Against Estate Assets:
                    <br />
                    This option involves taking a loan using estate assets as
                    collateral, providing immediate funds to cover expenses
                    while preserving the estate's value.
                    <br />
                    <br />
                    Our financial advisors at Old Mutual can provide more
                    in-depth information and help you evaluate these options
                    based on your specific situation. We will include this
                    information in the report shared at the end of this
                    conversation.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage74Shortfall("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage75SellingAsset(
                          "I am open to selling assets"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I am open to selling assets
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage75SellingAsset(
                          "I am against selling assets"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I am against selling assets
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage75SellingAsset(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage75SellingAsset(
                          "I’d like to explore alternative financing options"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’d like to explore alternative financing options
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Absolutely! When facing a shortfall, selling assets isn't the only option available. Alternative financing strategies, such as securing loans against estate assets, negotiating payment terms with creditors, or utilising existing insurance policies, can provide additional flexibility without compromising your long-term goals for asset distribution. Each option comes with its own set of considerations and implications, so it's essential to weigh them carefully. Our financial advisors can help you set this up."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage75SellingAsset("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's understandable to have reservations about selling assets, especially if it affects your long-term plans for asset distribution or business continuity. Selling assets can impact the legacy you wish to leave behind and may disrupt the stability of family businesses. However, it's essential to balance these concerns with the immediate need to cover a shortfall. Exploring alternative financing options or negotiating payment terms with creditors could help alleviate the need for asset liquidation. Would you like to explore these alternatives further?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage76Reservation("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage76Reservation("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! Here are some alternative options you might consider:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    💬 Negotiating Payment Terms with Creditors:
                    <br />
                    This involves discussing with creditors to extend payment
                    deadlines or set up a payment plan, allowing more time to
                    manage the estate without immediate asset liquidation.
                    <br />
                    <br />
                    🛡️ Utilizing Existing Insurance Policies:
                    <br />
                    Life insurance policies or other relevant insurance can
                    provide liquidity to cover shortfalls. Reviewing existing
                    policies can be a valuable step.
                    <br />
                    <br />
                    💰 Securing a Loan Against Estate Assets:
                    <br />
                    This option involves taking a loan using estate assets as
                    collateral, providing immediate funds to cover expenses
                    while preserving the estate's value.
                    <br />
                    <br />
                    Our financial advisors at Old Mutual can provide more
                    in-depth information and help you evaluate these options
                    based on your specific situation. We will include this
                    information in the report shared at the end of this
                    conversation.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage76Reservation("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Borrowing funds is another option, but it could be costly and limit asset use if assets are used as security. Have you considered this option?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage77BorrowingFunds(
                          "I am open to borrowing funds"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I am open to borrowing funds
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage77BorrowingFunds(
                          "I am against borrowing funds"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I am against borrowing funds
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage77BorrowingFunds(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage77BorrowingFunds(
                          "I’d like to explore alternative financing options"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’d like to explore alternative financing options
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Absolutely, it's essential to fully understand the implications before making a decision. Borrowing funds can indeed be costly, especially if assets are used as security, as it may limit their use and potentially increase financial risk. I can provide more detailed information on the costs involved, potential risks, and alternative financing options to help you make an informed decision. Would you like to explore these aspects further?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage77FinancialRisk("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage77FinancialRisk("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! Here are some important aspects to consider:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    💸 Costs Involved:
                    <br />
                    Borrowing funds often comes with interest rates and fees,
                    which can add up over time. Understanding these costs is
                    crucial to determine if this option is viable.
                    <br />
                    <br />
                    ⚠️ Potential Risks:
                    <br />
                    Using assets as security means those assets could be at risk
                    if repayments are not met. This could affect your long-term
                    financial stability and estate plans.
                    <br />
                    <br />
                    💡 Alternative Financing Options:
                    <br />
                    Options such as negotiating payment terms with creditors,
                    utilizing insurance policies, or setting up payment plans
                    might be more beneficial and less risky.
                    <br />
                    <br />
                    Our financial advisors at Old Mutual can provide a thorough
                    analysis and personalized advice to help you make the best
                    decision. We will include this information in the report
                    shared at the end of this conversation.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage77FinancialRisk("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Exploring alternative financing options is a prudent approach to ensure you make the best decision for your estate. There are various strategies available, such as negotiating payment terms with creditors, utilising existing insurance policies, or seeking financial assistance from family members or business partners. Each option has its pros and cons, so it's essential to weigh them carefully. Would you like more information on these alternative financing options?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage77Alternative("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage77Alternative("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! Here are some alternative financing options to consider:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    💬 Negotiating Payment Terms with Creditors:
                    <br />
                    You can often arrange for more favorable payment terms,
                    reducing the immediate financial burden on your estate.
                    <br />
                    <br />
                    🛡️ Utilizing Existing Insurance Policies:
                    <br />
                    Certain insurance policies may offer payouts that can cover
                    the shortfall without the need to liquidate assets.
                    <br />
                    <br />
                    🤝 Financial Assistance from Family or Business Partners:
                    <br />
                    If feasible, seeking help from family members or business
                    partners can provide a flexible and low-cost solution.
                    <br />
                    <br />
                    Our financial advisors at Old Mutual can provide a thorough
                    analysis and personalized advice to help you make the best
                    decision. We will include this information in the report
                    shared at the end of this conversation.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage77Alternative("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage78LifeInsurance("Against")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Against
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage78LifeInsurance("Considering")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Considering
                    </button>
                    <button
                      onClick={() => handleButtonStage78LifeInsurance("Agree")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Agree
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Thank you for discussing your estate's liquidity position. Let's discuss maintenance claims. Ready?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage79LiquidityEnd("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage79LiquidityEnd("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Let's discuss maintenance claims in terms of court orders. If you pass away while there are maintenance obligations towards children or a former spouse, they will have a maintenance claim against your estate. Are you aware of any existing maintenance obligations or court orders?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage80Claims(
                          "I have court ordered maintenance obligations"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have court ordered maintenance obligations
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage80Claims(
                          "I have informal agreements, not court orders"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have informal agreements, not court orders
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage80Claims(
                          "I don’t have any maintenance obligations"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I don’t have any maintenance obligations
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage80Claims(
                          "I haven’t considered maintenance claims in relation to my estate planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I haven’t considered maintenance claims in relation to my
                      estate planning
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's crucial to consider these maintenance obligations in your estate planning to ensure they are adequately addressed. Court-ordered maintenance obligations typically take precedence and must be factored into your estate plan to avoid potential disputes or legal complications. Would you like assistance in incorporating these obligations into your estate plan? If so, please provide the details of the court order."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage81Obligations("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button>
                    <button
                      onClick={() => handleButtonStage81Obligations("Yes, specify detail")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, specify detail
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage81Obligations("No, let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No problem. Whenever you're ready, please provide the details about your life insurance policy."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage81Obligations("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "While informal agreements may not have the same legal standing as court orders, they are still important to consider in your estate planning. Even informal arrangements could result in maintenance claims against your estate if not addressed properly. Would you like guidance on how to formalise these agreements or ensure they are appropriately accounted for in your estate plan?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage81Agreements("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage81Agreements("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage81Agreements("Maybe")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Maybe
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include this information about life insurance policy in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage81Agreements("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's essential to assess any potential maintenance claims in relation to your estate to avoid unexpected complications for your heirs. Even if you haven't formalised maintenance obligations through court orders or agreements, they may still arise based on legal obligations. Would you like assistance in evaluating and addressing any potential maintenance claims in your estate planning?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage81Complications("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage81Complications("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage81Complications("Maybe")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Maybe
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include this information about life insurance policy in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage81Complications("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage82LifeInsurance("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage82LifeInsurance("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage82LifeInsurance("Unsure")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "That's a proactive approach to ensuring adequate provision for maintenance obligations. Have you already taken steps to set up such a policy, or would you like assistance in exploring this option further?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage83Proactive("I have set up a policy")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have set up a policy
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage83Proactive(
                          "I need assistance in setting up a policy"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need assistance in setting up a policy
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include information about assistance with setting up a policy in the report that will be shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage83Proactive("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's an important consideration to ensure that your loved ones are provided for in the event of your passing. If you'd like, we can discuss the benefits and implications of setting up a life insurance policy payable to a testamentary trust to cover maintenance obligations. Would you like more information on this option?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage83Passing("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage83Passing("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Setting up a life insurance policy payable to a testamentary trust can ensure that maintenance obligations are met without burdening your estate. This approach provides a reliable income stream for your beneficiaries. Our financial advisors at Old Mutual can provide detailed guidance and help you explore this option further."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage83Passing("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage84Provision(
                          "I have provisions in place"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have provisions in place
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage84Provision(
                          "I want to make provisions in my estate planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I want to make provisions in my estate planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage84Provision(
                          "I don’t want to make provisions in my estate planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I don’t want to make provisions in my estate planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage84Provision(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's great that you've already made provisions for your surviving spouse. Would you like to review your existing provisions to ensure they align with your current goals and circumstances?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage84ExistingProvision("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage84ExistingProvision("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Reviewing your existing provisions can ensure they are still appropriate and effective given your current situation and goals. We will include this information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage84ExistingProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Making provisions for your surviving spouse ensures their financial security after you're gone. We can discuss various options for including these provisions in your estate plan. Would you like more information on this?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage84OptionProvision("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage84OptionProvision("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Providing for your surviving spouse can be done through various means, such as setting up a trust, designating life insurance benefits, or specifying direct bequests in your will. Our financial advisors at Old Mutual can guide you through these options to find the best solution for your needs. We will include this information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage84OptionProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Sure, understanding the implications and options for provisions for your surviving spouse is crucial. Would you like more information on how this can be incorporated into your estate planning?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage84CrucialProvision("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage84CrucialProvision("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Incorporating provisions for your surviving spouse can be an essential part of a comprehensive estate plan. Understanding the legal and financial implications will help you make an informed decision. Our financial advisors at Old Mutual can provide you with the necessary information and advice. We will include this information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage84CrucialProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Factors considered by the court when assessing the claim include the duration of the marriage, the spouse's age and earning capacity, and the size of your assets. Have you thought about these factors in your estate planning?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85FactorsProvision(
                          "Yes, I have considered them and have factored them into my estate planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have considered them and have factored them into my
                      estate planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85FactorsProvision(
                          "I am aware of these factors but haven’t considered them in my estate planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I am aware of these factors but haven’t considered them in
                      my estate planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85FactorsProvision(
                          "No, I haven’t thought about these factors yet"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I haven’t thought about these factors yet
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85FactorsProvision(
                          "I need more information before I can respond"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before I can respond
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's excellent that you've already considered these factors in your estate planning. Would you like to discuss how they can further inform your decisions and ensure your plan aligns with your goals?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage85GoalsProvision("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage85GoalsProvision("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! When these factors are considered, it helps ensure that your estate plan is tailored to meet your specific circumstances. For example, longer marriages or significant disparities in earning capacity might necessitate larger or longer-term maintenance provisions. Keeping your plan flexible and periodically reviewing it can help accommodate any changes in your situation. Would you like to delve deeper into any particular area?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85GoalsProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding these factors is essential for effective estate planning. Would you like assistance in incorporating them into your estate plan to ensure it reflects your wishes and circumstances?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85UnderstandingProvision("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85UnderstandingProvision("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Excellent! Incorporating these factors into your estate plan ensures a fair and well-thought-out approach to maintenance and asset distribution. For instance, ensuring that your plan addresses the financial needs of a surviving spouse based on their age and earning capacity can provide long-term security. We will include this information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85UnderstandingProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "No worries, considering these factors can help you create a more comprehensive estate plan. Would you like assistance in understanding how they may impact your estate planning decisions?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85ComprehensiveProvision("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85ComprehensiveProvision("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Wonderful! Understanding how these factors impact your estate planning can help you make more informed decisions. For example, considering the spouse's earning capacity can guide how much and how long maintenance should be provided, and knowing the size of your assets helps in deciding the distribution method. We will include this information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85ComprehensiveProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Sure, understanding these factors is crucial for effective estate planning. Would you like more information on how they can influence your estate planning decisions before you respond?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85EffectiveProvision("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85EffectiveProvision("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Perfect! Knowing how these factors influence your estate planning can help ensure your plan is both fair and effective. For instance, a longer marriage might lead to more substantial maintenance claims, and a larger estate might require more detailed planning to minimize tax implications. We will include this information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85EffectiveProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85MaintenanceProvision(
                          "Insurance policy with my spouse as the nominated beneficiary"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Insurance policy with my spouse as the nominated
                      beneficiary
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85MaintenanceProvision(
                          "Testamentary trust for spouse outlines in my will"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Testamentary trust for spouse outlines in my will
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85MaintenanceProvision(
                          "I’m open to either option"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m open to either option
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85MaintenanceProvision(
                          "I’m not sure, I need more information of each option"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not sure, I need more information of each option
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage85MaintenanceProvision(
                          "I’d like to explore other options"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’d like to explore other options
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Both options have their advantages. With an insurance policy, the benefit is usually paid out quickly and directly to your spouse, providing immediate financial support. On the other hand, setting up a testamentary trust in your will offers more control over how the funds are managed and distributed, ensuring long-term financial security for your spouse and potential tax benefits. We can discuss the specifics of each option further and tailor the solution to best meet your needs. Would you like to explore these options in more detail?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage85BenefitProvision("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage85BenefitProvision("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! Here’s a brief overview of each option:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    🛡️ Insurance Policy:
                    <br />
                    Provides immediate liquidity to your spouse upon your
                    passing, typically without the need for probate. This can be
                    beneficial for addressing urgent financial needs.
                    <br />
                    <br />
                    🏦 Testamentary Trust:
                    <br />
                    Allows for greater control over the distribution of assets,
                    potentially offering ongoing support and protection for your
                    spouse. It can also provide tax benefits and help manage the
                    funds according to your wishes.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage85BenefitProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Absolutely! Let's delve deeper into both options. An insurance policy with your spouse as the nominated beneficiary provides immediate liquidity and financial support to your spouse upon your passing. However, a testamentary trust outlined in your will can offer ongoing financial security, asset protection, and control over how the funds are used and distributed. We can discuss the benefits, considerations, and implications of each option to help you make an informed decision. How does that sound?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage86DeeperProvision("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage86DeeperProvision("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Certainly! Besides the options mentioned, there are alternative ways to provision for maintenance, such as setting up annuities, creating specific bequests in your will, or establishing a family trust. Each option has its unique advantages and considerations. We can explore these alternatives further and tailor a solution that aligns with your estate planning goals. Would you like to discuss these options in more detail?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage86AnnuitiesProvision("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage86AnnuitiesProvision("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Certainly! Besides insurance policies and testamentary trusts, you might consider options such as:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    <br />
                    💰 Annuities:
                    <br />
                    Providing a regular income stream to your spouse for a
                    specified period or for their lifetime.
                    <br />
                    <br />
                    🏡 Specific Bequests:
                    <br />
                    Leaving particular assets or sums of money directly to your
                    spouse in your will.
                    <br />
                    <br />
                    👪 Family Trusts:
                    <br />
                    Setting up a family trust to manage and distribute assets
                    according to your wishes, providing flexibility and
                    potential tax benefits.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage86AnnuitiesProvision("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {/* {message.content.includes("Do your dependents require any income per month for maintenance?") && (
                <>  
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage86AnnuitiesProvision("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                     Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage86AnnuitiesProvision("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                     No
                    </button>
                    
                  </div>
                </>
              )} */}

              {message.content.includes(
                "It's important to provide for the shortfall in household income after your death. Have you assessed the capital available to your spouse/family/dependents from which to generate an income?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage87ShortFall(
                          "I have capital available to generate an income for my dependents"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have capital available to generate an income for my
                      dependents
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage87ShortFall(
                          "I have capital but unsure if it will generate enough income"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have capital but unsure if it will generate enough
                      income
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage87ShortFall(
                          "I haven’t thought of this aspect of financial planning yet"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I haven’t thought of this aspect of financial planning yet
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage87ShortFall(
                          "I need more information to determine this"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information to determine this
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's essential to ensure that the capital you have can generate sufficient income to support your dependents after your passing. We can work together to assess your current financial situation, projected expenses, and income needs to determine if any adjustments or additional planning are necessary to bridge any potential income shortfalls. Would you like to review your financial situation in more detail?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage87Capital("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage87Capital("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include this information about your financial situation and any necessary adjustments in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage87Capital("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Planning for the financial well-being of your dependents is a crucial aspect of estate planning. We can assist you in evaluating your current financial situation, projected expenses, and income needs to ensure that your loved ones are adequately provided for in the event of your passing. Would you like to explore this aspect of financial planning further?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage87Planning("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage87Planning("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We'll include this financial planning information in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage87Planning("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding the capital available to your dependents and its potential to generate income is essential for effective estate planning. We can help you gather the necessary information and provide guidance to evaluate your current financial situation, projected expenses, and income needs. Together, we can determine the most suitable strategies to ensure financial security for your loved ones. Would you like assistance in assessing your financial situation?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage87Dependents("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage87Dependents("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include this information about your financial situation and strategies in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage87Dependents("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Additional life assurance can provide the capital required for the income needs of dependents. Have you considered obtaining additional life insurance for this purpose?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage88Additional(
                          "My current life insurance coverage is sufficient"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      My current life insurance coverage is sufficient
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage88Additional(
                          "I’m currently reviewing my options for additional life insurance"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m currently reviewing my options for additional life
                      insurance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage88Additional(
                          "No, I haven’t considered obtaining M additional life insurance"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I haven’t considered obtaining M additional life
                      insurance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage88Additional(
                          "I’m unsure if additional life insurance is necessary given my current financial situation"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m unsure if additional life insurance is necessary given
                      my current financial situation
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's prudent to periodically review your life insurance coverage to ensure that it aligns with your current financial situation and the needs of your dependents. We can assist you in evaluating your insurance needs and exploring suitable options for additional coverage based on your evolving circumstances. Would you like guidance in assessing your life insurance needs and exploring available options?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage88Coverage("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage88Coverage("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include this information about your life insurance needs and options in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage88Coverage("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Life insurance can play a vital role in providing financial security for your dependents in the event of your passing. If you haven't considered obtaining additional coverage, it may be worthwhile to explore your options and ensure that your loved ones are adequately protected. We can help you evaluate your insurance needs and identify suitable coverage options. Would you like assistance in exploring the benefits of additional life insurance?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage88LifeInsurance("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage88LifeInsurance("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include this information about your life insurance needs and coverage options in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage88LifeInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding the necessity of additional life insurance coverage requires a thorough assessment of your current financial situation and the future needs of your dependents. We can assist you in evaluating your financial circumstances and determining whether additional coverage is warranted based on your specific situation. Would you like to review your financial situation and assess the potential benefits of additional life insurance?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage88Assessment("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage88Assessment("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include this information about your financial situation and potential life insurance needs in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage88Assessment("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Excellent! Now, let's continue with your estate planning. Ready?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage89Final("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage89Final("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Now, let's discuss funeral cover. Funeral cover provides liquidity to your beneficiaries within a short time frame after submitting a claim. Have you considered obtaining funeral cover?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage90FuneralCover(
                          "Yes, I have funeral cover in place"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have funeral cover in place
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage90FuneralCover(
                          "No, I haven’t considered obtaining funeral cover"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I haven’t considered obtaining funeral cover
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage90FuneralCover(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's recommended to nominate a beneficiary on the funeral cover to ensure prompt payment to your beneficiaries. Have you nominated a beneficiary on your funeral cover policy?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage90NominateFuneralCover("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage90NominateFuneralCover("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage90NominateFuneralCover(
                          "Wasn’t aware this was an option"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Wasn’t aware this was an option
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Nominating a beneficiary on your funeral cover policy ensures that the benefit is paid directly to the intended recipient without delays. It's a simple step that can provide peace of mind to your loved ones during a difficult time. Would you like assistance in nominating a beneficiary on your funeral cover policy?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage90BeneficiaryFuneralCover("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage90BeneficiaryFuneralCover("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include this information about nominating a beneficiary on your funeral cover policy in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage90BeneficiaryFuneralCover("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Funeral cover can offer peace of mind by providing financial assistance to your loved ones during a challenging time. If you haven't considered obtaining funeral cover, it may be worth exploring to ensure that your family is financially prepared to cover funeral expenses. We can help you understand the benefits of funeral cover and assist you in finding a suitable policy that meets your needs. Would you like more information on the benefits of funeral cover and how it can benefit your family?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage90AssistanceFuneralCover("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage90AssistanceFuneralCover("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Here’s an outline of the benefits of funeral cover:"
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    <br />
                    💸 Immediate Financial Support:
                    <br />
                    Funeral cover provides immediate funds to cover funeral
                    expenses, reducing the financial burden on your family
                    during a difficult time.
                    <br />
                    <br />
                    🧘 Peace of Mind:
                    <br />
                    Knowing that funeral expenses are covered offers peace of
                    mind for you and your loved ones, ensuring that financial
                    concerns don’t add to the stress of planning a funeral.
                    <br />
                    <br />
                    🏥 Comprehensive Coverage:
                    <br />
                    Funeral cover often includes a range of services, such as
                    transportation, burial or cremation, and related expenses,
                    ensuring that all aspects of the funeral are taken care of.
                    <br />
                    <br />
                    💼 Avoiding Financial Strain:
                    <br />
                    By having a dedicated policy for funeral expenses, you
                    prevent your family from having to dip into savings or take
                    out loans to cover costs, helping them avoid unnecessary
                    financial strain.
                    <br />
                    <br />
                    📜 Flexibility in Planning:
                    <br />
                    Many funeral cover policies offer flexibility in terms of
                    benefits and services, allowing you to tailor the policy to
                    meet your specific wishes and needs.
                    <br />
                    <br />
                    ⚡ Ease of Access:
                    <br />
                    Funeral cover typically provides a quick payout, ensuring
                    that funds are available when needed without lengthy
                    administrative delays.
                    <br />
                    <br />
                    📈 Protection Against Rising Costs:
                    <br />
                    With a funeral cover policy, you lock in a level of coverage
                    at today's rates, helping to protect against future
                    increases in funeral costs.
                    <br />
                    <br />
                    Would you like more details on how funeral cover can be
                    tailored to your specific needs or assistance in finding a
                    suitable policy?
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage90ImmediateFuneralCover("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage90ImmediateFuneralCover("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include details on tailoring funeral cover to your needs or finding a suitable policy in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage90ImmediateFuneralCover("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding the specifics of funeral cover and its benefits can help you make an informed decision about whether it's the right choice for you. We're here to provide you with all the information you need to assess the value of funeral cover and its relevance to your financial planning. Is there any specific information you'd like to know about funeral cover to help you make a decision?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage90specificsFuneralCover(
                          "Yes, I have a question"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have a question
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage90specificsFuneralCover("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Next, let's talk about trusts. A trust is an arrangement where property belonging to one party is managed by another party for the benefit of a third party. Are you familiar with trusts?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage91Trust("Yes, I have a question")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have a question
                    </button>
                    <button
                      onClick={() => handleButtonStage91Trust("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage91Trust("Tell me more")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Tell me more
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Trusts are an integral part of estate planning and can offer various benefits such as asset protection, tax efficiency, and control over asset distribution. They involve a legal arrangement where a trustee holds and manages assets for the benefit of beneficiaries. Trusts can be useful for preserving wealth, providing for loved ones, and ensuring your wishes are carried out. Would you like to explore how trusts can be tailored to meet your specific needs?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage91Integral("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage91Integral("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "We will include information on how trusts can be tailored to your specific needs in the report shared at the end of this conversation."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage91Integral("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "There are two types of trusts: inter vivos trusts and testamentary trusts. Inter vivos trusts are established during your lifetime, while testamentary trusts are created in your will and come into effect after your death. Have you considered setting up a trust?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage92Vivos(
                          "Yes, I have considered setting up a trust"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have considered setting up a trust
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage92Vivos(
                          "No, I haven’t thought about setting up a trust yet"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I haven’t thought about setting up a trust yet
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage92Vivos(
                          "I’m currently exploring the possibility of setting up a trust"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m currently exploring the possibility of setting up a
                      trust
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage92Vivos(
                          "I’m not sure if setting up a trust is necessary for me"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not sure if setting up a trust is necessary for me
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage92Vivos(
                          "I have some knowledge about trusts but need more information"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have some knowledge about trusts but need more
                      information
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage92Vivos(
                          "I have specific concerns or questions about setting up a trust"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have specific concerns or questions about setting up a
                      trust
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Setting up a trust can be a valuable component of your estate plan, providing various benefits such as asset protection, wealth preservation, and efficient distribution of assets to beneficiaries. Would you like more information on how trusts can benefit your specific situation?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage92Setting("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Exploring the possibility of setting up a trust is a proactive step in your estate planning journey. Trusts offer numerous advantages, including privacy, control over asset distribution, and tax efficiency. If you have any questions or need guidance on this process, feel free to ask."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage92Setting("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's understandable to have reservations or uncertainty about setting up a trust. Trusts can be customised to suit your unique needs and goals, offering flexibility and protection for your assets. If you're unsure about whether a trust is right for you, we can discuss your concerns and explore alternative options."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage92Setting("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Having some knowledge about trusts is a great starting point. However, it's essential to have a clear understanding of how trusts work and how they can benefit your estate planning strategy. If you need more information or have specific questions, feel free to ask, and I'll be happy to assist you."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage92Setting("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Addressing specific concerns or questions about setting up a trust is crucial for making informed decisions about your estate plan. Whether you're unsure about the process, concerned about potential implications, or have questions about trust administration, I'm here to provide guidance and support. Feel free to share your concerns, and we can discuss them further."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage92Setting("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage93Beneficial(
                          "Yes, protecting my estate against insolvency is a priority for me"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, protecting my estate against insolvency is a priority
                      for me
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage93Beneficial(
                          "I’m concerned about safeguarding assets in case of divorce"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m concerned about safeguarding assets in case of divorce
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage93Beneficial(
                          "Pegging growth in my estate sounds like a beneficial strategy"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Pegging growth in my estate sounds like a beneficial
                      strategy
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage93Beneficial(
                          "All of these reasons are relevant to my estate planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      All of these reasons are relevant to my estate planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage93Beneficial(
                          "None of these reasons are currently a priority for me"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      None of these reasons are currently a priority for me
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Additionally, transferring assets to a trust can save on executor's fees and exclude assets from your estate for estate duty purposes. Have you thought about these advantages in relation to your estate planning?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage94Executor(
                          "Yes, saving on executor’s fees is an important consideration for me"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, saving on executor’s fees is an important
                      consideration for me
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage94Executor(
                          "Excluding assets from my estate for estate duty purposes is a key factor in my planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Excluding assets from my estate for estate duty purposes
                      is a key factor in my planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage94Executor(
                          "I’m interested in exploring how transferring assets to a trust could benefit me"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m interested in exploring how transferring assets to a
                      trust could benefit me
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage94Executor(
                          "I haven’t considered these advantages before, but they sound appealing"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I haven’t considered these advantages before, but they
                      sound appealing
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage94Executor(
                          "I’m not sure how significant these advantages before would be for my estate planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not sure how significant these advantages before would
                      be for my estate planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage94Executor(
                          "I need more information to understand how these advantages would apply to my situation"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information to understand how these advantages
                      would apply to my situation
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage94Executor(
                          "I’m primarily focused on other aspects of my estate planning right now"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m primarily focused on other aspects of my estate
                      planning right now
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Exploring how transferring assets to a trust could benefit you is a wise decision in estate planning. It offers various advantages, such as reducing executor's fees and estate duty obligations, as well as providing asset protection and efficient distribution to beneficiaries. If you're interested in learning more about these benefits and how they apply to your specific situation, I am here to provide further information and guidance."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage94Executor("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding the significance of advantages like saving on executor's fees and excluding assets from your estate for estate duty purposes is essential in crafting an effective estate plan. These benefits can have a significant impact on preserving your wealth and ensuring efficient asset distribution. If you're uncertain about their significance or how they apply to your estate planning, I can provide more details and clarify any questions you may have."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage94Executor("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Exploring how transferring assets to a trust could benefit you is a wise decision in estate planning. It offers various advantages, such as reducing executor's fees and estate duty obligations, as well as providing asset protection and efficient distribution to beneficiaries. If you're interested in learning more about these benefits and how they apply to your specific situation, I'm here to provide further information and guidance."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage94Executor("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding the significance of advantages like saving on executor's fees and excluding assets from your estate for estate duty purposes is essential in crafting an effective estate plan. These benefits can have a significant impact on preserving your wealth and ensuring efficient asset distribution. If you're uncertain about their significance or how they apply to your estate planning, I can provide more details and clarify any questions you may have."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage94Executor("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's understandable to need more information to fully grasp how the advantages of transferring assets to a trust would apply to your situation. These advantages, such as saving on executor's fees and estate duty obligations, can vary depending on individual circumstances. If you require further clarification or personalised insights into how these benefits would impact your estate planning, I'm here to assist you and provide the information you need."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage94Executor("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Addressing specific concerns or questions about setting up a trust is crucial for making informed decisions about your estate plan. Whether you're unsure about the process, concerned about potential implications, or have questions about trust administration, I'm here to provide guidance and support. Feel free to share your concerns, and we can discuss them further."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage94Executor("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Donation of assets to a trust. This can remove assets from your estate and allow further growth within the trust and not increasing the value of your personal estate. Are you considering donating assets to a trust?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage95Donation(
                          "Yes, I’m interested in exploring this option"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I’m interested in exploring this option
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage95Donation(
                          "I’m not sure if donating assets to a trust aligns with my estate planning goals"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not sure if donating assets to a trust aligns with my
                      estate planning goals
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage95Donation(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage95Donation(
                          "I’m not comfortable with the idea of donating assets to a trust"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not comfortable with the idea of donating assets to a
                      trust
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding how donating assets to a trust aligns with your estate planning goals is crucial for making informed decisions. Donating assets to a trust can offer various benefits, including asset protection, estate tax reduction, and efficient wealth transfer. However, it's essential to ensure that this strategy aligns with your overall estate planning objectives. If you're unsure about its compatibility with your goals, I can provide more information and help you evaluate whether it's the right choice for your estate plan."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage95Donation("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Gathering more information before deciding on donating assets to a trust is a prudent approach. This strategy involves transferring assets to a trust, which can have implications for asset protection, tax planning, and wealth preservation. If you require additional details about how this option works, its potential benefits, and any considerations specific to your situation, I'm here to provide the necessary information and support your decision-making process."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage95Donation("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's important to note that while this strategy can reduce estate duty, there may be tax implications. Are you aware of the potential donations tax liability?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage96Strategy("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage96Strategy("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage96Strategy("Tell me more")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Tell me more
                    </button>
                  </div>
                </>
              )}
{message.content.includes("Hello and welcome to Moneyversity’s Estate Planning Consultant") && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    I'm here to help you navigate the estate planning process with ease 🛠️. 
                    Together, we’ll ensure your assets and wishes are well-documented and protected 🛡️. 
                    Ready to get started on this important journey? 🚀
                  </div>
                  <div className="space-x-2">
                    <br/>
                  <button
                  onClick={() => handleButtonStage0("Absolutely")}
                  className="px-4 py-2 mb-1 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Absolutely
                </button>
                <button
                  onClick={() => handleButtonStage0("Tell me more")}
                  className="px-4 py-2 mb-1 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Tell me more
                </button>
                <button
                  onClick={() => handleButtonStage0("Not now")}
                  className="px-4 py-2 mb-1 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Not now
                </button>
                  </div>
                </>
              )}

{message.content.includes("No problem at all. If you ever have questions or decide to start your estate planning, I’m here to help. Have a great day!") && (
                <>
                  
                  <div className="space-x-2">
                    <br/><button
                  onClick={() => handleButtonStage0("Let's chat again!")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Let's chat again!
                </button>
                
                  </div>
                </>
              )}
              


{message.content.includes("Let’s dive into the world of estate planning!") && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    Estate planning is the process of arranging how your assets will be managed and distributed after your death 🏡📜. It ensures that your wishes are respected, your loved ones are taken care of ❤️, and potential disputes are minimized ⚖️. <br/><br/> It’s important because it gives you peace of mind 🧘 knowing that your affairs are in order, and it can also help reduce taxes and legal costs in the future 💰📉.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                  onClick={() => handleButtonStage1("Tell me more")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                >
                  Tell me more
                </button>
                <button
                  onClick={() => handleButtonStage1("Skip Estate Planning Explanation")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                >
                 Skip Estate Planning Explanation
                </button>
                
                  </div>
                </>
              )}

  {message.content.includes("I know estate planning can be daunting") && (
            <>
              <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                Let’s get to know each other a bit better. What is your name?
              </div>
            </>
          )}



            {message.content.includes("When were you born?") && (
            <>
              <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                <Calendar onDateSelect={handleDateSelection} />
              </div>
            </>
          )}

{message.content.includes("Let’s talk about your family life quickly. Are you married or single?") && (
            <>
              
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonStage2("Married")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Married
                  </button>
                   <button
                    onClick={() => handleButtonStage2("Single")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Single
                  </button>
                  </div>
              
            </>
          )}
          


             

 {message.content.includes("Excellent. Are you married in or out of community of property? If married out of community of property, is it with or without the accrual system?") && (
            <div className="space-x-2 mt-2">
              <br/>
              <button
                onClick={() =>
                  handleButtonStage3("In Community of Property")
                }
                className="px-2 py-2 mb-1 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                In Community of Property
              </button>
              <button
                onClick={() =>
                  handleButtonStage3(
                    "Out of Community of Property with Accrual"
                  )
                }
                className="px-2 py-2 mb-1 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                Out of Community of Property with Accrual
              </button>
              <button
                onClick={() =>
                  handleButtonStage3(
                    "Out of Community of Property without Accrual"
                  )
                }
                className="px-2 py-2 rounded-md mb-1 border border-[#8DC63F] text-[#8DC63F]"
              >
                Out of Community of Property without Accrual
              </button>
              <button
                onClick={() => handleButtonStage3("I can't remember")}
                className="px-2 py-2 rounded-md mb-1 border border-[#8DC63F] text-[#8DC63F]"
              >
                I can't remember
              </button>
              <button
                onClick={() => handleButtonStage3("What is Accrual?")}
                className="px-2 py-2 rounded-md mb-1 border border-[#8DC63F] text-[#8DC63F]"
              >
                What is Accrual?
              </button>
              
            </div>
          )}

{message.content.includes("Excellent. In order to calculate the accrual, we need to know the specifics of your antenuptial contract (ANC). We will ask for your antenuptial contract at the end of this chat.") && (
            <div className="space-x-2">
              <br/><button
                onClick={() =>
                  handleButtonStage3("Continue")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
               Continue
              </button>
              
            </div>
          )}

{message.content.includes("No worries! Here’s a brief description of each type to help you remember:") && (
            <>
            <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
              👫⚖️ <b>In Community of Property:</b> All assets and debts are shared equally between spouses.<br/>
              📈🏠 <b>Out of Community of Property with Accrual:</b> Each spouse retains separate ownership of their assets, but they share the growth in value of their estates during the marriage<br/>
              🏡❌ <b>Out of Community of Property without Accrual:</b> Each spouse retains separate ownership of their assets, and there is no sharing of assets or growth in value <br/>
              If you are married out of community of property, you would have consulted with an attorney (or notary) and signed documents (antenuptial contract) before your wedding 📝💍. 
              <br/>Please check your marital contract or consult with your spouse to confirm ✅
            </div>
            <div className="space-x-2">
              <br/><button
                onClick={() =>
                  handleButtonStage3("In Community of Property")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                In Community of Property
              </button>
              <button
                onClick={() =>
                  handleButtonStage3(
                    "Out of Community of Property with Accrual"
                  )
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Out of Community of Property with Accrual
              </button>
              <button
                onClick={() =>
                  handleButtonStage3(
                    "Out of Community of Property without Accrual"
                  )
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Out of Community of Property without Accrual
              </button>
              <button
                onClick={() => handleButtonStage3("I can't remember")}
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                I can't remember
              </button>
            </div>
            </>
          )}

{message.content.includes("Accrual is a concept in marriage where the growth in wealth during the marriage is shared between spouses. When a couple marries under the accrual system, each spouse keeps the assets they had before the marriage. However, any increase in their respective estates during the marriage is shared equally when the marriage ends, either through divorce or death.") && (
            <>
            <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
              For example, if one spouse's estate grows significantly while the other’s does not 📈💼, the spouse with the smaller growth may be entitled to a portion of the increase in the other’s estate 💰. This ensures fairness and protects both parties 🤝🛡️.<br/>
            </div>
            <div className="space-x-2">
              <br/><button
                onClick={() =>
                  handleButtonStage3("In Community of Property")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                In Community of Property
              </button>
              <button
                onClick={() =>
                  handleButtonStage3(
                    "Out of Community of Property with Accrual"
                  )
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Out of Community of Property with Accrual
              </button>
              <button
                onClick={() =>
                  handleButtonStage3(
                    "Out of Community of Property without Accrual"
                  )
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Out of Community of Property without Accrual
              </button>
              <button
                onClick={() => handleButtonStage3("I can't remember")}
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                I can't remember
              </button>
            </div>
            </>
          )}

{message.content.includes("Do you currently have a will in place?") && (
            <>
            
            <div className="space-x-2">
              <br/><button
                onClick={() =>
                  handleButtonStage4("Yes")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Yes
              </button>
              <button
                onClick={() =>
                  handleButtonStage4("No")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
               No
              </button>
            </div>
            </>
          )}

          {message.content.includes("Creating a will is an important step in securing your assets and ensuring your wishes are followed. We can start drafting your will right here by answering a few questions about your estate and preferences a little later in the chat.") && (
            <>
            
            <div className="space-x-2">
              <br/><button
                onClick={() =>
                  handleButtonStage4("Continue")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Continue
              </button>
             
            </div>
            </>
          )}
          
{message.content.includes("When was the last time you reviewed your will? It’s a good idea to keep it up-to-date with any changes in your life") && (
            <>
            
            <div className="space-x-2">
              <br/><button
                onClick={() =>
                  handleButtonStage5("Will is up to date")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Will is up to date
              </button>
             <button
                onClick={() =>
                  handleButtonStage5("Will needs to be reviewed & updated")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Will needs to be reviewed & updated
              </button>
            </div>
            </>
          )}

{message.content.includes("Do you currently have a trust in place") && (
            <>
            
            <div className="space-x-2">
              <br/><button
                onClick={() =>
                  handleButtonStage6("Yes")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Yes
              </button>
             <button
                onClick={() =>
                  handleButtonStage6("No")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                No
              </button>
            </div>
            </>
          )}


{message.content.includes("Do you have any dependents?") && (
  <div className="flex flex-col space-y-2 mt-2">
    <label className="text-white">Please select your dependents:</label>
    {Object.entries(checkboxes).map(([key, value]) => {
      // Convert camelCase to separate words
      const labelText = key
        .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter

      return (
        <div
          key={key}
          className={`${
            value ? "bg-[#8DC63F]" : ""
          } flex items-center ps-4 border border-[#8DC63F] rounded mt-2 text-white`}
        >
          <CustomCheckBox
            id={key}
            name="dependents"
            className="w-4 h-4 rounded"
            value={key.charAt(0).toUpperCase() + key.slice(1)}
            checked={value}
            onChange={handleCheckboxChange}
          />
          <label
            htmlFor={key}
            className="w-full py-4 ms-2 text-sm font-medium text-white"
          >
            {labelText}
          </label>
        </div>
      );
    })}
  </div>
)}



{message.content.includes("Is there anything else you’d like to add about your personal particulars or any questions you have at this stage?") && (
               <div className="space-x-2">
              <br/><button
                onClick={() =>
                  handleButtonStage7("Yes, I have a question")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                Yes, I have a question
              </button>
             <button
                onClick={() =>
                  handleButtonStage7("No, let’s move on")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
              >
                No, let’s move on
              </button>
            </div>
              )}

















































              {message.content.includes(
                "Donations tax is a tax imposed on the transfer of assets to a trust or natural person without receiving adequate consideration in return. It's important to understand that while transferring assets to a trust can help reduce estate duty, it may trigger donations tax liabilities. The amount of donations tax payable depends on several factors, including the value of the assets transferred, any available exemptions or deductions, and the relationship between the donor and the recipient. The donations tax threshold is R100 000 per year."
              ) && (
                <>
                  <br />
                  📜 If you'd like to learn more about donations tax and its
                  implications for your estate planning, I can provide further
                  details to help you make informed decisions.
                  <br />
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage97Donation("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Next, let's talk about selling assets to the trust. This can be a strategic way to remove assets from your estate. However, it’s important to note that a loan account is not automaticaaly created unless there’s a difference between the sale price and the value of the asset. Have you considered selling assets to the trust in this way?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage98Assets(
                          "Yes, I’m interested in exploring this option"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I’m interested in exploring this option
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage98Assets(
                          "I’m not sure if selling assets to a trust aligns with my estate planning goals"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not sure if selling assets to a trust aligns with my
                      estate planning goals
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage98Assets(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage98Assets(
                          "I’m not comfortable with the idea of selling assets to a trust"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not comfortable with the idea of selling assets to a
                      trust
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Selling assets to a trust can help minimize estate duty and protect your assets. However, remember that if the sale price matches the asset's value, a loan account won't be created. Additionally, capital gains tax and transfer duty may apply if the asset is a capital asset like property. We can discuss how this option fits with your estate planning goals."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage98Assets("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's crucial to align your estate planning strategies with your goals. Selling assets to a trust can offer benefits, such as reducing estate duty, but it also comes with implications like capital gains tax and transfer duty. If you're unsure whether this strategy is right for you, we can discuss it further to ensure it aligns with your specific needs and circumstances."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage98Assets("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding the full implications of selling assets to a trust is key. While it can offer estate planning benefits, it's important to consider the potential tax implications, like capital gains tax and transfer duty. If you need more information on how this works and its impact on your estate planning, I’m here to provide the necessary details."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage98Assets("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Selling assets to the trust might reduce estate duty, but a sale and loan agreement should be in place if a loan account is to be created. Are you familiar with the terms and conditions of such agreements?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage99Selling("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I am familiar
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage99Selling(
                          "I have some understanding but need more clarity"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have some understanding but need more clarity
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage99Selling(
                          "I need assistance in understanding the terms and conditions"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need assistance in understanding the terms and
                      conditions
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage99Selling(
                          "I prefer not to engage in agreements that involve selling assets to a trust"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I prefer not to engage in agreements that involve selling
                      assets to a trust
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Sale and loan agreements can be complex, especially when transferring assets to a trust. These agreements detail the sale transaction and the loan terms, if applicable. If you need help understanding these terms and conditions, or have questions about how they apply to your situation, I’m here to provide guidance and support."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage99Selling("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "It’s great that you have some understanding of sale and loan agreements. These agreements outline the sale terms and the loan's repayment terms if a loan account is created. If you need more clarity or have questions about specific aspects of these agreements, feel free to ask. I’m here to help provide additional information and support your understanding."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage99Selling("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes(
                "Lastly, let's discuss the costs and tax consequences of transferring assets to a trust. This may include capital gains tax, transfer duty (for immovable property), and possible donations tax. Have you taken these factors into account?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage99Final("Yes, I am familiar")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I am familiar
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage99Final(
                          "I have some understanding but need more clarity"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I have some understanding but need more clarity
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage99Final(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage99Final(
                          "I’m not comfortable with the potential costs & tax implications at this time"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not comfortable with the potential costs & tax
                      implications at this time
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Selling assets to a trust can be a strategic way to transfer assets out of your estate, potentially reducing estate duty and protecting your wealth. However, it’s important to consider the potential tax implications, such as capital gains tax and transfer duty, and whether a loan account will actually be created. If you’re interested in exploring this option further, we can dive into the specifics and see how it aligns with your overall estate planning goals."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage99Final("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's good to hear that you have some understanding of the costs and tax consequences associated with transferring assets to a trust. These factors can indeed be complex, and it's important to have a clear understanding to make informed decisions. If you need more clarity on any specific aspects of these costs and tax implications or if you have any questions about how they may impact your estate planning, feel free to ask. I'm here to provide additional information and support your understanding."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage99Final("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Understanding the costs and tax implications of transferring assets to a trust is crucial for making informed decisions in your estate planning. If you need more information before deciding, I'm here to help. We can discuss these factors in more detail, clarify any questions you may have, and ensure that you have a comprehensive understanding of how they may affect your estate plan. Feel free to ask any questions or raise any concerns you may have."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage99Final("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Now, let's explore the concept of an investment trust. This structure allows for annual donations to the trust, reducing your estate over time. Are you interested in setting up an investment trust?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage100Investment("Yes, I’m interested")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I’m interested
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage100Investment(
                          "I’m not sure if an investment trust aligns with my estate planning goals"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I’m not sure if an investment trust aligns with my estate
                      planning goals
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage100Investment(
                          "I prefer to explore other options"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I prefer to explore other options
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage100Investment(
                          "I need more information before deciding"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I need more information before deciding
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Setting up an investment trust can be a strategic way to manage your assets and reduce your estate over time. It allows for annual donations to the trust, which can have various benefits for your estate planning. If you're interested in exploring this option further, we can discuss the specifics of how an investment trust could align with your estate planning goals and tailor a plan to suit your needs."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage100Investment("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's understandable to have questions about whether an investment trust aligns with your estate planning goals. An investment trust can offer unique advantages, but it's essential to ensure that it fits your specific needs and objectives. If you're uncertain, we can delve deeper into how an investment trust works and explore whether it's the right option for you."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage100Investment("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Exploring different options is an important part of estate planning, and it's essential to find the approach that best suits your needs and objectives. If you prefer to explore other options besides setting up an investment trust, we can discuss alternative strategies and find the solution that aligns most closely with your estate planning goals."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage100Investment("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Making an informed decision about whether to set up an investment trust requires a clear understanding of how it works and how it may impact your estate planning goals. If you need more information before deciding, feel free to ask any questions you may have. We can discuss the specifics of an investment trust, its benefits, and how it may fit into your overall estate plan."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage100Investment("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "An investment trust can provide flexibility for the trust beneficiaries to receive income and borrow funds. Does this align with your estate planning goals?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage101InvestmentFlexibility("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage101InvestmentFlexibility("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage101InvestmentFlexibility(
                          "Tell me more"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Tell me more
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "If an investment trust doesn't align with your estate planning goals, we can explore other options that may better suit your needs. Estate planning is a personalised process, and it's essential to find strategies that align closely with your objectives and preferences. Let's discuss alternative approaches to ensure your estate plan reflects your wishes and priorities."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage101InvestmentFlexibility("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "An investment trust offers flexibility for beneficiaries to receive income and borrow funds, providing potential advantages for estate planning. With an investment trust, you can structure distributions in a way that aligns with your goals and preferences. If you're interested in learning more about how an investment trust could benefit your estate plan, I can provide further details on how it works and its potential advantages."
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage101InvestmentFlexibility("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Thanks! Do you have anything you’d like to add or any questions that I can help you with today?"
              ) && (
                <>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage101Final("Yes, I have a question")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => handleButtonStage101Final("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Thanks for sharing your thoughts,"
              ) && (
                <>
                <div className="space-x-2 my-2">
                  <button
                    onClick={() =>
                      handleButtonStage20Final("Yes, I have a question")
                    }
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes, I have a question
                  </button>
                  <button
                    onClick={() => handleButtonStage20Final("No")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F] ml-2"
                  >
                    No
                  </button></div>
                </>
              )}

              {message.content.includes(
                "The success of your estate plan relies on accurate information about your assets, liabilities, and clear communication of your wishes. How confident are you in the accuracy of the details you’ve provided so far? And would you be open to regularly reviewing and updating your estate plan to reflect any changes?"
              ) && (
                <>
                <div className="space-x-2 my-2">
                  <button
                    onClick={() => handleButtonStage20("Yes")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleButtonStage20("No")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    No
                  </button></div>
                </>
              )}

              {message.content.includes(
                "Reducing taxes and expenses payable upon your death can help maximise the value passed on to your heirs. How high a priority is it for you to minimise these costs?"
              ) && (
                <>
                <TaxesSlider onProceed={handleButtonStage20Payable} />
                  {/* <button
                    onClick={() => handleButtonStage20Payable("Low")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Low
                  </button>
                  <button
                    onClick={() => handleButtonStage20Payable("Average")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Average
                  </button>
                  <button
                    onClick={() => handleButtonStage20Payable("High")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    High
                  </button> */}
                </>
              )}

              {(message.content.includes(
                "While these templates and checklists can help you get started, there are times when seeking professional"
              ) ||
                message.content.includes("Checklist is downloaded")) && (
                <>
                <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                While these templates and checklists can help you get started, there are times when seeking professional legal advice is essential. Consider getting legal advice if the following applies to you:
                  </div><br/>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    🏦 <b>Complex Estates:</b>
                    <br />
                    If you have a large or complex estate, a lawyer can help
                    navigate intricate legal requirements and tax implications.
                    <br />
                    <br />
                    ⚖️ <b>Disputes:</b>
                    <br />
                    If you anticipate family disputes or have a blended family,
                    legal advice can ensure your wishes are clear and
                    enforceable.
                    <br />
                    <br />
                    💼 <b>Business Interests:</b>
                    <br />
                    If you own a business, a lawyer can assist in ensuring its
                    continuity and proper transfer of ownership.
                    <br />
                    <br />
                    📜 <b>Changing Laws:</b>
                    <br />
                    Estate laws can change. A legal professional can keep your
                    plan up-to-date with the latest regulations.
                    <br />
                    <br />
                    *Old Mutual has a dedicated team of legal advisers that can
                    assist, free of charge when consulting via financial
                    adviser.
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage15("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                    {/* <button
                      onClick={() =>
                        handleButtonStage14Contact(
                          "Get in touch with an Old Mutual Financial Advisor"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Get in touch with an Old Mutual Financial Advisor
                    </button> */}
                  </div>
                </>
              )}

              {(message.content.includes(
                "Great! Let’s move on to the next section where we’ll discuss your objectives for estate planning. Ready?"
              )) && (
                <>
                
                  <div className="space-x-2">
                    <br/><button
                      onClick={() => handleButtonStage15v2("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Continue
                    </button>
                    {/* <button
                      onClick={() =>
                        handleButtonStage14Contact(
                          "Get in touch with an Old Mutual Financial Advisor"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Get in touch with an Old Mutual Financial Advisor
                    </button> */}
                  </div>
                </>
              )}
              

              {faqStage && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                    ❓ What is estate planning?
                    <br />
                    Estate planning is the process of arranging for the
                    management and disposal of a person’s estate during their
                    life and after death. It involves creating documents like
                    wills, trusts, and powers of attorney. 📝💼
                    <br />
                    <br />
                    ❓ Why is having a will important?
                    <br />
                    A will ensures your assets are distributed according to your
                    wishes, names guardians for minor children, and can help
                    reduce estate taxes and legal fees. 📜👨‍👩‍👧‍👦
                    <br />
                    <br />
                    ❓ What happens if I die without a will?
                    <br />
                    If you die intestate (without a will), your estate will be
                    distributed according to South Africa’s Intestate Succession
                    Act, which may not align with your wishes. ⚖️❗
                    <br />
                    <br />
                    ❓ Can I change my will after it’s been created?
                    <br />
                    Yes, you can update your will as often as you like. It’s
                    recommended to review and update it after major life events,
                    such as marriage, divorce, or the birth of a child. 🔄💍👶
                    <br />
                    <br />
                    ❓ What is a trust and why would I need one?
                    <br />
                    A trust is a legal arrangement where a trustee manages
                    assets on behalf of beneficiaries. Trusts can help manage
                    assets, reduce estate taxes, and provide for beneficiaries
                    according to your wishes. 🏦🔐
                    <br />
                    <br />
                    ❓ When should I seek legal advice for estate planning?
                    <br />
                    It’s advisable to seek legal advice if you have a large or
                    complex estate, anticipate family disputes, own a business,
                    or need to stay updated with changing laws. 🧑‍⚖️💡
                    <br />
                    <br />
                    Do you have any other questions or need further information?
                    I’m here to help! 🤝💬
                  </div>
                  <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage14("Yes, I have a question")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have a question
                    </button>
                    <button
                      onClick={() => handleButtonStage14("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}
              

              {message.content.includes(
                "Is there anything else you’d like to know about estate planning or any questions you have at this stage?"
              ) && (
                <>
                <div className="space-x-2">
                    <br/><button
                      onClick={() =>
                        handleButtonStage12("Yes, I have a question")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have a question
                    </button>
                    <button
                      onClick={() => handleButtonStage12("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}



              {message.content.includes(
                "It’s important to understand the legal requirements and considerations specific to South Africa:"
              ) && (
                  <>
                    <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                     <br />
                      Here are some important acts and considerations:
                    </div>
                    <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      <b>Wills Act 7 of 1953</b>📝
                      <br />
                      The Wills Act governs the creation and execution of wills.
                      Your will must be in writing, signed by you, and witnessed
                      by two people who are not beneficiaries.
                      <br />
                      <br />
                      <b>Estate Duty Act 45 of 1955</b>💼
                      <br />
                      This Act imposes estate duty (a form of tax) on the estate
                      of a deceased person. The first R3.5 million of an estate
                      is exempt from estate duty.
                      <br />
                      <br />
                      <b>Intestate Succession Act 81 of 1987</b>📋
                      <br />
                      If you die without a will, the Intestate Succession Act
                      determines how your estate will be distributed. This may
                      not align with your wishes, so having a will is crucial.
                      <br />
                      <br />
                      <b>Marital Property Regimes</b>💍
                      <br />
                      Your marital status can affect your estate planning. South
                      Africa recognises different marital property regimes, such
                      as community of property, antenuptial contract (ANC), and
                      ANC with accrual. It’s important to consider how these
                      will impact your estate.
                      <br />
                      <br />
                     <b>Master of the High Court</b>🏛️
                      <br />
                      The Master of the High Court oversees the administration
                      of deceased estates. Executors of estates must be
                      appointed and approved by the Master.
                      <br />
                      <br />
                      Understanding these components and local laws can help
                      ensure that your estate plan is comprehensive and legally
                      sound. 📚✅
                      <br />
</div>
<br />
 <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
  <br />
  In South Africa, there are various types of marriages:
  <br />
  <br />
  <b>Civil Marriage</b>📜
  <br />
  A formal marriage registered with Home Affairs, governed by the Marriage Act, 1961. 
  (This is the most common and traditional form as we know it).
  Can be in or out of community of property (with or without the accrual).
  <ul>
    <li>Requirements:</li>
    <li> - Must be conducted by a marriage officer authorised by Home Affairs.</li>
    <li> - Both parties must be at least 18 years old (or 16 with parental consent).</li>
    <li> - Requires submission of documents such as identity documents and proof of dissolution of previous marriages, if applicable.</li>
  </ul>
  <br />
  <b>Customary Marriage</b>🎎
  <br />
  A marriage conducted according to indigenous/black South African customs, recognised under the Recognition of Customary Marriages Act, 1998.
  The default property regime is in community of property, but parties can decide on out of community of property.
  <ul>
    <li>Requirements:</li>
    <li> - Must adhere to the customs of the community to which the parties belong.</li>
    <li> - Typically involves rituals and ceremonies traditional to the community.</li>
    <li> - Must be registered with the Department of Home Affairs to be legally recognised.</li>
  </ul>
  <br />
  <b>Religious Marriage</b>
  <br />
  A marriage conducted according to religious rites but not necessarily registered with Home Affairs.
  <ul>
    <li>Requirements:</li>
    <li> - Varies depending on the religion (e.g., temple wedding).</li>
    <li> - Should be registered with the Department of Home Affairs to gain legal status.</li>
    <li> - Not all religious marriages are recognised.</li>
  </ul>
  <br />
  <b>Civil Union</b>🏳️‍🌈
  <br />
  Recognised under the Civil Union Act, 2006, and can be entered into by same-sex or opposite-sex couples.
  Carries the same legal standing as persons married in terms of the Marriage Act.
  <ul>
    <li>Requirements:</li>
    <li> - Must be performed by a registered civil union officer.</li>
    <li> - Parties can choose between a marriage-like relationship or a domestic partnership.</li>
  </ul>
  <br />
  <b>Co-habitation</b>🏡
  <br />
  Not legally recognised as marriage. There is no such thing as a common-law marriage in South African law.
  Simply living together does not create a legal marriage-like status.
  <ul>
    <li>A marriage that is not recognised under civil law is not considered a legal marriage in South Africa, with a few exceptions.</li>
    <li>This can have implications on your estate plan as you can be considered single/unmarried if your marriage is not registered with Home Affairs.</li>
  </ul>
                    </div>
                    <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      Do you have any questions regarding bequeathing a farm at this stage?
                    </div>
                    <div className="space-x-2 mt-2">
                      <button
                        onClick={() =>
                          handleButtonStage13v2v1("Yes, I have a question.")
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        Yes, I have a question.
                      </button>
                      <button
                        onClick={() =>
                          handleButtonStage13v2v1(
                            "No, let’s move on"
                          )
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        No, let’s move on
                      </button>
                    </div>
                  </>
                )}

                
                {message.content.includes(
                "Estate duty is a tax that has an impact on your estate. Do you want to explore estate duty further?"
              ) && (
                <>
                <div className="space-x-2 mt-2">
                      <button
                        onClick={() =>
                          handleButtonStage13EstateDuty("Yes")
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() =>
                          handleButtonStage13EstateDuty(
                            "No, let’s move on"
                          )
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        No, let’s move on
                      </button>
                    </div>
                </>
              )}

{message.content.includes(
  "This tax is levied on the total value of a deceased person’s estate. The conditions include:"
) && (
  <>
   
    <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
      <b>Threshold</b> 💰
      <br />
      There is a basic threshold (exemption limit) below which no estate duty is payable. In South Africa, as of 2024, this is R3.5 million. Meaning, only estates or portions of an estate that exceed R3.5 million are estate dutiable.
      <br />
      <br />
      <b>Rates</b> 📊
      <br />
      The estate duty rate is generally 20% on the value above the threshold. For amounts exceeding R30 million, a higher rate of 25% applies.
      <br />
      <br />
      <b>Example 1</b>: Peter’s estate is worth R5 million. His estate will be liable for estate duty as follows:
      <br />
      R5m - R3.5m = R1.5m
      <br />
      R1.5m x 20% = R300,000 payable.
      <br />
      <br />
      <b>Example 2</b>: Peter’s estate is worth R50 million. His estate will be liable for estate duty as follows:
      <br />
      20% x R30m
      <br />
      25% x (R50m - R30m)
      <br />
      <br />
      <b>Deductions</b> 📝
      <br />
      Certain deductions can be applied, such as liabilities and bequests to charities.
      <br />
      <br />
      <b>Farm Property Exemption</b> 🚜
      <br />
      Farm valuation exemption for estate duty provides for a deduction of up to R30 million on the value of farm property from the estate duty calculation. The R30 million of the value of qualifying farm property is not subject to estate duty.
      <br />
      Example: If a farm is valued at R50 million and qualifies for the full exemption, only R20 million would be subject to estate duty, potentially reducing the estate duty payable.
      <br />
      <br />
    </div>
    <div className="space-x-2 mt-2">
      <button
        onClick={() => handleButtonStage13v2("Yes, I have a question")}
        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
      >
        Yes, I have a question
      </button>
      <button
        onClick={() => handleButtonStage13v2("No, let’s move on")}
        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
      >
        No, let’s move on
      </button>
    </div>
  </>
)}

              

{message.content.includes(
                "Property is a common asset that is bequeathed in estate plans. Farms in particular have specific bequeathing conditions. Do you want to explore these conditions further?"
              ) && (
                <>
                  <div className="space-x-2 mt-2">
                      <button
                        onClick={() =>
                          handleButtonStage13v3("Yes")
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() =>
                          handleButtonStage13v3(
                            "No, does not apply to me"
                          )
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        No, does not apply to me
                      </button>
                    </div>
                </>
              )}

{message.content.includes(
                "A farm may only be sold to one person or entity and as such, the offer to purchase cannot be made by more than one person. An exception to this would be if a couple is married in community of property as South African law views their estate as one."
              ) && (
                <>
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
  🌾 As with the case of agricultural land being bequeathed to multiple heirs, the consent of the Minister may be requested in order to grant permission for the sale of agricultural land to more than one person. This consent must be sought prior to the agreement of sale being concluded and therefore an offer to purchase by multiple purchasers can only be made after the owner has received the Minister's consent.
  <br />
  <br />
  📜 Some title deeds (of farms) may include conditions about who can inherit the farm or whether the land can be sold or subdivided. This would be an instance of:
  <br />
  <br />
  🔹 Fideicommissum
  <br />
  A legal arrangement where the owner of an asset leaves it to someone with the condition that, after their death, the asset will be passed on to another person or group.
  <br />
  📋 For example, you might leave your farm to your children with the condition that, after their death, it will go to your grandchildren.
  <br />
  <br />
  🔹 Usufruct
  <br />
  Gives someone the right to use and benefit from an asset (like living in a house 🏠 or earning income from a property 💰) without owning it.
  <br />
  The person with usufruct has control over the asset for a certain period, but they can't sell or permanently alter it.
  <br />
  💡 For instance, if you have usufruct over a property, you can live in it or rent it out, but you can't sell the property.
</div>
 <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      Do you have any questions regarding bequeathing a farm at this stage?
                    </div>
                     <div className="space-x-2 mt-2">
                      <button
                        onClick={() =>
                          handleButtonStage13("Yes, I have a question")
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        Yes, I have a question
                      </button>
                      <button
                        onClick={() =>
                          handleButtonStage13(
                            "No, let’s move on"
                          )
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                      >
                        No, let’s move on
                      </button>
                    </div>
                </>
              )}



















              {/* {educationInformation && (
                <>
                 
                  <div className="space-x-2 mt-2">
                    There are 9 key components of estate planning:
                    <br />
                    📜 Wills
                    <br />
                    🔐 Trusts
                    <br />
                    🖋️ Power of Attorney
                    <br />
                    🏥 Living Will
                    <br />
                    💼 Beneficiary Designations
                    <br />
                    🧑‍💼 Beneficiaries
                    <br />
                    📑 Beneficiary Designation Forms
                    <br />
                    ⚖️ Executor
                    <br />
                    🛡️ Guardian
                    <br />
                    Would you like a detailed explanation of all or some of
                    these components?
                  </div>
                  <div className="space-x-2 mt-2">
                    <button
                      onClick={() => handleButtonComponent("Wills")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Wills
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage80Claims(
                          "I don’t have any maintenance obligations"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      I don’t have any maintenance obligations
                    </button>
                    <button
                      onClick={() => handleButtonComponent("Trusts")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Trusts
                    </button>
                    <button
                      onClick={() => handleButtonComponent("Power of Attorney")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Power of Attorney
                    </button>
                    <button
                      onClick={() => handleButtonComponent("Living Will")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Living Will
                    </button>
                    <button
                      onClick={() =>
                        handleButtonComponent("Beneficiary Designations")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Beneficiary Designations
                    </button>
                    <button
                      onClick={() =>
                        handleButtonComponent("Beneficiaries")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Beneficiaries
                    </button>
                    <button
                      onClick={() =>
                        handleButtonComponent("Beneficiary Designation Forms")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Beneficiary Designation Forms
                    </button>
                    <button
                      onClick={() =>
                        handleButtonComponent("Executor")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Executor
                    </button>
                    <button
                      onClick={() =>
                        handleButtonComponent("Guardian")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Guardian
                    </button>
                     <button
                      onClick={() =>
                        handleButtonComponent("All Key Terms")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      All Key Terms
                    </button>
                    
                  </div>
                </>
              )} */}

{educationInformation && (
                <>
                 
                  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                   
                    📜 Wills
                    <br />
                    🔐 Trusts
                    <br />
                    🖋️ Power of Attorney
                    <br />
                    🏥 Living Will 
                    <br />
                    🧑‍💼 Beneficiaries
                    <br />
                    📑  Beneficiary Designation Forms
                    <br />
                    ⚖️ Executor
                    <br />
                    🛡️ Guardian
                    <br />
                    Would you like a detailed explanation of all or some of these terms?
                  </div>
                  <div className="space-x-2 mt-2">
              {terms.map((term) => (
  <>
    <br /> {/* Adjust margin as needed */}
    <label
      key={term}
      htmlFor={term}
      className={`flex items-center space-x-2 px-4 py-2 w-[400px] -my-2 rounded-md border cursor-pointer ${
        selectedTerms.includes(term)
          ? "bg-[#8DC63F] text-white border-transparent"
          : "border-[#8DC63F] text-[#8DC63F] bg-transparent"
      }`}
    >
      <input
        type="checkbox"
        id={term}
        onChange={handleCheckboxChangeTerms}
        name={term}
        value={term}
        checked={selectedTerms.includes(term)}
        className="custom-checkbox h-6 w-6 rounded-sm focus:ring-0"
      />
      &nbsp;&nbsp;&nbsp;{term}
    </label>
  </>
))}



      <button
        onClick={handleProceed}
        className="mt-4 px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition"
      >
        Proceed
      </button>
                    
                  </div>
                   
                </>
              )}


              

{message.content.includes("Here are the definition of key terms:") && (
                <>
            
      {selectedTerms.length > 0 && (
  <>
    <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
      {selectedTerms.includes("Wills") && (
        <>
          Wills 📜
          <br />
          A will is a legal document that says how you want your belongings, money, and assets to be divided after you pass away. 
          It also names someone to carry out your wishes (an executor) and can appoint guardians for your children.
          <br />
          <br />
        </>
      )}

      {selectedTerms.includes("Trusts") && (
        <>
          Trusts 🔐
          <br />
          A trust is a legal arrangement where you (the founder/settlor) place assets, like money or property, into a separate entity managed by a person (the trustee) for the benefit of someone else (the beneficiary). 
          The trustee manages these assets according to your instructions, often to provide for beneficiaries over time, such as children or loved ones.
          A trust can be set up in your will and will come into existence when you pass away, or it can be set up while you are alive.
          <br />
          <br />
        </>
      )}

      {selectedTerms.includes("Power of Attorney") && (
        <>
          Power of Attorney 🖋️
          <br />
          A power of attorney is a legal document that allows you to give someone else the authority to make decisions for you. 
          It could be about financial matters, health care, or other personal affairs, especially if you’re unable to handle them yourself.
          <br />
          <br />
        </>
      )}

      {selectedTerms.includes("Living Will") && (
        <>
          Living Will 🏥
          <br />
          A living will is a document where you write down your wishes about medical care if you’re unable to communicate. 
          It’s about what kind of treatments you do or don’t want if you’re seriously ill or injured and can’t speak for yourself.
          <br />
          <br />
        </>
      )}

      {selectedTerms.includes("Beneficiaries") && (
        <>
          Beneficiaries 💼
          <br />
          Beneficiaries are the people you choose to receive your money, assets, or other benefits when you pass away. 
          They are named in your insurance policies or retirement benefit forms.
          <br />
          <br />
        </>
      )}

      {selectedTerms.includes("Beneficiary Designation Forms") && (
        <>
          Beneficiary Designation Forms 📑
          <br />
          For assets like retirement accounts, life insurance, or certain bank accounts, you may need to fill out a form naming who gets those assets after you pass away. 
          These forms typically override what’s written in a will or trust.
          <br />
          <br />
        </>
      )}

      {selectedTerms.includes("Executor") && (
        <>
          Executor ⚖️
          <br />
          The person named in your will who is responsible for carrying out your wishes after you pass away, including paying debts and distributing assets to beneficiaries.
          <br />
          <br />
        </>
      )}

      {selectedTerms.includes("Guardian") && (
        <>
          Guardian 🛡️
          <br />
          If you have minor children, you can name a guardian in your will. 
          This person will be responsible for taking care of your children if something happens to you.
          <br />
          <br />
        </>
      )}
    </div>

   
  </>
)}


    <div className="space-x-2 mt-2">
      <button
        onClick={() => handleButtonStage12("Proceed")}
        className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
      >
        Proceed
      </button>
    </div>
                </>
              )}


              



{message.content.includes("Here are the potential outcomes of each scenario:") && (
                <>
            
      {selectedScenario.length > 0 && (
  <>
    <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">

      {selectedScenario.includes("All Scenarios") ? (
  <>
    <b>Scenario 1: Setting Up a Trust</b>
    <br />
    Imagine you set up a trust to manage your assets. The trust could be used to provide for your children’s education and care until they reach adulthood. This can protect the assets from being mismanaged or spent too quickly. Additionally, trusts can offer tax benefits and ensure a smoother transfer of assets to your beneficiaries.
    <br />
    <b>Scenario 2: Dying Intestate (Without a Will)</b>
    <br />
    Suppose you pass away without a will. According to South Africa’s Intestate Succession Act, your estate will be distributed to your surviving spouse and children, or other relatives if you have no spouse or children. This may not align with your personal wishes and could lead to disputes among family members.
    <br />
    <b>Scenario 3: Appointing a Power of Attorney</b>
    <br />
    Consider appointing a trusted person as your power of attorney. This individual can manage your financial and legal affairs if you become incapacitated. For example, they could pay your bills, manage your investments, or make medical decisions on your behalf. This ensures that your affairs are handled according to your wishes, even if you’re unable to communicate them.
    <br />
    <b>Scenario 4: Tax Implications of Estate Planning Decisions</b>
    <br />
    Imagine you decide to gift a portion of your assets to your children during your lifetime. While this can reduce the size of your taxable estate, it’s important to consider any potential gift taxes and how it might impact your overall estate plan. Consulting with a tax adviser can help you understand the best strategies for minimising tax liabilities while achieving your estate planning goals.
    <br />
    <br />
  </>
) : (
  <>
    {selectedScenario.includes("Scenario 1") && (
      <>
        <b>Scenario 1: Setting Up a Trust</b>
        <br />
        Imagine you set up a trust to manage your assets. The trust could be used to provide for your children’s education and care until they reach adulthood. This can protect the assets from being mismanaged or spent too quickly. Additionally, trusts can offer tax benefits and ensure a smoother transfer of assets to your beneficiaries.
        <br />
        <br />
      </>
    )}

    {selectedScenario.includes("Scenario 2") && (
      <>
        <b>Scenario 2: Dying Intestate (Without a Will)</b>
        <br />
        Suppose you pass away without a will. According to South Africa’s Intestate Succession Act, your estate will be distributed to your surviving spouse and children, or other relatives if you have no spouse or children. This may not align with your personal wishes and could lead to disputes among family members.
        <br />
        <br />
      </>
    )}

    {selectedScenario.includes("Scenario 3") && (
      <>
        <b>Scenario 3: Appointing a Power of Attorney</b>
        <br />
        Consider appointing a trusted person as your power of attorney. This individual can manage your financial and legal affairs if you become incapacitated. For example, they could pay your bills, manage your investments, or make medical decisions on your behalf. This ensures that your affairs are handled according to your wishes, even if you’re unable to communicate them.
        <br />
        <br />
      </>
    )}

    {selectedScenario.includes("Scenario 4") && (
      <>
        <b>Scenario 4: Tax Implications of Estate Planning Decisions</b>
        <br />
        Imagine you decide to gift a portion of your assets to your children during your lifetime. While this can reduce the size of your taxable estate, it’s important to consider any potential gift taxes and how it might impact your overall estate plan. Consulting with a tax adviser can help you understand the best strategies for minimising tax liabilities while achieving your estate planning goals.
        <br />
        <br />
      </>
    )}
  </>
)}


     
    </div>
    
  <div className="space-x-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
Now that we’ve explored these scenarios, do you have any questions or need further information? I’m here to help!
</div><br/><br/>

                    <button
                      onClick={() => handleButtonStage13Component("Yes, I have a question")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I have a question
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage13Component(
                          "No, let's move on"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, let's move on
                    </button>
                    

  
   
  </>
)}


                </>
              )}






              
              
              

              {/* {askingConsent && (
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonFunFact("Yes, I consent")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes, I consent
                  </button>
                  <button
                    onClick={() => handleButtonFunFact("No, I do not consent")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    No, I do not consent
                  </button>
                </div>
              )} */}

              {imageFilename && (
                <div className="relative">
                  {loading && (
                    <>
                      <br />
                      <br />
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 text-white text-xl">
                        Loading image...
                      </div>
                    </>
                  )}
                  <img
                    src={getImageUrl(imageFilename)}
                    alt="Embedded"
                    className="w-[270px] h-[210px] rounded-lg mt-2"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ display: loading ? "none" : "block" }}
                  />
                </div>
              )}
              <br />
              {privacy && (
                <>
                  <div className="space-y-4 mt-4">
                    <h2 className="font-bold text-lg">
                      Our data privacy practices ensure that your personal
                      information is handled with the utmost care and security.
                      Here are the key points:
                    </h2>
                    <ul className="list-disc list-inside space-y-2">
                      <li>
                        <strong>Data Collection:</strong> We collect only the
                        necessary information required to assist you with your
                        estate planning.
                      </li>
                      <li>
                        <strong>Data Storage:</strong> Your data is stored
                        securely using encryption and other security measures to
                        prevent unauthorized access.
                      </li>
                      <li>
                        <strong>Data Usage:</strong> Your information is used
                        solely for the purpose of creating and managing your
                        estate plan. We do not share your data with third
                        parties without your explicit consent.
                      </li>
                      <li>
                        <strong>Data Access:</strong> You have the right to
                        access, modify, or delete your information at any time.
                      </li>
                      <li>
                        <strong>Data Retention:</strong> We retain your
                        information only for as long as necessary to provide our
                        services and comply with legal obligations.
                      </li>
                      <li>
                        <strong>Privacy Policy:</strong> For detailed
                        information, you can read our full privacy policy{" "}
                        <a
                          href="https://moneyveristylms.vercel.app/privacy"
                          className=" text-[#8DC63F] underline"
                        >
                          here
                        </a>
                        .
                      </li>
                    </ul>
                    <p>
                      Would you like to proceed with consenting to data
                      collection and storage?
                    </p>
                  </div>
                  <div className="space-x-2 mt-2">
                    <button
                      onClick={() => handleButtonPrivacy("Yes, I consent")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I consent
                    </button>
                    <button
                      onClick={() =>
                        handleButtonPrivacy("No, I do not consent")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I don not consent
                    </button>
                  </div>
                </>
              )}

              {videoUrl && (
                <iframe
                  width="560"
                  height="315"
                  src={videoUrl}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              {imageFilename || videoUrl ? (
                <>
                  <div className="flex flex-col space-y-2 mt-2">
                    <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      Are you ready to explore some potential outcomes of
                      different estate planning choices 🌐?
                    </p>
                  </div>
                  <div className="space-x-2 mt-2">
                    <button
                      onClick={() =>
                        handleButtonFunFact("Yes, I'm ready to move on.")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Yes, I'm ready to move on.
                    </button>
                    <button
                      onClick={() =>
                        handleButtonFunFact(
                          "No, I have some questions about the above"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      No, I have some questions about the above
                    </button>
                  </div>
                </>
              ) : null}

              {video && (
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonClick("Yes, I want to watch")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes, I want to watch
                  </button>
                  <button
                    onClick={() =>
                      handleButtonClick("No, I don't want to watch")
                    }
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    No, I don't want to watch
                  </button>
                </div>
              )}
              
             

              {uploadDocumentANC && (
                <div className="flex space-x-2 mt-2">
                  <button
                    className="bg-[#8DC63F] text-white rounded-lg py-2 px-4"
                    style={{ borderRadius: "10px" }}
                  >
                    Upload Document at End of Chat
                  </button>
                  <button
                    className="border border-[#8DC63F] text-[#8DC63F] rounded-lg py-2 px-4 bg-transparent"
                    style={{ borderRadius: "10px" }}
                    onClick={() => handleButtonFunFact("No, let’s move on")}
                  >
                    No, let’s move on
                  </button>
                </div>
              )}

              {isMajorAsset && (
                <div className="flex flex-col space-y-2 mt-2">
                  <label className="text-white">(Select all that apply)</label>
                  {Object.entries(checkboxesAsset).map(([key, value]) => (
                    <div
                      key={key}
                      className={`${
                        value ? "bg-[#8DC63F]" : ""
                      } flex items-center ps-4 border border-[#8DC63F] rounded mt-2 text-white`}
                    >
                      <CustomCheckBox
                        id={key}
                        name="dependents"
                        className="w-4 h-4 rounded"
                        value={key.charAt(0).toUpperCase() + key.slice(1)}
                        checked={value}
                        onChange={handleCheckboxChangeAsset}
                      />
                      <label
                        htmlFor={key}
                        className="w-full py-4 ms-2 text-sm font-medium text-white"
                      >
                        {formatLabel(key)}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {funFact && (
                <>
                  <div className="flex flex-col space-y-2 mt-2">
                    <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      <span className="bg-[#2f2f2f] text-white rounded-lg py-2 inline-block font-semibold">
                        Fun Fact
                      </span>
                      <br />
                      Modern wills often include digital assets 📱 like social
                      media accounts, digital currencies 🌐💰, and online
                      business interests, reflecting our increasingly digital
                      lives.
                    </p>
                    <img
                      src="https://i.ibb.co/MDvDj7Y/your-image.jpg"
                      alt="Fun Fact Image"
                      className="w-[270px] h-[210px] rounded-lg mt-2"
                    />
                  </div>
                  <div className="flex flex-col space-y-2 mt-2">
                    <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      Pretty neat, right? Now, lets get back to securing your
                      future! 😊
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 mt-2">
                    <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      Please list the assets and people or organisations you
                      want to leave them to. If you'd rather not type it all
                      out, you can upload a document instead
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        className="bg-[#8DC63F] text-white rounded-lg py-2 px-4"
                        style={{ borderRadius: "10px" }}
                      >
                        Upload Document at End of Chat
                      </button>
                      <button
                        className="border border-[#8DC63F] text-[#8DC63F] rounded-lg py-2 px-4 bg-transparent"
                        style={{ borderRadius: "10px" }}
                      >
                        No, let’s move on
                      </button>
                    </div>
                  </div>
                </>
              )}
             
          
            </div>
          )}
          
        </div>
      );
    });
  };

  
const handleAdvisorModalToggle = () => {
    setIsAdvisorModalOpen(!isAdvisorModalOpen);
  };
  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="fixed inset-0 bg-[#212121] flex flex-col">
      <div className="fixed inset-0">
        <div className="fixed inset-0 flex items-end lg:w-1/2 xl:w-2/5 mx-auto ">
          <div className="bg-[#212121] shadow-md rounded-lg w-full h-full">
            {/* Header Section */}
            <div className="p-4 text-white rounded-t-lg items-center mt-12">
              <div className="flex justify-center -mt-12 space-x-4">
                <div className="text-lg font-semibold text-center text-4xl">
                  <p className="text-center text-2xl font-bold">
                    Welcome to our Estate Planning Chat
                  </p>
                </div>

                {/* SVG Icon */}
              </div>

              {/* Button Section */}
              <div className="flex justify-center mt-4 space-x-4">
                <button className="bg-[#009677] text-white px-4 py-2 rounded-md" onClick={handleModalToggle}>
                  FAQs
                </button>
                <button className="bg-[#009677] text-white px-4 py-2 rounded-md" onClick={handleAdvisorModalToggle}>
                  Contact a Financial Adviser
                </button>
              </div>
               {/* Modal Popup */}
      {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
  <div className="bg-[#2f2f2f] text-white rounded-lg w-[90%] max-w-3xl p-8">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold leading-tight">Estate Planning FAQs</h2> {/* H2 should be 36px according to Adobe XD */}
      <button
        className="text-white text-2xl hover:text-gray-300"
        onClick={handleModalToggle}
      >
        ✖
      </button>
    </div>
    <p className="mb-6 text-base leading-relaxed">
      Here are some frequently asked questions about estate planning in South Africa:
    </p>

    {/* Scrollable FAQ Content with custom scrollbar */}
    <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#8DC63F] scrollbar-track-[#2f2f2f]">
      <div>
        <p className="font-semibold text-lg">What is estate planning? 🧾</p> {/* Change to 24px (text-lg) */}
        <p>
          Estate planning is the process of arranging for the management
          and disposal of a person’s estate during their life and after
          death. It involves creating documents like wills, trusts, and
          powers of attorney.
        </p>
      </div>
      <div>
        <p className="font-semibold text-lg">Why is having a will important? 📄</p>
        <p>
          A will ensures your assets are distributed according to your
          wishes, names guardians for minor children, and can help
          reduce estate taxes and legal fees.
        </p>
      </div>
      <div>
        <p className="font-semibold text-lg">What happens if I die without a will? ⚖️</p>
        <p>
          If you die intestate (without a will), your estate will be
          distributed according to South Africa’s Intestate Succession
          Act, which may not align with your wishes.
        </p>
      </div>
      <div>
        <p className="font-semibold text-lg">Can I change my will after it’s been created? 💼</p>
        <p>
          Yes, you can update your will as often as you like. It’s
          recommended to review and update it after major life events,
          such as marriage, divorce, or the birth of a child.
        </p>
      </div>
      <div>
        <p className="font-semibold text-lg">What is a trust and why would I need one? 🔒</p>
        <p>
          A trust is a legal arrangement where a trustee manages assets
          on behalf of beneficiaries. Trusts can help manage assets,
          reduce estate taxes, and provide for beneficiaries according
          to your wishes.
        </p>
      </div>
      <div>
        <p className="font-semibold text-lg">When should I seek legal advice for estate planning? 🏛️</p>
        <p>
          It’s advisable to seek legal advice if you have a large or
          complex estate, anticipate family disputes, own a business, or
          need to stay updated with changing laws.
        </p>
      </div>
    </div>
  </div>
</div>

      )}

          {/* Modal Popup for Financial Advisor */}
      {/* Modal Popup for Financial Advisor */}
      {isAdvisorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#2f2f2f] text-white rounded-lg w-[90%] max-w-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-bold">Contact a Financial Adviser</h2>
              <button
                className="text-white text-2xl hover:text-gray-300"
                onClick={handleAdvisorModalToggle}
              >
                ✖
              </button>
            </div>
            <p className="mb-6 text-xl">
              Fantastic! Our financial advisers at Old Mutual are ready to assist you in filling out these templates. Please reach out to us directly to schedule a consultation and receive personalised guidance. Here's how you can get in touch:
            </p>

            {/* Contact Information */}
            <div className="flex justify-between items-start text-lg">
              {/* Phone Section */}
              <div className="flex flex-col items-start w-1/2">
                {/* Same size Phone Icon */}
                <Image
                  src="/images/phoneIcon.svg"
                  alt="Phone Icon"
                  width={22}
                  height={22}
                  className="mb-2"
                />
                <div className="text-left">
                  <p className="font-semibold">Phone</p>
                  <p>[insert phone number]</p>
                  <p>Call us to speak with an adviser.</p>
                </div>
              </div>

              {/* Email Section */}
              <div className="flex flex-col items-start w-1/2">
                {/* Same size Email Icon */}
                <Image
                  src="/images/emailIcon.svg"
                  alt="Email Icon"
                  width={40}
                  height={40}
                  className="mb-2"
                />
                <div className="text-left">
                  <p className="font-semibold">Email</p>
                  <p>[insert email address]</p>
                  <p>Send us an email with your contact details, and we'll get back to you promptly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

            <div
              id="chatbox"
              className="p-4 h-[calc(100vh-250px)] overflow-y-auto" ref={chatboxRef}
            >
              {renderMessages() || <div className="italic">typing...</div>}
            </div>
            <form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();

                if (isResponse.current == "1") {
                  e.preventDefault();
                  handleSubmit(e);
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of the farm"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of the farm, just let me know."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your vehicle"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your vehicle, just let me know."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?"
                  );
                }

















                else if (
                  messageData.current.includes(
                    "I know estate planning can be daunting"
                  )
                ) {
                  e.preventDefault();
                  setUserName(inputStr);
                  userProfile(inputStr);
                  handleAddAIResponse(
                    "Nice to meet you, "+inputStr+". When were you born?"
                  );
                }

                else if (
                  messageData.current.includes(
                    "When were you born?"
                  )
                ) {
                  e.preventDefault();
                  saveDateOfBirth(inputStr);
                  handleAddAIResponse(
                    "Let’s talk about your family life quickly. Are you married or single?"
                  );
                }

                else if (
                  messageData.current.includes(
                    "Do you have any dependents?"
                  )
                ) {
                  e.preventDefault();
                  
                  handleAddAIResponse(
                    "Got it. How many dependents over the age of 18 do you have?"
                  );
                }

                 else if (
                  messageData.current.includes(
                    "Got it. How many dependents over the age of 18 do you have?"
                  )
                ) {
                  e.preventDefault();
                  saveDependentsOver(inputStr);
                  handleAddAIResponse(
                    "And how many dependents under the age of 18 do you have?"
                  );
                }


                 else if (
                  messageData.current.includes(
                    "And how many dependents under the age of 18 do you have?"
                  )
                ) {
                  e.preventDefault();
                  saveDependentsUnder(inputStr);
                  handleAddAIResponse(
                    "Thank you for sharing, "+userName+". Is there anything else you’d like to add about your personal particulars or any questions you have at this stage?"
                  );
                }

                








                
                












                //ASSET
                else if (
                  messageData.current.includes(
                    "To help you estimate the value of your property, let’s go through a few simple steps. This will give you a rough idea of what your property could be worth."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Next, provide the location of your property (suburb, or specific neighbourhood, province)."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your valuable possessions"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your valuable possessions, just let me know."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your household"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your household"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your investment portfolio"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your investment portfolio"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your cash savings or deposits in bank accounts"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your cash savings or deposits in bank accounts"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your business interest"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your business interest"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your significant assets"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your significant assets"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your intellectual property rights"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your intellectual property rights"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your legal entities"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your legal entities"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your outstanding mortgage loan"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your outstanding mortgage loan"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your current personal loan"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your current personal loan"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your credit card debt"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your credit card debt"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your vehicle loan"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your vehicle loan"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your outstanding debt"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have a strategy in place for managing and reducing your liabilities over time?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your outstanding debt"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have a strategy in place for managing and reducing your liabilities over time?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your strategy"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any significant changes expected in your liabilities in the foreseeable future?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your strategy"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any significant changes expected in your liabilities in the foreseeable future?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your significant changes expected in your liabilities"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your significant changes expected in your liabilities"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your life insurance policies"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you covered by any health insurance policies/plans that is not a Medical Aid? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your life insurance policies"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you covered by any health insurance policies/plans that is not a Medical Aid? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your health insurance policies"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your health insurance policies"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your insurance provider"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your insurance provider"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your vehicle insurance provider"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your vehicle insurance provider"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details about any other type of insurance you have"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details about any other type of insurance you have, just let me know."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your insurance policies"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your insurance policies"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your stocks or equities"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your stocks or equities"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the types of bonds mentioned above."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready, please provide the types of bonds you are interested in."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your investments in mutual funds."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your investments in mutual funds."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your type of retirement account."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your type of retirement account."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your investment properties or real estate holdings"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value."
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your investment properties or real estate holdings"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value."
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above mentioned details of your asset classes."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of your asset classes."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?"
                  );
                } else if (
                  messageData.current.includes(
                    "Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial adviser can help you define these parameters and create a tailored investment strategy."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are there any specific changes or adjustments you're considering making to your investment portfolio in the near future?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem, I understand that there's a lot to think about. Is there something specific you'd like to discuss or any concerns you have that I can address?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse("Do you bequeath your estate to your spouse?");
                } else if (
                  messageData.current.includes(
                    "That's a significant decision. To ensure we capture your wishes accurately, could you specify if there are any conditions or limitations attached to this bequest?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
                  );
                } else if (
                  messageData.current.includes(
                    "Thank you for sharing. Could you clarify what percentage or which assets you intend to leave to your spouse?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
                  );
                } else if (
                  messageData.current.includes(
                    "Understood. Could you provide details on how you would like your estate to be distributed among the other beneficiaries?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
                  );
                } else if (
                  messageData.current.includes(
                    "I see. Could you specify the percentage or assets you'd like your spouse to receive?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
                  );
                } else if (
                  messageData.current.includes(
                    "Please provide the trustees and beneficiaries for this trust. Are the beneficiaries an income beneficiary or a capital beneficiary? For example, the asset in question is a house, the income beneficiary is entitled to receive the rental from the property. If the house is sold, then the capital beneficiary is entitled to receive the proceeds from the sale."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Does your will include a plan for setting up a trust after you pass away?"
                  );
                } else if (
                  messageData.current.includes(
                    "Who are the beneficiaries of this trust?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you have a farm or any specific property bequeathed to a trust?"
                  );
                } else if (
                  messageData.current.includes(
                    "USEFUL TIP"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you bequeath any farm implements, equipment, tools, vehicles, transport vehicles, or livestock? If so, to whom?"
                  );
                } else if (
                  messageData.current.includes(
                    "Do you bequeath any farm implements, equipment, tools, vehicles, transport vehicles, or livestock? If so, to whom?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?"
                  );
                } else if (
                  messageData.current.includes(
                    "Do you bequeath any specific assets to a company where a trust has 100% shareholding? Please provide details"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the policy details."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Thank you for providing these details. Now, we can move on to the next part of your estate planning. Ready to continue?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem, I understand that there is a lot to think about. Is there something specific you'd like to discuss or any concerns you have that I can address?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Liquidity is essential to cover estate costs without having to sell assets. Are you aware of any sources of liquidity in your estate, such as cash reserves or liquid investments?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the details of the sources of liquidity."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "If there's a shortfall, there are a few options. The executor may ask heirs to contribute cash to prevent asset sales. Are you open to this option?"
                  );
                } else if (
                  messageData.current.includes(
                    "Great! Please provide the above-mentioned details about your life insurance policy and how it will be payable to the testamentary trust."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready, please provide the details about your life insurance policy."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?"
                  );
                } else if (
                  messageData.current.includes(
                    "We will include this information in the report shared at the end of this conversation."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details about life insurance policy, just let me know."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details about life insurance policy option, just let me know."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?"
                  );
                } else if (
                  messageData.current.includes(
                    "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Factors considered by the court when assessing the claim include the duration of the marriage, the spouse's age and earning capacity, and the size of your assets. Have you thought about these factors in your estate planning?"
                  );
                } else if (
                  messageData.current.includes(
                    "Do your dependents require any income per month for maintenance?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "It's important to provide for the shortfall in household income after your death. Have you assessed the capital available to your spouse/family/dependents from which to generate an income?"
                  );
                } else if (
                  messageData.current.includes(
                    "Setting up a trust can be a valuable component of your estate plan, providing various benefits such as asset protection, wealth preservation, and efficient distribution of assets to beneficiaries. Would you like more information on how trusts can benefit your specific situation?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?"
                  );
                } else if (
                  messageData.current.includes(
                    "Exploring the possibility of setting up a trust is a proactive step in your estate planning journey. Trusts offer numerous advantages, including privacy, control over asset distribution, and tax efficiency. If you have any questions or need guidance on this process, feel free to ask."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?"
                  );
                } else if (
                  messageData.current.includes(
                    "It's understandable to have reservations or uncertainty about setting up a trust. Trusts can be customised to suit your unique needs and goals, offering flexibility and protection for your assets. If you're unsure about whether a trust is right for you, we can discuss your concerns and explore alternative options."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?"
                  );
                } else if (
                  messageData.current.includes(
                    "Having some knowledge about trusts is a great starting point. However, it's essential to have a clear understanding of how trusts work and how they can benefit your estate planning strategy. If you need more information or have specific questions, feel free to ask, and I'll be happy to assist you."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?"
                  );
                } else if (
                  messageData.current.includes(
                    "Addressing specific concerns or questions about setting up a trust is crucial for making informed decisions about your estate plan. Whether you're unsure about the process, concerned about potential implications, or have questions about trust administration, I'm here to provide guidance and support. Feel free to share your concerns, and we can discuss them further."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?"
                  );
                } else if (
                  messageData.current.includes(
                    "Donations tax is a tax imposed on the transfer of assets to a trust or natural person without receiving adequate consideration in return. It's important to understand that while transferring assets to a trust can help reduce estate duty, it may trigger donations tax liabilities. The amount of donations tax payable depends on several factors, including the value of the assets transferred, any available exemptions or deductions, and the relationship between the donor and the recipient. The donations tax threshold is R100 000 per year."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Next, let's talk about selling assets to the trust. This can be a strategic way to remove assets from your estate. However, it’s important to note that a loan account is not automaticaaly created unless there’s a difference between the sale price and the value of the asset. Have you considered selling assets to the trust in this way?"
                  );
                }
                //END OF Flow
                else if (
                  messageData.current.includes(
                    "No problem. Whenever you're ready to provide the details of any of your real estate, just let me know."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                  );
                } else if (
                  messageData.current.includes(
                    "First, please specify the type of property you have (e.g. house, apartment, land)."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Next, provide the location of your property (suburb, or specific neighbourhood, province)."
                  );
                } else if (
                  messageData.current.includes(
                    "Next, provide the location of your property (suburb, or specific neighbourhood, province)."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "What is the size of your property? For houses and apartments, include the square metres of living space. For land, provide the total area in square metres or hectares."
                  );
                } else if (
                  messageData.current.includes(
                    "What is the size of your property? For houses and apartments, include the square metres of living space. For land, provide the total area in square metres or hectares."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "How many bedrooms and bathrooms does your property have?"
                  );
                } else if (
                  messageData.current.includes(
                    "How many bedrooms and bathrooms does your property have?"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Describe the condition of your property (new, good, fair, needs renovation). Also, mention any special features (e.g., swimming pool, garden, garage)."
                  );
                } else if (
                  messageData.current.includes(
                    "Describe the condition of your property (new, good, fair, needs renovation). Also, mention any special features (e.g., swimming pool, garden, garage)."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "The estimated value of your property based on the information you provided is:"
                  );
                } else if (
                  messageData.current.includes(
                    "Please provide details of your arrangement."
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?"
                  );
                } else if (
                  messageData.current.includes(
                    "No problem, I understand that estate planning can be a lot to think about. Is there"
                  )
                ) {
                  e.preventDefault();
                  handleAddAIResponse(
                    "Great! Here are a few key considerations to keep in mind while planning your estate. I’ll ask you some questions to get a better understanding of your specific needs and goals."
                  );
                } else 
                // if (!trigger.current) {
                //   e.preventDefault();
                //   handleAddAIResponse(
                //     "Let's dive into the world of estate planning!"
                //   );
                //   trigger.current = !trigger.current;
                // } else 
                
                {
                  e.preventDefault();

                  let currentInputStr = inputStr.trim();

                  if (currentInputStr) {
                    // Modify inputStr if the user is not found
                    if (
                      userExists &&
                      messageData.current.includes(
                        "Can you please provide your user name so I can assist you with deleting"
                      )
                    ) {
                      currentInputStr = `(not found) ${currentInputStr}`;
                      setDeletionRequestData("true");
                      setUserName(inputStr);
                      saveDeletionRequest(currentInputStr, inputStr);
                    } else if (
                      !userExists &&
                      messageData.current.includes(
                        "Can you please provide your user name so I can assist you with deleting"
                      )
                    ) {
                      setDeletionRequestData("true");
                      setUserName(inputStr);
                      saveDeletionRequest(currentInputStr, inputStr);
                    }

                    if (
                      messageData.current.includes(
                        "tell me your date of birth."
                      ) ||
                      messageData.current.includes("date of birth?") ||
                      messageData.current.includes(
                        "please provide your date of birth?"
                      ) ||
                      messageData.current.includes(
                        "provide your date of birth."
                      ) ||
                      messageData.current.includes(
                        "provide your date of birth"
                      ) ||
                      messageData.current.includes("have your date of birth") ||
                      messageData.current.includes("What is your date of") ||
                      messageData.current.includes("your date of birth.") ||
                      messageData.current.includes(
                        "about your date of birth."
                      ) ||
                      messageData.current.includes("were you born") ||
                      messageData.current.includes("ask for your date of birth")
                    ) {
                      saveDateOfBirth(currentInputStr);
                    }

                    // Save profile data based on conditions
                    if (
                      messageData.current.includes(
                        "please tell me your name"
                      ) ||
                      messageData.current.includes("tell me your name") ||
                      messageData.current.includes("is your name") ||
                      messageData.current.includes("your full names") ||
                      messageData.current.includes("your full name") ||
                      messageData.current.includes("what's your name") ||
                      messageData.current.includes("What is your full name") ||
                      messageData.current.includes("What's your full name") ||
                      messageData.current.includes("ask for your name") ||
                      messageData.current.includes("provide your name") ||
                      messageData.current.includes("your full legal name")
                    ) {
                      saveUserName(currentInputStr, Date.now());
                    }

                    if (
                      messageData.current.includes("dependents over") ||
                      messageData.current.includes("Dependents over") ||
                      messageData.current.includes("over the age") ||
                      messageData.current.includes("Over the age") ||
                      (messageData.current.includes("18") &&
                        messageData.current.includes("over")) ||
                      (messageData.current.includes("18") &&
                        messageData.current.includes("Over"))
                    ) {
                      setDependentsOver(currentInputStr);
                      saveDependentsOver(currentInputStr);
                    }

                    if (
                      messageData.current.includes("dependents under") ||
                      messageData.current.includes("Dependents under") ||
                      messageData.current.includes("under the age") ||
                      messageData.current.includes("Under the age") ||
                      (messageData.current.includes("18") &&
                        messageData.current.includes("under")) ||
                      (messageData.current.includes("18") &&
                        messageData.current.includes("under"))
                    ) {
                      setDependentsUnder(currentInputStr);
                      saveDependentsUnder(currentInputStr);
                    }
                    // Add other conditions here...

                    // Update the inputStr with the final value before submission
                    setInputStr("");

                    // Now submit the form with the potentially modified inputStr
                    handleSubmit(e);

                    // Clear other related states or handle post-submission logic
                    setAllCheckboxesFalse();
                  } else {
                  handleSubmit(e); // Let the AI respond freely if no conditions are met
                }
                }
              }}
            >
              
              <div className="p-4 flex rounded bg-[#303134]">
                
                <CustomInput
                  className="send-input bg-[#303134] text-white border-none focus:outline-none w-full "
                  id="user-input"
                  value={inputStr}
                  onChange={(e: any) => {
                    setInputStr(e.target.value);
                    handleInputChange(e);
                    // if(messageData.current.includes("Can you please provide your user name so I can assist you with deleting")){
                    // checkUserExists(e.target.value);}
                  }}
                  placeholder="Type a message"
                />
                {!userExists &&
                  messageData.current.includes(
                    "Can you please provide your user name so I can assist you with deleting"
                  ) && (
                    <div className="text-red-500 text-sm absolute -mt-3 ml-3">
                      No user found
                    </div>
                  )}
               <button
  id="send-button"
  type="submit"
  className=" text-white px-4 rounded-md ml-2 flex items-center justify-center"
>
  <img src="/images/sendButton.png" alt="Send Icon" className="h-[60px] w-[70px]" />
</button>

              </div>
            </form>
            {/* {loading && (
              <p className="text-white">
                Loading... Retrying {retryCount}/{MAX_RETRIES}
              </p>
            )} */}
          </div>
        </div>
      </div>

      {/* <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 bg-[#84c342] p-4 text-white rounded-full shadow-md hover:bg-blue-500 transition duration-300 block md:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button> */}
    </div>
  );
}
