"use client";
import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import CustomInput from "@/app/components/CustomInput";
import CustomCheckBox from "@/app/components/CustomCheckBox"; // Import the CustomCheckBox component
import EmbeddedVideo from "@/app/components/EmbeddedVideo";
import Calendar from "@/app/components/Calendar";

import Navbar from "@/app/components/Navbar";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

interface Checkboxes {
  spouse: boolean;
  children: boolean;
  stepchildren: boolean;
  grandchildren: boolean;
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

  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

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

  const handleButtonComponent = (message: any) => {
    let response = "";

    if (message == "Wills") {
      response =
        "A will is a legal document that outlines how you want your assets to be distributed after your death. It also allows you to appoint guardians for minor children. Is there anything else you’d like to know about estate planning, or any questions you have at this stage?";
    }
    if (message == "Trusts") {
      response =
        "A trust is a legal arrangement where you transfer assets to a trustee to manage on behalf of your beneficiaries. Trusts can help manage assets during your lifetime and provide for beneficiaries after your death. Is there anything else you’d like to know about estate planning, or any questions you have at this stage?";
    }
    if (message == "Power of Attorney") {
      response =
        "A Power of Attorney allows you to appoint someone to make financial or medical decisions on your behalf if you become unable to do so. Is there anything else you’d like to know about estate planning, or any questions you have at this stage?";
    }
    if (message == "Living Will") {
      response =
        "A Living Will specifies your wishes regarding medical treatment if you are unable to communicate them yourself. Is there anything else you’d like to know about estate planning, or any questions you have at this stage?";
    }
    if (message == "Beneficiary Designations") {
      response =
        "These are used to specify who will receive assets like life insurance or retirement accounts directly, bypassing the will. Is there anything else you’d like to know about estate planning, or any questions you have at this stage?";
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
  
  const handleButtonQuestion = (message: any) => {
     let response = "";
    if(message == "Is there anything else you'd like to ask?"){
      response =
        "What is your question?";
        isResponse.current = "1";
    }

    if (message == "Continue") {
      response =
        nextResponse;
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
  }

  const handleButtonStage12 = (message: any) => {
    let response = "";
    if(message == "I have a question."){
      response =
        "What is your question?";

      setNextResponse("It’s important to understand the legal requirements and considerations specific to South Africa:")
      isResponse.current = "1";
    }

    if (message == "No, Let's move on") {
      response =
        "It’s important to understand the legal requirements and considerations specific to South Africa:";
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

     if(message == "I have a question."){
      response =
        "What is your question?";

      setNextResponse("Would you like to see how different scenarios could impact your estate? Here are a few examples we can simulate:")
      isResponse.current = "1";
    }

    if (message == "Yes, Im ready to explore some potential outcomes.") {
      response =
        "Would you like to see how different scenarios could impact your estate? Here are a few examples we can simulate:";
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
        "Tax Implications of Estate Planning Decisions: Imagine you decide to gift a portion of your assets to your children during your lifetime. While this can reduce the size of your taxable estate, it’s important to consider any potential gift taxes and how it might impact your overall estate plan. Consulting with a tax advisor can help you understand the best strategies for minimising tax liabilities while achieving your estate planning goals. Would you like to see another scenario or move on to the next step?";
    }
    if (message == "All Scenario") {
      response = "Here are the all scenario";
    }

    if (message == "No, Let's move on") {
      response =
        "Now that we’ve explored these scenarios, would you like to move on to some frequently asked questions about estate planning in South Africa? This will help you understand more about the process and address any additional concerns you might have. Here are some frequently asked questions about estate planning in South Africa:";
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
        "Here are some templates to help you get started with your estate planning documents:";
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
        "Now that we’ve covered your personal details, let’s talk about your objectives for estate planning. Understanding your goals will help us create a plan that fits your needs perfectly. Ready to dive in?";
    }
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
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Establish a Trust") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Set Up Insurance Policies") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Legal Agreement") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Buy-Sell Agreement") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Contingent Liability Insurance") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Diversified Investment Strategy") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Business Succession Planning") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Debt Repayment Plan") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Asset Protection Planning") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Separation of Personal & Business Finances") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
    }
    if (message == "Continue") {
      response =
        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?";
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

    if (message == "I’m Undecided") {
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
      response = "What's your question?";
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

    if (message == "Upload Document") {
      response = "Estate Document Uploaded";
    }
    if (message == "Specify") {
      response = "Great! Please provide the above mentioned details.";
    }
    if (message == "Maybe Later") {
      response =
        "No problem. Whenever you're ready to provide the details, just let me know.";
    }
    if (message == "I’m unsure of the details") {
      response =
        "To help you estimate the value of your property, let’s go through a few simple steps. This will give you a rough idea of what your property could be worth. First, please specify the type of property you have (e.g. house, apartment, land).";
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
        "Thanks for sharing your thoughts, [Client's Name]. It’s important to have a clear understanding of your objectives so we can tailor your estate plan to meet your needs. Is there anything else you’d like to add before we move on?";
    }
    if (message == "No") {
      response =
        "Thanks for sharing your thoughts, [Client's Name]. It’s important to have a clear understanding of your objectives so we can tailor your estate plan to meet your needs. Is there anything else you’d like to add before we move on?";
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
    if (message == "Upload Document") {
      response =
        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of the farm";
    }
    if (message == "Maybe Later") {
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
        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?";
    }
    if (message == "Upload Document") {
      response =
        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your vehicle";
    }
    if (message == "Maybe Later") {
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
        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your shortterm insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan.?";
    }
    if (message == "Upload Document") {
      response =
        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your shortterm insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan.?";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your valuable possessions";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment.";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your household";
    }
    if (message == "Maybe Later") {
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
        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the account details and approximate balances.";
    }
    if (message == "Upload Document") {
      response =
        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the account details and approximate balances.";
    }
    
    if (message == "Specify") {
      response =
      "Great! Please provide the above mentioned details of your investment portfolio";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value.";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your cash savings or deposits in bank accounts";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values.";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your business interest";
    }
    if (message == "Maybe Later") {
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
        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset";
    }
    if (message == "Upload Document") {
      response =
        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your significant assets";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within.";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your intellectual property rights";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged.";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your legal entities";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan.";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your outstanding mortgage loan";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card.";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your current personal loan";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed.";
    }
    if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your credit card debt";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount.";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your vehicle loan";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Do you have a strategy in place for managing and reducing your liabilities over time?";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your outstanding debt";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Are there any significant changes expected in your liabilities in the foreseeable future?";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your strategy";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features.";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your significant changes expected in your liabilities";
    }
    if (message == "Maybe Later") {
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
        "Are you covered by any health insurance policies? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits.";
    }
    if (message == "Upload Document") {
      response =
        "Are you covered by any health insurance policies? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits.";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your life insurance policies";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options.";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your health insurance policies";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles.";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your insurance provider";
    }
    if (message == "Maybe Later") {
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
    if (message == "Upload Document") {
      response =
        "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?";
    }
     if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your vehicle insurance provider";
    }
    if (message == "Maybe Later") {
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
    if (message == "Unsure") {
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
        "Key person insurance provides financial support to your business if a key employee, whose expertise and skills are critical to the company's success, passes away or becomes disabled. It can help cover the cost of finding and training a replacement, as well as mitigate potential financial losses. If you think this could benefit your business, consider discussing it further with our financial advisor to ensure your business is protected.";
    }
    if (message == "Unsure") {
      response =
        "Key person insurance provides financial support to your business if a key employee, whose expertise and skills are critical to the company's success, passes away or becomes disabled. It can help cover the cost of finding and training a replacement, as well as mitigate potential financial losses. If you think this could benefit your business, consider discussing it further with our financial advisor to ensure your business is protected.";
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
    if (message == "Upload Document") {
      response =
        "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?";
    }
      if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details about any other type of insurance you have";
    }
    if (message == "Maybe Later") {
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

    if (message == "Upload Document") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }
      if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your insurance policies";
    }
    if (message == "Maybe Later") {
      response =
        "No problem. Whenever you're ready to provide the details of your insurance policies";
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
         setNextResponse("Understanding your investment holdings helps us assess your overall financial position and develop strategies to maximise the value of your estate. Please provide as much detail as possible for each of the following questions.")
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
        "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date";
    }

    if (message == "Upload Document") {
      response =
        "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date";
    }
      if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your stocks or equities";
    }
    if (message == "Maybe Later") {
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

    if (message == "Upload Document") {
      response =
        "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund.";
    }
      if (message == "Specify") {
      response =
        "Great! Please provide the types of bonds mentioned above.";
    }
    if (message == "Maybe Later") {
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

    if (message == "Upload Document") {
      response =
        "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account.";
    }
      if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your investments in mutual funds.";
    }
    if (message == "Maybe Later") {
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

    if (message == "Upload Document") {
      response =
        "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties.";
    }
      if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your type of retirement account.";
    }
    if (message == "Maybe Later") {
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

    if (message == "Upload Document") {
      response =
        "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value.";
    }
      if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your investment properties or real estate holdings";
    }
    if (message == "Maybe Later") {
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

    if (message == "Upload Document") {
      response =
        "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?";
    }
      if (message == "Specify") {
      response =
        "Great! Please provide the above mentioned details of your asset classes.";
    }
    if (message == "Maybe Later") {
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
        "Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial advisor can help you define these parameters and create a tailored investment strategy.";
    }
    if (message == "Unsure") {
      response =
        "Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial advisor can help you define these parameters and create a tailored investment strategy.";
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
      response =
        "Great! Next, we’ll discuss estate duty. Shall we continue?";
    }
    if (message == "Yes") {
      response =
        "Great! Next, we’ll discuss estate duty. Shall we continue?";
    }
      if (message == "No") {
      response =
        "It's always a good idea to periodically review your investment portfolio to ensure it aligns with your financial goals and risk tolerance. If you're not currently considering any changes, it might be helpful to schedule a regular review with a financial advisor to stay informed about potential opportunities or necessary adjustments based on market conditions and your evolving financial situation.";
    }
    if (message == "Unsure") {
      response =
        "It's always a good idea to periodically review your investment portfolio to ensure it aligns with your financial goals and risk tolerance. If you're not currently considering any changes, it might be helpful to schedule a regular review with a financial advisor to stay informed about potential opportunities or necessary adjustments based on market conditions and your evolving financial situation.";
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
      response =
        "Do you have a current will in place?";
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
      response =
        "Do you bequeath your estate to your spouse?";
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
      response =
        "Who are the beneficiaries of this trust?";
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
      response =
        "DID YOU KNOW For estate duty: When farms are bequeathed (whether to trust or natural person) and the farm was used for bona fide farming purposes, the market value less 30% is included as the value of the farm for estate duty purposes. Please provide details of the trust.";
    }
    if (message == "No") {
      response =
        "Do you bequeath any specific assets to a company where a trust has 100% shareholding? Please provide details.";
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
        "DID YOU KNOW If your spouse were to pass away immediately after you, there are specific estate duty implications and/or arrangements you would need to consider? All the more reason to get in touch with our Financial Advisors. This will be noted and added to the report supplied to you at the end of this chat.";
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
     if (message == "Upload Document") {
      response =
        "Great! Next, we’ll look at the executor’s fees. Shall we continue?";
    }
    if (message == "Maybe Later") {
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
          setNextResponse("Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated.")
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
      response =
        "Great! Please provide the policy details.";
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
          setNextResponse("Now, let's talk about the liquidity position of your estate. This helps us understand if there are enough liquid assets available to cover estate costs without having to sell off assets. Ready to proceed?")
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
          "Hello 😊 and welcome to Moneyversity's Estate Planning Consultant 🤖. I'm here to help you navigate the estate planning process with ease. Together, we'll ensure your assets and wishes are well- documented and protected. Ready to get started on this important journey?",
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
      const response = await axios.post("/api/chatAnalyze", {
        messages: [
          {
            content:
              "Please analyze the provided data and extract the user name. Respond solely with the user name in the format '{name}'. If the data does not contain a name, respond only with '404'." +
              messageAI,
            role: "user",
            createdAt: new Date(),
          },
        ],
      });

      let newMessages: Message[] = [];
      if (typeof response.data === "string") {
        const responseLines = response.data
          .split("\n")
          .filter((line) => line.trim() !== "");
        newMessages = responseLines.map((content) => ({
          id: uuidv4(),
          content,
          role: "assistant", // Ensure role is set if not in the response
        }));
      } else if (Array.isArray(response.data.messages)) {
        newMessages = response.data.messages.map((msg: any) => ({
          ...msg,
          id: uuidv4(),
        }));
      } else {
        throw new Error("Invalid response format");
      }

      const userName = newMessages[0].content;

      // Check if the response contains '404'
      if (userName.includes("404")) {
        return; // Exit the function if the response contains '404'
      }
      const cleanedUserName = userName.replace(/<\|[^|]*\|>/g, "");
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
        "Let's dive into the world of estate planning!"
      );
      const legalRequirement = message.content.includes(
        "It’s important to understand the legal requirements and considerations specific to South Africa"
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
              <div>{`Moneyversity: ${filteredContent.replace(
                /<\|endoftext\|>/g,
                ""
              )}`}</div>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleButtonClick("Absolutely")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Absolutely
                </button>
                <button
                  onClick={() => handleButtonClick("Tell me more")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Tell me more
                </button>
                <button
                  onClick={() => handleButtonClick("Not now")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Not now
                </button>
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
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Yes, I have a question
                  </button>
                  <button
                    onClick={() => handleButtonClick("No, Let's move on")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    I have a question.
                  </button>
                  <button
                    onClick={() => handleButtonFunFact("Yes, I'm ready.")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Yes, I'm ready.
                  </button>
                </div>
              )}
              {questionResponseStage12 && (
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonStage12("I have a question.")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    I have a question.
                  </button>
                  <button
                    onClick={() => handleButtonStage12("No, Let's move on")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    No, Let's move on
                  </button>
                </div>
              )}
              {message.content.includes(
                "Would you like to see another scenario or move on to the next step?"
              ) && (
                <div className="space-x-2 mt-4">
                  <button
                    onClick={() => handleButtonStage13Component("Scenario 1")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Scenario 1
                  </button>
                  <button
                    onClick={() => handleButtonStage13Component("Scenario 2")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Scenario 2
                  </button>
                  <button
                    onClick={() => handleButtonStage13Component("Scenario 3")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Scenario 3
                  </button>
                  <button
                    onClick={() => handleButtonStage13Component("Scenario 4")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Scenario 4
                  </button>
                  <button
                    onClick={() => handleButtonStage13Component("All Scenario")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    All Scenarios
                  </button>
                  <button
                    onClick={() =>
                      handleButtonStage13Component("No, Let's move on")
                    }
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    No, Let's move on
                  </button>
                </div>
              )}

              {/* {message.content.includes("Do you have any other questions or need further information? I’m here to help!") && (
                <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage14("Yes, I have a question")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes, I have a question
                    </button>
                    <button
                      onClick={() => handleButtonStage14("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      "No, let’s move on
                    </button>
                    </div>
                )} */}
              {message.content.includes("Templates are downloaded") && (
                <>
                  <div className="space-x-2 mt-2">
                    Would you like any assistance filling out any of these
                    templates?
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage15("No, let's move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No, let's move on
                    </button>
                    <button
                      onClick={() => handleButtonStage14Contact("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage18Component("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage18Component("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage18Component("Maybe")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                  <div className="space-x-2 mt-2">
                    📞 Phone: Call us at [insert phone number] to speak with an
                    advisor.
                    <br />
                    <br />
                    📧 Email: Send us an email at [insert email address] with
                    your contact details, and we’ll get back to you promptly.
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage15("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes("Here are the all scenario") && (
                <>
                  <div className="space-x-2 mt-2">
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
                    estate plan. Consulting with a tax advisor can help you
                    understand the best strategies for minimising tax
                    liabilities while achieving your estate planning goals. 💰📊
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonFunFact("Scenario 1")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Scenario 1
                    </button>
                    <button
                      onClick={() => handleButtonFunFact("Scenario 2")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Scenario 2
                    </button>
                    <button
                      onClick={() => handleButtonFunFact("Scenario 3")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Scenario 3
                    </button>
                    <button
                      onClick={() => handleButtonFunFact("Scenario 4")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Scenario 4
                    </button>
                    <button
                      onClick={() => handleButtonFunFact("All Scenario")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      All Scenarios
                    </button>
                    <button
                      onClick={() => handleButtonFunFact("No, Let's move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No, Let's move on
                    </button>
                  </div>
                </>
              )}

              {scenarioSimulation && (
                <>
                  <div className="space-x-2 mt-2">
                    Scenario 1: How will setting up a trust affect the
                    management and distribution of your assets?
                    <br />
                    <br />
                    Scenario 2: What happens if you pass away without a will
                    (intestate)?
                    <br />
                    <br />
                    Scenario 3: How will appointing a power of attorney impact
                    your estate during your lifetime?
                    <br />
                    <br />
                    Scenario 4: What are the potential tax implications of your
                    estate planning decisions?
                    <br />
                    <br />
                    Choose a scenario you’d like to explore, and I’ll show you
                    the potential outcomes.
                  </div>

                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage13Component("Scenario 1")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Scenario 1
                    </button>
                    <button
                      onClick={() => handleButtonStage13Component("Scenario 2")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Scenario 2
                    </button>
                    <button
                      onClick={() => handleButtonStage13Component("Scenario 3")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Scenario 3
                    </button>
                    <button
                      onClick={() => handleButtonStage13Component("Scenario 4")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Scenario 4
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage13Component("All Scenario")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      All Scenarios
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage13Component("No, Let's move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No, Let's move on
                    </button>
                  </div>
                </>
              )}

              {templateButton && (
                <>
                  <div className="space-x-2 mt-2">
                    Based on your profile, here’s a suggested plan:
                    <br />
                    <br />
                    📝 **Wills**: Given your marital status and number of
                    dependents, it’s essential to have a will to ensure your
                    assets are distributed according to your wishes. 📜👨‍👩‍👧‍👦
                    <br />
                    <br />
                    🏦 **Trusts**: If you have significant assets or minor
                    children, setting up a trust might be beneficial. This can
                    help manage and protect assets for your beneficiaries. 🔐💼
                    <br />
                    <br />
                    🤝 **Power of Attorney**: Appointing a trusted person to
                    make decisions on your behalf if you’re unable to is
                    crucial. 🗝️📋
                    <br />
                    <br />
                    💉 **Living Will**: Consider a living will to outline your
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
                  <div className="space-x-2 mt-2">
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage14Component("No, let's move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No, let's move on
                    </button>
                    <button
                      onClick={() => handleButtonStage14Component("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Here are some templates to help you get started with your estate planning documents:"
              ) && (
                <>
                  <div className="space-x-2 mt-2">
                    📝 Will: A basic template for drafting your will.
                    <br />
                    <br />
                    🏦 Trusts: A template to set up a simple trust.
                    <br />
                    <br />
                    🤝 Power of Attorney: A template for appointing a power of
                    attorney.
                    <br />
                    <br />
                    💉 Living Will: A template to specify your medical treatment
                    preferences.
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage14Template("Download Will Template")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Download Will Template
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Template("Download Trust Template")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Download Trust Template
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Template(
                          "Download Power of Attorney Template"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Download Power of Attorney Template
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Template(
                          "Download Living Will Template"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Download Living Will Template
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Template("Download All Templates")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Download All Templates
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Now that we’ve covered your personal details, let’s talk about your objectives for estate planning. Understanding your goals will help us create a plan that fits your needs perfectly. Ready to dive in?"
              ) && (
                <>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage15Component("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage15No("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                  <div className="space-x-2 mt-2">
                    Great! Here are a few key considerations to keep in mind
                    while planning your estate. I’ll ask you some questions to
                    get a better understanding of your specific needs and goals.
                    <br />
                    <br />
                    Firstly, how important is it for your estate plan to be
                    flexible and adapt to changes in your personal, financial,
                    and legislative environment?
                    <br />
                    <br />
                    For example, would you want your plan to easily adjust if
                    there are changes in laws or your financial situation?
                  </div>
                  <>
                    <div className="space-x-2 mt-4">
                      <button
                        onClick={() => handleButtonStage15Financial("Yes")}
                        className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => handleButtonStage15Financial("No")}
                        className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                      >
                        No
                      </button>
                      <button
                        onClick={() => handleButtonStage15TellMe("No")}
                        className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage15Financial("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage16Business("Not important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Not important
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage16Business("Average Importance")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Average Importance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage16Business("Very Important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Very Important
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Please provide details of your arrangement."
              ) && (
                <>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies("No, let's move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies("Establish a Trust")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Establish a Trust
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies(
                          "Set Up Insurance Policies"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Set Up Insurance Policies
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies("Legal Agreement")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Legal Agreement
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies("Buy-Sell Agreement")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Buy-Sell Agreement
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies(
                          "Contingent Liability Insurance"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Contingent Liability Insurance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies(
                          "Diversified Investment Strategy"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Diversified Investment Strategy
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies(
                          "Business Succession Planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Business Succession Planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies("Debt Repayment Plan")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Debt Repayment Plan
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies(
                          "Asset Protection Planning"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Asset Protection Planning
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Strategies(
                          "Separation of Personal & Business Finances"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Separation of Personal & Business Finances
                    </button>
                    <button
                      onClick={() => handleButtonStage17Other("Other")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Other
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage17Undecided("I’m Undecided")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      I’m Undecided
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "That's okay! It can be overwhelming to decide on the best measures without more information. Here’s a brief overview to help you:"
              ) && (
                <>
                  <div className="space-x-2 mt-2">
                    🏦 Establish a Trust: Protects your assets and ensures they
                    are distributed according to your wishes.
                    <br />
                    🛡️ Set Up Insurance Policies: Provides financial security in
                    case of unforeseen events.
                    <br />
                    📜 Legal Agreements: Formalizes arrangements to manage and
                    protect your business interests.
                    <br />
                    🤝 Buy-Sell Agreement: Ensures smooth transition and fair
                    value if a business partner exits.
                    <br />
                    🏢 Contingent Liability Insurance: Covers potential business
                    liabilities.
                    <br />
                    📊 Diversified Investment Strategy: Spreads risk across
                    different investments.
                    <br />
                    🔄 Regular Financial Reviews: Keeps your financial plan up
                    to date with your current situation.
                    <br />
                    💳 Debt Repayment Plan: Manages and prioritizes repayment of
                    debts.
                    <br />
                    🛡️ Asset Protection Planning: Safeguards your personal and
                    business assets from risks.
                    <br />
                    🔄 Separation of Personal & Business Finances: Keeps your
                    personal and business finances distinct to avoid
                    complications.
                    <br />
                    <br />
                    Would you like to discuss any of these options further, or
                    do you need more details on any specific measure?
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage17Strategies("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Flexibility in an estate plan means it can be adjusted without major legal hurdles if your circumstances change. For instance,"
              ) && (
                <>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage15Financial("Yes")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage15Financial("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?"
              ) && (
                <>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage18Administration("Not important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Not important
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage18Administration("Average Importance")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Average Importance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage18Administration("Very Important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Very Important
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Great! To help you stay organised throughout the estate planning process, here are some checklists for different stages:"
              ) && (
                <>
                  <div className="space-x-2 mt-2">
                    Initial Stage:
                    <br />
                    📋 Gather personal information (name, age, marital status,
                    dependents)
                    <br />
                    💼 List all assets and liabilities
                    <br />
                    👥 Identify beneficiaries
                    <br />
                    📝 Consider your wishes for asset distribution and
                    guardianship
                    <br />
                    <br />
                    Creating Documents:
                    <br />
                    ✍️ Draft your will
                    <br />
                    🏦 Set up any necessary trusts
                    <br />
                    🤝 Prepare power of attorney documents
                    <br />
                    💉 Create a living will
                    <br />
                    <br />
                    Review and Update:
                    <br />
                    🔄 Regularly review your documents (annually or after major
                    life events)
                    <br />
                    📑 Update beneficiaries as needed
                    <br />
                    🖊️ Ensure all documents are properly signed and witnessed
                    <br />
                    <br />
                    Final Steps:
                    <br />
                    🔒 Store your documents in a safe place
                    <br />
                    👨‍👩‍👧‍👦 Inform your executor and loved ones where to find your
                    documents
                    <br />
                    📂 Keep a copy with a trusted person or legal advisor
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage14Checklist("Download Checklist")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Download Checklist
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Checklist("Let’s move on")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Let’s move on
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Describe the condition of your property (new, good, fair, needs renovation). Also, mention any special features (e.g., swimming pool, garden, garage)"
              ) && (
                <>
                  <div className="space-x-2 mt-2">
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage21Calculator("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "It's understandable to be uncertain about this. Protecting assets from potential insolvency can be crucial for maintaining financial stability. Here are some points to consider"
              ) && (
                <>
                  <div className="space-x-2 mt-2">
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage18Component("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

              {message.content.includes("Is there anything else you'd like to ask?") && (
                <>
                <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonQuestion("Is there anything else you'd like to ask?")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Is there anything else you?
                    </button>
                    <button
                      onClick={() =>
                        handleButtonQuestion("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage19Capital("Not important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Not important
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage19Capital("Average Importance")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Average Importance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage19Capital("Very Important")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Very Important
                    </button>
                  </div>
                </>
              )}

              {message.content.includes(
                "Let’s dive into the details of what you own to ensure we have a comprehensive understanding of your estate. Your assets play a crucial role in your estate plan."
              ) && (
                <>
                  <div className="space-x-2 mt-2">
                    🏡 Do you own any real estate properties, such as houses,
                    apartments, or land?
                    <br />
                    If so, could you provide details about each property,
                    including:
                    <br />
                    📍 Location
                    <br />
                    💰 Estimated current market value
                    <br />
                    🏦 Outstanding mortgage amount (if any)
                    <br />
                    🔧 Any significant improvements made
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage21Asset("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage21Asset("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage21Asset("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage21Asset("I’m unsure of the details")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      I’m unsure of the details
                    </button>
                  </div>
                </>
              )}



 {message.content.includes("Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage22Farm("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage22Farm("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage22Farm("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

              {message.content.includes("How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage22Vehicle("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage22Vehicle("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage22Farm("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

 {message.content.includes("Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage23Jewelry("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage23Jewelry("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage23Jewelry("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}



{message.content.includes("What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your shortterm insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage24Household("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage24Household("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage24Household("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}



            {message.content.includes("Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage25Portfolio("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage25Portfolio("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage25Portfolio("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}
 {message.content.includes("Do you have any cash savings or deposits in bank accounts? If yes, please provide the account details and approximate balances.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage25Cash("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage25Cash("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage25Cash("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}
              

              {message.content.includes("Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage26BusinessInterest("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage26BusinessInterest("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage26BusinessInterest("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}


              {message.content.includes("Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage27SignificantAssets("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage27SignificantAssets("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage27SignificantAssets("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}


{message.content.includes("Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage28Intellectual("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage28Intellectual("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage28Intellectual("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage29LegalEntities("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage29LegalEntities("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage29LegalEntities("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage30Mortgage("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage30Mortgage("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage30Mortgage("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}


{message.content.includes("Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage31PersonalLoan("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage31PersonalLoan("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage31PersonalLoan("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}


{message.content.includes("Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage32CreditCardDebt("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage32CreditCardDebt("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage32CreditCardDebt("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage33VehicleLoan("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage33VehicleLoan("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage33VehicleLoan("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage34OutstandingDebt("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage34OutstandingDebt("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage34OutstandingDebt("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}


{message.content.includes("Do you have a strategy in place for managing and reducing your liabilities over time?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage35Strategy("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage35Strategy("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage35Strategy("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are there any significant changes expected in your liabilities in the foreseeable future?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage36SignificantChanges("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage36SignificantChanges("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage36SignificantChanges("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage37LifeInsurance("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage37LifeInsurance("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage37LifeInsurance("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are you covered by any health insurance policies? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage38HealthInsurance("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage38HealthInsurance("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage38HealthInsurance("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage39HoldingsInsured("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage39HoldingsInsured("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage39HoldingsInsured("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage40VehicleInsured("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage40VehicleInsured("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage40VehicleInsured("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage41Disability("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage41Disability("No")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage41Disability("Not Sure")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Not Sure
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Disability insurance can provide financial security if you’re unable to work due to illness or injury. It ensures that you have a source of income to cover living expenses and maintain your standard of living. Would you like more information or assistance in obtaining disability insurance and understanding its benefits?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilitySecurity("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilitySecurity("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes("Great, I will have one of our financial advisors get in touch regarding obtaining disability insurance") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilitySecurity("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                    
                  </div>
                </>
              )}

{message.content.includes("Disability insurance can be structured as a single capital lump sum or monthly income replacer. Which type of disability insurance do you currently have, or are you considering?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilityInsurance("Single Capital Lump Sum")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Single Capital Lump Sum
                    </button>
                    <button
                      onClick={() => handleButtonStage41DisabilityInsurance("Monthly Income Replacer")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Monthly Income Replacer
                    </button>
                  </div>
                </>
              )}

{message.content.includes("It's important to note that the coverage you can take may be limited. Are you aware of any limitations on your disability insurance coverage?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilityCoverage("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage41DisabilityCoverage("Monthly Income Replacer")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No, I'm not aware
                    </button>
                    <button
                      onClick={() => handleButtonStage41DisabilityCoverage("I'm not sure.")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      I'm not sure.
                    </button>
                  </div>
                </>
              )}

{message.content.includes("I recommend reviewing your current disability insurance policy to understand any limitations it may have. Checking details like maximum benefit amounts, coverage duration, and specific conditions that are excluded will help ensure you have adequate protection. Please get back to me once you've reviewed your policy.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage41DisabilityCoverage("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                   
                  </div>
                </>
              )}
              
{message.content.includes("Do you have contingent liability insurance to cover unexpected liabilities that may arise?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage41ContingentInsurance("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleButtonStage41ContingentInsurance("Monthly Income Replacer")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                    <button
                      onClick={() => handleButtonStage41ContingentInsurance("I'm not sure.")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Unsure.
                    </button>
                  </div>
                </>
              )}

{message.content.includes("I recommend considering contingent liability insurance as it can protect you against unexpected financial obligations. It’s especially useful if you've provided personal guarantees or securities for business obligations. Please think about whether this might be a valuable addition to your insurance portfolio and let me know if you have any questions or need assistance with this.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage41ContingentInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}


{message.content.includes("If you own a business, have you considered buy and sell insurance to protect your business partners and family?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage42BuyAndSell("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage42BuyAndSell("No, I don't have a business")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No, I don't have a business
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage42BuyAndSell("No, I haven't consider it")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                       No, I haven't consider it
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage42BuyAndSell("Unsure")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Buy and sell insurance is designed to ensure that, in the event of your death or disability, your business can continue to operate smoothly. It provides funds to your business partners to buy out your share, protecting both your family’s financial interests and the business’s continuity. It might be worth exploring this option to safeguard your business and your loved ones. Please review your current situation and get back to me if you have any questions or need further assistance.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage42BuyAndSell("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("For business owners, key person insurance can help the business survive the loss of a crucial employee. Do you have this in place?") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage43BusinessOwner("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage43BusinessOwner("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage43BusinessOwner("Unsure")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Key person insurance provides financial support to your business if a key employee, whose expertise and skills are critical to the company's success, passes away or becomes disabled. It can help cover the cost of finding and training a replacement, as well as mitigate potential financial losses. If you think this could benefit your business, consider discussing it further with our financial advisor to ensure your business is protected.") && (
                <>
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage43BusinessOwner("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Do you have any other types of insurance not already covered? Please provide details about the type of coverage and the insurance provider.") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage44InsuranceConvered("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage44InsuranceConvered("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage44InsuranceConvered("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage45ReviewedInsurance("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                    <button
                      onClick={() => handleButtonStage45ReviewedInsurance("Specify")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                    <button
                      onClick={() => handleButtonStage45ReviewedInsurance("Maybe Later")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

              {message.content.includes("No problem. Whenever you're ready to provide the details of your insurance policies") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage45ReviewedInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details about any other type of insurance you have, just let me know.") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage44InsuranceConvered("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your vehicle insurance provider") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage40VehicleInsured("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your insurance provider") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage39HoldingsInsured("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your health insurance policies") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage38HealthInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your life insurance policies") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage37LifeInsurance("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your significant changes expected in your liabilities") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage36SignificantChanges("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your strategy") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage35Strategy("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your outstanding debt") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage34OutstandingDebt("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your vehicle loan") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage33VehicleLoan("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your credit card debt") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage32CreditCardDebt("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your current personal loan") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage31PersonalLoan("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your outstanding mortgage loan") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage30Mortgage("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your legal entities") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage29LegalEntities("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your intellectual property rights") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage28Intellectual("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your significant assets") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage27SignificantAssets("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your business interest") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage26BusinessInterest("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your cash savings or deposits in bank accounts") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage25Cash("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your investment portfolio") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage25Portfolio("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your household") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage24Household("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your valuable possessions, just let me know.") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage23Jewelry("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of your vehicle, just let me know.") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage22Vehicle("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("No problem. Whenever you're ready to provide the details of the farm, just let me know.") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage22Farm("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              {message.content.includes("Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?") && (
                <>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage46Continue("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage46Continue("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

            {message.content.includes("Understanding your investment holdings helps us assess your overall financial position and develop strategies to maximise the value of your estate. Please provide as much detail as possible for each of the following questions") && (
                <>  
                <div className="space-x-2 mt-2">
                    Do you currently hold any stocks or equities in your
                    investment portfolio? If yes, please specify the name of the stocks, 
                    the number of shares held, and the current market value of each stock 🔐💼
                    <br />
                    </div>
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage47InvestmentHolding("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage47InvestmentHolding("Specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage47InvestmentHolding("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

              {message.content.includes("No problem. Whenever you're ready to provide the details of your stocks or equities") && (
                <>  
                
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage47InvestmentHolding("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}


{message.content.includes("Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date.") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage48FixedIncome("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage48FixedIncome("Specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage48FixedIncome("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("No problem. Whenever you're ready, please provide the types of bonds you are interested in.") && (
                <>  
                
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage48FixedIncome("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund.") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage48MutualFunds("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage48MutualFunds("Specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage48MutualFunds("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("No problem. Whenever you're ready to provide the details of your investments in mutual funds.") && (
                <>  
                
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage48MutualFunds("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account.") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage49RetirementFunds("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage49RetirementFunds("Specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage49RetirementFunds("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("No problem. Whenever you're ready to provide the details of your type of retirement account.") && (
                <>  
                
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage49RetirementFunds("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties.") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage50EstateHoldings("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage50EstateHoldings("Specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage50EstateHoldings("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("No problem. Whenever you're ready to provide the details of your investment properties or real estate holdings") && (
                <>  
                
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage50EstateHoldings("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value.") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage51AssetClasses("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Upload Document
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage51AssetClasses("Specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Specify
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage51AssetClasses("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("No problem. Whenever you're ready to provide the details of your asset classes.") && (
                <>  
                
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage51AssetClasses("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage52InvestmentGoals("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage52InvestmentGoals("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage52InvestmentGoals("Unsure")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial advisor can help you define these parameters and create a tailored investment strategy.") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage52InvestmentGoals("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Are there any specific changes or adjustments you're considering making to your investment portfolio in the near future?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage53SpecificChanges("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage53SpecificChanges("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage53SpecificChanges("Unsure")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Unsure
                    </button>
                  </div>
                </>
              )}

              {message.content.includes("It's always a good idea to periodically review your investment portfolio to ensure it aligns with your financial goals and risk tolerance. If you're not currently considering any changes, it might be helpful to schedule a regular review with a financial advisor to stay informed about potential opportunities or necessary adjustments based on market conditions and your evolving financial situation.") && (
                <>  
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage53SpecificChanges("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Great! Next, we’ll discuss estate duty. Shall we continue?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage54Final("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage54Final("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Now let's discuss estate duty, the tax on the total value of your estate if you were to pass away today with your current will or distribution wishes in place. Understanding this helps us ensure your estate plan minimises taxes and maximises what is passed on to your heirs. Ready to get started?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage55EstateDuty("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage55EstateDuty("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Do you have a current will in place?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage56CurrentWill("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage56CurrentWill("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Creating a will is an important step in securing your assets and ensuring your wishes are followed. We can start drafting your will right here by answering a few questions about your estate and preferences.") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage57ImportantStep("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Continue
                    </button>
                     
                  </div>
                </>
              )}

{message.content.includes("When was the last time you reviewed your will? It’s a good idea to keep it up to date with any changes in your life.") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage57ReviewedWill("Will is up to date")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Will is up to date
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage57ReviewedWill("Will needs to be reviewed & updated")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Will needs to be reviewed & updated
                    </button>
                     
                  </div>
                </>
              )}

{message.content.includes("Let's go over the details of your current will. How are your assets distributed according to your current will? Here are some specific questions to help clarify this:") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage57ImportantStep("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Continue
                    </button>
                    
                     
                  </div>
                </>
              )}

              {message.content.includes("Do you bequeath your estate to your spouse?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage58EstateSpouse("Yes, my entire estate")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes, my entire estate
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage58EstateSpouse("Yes, a significant portion of my estate")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes, a significant portion of my estate
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage58EstateSpouse("Yes, a significant portion of my estateNo, estate divided among other beneficiaries")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes, a significant portion of my estateNo, estate divided among other beneficiaries
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage58EstateSpouse("No, spouse receives only a specific portion")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     No, spouse receives only a specific portion
                    </button>
                  </div>
                </>
              )}

               {message.content.includes("What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage59Residue("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage59Residue("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Do you bequeath any portion of your estate to the Trustees of any specific trust?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage60Bequeath("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage60Bequeath("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Does your will include a plan for setting up a trust after you pass away?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage61PassAway("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage61PassAway("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     No
                    </button>
                  </div>
                </>
              )}
    
{message.content.includes("Do you have a farm or any specific property bequeathed to a trust?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage62Bequeathed("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage62Bequeathed("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("Yes, the difference should be considered a loan to the specific beneficiary")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes, the difference should be considered a loan to the specific beneficiary
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("No, the difference should be considered a gift and not a loan")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     No, the difference should be considered a gift and not a loan
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("The difference should be treated as a loan with interest payable by the beneficiary")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     The difference should be treated as a loan with interest payable by the beneficiary
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("The difference should be adjusted through other assets or cash to balance the value")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     The difference should be adjusted through other assets or cash to balance the value
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("A family trust should manage the difference to ensure equitable distribution")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     A family trust should manage the difference to ensure equitable distribution
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("The surviving spouse should decide on how to manage the difference based on circumstance")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     The surviving spouse should decide on how to manage the difference based on circumstance
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("The difference should be documented but forgiven upon the death of the surviving spouse")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     The difference should be documented but forgiven upon the death of the surviving spouse
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("The estate should sell specific assets to cover the difference and distribute proceeds accordingly")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     The estate should sell specific assets to cover the difference and distribute proceeds accordingly
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("A clause should be added to the will to allow for flexibility in handling the difference")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     A clause should be added to the will to allow for flexibility in handling the difference
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage63AssetsManaged("The difference should be split among all beneficiaries to evenly distribute the value")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     The difference should be split among all beneficiaries to evenly distribute the value
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Certain third parties may be responsible for estate duty based on the assets they receive. Do you have any specific instructions or details about third-party liability for estate duty in your current will?") && (
                <>  
                   <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage64ThirdParties("Yes, I have it in my current will")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes, I have it in my current will
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage64ThirdParties("No, I have not included specific instructions")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     No, I have not included specific instructions
                    </button>
                  </div>
                </>
              )}

{message.content.includes("DID YOU KNOW If your spouse were to pass away immediately after you, there are specific estate duty implications and/or arrangements you would need to consider? All the more reason to get in touch with our Financial Advisors. This will be noted and added to the report supplied to you at the end of this chat.") && (
                <>  
                   <div className="space-x-2 mt-2">
                    Thank you for providing all these details. This helps us understand the estate duty implications of your current will. Please share your current will. 🔐💼
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage65CurrentWill("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Upload Document
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage65CurrentWill("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("No problem. Whenever you're ready to provide the details, just let me know.") && (
                <>  
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage65CurrentWill("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    Continue
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Understood. It's crucial to consider this aspect carefully. Would you like to discuss potential options for addressing third-party liability in your estate plan?") && (
                <>  
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage65PotentialOption("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    Yes
                    </button>
                     <button
                      onClick={() =>
                        handleButtonStage65PotentialOption("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    No
                    </button>
                  </div>
                </>
              )}

              {message.content.includes("Excellent! There are several strategies we can explore to address third-party liability in your estate plan. One option is to include specific provisions in your will outlining how estate duty should be handled for third parties. We can also consider setting up trusts or other structures to manage these liabilities effectively. Would you like to explore these options further?") && (
                <>  
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage65Stages("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage65Stages("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Great, one of our financial advisors will be in touch in this regard.") && (
                <>  
                 <div className="space-x-2 mt-2">
                  <strong>DID YOU KNOW</strong>:
                     <br />
                       💡 If your spouse were to pass away immediately after you, there are specific estate duty implications and/or arrangements you would need to consider? All the more reason to get in touch with our Financial Advisors. This will be noted and added to the report supplied to you at the end of this chat.
                  </div>
                    <div className="space-x-2 mt-2">
                    Thank you for providing all these details. This helps us understand the estate duty implications of your current will. Please share your current will. 🔐💼
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage65CurrentWill("Upload Document")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Upload Document
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage65CurrentWill("Maybe Later")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    Maybe Later
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Great! Next, we’ll look at the executor’s fees. Shall we continue?") && (
                <>  
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage66EstateDutyCurrentWillFinal("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage66EstateDutyCurrentWillFinal("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated.") && (
                <>  
                <div className="space-x-2 mt-2">
      Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated.
      <br />
      <br />
      💰 The maximum fee that can be charged for executor’s fees is 3.5%, plus VAT (15%), which totals 4.03%. You can leave instructions in your will to stipulate what percentage you wish to set for the executor’s fees.
      <br />
      <br />
      <strong>DID YOU KNOW</strong>:
      <br />
      👪 Family members are also entitled to executor’s fees. The advantage of family members as executors is that they may be open to waive or negotiate lower compensation.
    </div>
    <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage67ExecutorFee("Continue")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Continue
                    </button>
                    </div>
                </>
              )}


{message.content.includes("Remember, no executor’s fees are payable on proceeds from policies with a beneficiary nomination, as these are paid directly to the nominated beneficiary by the insurance company. Do you have any such policies?") && (
                <>  
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage68Payable("Yes, specify")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes, specify
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage68Payable("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    No
                    </button>
                  </div>
                </>
              )}

{message.content.includes("Thank you for providing these details. Now, we can move on to the next part of your estate planning. Ready to continue?") && (
                <>  
                
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage69ExecutorFinal("Yes")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                     Yes
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage69ExecutorFinal("No")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                    No
                    </button>
                  </div>
                </>
              )}





























              {message.content.includes(
                "Thanks for sharing your thoughts, [Client's Name]. It’s important to have a clear understanding of your objectives so we can tailor your estate plan to meet your needs. Is there anything else you’d like to add before we move on?"
              ) && (
                <>
                  <button
                    onClick={() =>
                      handleButtonStage20Final("Yes, I have a question")
                    }
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Yes, I have a question
                  </button>
                  <button
                    onClick={() => handleButtonStage20Final("No")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    No
                  </button>
                </>
              )}

              {message.content.includes(
                "The success of your estate plan relies on accurate information about your assets, liabilities, and clear communication of your wishes. How confident are you in the accuracy of the details you’ve provided so far? And would you be open to regularly reviewing and updating your estate plan to reflect any changes?"
              ) && (
                <>
                  <button
                    onClick={() => handleButtonStage20("Yes")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleButtonStage20("No")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    No
                  </button>
                </>
              )}

              {message.content.includes(
                "Reducing taxes and expenses payable upon your death can help maximise the value passed on to your heirs. How high a priority is it for you to minimise these costs?"
              ) && (
                <>
                  <button
                    onClick={() => handleButtonStage20Payable("Low")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Low
                  </button>
                  <button
                    onClick={() => handleButtonStage20Payable("Average")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Average
                  </button>
                  <button
                    onClick={() => handleButtonStage20Payable("High")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    High
                  </button>
                </>
              )}

              {(message.content.includes(
                "While these templates and checklists can help you get started, there are times when seeking professional"
              ) ||
                message.content.includes("Checklist is downloaded")) && (
                <>
                  <div className="space-x-2 mt-2">
                    🏦 Complex Estates:
                    <br />
                    If you have a large or complex estate, a lawyer can help
                    navigate intricate legal requirements and tax implications.
                    <br />
                    <br />
                    ⚖️ Disputes:
                    <br />
                    If you anticipate family disputes or have a blended family,
                    legal advice can ensure your wishes are clear and
                    enforceable.
                    <br />
                    <br />
                    💼 Business Interests:
                    <br />
                    If you own a business, a lawyer can assist in ensuring its
                    continuity and proper transfer of ownership.
                    <br />
                    <br />
                    📜 Changing Laws:
                    <br />
                    Estate laws can change. A legal professional can keep your
                    plan up-to-date with the latest regulations.
                    <br />
                    <br />
                    *Old Mutual has a dedicated team of legal advisers that can
                    assist, free of charge when consulting via financial
                    adviser.
                  </div>
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() => handleButtonStage15("Continue")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() =>
                        handleButtonStage14Contact(
                          "Get in touch with an Old Mutual Financial Advisor"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Get in touch with an Old Mutual Financial Advisor
                    </button>
                  </div>
                </>
              )}

              {faqStage && (
                <>
                  <div className="space-x-2 mt-2">
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
                  <div className="space-x-2 mt-4">
                    <button
                      onClick={() =>
                        handleButtonStage14("Yes, I have a question")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes, I have a question
                    </button>
                    <button
                      onClick={() => handleButtonStage14("No, let’s move on")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      No, let’s move on
                    </button>
                  </div>
                </>
              )}
              {legalRequirement &&
                !message.content.includes("different scenarios") && (
                  <>
                    <div className="space-x-2 mt-2">
                      Estate planning in South Africa involves understanding key
                      legal requirements to ensure your wishes are respected and
                      legally binding. 📜⚖️
                      <br />
                      <br />
                      Here are some important acts and considerations:
                    </div>
                    <div className="space-x-2 mt-2">
                      📝 Wills Act 7 of 1953
                      <br />
                      The Wills Act governs the creation and execution of wills.
                      Your will must be in writing, signed by you, and witnessed
                      by two people who are not beneficiaries.
                      <br />
                      <br />
                      💼 Estate Duty Act 45 of 1955
                      <br />
                      This Act imposes estate duty (a form of tax) on the estate
                      of a deceased person. The first R3.5 million of an estate
                      is exempt from estate duty.
                      <br />
                      <br />
                      📋 Intestate Succession Act 81 of 1987
                      <br />
                      If you die without a will, the Intestate Succession Act
                      determines how your estate will be distributed. This may
                      not align with your wishes, so having a will is crucial.
                      <br />
                      <br />
                      💍 Marital Property Regimes
                      <br />
                      Your marital status can affect your estate planning. South
                      Africa recognises different marital property regimes, such
                      as community of property, antenuptial contract (ANC), and
                      ANC with accrual. It’s important to consider how these
                      will impact your estate.
                      <br />
                      <br />
                      🏛️ Master of the High Court
                      <br />
                      The Master of the High Court oversees the administration
                      of deceased estates. Executors of estates must be
                      appointed and approved by the Master.
                      <br />
                      <br />
                      Understanding these components and local laws can help
                      ensure that your estate plan is comprehensive and legally
                      sound. 📚✅
                    </div>
                    <div className="space-x-2 mt-2">
                      Are you ready to explore some potential outcomes of
                      different estate planning choices?
                    </div>
                    <div className="space-x-2 mt-2">
                      <button
                        onClick={() =>
                          handleButtonStage13("I have a question.")
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                      >
                        I have a question.
                      </button>
                      <button
                        onClick={() =>
                          handleButtonStage13(
                            "Yes, Im ready to explore some potential outcomes."
                          )
                        }
                        className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                      >
                        Yes, Im ready to explore some potential outcomes.
                      </button>
                    </div>
                  </>
                )}

              {educationInformation && (
                <>
                  <div className="space-x-2 mt-2">
                    Estate planning is the process of arranging how your assets
                    will be managed and distributed after your death. It ensures
                    that your wishes are respected, your loved ones are taken
                    care of, and potential disputes are minimised. 🏠💼
                    <br />
                    <br />
                    It's important because it gives you peace of mind knowing
                    that your affairs are in order, and it can also help reduce
                    taxes and legal costs in the future.💡
                  </div>
                  <div className="space-x-2 mt-2">
                    There are 5 key components of estate planning:
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
                    <br />
                    Would you like a detailed explanation of all or some of
                    these components?
                  </div>
                  <div className="space-x-2 mt-2">
                    <button
                      onClick={() => handleButtonComponent("Wills")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Wills
                    </button>
                    <button
                      onClick={() => handleButtonComponent("Trusts")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Trusts
                    </button>
                    <button
                      onClick={() => handleButtonComponent("Power of Attorney")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Power of Attorney
                    </button>
                    <button
                      onClick={() => handleButtonComponent("Living Will")}
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Living Will
                    </button>
                    <button
                      onClick={() =>
                        handleButtonComponent("Beneficiary Designations")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Beneficiary Designations
                    </button>
                  </div>
                </>
              )}

              {askingConsent && (
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonFunFact("Yes, I consent")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Yes, I consent
                  </button>
                  <button
                    onClick={() => handleButtonFunFact("No, I do not consent")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    No, I do not consent
                  </button>
                </div>
              )}

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
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes, I consent
                    </button>
                    <button
                      onClick={() =>
                        handleButtonPrivacy("No, I do not consent")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Yes, I'm ready to move on.
                    </button>
                    <button
                      onClick={() =>
                        handleButtonFunFact(
                          "No, I have some questions about the above"
                        )
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
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
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Yes, I want to watch
                  </button>
                  <button
                    onClick={() =>
                      handleButtonClick("No, I don't want to watch")
                    }
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    No, I don't want to watch
                  </button>
                </div>
              )}
              {isMaritalStatusQuestion && !reg && (
                <div className="space-x-2 mt-2">
                  <button
                    onClick={() => handleButtonClick("Single")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Single
                  </button>
                  <button
                    onClick={() => handleButtonClick("Married")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Married
                  </button>
                  <button
                    onClick={() => handleButtonClick("Divorced")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Divorced
                  </button>
                  <button
                    onClick={() => handleButtonClick("Widowed")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Widowed
                  </button>
                </div>
              )}
              {isDependentsQuestion && (
                <div className="flex flex-col space-y-2 mt-2">
                  <label className="text-white">
                    Please select your dependents:
                  </label>
                  {Object.entries(checkboxes).map(([key, value]) => (
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
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {uploadDocumentANC && (
                <div className="flex space-x-2 mt-2">
                  <button
                    className="bg-[#8DC63F] text-white rounded-lg py-2 px-4"
                    style={{ borderRadius: "10px" }}
                  >
                    Upload Document
                  </button>
                  <button
                    className="border border-[#8DC63F] text-[#8DC63F] rounded-lg py-2 px-4 bg-transparent"
                    style={{ borderRadius: "10px" }}
                    onClick={() => handleButtonFunFact("Maybe Later")}
                  >
                    Maybe Later
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
                        Upload Document
                      </button>
                      <button
                        className="border border-[#8DC63F] text-[#8DC63F] rounded-lg py-2 px-4 bg-transparent"
                        style={{ borderRadius: "10px" }}
                      >
                        Maybe Later
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {reg && (
            <div className="space-x-2 mt-2">
              <button
                onClick={() =>
                  handleButtonClickRegime("In Community of Property")
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                In Community of Property
              </button>
              <button
                onClick={() =>
                  handleButtonClickRegime(
                    "Out of Community of Property with Accrual"
                  )
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                Out of Community of Property with Accrual
              </button>
              <button
                onClick={() =>
                  handleButtonClickRegime(
                    "Out of Community of Property without Accrual"
                  )
                }
                className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                Out of Community of Property without Accrual
              </button>
              <button
                onClick={() => handleButtonClickRegime("I can't remember")}
                className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                I can't remember
              </button>
            </div>
          )}
          {birth && !isMaritalStatusQuestion && (
            <>
              <div className="space-x-2 mt-2">
                <Calendar />
              </div>
            </>
          )}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-[#212121]">
      {isOpen && (
        <div
          id="chat-container"
          className="fixed inset-0 flex items-end sm:w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 mx-auto"
        >
          <div className="bg-[#212121] shadow-md rounded-lg w-full h-full">
            <div className="p-4 border-b text-white rounded-t-lg flex items-center bg-gradient-to-b from-[#84c342] to-[#149d6e]">
              <p
                id="estate-icon"
                className="bg-[#8dc63f] text-white px-4 py-4 mr-2 rounded-full"
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
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                  />
                </svg>
              </p>
              <p className="text-lg font-semibold">Estate Planning Bot</p>
              <div className="ml-auto flex items-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-gray-400 focus:outline-none focus:text-gray-400 ml-2"
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
                </button>
              </div>
            </div>
            <div
              id="chatbox"
              className="p-4 h-[calc(100vh-240px)] overflow-y-auto"
            >
              {renderMessages() || <div className="italic">typing...</div>}
            </div>
            <form
              className="w-full"
              onSubmit={(e) => {
                e.preventDefault();
                if (inputStr.trim()) {
                  //not working
                  handleSubmit(e);
                  setAllCheckboxesFalse();
                  // userProfile(inputStr);

                  // savePropertyRegime(inputStr);
                  setInputStr(""); // Clear the input field after submit
                }
              }}
            >
              <div className="p-4 border-t flex">
                <CustomInput
                  className="send-input bg-[#212121] text-white border-none focus:outline-none w-full"
                  id="user-input"
                  value={inputStr}
                  onChange={(e: any) => {
                    setInputStr(e.target.value);
                    handleInputChange(e);
                  }}
                  placeholder="Type a message"
                />
                <button
                  id="send-button"
                  type="submit"
                  className="bg-[#8dc63f] text-white px-4 py-2 rounded-md ml-2"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {!isOpen && (
        <div>
          <div className="fixed inset-0">
            {/* <Navbar /> */}
            <div
              id="chat-container-2"
              className="fixed inset-0 flex items-end lg:w-1/2 xl:w-2/5 mx-auto "
            >
              <div className="bg-[#212121] shadow-md rounded-lg w-full h-full">
                <div className="p-4 text-white rounded-t-lg items-center mt-12">
                  <p className="text-lg font-semibold text-center text-4xl">
                    Welcome to our Estate Planning Chat
                  </p>
                </div>
                <div
                  id="chatbox"
                  className="p-4 h-[calc(100vh-220px)] overflow-y-auto"
                >
                  {renderMessages() || <div className="italic">typing...</div>}
                </div>
                <form
                  className="w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if(isResponse.current == "1"){
                    e.preventDefault();
                     handleSubmit(e);
                     
                    } else 
                    if (messageData.current.includes("Great! Please provide the above mentioned details.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    } else if (messageData.current.includes("Great! Please provide the above mentioned details of the farm")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?"
                      );
                    } else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of the farm, just let me know.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?"
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your vehicle")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?"
                      );
                    } else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your vehicle, just let me know.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?"
                      );
                    }

                    
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your valuable possessions")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your shortterm insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your valuable possessions, just let me know.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your shortterm insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your household")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your household")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment."
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your investment portfolio")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the account details and approximate balances."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your investment portfolio")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the account details and approximate balances."
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your cash savings or deposits in bank accounts")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your cash savings or deposits in bank accounts")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value."
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your business interest")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your business interest")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values."
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your significant assets")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your significant assets")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset."
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your intellectual property rights")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your intellectual property rights")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within."
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your legal entities")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your legal entities")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
                      );
                    }
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your outstanding mortgage loan")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your outstanding mortgage loan")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan."
                      );
                    }
                    
                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your current personal loan")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your current personal loan")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card."
                      );
                    }

                    

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your credit card debt")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your credit card debt")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your vehicle loan")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your vehicle loan")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your outstanding debt")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have a strategy in place for managing and reducing your liabilities over time?"
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your outstanding debt")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have a strategy in place for managing and reducing your liabilities over time?"
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your strategy")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any significant changes expected in your liabilities in the foreseeable future?"
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your strategy")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any significant changes expected in your liabilities in the foreseeable future?"
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your significant changes expected in your liabilities")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your significant changes expected in your liabilities")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your life insurance policies")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are you covered by any health insurance policies? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your life insurance policies")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are you covered by any health insurance policies? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your health insurance policies")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your health insurance policies")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your insurance provider")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles."
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your insurance provider")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your vehicle insurance provider")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?"
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your vehicle insurance provider")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?"
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details about any other type of insurance you have")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?"
                      );
                    }

                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details about any other type of insurance you have, just let me know.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?"
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your insurance policies")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?"
                      );
                    }
                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your insurance policies")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?"
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your stocks or equities")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date"
                      );
                    }

                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your stocks or equities")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date"
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the types of bonds mentioned above.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund."
                      );
                    }

                    else if (messageData.current.includes("No problem. Whenever you're ready, please provide the types of bonds you are interested in.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your investments in mutual funds.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account."
                      );
                    }

                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your investments in mutual funds.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your type of retirement account.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties."
                      );
                    }

                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your type of retirement account.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your investment properties or real estate holdings")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value."
                      );
                    }

                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your investment properties or real estate holdings")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value."
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the above mentioned details of your asset classes.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?"
                      );
                    }

                    else if (messageData.current.includes("No problem. Whenever you're ready to provide the details of your asset classes.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?"
                      );
                    }

                    else if (messageData.current.includes("Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial advisor can help you define these parameters and create a tailored investment strategy.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any specific changes or adjustments you're considering making to your investment portfolio in the near future?"
                      );
                    }

                    else if (messageData.current.includes("No problem, I understand that there is a lot to think about. Is there something specific you'd like to discuss or any concerns you have that I can address?")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have a current will in place?"
                      );
                    }

                    else if (messageData.current.includes("That's a significant decision. To ensure we capture your wishes accurately, could you specify if there are any conditions or limitations attached to this bequest?")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
                      );
                    }

                    else if (messageData.current.includes("Thank you for sharing. Could you clarify what percentage or which assets you intend to leave to your spouse?")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
                      );
                    }

                    else if (messageData.current.includes("Understood. Could you provide details on how you would like your estate to be distributed among the other beneficiaries?")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
                      );
                    }

                    else if (messageData.current.includes("I see. Could you specify the percentage or assets you'd like your spouse to receive?")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
                      );
                    }

                    else if (messageData.current.includes("Please provide the trustees and beneficiaries for this trust. Are the beneficiaries an income beneficiary or a capital beneficiary? For example, the asset in question is a house, the income beneficiary is entitled to receive the rental from the property. If the house is sold, then the capital beneficiary is entitled to receive the proceeds from the sale.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Does your will include a plan for setting up a trust after you pass away?"
                      );
                    }
 
                    else if (messageData.current.includes("Who are the beneficiaries of this trust?")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have a farm or any specific property bequeathed to a trust?"
                      );
                    }

                    else if (messageData.current.includes("DID YOU KNOW For estate duty: When farms are bequeathed (whether to trust or natural person) and the farm was used for bona fide farming purposes, the market value less 30% is included as the value of the farm for estate duty purposes. Please provide details of the trust.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you bequeath any farm implements, equipment, tools, vehicles, transport vehicles, or livestock? If so, to whom?"
                      );
                    }

                    else if (messageData.current.includes("Do you bequeath any farm implements, equipment, tools, vehicles, transport vehicles, or livestock? If so, to whom?")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you bequeath any specific assets to a company where a trust has 100% shareholding? Please provide details."
                      );
                    }

                    else if (messageData.current.includes("Do you bequeath any specific assets to a company where a trust has 100% shareholding? Please provide details")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?"
                      );
                    }

                    else if (messageData.current.includes("Great! Please provide the policy details.")) { 
                      e.preventDefault();
                      handleAddAIResponse(
                        "Thank you for providing these details. Now, we can move on to the next part of your estate planning. Ready to continue?"
                      );
                    }

                    





































                    else if (
                      messageData.current.includes(
                        "No problem. Whenever you're ready to provide the details, just let me know."
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
                        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    } else if (
                      messageData.current.includes(
                        "Next, provide the location of your property (suburb, or specific neighbourhood, province)."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    } else if (
                      messageData.current.includes(
                        "What is the size of your property? For houses and apartments, include the square metres of living space. For land, provide the total area in square metres or hectares."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    } else if (
                      messageData.current.includes(
                        "How many bedrooms and bathrooms does your property have?"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    } else if (
                      messageData.current.includes(
                        "Describe the condition of your property (new, good, fair, needs renovation). Also, mention any special features (e.g., swimming pool, garden, garage)."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    } else if (
                      messageData.current.includes(
                        "Please provide details of your arrangement."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?"
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
                    } else if (!trigger.current) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Let's dive into the world of estate planning!"
                      );
                      trigger.current = !trigger.current;
                    } else {
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
                          messageData.current.includes(
                            "have your date of birth"
                          ) ||
                          messageData.current.includes(
                            "What is your date of"
                          ) ||
                          messageData.current.includes("your date of birth.") ||
                          messageData.current.includes(
                            "about your date of birth."
                          ) ||
                          messageData.current.includes("were you born") ||
                          messageData.current.includes(
                            "ask for your date of birth"
                          )
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
                          messageData.current.includes(
                            "What is your full name"
                          ) ||
                          messageData.current.includes(
                            "What's your full name"
                          ) ||
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
                      className="bg-[#8dc63f] text-white px-4 py-2 rounded-md ml-2"
                    >
                      Send
                    </button>
                  </div>
                </form>
                {loading && (
                  <p className="text-white">
                    Loading... Retrying {retryCount}/{MAX_RETRIES}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
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
          </button>
        </div>
      )}
    </div>
  );
}
