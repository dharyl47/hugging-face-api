"use client";
import React from "react";
import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import CustomInput from "@/app/components/CustomInput";
import CustomCheckBox from "@/app/components/CustomCheckBox"; // Import the CustomCheckBox component
import EmbeddedVideo from "@/app/components/EmbeddedVideo";
import SelectableButtonGroup from "@/app/components/SelectableButtonGroup";
import CustomButtonGroup from "@/app/components/CustomButtonGroup";
import Calendar from "@/app/components/Calendar";
import Image from "next/image"; // Import the Image component
import BusinessImportanceSlider from "./components/BusinessImportanceSlider";
import LifeInsuranceSlider from "./components/LifeInsuranceSlider";
import TaxesSlider from "./components/TaxesSlider";
import ProgressSidebar from "./components/ProgressSidebar";

import Navbar from "@/app/components/Navbar";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import connectMongoDB from "@/app/lib/mongo";
import "./globals.css";

interface Checkboxes {
  spouse: boolean;
  children: boolean;
  stepchildren: boolean;
  grandchildren: boolean;
  factualDependents: boolean;
  other: boolean;
  none: boolean;
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

const stages = [
  "Consent",
  "Personal Information",
  "Step-by-Step Guidance",
  "Objectives of Estate Planning",
  "Assets & Liabilities",
  "Policies & Investments",
  "Estate Duty & Executor Fees",
  "Liquidity Position",
  "Maintenance Claims",
  "Provisions for Dependents",
  "Trusts",
  "Final Details",
];

const tooltipData = {
  "Establish a Trust": "Protects your assets and ensures they are distributed according to your wishes.",
  "Set Up Insurance Policies": "Provides financial security in case of unforeseen events.",
  "Legal Agreements": "Formalises arrangements to manage and protect your business interests.",
  "Buy-Sell Agreement": "Ensures smooth transition and fair value if a business partner exits.",
  "Contingent Liability Insurance": "Covers potential business liabilities.",
  "Diversified Investment Strategy": "Spreads risk across different investments.",
  "Business Succession Planning": "A business strategy companies use to pass leadership roles down to another employee or group of employees.",
  "Debt Repayment Plan": "A plan for paying off debts over time, typically by making regular, manageable payments to reduce the total amount owed.",
  "Asset Protection Planning": "Safeguards your personal and business assets from risks.",
  "Separation of Personal & Business Finances": "Keeps your personal and business finances distinct to avoid complications."
};

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat();
  const [consent, setConsent] = useState<string>("");
  const [isFormSubmitted, setIsFormSubmitted] = useState(false); // Flag to track form submission

