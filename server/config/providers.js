/**
 * Central AI Provider Configuration
 * Single source of truth for selecting AI models and services.
 * Modules should read from this file instead of hardcoding providers.
 */

const aiProviders = {
    vision: (process.env.VISION_PROVIDER || 'gemini').toLowerCase(),
    reasoning: (process.env.REASONING_PROVIDER || 'gemini').toLowerCase(),
    tts: (process.env.TTS_PROVIDER || 'openai').toLowerCase()
};

// Log configuration state on boot for infrastructure visibility
console.log("Configuration Layer Initialized:");
console.log(` -> Vision Provider:    [${aiProviders.vision}]`);
console.log(` -> Reasoning Provider: [${aiProviders.reasoning}]`);
console.log(` -> Action Provider:    [${aiProviders.tts}]`);

module.exports = aiProviders;