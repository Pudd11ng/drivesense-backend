const { GoogleGenAI } = require("@google/genai");

class GeminiService {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    this.location = process.env.GOOGLE_CLOUD_LOCATION;

    this.ai = new GoogleGenAI({
      vertexai: true,
      project: this.projectId,
      location: this.location,
    });
  }

  async generateDrivingTips(drivingData) {
    try {
      const prompt = this.createDrivingPrompt(drivingData);

      const result = await this.ai.models.generateContent({model: "gemini-2.0-flash-001", contents: prompt});
      return result.text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate driving tips: " + error.message);
    }
  }

  createDrivingPrompt(data) {
    const { drivingHistory, riskyBehaviours, accidents, stats } = data;

    let riskyBehaviorSummary = "";
    if (riskyBehaviours && riskyBehaviours.length > 0) {
      const behaviorCounts = {};
      riskyBehaviours.forEach((behavior) => {
        behaviorCounts[behavior.behaviourType] =
          (behaviorCounts[behavior.behaviourType] || 0) + 1;
      });

      riskyBehaviorSummary = Object.entries(behaviorCounts)
        .map(([type, count]) => `- ${type}: ${count} occurrences`)
        .join("\n");
    } else {
      riskyBehaviorSummary = "- No risky behaviors recorded";
    }

    return `You are a professional driving coach analyzing a driver's history to provide helpful advice.

DRIVING DATA:
- Total trips: ${stats?.totalTrips || 1}
- Total distance: ${
      stats?.totalDistance || drivingHistory?.distanceDriven || 0
    } km
- Total driving time: ${stats?.totalDrivingTime || 0} minutes

RISKY BEHAVIORS DETECTED:
${riskyBehaviorSummary}

ACCIDENT HISTORY:
${
  accidents && accidents.length > 0
    ? accidents
        .map(
          (a) =>
            `- ${new Date(a.detectedTime).toLocaleDateString()} at ${
              a.location
            }`
        )
        .join("\n")
    : "- No accidents recorded"
}

Based on this driver's history, please provide:
1. One personalized safety tips focused on their specific driving patterns or positive reinforcement about any good driving habits you can infer
2. Keep your response under 20 words and use a friendly, encouraging tone
3. Please provide your response in a single sentence.`;
  }
}

module.exports = new GeminiService();
