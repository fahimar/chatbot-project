// pages/api/chat.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    // Better error logging
    console.log(
      "Sending request to backend with messages:",
      messages.length > 0 ? `${messages.length} messages` : "No messages"
    );

    // Define the backend URL using environment variables with fallbacks
    const backendUrl = process.env.BACKEND_URL || "http://backend:8000";
    console.log(`Using backend URL: ${backendUrl}/api/chat`);

    // Add timeout configuration and retry logic
    const response = await axios.post(
      `${backendUrl}/api/chat`,
      { messages },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Return the response from the backend
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in chat API:", error);

    // Enhanced error reporting
    const errorDetails = {
      message: error.message,
      code: error.code,
      response: error.response
        ? {
            status: error.response.status,
            data: error.response.data,
          }
        : null,
    };

    console.error("Detailed error:", JSON.stringify(errorDetails, null, 2));

    return res.status(500).json({
      error: "Failed to communicate with AI service",
      details: errorDetails,
    });
  }
}
