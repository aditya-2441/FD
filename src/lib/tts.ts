import type { SupportedLanguage } from "@/types/chat";

export const speakMessage = async (text: string, languageCode: SupportedLanguage) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel(); // Stop any current speech

  const targetLang =
    languageCode === "hi"
      ? "hi-IN"
      : languageCode === "mr"
      ? "mr-IN"
      : languageCode === "bn"
      ? "bn-IN"
      : "en-IN";

  const getVoices = () => {
    return new Promise<SpeechSynthesisVoice[]>((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        const handleVoicesChanged = () => {
          window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
          resolve(window.speechSynthesis.getVoices());
        };
        window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
      }
    });
  };

  const availableVoices = await getVoices();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = targetLang;

  // Selection Priority: 1. Google Native, 2. Exact Lang Match, 3. Language Prefix
  const selectedVoice =
    availableVoices.find((v) => v.name.includes("Google") && v.lang === targetLang) ||
    availableVoices.find((v) => v.lang === targetLang) ||
    availableVoices.find((v) => v.lang.startsWith(languageCode));

  if (selectedVoice) utterance.voice = selectedVoice;

  // Set natural rate and pitch for clarity
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
};

