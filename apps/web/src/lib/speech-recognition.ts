type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onerror: ((event: unknown) => void) | null;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
};

export function createSpeechRecognition(onText: (text: string) => void): { start: () => void; stop: () => void } | undefined {
  if (typeof window === 'undefined') return undefined;
  const ctor = (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
  if (!ctor) return undefined;
  const recognition = new ctor();
  recognition.lang = 'zh-CN';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => onText(event.results[0]?.[0]?.transcript ?? '');
  recognition.onerror = () => recognition.stop();
  return { start: () => recognition.start(), stop: () => recognition.stop() };
}
