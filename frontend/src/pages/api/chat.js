import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    // Log the API URL and request for debugging
    console.log(
      `Sending request to: ${process.env.NEXT_PUBLIC_API_URL}/api/chat`
    );

    // Add timeout configuration and retry logic
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
      { messages },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000, // 30 seconds timeout
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // Only treat 5xx responses as errors
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in chat API:", error);

    // More detailed error logging
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    }

    // Check for specific errors
    if (error.code === "ECONNRESET" || error.code === "ECONNABORTED") {
      return res.status(503).json({
        error:
          "Connection to API server failed. The server might be down or unreachable.",
      });
    }

    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.detail ||
      error.message ||
      "An error occurred while processing your request";

    return res.status(statusCode).json({
      error: errorMessage,
    });
  }
}
