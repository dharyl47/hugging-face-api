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
  role: string;
  encryptedName?: string; // Optional field for encrypted name
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat();
  const [inputStr, setInputStr] = useState(input);
  const [submitOnNextUpdate, setSubmitOnNextUpdate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [videoTriggerMessageId, setVideoTriggerMessageId] = useState<
    string | null
  >(null);

  const [isChecked, setIsChecked] = useState(false);
  const [userName, setUserName] = useState("");
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

  const saveUserProfile = async (update: any) => {
    const profile = {
      name: userName || "",
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

    const response = await fetch("/api/userProfiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error("Failed to save user profile");
    }

    return await response.json(); // if you need to process the response
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

  const saveUserName = async (message: any) => {
    const secretKey = "MLKN87y8VSH&Y*SF"; // Replace with your own secret key
    const encryptedName = CryptoJS.AES.encrypt(message, secretKey).toString();
    setUserName(message);
    setEncryptedName(encryptedName);
    setIsUserNameCollected(true);

    await saveUserProfile({
      name: message,
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

  const renderMessages = () => {
    return messages.map((message, index) => {
      const isVideoTrigger = message.id === videoTriggerMessageId;
      const isMaritalStatusQuestion =
        message.content.includes("Single, Married") ||
        message.content.includes("Are you married") ||
         message.content.includes("your marital status") ||
        
        message.content.includes("current marital status") ||
        message.content.includes("single, married") &&
        !message.content.includes("accrual");
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
        message.content.includes("kind of marriage do you have")
        &&
        !message.content.includes("Spouse") &&
        !message.content.includes("spouse");
      const birth =
        message.content.includes("tell me your date of birth") ||
        message.content.includes("have your date of birth") ||
        message.content.includes("your date of birth") ||
        message.content.includes("about your date of birth") ||
        message.content.includes("were you born") ||
        message.content.includes("ask for your date of birth");
      const video = message.content.includes("I've got a short video");
      const askingConsent = message.content.includes("Do you consent");
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
              {isMaritalStatusQuestion && (
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
                  handleButtonClickRegime("In Community of Property ")
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
                    if (inputStr.trim()) {
                      //working
                      handleSubmit(e);
                      setAllCheckboxesFalse();
                      // savePropertyRegime(inputStr);

                      // if(userNameFlag.current){
                      //    saveUserName(inputStr);
                      //    userNameFlag.current = false;
                      // }
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
                        messageData.current.includes("your full legal name")
                        
                      ) {
                        saveUserName(inputStr);
                      }

                      if (
                        messageData.current.includes("dependents over") ||
                        messageData.current.includes("Dependents over") ||
                        messageData.current.includes("over the age") ||
                        messageData.current.includes("Over the age") ||
                        (messageData.current.includes("18") || messageData.current.includes("over")) ||
                        (messageData.current.includes("18") || messageData.current.includes("Over"))
                      ) {
                        setDependentsOver(inputStr);
                        saveDependentsOver(inputStr);
                      }
                      if (
                        messageData.current.includes("dependents under") ||
                        messageData.current.includes("Dependents under") ||
                        messageData.current.includes("under the age") ||
                        messageData.current.includes("Under the age") ||
                        (messageData.current.includes("18") || messageData.current.includes("under")) ||
                        (messageData.current.includes("18") || messageData.current.includes("Under"))
                        
                      ) {
                        setDependentsUnder(inputStr);
                        saveDependentsUnder(inputStr);
                      }
                      if (
                        messageData.current.includes("email") ||
                        messageData.current.includes("Email")
                      ) {
                        setUserEmail(inputStr);
                        saveUserEmail(inputStr);
                      }
                      if (
                        messageData.current.includes(
                          "tell me your date of birth"
                        ) ||
                        messageData.current.includes(
                          "have your date of birth"
                        ) ||
                        messageData.current.includes(
                          "ask for your date of birth"
                        ) ||
                        messageData.current.includes(
                          "about your date of birth"
                        ) ||
                        messageData.current.includes(
                          "were you born"
                        ) || 
                        messageData.current.includes(
                          "your date of birth"
                        )
                        
                      ) {
                        setDateOfBirth(inputStr);
                        saveDateOfBirth(inputStr);
                      }

                      if (
                        messageData.current.includes("type of marriage") ||
                        messageData.current.includes("marriage include the accrual system") ||
                        messageData.current.includes("kind of marriage do you have") &&
                        !messageData.current.includes("Spouse") &&
                        !messageData.current.includes("spouse")
                      ) {
                        saveTypeOfMarriage(inputStr);
                      }

                      setInputStr("");
                      // userProfile(inputStr);
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
