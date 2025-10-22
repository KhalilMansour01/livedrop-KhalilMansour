import express from "express";
import AssistantEngine from "../assistant/engine.js";

const router = express.Router();
const assistantEngine = new AssistantEngine();

// Chat endpoint for the assistant
router.post("/chat", async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Message is required and must be a string"
      });
    }

    // Process the query through the assistant engine
    const response = await assistantEngine.processQuery(message, context);
    
    res.json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error("Assistant chat error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process assistant request"
    });
  }
});

// Get assistant statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = assistantEngine.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Assistant stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch assistant statistics"
    });
  }
});

// Validate citations endpoint
router.post("/validate-citations", async (req, res) => {
  try {
    const { text, citations } = req.body;
    
    if (!text || !citations) {
      return res.status(400).json({
        success: false,
        error: "Text and citations are required"
      });
    }

    const validation = assistantEngine.validateCitations(text, citations);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error("Citation validation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate citations"
    });
  }
});

export default router;
