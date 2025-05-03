import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ChatMessage from "./ChatMessage";
import MessageInput from "./MessageInput";

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    try {
      // Clear any previous errors
      setError(null);

      // Create the user message
      const userMessage = { role: "user", content: messageText };

      // Update messages state and capture the new full messages array
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, userMessage];

        // Show loading state
        setIsLoading(true);

        // Use the updated messages array for the API call
        sendToAPI(updatedMessages);

        // Return the updated messages for state update
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error in message handling:", error);
      setError("Failed to send message. Please try again.");
      setIsLoading(false);
    }
  };

  // Separate function to handle the API call
  const sendToAPI = async (currentMessages) => {
    try {
      // Configure axios with retry logic
      const maxRetries = 3;
      let retries = 0;
      let success = false;

      while (!success && retries < maxRetries) {
        try {
          // Send the message to the API with the current messages array
          console.log("Sending message to API, attempt:", retries + 1);

          const response = await axios.post(
            "/api/chat",
            {
              messages: currentMessages,
            },
            {
              timeout: 30000, // 30 second timeout
            }
          );

          // Add the AI response to the state
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: response.data.response },
          ]);

          success = true;
        } catch (err) {
          retries++;
          console.error(
            `API request failed (attempt ${retries}/${maxRetries}):`,
            err
          );

          if (retries >= maxRetries) {
            throw err; // Rethrow the error if we've exhausted our retries
          }

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }
    } catch (error) {
      console.error("Error sending message to API after retries:", error);

      setError(
        error.response?.data?.error ||
          "Failed to connect to the AI service. Please check your connection and try again."
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error communicating with the AI service. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-lg shadow overflow-hidden">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center mt-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <span className="animate-pulse">🤖</span>
            </div>
            <div className="animate-pulse flex space-x-1">
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 p-2 my-2 bg-red-50 rounded">
            <p>Error: {error}</p>
            <p className="text-sm mt-1">
              Please check that your backend service is running properly.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={sendMessage}
        isLoading={isLoading}
        isError={!!error}
      />
    </div>
  );
}