  const continueButtonRef = useRef(null);

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
    "All Key Terms",
  ];

  const [selectedScenario, setSelectedScenario] = useState<string[]>([]);
  const scenario = [
    "Scenario 1",
    "Scenario 2",
    "Scenario 3",
    "Scenario 4",
    "All Scenarios",
  ];
  const [openTooltip, setOpenTooltip] = useState(null);
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

  const [selectedStrategiesv2, setSelectedStrategiesv2] = useState<string[]>(
    []
  );
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
  const [isThinking, setIsThinking] = useState(false);

  const [isStartTab, setStartTab] = useState(false);
  const [isEstatePlanningTabOpen, setEstatePlanningTabOpen] = useState(false);
  const [isEstatePlanningTabOpenv1, setEstatePlanningTabOpenv1] =
    useState(false);
  const [estatePlanningMessages, setEstatePlanningMessages] = useState<
    Message[]
  >([]);
  const [activeTab, setActiveTab] = useState("originalChat"); // <-- Add this state

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
  const [maritalStatus, setMaritalStatus] = useState("Married");
  const [encryptedName, setEncryptedName] = useState("");
  const [isUserNameCollected, setIsUserNameCollected] = useState(false);
  const [propertyRegime, setPropertyRegime] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [dependentsOver, setDependentsOver] = useState("");
  const [dependentsUnder, setDependentsUnder] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [typeOfProperty, setTypeOfProperty] = useState("");
  const [locationOfProperty, setLocationOfProperty] = useState("");
  const [sizeOfProperty, setSizeOfProperty] = useState("");
  const [roomsOfProperty, setRoomsOfProperty] = useState("");
  const [conditionOfProperty, setConditionOfProperty] = useState("");

  const [dependentsOverStage, setDependentsOverStage] = useState(false);
  const [dependentsUnderStage, setDependentsUnderStage] = useState(false);
  const [userEmailStage, setUserEmailStage] = useState(false);
  const [dateOfBirthStage, setDateOfBirthStage] = useState(false);
  const [dateC, setDateC] = useState();

  const [currentStage, setCurrentStage] = useState(1); // Stores current stage
  const [previousStage, setPreviousStage] = useState(null); // Stores previous stage
  const [showQuestionButtons, setShowQuestionButtons] = useState(false); // Controls when to show question buttons

  const [deletionRequestData, setDeletionRequestData] = useState("");
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const chatboxRef = useRef<HTMLDivElement | null>(null);

  const [currentChatStage, setCurrentChatStage] = useState(0);

  // Function to handle advancing stages
  const advanceStage = () => {
    setCurrentChatStage((prevStage) =>
      Math.min(prevStage + 1, stages.length - 1)
    );
  };


  const toggleTooltip = (strategy : any) => {
    if (openTooltip === strategy) {
      setOpenTooltip(null); // Close the tooltip if it's already open
    } else {
      setOpenTooltip(strategy); // Open the selected tooltip
    }
  };


  useEffect(() => {
    const connectToMongo = async () => {
      try {
        // Send a POST request to your test Mongo API route
        const response = await axios.post("/api/checkMongoConnection");
        console.log(response.data.message); // Log success message
      } catch (error: any) {
        console.error(
          "Failed to connect to MongoDB:",
          error.response?.data?.error || error.message
        );
      }
    };

    connectToMongo(); // Call the function when the component mounts
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // Stop "thinking" when an assistant message with content arrives
      if (lastMessage.role === "assistant" && lastMessage.content) {
        setIsThinking(false);
      }
    }
  }, [messages]); // Run this effect every time messages change

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);
  const originalChatRef = useRef<HTMLDivElement | null>(null);
  const estatePlanningChatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeTab === "originalChat" && originalChatRef.current) {
      originalChatRef.current.scrollTop = originalChatRef.current.scrollHeight;
    } else if (
      activeTab === "estatePlanning" &&
      estatePlanningChatRef.current
    ) {
      estatePlanningChatRef.current.scrollTop =
        estatePlanningChatRef.current.scrollHeight;
    }
  }, [messages, activeTab]); // Add activeTab to the dependency array

  useEffect(() => {
    if (activeTab === "originalChat" && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    } else if (activeTab === "estatePlanning" && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages, activeTab]); // Also add activeTab here

  const valueProperty = useRef("");

  async function calculatePropertyValue({
    typeOfProperty,
    locationOfProperty,
    sizeOfProperty,
    roomsOfProperty,
    conditionOfProperty,
  }: {
    typeOfProperty: string;
    locationOfProperty: string;
    sizeOfProperty: string;
    roomsOfProperty: string;
    conditionOfProperty: string;
  }) {
    try {
      // Log the input data to the console
      console.log("Property Input Details:");
      console.log("Type of Property:", typeOfProperty);
      console.log("Location of Property:", locationOfProperty);
      console.log("Size of Property:", sizeOfProperty);
      console.log("Rooms of Property:", roomsOfProperty);
      console.log("Condition of Property:", conditionOfProperty);

      // Refined prompt to request only the property value
      const response = await axios.post("/api/chatAnalyze", {
        messages: [
          {
            content: `Please provide a rough estimate of the value for a ${typeOfProperty} located in ${locationOfProperty}. The property size is ${sizeOfProperty} square metres with ${roomsOfProperty} and is in ${conditionOfProperty}. Respond only with the value in ZAR and no other details.`,
            role: "user",
            createdAt: new Date(),
          },
        ],
      });

      let aiResponseContent = "";

      // Handle different response formats
      if (typeof response.data === "string") {
        const responseLines = response.data
          .split("\n")
          .filter((line) => line.trim() !== ""); // Filter out empty lines
        aiResponseContent = responseLines.join(" "); // Combine lines for a clean response
      } else if (Array.isArray(response.data.messages)) {
        aiResponseContent =
          response.data.messages[0]?.content || "No content received";
      } else {
        throw new Error("Invalid response format");
      }

      // Handle the AI response (e.g., add to chat)
      valueProperty.current = aiResponseContent;
      handleAddAIResponse(
        "The estimated value of your property based on the information you provided is"
      );
    } catch (error) {
      console.error("Error calculating property value:", error);
    }
  }

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
    // if (isEstatePlanningTabOpenv1) {
    //   setEstatePlanningMessages([
    //     ...estatePlanningMessages,
    //     aiMessage,
    //   ]);
    //   console.log("dataProvided", "Second");
    // } else {
    //   // Append both the user input and AI response to the messages

    //   console.log("dataProvided", "Original");
    // }
    setMessages([...messages, aiMessage]);
    // Clear the input field after sending
    // setInputStr("");
  };

  const handleDateSelection = (year: any, month: any, day: any) => {
    const selectedDate = `${day}-${month + 1}-${year}`; // Format the date as DD-MM-YYYY
    setInputStr(selectedDate);
  };

  // Handle the proceed button click - send definitions for selected terms
  const [detailedProceed, setDetailedProceed] = useState(false);
  const handleProceed = () => {
    setDetailedProceed(true);
    //selectedTerms.forEach((term) => {
    handleButtonComponent(selectedTerms);
    // });
  };
  const [scenarioProceed, setScenarioProceed] = useState(false);
  const handleProceedScenario = () => {
    //selectedTerms.forEach((term) => {
    handleButtonComponentScenario(selectedScenario);
    setScenarioProceed(true);
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
    if (messagesData.includes("Other")) {
      response = "Please provide details of your arrangement.";
    } else {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }

    const userResponse = messagesData.join(", ");

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: userResponse, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };
  const handleButtonComponentStrategy = (messagesData: string[]) => {
    let response = "";
    if (messagesData.includes("Tell Me More About Each Option")) {
      response =
        "That's okay! It can be overwhelming to decide on the best measures without more information. Here’s a brief overview to help you:";
    } else if (messagesData.includes("Other")) {
      response = "Please provide details of your arrangement.";
    } else {
      response =
        "Are you concerned about protecting your assets from potential insolvency issues, either for yourself or your heirs?";
    }

    const userResponse = messagesData.join(", ");

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: userResponse, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  async function analyzeEstatePlanningMessage(message: string) {
    try {
      // Log the input message to the console
      console.log("Estate Planning Input Message:", message);

      // Send the single message to the AI API
      const response = await axios.post("/api/chatSecondTab", {
        messages: [
          {
            content: message,
            role: "user",
            createdAt: new Date(),
          },
        ],
      });
      const userMessage: Message = {
        id: Date.now().toString(), // Unique ID
        role: "user", // User message role
        content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
      };
      let aiResponseContent = "";

      // Handle different response formats
      if (typeof response.data === "string") {
        const responseLines = response.data
          .split("\n")
          .filter((line) => line.trim() !== ""); // Filter out empty lines
        aiResponseContent = responseLines.join(" "); // Combine lines for a clean response
      } else if (Array.isArray(response.data.messages)) {
        aiResponseContent =
          response.data.messages[0]?.content || "No content received";
      } else {
        throw new Error("Invalid response format");
      }

      // Create the AI message object
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant", // Must be a valid role
        content: aiResponseContent, // AI response content
      };

      // Save the AI response message into the estate planning messages
      setEstatePlanningMessages([
        ...estatePlanningMessages,
        userMessage,
        aiMessage,
      ]);

      // Log or handle the AI response
      //console.log("AI Response:", aiResponseContent);
      setInputStr("");
    } catch (error) {
      console.error("Error analyzing estate planning message:", error);
    }
  }

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
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };
  //Here are the definition of key terms:
  const handleButtonComponent = (messagesData: string[]) => {
    let response = "Here are the definition of key terms:";

    const userResponse = messagesData.join(", ");

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: userResponse, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const handleButtonQuestion = (message: any) => {
    let response = "";
    if (message == "Is there anything else you'd like to ask?") {
      response = "Absolutely! I'm here to assist. What would you like to ask?";
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

    if (isEstatePlanningTabOpenv1) {
      setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
    } else {
      // Append both the user input and AI response to the messages
      setMessages([...messages, aiMessage]);
    }
  };

  const handleButtonConsent = (message: any) => {
    setConsent(message);
    let response = "";
    if (message == "Yes, I consent") {
      // response =
      //   "Hello and welcome to Moneyversity’s Estate Planning Consultant.";
    //   response =
    //     "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation.";
    // 
    response =
         "Hello and welcome to Moneyversity’s Estate Planning Consultant. I’m here to help you navigate the estate planning process with ease. Together, we’ll ensure your assets and wishes are well-documented and protected.";
    }

    if (message == "No, I do not consent") {
      response =
        "Unfortunately your consent is required to move froward with this process. If you need any further information, please submit your questions in the feedback form below.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };


const handleButtonStage00 = (message: any) => {
    let response = "";
    if (message == "Let's chat again!") {
      response = "Let’s dive into the world of estate planning!";
    }
    if (message == "Absolutely") {
      response = "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation.";
      setCurrentChatStage(1);
    }

    if (message == "Tell me more") {
      response = "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation.";
       setCurrentChatStage(1);
    }
    if (message == "Not now") {
      response =
        "No problem at all. If you ever have questions or decide to start your estate planning, I’m here to help. Have a great day!";
    }
    setSelectedButton(message);
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    // setMessages([...messages, aiMessage]);
    setMessages([...messages, aiMessage]);
  };

  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const handleButtonStage0 = (message: any) => {
    let response = "";
    if (message == "Let's chat again!") {
      response = "Let’s dive into the world of estate planning!";
    }
    if (message == "Absolutely") {
      response = "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation.";
    }

    if (message == "Tell me more") {
      response = "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation.";
    }
    if (message == "Not now") {
      response =
        "No problem at all. If you ever have questions or decide to start your estate planning, I’m here to help. Have a great day!";
    }
    setSelectedButton(message);
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    // setMessages([...messages, aiMessage]);
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const [tellMeMore, setTellMeMore] = useState<string | null>(null);
  const handleButtonStage1 = (message: any) => {
    let response = "";
    if (message == "Tell me more") {
      response =
        "There are a few documents and phrases that are important when you are doing your estate planning:";
    }
    if (message == "Skip Estate Planning Explanation") {
      response =
        "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation.";
    }
    setTellMeMore(message);
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const handleButtonStage2 = (message: any) => {
    let response = "";
    if (message == "Single") {
      response = "Great! Are you currently single, divorced, or widowed?";
    }
    if (message == "Married") {
      response =
        "Excellent. Are you married in or out of community of property? If married out of community of property, is it with or without the accrual system?";
    }
    saveMarriage(message);

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
      response =
        "Excellent. In order to calculate the accrual, we need to know the specifics of your antenuptial contract (ANC). We will ask for your antenuptial contract at the end of this chat.";
    }
    if (message == "Out of Community of Property without Accrual") {
      await saveUserProfile({ propertyRegime: message });
      response =
        "Excellent. In order to calculate the accrual, we need to know the specifics of your antenuptial contract (ANC). We will ask for your antenuptial contract at the end of this chat.";
    }
    if (message == "I can't remember") {
      response =
        "No worries! Here’s a brief description of each type to help you remember:";
    }
    if (message == "What is Accrual?") {
      response =
        "Accrual is a concept in marriage where the growth in wealth during the marriage is shared between spouses. When a couple marries under the accrual system, each spouse keeps the assets they had before the marriage. However, any increase in their respective estates during the marriage is shared equally when the marriage ends, either through divorce or death.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage3Single = async (message: any) => {
    let response = "";

    if (message == "Single") {
      response = "Do you currently have a will in place?";
      await saveUserProfile({ maritalStatus: message });
    }
    if (message == "Divorced") {
      response = "Do you currently have a will in place?";
      await saveUserProfile({ maritalStatus: message });
    }
    if (message == "Widowed") {
      response = "Do you currently have a will in place?";
      await saveUserProfile({ maritalStatus: message });
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
      response =
        "When was the last time you reviewed your will? It’s a good idea to keep it up-to-date with any changes in your life";
    }
    if (message == "No") {
      await saveUserProfile({ will: message });
      response =
        "Creating a will is an important step in securing your assets and ensuring your wishes are followed. We can start drafting your will right here by answering a few questions about your estate and preferences a little later in the chat.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage7 = (message: any) => {
    let response = "";

    if (message == "Yes, I have a question") {
      response =
        "Of course, I'm here to help. What would you like to know or discuss?";

      setNextResponse(
        "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs"
      );
      isResponse.current = "1";
    }
    if (message == "No, let’s move on") {
      //  response = "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs";
      response =
        "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs!";
         setCurrentChatStage(2);
      }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const [stage12Proceed, setStage12Proceed] = useState<string | null>(null);
  const handleButtonStage12 = (message: any) => {
    let response = "";
    if (message == "Yes, I have a question") {
      response = "Absolutely! I'm here to assist. What would you like to ask?";

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
    setStage12Proceed(message);
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const handleButtonStage13v1 = (message: any) => {
    let response = "";
    if (message == "Yes, I’m ready to move on") {
      response =
        "Let’s check out some examples to understand these options better. Here are a few examples we can simulate:";
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
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
    // Append both the user message and AI response to the existing messages
  };

  const [stage13v2v1Proceed, setStage13v2v1Proceed] = useState<string | null>(
    null
  );
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
    setStage13v2v1Proceed(message);
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const handleButtonStage13EstateDuty = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "This tax is levied on the total value of a deceased person’s estate. The conditions include:";
    }

    if (message == "No, let’s move on") {
      response =
        "Property is a common asset that is bequeathed in estate plans. Farms in particular have specific bequeathing conditions. Do you want to explore these conditions further?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const handleButtonStage13v2 = (message: any) => {
    let response = "";

    if (message == "Yes, I have a question") {
      response = "Absolutely! I'm here to assist. What would you like to ask?";

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
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const handleButtonStage13v3 = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "A farm may only be sold to one person or entity and as such, the offer to purchase cannot be made by more than one person. An exception to this would be if a couple is married in community of property as South African law views their estate as one.";
    }

    if (message == "No, does not apply to me") {
      response =
        "Are you ready to explore some potential outcomes of different estate planning choices?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const handleButtonStage13 = (message: any) => {
    let response = "";

    if (message == "Yes, I have a question") {
      response = "Absolutely! I'm here to assist. What would you like to ask?";

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
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
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
      response = "Certainly! Let me know what you'd like to know.";

      setNextResponse(
        "I know estate planning can be daunting, so I’m here to make it as easy as possible for you to find a tailored estate plan that suits your needs. To begin, I need to gather some basic information. This will help tailor the estate planning process to your unique situation."
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setEstatePlanningMessages([...estatePlanningMessages, aiMessage]);
  };

  const handleButtonStage14 = (message: any) => {
    let response = "";

    if (message == "No, let’s move on") {
      response =
        "Now that I have some basic information about you, let’s create a customised estate planning process tailored to your needs";
        setCurrentChatStage(2);
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
      setCurrentChatStage(2);
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

  const handleButtonStage14Template = async (message: any) => {
    let response = "";
    let updateField: any = {}; // Object to store the field to update
    let downloadUrl: string | undefined = ""; // Initialize as an empty string

    if (message === "Download Will Template") {
      setCurrentChatStage(2);
      response = "Templates are downloaded";
      updateField = { "templatesDownloaded.will": true };
      downloadUrl = "/downloadables/SingleWillTemplate.docx";
    }
    if (message === "Download Trust Template") {
      setCurrentChatStage(2);
      response = "Templates are downloaded";
      updateField = { "templatesDownloaded.trust": true };
      downloadUrl = "/downloadables/TrustTemplate.docx";
    }
    if (message === "Download Power of Attorney Template") {
      setCurrentChatStage(2);
      response = "Templates are downloaded";
      updateField = { "templatesDownloaded.powerOfAttorney": true };
      downloadUrl = "/downloadables/PowerOfAttorney.docx";
    }
    if (message === "Download Living Will Template") {
      setCurrentChatStage(2);
      response = "Templates are downloaded";
      updateField = { "templatesDownloaded.livingWill": true };
      downloadUrl = "/downloadables/LivingWill.doc";
    }
    if (message === "Download All Templates") {
      setCurrentChatStage(2);
      response = "Templates are downloaded";
      updateField = {
        "templatesDownloaded.will": true,
        "templatesDownloaded.trust": true,
        "templatesDownloaded.powerOfAttorney": true,
        "templatesDownloaded.livingWill": true,
      };
      // You could trigger multiple downloads or bundle all templates into a zip file.
      downloadUrl = "/downloadables/All_Templates.zip"; // You'd need to define how to handle downloading all files.
    }
    if (message === "Skip") {
      setCurrentChatStage(3);
      response =
        "Now that we’ve covered your personal details, let’s talk about your objectives for estate planning. Understanding your goals will help us create a plan that fits your needs perfectly. Ready to dive in?";
    }

    // Append the user message first
    // const userMessage: Message = {
    //   id: Date.now().toString(),
    //   role: "user",
    //   content: message,
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: response,
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);

    // Trigger the file download only if downloadUrl is valid and not empty
    if (downloadUrl && downloadUrl.length > 0) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", downloadUrl.split("/").pop() as string); // Ensure it's a string
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    // Check if there is something to update
    if (Object.keys(updateField).length > 0) {
      try {
        // Call the saveUserProfile function to update the database
        await saveUserProfile(updateField);
        console.log("Profile updated with:", updateField);
      } catch (error) {
        console.error("Failed to update user profile:", error);
      }
    }
  };

  const handleButtonStage14Checklist = (message: any) => {
    let response = "";
    let downloadUrl: string | undefined = ""; // Initialize as an empty string

    if (message == "Download Checklist") {
      response = "Checklist is downloaded";
      downloadUrl = "/downloadables/OM_EstatePlan_Checklist.pdf";
    }
    if (message == "Let’s move on") {
      response =
        "While these templates and checklists can help you get started, there are times when seeking professional legal advice is essential. Consider getting legal advice* if the following applies to you:";
    }

    if (downloadUrl && downloadUrl.length > 0) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", downloadUrl.split("/").pop() as string); // Ensure it's a string
      document.body.appendChild(link);
      link.click();
      link.remove();
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
        "Fantastic! Our financial advisers at Old Mutual are ready to assist you in filling out these templates. Please reach out to us directly to schedule a consultation and receive personalised guidance. Here’s how you can get in touch:";
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
      setCurrentChatStage(3);
      response =
        "Now that we’ve covered your personal details, let’s talk about your objectives for estate planning. Understanding your goals will help us create a plan that fits your needs perfectly. Ready to dive in?";
    }
    if (message == "Yes, I'm ready") {
      setCurrentChatStage(3);
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
    if (message == "No") {
      response =
        "No problem, I understand that estate planning can be a lot to think about. Is there something specific you'd like to discuss or any concerns you have that I can address?";
      setNextResponse(
        "Great! Here are a few key considerations to keep in mind while planning your estate. I’ll ask you some questions to get a better understanding of your specific needs and goals."
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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

  const handleButtonStage15Financial = async (message: any) => {
    let response = "";

    if (message == "Yes" || message == "No") {
      response =
        "Do you own a business? If so, how important is it to you that your estate plan protects your business interests, especially in terms of its continuation if you were to pass away or become disabled?";
    }
    if (message == "Not sure, tell me more") {
      response =
        "Flexibility in an estate plan means it can be adjusted without major legal hurdles if your circumstances change. For instance, if tax laws change or you acquire new assets, a flexible plan allows for these updates to ensure your wishes are still carried out effectively. This can save time, reduce legal costs, and provide peace of mind knowing your plan remains relevant. Does that make sense, or would you like more details?";
    }

    setUserName("Mark Jol");
    await saveUserProfile({ estatePlanFlexibility: message });
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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

  const handleButtonStage16Business = async (message: any) => {
    let response = "";

    if (message == "Not Important") {
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
    await saveUserProfile({ businessProtectionImportance: message });
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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

    if (message == "Not Important") {
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

  const handleButtonStage18Component = async (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "To prevent any cash shortfall in your estate, how important is it to have provisions in place for your dependants' maintenance? For instance, would you want to ensure there’s enough capital to cover any immediate expenses and ongoing support for your dependants?";
    }

    if (message == "Yes") {
      response =
        "To prevent any cash shortfall in your estate, how important is it to have provisions in place for your dependants' maintenance? For instance, would you want to ensure there’s enough capital to cover any immediate expenses and ongoing support for your dependants?";

      await saveUserProfile({ insolvencyProtectionConcern: "Yes" });
    }
    if (message == "No") {
      response =
        "To prevent any cash shortfall in your estate, how important is it to have provisions in place for your dependants' maintenance? For instance, would you want to ensure there’s enough capital to cover any immediate expenses and ongoing support for your dependants?";
      await saveUserProfile({ insolvencyProtectionConcern: "No" });
    }
    if (message == "Maybe") {
      response =
        "It's understandable to be uncertain about this. Protecting assets from potential insolvency can be crucial for maintaining financial stability. Here are some points to consider";
      await saveUserProfile({ insolvencyProtectionConcern: "Maybe" });
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage19Capital = async (message: any) => {
    let response = "";

    if (message == "Not Important") {
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
    await saveUserProfile({ dependentsMaintenanceImportance: message });

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage20Final = (message: any) => {
    let response = "";

    if (message == "Yes, I have a question") {
      response = "I’m here to help! Feel free to ask any questions you have.";
      setNextResponse(
        "Let’s dive into the details of what you own to ensure we have a comprehensive understanding of your estate. Your assets play a crucial role in your estate plan."
      );
      isResponse.current = "1";
      setCurrentChatStage(4);
    }
    if (message == "No") {
      setCurrentChatStage(4);
      response =
        "Let’s dive into the details of what you own to ensure we have a comprehensive understanding of your estate. Your assets play a crucial role in your estate plan.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStageProceedLearning = async (message: any) => {
    if (!isEstatePlanningTabOpen) {
      setEstatePlanningTabOpenv1(true);
      setEstatePlanningTabOpen(true);
      setStartTab(true);
    }
    // Set the focus to the Estate Planning tab
    setActiveTab("estatePlanning");
    if (isStartTab == false) {
      handleButtonStage0("Absolutely");
    }
  };

  const handleButtonStage21Asset = async (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan.";
      await saveUserProfile({
        realEstateProperties: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response = "Great! Please provide the above mentioned details.";
    }
    if (message == "No, let’s move on") {
      response =
        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan.";
    }
    if (message == "I’m unsure of the details") {
      response =
        "To help you estimate the value of your property, let’s go through a few simple steps. This will give you a rough idea of what your property could be worth.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage20Payable = async (message: any) => {
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
    await saveUserProfile({ taxMinimizationPriority: "Maybe" });

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage20 = async (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Thanks for sharing your thoughts, " +
        userName +
        ". It’s important to have a clear understanding of your objectives so we can tailor your estate plan to meet your needs. Is there anything else you’d like to add before we move on?";
    }
    if (message == "No") {
      response =
        "Thanks for sharing your thoughts, " +
        userName +
        ". It’s important to have a clear understanding of your objectives so we can tailor your estate plan to meet your needs. Is there anything else you’d like to add before we move on?";
    }
    await saveUserProfile({ estatePlanReviewConfidence: message });

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage22Farm = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?";
      await saveUserProfile({
        farmProperties: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of the farm";
    }
    if (message == "No, let’s move on") {
      response =
        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage22Vehicle = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?";
      await saveUserProfile({
        vehicleProperties: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your vehicle with their estimated values.";
    }
    if (message == "No, let’s move on") {
      response =
        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage23Jewelry = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan.?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan.?";
      await saveUserProfile({
        valuablePossessions: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your valuable possessions";
    }
    if (message == "No, let’s move on") {
      response =
        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan.?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage24Household = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment.";
      await saveUserProfile({
        householdEffects: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your household";
    }
    if (message == "No, let’s move on") {
      response =
        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage25Portfolio = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account.";
      await saveUserProfile({
        investmentPortfolio: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }

    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your investment portfolio";
    }
    if (message == "No, let’s move on") {
      response =
        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage25Cash = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value.";
      await saveUserProfile({
        bankBalances: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your cash savings or deposits in bank accounts";
    }
    if (message == "No, let’s move on") {
      response =
        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage26BusinessInterest = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values.";
      await saveUserProfile({
        businessAssets: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your business interest";
    }
    if (message == "No, let’s move on") {
      response =
        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage27SignificantAssets = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset.";
      await saveUserProfile({
        otherAssets: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your significant assets";
    }
    if (message == "No, let’s move on") {
      response =
        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage28Intellectual = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within.";
      await saveUserProfile({
        intellectualPropertyRights: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your intellectual property rights";
    }
    if (message == "No, let’s move on") {
      response =
        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage29LegalEntities = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      setCurrentChatStage(4);
      response =
        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged.";
    }
    if (message == "Upload Document at End of Chat") {
      setCurrentChatStage(4);
      response =
        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged.";
      await saveUserProfile({
        assetsInTrust: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your legal entities";
    }
    if (message == "No, let’s move on") {
      setCurrentChatStage(4);
      response =
        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage30Mortgage = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan.";
      await saveUserProfile({
        outstandingMortgageLoans: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your outstanding mortgage loan";
    }
    if (message == "No, let’s move on") {
      response =
        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage31PersonalLoan = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card.";
      await saveUserProfile({
        personalLoans: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your current personal loan";
    }
    if (message == "No, let’s move on") {
      response =
        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage32CreditCardDebt = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed.";
      await saveUserProfile({
        creditCardDebt: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your credit card debt";
    }
    if (message == "No, let’s move on") {
      response =
        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage33VehicleLoan = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount.";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount.";
      await saveUserProfile({
        vehicleLoans: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your vehicle loan23443234";
    }
    if (message == "No, let’s move on") {
      response =
        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage34OutstandingDebt = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Do you have a strategy in place for managing and reducing your liabilities over time?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Do you have a strategy in place for managing and reducing your liabilities over time?";
      await saveUserProfile({
        otherOutstandingDebts: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your outstanding debt";
    }
    if (message == "No, let’s move on") {
      response =
        "Do you have a strategy in place for managing and reducing your liabilities over time?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage35Strategy = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Are there any significant changes expected in your liabilities in the foreseeable future?";
    }
    if (message == "Upload Document at End of Chat") {
      response =
        "Are there any significant changes expected in your liabilities in the foreseeable future?";
      await saveUserProfile({
        strategyLiabilities: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your strategy";
    }
    if (message == "No, let’s move on") {
      response =
        "Are there any significant changes expected in your liabilities in the foreseeable future?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage36SignificantChanges = async (message: any) => {
    let response = "";
    if (message == "Continue") {
      setCurrentChatStage(5);
      response =
        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features.";
    }
    if (message == "Upload Document at End of Chat") {
      setCurrentChatStage(5);
      response =
        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features.";
      await saveUserProfile({
        foreseeableFuture: {
          uploadDocumentAtEndOfChat: true,
        },
      });
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above mentioned details of your significant changes expected in your liabilities";
    }
    if (message == "No, let’s move on") {
      setCurrentChatStage(5);
      response =
        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Are you covered by any health insurance policies/plans that is not a Medical Aid? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };
  const handleButtonStage41DisabilitySecurity = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Do you have contingent liability insurance to cover unexpected liabilities that may arise?";
    }

    if (message == "Yes") {
      response =
        "Great, I will have one of our financial advisers get in touch regarding obtaining disability insurance";
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
      setNextResponse(
        "Do you have any other types of insurance not already covered? Please provide details about the type of coverage and the insurance provider."
      );
      isResponse.current = "1";
    }
    if (message == "Unsure") {
      response =
        "Key person insurance provides financial support to your business if a key employee, whose expertise and skills are critical to the company's success, passes away or becomes disabled. It can help cover the cost of finding and training a replacement, as well as mitigate potential financial losses. If you think this could benefit your business, consider discussing it further with our financial adviser to ensure your business is protected.";
      setNextResponse(
        "Do you have any other types of insurance not already covered? Please provide details about the type of coverage and the insurance provider."
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Great! Please provide the above mentioned details of your insurance policies";
      //Great! Please provide the above mentioned details
    }
    if (message == "No, let’s move on") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage46Continue = (message: any) => {
    let response = "";
    if (message == "Yes") {
      setCurrentChatStage(5);
      response =
        "Understanding your investment holdings helps us assess your overall financial position and develop strategies to maximise the value of your estate. Please provide as much detail as possible for each of the following questions.";
    }

    if (message == "No") {
      setCurrentChatStage(5);
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Understanding your investment holdings helps us assess your overall financial position and develop strategies to maximise the value of your estate. Please provide as much detail as possible for each of the following questions."
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage53SpecificChanges = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response = "Great! Next, we’ll discuss estate duty. Shall we continue?";
      setCurrentChatStage(6);
    }
    if (message == "Yes") {
      response = "Great! Next, we’ll discuss estate duty. Shall we continue?";
      setCurrentChatStage(6);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage54Final = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "The tax on the total value of your estate if you were to pass away today with your current will or distribution wishes in place. Understanding this helps us ensure your estate plan minimises taxes and maximises what is passed on to your heirs. Ready to get started?";
    }
    if (message == "No") {
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "The tax on the total value of your estate if you were to pass away today with your current will or distribution wishes in place. Understanding this helps us ensure your estate plan minimises taxes and maximises what is passed on to your heirs. Ready to get started?"
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage62Bequeathed = (message: any) => {
    let response = "";

    if (message == "Yes") {
      firstTip.current = 1;
      response =
        "<strong>💡 USEFUL TIP:</strong><br/> For estate duty: When farms are bequeathed (whether to trust or natural person) and the farm was used for bona fide farming purposes, the market value less 30% is included as the value of the farm for estate duty purposes.";
    }
    if (message == "No" && maritalStatus == "Married") {
      response =
        "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?";
    }
    if (message == "No" && maritalStatus != "Married") {
      response =
        "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage63AssetsManaged = (message: any) => {
    let response = "";

    response =
      "Certain third parties may be responsible for estate duty based on the assets they receive. Do you have any specific instructions or details about third-party liability for estate duty in your current will?";

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage64ThirdParties = (message: any) => {
    let response = "";

    if (message == "Yes, I have it in my current will") {
      response =
        "USEFUL TIP: If your spouse were to pass away immediately after you, there are specific estate duty implications and/or arrangements you would need to consider? All the more reason to get in touch with our Financial Advisors. This will be noted and added to the report supplied to you at the end of this chat.";
    }
    if (message == "No, I have not included specific instructions") {
      response =
        "Understood. It's crucial to consider this aspect carefully. Would you like to discuss potential options for addressing third-party liability in your estate plan?";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage65Stages = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response =
        "Great, one of our financial advisers will be in touch in this regard.";
    }
    if (message == "No") {
      response =
        "Great, one of our financial advisers will be in touch in this regard.";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Great! Next, we’ll look at the executor’s fees. Shall we continue?";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage66EstateDutyCurrentWillFinal = (message: any) => {
    let response = "";

    if (message == "Yes") {
      setCurrentChatStage(6);
      response =
        "Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated.";
    }
    if (message == "No") {
      setCurrentChatStage(6);
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated."
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage67ExecutorFee = (message: any) => {
    let response = "";

    if (message == "Continue") {
      response =
        "Remember, no executor’s fees are payable on proceeds from policies with a beneficiary nomination, as these are paid directly to the nominated beneficiary by the insurance company. Do you have any such policies?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage68Payable = (message: any) => {
    let response = "";

    if (message == "Yes, specify") {
      response = "Great! Please provide the policy details.";
    }

    if (message == "No") {
      response =
        "Thank you for providing these details, " +
        userName +
        ". Now, we can move on to the next part of your estate planning. Ready to continue?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage69ExecutorFinal = (message: any) => {
    let response = "";

    if (message == "Yes") {
      setCurrentChatStage(7);
      response =
        "Now, let's talk about the liquidity position of your estate. This helps us understand if there are enough liquid assets available to cover estate costs without having to sell off assets. Ready to proceed?";
    }

    if (message == "No") {
      setCurrentChatStage(7);
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Now, let's talk about the liquidity position of your estate. This helps us understand if there are enough liquid assets available to cover estate costs without having to sell off assets. Ready to proceed?"
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage73FinancialImpact = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?";
    }
    if (message == "Yes") {
      response =
        "Great! Our financial advisers at Old Mutual can help you and your heirs understand the financial implications and create a fair strategy. They can assist in evaluating each heir’s ability to contribute, ensure clear communication among all parties, and develop a plan that respects everyone's circumstances. We'll include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Absolutely! When facing a shortfall, selling assets isn't the only option available. Alternative financing strategies, such as securing loans against estate assets, negotiating payment terms with creditors, or utilising existing insurance policies, can provide additional flexibility without compromising your long-term goals for asset distribution. Each option comes with its own set of considerations and implications, so it's essential to weigh them carefully. Our financial advisers can help you set this up.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage77FinancialRisk = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route?";
    }
    if (message == "Yes") {
      response = "Great! Here are some important aspects to consider:";
    }
    if (message == "No") {
      response =
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage79LiquidityEnd = (message: any) => {
    let response = "";
    if (message == "Yes") {
      setCurrentChatStage(8);
      response =
        "Let's discuss maintenance claims in terms of court orders. If you pass away while there are maintenance obligations towards children or a former spouse, they will have a maintenance claim against your estate. Are you aware of any existing maintenance obligations or court orders?";
    }
    if (message == "No") {
      setCurrentChatStage(8);
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Let's discuss maintenance claims in terms of court orders. If you pass away while there are maintenance obligations towards children or a former spouse, they will have a maintenance claim against your estate. Are you aware of any existing maintenance obligations or court orders?"
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Have you considered the cost of education and taken that into account regarding maintenance?";
    }
    if (
      message ==
      "I haven’t considered maintenance claims in relation to my estate planning"
    ) {
      response =
        "It's essential to assess any potential maintenance claims in relation to your estate to avoid unexpected complications for your heirs. Even if you haven't formalised maintenance obligations through court orders or agreements, they may still arise based on legal obligations. Would you like assistance in evaluating and addressing any potential maintenance claims in your estate planning?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage81Obligations = (message: any) => {
    let response = "";
    if (message == "Upload Document at End of Chat") {
      response =
        "Have you considered the cost of education and taken that into account regarding maintenance?";
    }
    if (message == "Yes, specify detail") {
      response =
        "Great! Please provide the above-mentioned details about your life insurance policy and how it will be payable to the testamentary trust.";
    }
    if (message == "No, let’s move on") {
      response =
        "Have you considered the cost of education and taken that into account regarding maintenance?";
    }
    if (message == "Continue") {
      response =
        "Have you considered the cost of education and taken that into account regarding maintenance?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage81Agreements = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Have you considered the cost of education and taken that into account regarding maintenance?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about life insurance policy in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Have you considered the cost of education and taken that into account regarding maintenance?";
    }
    if (message == "Maybe") {
      response =
        "No problem. Whenever you're ready to provide the details about life insurance policy, just let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage81Complications = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Have you considered the cost of education and taken that into account regarding maintenance?";
    }
    if (message == "Yes") {
      response =
        "We'll include this information about life insurance policy in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Have you considered the cost of education and taken that into account regarding maintenance?";
    }
    if (message == "Maybe") {
      response =
        "No problem. Whenever you're ready to provide the details about life insurance policy option, just let me know.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };
  const handleButtonStage82LifeInsurancev1 = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }
    if (message == "No") {
      response =
        "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage83Proactive = (message: any) => {
    let response = "";
    if (message == "Continue") {
      if (maritalStatus == "Married") {
        response =
          "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?";
      } else {
        setCurrentChatStage(9);
        response =
          "Do your dependents require any income per month for maintenance?";
      }
    }
    if (message == "I have set up a policy") {
      if (maritalStatus == "Married") {
        response =
          "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?";
      } else {
        setCurrentChatStage(9);
        response =
          "Do your dependents require any income per month for maintenance?";
      }
    }
    if (message == "I need assistance in setting up a policy") {
      response =
        "We will include information about assistance with setting up a policy in the report that will be shared at the end of this conversation.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage83Passing = (message: any) => {
    let response = "";
    if (message == "No") {
      if (maritalStatus == "Married") {
        response =
          "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?";
      } else {
        response =
          "Do your dependents require any income per month for maintenance?";
          setCurrentChatStage(9);
      }
    }
    if (message == "Continue") {
      if (maritalStatus == "Married") {
        response =
          "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?";
      } else {
        response =
          "Do your dependents require any income per month for maintenance?";
          setCurrentChatStage(9);
      }
    }
    if (message == "Yes") {
      response =
        "Setting up a life insurance policy payable to a testamentary trust can ensure that maintenance obligations are met without burdening your estate. This approach provides a reliable income stream for your beneficiaries. Our financial advisers at Old Mutual can provide detailed guidance and help you explore this option further.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage84OptionProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }
    if (message == "Yes") {
      response =
        "Providing for your surviving spouse can be done through various means, such as setting up a trust, designating life insurance benefits, or specifying direct bequests in your will. Our financial advisers at Old Mutual can guide you through these options to find the best solution for your needs. We will include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage84CrucialProvision = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }
    if (message == "Yes") {
      response =
        "Incorporating provisions for your surviving spouse can be an essential part of a comprehensive estate plan. Understanding the legal and financial implications will help you make an informed decision. Our financial advisers at Old Mutual can provide you with the necessary information and advice. We will include this information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "In the event of your passing, how much income would your spouse/family/dependants need per month for their maintenance after tax and deductions?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage85MaintenanceProvision = (message: any) => {
    let response = "";
    if (
      message == "Insurance policy with my spouse as the nominated beneficiary"
    ) {
      response =
        "Do your dependents require any income per month for maintenance?";
        setCurrentChatStage(9);
    }
    if (message == "Testamentary trust for spouse outlines in my will") {
      response =
        "Do your dependents require any income per month for maintenance?";
        setCurrentChatStage(9);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage85BenefitProvision = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response = "Great! Here’s a brief overview of each option:";
    }
    if (message == "No") {
      response =
        "Do your dependents require any income per month for maintenance?";
        setCurrentChatStage(9);
    }
    if (message == "Continue") {
      response =
        "Do your dependents require any income per month for maintenance?";
        setCurrentChatStage(9);
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage86DeeperProvision = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response = "Great! Here’s a brief overview of each option:";
    }
    if (message == "No") {
      response =
        "Do your dependents require any income per month for maintenance?";
        setCurrentChatStage(9);
    }
    if (message == "Continue") {
      response =
        "Do your dependents require any income per month for maintenance?";
        setCurrentChatStage(9);
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        setCurrentChatStage(9);
    }
    if (message == "Continue") {
      response =
        "Do your dependents require any income per month for maintenance?";
        setCurrentChatStage(9);
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage87ShortFall = (message: any) => {
    let response = "";
    if (
      message ==
      "I have capital available to generate an income for my dependents"
    ) {
      response =
        "Additional life insurance can provide the capital required for the income needs of dependents. Do you have any life insurance that is linked to a purpose, i.e. Mortgage / bond life cover etc?";
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage87Capital = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Additional life insurance can provide the capital required for the income needs of dependents. Do you have any life insurance that is linked to a purpose, i.e. Mortgage / bond life cover etc?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about your financial situation and any necessary adjustments in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Additional life insurance can provide the capital required for the income needs of dependents. Do you have any life insurance that is linked to a purpose, i.e. Mortgage / bond life cover etc?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage87Planning = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Additional life insurance can provide the capital required for the income needs of dependents. Do you have any life insurance that is linked to a purpose, i.e. Mortgage / bond life cover etc?";
    }
    if (message == "Yes") {
      response =
        "We'll include this financial planning information in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Additional life insurance can provide the capital required for the income needs of dependents. Do you have any life insurance that is linked to a purpose, i.e. Mortgage / bond life cover etc?";
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
        "Additional life insurance can provide the capital required for the income needs of dependents. Do you have any life insurance that is linked to a purpose, i.e. Mortgage / bond life cover etc?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about your financial situation and strategies in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Additional life insurance can provide the capital required for the income needs of dependents. Do you have any life insurance that is linked to a purpose, i.e. Mortgage / bond life cover etc?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage88Additionalv1 = (message: any) => {
    let response = "";
    if (message == "Yes, specify details") {
      response =
        "Great! Please provide the above mentioned details about life insurance.";
    }
    if (message == "No, let's move on") {
      response =
        "Have you considered obtaining additional life insurance for providing capital required for income needs of dependents?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage89Final = (message: any) => {
    let response = "";
    if (message == "Yes") {
      setCurrentChatStage(10);
      response =
        "Next, let's talk about trusts. A trust is is a legal arrangement where one person (the trustee) holds and manages assets on behalf of another person or group (the beneficiaries). The person who created the trust is called the settlor. The trustee is responsible for managing the trust according to the terms set by the settlor, ensuring the assets benefit the beneficiaries. Are you familiar with trusts?";
    }
    if (message == "No") {
        setCurrentChatStage(10);
      response = "Absolutely! I'm here to assist. What would you like to ask?";
      setNextResponse(
        "Next, let's talk about trusts. A trust is is a legal arrangement where one person (the trustee) holds and manages assets on behalf of another person or group (the beneficiaries). The person who created the trust is called the settlor. The trustee is responsible for managing the trust according to the terms set by the settlor, ensuring the assets benefit the beneficiaries. Are you familiar with trusts?"
      );
      isResponse.current = "1";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage90NominateFuneralCover = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage90BeneficiaryFuneralCover = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }
    if (message == "Yes") {
      response =
        "We will include this information about nominating a beneficiary on your funeral cover policy in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage90AssistanceFuneralCover = (message: any) => {
    let response = "";

    if (message == "Yes") {
      response = "Here’s an outline of the benefits of funeral cover:";
    }
    if (message == "No") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage90ImmediateFuneralCover = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }
    if (message == "Yes") {
      response =
        "We will include details on tailoring funeral cover to your needs or finding a suitable policy in the report shared at the end of this conversation.";
    }
    if (message == "No") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage90specificsFuneralCover = (message: any) => {
    let response = "";
    if (message == "Yes, I have a question") {
      response =
        "Sure, I’m here to help. What additional information or questions do you have?";
      setNextResponse(
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?"
      );
      isResponse.current = "1";
    }

    if (message == "No") {
      response =
        "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage92Vivos = (message: any) => {
    let response = "";
    if (message == "Yes, I have considered setting up a trust") {
      response =
        "Yes, I have considered setting up a trustTrusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?";
    }
    if (message == "No, I haven’t thought about setting up a trust yet") {
      response =
        "Setting up a trust can be a valuable component of your estate plan, providing various benefits such as asset protection, wealth preservation, and efficient distribution of assets to beneficiaries. Would you like more information on how trusts can benefit your specific situation?";
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage92Setting = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
        "Addressing specific concerns or questions about setting up a trust is crucial for making informed decisions about your estate plans. Whether you're unsure about the process, concerned about potential implications, or have questions about trust administration, I'm here to provide guidance and support. Feel free to share your concerns, and we can discuss them further.";
    }
    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage96Strategy = (message: any) => {
    let response = "";
    if (message == "Yes") {
      response =
        "Next, let's talk about selling assets to the trust. This can be a strategic way to remove assets from your estate. However, it’s important to note that a loan account is not automaticaaly created unless there’s a difference between the sale price and the value of the asset. Have you considered selling assets to the trust in this way?";
    }
    if (message == "No") {
      response =
        "Donations tax is a tax imposed on the transfer of assets to a trust or to any person (for example individuals, company or trust that is a SA tax resident) without receiving adequate consideration in return. It's important to understand that while transferring assets to a trust can help reduce estate duty, it may trigger donations tax liabilities. The amount of donations tax payable depends on several factors, including the value of the assets transferred, any available exemptions or deductions, and the relationship between the donor and the recipient. The donations tax threshold is R100 000 per year.";
    }
    if (message == "Tell me more") {
      response =
        "Donations tax is a tax imposed on the transfer of assets to a trust or to any person (for example individuals, company or trust that is a SA tax resident) without receiving adequate consideration in return. It's important to understand that while transferring assets to a trust can help reduce estate duty, it may trigger donations tax liabilities. The amount of donations tax payable depends on several factors, including the value of the assets transferred, any available exemptions or deductions, and the relationship between the donor and the recipient. The donations tax threshold is R100 000 per year.";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage97Donation = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Next, let's talk about selling assets to the trust. This can be a strategic way to remove assets from your estate. However, it’s important to note that a loan account is not automaticaaly created unless there’s a difference between the sale price and the value of the asset. Have you considered selling assets to the trust in this way?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage98Assets = (message: any) => {
    let response = "";
    if (message == "Continue") {
      response =
        "Selling assets to the trust might reduce estate duty, but a sale agreement should be in place if a loan account is to be created. Are you familiar with the terms and conditions of such agreements?";
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage99Selling = (message: any) => {
    let response = "";
    if (message == "Yes, I am familiar") {
      response =
        "Selling assets to a trust can be a strategic way to transfer assets out of your estate, potentially reducing estate duty and protecting your wealth. However, it’s important to consider the potential tax implications, such as capital gains tax and transfer duty, and whether a loan account will actually be created. If you’re interested in exploring this option further, we can dive into the specifics and see how it aligns with your overall estate planning goals.";
    }
    if (message == "Continue") {
      response =
        "Lastly, let's discuss the costs and tax consequences of transferring assets to a trust. This may include capital gains tax, transfer duty (for immovable property), and possible donations tax. Have you taken these factors into account?";
    }
    if (message == "I have some understanding but need more clarity") {
      response =
        "It’s great that you have some understanding of sale agreements. These agreements outline the sale terms and the loan's repayment terms if a loan account is created. If you need more clarity or have questions about specific aspects of these agreements, feel free to ask. I’m here to help provide additional information and support your understanding.";
    }
    if (
      message == "I need assistance in understanding the terms and conditions"
    ) {
      response =
        "Sale agreements can be complex, especially when transferring assets to a trust. These agreements detail the sale transaction and the loan terms, if applicable. If you need help understanding these terms and conditions, or have questions about how they apply to your situation, I’m here to provide guidance and support.";
    }
    if (
      message ==
      "I prefer not to engage in agreements that involve selling assets to a trust"
    ) {
      response =
        "Lastly, let's discuss the costs and tax consequences of transferring assets to a trust. This may include capital gains tax, transfer duty (for immovable property), and possible donations tax. Have you taken these factors into account?";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage99Final = (message: any) => {
    let response = "";
    if (message == "Continue") {
        setCurrentChatStage(10);
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
        setCurrentChatStage(10);
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage101InvestmentFlexibility = (message: any) => {
    let response = "";
    if (message == "Continue") {
        setCurrentChatStage(11);
      response =
        "We’ve now gathered all the relevant information to help create your estate plan. As one of the final steps, please upload the documents below. <br/><br/>These will be securely stored and only shared with the financial adviser who will assist you in finalising your estate plan.";
    }
    if (message == "Yes") {
        setCurrentChatStage(11);
      response =
        "We’ve now gathered all the relevant information to help create your estate plan. As one of the final steps, please upload the documents below. <br/><br/>These will be securely stored and only shared with the financial adviser who will assist you in finalising your estate plan.";
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
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStage101Final = (message: any) => {
    let response = "";
    if (message == "Yes, I have a question") {
      response =
        "Thanks! Do you have anything you’d like to add or any questions that I can help you with today?";
      setNextResponse(
        "Thanks for your time today, " +
          userName +
          ". Your information will be reviewed by an Old Mutual financial adviser, and you can expect to hear back soon with your estate plan. Have a great day, and we’re looking forward to helping you secure your future!"
      );
      isResponse.current = "1";
    }
    if (message == "No") {
      response =
        "Thanks for your time today, " +
        userName +
        ". Your information will be reviewed by an Old Mutual financial adviser, and you can expect to hear back soon with your estate plan. Have a great day, and we’re looking forward to helping you secure your future!";
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
  };

  const handleButtonStageDownloadReport = (message: any) => {
    let response = "";

    if (message == "Download Report") {
      response =
        "Thanks, " +
        userName +
        ". Do you have anything you would like to add or any questions that I can help you with today?";
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
  const handleButtonStage101FinalUpload = (message: any) => {
    let response = "";

    if (message === "Continue") {
      response = "Thank you for uploading your documents!";
    } else {
      // Trigger file input click to allow the user to upload a file
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".pdf,.doc,.docx"; // You can limit the file types here

      // Handle file selection
      fileInput.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          // Simulate file upload process (you can integrate an actual upload API here)
          console.log("Uploading file:", file.name);
          response = `File "${file.name}" uploaded successfully!`;

          // Append the assistant response for successful upload
          const aiMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: response,
          };

          // Update the messages
          setMessages([...messages, aiMessage]);
        } else {
          response = "No file selected!";
          const aiMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: response,
          };
          setMessages([...messages, aiMessage]);
        }
      };

      // Programmatically trigger the file input click to open the file picker
      fileInput.click();

      return; // Stop further execution in the else block
    }

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: response,
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
      name: "Mark Jol", // Ensure the user's name is always included
      deletionRequest: deletionRequestData || "",
      dateCreated: dateC || "", // Ensure dateCreated is included if it's a new profile
      dateOfBirth: dateOfBirth || "",
      emailAddress: userEmail || "",
      dependentsOver: dependentsOver || "",
      dependentsUnder: dependentsUnder || "",
      propertyRegime: propertyRegime || "",
      encryptedName: encryptedName || "",
      checkboxes: checkboxes || {},
      checkboxesAsset: checkboxesAsset || {},
      maritalStatus: maritalStatus || "",

      ObjectivesOfEstatePlanning: {
        estatePlanFlexibility: "N/A", // Default or fetched from profile
        businessProtectionImportance: "N/A", // Default or fetched
        financialSafeguardStrategies: "N/A", // Default or fetched
        insolvencyProtectionConcern: "N/A", // Default or fetched
        taxMinimizationPriority: "N/A", // Default or fetched
        estatePlanReviewConfidence: "N/A", // Default or fetched
        ...update.ObjectivesOfEstatePlanning, // Merge new updates
      },
      ...update, // Other fields to be updated
    };

    // Don't include `dateCreated` in updates, unless it's a new profile

    while (retries < MAX_RETRIES) {
      try {
        // Post or update the profile
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
          "Before we start the chat, we want to ensure you’re comfortable with us collecting and storing your personal information securely. This data will only be used to help create your estate plan. Do you consent to this?",
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
    none: false,
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
  const handleCheckboxChangeTerms = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const term = event.target.value;
    if (selectedTerms.includes(term)) {
      setSelectedTerms(selectedTerms.filter((item) => item !== term));
    } else {
      setSelectedTerms([...selectedTerms, term]);
    }
  };

  // Handle checkbox change
  const handleCheckboxChangeScenario = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const Scenario = event.target.value;
    if (selectedScenario.includes(Scenario)) {
      setSelectedScenario(selectedScenario.filter((item) => item !== Scenario));
    } else {
      setSelectedScenario([...selectedScenario, Scenario]);
    }
  };
  const [financialSafeguardStrategiesv2, setFinancialSafeguardStrategiesv2] =
    useState("");
  // Handle checkbox change
  const handleCheckboxChangeStrategies = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const strategy = event.target.value;

    // Update the selected strategies
    let updatedStrategies;
    if (selectedStrategies.includes(strategy)) {
      updatedStrategies = selectedStrategies.filter(
        (item) => item !== strategy
      );
    } else {
      updatedStrategies = [...selectedStrategies, strategy];
    }

    // Update the state with the latest selected strategies
    setSelectedStrategies(updatedStrategies);

    // Convert the updated strategies array to a comma-separated string
    const strategiesString = updatedStrategies.join(", ");
    setFinancialSafeguardStrategiesv2(strategiesString);
    // Save the updated strategies as a comma-separated string to the user profile
    await saveUserProfile({ financialSafeguardStrategies: strategiesString });
  };

  const handleCheckboxChangeStrategiesv2 = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const Strategiesv2 = event.target.value;
    if (selectedStrategiesv2.includes(Strategiesv2)) {
      setSelectedStrategiesv2(
        selectedStrategiesv2.filter((item) => item !== Strategiesv2)
      );
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

    // Create a copy of updatedCheckboxes for updating InputStr
    const updatedForDisplay: { [key: string]: boolean } = {
      ...updatedCheckboxes,
    };

    // Change 'factualDependents' key to 'Factual Dependents' in the display data
    if (id === "factualDependents") {
      updatedForDisplay["Factual Dependents"] =
        updatedForDisplay["factualDependents"];
      delete updatedForDisplay["factualDependents"]; // Safely remove key now
    }

    setCheckboxes(updatedCheckboxes);
    if (id === "none") {
      noneDependents("none");
    } else {
      // Pass the modified object to updateInputStr for display
      updateInputStr(checkboxesAsset, updatedForDisplay);
    }

    // Save the original checkboxes state to the database (without display modifications)
    await saveUserProfile({ checkboxes: updatedCheckboxes });
  };

  const noneDependents = (message: any) => {
    let response = "";

    if (message == "none") {
      response =
        "Thank you for sharing, " +
        userName +
        ". Is there anything else you’d like to add about your personal particulars or any questions you have at this stage?";
    }
    setInputStr("");

    // Append the user message first (this simulates the user's selection being displayed on the right side)
    // const userMessage: Message = {
    //   id: Date.now().toString(), // Unique ID
    //   role: "user", // User message role
    //   content: message, // This will show what the user clicked (e.g., "Wills", "Trusts", etc.)
    // };

    // Then append the assistant response
    const aiMessage: Message = {
      id: Date.now().toString(), // Unique ID
      role: "assistant", // Assistant response role
      content: response, // Message content (the AI response)
    };

    // Append both the user message and AI response to the existing messages
    setMessages([...messages, aiMessage]);
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
    // Save the date of birth first
    await saveUserProfile({ dateOfBirth: message });

    // Extract the day, month, and year from the input date (10-3-2024)
    const [day, month, year] = message.split("-").map(Number);

    // Get the current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed
    const currentDay = currentDate.getDate();

    // Calculate age
    let age = currentYear - year;
    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
      age--; // Not had their birthday this year yet
    }

    // Check if age is below 18 and handle accordingly
    let response = "";
    if (age < 18) {
      response =
        "You are under 18 years old. We recommend you seek advice from a legal guardian or financial advisor before proceeding.";
    }

    if (response) {
      const aiMessage: Message = {
        id: Date.now().toString(), // Unique ID
        role: "assistant", // Assistant response role
        content: response, // Message content (the AI response)
      };

      // Append the AI response to the existing messages
      setMessages([...messages, aiMessage]);
    } else {
      handleAddAIResponse(
        "Let’s talk about your family life quickly. Are you married or single?"
      );
      setInputStr("");
    }
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
        none: false,
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
        estatePlanFlexibility: "N/A",
        businessProtectionImportance: "N/A",
        financialSafeguardStrategies: "N/A",
        insolvencyProtectionConcern: "N/A",
        dependentsMaintenanceImportance: "N/A",
        taxMinimizationPriority: "N/A",
        estatePlanReviewConfidence: "N/A",
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
    const activeMessages = isEstatePlanningTabOpen
      ? estatePlanningMessages
      : messages;

    return activeMessages.map((message, index) => {
      const isLastMessage = index === messages.length - 1;
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
          ref={isLastMessage ? lastMessageRef : null}
          className={message.role === "user" ? "text-white" : "text-white"}
        >
          <br />

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
              //AI CHAT BUBBLE IS HERE
              <div
                className={
                  message.role === "user"
                    ? "bg-[#8dc63f] text-white rounded-lg py-2 px-4 inline-block"
                    : "flex items-start mb-2 assistant-message"
                }
              >
                <p
                  className={
                    message.role === "user"
                      ? ""
                      : "bg-[#2f2f2f] text-white rounded-lg inline-block"
                  }
                  dangerouslySetInnerHTML={{
                    __html: filteredContent.replace(/<\|endoftext\|>/g, ""),
                  }}
                ></p>
              </div>
            )}

            {message.content.includes(
  "Hello and welcome to Moneyversity’s Estate Planning Consultant. I’m here to help you navigate the estate planning process with ease. Together, we’ll ensure your assets and wishes are well-documented and protected."
) && (
  <>
    <div className="space-x-2 ml-16 mt-2 -mb-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
      Here is what we will be able to achieve in this chat today: <br />
      <span className="number-emoji">1.)</span> I will ask you some basic questions about your personal circumstances to ensure we tailor your estate plan to suit your needs. <br />
      <span className="number-emoji">2.)</span> At the end of this chat, I will generate a report that you can share with a financial adviser to finalize your estate plan. <br />
      <span className="number-emoji">3.)</span> If you want to speak to a financial adviser during any point in our chat, there is a button that shows you how to get in touch with an adviser. <br />
      Ready to get started on this important journey? 🚀
    </div>
    <div className="space-x-2 ml-14">
      <br />
      <SelectableButtonGroup
        options={[
          "Absolutely",
          "Tell me more",
          "Not now",
        ]}
        handleSelection={handleButtonStage00}
      />
    </div>
  </>
)}

            

            {message.content.includes("Do you consent to this?") && (
              <div className="flex space-x-2 ml-16">
                <div className="space-y-2">
                  {/* Yes, I consent checkbox */}
                  <div
                    onClick={() => handleButtonConsent("Yes, I consent")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border cursor-pointer ${
                      consent === "Yes, I consent"
                        ? "bg-[#8DC63F] text-white border-transparent"
                        : "border-[#8DC63F] text-[#8DC63F] bg-transparent"
                    } w-full sm:w-[400px]`}
                  >
                    <input
                      type="checkbox"
                      id="consentYes"
                      name="consent"
                      value="Yes, I consent"
                      checked={consent === "Yes, I consent"}
                      className="custom-checkbox h-6 w-6 rounded-sm focus:ring-0"
                    />
                    <span className="ml-2">Yes, I consent</span>
                  </div>

                  <div
                    onClick={() => handleButtonConsent("No, I do not consent")}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md border cursor-pointer ${
                      consent === "No, I do not consent"
                        ? "bg-[#8DC63F] text-white border-transparent"
                        : "border-[#8DC63F] text-[#8DC63F] bg-transparent"
                    } w-full sm:w-[400px]`}
                  >
                    <input
                      type="checkbox"
                      id="consentNo"
                      name="consent"
                      value="No, I do not consent"
                      checked={consent === "No, I do not consent"}
                      className="custom-checkbox h-6 w-6 rounded-sm focus:ring-0"
                    />
                    <span className="ml-2">No, I do not consent</span>
                  </div>
                </div>
              </div>
            )}
            {message.content.includes(
              "Let’s dive into the world of estate planning!"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 -mb-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Estate planning is the process of arranging how your assets
                  will be managed and distributed after your death 🏡📜. It
                  ensures that your wishes are respected, your loved ones are
                  taken care of ❤️, and potential disputes are minimized ⚖️.{" "}
                  <br />
                  <br /> It’s important because it gives you peace of mind 🧘
                  knowing that your affairs are in order, and it can also help
                  reduce taxes and legal costs in the future 💰📉.
                </div>
                <div className="space-x-2 ml-14">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Tell me more",
                      // "Skip Estate Planning Explanation",
                    ]}
                    handleSelection={handleButtonStage1}
                  />
                </div>
              </>
            )}
            {questionResponse1 && (
              <div className="space-x-2 ml-16 mt-4">
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
                <button
                  onClick={() => handleButtonFunFact("Yes, I'm ready.")}
                  className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                >
                  Yes, I'm ready to move on.
                </button>
              </div>
            )}
            {questionResponseStage12 && (
              <div className="space-x-2 ml-16 mt-4">
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
                <div className="space-x-2 ml-16 mt-4">
                  <SelectableButtonGroup
                    options={["Yes, I’m ready to move on", "Skip"]}
                    handleSelection={handleButtonStage13v1}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "Let’s check out some examples to understand these options better. Here are a few examples we can simulate:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <b>Scenario 1</b>: 📜 How will setting up a trust affect the
                  management and distribution of your assets?
                  <br />
                  Setting up a trust can provide asset protection, control, and
                  tax benefits. It allows you to transfer assets to a trustee
                  who manages them according to the trust's terms. This can
                  ensure that your beneficiaries receive assets at appropriate
                  times, minimizing delays and potential conflicts in estate
                  administration.
                  <br />
                  <br />
                  <b>Scenario 2</b>: ⚖️ What happens if you pass away without a
                  will (intestate)?
                  <br />
                  If you pass away without a will, the Intestate Succession Act
                  will govern the distribution of your assets. This may not
                  align with your wishes and can result in assets being
                  distributed to heirs according to law, potentially leading to
                  disputes or unintended consequences.
                  <br />
                  <br />
                  <b>Scenario 3</b>: 🖋️ How will appointing a power of attorney
                  impact your estate during your lifetime?
                  <br />
                  Appointing a power of attorney allows someone you trust to
                  make decisions on your behalf if you become incapacitated.
                  This can cover financial, legal, and healthcare matters. It
                  ensures your estate and personal matters are managed according
                  to your wishes during your lifetime.
                  <br />
                  <br />
                  <b>Scenario 4</b>: 💼 What are the potential tax implications
                  of your estate planning decisions?
                  <br />
                  <br />
                  Choose a scenario you’d like to explore, and I’ll show you the
                  potential outcomes:
                  <br />
                </div>
                <br />
                <div className="space-x-2 ml-14 mt-1">
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
                  <br />
                  <SelectableButtonGroup
                    options={["Proceed"]}
                    handleSelection={handleProceedScenario}
                  />
                </div>
              </>
            )}

            {/* {message.content.includes("Do you have any other questions or need further information? I’m here to help!") && (
                <div className="space-x-2 ml-14">
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
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Would you like any assistance filling out any of these
                  templates?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
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
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Maybe"]}
                    handleSelection={handleButtonStage18Component}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Fantastic! Our financial advisers at Old Mutual are ready to assist you in filling out these templates. Please reach out to us directly to schedule a consultation and receive personalised guidance. Here’s how you can get in touch:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  • Phone: Call us at [insert phone number] to speak with an
                  adviser.
                  <br />
                  <br />• Email: Send us an email at [insert email address] with
                  your contact details, and we’ll get back to you promptly.
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
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
                  <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  <div className="space-x-2 ml-14">
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
                  <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  <div className="space-x-2 ml-14">
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
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Here are some templates to help you get started with your
                  estate planning documents:
                  <br />
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
                  A template for appointing a power of attorney.
                  <br />
                  💉 <b>Living Will: </b>
                  <br />
                  A template to specify your medical treatment preferences.
                  <br />
                  <br />
                  These templates are for your perusal, you can either fill them
                  in and share at the end of this chat or simply store the copy
                  for reference at any point in your estate planning journey.
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Download Will Template",
                      "Download Trust Template",
                      "Download Power of Attorney Template",
                      "Download Living Will Template",
                      "Download All Templates",
                      "Skip",
                    ]}
                    handleSelection={handleButtonStage14Template}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Now that we’ve covered your personal details, let’s talk about your objectives for estate planning. Understanding your goals will help us create a plan that fits your needs perfectly. Ready to dive in?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />

                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage15Component}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! Here are a few key considerations to keep in mind while planning your estate. I’ll ask you some questions to get a better understanding of your specific needs and goals."
            ) && (
              <>
                <br />
                <div className="space-x-2 -mt-4 ml-11 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Firstly, how important is it for your estate plan to be
                  flexible and adapt to changes in your personal, financial, and
                  legislative environment?
                  <br />
                  <br />
                  For example, would you want your plan to easily adjust if
                  there are changes in laws or your financial situation?
                </div>
                <>
                  <div className="space-x-2 ml-14 -mt-2">
                    <br />
                    <SelectableButtonGroup
                      options={["Yes", "No", "Not sure, tell me more"]}
                      handleSelection={handleButtonStage15Financial}
                    />
                  </div>
                </>
              </>
            )}

            {message.content.includes(
              "Flexibility in an estate plan means it can be adjusted without major legal hurdles if your circumstances change. For instance, if tax laws change or you acquire new assets, a flexible plan allows for these updates to ensure your wishes are still carried out effectively. This can save time, reduce legal costs, and provide peace of mind knowing your plan remains relevant. Does that make sense, or would you like more details?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />{" "}
                  <SelectableButtonGroup
                    options={["No", "Yes"]}
                    handleSelection={handleButtonStage15Financial}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you own a business? If so, how important is it to you that your estate plan protects your business interests, especially in terms of its continuation if you were to pass away or become disabled"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />{" "}
                  <BusinessImportanceSlider
                    onProceed={handleButtonStage16Business}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Please provide details of your arrangement."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["No, let's move on"]}
                    handleSelection={handleButtonStage17Strategies}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "What strategies and measures would you like to have in place to ensure the financial resources set aside for retirement are safeguarded, particularly regarding your business assets or investments?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-8">
                  <br /><br />
          {strategies.map((strategy) => (
  <div 
    key={strategy} 
    style={{
      position: 'relative', 
      marginBottom: '16px',
      display: 'flex',
      flexDirection: 'column',
      width: '400px' // Keep the width consistent
    }}
  >
    <label
      htmlFor={strategy}
      className={`flex items-center space-x-2 px-4 py-2 w-full rounded-md border cursor-pointer ${
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
      <span className="flex-1 leading-tight">{strategy}</span>
    </label>

    {/* Tooltip icon (placed outside the label but styled to appear inside) */}
    {strategy !== "Other" && strategy !== "Tell Me More About Each Option" && (
      <span
        onClick={(e) => {
          e.stopPropagation(); // Prevent the checkbox from being activated
          toggleTooltip(strategy);
        }}
        className="ml-auto cursor-pointer tooltip-icon"
        style={{
          position: 'absolute',
          right: '10px', // Position it on the right inside the label area
          top: '50%',
          transform: 'translateY(-50%)', // Center vertically
          cursor: 'pointer',
        }}
      >
        <Image
          src="/images/toolTip.png"
          alt="Tooltip Icon"
          width={20}
          height={20}
        />
      </span>
    )}

    {/* Tooltip box will appear below the button */}
    {openTooltip === strategy && (
      <div 
        style={{
          marginTop: '8px',
          backgroundColor: '#2D3748',
          color: 'white',
          padding: '8px',
          width: '400px',
          borderRadius: '8px',
          maxWidth: '400px',
          zIndex: 999,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          position: 'absolute',
          top: '-21%',
          left: '420px', // Align it to the right of the button
          textAlign: 'center' // Center the text inside the tooltip
        }}
      >
        {/* Tooltip content */}
        {tooltipData[strategy]}
      </div>
    )}
  </div>
))}


                  <br />
                  <SelectableButtonGroup
                    options={["Proceed"]}
                    handleSelection={handleProceedStrategy}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "That's okay! It can be overwhelming to decide on the best measures without more information. Here’s a brief overview to help you:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  🏦 <b>Establish a Trust:</b> <br />
                  Protects your assets and ensures they are distributed
                  according to your wishes.
                  <br />
                  🛡️ <b>Set Up Insurance Policies:</b> <br />
                  Provides financial security in case of unforeseen events.
                  <br />
                  📜 <b>Legal Agreements:</b> <br />
                  Formalizes arrangements to manage and protect your business
                  interests.
                  <br />
                  🤝 <b>Buy-Sell Agreement:</b> <br />
                  Ensures smooth transition and fair value if a business partner
                  exits.
                  <br />
                  🏢 <b>Contingent Liability Insurance:</b> <br />
                  Covers potential business liabilities.
                  <br />
                  📊 <b>Diversified Investment Strategy:</b> <br />
                  Spreads risk across different investments.
                  <br />
                  🔄 <b>Regular Financial Reviews:</b> <br />
                  Keeps your financial plan up to date with your current
                  situation.
                  <br />
                  💳 <b>Business Succession Plan:</b>
                  <br />A business strategy companies use to pass leadership
                  roles down to another employee or group of employees
                  <br />
                  🛡️ <b>Asset Protection Planning:</b> <br />
                  Safeguards your personal and business assets from risks.
                  <br />
                  🔄 <b>Separation of Personal & Business Finances:</b> <br />
                  Keeps your personal and business finances distinct to avoid
                  complications.
                  <br />
                  <br />
                  Would you like to discuss any of these options further, or do
                  you need more details on any specific measure?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />{" "}
                  {strategiesv2.map((strategyv2) => (
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

            {/* {message.content.includes(
                "When it comes to the administration of your estate after your passing, how important is it to you that the process is smooth and straightforward for your heirs?"
              ) && (
                <>
                  <div className="space-x-2 ml-14">
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
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  <br />✅ Keep a copy with a trusted person or legal adviser
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
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
                  <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  <div className="space-x-2 ml-14">
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
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  🏦 Trusts: Placing assets in a trust can shield them from
                  creditors.
                  <br />
                  🛡️ Insurance: Certain insurance policies can provide a safety
                  net.
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
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
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
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
                    onClick={() =>
                      handleButtonQuestion(
                        "Is there anything else you'd like to ask?"
                      )
                    }
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Is there anything else you'd like to ask?
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
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <BusinessImportanceSlider
                    onProceed={handleButtonStage19Capital}
                  />

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
                <div className="space-x-2 ml-16 mt-1 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Do you own any real estate properties, such as houses,
                  apartments, or land? If so, could you provide details about
                  each property, including location, estimated current market
                  value, outstanding mortgage amount (if any), and any
                  significant improvements made? 🏡
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                      "I’m unsure of the details",
                    ]}
                    handleSelection={handleButtonStage21Asset}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "To help you estimate the value of your property, let’s go through a few simple steps. This will give you a rough idea of what your property could be worth."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  First, please specify the type of property you have (e.g.
                  house, apartment, land).
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of any of your real estate, just let me know."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage21Asset}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "The estimated value of your property based on the information you provided is"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <strong>{valueProperty.current}</strong>
                  <br />
                  <b className="-ml-2">Please note</b> that this is a rough
                  estimate and should not be considered an official appraisal.
                  The actual value of your property may vary based on additional
                  factors such as market conditions, recent sales data, and
                  property- specific details not accounted for in this
                  calculation. For a precise valuation, we recommend consulting
                  a property appraiser or real estate agent
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Do you own a farm? Please provide details of the farm, such as
                  location, estimated value, and any notable items you would
                  like to include in your estate plan
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage22Farm}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage22Farm}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage22Vehicle}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage23Jewelry}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage24Household}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage25Portfolio}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage25Cash}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage26BusinessInterest}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage27SignificantAssets}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage28Intellectual}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage29LegalEntities}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage30Mortgage}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage31PersonalLoan}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage32CreditCardDebt}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage33VehicleLoan}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage34OutstandingDebt}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have a strategy in place for managing and reducing your liabilities over time?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage35Strategy}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are there any significant changes expected in your liabilities in the foreseeable future?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage36SignificantChanges}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage37LifeInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are you covered by any health insurance policies/plans that is not a Medical Aid? If so, please specify the type of coverage, the insurance provider, and any details about co-pays, deductibles, and coverage limits."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage38HealthInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are your properties, including your primary residence and any other real estate holdings, adequately insured? Please specify the insurance provider, coverage amount, and any additional coverage options"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage39HoldingsInsured}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are your vehicles insured? If yes, please specify the insurance provider, coverage type (e.g., comprehensive, liability), and any details about the insured vehicles."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage40VehicleInsured}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Disability insurance is crucial in case you're unable to work due to illness or injury. Do you currently have disability insurance?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Not Sure"]}
                    handleSelection={handleButtonStage41Disability}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Disability insurance can provide financial security if you’re unable to work due to illness or injury. It ensures that you have a source of income to cover living expenses and maintain your standard of living. Would you like more information or assistance in obtaining disability insurance and understanding its benefits?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
                    onClick={() => handleButtonStage41DisabilitySecurity("Yes")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleButtonStage41DisabilitySecurity("No")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    No
                  </button>
                </div>
              </>
            )}

            {message.content.includes(
              "Great, I will have one of our financial advisers get in touch regarding obtaining disability insurance"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
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
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Single Capital Lump Sum",
                      "Monthly Income Replacer",
                    ]}
                    handleSelection={handleButtonStage41DisabilityInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's important to note that the coverage you can take may be limited. Are you aware of any limitations on your disability insurance coverage?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No, I'm not aware", "I'm not sure."]}
                    handleSelection={handleButtonStage41DisabilityCoverage}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "I recommend reviewing your current disability insurance policy to understand any limitations it may have. Checking details like maximum benefit amounts, coverage duration, and specific conditions that are excluded will help ensure you have adequate protection. Please get back to me once you've reviewed your policy."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage41DisabilityCoverage}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have contingent liability insurance to cover unexpected liabilities that may arise?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "I'm not sure."]}
                    handleSelection={handleButtonStage41ContingentInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "I recommend considering contingent liability insurance as it can protect you against unexpected financial obligations. It’s especially useful if you've provided personal guarantees or securities for business obligations. Please think about whether this might be a valuable addition to your insurance portfolio and let me know if you have any questions or need assistance with this."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage41ContingentInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "If you own a business, have you considered buy and sell insurance to protect your business partners and family?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes",
                      "No, I don't have a business",
                      "No, I haven't considered it",
                      "Unsure",
                    ]}
                    handleSelection={handleButtonStage42BuyAndSell}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Buy and sell insurance is designed to ensure that, in the event of your death or disability, your business can continue to operate smoothly. It provides funds to your business partners to buy out your share, protecting both your family’s financial interests and the business’s continuity. It might be worth exploring this option to safeguard your business and your loved ones. Please review your current situation and get back to me if you have any questions or need further assistance."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage42BuyAndSell}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "For business owners, key person insurance can help the business survive the loss of a crucial employee. Do you have this in place?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Unsure"]}
                    handleSelection={handleButtonStage43BusinessOwner}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Key person insurance provides financial support to your business if a key employee, whose expertise and skills are critical to the company's success, passes away or becomes disabled. It can help cover the cost of finding and training a replacement, as well as mitigate potential financial losses. If you think this could benefit your business, consider discussing it further with our financial adviser to ensure your business is protected."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage43BusinessOwner}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have any other types of insurance not already covered? Please provide details about the type of coverage and the insurance provider."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage44InsuranceConvered}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Have you reviewed your insurance policies recently to ensure they align with your current needs and circumstances?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  {/* <button
                      onClick={() =>
                        handleButtonStage45ReviewedInsurance("Upload Document at End of Chat")
                      }
                      className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                    >
                      Upload Document at End of Chat
                    </button> */}
                  <SelectableButtonGroup
                    options={["Yes, specify detail", "No, let’s move on"]}
                    handleSelection={handleButtonStage45ReviewedInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your insurance policies"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage45ReviewedInsurance}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details about any other type of insurance you have, just let me know."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage44InsuranceConvered}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your vehicle insurance provider"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage40VehicleInsured}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your insurance provider"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage39HoldingsInsured}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your health insurance policies"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage38HealthInsurance}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your life insurance policies"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage37LifeInsurance}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your significant changes expected in your liabilities"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage36SignificantChanges}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your strategy"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage35Strategy}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your outstanding debt"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage34OutstandingDebt}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your vehicle loan"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage33VehicleLoan}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your credit card debt"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage32CreditCardDebt}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your current personal loan"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage31PersonalLoan}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your outstanding mortgage loan"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage30Mortgage}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your legal entities"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage29LegalEntities}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your intellectual property rights"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage28Intellectual}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your significant assets"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage27SignificantAssets}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your business interest"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage26BusinessInterest}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your cash savings or deposits in bank accounts"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage25Cash}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your investment portfolio"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage25Portfolio}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your household"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage24Household}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your valuable possessions, just let me know."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage23Jewelry}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your vehicle, just let me know."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage22Vehicle}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of the farm, just let me know."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage22Farm}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "Thank you for discussing insurance policies with me. Let’s proceed to the next part of your estate planning. Shall we continue?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage46Continue}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding your investment holdings helps us assess your overall financial position and develop strategies to maximise the value of your estate. Please provide as much detail as possible for each of the following questions"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Do you currently hold any stocks or equities in your
                  investment portfolio? If yes, please specify the name of the
                  stocks, the number of shares held, and the current market
                  value of each stock 🔐💼
                  <br />
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage47InvestmentHolding}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your stocks or equities"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage47InvestmentHolding}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are you invested in any bonds or fixed-income securities? If so, please provide details about the types of bonds (government, corporate, municipal), the face value of each bond, the interest rate, and the maturity date."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage48FixedIncome}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready, please provide the types of bonds you are interested in."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage48FixedIncome}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have investments in mutual funds? If yes, please specify the names of the funds, the fund managers, the investment objectives, and the current value of your holdings in each fund."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage48MutualFunds}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your investments in mutual funds."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage48MutualFunds}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are you contributing to a retirement fund such as retirement annuity fund, employer sponsored pension fund or provident fund? Please provide details about the type of retirement account, the current balance, and any investment options available within the account."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage49RetirementFunds}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your type of retirement account."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage49RetirementFunds}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you own any investment properties or real estate holdings? If yes, please specify the properties, their current market value, any rental income generated, and any outstanding mortgages or loans against the properties."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage50EstateHoldings}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your investment properties or real estate holdings"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage50EstateHoldings}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are you invested in any other asset classes such as commodities, alternative investments, or cryptocurrencies? If so, please provide details about the specific investments and their current value."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage51AssetClasses}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready to provide the details of your asset classes."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage51AssetClasses}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Have you defined your investment goals and risk tolerance to guide your investment decisions effectively?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Unsure"]}
                    handleSelection={handleButtonStage52InvestmentGoals}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding your investment goals and risk tolerance is essential for making informed decisions that align with your financial objectives and comfort with risk. Consider identifying your short-term and long-term goals, such as saving for retirement, purchasing a home, or funding education. Additionally, assess your risk tolerance by considering how much risk you're willing to take and how you react to market fluctuations. If you need assistance, our financial adviser can help you define these parameters and create a tailored investment strategy."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage52InvestmentGoals}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Are there any specific changes or adjustments you're considering making to your investment portfolio in the near future?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Unsure"]}
                    handleSelection={handleButtonStage53SpecificChanges}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's always a good idea to periodically review your investment portfolio to ensure it aligns with your financial goals and risk tolerance. If you're not currently considering any changes, it might be helpful to schedule a regular review with a financial adviser to stay informed about potential opportunities or necessary adjustments based on market conditions and your evolving financial situation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage53SpecificChanges}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! Next, we’ll discuss estate duty. Shall we continue?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage54Final}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "The tax on the total value of your estate if you were to pass away today with your current will or distribution wishes in place. Understanding this helps us ensure your estate plan minimises taxes and maximises what is passed on to your heirs. Ready to get started?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage55EstateDuty}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have a current will in place?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage56CurrentWill}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Creating a will is an important step in securing your assets and ensuring your wishes are followed. We can start drafting your will right here by answering a few questions about your estate and preferences."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage57ImportantStep}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "When was the last time you reviewed your will? It’s a good idea to keep it up to date with any changes in your life."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Will is up to date",
                      "Will needs to be reviewed & updated",
                    ]}
                    handleSelection={handleButtonStage57ReviewedWill}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Let's go over the details of your current will. How are your assets distributed according to your current will? Here are some specific questions to help clarify this:"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
                    onClick={() => handleButtonStage57ImportantStep("Continue")}
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
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, my entire estate",
                      "Yes, a significant portion of my estate",
                      "No, estate divided among other beneficiaries",
                      "No, spouse receives only a specific portion",
                    ]}
                    handleSelection={handleButtonStage58EstateSpouse}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "What happens to the residue (remainder) of your estate after all debts, expenses, taxes, and specific bequests (gifts of particular assets) are settled? Is it bequeathed to your spouse?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage59Residue}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you bequeath any portion of your estate to the Trustees of any specific trust?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage60Bequeath}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Does your will include a plan for setting up a trust after you pass away?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage61PassAway}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you have a farm or any specific property bequeathed to a trust?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage62Bequeathed}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "the market value less 30% is included as the value of the farm for estate duty purposes."
            ) && (
              <>
                <div className="flex items-start space-x-4 mt-2 ml-11">
                  {/* Image on the left */}
                  <Image
                    src="/images/usefulTip.png" // Path to your image
                    alt="Useful tip"
                    width={500} // Adjust width
                    height={300} // Adjust height
                    className="rounded-md" // Adds rounded corners (5px)
                  />
                </div>

                <div className="space-x-2 ml-16 mt-2 mb-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Please provide details of the trust.
                </div>
              </>
            )}

            {maritalStatus === "Married" &&
              message.content.includes(
                "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?"
              ) && (
                <>
                  <CustomButtonGroup
                    options={[
                      "Yes, the difference should be considered a loan to the specific beneficiary",
                      "No, the difference should be considered a gift and not a loan",
                      "The difference should be treated as a loan with interest payable by the beneficiary",
                      "The difference should be adjusted through other assets or cash to balance the value",
                      "A family trust should manage the difference to ensure equitable distribution",
                      "The surviving spouse should decide on how to manage the difference based on circumstance",
                      "The difference should be documented but forgiven upon the death of the surviving spouse",
                      "The estate should sell specific assets to cover the difference and distribute proceeds accordingly",
                      "A clause should be added to the will to allow for flexibility in handling the difference",
                      "The difference should be split among all beneficiaries to evenly distribute the value",
                    ]}
                    handleSelection={handleButtonStage63AssetsManaged}
                  />
                </>
              )}

            {message.content.includes(
              "Certain third parties may be responsible for estate duty based on the assets they receive. Do you have any specific instructions or details about third-party liability for estate duty in your current will?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, I have it in my current will",
                      "No, I have not included specific instructions",
                    ]}
                    handleSelection={handleButtonStage64ThirdParties}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "USEFUL TIP: If your spouse were to pass away immediately after you, there are specific estate duty implications and/or arrangements you would need to consider? All the more reason to get in touch with our Financial Advisors. This will be noted and added to the report supplied to you at the end of this chat."
            ) && (
              <>
                <div className="flex items-start space-x-4 mt-2 ml-11">
                  {/* Image on the left */}
                  <Image
                    src="/images/investment.png" // Path to your image
                    alt="Useful tip"
                    width={500} // Adjust width
                    height={300} // Adjust height
                    className="rounded-md" // Adds rounded corners (5px)
                  />
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Thank you for providing all these details. {userName}. This
                  helps us understand the estate duty implications of your
                  current will.
                </div>
                <br />
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Next, we’ll look at the executor’s fees. Shall we continue?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={
                      handleButtonStage66EstateDutyCurrentWillFinal
                    }
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready to provide the details, just let me know."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage65CurrentWill}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understood. It's crucial to consider this aspect carefully. Would you like to discuss potential options for addressing third-party liability in your estate plan?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage65PotentialOption}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Excellent! There are several strategies we can explore to address third-party liability in your estate plan. One option is to include specific provisions in your will outlining how estate duty should be handled for third parties. We can also consider setting up trusts or other structures to manage these liabilities effectively. Would you like to explore these options further?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage65Stages}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great, one of our financial advisers will be in touch in this regard."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <strong style={{ marginLeft: "-5px" }}>💡 USEFUL TIP</strong>
                  :
                  <br />
                  If your spouse were to pass away immediately after you, there
                  are specific estate duty implications and/or arrangements you
                  would need to consider? All the more reason to get in touch
                  with our Financial Advisors. This will be noted and added to
                  the report supplied to you at the end of this chat.
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Thank you for providing all these details. This helps us
                  understand the estate duty implications of your current will.
                  Please share your current will. 🔐💼
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Next, we’ll look at the executor’s fees. Shall we continue?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={
                      handleButtonStage66EstateDutyCurrentWillFinal
                    }
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! Next, we’ll look at the executor’s fees. Shall we continue?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={
                      handleButtonStage66EstateDutyCurrentWillFinal
                    }
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Now, let's discuss the fees that will be charged for the administration of your estate. The executor's fees can be a significant part of the costs, so it's important to understand how these are calculated."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  💰 The maximum fee that can be charged for executor’s fees is
                  3.5%, plus VAT (15%), which totals 4.03%. You can leave
                  instructions in your will to stipulate what percentage you
                  wish to set for the executor’s fees.
                  <br />
                  <br />
                  <strong style={{ marginLeft: "-1px" }}>💡 USEFUL TIP</strong>
                  :
                  <br />
                  👪 Family members are also entitled to executor’s fees. The
                  advantage of family members as executors is that they may be
                  open to waive or negotiate lower compensation.
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Remember, no executor’s fees are payable on proceeds from
                  policies with a beneficiary nomination, as these are paid
                  directly to the nominated beneficiary by the insurance
                  company. Do you have any such policies?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes, specify", "No"]}
                    handleSelection={handleButtonStage68Payable}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Remember, no executor’s fees are payable on proceeds from policies with a beneficiary nomination, as these are paid directly to the nominated beneficiary by the insurance company. Do you have any such policies?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes, specify", "No"]}
                    handleSelection={handleButtonStage68Payable}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Now, we can move on to the next part of your estate planning. Ready to continue?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage69ExecutorFinal}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Now, let's talk about the liquidity position of your estate. This helps us understand if there are enough liquid assets available to cover estate costs without having to sell off assets. Ready to proceed?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage70Liquidity}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Liquidity is essential to cover estate costs without having to sell assets. Are you aware of any sources of liquidity in your estate, such as cash reserves or liquid investments?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, specify",
                      "No, I have no significant sourced of liquidity",
                      "Unsure, will need assistance",
                    ]}
                    handleSelection={handleButtonStage71LiquidityEssential}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! Based on the information you've provided earlier, we can review your existing financial assets and investments to assess their liquidity. We will include this information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  If there's a shortfall, there are a few options. The executor
                  may ask heirs to contribute cash to prevent asset sales. Are
                  you open to this option?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, with considerations",
                      "No, assets should be sold to cover shortfall",
                      "I need more information before deciding",
                    ]}
                    handleSelection={handleButtonStage72Shortfall}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "If there's a shortfall, there are a few options. The executor may ask heirs to contribute cash to prevent asset sales. Are you open to this option?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, with considerations",
                      "No, assets should be sold to cover shortfall",
                      "I need more information before deciding",
                    ]}
                    handleSelection={handleButtonStage72Shortfall}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Thank you for your openness to this option. When considering this approach, it's essential to assess the financial impact on each heir and ensure fairness in the distribution of responsibilities. Factors such as each heir's financial situation, willingness to contribute, and the impact on their inheritance should be carefully considered. Would you like guidance on how to navigate these considerations?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage73FinancialImpact}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "Great! Our financial advisers at Old Mutual can help you and your heirs understand the financial implications and create a fair strategy. They can assist in evaluating each heir’s ability to contribute, ensure clear communication among all parties, and develop a plan that respects everyone's circumstances. We'll include this information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage73FinancialImpact}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Sure! In the event of a shortfall, the executor may explore various options to cover expenses without liquidating assets prematurely. These options could include negotiating payment terms with creditors, utilising existing insurance policies, or securing a loan against estate assets. Each option comes with its own set of considerations and implications. Would you like further details on these options to help you make an informed decision?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage74Shortfall}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Excellent! Here are some details on the potential options:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  collateral, providing immediate funds to cover expenses while
                  preserving the estate's value.
                  <br />
                  <br />
                  Our financial advisers at Old Mutual can provide more in-depth
                  information and help you evaluate these options based on your
                  specific situation. We will include this information in the
                  report shared at the end of this conversation.
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage74Shortfall}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Selling assets could impact your wishes for asset distribution and family business continuation. How do you feel about selling assets to cover a shortfall?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "I am open to selling assets",
                      "I am against selling assets",
                      "I need more information before deciding",
                      "I’d like to explore alternative financing options",
                    ]}
                    handleSelection={handleButtonStage75SellingAsset}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Absolutely! When facing a shortfall, selling assets isn't the only option available. Alternative financing strategies, such as securing loans against estate assets, negotiating payment terms with creditors, or utilising existing insurance policies, can provide additional flexibility without compromising your long-term goals for asset distribution. Each option comes with its own set of considerations and implications, so it's essential to weigh them carefully. Our financial advisers can help you set this up."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Borrowing funds is another option, but it could be costly and
                  limit asset use if assets are used as security. Have you
                  considered this option?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "I am open to borrowing funds",
                      "I am against borrowing funds",
                      "I need more information before deciding",
                      "I’d like to explore alternative financing options",
                    ]}
                    handleSelection={handleButtonStage77BorrowingFunds}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's understandable to have reservations about selling assets, especially if it affects your long-term plans for asset distribution or business continuity. Selling assets can impact the legacy you wish to leave behind and may disrupt the stability of family businesses. However, it's essential to balance these concerns with the immediate need to cover a shortfall. Exploring alternative financing options or negotiating payment terms with creditors could help alleviate the need for asset liquidation. Would you like to explore these alternatives further?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage76Reservation}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! Here are some alternative options you might consider:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  collateral, providing immediate funds to cover expenses while
                  preserving the estate's value.
                  <br />
                  <br />
                  Our financial advisers at Old Mutual can provide more in-depth
                  information and help you evaluate these options based on your
                  specific situation. We will include this information in the
                  report shared at the end of this conversation.
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Borrowing funds is another option, but it could be costly and
                  limit asset use if assets are used as security. Have you
                  considered this option?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "I am open to borrowing funds",
                      "I am against borrowing funds",
                      "I need more information before deciding",
                      "I’d like to explore alternative financing options",
                    ]}
                    handleSelection={handleButtonStage77BorrowingFunds}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Borrowing funds is another option, but it could be costly and limit asset use if assets are used as security. Have you considered this option?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "I am open to borrowing funds",
                      "I am against borrowing funds",
                      "I need more information before deciding",
                      "I’d like to explore alternative financing options",
                    ]}
                    handleSelection={handleButtonStage77BorrowingFunds}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Absolutely, it's essential to fully understand the implications before making a decision. Borrowing funds can indeed be costly, especially if assets are used as security, as it may limit their use and potentially increase financial risk. I can provide more detailed information on the costs involved, potential risks, and alternative financing options to help you make an informed decision. Would you like to explore these aspects further?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage77FinancialRisk}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! Here are some important aspects to consider:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  Our financial advisers at Old Mutual can provide a thorough
                  analysis and personalized advice to help you make the best
                  decision. We will include this information in the report
                  shared at the end of this conversation.
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Have you considered life assurance as a way to address any
                  cash shortfall? Life assurance provides immediate cash without
                  income tax or capital gains tax. How willing are you to go
                  this route?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <LifeInsuranceSlider
                    onProceed={handleButtonStage78LifeInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Exploring alternative financing options is a prudent approach to ensure you make the best decision for your estate. There are various strategies available, such as negotiating payment terms with creditors, utilising existing insurance policies, or seeking financial assistance from family members or business partners. Each option has its pros and cons, so it's essential to weigh them carefully. Would you like more information on these alternative financing options?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage77Alternative}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! Here are some alternative financing options to consider:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  Our financial advisers at Old Mutual can provide a thorough
                  analysis and personalized advice to help you make the best
                  decision. We will include this information in the report
                  shared at the end of this conversation.
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Have you considered life assurance as a way to address any
                  cash shortfall? Life assurance provides immediate cash without
                  income tax or capital gains tax. How willing are you to go
                  this route?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <LifeInsuranceSlider
                    onProceed={handleButtonStage78LifeInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Have you considered life assurance as a way to address any cash shortfall? Life assurance provides immediate cash without income tax or capital gains tax. How willing are you to go this route?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <LifeInsuranceSlider
                    onProceed={handleButtonStage78LifeInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Thank you for discussing your estate's liquidity position. Let's discuss maintenance claims. Ready?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage79LiquidityEnd}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Let's discuss maintenance claims in terms of court orders. If you pass away while there are maintenance obligations towards children or a former spouse, they will have a maintenance claim against your estate. Are you aware of any existing maintenance obligations or court orders?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "I have court ordered maintenance obligations",
                      "I have informal agreements, not court orders",
                      "I don’t have any maintenance obligations",
                      "I haven’t considered maintenance claims in relation to my estate planning",
                    ]}
                    handleSelection={handleButtonStage80Claims}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's crucial to consider these maintenance obligations in your estate planning to ensure they are adequately addressed. Court-ordered maintenance obligations typically take precedence and must be factored into your estate plan to avoid potential disputes or legal complications. Would you like assistance in incorporating these obligations into your estate plan? If so, please provide the details of the court order."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Upload Document at End of Chat",
                      "Yes, specify detail",
                      "No, let’s move on",
                    ]}
                    handleSelection={handleButtonStage81Obligations}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No problem. Whenever you're ready, please provide the details about your life insurance policy."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage81Obligations}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "While informal agreements may not have the same legal standing as court orders, they are still important to consider in your estate planning. Even informal arrangements could result in maintenance claims against your estate if not addressed properly. Would you like guidance on how to formalise these agreements or ensure they are appropriately accounted for in your estate plan?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Maybe"]}
                    handleSelection={handleButtonStage81Agreements}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include this information about life insurance policy in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage81Agreements}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's essential to assess any potential maintenance claims in relation to your estate to avoid unexpected complications for your heirs. Even if you haven't formalised maintenance obligations through court orders or agreements, they may still arise based on legal obligations. Would you like assistance in evaluating and addressing any potential maintenance claims in your estate planning?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Maybe"]}
                    handleSelection={handleButtonStage81Complications}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We'll include this information about life insurance policy in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage81Complications}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "You are under 18 years old. We recommend you seek advice from a legal guardian or financial advisor"
            ) && (
              <div className="space-x-2 ml-14 -mt-4">
                <br />
                <SelectableButtonGroup
                  options={["Proceed with Learning"]}
                  handleSelection={handleButtonStageProceedLearning}
                />
              </div>
            )}

            {message.content.includes(
              "Have you considered the cost of education and taken that into account regarding maintenance?"
            ) && (
              <div className="space-x-2 ml-14 -mt-4">
                <br />
                <SelectableButtonGroup
                  options={["Yes", "No"]}
                  handleSelection={handleButtonStage82LifeInsurancev1}
                />
              </div>
            )}

            {message.content.includes(
              "To ensure that the amount required for maintenance is available, you can take out a life insurance policy payable to a testamentary trust for their benefit. Have you considered this option?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Unsure"]}
                    handleSelection={handleButtonStage82LifeInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "That's a proactive approach to ensuring adequate provision for maintenance obligations. Have you already taken steps to set up such a policy, or would you like assistance in exploring this option further?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "I have set up a policy",
                      "I need assistance in setting up a policy",
                    ]}
                    handleSelection={handleButtonStage83Proactive}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include information about assistance with setting up a policy in the report that will be shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage83Proactive}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's an important consideration to ensure that your loved ones are provided for in the event of your passing. If you'd like, we can discuss the benefits and implications of setting up a life insurance policy payable to a testamentary trust to cover maintenance obligations. Would you like more information on this option?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage83Passing}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Setting up a life insurance policy payable to a testamentary trust can ensure that maintenance obligations are met without burdening your estate. This approach provides a reliable income stream for your beneficiaries. Our financial advisers at Old Mutual can provide detailed guidance and help you explore this option further."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage83Passing}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Next, let's talk about maintenance for the surviving spouse. If you don't make provision for maintenance for the surviving spouse, they can institute a claim against your estate in terms of the Maintenance of Surviving Spouse’s Act. Are you considering provisions for your surviving spouse?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "I have provisions in place",
                      "I want to make provisions in my estate planning",
                      "I don’t want to make provisions in my estate planning",
                      " I need more information before deciding",
                    ]}
                    handleSelection={handleButtonStage84Provision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's great that you've already made provisions for your surviving spouse. Would you like to review your existing provisions to ensure they align with your current goals and circumstances?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage84ExistingProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Reviewing your existing provisions can ensure they are still appropriate and effective given your current situation and goals. We will include this information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage84ExistingProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Making provisions for your surviving spouse ensures their financial security after you're gone. We can discuss various options for including these provisions in your estate plan. Would you like more information on this?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage84OptionProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Providing for your surviving spouse can be done through various means, such as setting up a trust, designating life insurance benefits, or specifying direct bequests in your will. Our financial advisers at Old Mutual can guide you through these options to find the best solution for your needs. We will include this information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage84OptionProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Sure, understanding the implications and options for provisions for your surviving spouse is crucial. Would you like more information on how this can be incorporated into your estate planning?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage84CrucialProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Incorporating provisions for your surviving spouse can be an essential part of a comprehensive estate plan. Understanding the legal and financial implications will help you make an informed decision. Our financial advisers at Old Mutual can provide you with the necessary information and advice. We will include this information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage84CrucialProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Factors considered by the court when assessing the claim include the duration of the marriage, the spouse's age and earning capacity, and the size of your assets. Have you thought about these factors in your estate planning?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <CustomButtonGroup
                    options={[
                      "Yes, I have considered them and have factored them into my estate planning",
                      "I am aware of these factors but haven’t considered them in my estate planning",
                      "No, I haven’t thought about these factors yet",
                      "I need more information before I can respond",
                    ]}
                    handleSelection={handleButtonStage85FactorsProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's excellent that you've already considered these factors in your estate planning. Would you like to discuss how they can further inform your decisions and ensure your plan aligns with your goals?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage85GoalsProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! When these factors are considered, it helps ensure that your estate plan is tailored to meet your specific circumstances. For example, longer marriages or significant disparities in earning capacity might necessitate larger or longer-term maintenance provisions. Keeping your plan flexible and periodically reviewing it can help accommodate any changes in your situation. Would you like to delve deeper into any particular area?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage85GoalsProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding these factors is essential for effective estate planning. Would you like assistance in incorporating them into your estate plan to ensure it reflects your wishes and circumstances?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage85UnderstandingProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Excellent! Incorporating these factors into your estate plan ensures a fair and well-thought-out approach to maintenance and asset distribution. For instance, ensuring that your plan addresses the financial needs of a surviving spouse based on their age and earning capacity can provide long-term security. We will include this information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage85UnderstandingProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No worries, considering these factors can help you create a more comprehensive estate plan. Would you like assistance in understanding how they may impact your estate planning decisions?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage85ComprehensiveProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Wonderful! Understanding how these factors impact your estate planning can help you make more informed decisions. For example, considering the spouse's earning capacity can guide how much and how long maintenance should be provided, and knowing the size of your assets helps in deciding the distribution method. We will include this information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage85ComprehensiveProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Sure, understanding these factors is crucial for effective estate planning. Would you like more information on how they can influence your estate planning decisions before you respond?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage85EffectiveProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Perfect! Knowing how these factors influence your estate planning can help ensure your plan is both fair and effective. For instance, a longer marriage might lead to more substantial maintenance claims, and a larger estate might require more detailed planning to minimize tax implications. We will include this information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage85EffectiveProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "You can make provision for maintenance through an insurance policy where your surviving spouse is the nominated beneficiary or stipulate in the will that the proceeds will be paid to a testamentary trust for the spouse's benefit. What are your preferences regarding this?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <CustomButtonGroup
                    options={[
                      "Insurance policy with my spouse as the nominated beneficiary",
                      "Testamentary trust for spouse outlines in my will",
                      "I’m open to either option",
                      "I’m not sure, I need more information of each option",
                      "I’d like to explore other options",
                    ]}
                    handleSelection={handleButtonStage85MaintenanceProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Both options have their advantages. With an insurance policy, the benefit is usually paid out quickly and directly to your spouse, providing immediate financial support. On the other hand, setting up a testamentary trust in your will offers more control over how the funds are managed and distributed, ensuring long-term financial security for your spouse and potential tax benefits. We can discuss the specifics of each option further and tailor the solution to best meet your needs. Would you like to explore these options in more detail?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage85BenefitProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Great! Here’s a brief overview of each option:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <b>🛡️ Insurance Policy:</b>
                  <br />
                  Provides immediate liquidity to your spouse upon your passing,
                  typically without the need for probate. This can be beneficial
                  for addressing urgent financial needs.
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }}>🏦 Testamentary Trust:</b>
                  <br />
                  Allows for greater control over the distribution of assets,
                  potentially offering ongoing support and protection for your
                  spouse. It can also provide tax benefits and help manage the
                  funds according to your wishes.
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage85BenefitProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Absolutely! Let's delve deeper into both options. An insurance policy with your spouse as the nominated beneficiary provides immediate liquidity and financial support to your spouse upon your passing. However, a testamentary trust outlined in your will can offer ongoing financial security, asset protection, and control over how the funds are used and distributed. We can discuss the benefits, considerations, and implications of each option to help you make an informed decision. How does that sound?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage86DeeperProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Certainly! Besides the options mentioned, there are alternative ways to provision for maintenance, such as setting up annuities, creating specific bequests in your will, or establishing a family trust. Each option has its unique advantages and considerations. We can explore these alternatives further and tailor a solution that aligns with your estate planning goals. Would you like to discuss these options in more detail?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />+
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage86AnnuitiesProvision}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Certainly! Besides insurance policies and testamentary trusts, you might consider options such as:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  according to your wishes, providing flexibility and potential
                  tax benefits.
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage86AnnuitiesProvision}
                  />
                </div>
              </>
            )}

            {/* {message.content.includes("Do your dependents require any income per month for maintenance?") && (
                <>  
                  <div className="space-x-2 ml-14">
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
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "I have capital available to generate an income for my dependents",
                      "I have capital but unsure if it will generate enough income",
                      "I haven’t thought of this aspect of financial planning yet",
                      "I need more information to determine this",
                    ]}
                    handleSelection={handleButtonStage87ShortFall}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's essential to ensure that the capital you have can generate sufficient income to support your dependents after your passing. We can work together to assess your current financial situation, projected expenses, and income needs to determine if any adjustments or additional planning are necessary to bridge any potential income shortfalls. Would you like to review your financial situation in more detail?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage87Capital}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include this information about your financial situation and any necessary adjustments in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage87Capital}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Planning for the financial well-being of your dependents is a crucial aspect of estate planning. We can assist you in evaluating your current financial situation, projected expenses, and income needs to ensure that your loved ones are adequately provided for in the event of your passing. Would you like to explore this aspect of financial planning further?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage87Capital}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We'll include this financial planning information in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage87Planning}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding the capital available to your dependents and its potential to generate income is essential for effective estate planning. We can help you gather the necessary information and provide guidance to evaluate your current financial situation, projected expenses, and income needs. Together, we can determine the most suitable strategies to ensure financial security for your loved ones. Would you like assistance in assessing your financial situation?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage87Dependents}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include this information about your financial situation and strategies in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage87Dependents}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Additional life insurance can provide the capital required for the income needs of dependents. Do you have any life insurance that is linked to a purpose, i.e. Mortgage / bond life cover etc?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes, specify details", "No, let's move on"]}
                    handleSelection={handleButtonStage88Additionalv1}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "Have you considered obtaining additional life insurance for providing capital required for income needs of dependents?"
            ) && (
              <>
                <div className="space-y-2 ml-11 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "My current life insurance coverage is sufficient",
                      "I’m currently reviewing my options for additional life insurance",
                      "No, I haven’t considered obtaining additional life insurance",
                      "I’m unsure if additional life insurance is necessary given my current financial situation",
                    ]}
                    handleSelection={handleButtonStage88Additional}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's prudent to periodically review your life insurance coverage to ensure that it aligns with your current financial situation and the needs of your dependents. We can assist you in evaluating your insurance needs and exploring suitable options for additional coverage based on your evolving circumstances. Would you like guidance in assessing your life insurance needs and exploring available options?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage88Coverage}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include this information about your life insurance needs and options in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage88Coverage}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Life insurance can play a vital role in providing financial security for your dependents in the event of your passing. If you haven't considered obtaining additional coverage, it may be worthwhile to explore your options and ensure that your loved ones are adequately protected. We can help you evaluate your insurance needs and identify suitable coverage options. Would you like assistance in exploring the benefits of additional life insurance?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage88LifeInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include this information about your life insurance needs and coverage options in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage88LifeInsurance}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding the necessity of additional life insurance coverage requires a thorough assessment of your current financial situation and the future needs of your dependents. We can assist you in evaluating your financial circumstances and determining whether additional coverage is warranted based on your specific situation. Would you like to review your financial situation and assess the potential benefits of additional life insurance?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage88Assessment}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include this information about your financial situation and potential life insurance needs in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage88Assessment}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Excellent! Now, let's continue with your estate planning. Ready?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage89Final}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Now, let's discuss funeral cover. Funeral cover provides liquidity to your beneficiaries within a short time frame after submitting a claim. Have you considered obtaining funeral cover?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, I have funeral cover in place",
                      "No, I haven’t considered obtaining funeral cover",
                      "I need more information before deciding",
                    ]}
                    handleSelection={handleButtonStage90FuneralCover}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's recommended to nominate a beneficiary on the funeral cover to ensure prompt payment to your beneficiaries. Have you nominated a beneficiary on your funeral cover policy?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Wasn’t aware this was an option"]}
                    handleSelection={handleButtonStage90NominateFuneralCover}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Nominating a beneficiary on your funeral cover policy ensures that the benefit is paid directly to the intended recipient without delays. It's a simple step that can provide peace of mind to your loved ones during a difficult time. Would you like assistance in nominating a beneficiary on your funeral cover policy?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage90BeneficiaryFuneralCover}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include this information about nominating a beneficiary on your funeral cover policy in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage90BeneficiaryFuneralCover}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Funeral cover can offer peace of mind by providing financial assistance to your loved ones during a challenging time. If you haven't considered obtaining funeral cover, it may be worth exploring to ensure that your family is financially prepared to cover funeral expenses. We can help you understand the benefits of funeral cover and assist you in finding a suitable policy that meets your needs. Would you like more information on the benefits of funeral cover and how it can benefit your family?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage90AssistanceFuneralCover}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Here’s an outline of the benefits of funeral cover:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <br />
                  💸 <b>Immediate Financial Support:</b>
                  <br />
                  Funeral cover provides immediate funds to cover funeral
                  expenses, reducing the financial burden on your family during
                  a difficult time.
                  <br />
                  <br />
                  🧘 <b>Peace of Mind:</b>
                  <br />
                  Knowing that funeral expenses are covered offers peace of mind
                  for you and your loved ones, ensuring that financial concerns
                  don’t add to the stress of planning a funeral.
                  <br />
                  <br />
                  🏥 <b>Comprehensive Coverage:</b>
                  <br />
                  Funeral cover often includes a range of services, such as
                  transportation, burial or cremation, and related expenses,
                  ensuring that all aspects of the funeral are taken care of.
                  <br />
                  <br />
                  💼 <b>Avoiding Financial Strain:</b>
                  <br />
                  By having a dedicated policy for funeral expenses, you prevent
                  your family from having to dip into savings or take out loans
                  to cover costs, helping them avoid unnecessary financial
                  strain.
                  <br />
                  <br />
                  📜 <b>Flexibility in Planning:</b>
                  <br />
                  Many funeral cover policies offer flexibility in terms of
                  benefits and services, allowing you to tailor the policy to
                  meet your specific wishes and needs.
                  <br />
                  <br />⚡ <b>Ease of Access:</b>
                  <br />
                  Funeral cover typically provides a quick payout, ensuring that
                  funds are available when needed without lengthy administrative
                  delays.
                  <br />
                  <br />
                  📈 <b>Protection Against Rising Costs:</b>
                  <br />
                  With a funeral cover policy, you lock in a level of coverage
                  at today's rates, helping to protect against future increases
                  in funeral costs.
                  <br />
                  <br />
                  Would you like more details on how funeral cover can be
                  tailored to your specific needs or assistance in finding a
                  suitable policy?
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Thank you for discussing insurance policies with me. Let’s
                  proceed to the next part of your estate planning. Shall we
                  continue?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage46Continue}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include details on tailoring funeral cover to your needs or finding a suitable policy in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage90ImmediateFuneralCover}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding the specifics of funeral cover and its benefits can help you make an informed decision about whether it's the right choice for you. We're here to provide you with all the information you need to assess the value of funeral cover and its relevance to your financial planning. Is there any specific information you'd like to know about funeral cover to help you make a decision?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes, I have a question", "No"]}
                    handleSelection={handleButtonStage90specificsFuneralCover}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Next, let's talk about trusts. A trust is is a legal arrangement where one person (the trustee) holds and manages assets on behalf of another person or group (the beneficiaries). The person who created the trust is called the settlor. The trustee is responsible for managing the trust according to the terms set by the settlor, ensuring the assets benefit the beneficiaries. Are you familiar with trusts?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Tell me more"]}
                    handleSelection={handleButtonStage91Trust}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Trusts are an integral part of estate planning and can offer various benefits such as asset protection, tax efficiency, and control over asset distribution. They involve a legal arrangement where a trustee holds and manages assets for the benefit of beneficiaries. Trusts can be useful for preserving wealth, providing for loved ones, and ensuring your wishes are carried out. Would you like to explore how trusts can be tailored to meet your specific needs?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage91Integral}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We will include information on how trusts can be tailored to your specific needs in the report shared at the end of this conversation."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage91Integral}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "There are two types of trusts: inter vivos trusts and testamentary trusts. Inter vivos trusts are established during your lifetime, while testamentary trusts are created in your will and come into effect after your death. Have you considered setting up a trust?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <CustomButtonGroup
                    options={[
                      "Yes, I have considered setting up a trust",
                      "No, I haven’t thought about setting up a trust yet",
                      "I’m currently exploring the possibility of setting up a trust",
                      "I’m not sure if setting up a trust is necessary for me",
                      "I have some knowledge about trusts but need more information",
                      "I have specific concerns or questions about setting up a trust",
                    ]}
                    handleSelection={handleButtonStage92Vivos}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Setting up a trust can be a valuable component of your estate plan, providing various benefits such as asset protection, wealth preservation, and efficient distribution of assets to beneficiaries. Would you like more information on how trusts can benefit your specific situation?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage92Setting}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Exploring the possibility of setting up a trust is a proactive step in your estate planning journey. Trusts offer numerous advantages, including privacy, control over asset distribution, and tax efficiency. If you have any questions or need guidance on this process, feel free to ask."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage92Setting}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's understandable to have reservations or uncertainty about setting up a trust. Trusts can be customised to suit your unique needs and goals, offering flexibility and protection for your assets. If you're unsure about whether a trust is right for you, we can discuss your concerns and explore alternative options."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage92Setting}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Having some knowledge about trusts is a great starting point. However, it's essential to have a clear understanding of how trusts work and how they can benefit your estate planning strategy. If you need more information or have specific questions, feel free to ask, and I'll be happy to assist you."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage92Setting}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Addressing specific concerns or questions about setting up a trust is crucial for making informed decisions about your estate plan. Whether you're unsure about the process, concerned about potential implications, or have questions about trust administration, I'm here to provide guidance and support. Feel free to share your concerns, and we can discuss them further."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage92Setting}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Trusts can be beneficial for various reasons. They can protect your estate against insolvency, safeguard assets in the event of divorce, and peg growth in your estate. Are any of these reasons relevant to your estate planning?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <CustomButtonGroup
                    options={[
                      "Yes, protecting my estate against insolvency is a priority for me",
                      "I’m concerned about safeguarding assets in case of divorce",
                      "Pegging growth in my estate sounds like a beneficial strategy",
                      "All of these reasons are relevant to my estate planning",
                      "None of these reasons are currently a priority for me",
                    ]}
                    handleSelection={handleButtonStage93Beneficial}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Additionally, transferring assets to a trust can save on executor's fees and exclude assets from your estate for estate duty purposes. Have you thought about these advantages in relation to your estate planning?"
            ) && (
              <>
                <div className="space-y-2 ml-11 -mt-4 ">
                  <br />
                  <CustomButtonGroup
                    options={[
                      "Yes, saving on executor’s fees is an important consideration for me",
                      "Excluding assets from my estate for estate duty purposes is a key factor in my planning",
                      "I’m interested in exploring how transferring assets to a trust could benefit me",
                      "I haven’t considered these advantages before, but they sound appealing",
                      "I’m not sure how significant these advantages before would be for my estate planning",
                      "I need more information to understand how these advantages would apply to my situation",
                      "I’m primarily focused on other aspects of my estate planning right now",
                    ]}
                    handleSelection={handleButtonStage94Executor}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Exploring how transferring assets to a trust could benefit you is a wise decision in estate planning. It offers various advantages, such as reducing executor's fees and estate duty obligations, as well as providing asset protection and efficient distribution to beneficiaries. If you're interested in learning more about these benefits and how they apply to your specific situation, I am here to provide further information and guidance."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage94Executor}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding the significance of advantages like saving on executor's fees and excluding assets from your estate for estate duty purposes is essential in crafting an effective estate plan. These benefits can have a significant impact on preserving your wealth and ensuring efficient asset distribution. If you're uncertain about their significance or how they apply to your estate planning, I can provide more details and clarify any questions you may have."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage94Executor}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Exploring how transferring assets to a trust could benefit you is a wise decision in estate planning. It offers various advantages, such as reducing executor's fees and estate duty obligations, as well as providing asset protection and efficient distribution to beneficiaries. If you're interested in learning more about these benefits and how they apply to your specific situation, I'm here to provide further information and guidance."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage94Executor}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's understandable to need more information to fully grasp how the advantages of transferring assets to a trust would apply to your situation. These advantages, such as saving on executor's fees and estate duty obligations, can vary depending on individual circumstances. If you require further clarification or personalised insights into how these benefits would impact your estate planning, I'm here to assist you and provide the information you need."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage94Executor}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Addressing specific concerns or questions about setting up a trust is crucial for making informed decisions about your estate plans. Whether you're unsure about the process, concerned about potential implications, or have questions about trust administration, I'm here to provide guidance and support. Feel free to share your concerns, and we can discuss them further."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage94Executor}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Donation of assets to a trust. This can remove assets from your estate and allow further growth within the trust and not increasing the value of your personal estate. Are you considering donating assets to a trust?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, I’m interested in exploring this option",
                      "I’m not sure if donating assets to a trust aligns with my estate planning goals",
                      "I need more information before deciding",
                      "I’m not comfortable with the idea of donating assets to a trust",
                    ]}
                    handleSelection={handleButtonStage95Donation}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding how donating assets to a trust aligns with your estate planning goals is crucial for making informed decisions. Donating assets to a trust can offer various benefits, including asset protection, estate tax reduction, and efficient wealth transfer. However, it's essential to ensure that this strategy aligns with your overall estate planning objectives. If you're unsure about its compatibility with your goals, I can provide more information and help you evaluate whether it's the right choice for your estate plan."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage95Donation}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Gathering more information before deciding on donating assets to a trust is a prudent approach. This strategy involves transferring assets to a trust, which can have implications for asset protection, tax planning, and wealth preservation. If you require additional details about how this option works, its potential benefits, and any considerations specific to your situation, I'm here to provide the necessary information and support your decision-making process."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage95Donation}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's important to note that while this strategy can reduce estate duty, there may be tax implications. Are you aware of the potential donations tax liability?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Tell me more"]}
                    handleSelection={handleButtonStage96Strategy}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Your information will be reviewed by an Old Mutual financial adviser, and you can expect to hear back soon with your estate plan."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Have a great day, and we’re looking forward to helping you
                  secure your future!
                </div>
              </>
            )}

            {/* {message.content.includes(
              "Hello and welcome to Moneyversity’s Estate Planning Consultant"
            ) && (
              <>
                <div className="space-x-2 ml-16 -mb-2 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  I'm here to help you navigate the estate planning process with
                  ease 🛠️. Together, we’ll ensure your assets and wishes are
                  well-documented and protected 🛡️. Ready to get started on this
                  important journey? 🚀
                </div>
                <div className="space-x-2 ml-14">
                  <br />
                  <SelectableButtonGroup
                    options={["Absolutely", "Tell me more", "Not now"]}
                    handleSelection={handleButtonStage0}
                  />
                </div>
              </>
            )} */}

            {message.content.includes(
              "No problem at all. If you ever have questions or decide to start your estate planning, I’m here to help. Have a great day!"
            ) && (
              <>
                {/* <div className="space-x-2 ml-14 -mt-4">
                    <br />
                    <button
                      onClick={() => handleButtonStage0("Let's chat again!")}
                      className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                    >
                      Let's chat again!
                    </button>
                  </div> */}
              </>
            )}

            {message.content.includes(
              "I know estate planning can be daunting"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Let’s get to know each other a bit better. What is your name?
                </div>
              </>
            )}

            {message.content.includes("When were you born?") && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <Calendar
                    onDateSelect={handleDateSelection}
                    isFormSubmitted={isFormSubmitted}
                  />
                </div>
                <br />
                <br />
                <br />
              </>
            )}

            {message.content.includes(
              "Let’s talk about your family life quickly. Are you married or single?"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-4">
                  <SelectableButtonGroup
                    options={["Married", "Single"]}
                    handleSelection={handleButtonStage2}
                  />
                </div>
                <br />
                <br />
              </>
            )}

            {message.content.includes(
              "Great! Are you currently single, divorced, or widowed?"
            ) && (
              <div className="space-x-2 ml-16 -mt-4">
                <br />
                <button
                  onClick={() => handleButtonStage3Single("Single")}
                  className="px-2 py-2 mb-1 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Single
                </button>
                <button
                  onClick={() => handleButtonStage3Single("Divorced")}
                  className="px-2 py-2 mb-1 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Divorced
                </button>
                <button
                  onClick={() => handleButtonStage3Single("Widowed")}
                  className="px-2 py-2 rounded-md mb-1 border border-[#8DC63F] text-[#8DC63F]"
                >
                  Widowed
                </button>
              </div>
            )}

            {message.content.includes(
              "Excellent. Are you married in or out of community of property? If married out of community of property, is it with or without the accrual system?"
            ) && (
              <div className="space-x-2 ml-16 -mt-4">
                <br />
                <SelectableButtonGroup
                  options={[
                    "In Community of Property",
                    "Out of Community of Property with Accrual",
                    "Out of Community of Property without Accrual",
                    "I can't remember",
                    "What is Accrual?",
                  ]}
                  handleSelection={handleButtonStage3}
                />
              </div>
            )}

            {message.content.includes(
              "Excellent. In order to calculate the accrual, we need to know the specifics of your antenuptial contract (ANC). We will ask for your antenuptial contract at the end of this chat."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Do you currently have a will in place?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage4}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "No worries! Here’s a brief description of each type to help you remember:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <b>👫⚖️ In Community of Property:</b>
                  <br />
                  All assets and debts are shared equally between spouses.
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }}>
                    📈🏠 Out of Community of Property with Accrual:
                  </b>
                  <br />
                  Each spouse retains separate ownership of their assets, but
                  they share the growth in value of their estates during the
                  marriage
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }}>
                    🏡❌ Out of Community of Property without Accrual:
                  </b>
                  <br />
                  Each spouse retains separate ownership of their assets, and
                  there is no sharing of assets or growth in value. <br />
                  If you are married out of community of property, you would
                  have consulted with an attorney (or notary) and signed
                  documents (antenuptial contract) before your wedding 📝💍.
                  <br />
                  <br />
                  Please check your marital contract or consult with your spouse
                  to confirm ✅
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "In Community of Property",
                      "Out of Community of Property with Accrual",
                      "Out of Community of Property without Accrual",
                      "Out of Community of Property without Accrual",
                      "I can't remember",
                      "What is Accrual?",
                    ]}
                    handleSelection={handleButtonStage3}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Accrual is a concept in marriage where the growth in wealth during the marriage is shared between spouses. When a couple marries under the accrual system, each spouse keeps the assets they had before the marriage. However, any increase in their respective estates during the marriage is shared equally when the marriage ends, either through divorce or death."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  For example, if one spouse's estate grows significantly while
                  the other’s does not 📈💼, the spouse with the smaller growth
                  may be entitled to a portion of the increase in the other’s
                  estate 💰. This ensures fairness and protects both parties
                  🤝🛡️.
                  <br />
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "In Community of Property",
                      "Out of Community of Property with Accrual",
                      "Out of Community of Property without Accrual",
                      "Out of Community of Property without Accrual",
                      "I can't remember",
                      "What is Accrual?",
                    ]}
                    handleSelection={handleButtonStage3}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you currently have a will in place?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage4}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Creating a will is an important step in securing your assets and ensuring your wishes are followed. We can start drafting your will right here by answering a few questions about your estate and preferences a little later in the chat."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Do you currently have a trust in place?
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage6}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "When was the last time you reviewed your will? It’s a good idea to keep it up-to-date with any changes in your life"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Will is up to date",
                      "Will needs to be reviewed & updated",
                    ]}
                    handleSelection={handleButtonStage5}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Do you currently have a trust in place"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage6}
                  />
                </div>
              </>
            )}

            {message.content.includes("Do you have any dependents?") && (
              <div className="flex flex-col space-y-2 mt-2 ml-9">
                <label className="text-white">
                  Please select your dependents:
                </label>
                {Object.entries(checkboxes).map(([key, value]) => {
                  // Convert camelCase to separate words
                  const labelText = key
                    .replace(/([A-Z])/g, " $1") // Add space before capital letters
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

            {message.content.includes(
              "Is there anything else you’d like to add about your personal particulars or any questions you have at this stage?"
            ) && (
              <div className="space-x-2 ml-14 -mt-4">
                <br />
                <SelectableButtonGroup
                  options={["Yes, I have a question", "No, let’s move on"]}
                  handleSelection={handleButtonStage7}
                />
              </div>
            )}

            {message.content.includes(
              "Donations tax is a tax imposed on the transfer of assets to a trust or to any person (for example individuals, company or trust that is a SA tax resident) without receiving adequate consideration in return. It's important to understand that while transferring assets to a trust can help reduce estate duty, it may trigger donations tax liabilities. The amount of donations tax payable depends on several factors, including the value of the assets transferred, any available exemptions or deductions, and the relationship between the donor and the recipient. The donations tax threshold is R100 000 per year."
            ) && (
              <>
                <br />
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  📜 If you'd like to learn more about donations tax and its
                  implications for your estate planning, I can provide further
                  details to help you make informed decisions.
                </div>
                <br />
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage97Donation}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Next, let's talk about selling assets to the trust. This can be a strategic way to remove assets from your estate. However, it’s important to note that a loan account is not automaticaaly created unless there’s a difference between the sale price and the value of the asset. Have you considered selling assets to the trust in this way?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <CustomButtonGroup
                    options={[
                      "Yes, I’m interested in exploring this option",
                      "I’m not sure if selling assets to a trust aligns with my estate planning goals",
                      "I need more information before deciding",
                      "I’m not comfortable with the idea of selling assets to a trust",
                    ]}
                    handleSelection={handleButtonStage98Assets}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Selling assets to a trust can help minimize estate duty and protect your assets. However, remember that if the sale price matches the asset's value, a loan account won't be created. Additionally, capital gains tax and transfer duty may apply if the asset is a capital asset like property. We can discuss how this option fits with your estate planning goals."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage98Assets}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's crucial to align your estate planning strategies with your goals. Selling assets to a trust can offer benefits, such as reducing estate duty, but it also comes with implications like capital gains tax and transfer duty. If you're unsure whether this strategy is right for you, we can discuss it further to ensure it aligns with your specific needs and circumstances."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage98Assets}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding the full implications of selling assets to a trust is key. While it can offer estate planning benefits, it's important to consider the potential tax implications, like capital gains tax and transfer duty. If you need more information on how this works and its impact on your estate planning, I’m here to provide the necessary details."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage98Assets}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Selling assets to the trust might reduce estate duty, but a sale agreement should be in place if a loan account is to be created. Are you familiar with the terms and conditions of such agreements?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, I am familiar",
                      "I have some understanding but need more clarity",
                      "I need assistance in understanding the terms and conditions",
                      "I prefer not to engage in agreements that involve selling assets to a trust",
                    ]}
                    handleSelection={handleButtonStage99Selling}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Sale agreements can be complex, especially when transferring assets to a trust. These agreements detail the sale transaction and the loan terms, if applicable. If you need help understanding these terms and conditions, or have questions about how they apply to your situation, I’m here to provide guidance and support."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage99Selling}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "It’s great that you have some understanding of sale and loan agreements. These agreements outline the sale terms and the loan's repayment terms if a loan account is created. If you need more clarity or have questions about specific aspects of these agreements, feel free to ask. I’m here to help provide additional information and support your understanding."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage99Selling}
                  />
                </div>
              </>
            )}
            {message.content.includes(
              "Lastly, let's discuss the costs and tax consequences of transferring assets to a trust. This may include capital gains tax, transfer duty (for immovable property), and possible donations tax. Have you taken these factors into account?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, I am familiar",
                      "I have some understanding but need more clarity",
                      "I need more information before deciding",
                      "I’m not comfortable with the potential costs & tax implications at this time",
                    ]}
                    handleSelection={handleButtonStage99Selling}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Selling assets to a trust can be a strategic way to transfer assets out of your estate, potentially reducing estate duty and protecting your wealth. However, it’s important to consider the potential tax implications, such as capital gains tax and transfer duty, and whether a loan account will actually be created. If you’re interested in exploring this option further, we can dive into the specifics and see how it aligns with your overall estate planning goals."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage99Final}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's good to hear that you have some understanding of the costs and tax consequences associated with transferring assets to a trust. These factors can indeed be complex, and it's important to have a clear understanding to make informed decisions. If you need more clarity on any specific aspects of these costs and tax implications or if you have any questions about how they may impact your estate planning, feel free to ask. I'm here to provide additional information and support your understanding."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage99Final}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Understanding the costs and tax implications of transferring assets to a trust is crucial for making informed decisions in your estate planning. If you need more information before deciding, I'm here to help. We can discuss these factors in more detail, clarify any questions you may have, and ensure that you have a comprehensive understanding of how they may affect your estate plan. Feel free to ask any questions or raise any concerns you may have."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage99Final}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Now, let's explore the concept of an investment trust. This structure allows for annual donations to the trust, reducing your estate over time. Are you interested in setting up an investment trust?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={[
                      "Yes, I’m interested",
                      "I’m not sure if an investment trust aligns with my estate planning goals",
                      "I prefer to explore other options",
                      "I need more information before deciding",
                    ]}
                    handleSelection={handleButtonStage100Investment}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Setting up an investment trust can be a strategic way to manage your assets and reduce your estate over time. It allows for annual donations to the trust, which can have various benefits for your estate planning. If you're interested in exploring this option further, we can discuss the specifics of how an investment trust could align with your estate planning goals and tailor a plan to suit your needs."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage100Investment}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It's understandable to have questions about whether an investment trust aligns with your estate planning goals. An investment trust can offer unique advantages, but it's essential to ensure that it fits your specific needs and objectives. If you're uncertain, we can delve deeper into how an investment trust works and explore whether it's the right option for you."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage100Investment}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Exploring different options is an important part of estate planning, and it's essential to find the approach that best suits your needs and objectives. If you prefer to explore other options besides setting up an investment trust, we can discuss alternative strategies and find the solution that aligns most closely with your estate planning goals."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage100Investment}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Making an informed decision about whether to set up an investment trust requires a clear understanding of how it works and how it may impact your estate planning goals. If you need more information before deciding, feel free to ask any questions you may have. We can discuss the specifics of an investment trust, its benefits, and how it may fit into your overall estate plan."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage100Investment}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "An investment trust can provide flexibility for the trust beneficiaries to receive income and borrow funds. Does this align with your estate planning goals?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes", "No", "Tell me more"]}
                    handleSelection={handleButtonStage101InvestmentFlexibility}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "If an investment trust doesn't align with your estate planning goals, we can explore other options that may better suit your needs. Estate planning is a personalised process, and it's essential to find strategies that align closely with your objectives and preferences. Let's discuss alternative approaches to ensure your estate plan reflects your wishes and priorities."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage101InvestmentFlexibility}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "An investment trust offers flexibility for beneficiaries to receive income and borrow funds, providing potential advantages for estate planning. With an investment trust, you can structure distributions in a way that aligns with your goals and preferences. If you're interested in learning more about how an investment trust could benefit your estate plan, I can provide further details on how it works and its potential advantages."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Continue"]}
                    handleSelection={handleButtonStage101InvestmentFlexibility}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Thanks! Do you have anything you’d like to add or any questions that I can help you with today?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes, I have a question", "No"]}
                    handleSelection={handleButtonStage101InvestmentFlexibility}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "We’ve now gathered all the relevant information to help create your estate plan. As one of the final steps, please upload the documents below. <br/><br/>These will be securely stored and only shared with the financial adviser who will assist you in finalising your estate plan."
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Antenuptual Contract (ANC)"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Antenuptual Contract (ANC)
                  </button>
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Current Will"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Current Will
                  </button>

                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Trust Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Trust Details
                  </button>

                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Court Ordered Maintenance Obligations"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Court Ordered Maintenance Obligations
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Antenuptual Contract (ANC)"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Antenuptual Contract (ANC)
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Power of Attorney Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Power of Attorney Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload("Upload Your Living Will")
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Living Will
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Real Estate Property Detail"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Real Estate Property Detail
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Farm Property Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Farm Property Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Vehicle/s Details (cars, boats and motorcycles etc.)"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Vehicle/s Details (cars, boats and motorcycles
                    etc.)
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Valuable Possessions Details (artwork and jewellery etc.)"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Valuable Possessions Details (artwork and
                    jewellery etc.)
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Household Contents Value Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Household Contents Value Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Investment Portfolio Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Investment Portfolio Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Businesses Interests or Ownership Stake Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Businesses Interests or Ownership Stake Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Intellectual Property Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Intellectual Property Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Trust Asset Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Trust Asset Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Mortgage Loan Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Mortgage Loan Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Personal Loan Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Personal Loan Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Vehicle Loan Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Vehicle Loan Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Life Insurance Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Life Insurance Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Health Insurance Policy Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Health Insurance Policy Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Property Insurance Policy Detail"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Property Insurance Policy Detail
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Vehicle Insurance Policy Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Vehicle Insurance Policy Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Funeral Cover Policy Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Funeral Cover Policy Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Investment Bond Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Investment Bond Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Mutual Fund Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Mutual Fund Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Retirement Fund Details"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Retirement Fund Details
                  </button>
                  <br />
                  <button
                    onClick={() =>
                      handleButtonStage101FinalUpload(
                        "Upload Your Court Ordered Maintenance Obligations"
                      )
                    }
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Upload Your Court Ordered Maintenance Obligations
                  </button>
                  <br />
                  <button
                    onClick={() => handleButtonStage101FinalUpload("Continue")}
                    className="px-2 py-2 mb-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {message.content.includes(
              "Thank you for uploading your documents!"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-1 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Now before we wrap up, could you please share your email
                  address with us? This will be used by an Old Mutual financial
                  adviser who will contact you directly regarding your estate
                  plan and provide any necessary guidance.
                </div>
                <br />
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Please enter your email address.
                </div>
              </>
            )}

            {message.content.includes(
              "A report has been generated containing all the results from this chat. You can download a copy below."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-1 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  This report along with your documents will be shared with an
                  Old Mutual financial adviser who will use this information to
                  finalise your estate plan.
                </div>
                <br />
                <div className="space-x-2 ml-16 my-2">
                  <button
                    onClick={() =>
                      handleButtonStageDownloadReport("Download Report")
                    }
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Download Report
                  </button>
                </div>
              </>
            )}

            {message.content.includes("Thanks for sharing your thoughts,") && (
              <>
                <div className="space-x-2 ml-16 my-1">
                  <SelectableButtonGroup
                    options={["Yes, I have a question", "No"]}
                    handleSelection={handleButtonStage20Final}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "The success of your estate plan relies on accurate information about your assets, liabilities, and clear communication of your wishes. How confident are you in the accuracy of the details you’ve provided so far? And would you be open to regularly reviewing and updating your estate plan to reflect any changes?"
            ) && (
              <>
                <div className="space-x-2 ml-16 my-1">
                  <SelectableButtonGroup
                    options={["Yes", "No"]}
                    handleSelection={handleButtonStage20}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Reducing taxes and expenses payable upon your death can help maximise the value passed on to your heirs. How high a priority is it for you to minimise these costs?"
            ) && (
              <>
                <div className="space-x-2 ml-16 -mt-1">
                  <TaxesSlider onProceed={handleButtonStage20Payable} />
                </div>
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
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  🏦 <b>Complex Estates:</b>
                  <br />
                  If you have a large or complex estate, a lawyer can help
                  navigate intricate legal requirements and tax implications.
                  <br />
                  <br />
                  ⚖️ <b>Disputes:</b>
                  <br />
                  If you anticipate family disputes or have a blended family,
                  legal advice can ensure your wishes are clear and enforceable.
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
                  assist, free of charge when consulting via financial adviser.
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
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

            {message.content.includes(
              "Great! Let’s move on to the next section where we’ll discuss your objectives for estate planning. Ready?"
            ) && (
              <>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
                    onClick={() => handleButtonStage15v2("Yes, I'm ready")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes, I'm ready
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
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  ❓ What is estate planning?
                  <br />
                  Estate planning is the process of arranging for the management
                  and disposal of a person’s estate during their life and after
                  death. It involves creating documents like wills, trusts, and
                  powers of attorney. 📝💼
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
                  A trust is a legal arrangement where a trustee manages assets
                  on behalf of beneficiaries. Trusts can help manage assets,
                  reduce estate taxes, and provide for beneficiaries according
                  to your wishes. 🏦🔐
                  <br />
                  <br />
                  ❓ When should I seek legal advice for estate planning?
                  <br />
                  It’s advisable to seek legal advice if you have a large or
                  complex estate, anticipate family disputes, own a business, or
                  need to stay updated with changing laws. 🧑‍⚖️💡
                  <br />
                  <br />
                  Do you have any other questions or need further information?
                  I’m here to help! 🤝💬
                </div>
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <button
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
                <div className="space-x-2 ml-14 -mt-4">
                  <br />
                  <SelectableButtonGroup
                    options={["Yes, I have a question", "No, let’s move on"]}
                    handleSelection={handleButtonStage12}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "It’s important to understand the legal requirements and considerations specific to South Africa:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Here are some important acts and considerations:
                </div>
                <div className="space-x-2 ml-16 mt-4 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <b className="block mb-2">Wills Act 7 of 1953 📝</b>
                  The Wills Act governs the creation and execution of wills.
                  Your will must be in writing, signed by you, and witnessed by
                  two people who are not beneficiaries.
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Estate Duty Act 45 of 1955 💼
                  </b>
                  This Act imposes estate duty (a form of tax) on the estate of
                  a deceased person. The first R3.5 million of an estate is
                  exempt from estate duty.
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Intestate Succession Act 81 of 1987 📋
                  </b>
                  If you die without a will, the Intestate Succession Act
                  determines how your estate will be distributed. This may not
                  align with your wishes, so having a will is crucial.
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Marital Property Regimes 💍
                  </b>
                  Your marital status can affect your estate planning. South
                  Africa recognises different marital property regimes, such as
                  community of property, antenuptial contract (ANC), and ANC
                  with accrual. It’s important to consider how these will impact
                  your estate.
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Master of the High Court 🏛️
                  </b>
                  The Master of the High Court oversees the administration of
                  deceased estates. Executors of estates must be appointed and
                  approved by the Master.
                  <br />
                  <br />
                  Understanding these components and local laws can help ensure
                  that your estate plan is comprehensive and legally sound. 📚✅
                  <br />
                </div>
                <br />
                <div className="space-x-2 ml-16 mt-4 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <br />
                  In South Africa, there are various types of marriages:
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Civil Marriage 📜
                  </b>
                  A formal marriage registered with Home Affairs, governed by
                  the Marriage Act, 1961. (This is the most common and
                  traditional form as we know it). Can be in or out of community
                  of property (with or without the accrual).
                  <ul className="list-disc list-inside">
                    <li>
                      Must be conducted by a marriage officer authorised by Home
                      Affairs.
                    </li>
                    <li>
                      Both parties must be at least 18 years old (or 16 with
                      parental consent).
                    </li>
                    <li>
                      Requires submission of documents such as identity
                      documents and proof of dissolution of previous marriages,
                      if applicable.
                    </li>
                  </ul>
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Customary Marriage 🎎
                  </b>
                  A marriage conducted according to indigenous/black South
                  African customs, recognised under the Recognition of Customary
                  Marriages Act, 1998. The default property regime is in
                  community of property, but parties can decide on out of
                  community of property.
                  <ul className="list-disc list-inside">
                    <li>
                      Must adhere to the customs of the community to which the
                      parties belong.
                    </li>
                    <li>
                      Typically involves rituals and ceremonies traditional to
                      the community.
                    </li>
                    <li>
                      Must be registered with the Department of Home Affairs to
                      be legally recognised.
                    </li>
                  </ul>
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Religious Marriage
                  </b>
                  A marriage conducted according to religious rites but not
                  necessarily registered with Home Affairs.
                  <ul className="list-disc list-inside">
                    <li>
                      Varies depending on the religion (e.g., temple wedding).
                    </li>
                    <li>
                      Should be registered with the Department of Home Affairs
                      to gain legal status.
                    </li>
                    <li>Not all religious marriages are recognised.</li>
                  </ul>
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Civil Union 🏳️‍🌈
                  </b>
                  Recognised under the Civil Union Act, 2006, and can be entered
                  into by same-sex or opposite-sex couples. Carries the same
                  legal standing as persons married in terms of the Marriage
                  Act.
                  <ul className="list-disc list-inside">
                    <li>
                      Must be performed by a registered civil union officer.
                    </li>
                    <li>
                      Parties can choose between a marriage-like relationship or
                      a domestic partnership.
                    </li>
                  </ul>
                  <br />
                  <b style={{ marginLeft: "-1px" }} className="block mb-2">
                    Co-habitation 🏡
                  </b>
                  Not legally recognised as marriage. There is no such thing as
                  a common-law marriage in South African law. Simply living
                  together does not create a legal marriage-like status.
                  <ul className="list-disc list-inside">
                    <li>
                      A marriage that is not recognised under civil law is not
                      considered a legal marriage in South Africa, with a few
                      exceptions.
                    </li>
                    <li>
                      This can have implications on your estate plan as you can
                      be considered single/unmarried if your marriage is not
                      registered with Home Affairs.
                    </li>
                  </ul>
                </div>
                <div className="space-x-2 ml-16 mt-4 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Do you have any questions at this stage?
                </div>
                <div className="space-x-2 ml-16 mt-4">
                  <SelectableButtonGroup
                    options={["Yes, I have a question.", "No, let’s move on"]}
                    handleSelection={handleButtonStage13v2v1}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Estate duty is a tax that has an impact on your estate. Do you want to explore estate duty further?"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-4">
                  <SelectableButtonGroup
                    options={["Yes", "No, let’s move on"]}
                    handleSelection={handleButtonStage13EstateDuty}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "This tax is levied on the total value of a deceased person’s estate. The conditions include:"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  <b>Threshold</b> 💰
                  <br />
                  There is a basic threshold (exemption limit) below which no
                  estate duty is payable. In South Africa, as of 2024, this is
                  R3.5 million. Meaning, only estates or portions of an estate
                  that exceed R3.5 million are estate dutiable.
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }}>Rates</b> 📊
                  <br />
                  The estate duty rate is generally 20% on the value above the
                  threshold. For amounts exceeding R30 million, a higher rate of
                  25% applies.
                  <br />
                  <br />
                  <em>
                    <b style={{ marginLeft: "-8px" }}>Example 1</b>: Peter’s
                    estate is worth R5 million. His estate will be liable for
                    estate duty as follows:
                    <br />
                    R5m - R3.5m = R1.5m
                    <br />
                    R1.5m x 20% = R300,000 payable.
                    <br />
                    <br />
                    <b style={{ marginLeft: "-1px" }}>Example 2</b>: Peter’s
                    estate is worth R50 million. His estate will be liable for
                    estate duty as follows:
                    <br />
                    20% x R30m
                    <br />
                    25% x (R50m - R30m)
                  </em>
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }}>Deductions</b> 📝
                  <br />
                  Certain deductions can be applied, such as liabilities and
                  bequests to charities.
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }}>
                    Farm Property Exemption
                  </b>{" "}
                  🚜
                  <br />
                  Farm valuation exemption for estate duty provides for a
                  deduction of up to R30 million on the value of farm property
                  from the estate duty calculation. The R30 million of the value
                  of qualifying farm property is not subject to estate duty.
                  <br />
                  <em style={{ marginLeft: "-2px" }}>
                    Example: If a farm is valued at R50 million and qualifies
                    for the full exemption, only R20 million would be subject to
                    estate duty, potentially reducing the estate duty payable.
                  </em>
                  <br />
                  <br />
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Do you have any questions regarding estate duty at this stage?
                </div>
                <div className="space-x-2 ml-16 mt-4">
                  <SelectableButtonGroup
                    options={["Yes, I have a question", "No, let’s move on"]}
                    handleSelection={handleButtonStage13v2}
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "Property is a common asset that is bequeathed in estate plans. Farms in particular have specific bequeathing conditions. Do you want to explore these conditions further?"
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-4">
                  <SelectableButtonGroup
                    options={["Yes", "No, does not apply to me"]}
                    handleSelection={(option: any) =>
                      handleButtonStage13v3(option)
                    }
                  />
                </div>
              </>
            )}

            {message.content.includes(
              "A farm may only be sold to one person or entity and as such, the offer to purchase cannot be made by more than one person. An exception to this would be if a couple is married in community of property as South African law views their estate as one."
            ) && (
              <>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  As with the case of agricultural land being bequeathed to
                  multiple heirs, the consent of the Minister may be requested
                  in order to grant permission for the sale of agricultural land
                  to more than one person. This consent must be sought prior to
                  the agreement of sale being concluded and therefore an offer
                  to purchase by multiple purchasers can only be made after the
                  owner has received the Minister's consent. 🌾
                  <br />
                  <br />
                  Some title deeds (of farms) may include conditions about who
                  can inherit the farm or whether the land can be sold or
                  subdivided. This would be an instance of:
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }}>Fideicommissum</b>🔹
                  <br />
                  A legal arrangement where the owner of an asset leaves it to
                  someone with the condition that, after their death, the asset
                  will be passed on to another person or group.
                  <br />
                  <em style={{ marginLeft: "-1px" }}>
                    For example, you might leave your farm to your children with
                    the condition that, after their death, it will go to your
                    grandchildren. 📋
                  </em>
                  <br />
                  <br />
                  <b style={{ marginLeft: "-1px" }}>Usufruct</b>🔹
                  <br />
                  Gives someone the right to use and benefit from an asset (like
                  living in a house 🏠 or earning income from a property 💰)
                  without owning it.
                  <br />
                  The person with usufruct has control over the asset for a
                  certain period, but they can't sell or permanently alter it.
                  <br />
                  <em style={{ marginLeft: "-1px" }}>
                    For instance, if you have usufruct over a property, you can
                    live in it or rent it out, but you can't sell the property.
                    💡
                  </em>
                </div>
                <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Do you have any questions regarding bequeathing a farm at this
                  stage?
                </div>
                <div className="space-x-2 ml-16 mt-3">
                  <SelectableButtonGroup
                    options={["Yes, I have a question", "No, let’s move on"]}
                    handleSelection={(option: any) =>
                      handleButtonStage13(option)
                    }
                  />
                </div>
              </>
            )}

            {/* {educationInformation && (
                <>
                 
                  <div className="space-x-2 ml-16 mt-4">
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
                  <div className="space-x-2 ml-16 mt-4">
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
                <div className="space-x-2 ml-16 mt-2 -mb-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
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
                  📑 Beneficiary Designation Forms
                  <br />
                  ⚖️ Executor
                  <br />
                  🛡️ Guardian
                  <br />
                  <br />
                  Would you like a detailed explanation of all or some of these
                  terms?
                </div>
                <div className="space-x-2 ml-14 mt-2">
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
                        } w-full sm:w-[400px]`}
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
                    className={`mt-4 px-4 py-2 rounded-md border border-[#8DC63F] ${
                      detailedProceed
                        ? "bg-[#8DC63F] text-white"
                        : "text-[#8DC63F]"
                    }`}
                  >
                    Proceed
                  </button>
                </div>
                <br />
                <br />
              </>
            )}

            {message.content.includes(
              "Here are the definition of key terms:"
            ) && (
              <>
                {selectedTerms.length > 0 && (
                  <>
                    <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      {/* If 'All Key Terms' is selected, show all definitions */}
                      {selectedTerms.includes("All Key Terms") ? (
                        <>
                          {/* Show all terms at once */}
                          📜 Wills
                          <br />
                          A will is a legal document that says how you want your
                          belongings, money, and assets to be divided after you
                          pass away. It also names someone to carry out your
                          wishes (an executor) and can appoint guardians for
                          your children.
                          <br />
                          <br />
                          🔐 Trusts
                          <br />
                          A trust is a legal arrangement where you (the
                          founder/settlor) place assets, like money or property,
                          into a separate entity managed by a person (the
                          trustee) for the benefit of someone else (the
                          beneficiary). The trustee manages these assets
                          according to your instructions, often to provide for
                          beneficiaries over time, such as children or loved
                          ones. A trust can be set up in your will and will come
                          into existence when you pass away, or it can be set up
                          while you are alive.
                          <br />
                          <br />
                          🖋️ Power of Attorney
                          <br />
                          A power of attorney is a legal document that allows
                          you to give someone else the authority to make
                          decisions for you. It could be about financial
                          matters, health care, or other personal affairs,
                          especially if you’re unable to handle them yourself.
                          <br />
                          <br />
                          🏥 Living Will
                          <br />
                          A living will is a document where you write down your
                          wishes about medical care if you’re unable to
                          communicate. It’s about what kind of treatments you do
                          or don’t want if you’re seriously ill or injured and
                          can’t speak for yourself.
                          <br />
                          <br />
                          💼 Beneficiaries
                          <br />
                          Beneficiaries are the people you choose to receive
                          your money, assets, or other benefits when you pass
                          away. They are named in your insurance policies or
                          retirement benefit forms.
                          <br />
                          <br />
                          📑 Beneficiary Designation Forms
                          <br />
                          For assets like retirement accounts, life insurance,
                          or certain bank accounts, you may need to fill out a
                          form naming who gets those assets after you pass away.
                          These forms typically override what’s written in a
                          will or trust.
                          <br />
                          <br />
                          ⚖️ xecutor
                          <br />
                          The person named in your will who is responsible for
                          carrying out your wishes after you pass away,
                          including paying debts and distributing assets to
                          beneficiaries.
                          <br />
                          <br />
                          🛡️ Guardian
                          <br />
                          If you have minor children, you can name a guardian in
                          your will. This person will be responsible for taking
                          care of your children if something happens to you.
                          <br />
                          <br />
                        </>
                      ) : (
                        <>
                          {/* Show individual terms if 'All Key Terms' is not selected */}
                          {selectedTerms.includes("Wills") && (
                            <>
                              📜 Wills
                              <br />
                              A will is a legal document that says how you want
                              your belongings, money, and assets to be divided
                              after you pass away. It also names someone to
                              carry out your wishes (an executor) and can
                              appoint guardians for your children.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedTerms.includes("Trusts") && (
                            <>
                              🔐 Trusts
                              <br />
                              A trust is a legal arrangement where you (the
                              founder/settlor) place assets, like money or
                              property, into a separate entity managed by a
                              person (the trustee) for the benefit of someone
                              else (the beneficiary). The trustee manages these
                              assets according to your instructions, often to
                              provide for beneficiaries over time, such as
                              children or loved ones. A trust can be set up in
                              your will and will come into existence when you
                              pass away, or it can be set up while you are
                              alive.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedTerms.includes("Power of Attorney") && (
                            <>
                              🖋️ Power of Attorney
                              <br />
                              A power of attorney is a legal document that
                              allows you to give someone else the authority to
                              make decisions for you. It could be about
                              financial matters, health care, or other personal
                              affairs, especially if you’re unable to handle
                              them yourself.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedTerms.includes("Living Will") && (
                            <>
                              🏥 Living Will
                              <br />
                              A living will is a document where you write down
                              your wishes about medical care if you’re unable to
                              communicate. It’s about what kind of treatments
                              you do or don’t want if you’re seriously ill or
                              injured and can’t speak for yourself.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedTerms.includes("Beneficiaries") && (
                            <>
                              💼 Beneficiaries
                              <br />
                              Beneficiaries are the people you choose to receive
                              your money, assets, or other benefits when you
                              pass away. They are named in your insurance
                              policies or retirement benefit forms.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedTerms.includes(
                            "Beneficiary Designation Forms"
                          ) && (
                            <>
                              📑 Beneficiary Designation Forms
                              <br />
                              For assets like retirement accounts, life
                              insurance, or certain bank accounts, you may need
                              to fill out a form naming who gets those assets
                              after you pass away. These forms typically
                              override what’s written in a will or trust.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedTerms.includes("Executor") && (
                            <>
                              ⚖️ Executor
                              <br />
                              The person named in your will who is responsible
                              for carrying out your wishes after you pass away,
                              including paying debts and distributing assets to
                              beneficiaries.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedTerms.includes("Guardian") && (
                            <>
                              🛡️ Guardian
                              <br />
                              If you have minor children, you can name a
                              guardian in your will. This person will be
                              responsible for taking care of your children if
                              something happens to you.
                              <br />
                              <br />
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}

                <div className="space-x-2 ml-16 mt-4">
                  <button
                    onClick={() => handleButtonStage12("Proceed")}
                    className={`px-4 py-2 mb-1 rounded-md border border-[#8DC63F] ${
                      stage12Proceed === "Proceed"
                        ? "bg-[#8DC63F] text-white"
                        : "text-[#8DC63F]"
                    }`}
                  >
                    Proceed
                  </button>
                </div>
              </>
            )}

            {message.content.includes(
              "Here are the potential outcomes of each scenario:"
            ) && (
              <>
                {selectedScenario.length > 0 && (
                  <>
                    <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                      {selectedScenario.includes("All Scenarios") ? (
                        <>
                          <b>Scenario 1: Setting Up a Trust</b>
                          <br />
                          Imagine you set up a trust to manage your assets. The
                          trust could be used to provide for your children’s
                          education and care until they reach adulthood. This
                          can protect the assets from being mismanaged or spent
                          too quickly. Additionally, trusts can offer tax
                          benefits and ensure a smoother transfer of assets to
                          your beneficiaries.
                          <br /> <br />
                          <b style={{ marginLeft: "-1px" }}>
                            Scenario 2: Dying Intestate (Without a Will)
                          </b>
                          <br />
                          Suppose you pass away without a will. According to
                          South Africa’s Intestate Succession Act, your estate
                          will be distributed to your surviving spouse and
                          children, or other relatives if you have no spouse or
                          children. This may not align with your personal wishes
                          and could lead to disputes among family members.
                          <br /> <br />
                          <b style={{ marginLeft: "-1px" }}>
                            Scenario 3: Appointing a Power of Attorney
                          </b>
                          <br />
                          Consider appointing a trusted person as your power of
                          attorney. This individual can manage your financial
                          and legal affairs if you become incapacitated. For
                          example, they could pay your bills, manage your
                          investments, or make medical decisions on your behalf.
                          This ensures that your affairs are handled according
                          to your wishes, even if you’re unable to communicate
                          them.
                          <br /> <br />
                          <b style={{ marginLeft: "-1px" }}>
                            Scenario 4: Tax Implications of Estate Planning
                            Decisions
                          </b>
                          <br />
                          Imagine you decide to gift a portion of your assets to
                          your children during your lifetime. While this can
                          reduce the size of your taxable estate, it’s important
                          to consider any potential gift taxes and how it might
                          impact your overall estate plan. Consulting with a tax
                          adviser can help you understand the best strategies
                          for minimising tax liabilities while achieving your
                          estate planning goals.
                          <br />
                        </>
                      ) : (
                        <>
                          {selectedScenario.includes("Scenario 1") && (
                            <>
                              <b>Scenario 1: Setting Up a Trust</b>
                              <br />
                              Imagine you set up a trust to manage your assets.
                              The trust could be used to provide for your
                              children’s education and care until they reach
                              adulthood. This can protect the assets from being
                              mismanaged or spent too quickly. Additionally,
                              trusts can offer tax benefits and ensure a
                              smoother transfer of assets to your beneficiaries.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedScenario.includes("Scenario 2") && (
                            <>
                              <b>
                                Scenario 2: Dying Intestate (Without a Will)
                              </b>
                              <br />
                              Suppose you pass away without a will. According to
                              South Africa’s Intestate Succession Act, your
                              estate will be distributed to your surviving
                              spouse and children, or other relatives if you
                              have no spouse or children. This may not align
                              with your personal wishes and could lead to
                              disputes among family members.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedScenario.includes("Scenario 3") && (
                            <>
                              <b>Scenario 3: Appointing a Power of Attorney</b>
                              <br />
                              Consider appointing a trusted person as your power
                              of attorney. This individual can manage your
                              financial and legal affairs if you become
                              incapacitated. For example, they could pay your
                              bills, manage your investments, or make medical
                              decisions on your behalf. This ensures that your
                              affairs are handled according to your wishes, even
                              if you’re unable to communicate them.
                              <br />
                              <br />
                            </>
                          )}

                          {selectedScenario.includes("Scenario 4") && (
                            <>
                              <b>
                                Scenario 4: Tax Implications of Estate Planning
                                Decisions
                              </b>
                              <br />
                              Imagine you decide to gift a portion of your
                              assets to your children during your lifetime.
                              While this can reduce the size of your taxable
                              estate, it’s important to consider any potential
                              gift taxes and how it might impact your overall
                              estate plan. Consulting with a tax adviser can
                              help you understand the best strategies for
                              minimising tax liabilities while achieving your
                              estate planning goals.
                              <br />
                              <br />
                            </>
                          )}
                        </>
                      )}
                    </div>
                    <br />
                    <br />
                    <br />
                    <br />
                    {/* <div className="space-x-2 ml-16 mt-2 bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                        Now that we’ve explored these scenarios, do you have any
                        questions or need further information? I’m here to help!
                      </div>
                      <br />
                      <br />
                      <div className="space-x-2 ml-16 -mt-1">
                        <SelectableButtonGroup
                          options={[
                            "Yes, I have a question",
                            "No, let's move on",
                          ]}
                          handleSelection={handleButtonStage13Component}
                        />
                      </div> */}
                  </>
                )}
              </>
            )}

            {/* {askingConsent && (
                <div className="space-x-2 ml-16 mt-4">
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
                      estate plan. We do not share your data with third parties
                      without your explicit consent.
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
                      <strong>Privacy Policy:</strong> For detailed information,
                      you can read our full privacy policy{" "}
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
                    Would you like to proceed with consenting to data collection
                    and storage?
                  </p>
                </div>
                <div className="space-x-2 ml-16 mt-4">
                  <button
                    onClick={() => handleButtonPrivacy("Yes, I consent")}
                    className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                  >
                    Yes, I consent
                  </button>
                  <button
                    onClick={() => handleButtonPrivacy("No, I do not consent")}
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
                <div className="space-x-2 ml-16 mt-4">
                  <SelectableButtonGroup
                    options={["Yes, I’m ready to move on", "Skip"]}
                    handleSelection={(option: any) =>
                      handleButtonStage13v1(option)
                    }
                  />
                </div>
              </>
            ) : null}

            {video && (
              <div className="space-x-2 ml-16 mt-4">
                <button
                  onClick={() => handleButtonClick("Yes, I want to watch")}
                  className="px-2 py-2 rounded-md border border-[#8DC63F] mb-1 text-[#8DC63F]"
                >
                  Yes, I want to watch
                </button>
                <button
                  onClick={() => handleButtonClick("No, I don't want to watch")}
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
                    media accounts, digital currencies 🌐💰, and online business
                    interests, reflecting our increasingly digital lives.
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
                    Please list the assets and people or organisations you want
                    to leave them to. If you'd rather not type it all out, you
                    can upload a document instead
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
       <div className="ml-8 fixed inset-0 flex items-end w-full md:w-4/5 lg:w-4/5 xl:w-4/5 mx-auto">



          <div className="bg-[#212121] shadow-md rounded-lg w-full h-full">
            {/* Header Section */}
            <div className="p-4 text-white rounded-t-lg items-center mt-12">
              <div className="flex justify-center -mt-12 space-x-4">
                <div className="text-lg font-semibold text-center text-4xl">
                  <p className="text-center text-2xl font-bold">
                    Welcome to GIA (Guidance for Inheritance and Assets)
                  </p>
                </div>

                
              </div>

              {/* Button Section */}
              

             {/* Buttons centered at the top */}
              {isStartTab ? (
          <div className="flex justify-center items-center mt-4 space-x-4">
            {/* Plan My Estate Button */}
            <button
              className={`border-2 px-6 py-2 rounded-md font-medium ${
                !isEstatePlanningTabOpen
                  ? "bg-[#009677] text-white"
                  : "bg-transparent text-[#009677]"
              } border-[#009677]`}
              onClick={() => setEstatePlanningTabOpen(false)}
            >
              Plan My Estate
            </button>
            

            {/* Learn About Estate Planning Button */}
            <button
              className={`border-2 px-6 py-2 rounded-md font-medium ${
                isEstatePlanningTabOpen
                  ? "bg-[#009677] text-white"
                  : "bg-transparent text-[#009677]"
              } border-[#009677]`}
              onClick={() => setEstatePlanningTabOpen(true)}
            >
              Learn About Estate Planning
            </button>
          </div>
          ) : null}
         

              {/* Modal Popup */}
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-[#2f2f2f] text-white rounded-lg w-[90%] max-w-5xl p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-bold leading-tight">
                        Estate Planning FAQs
                      </h2>
                      <button
                        className="text-white text-2xl hover:text-gray-300"
                        onClick={handleModalToggle}
                      >
                        ✖
                      </button>
                    </div>
                    <p className="mb-6 text-base leading-relaxed">
                      Here are some frequently asked questions about estate
                      planning in South Africa:
                    </p>

                    {/* Scrollable FAQ Content with custom scrollbar and right padding */}
                    <div className="space-y-4 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-9 scrollbar-thin scrollbar-thumb-[#8DC63F] scrollbar-track-[#2f2f2f]">
                      {[
                        {
                          question: "What is estate planning? 🧾",
                          answer:
                            "Estate planning is the process of arranging for the management and disposal of a person’s estate during their life and after death. It involves creating documents like wills, trusts, and powers of attorney.",
                        },
                        {
                          question: "Why is having a will important? 📄",
                          answer:
                            "A will ensures your assets are distributed according to your wishes, names guardians for minor children, and can help reduce estate taxes and legal fees.",
                        },
                        {
                          question: "What happens if I die without a will? ⚖️",
                          answer:
                            "If you die intestate (without a will), your estate will be distributed according to South Africa’s Intestate Succession Act, which may not align with your wishes.",
                        },
                        {
                          question:
                            "Can I change my will after it’s been created? 💼",
                          answer:
                            "Yes, you can update your will as often as you like. It’s recommended to review and update it after major life events, such as marriage, divorce, or the birth of a child.",
                        },
                        {
                          question:
                            "What is a trust and why would I need one? 🔒",
                          answer:
                            "A trust is a legal arrangement where a trustee manages assets on behalf of beneficiaries. Trusts can help manage assets, reduce estate taxes, and provide for beneficiaries according to your wishes.",
                        },
                        {
                          question:
                            "When should I seek legal advice for estate planning? 🏛️",
                          answer:
                            "It’s advisable to seek legal advice if you have a large or complex estate, anticipate family disputes, own a business, or need to stay updated with changing laws.",
                        },
                      ].map((faq, index) => (
                        <div key={index}>
                          <p className="font-semibold text-lg">
                            {`${index + 1}. ${faq.question}`}
                          </p>
                          <p>{faq.answer}</p>
                        </div>
                      ))}
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
                      <h2 className="text-4xl font-bold">
                        Contact a Financial Adviser
                      </h2>
                      <button
                        className="text-white text-2xl hover:text-gray-300"
                        onClick={handleAdvisorModalToggle}
                      >
                        ✖
                      </button>
                    </div>
                    <p className="mb-6 text-xl">
                      Fantastic! Our financial advisers at Old Mutual are ready
                      to assist you in filling out these templates. Please reach
                      out to us directly to schedule a consultation and receive
                      personalised guidance. Here's how you can get in touch:
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
                          <p>
                            Send us an email with your contact details, and
                            we'll get back to you promptly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="app-container">
              {!isEstatePlanningTabOpen && (
            <ProgressSidebar currentStage={currentChatStage} />
              )}
          
            <div
              id="chat-container"
              className="flex flex-col h-screen" // This ensures the layout takes up the entire screen height
            >
              <div
                id="chatbox"
                className="flex-grow p-4 overflow-y-auto"
                ref={
                  activeTab === "originalChat"
                    ? originalChatRef
                    : estatePlanningChatRef
                }
              >
                {renderMessages() || <div className="italic">typing...</div>}
              </div>
              <form
                className="w-full rounded-3xl"
                style={{ marginBottom: isStartTab ? "0px" : "-35px" }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (isEstatePlanningTabOpen == true) {
                    // e.preventDefault();
                    // handleSubmit(e);
                    // setIsThinking(true);
                    if (isResponse.current == "1") {
                      console.log("dataProvided1", "isresponse 1");
                      //
                      analyzeEstatePlanningMessage(inputStr);
                      // handleSubmit(e);
                    }
                    console.log("dataProvided", "Second 1");
                  } else {
                    console.log("dataProvided", "Original 1");
                    e.preventDefault();
                    setIsThinking(true);
                    if (isResponse.current == "1") {
                      e.preventDefault();
                      handleSubmit(e);
                    } else if (
                      messageData.current.includes(
                        "Great! Please provide the above mentioned details."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        realEstateProperties: {
                          propertiesDetails: inputStr,
                        },
                      });
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
                        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?"
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        vehicleProperties: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?"
                      );
                    } else if (
                      messageData.current.includes(
                        "Do you own a farm? Please provide details of the farm, such as location, estimated value, and any notable items you would like to include in your estate plan."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        farmProperties: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "How many vehicles (cars, boats, caravans, motorcycles etc) do you own, and what are their makes, models, and estimated values?"
                      );
                    } else if (
                      messageData.current.includes(
                        "Are there any valuable possessions such as artwork, jewellery, or collectibles that you own? If so, could you describe each item and estimate its value?"
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        valuablePossessions: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan."
                      );
                    } else if (
                      messageData.current.includes(
                        "What is the estimated value of your household effects/content e.g. furniture, appliances etc. Your short-term insurance cover amount for household content can be used. If yes, please provide details about each item, including its type, estimated value, and any notable items you would like to include in your estate plan."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        householdEffects: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment."
                      );
                    } else if (
                      messageData.current.includes(
                        "Can you provide details about your investment portfolio, including stocks, bonds, mutual funds, retirement accounts, and any other investment holdings? Please specify the quantity, type, and current value of each investment."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        investmentPortfolio: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account."
                      );
                    } else if (
                      messageData.current.includes(
                        "Do you have any cash savings or deposits in bank accounts? If yes, please provide the approximate balances for each account."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        bankBalances: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value."
                      );
                    } else if (
                      messageData.current.includes(
                        "Do you have any business interests or ownership stakes in companies? If yes, please provide details about each business, including its type, ownership percentage, and estimated value."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        businessAssets: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values."
                      );
                    } else if (
                      messageData.current.includes(
                        "Are there any other significant assets not mentioned that you would like to include in your estate plan? If so, please describe them and provide their estimated values."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        otherAssets: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset."
                      );
                    } else if (
                      messageData.current.includes(
                        "Do you own any intellectual property rights, such as patents, trademarks, or copyrights? If yes, please provide details about each intellectual property asset."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        intellectualPropertyRights: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within."
                      );
                    } else if (
                      messageData.current.includes(
                        "Are there any assets held in trust or other legal entities? If yes, please specify the nature of the trust or entity and describe the assets held within."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        assetsInTrust: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
                      );
                      setCurrentChatStage(4);
                    } else if (
                      messageData.current.includes(
                        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
                      )
                    ) {
                      e.preventDefault();

                      handleAddAIResponse(
                        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan."
                      );
                      await saveUserProfile({
                        outstandingMortgageLoans: {
                          propertiesDetails: inputStr,
                        },
                      });
                    } else if (
                      messageData.current.includes(
                        "Are there any personal loans you currently owe? If so, please provide details on the outstanding amount and the purpose of the loan."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        personalLoans: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card."
                      );
                    } else if (
                      messageData.current.includes(
                        "Do you have any credit card debt? If yes, please specify the total amount owed and the interest rates associated with each card."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        creditCardDebt: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed."
                      );
                    } else if (
                      messageData.current.includes(
                        "Are there any loans for vehicles you own? If so, please provide details on the outstanding balance and the vehicles financed."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        vehicleLoans: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
                      );
                    } else if (
                      messageData.current.includes(
                        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        otherOutstandingDebts: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Do you have a strategy in place for managing and reducing your liabilities over time?"
                      );
                    } else if (
                      messageData.current.includes(
                        "Do you have a strategy in place for managing and reducing your liabilities over time?"
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        strategyLiabilities: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Are there any significant changes expected in your liabilities in the foreseeable future?"
                      );
                    } else if (
                      messageData.current.includes(
                        "Are there any significant changes expected in your liabilities in the foreseeable future?"
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        foreseeableFuture: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
                      );
                      setCurrentChatStage(5);
                    } else if (
                      messageData.current.includes(
                        "Great! Please provide the above mentioned details of your vehicle with their estimated values."
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
                    } else if (
                      messageData.current.includes(
                        "I know estate planning can be daunting"
                      )
                    ) {
                      e.preventDefault();
                      setUserName(inputStr);
                      userProfile(inputStr);
                      handleAddAIResponse(
                        "Nice to meet you, " +
                          inputStr +
                          ". When were you born?"
                      );
                    } else if (
                      messageData.current.includes("When were you born?")
                    ) {
                      e.preventDefault();
                      saveDateOfBirth(inputStr);

                      setInputStr("");
                      setIsFormSubmitted(true);
                    } else if (
                      messageData.current.includes(
                        "Do you have any dependents?"
                      )
                    ) {
                      e.preventDefault();

                      handleAddAIResponse(
                        "Got it. How many dependents over the age of 18 do you have?"
                      );
                    } else if (
                      messageData.current.includes(
                        "Got it. How many dependents over the age of 18 do you have?"
                      )
                    ) {
                      e.preventDefault();
                      saveDependentsOver(inputStr);
                      handleAddAIResponse(
                        "And how many dependents under the age of 18 do you have?"
                      );
                    } else if (
                      messageData.current.includes(
                        "And how many dependents under the age of 18 do you have?"
                      )
                    ) {
                      e.preventDefault();
                      saveDependentsUnder(inputStr);
                      handleAddAIResponse(
                        "Thank you for sharing, " +
                          userName +
                          ". Is there anything else you’d like to add about your personal particulars or any questions you have at this stage?"
                      );
                    } else if (
                      messageData.current.includes(
                        "Buy and sell insurance is designed to ensure that"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "For business owners, key person insurance can help the business survive the loss of a crucial employee. Do you have this in place?"
                      );
                    }

                    //NEW ADDED
                    else if (
                      messageData.current.includes(
                        "Key person insurance provides financial support to your business"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any other types of insurance not already covered? Please provide details about the type of coverage and the insurance provider."
                      );
                    } else if (
                      messageData.current.includes(
                        "I recommend reviewing your current disability insurance policy to understand any limitations"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have contingent liability insurance to cover unexpected liabilities that may arise?"
                      );
                    }

                    //Investment Portfolio NEW
                    else if (
                      messageData.current.includes(
                        "Understanding your investment goals and risk tolerance"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Are there any specific changes or adjustments you're considering making to your investment portfolio in the near future?"
                      );
                    } else if (
                      messageData.current.includes(
                        "It's always a good idea to periodically review your"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Great! Next, we’ll discuss estate duty. Shall we continue?"
                      );
                      setCurrentChatStage(6);
                    }

                    //ASSET
                    else if (
                      messageData.current.includes(
                        "Great! Please provide the above mentioned details of your vehicle loan"
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        vehicleLoans: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Are there any other outstanding debts or financial obligations that you have? This may include student loans, medical bills, or any other loans or accounts. Please specify the type of debt and the outstanding amount."
                      );
                    } else if (
                      messageData.current.includes(
                        "To help you estimate the value of your property, let’s go through a few simple steps. This will give you a rough idea of what your property could be worth."
                      )
                    ) {
                      e.preventDefault();

                      await saveUserProfile({
                        realEstateProperties: {
                          inDepthDetails: { propertyType: inputStr },
                        },
                      });

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
                      setCurrentChatStage(4);
                    } else if (
                      messageData.current.includes(
                        "No problem. Whenever you're ready to provide the details of your legal entities"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you have any outstanding mortgage loans? If yes, please specify the outstanding balance and the property/assets mortgaged."
                      );
                      setCurrentChatStage(4);
                    } else if (
                      messageData.current.includes(
                        "Great! Please provide the above mentioned details of your outstanding mortgage loan"
                      )
                    ) {
                      e.preventDefault();
                      await saveUserProfile({
                        outstandingMortgageLoans: {
                          propertiesDetails: inputStr,
                        },
                      });
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
                      await saveUserProfile({
                        personalLoans: {
                          propertiesDetails: inputStr,
                        },
                      });
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
                      await saveUserProfile({
                        creditCardDebt: {
                          propertiesDetails: inputStr,
                        },
                      });
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
                      await saveUserProfile({
                        otherOutstandingDebts: {
                          propertiesDetails: inputStr,
                        },
                      });
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
                      await saveUserProfile({
                        strategyLiabilities: {
                          propertiesDetails: inputStr,
                        },
                      });
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
                      await saveUserProfile({
                        foreseeableFuture: {
                          propertiesDetails: inputStr,
                        },
                      });
                      handleAddAIResponse(
                        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
                      );
                      setCurrentChatStage(5);
                    } else if (
                      messageData.current.includes(
                        "No problem. Whenever you're ready to provide the details of your significant changes expected in your liabilities"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Do you currently have any life insurance policies in place? If yes, please specify the type of policy, the coverage amount, the beneficiaries, and any additional riders or features."
                      );
                      setCurrentChatStage(5);
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
                      handleAddAIResponse(
                        "Do you bequeath your estate to your spouse?"
                      );
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
                    } else if (messageData.current.includes("USEFUL TIP")) {
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
                      if (maritalStatus === "Married") {
                        handleAddAIResponse(
                          "Upon your death, if massing takes place (combining assets from both spouses' estates), how should the assets be managed? For instance, if the surviving spouse's contribution is more valuable than the benefit received, should the difference be considered a loan to the specific beneficiary?"
                        );
                      } else {
                        handleAddAIResponse(
                          "Certain third parties may be responsible for estate duty based on the assets they receive. Do you have any specific instructions or details about third-party liability for estate duty in your current will?"
                        );
                      }
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
                        "Thank you for providing these details, " +
                          userName +
                          ". Now, we can move on to the next part of your estate planning. Ready to continue?"
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
                        "Have you considered the cost of education and taken that into account regarding maintenance?"
                      );
                    } else if (
                      messageData.current.includes(
                        "No problem. Whenever you're ready, please provide the details about your life insurance policy."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you considered the cost of education and taken that into account regarding maintenance?"
                      );
                    } else if (
                      messageData.current.includes(
                        "We will include this information in the report shared at the end of this conversation."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you considered the cost of education and taken that into account regarding maintenance?"
                      );
                    } else if (
                      messageData.current.includes(
                        "No problem. Whenever you're ready to provide the details about life insurance policy, just let me know."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you considered the cost of education and taken that into account regarding maintenance?"
                      );
                    } else if (
                      messageData.current.includes(
                        "No problem. Whenever you're ready to provide the details about life insurance policy option, just let me know."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you considered the cost of education and taken that into account regarding maintenance?"
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
                        "Donations tax is a tax imposed on the transfer of assets to a trust or to any person (for example individuals, company or trust that is a SA tax resident) without receiving adequate consideration in return. It's important to understand that while transferring assets to a trust can help reduce estate duty, it may trigger donations tax liabilities. The amount of donations tax payable depends on several factors, including the value of the assets transferred, any available exemptions or deductions, and the relationship between the donor and the recipient. The donations tax threshold is R100 000 per year."
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
                      setTypeOfProperty(inputStr);
                      handleAddAIResponse(
                        "Next, provide the location of your property (suburb, or specific neighbourhood, province)."
                      );
                    } else if (
                      messageData.current.includes(
                        "Next, provide the location of your property (suburb, or specific neighbourhood, province)."
                      )
                    ) {
                      e.preventDefault();
                      setLocationOfProperty(inputStr);
                      await saveUserProfile({
                        realEstateProperties: {
                          inDepthDetails: { propertyLocation: inputStr },
                        },
                      });
                      handleAddAIResponse(
                        "What is the size of your property? For houses and apartments, include the square metres of living space. For land, provide the total area in square metres or hectares."
                      );
                    } else if (
                      messageData.current.includes(
                        "What is the size of your property? For houses and apartments, include the square metres of living space. For land, provide the total area in square metres or hectares."
                      )
                    ) {
                      e.preventDefault();
                      setSizeOfProperty(inputStr);
                      await saveUserProfile({
                        realEstateProperties: {
                          inDepthDetails: { propertySize: inputStr },
                        },
                      });
                      handleAddAIResponse(
                        "How many bedrooms and bathrooms does your property have?"
                      );
                    } else if (
                      messageData.current.includes(
                        "How many bedrooms and bathrooms does your property have?"
                      )
                    ) {
                      e.preventDefault();
                      setRoomsOfProperty(inputStr);
                      await saveUserProfile({
                        realEstateProperties: {
                          inDepthDetails: {
                            bedroomsAndBathroomCount: inputStr,
                          },
                        },
                      });
                      handleAddAIResponse(
                        "Describe the condition of your property (new, good, fair, needs renovation). Also, mention any special features (e.g., swimming pool, garden, garage)."
                      );
                    } else if (
                      messageData.current.includes(
                        "Great! Please provide the above mentioned details about life insurance."
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Have you considered obtaining additional life insurance for providing capital required for income needs of dependents?"
                      );
                    } else if (
                      messageData.current.includes(
                        "Thank you for uploading your documents!"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "A report has been generated containing all the results from this chat. You can download a copy below."
                      );
                    } else if (
                      messageData.current.includes(
                        "Do you have anything you would like to add or any questions that I can help you with today?"
                      )
                    ) {
                      e.preventDefault();
                      handleAddAIResponse(
                        "Thanks for your time today, " +
                          userName +
                          "! Your information will be reviewed by an Old Mutual financial adviser, and you can expect to hear back soonwithyourestate plan."
                      );
                    } else if (
                      messageData.current.includes(
                        "Describe the condition of your property (new, good, fair, needs renovation). Also, mention any special features (e.g., swimming pool, garden, garage)."
                      )
                    ) {
                      e.preventDefault();
                      setConditionOfProperty(inputStr);
                      await saveUserProfile({
                        realEstateProperties: {
                          propertySize: { propertyCondition: inputStr },
                        },
                      });
                      calculatePropertyValue({
                        typeOfProperty,
                        locationOfProperty,
                        sizeOfProperty,
                        roomsOfProperty,
                        conditionOfProperty,
                      });

                      // handleAddAIResponse(
                      //   "The estimated value of your property based on the information you provided is:"
                      // );
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
                    }
                    // if (!trigger.current) {
                    //   e.preventDefault();
                    //   handleAddAIResponse(
                    //     "Let's dive into the world of estate planning!"
                    //   );
                    //   trigger.current = !trigger.current;
                    // } else
                    else {
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
                        e.preventDefault();
                        handleSubmit(e);

                        // Clear other related states or handle post-submission logic
                        setAllCheckboxesFalse();
                      } else {
                        e.preventDefault();
                        handleSubmit(e); // Let the AI respond freely if no conditions are met
                      }
                    }
                    setInputStr("");
                  }
                }}
              >
                <div className="p-4 flex items-center justify-between rounded bg-[#303134]">
                  {isThinking ? (
                    // Show the dots when the AI is "thinking"
                    <div className="dots-container w-full flex justify-center items-center">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  ) : (
                    // Show the input when AI is not thinking
                    <CustomInput
                      className="send-input bg-[#303134] text-white border-none focus:outline-none w-full"
                      id="user-input"
                      value={inputStr}
                      onChange={(e: any) => {
                        setInputStr(e.target.value);
                        handleInputChange(e);
                      }}
                      placeholder="Type a question"
                    />
                  )}

                  <button
                    id="send-button"
                    type="submit"
                    className="text-white rounded-md ml-2 flex items-center justify-center"
                  >
                    <img
                      src="/images/sendButton.png"
                      alt="Send Icon"
                      className="h-[50px] w-[50px] object-contain"
                    />
                  </button>
                </div>
              </form>
            </div>
            </div>
            {/* {loading && (
              <p className="text-white">
                Loading... Retrying {retryCount}/{MAX_RETRIES}
              </p>
            )} */}
             <div className="button-container">
    <div className="flex flex-col space-y-4">
      <button className="bg-[#009677] text-white px-4 py-2 rounded-md buttonData" onClick={handleModalToggle}>
        FAQs
      </button>
      <button className="bg-[#009677] text-white px-4 py-2 rounded-md buttonData" onClick={handleAdvisorModalToggle}>
        Contact a Financial Adviser
      </button>
      <button
        className="bg-[#009677] text-white px-4 py-2 rounded-md buttonData"
        onClick={() => {
          if (!isEstatePlanningTabOpen) {
            setEstatePlanningTabOpenv1(true);
            setEstatePlanningTabOpen(true);
            setStartTab(true);
          }
          setActiveTab("estatePlanning");
          if (isStartTab == false) {
            handleButtonStage0("Absolutely");
          }
        }}
      >
        Learn About Estate Planning
      </button>
    </div>
  </div>
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
