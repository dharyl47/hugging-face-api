'use client';
import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import CustomInput from "@/app/components/CustomInput";
import CustomCheckBox from "@/app/components/CustomCheckBox"; // Import the CustomCheckBox component
import EmbeddedVideo from '@/app/components/EmbeddedVideo';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat();
  const [inputStr, setInputStr] = useState(input);
  const [submitOnNextUpdate, setSubmitOnNextUpdate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [videoTriggerMessageId, setVideoTriggerMessageId] = useState<string | null>(null);

  useEffect(() => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: "Hi there! 😊 Welcome to Moneyversity's Estate Planning Chatbot. 🤖 I'm here to secure your future and that of your loved ones. Ready to get started?"
    }]);
  }, [setMessages]);

  useEffect(() => {
    if (submitOnNextUpdate) {
      const formEvent = { preventDefault: () => {} };
      handleSubmit(formEvent as React.FormEvent<HTMLFormElement>);
      setSubmitOnNextUpdate(false);
    }
  }, [submitOnNextUpdate, handleSubmit]);

  useEffect(() => {
    const triggerMessage = messages.find(message => message.content.includes("initiate video"));
    if (triggerMessage) {
      setVideoTriggerMessageId(triggerMessage.id);
    }
  }, [messages]);

  const handleButtonClick = (message: any) => {
    setInputStr(message);
    handleInputChange({ target: { value: message } } as React.ChangeEvent<HTMLInputElement>);
    setSubmitOnNextUpdate(true);
  };

    const [checkboxes, setCheckboxes] = useState({
    spouse: false,
    children: false,
    stepchildren: false,
    grandchildren: false,
    other: false
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setCheckboxes(prevState => ({
      ...prevState,
      [id]: checked
    }));
  };


  const renderMessages = () => {
  return messages.map((message, index) => {
    const isVideoTrigger = message.id === videoTriggerMessageId;
    const isMaritalStatusQuestion = message.content.includes("Are you married, single, divorced, or widowed?");
    const isDependentsQuestion = message.content.includes("Do you have dependents?");
    // Split message content by "<prompt>" and take the first part
    const filteredContent = message.content.split('<|prompter|>')[0];

    return (
      <div key={message.id} className={message.role === "user" ? "text-white" : "text-white"}>
        {message.role === "assistant" && index === 0 ? (
          <>
            <div>{`Moneyversity: ${filteredContent.replace(/<\|endoftext\|>/g, "")}`}</div>
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
          <div className={message.role === "user" ? "mb-2 text-right mt-4" : "mb-2"}>
            {isVideoTrigger ? (
              <>
                <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block">
                  Here you go! 🎥
                </p>
                <EmbeddedVideo embedUrl="https://www.youtube.com/embed/cMoaGEpffds" />
                <p className="bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block mt-2">
                  Now, let's get to know you a bit better. Who am I talking to? 🤔
                </p>
              </>
            ) : (
              <p className={message.role === "user" ? "bg-[#8dc63f] text-white rounded-lg py-2 px-4 inline-block" : "bg-[#2f2f2f] text-white rounded-lg py-2 px-4 inline-block"}>
                {` ${filteredContent.replace(/<\|endoftext\|>/g, "")}`}
              </p>
            )}

            {isMaritalStatusQuestion && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleButtonClick("Single")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Single
                </button>
                <button
                  onClick={() => handleButtonClick("Married")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Married
                </button>
                <button
                  onClick={() => handleButtonClick("Divorced")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Divorced
                </button>
                <button
                  onClick={() => handleButtonClick("Widowed")}
                  className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
                >
                  Widowed
                </button>
                
              </div>
              
            )}
              {isDependentsQuestion && (
                <div className="flex flex-col space-y-2 mt-2">
                  <label className="text-white">Please select your dependents:</label>
                  <div className="flex flex-col space-y-1">
                    <CustomCheckBox
                      id="spouse"
                      name="dependents"
                     
                      value="Spouse"
                      checked={checkboxes.spouse}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="spouse" className="text-white">Spouse</label>

                    <CustomCheckBox
                      id="children"
                      name="dependents"
                     
                      value="Children"
                      checked={checkboxes.children}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="children" className="text-white">Children</label>

                    <CustomCheckBox
                      id="stepchildren"
                      name="dependents"
                     
                      value="Stepchildren"
                      checked={checkboxes.stepchildren}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="stepchildren" className="text-white">Stepchildren</label>

                    <CustomCheckBox
                      id="grandchildren"
                      name="dependents"
                      
                      value="Grandchildren"
                      checked={checkboxes.grandchildren}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="grandchildren" className="text-white">Grandchildren</label>

                    <CustomCheckBox
                      id="other"
                      name="dependents"
                     
                      value="Other Dependents"
                      checked={checkboxes.other}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor="other" className="text-white">Other Dependents</label>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    );
  });
};



  return (
    <div className="fixed bottom-0 right-0 mb-5 mr-5">
      {isOpen && (
        <div id="chat-container" className="fixed bottom-16 right-10">
          <div className="bg-[#212121] shadow-md rounded-lg max-w-lg w-full">
            <div className="p-4 border-b text-white rounded-t-lg flex items-center bg-gradient-to-b from-[#84c342] to-[#149d6e]">
              <p
                id="estate-icon"
                className="bg-[#8dc63f] text-white px-4 py-4 mr-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </p>
              <p className="text-lg font-semibold">Estate Planning Bot</p>
              <div className="ml-auto flex items-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-gray-400 focus:outline-none focus:text-gray-400 ml-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div id="chatbox" className="p-4 h-96 overflow-y-auto">
              {renderMessages()}
            </div>
            <form className="w-full max-w-xl" onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
              <div className="p-4 border-t flex mt-10">
                <CustomInput
                  className="send-input bg-[#212121] text-white border-none focus:outline-none mb-5"
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
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#84c342] p-4 text-white rounded-full shadow-md hover:bg-blue-500 transition duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
