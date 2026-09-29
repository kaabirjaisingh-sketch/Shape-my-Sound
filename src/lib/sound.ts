import { useCallback, useEffect, useRef, useState } from "react";

let sharedContext: AudioContext | null = null;

// Browsers only allow audio after a user gesture, so the context is created lazily
// the first time a button asks for sound.
function audioContext(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!sharedContext) sharedContext = new AudioContext();
  if (sharedContext.state === "suspended") void sharedContext.resume();
  return sharedContext;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type ToneOptions = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  glideTo?: number;
};

export async function playTone({
  frequency,
  duration,
  type = "sine",
  volume = 0.2,
  glideTo,
}: ToneOptions) {
  const context = audioContext();
  if (!context) return;
  const start = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.04, duration / 4));
  gain.gain.setValueAtTime(volume, start + duration * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
  await wait(duration * 1000 + 60);
}

export async function playDrum() {
  await playTone({ frequency: 180, glideTo: 60, duration: 0.18, type: "triangle", volume: 0.5 });
}

export async function playBeat(count: number) {
  for (let i = 0; i < count; i++) {
    await playDrum();
    await wait(300);
  }
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

const SPEECH_LANG: Record<string, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };

// Speaks text with the browser's built-in voice. Resolves when speech ends
// (or right away when the browser has no speech support).
export function speak(
  text: string,
  { language, rate = 0.9, pitch = 1 }: { language?: string; rate?: number; pitch?: number } = {},
) {
  return new Promise<void>((resolve) => {
    if (!canSpeak()) return resolve();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (language) {
      utterance.lang = SPEECH_LANG[language] ?? language;
      const voice = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.toLowerCase().startsWith(utterance.lang.slice(0, 2).toLowerCase()));
      if (voice) utterance.voice = voice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    // Some browsers never fire onend (for example when no voice is installed),
    // so the game never waits longer than the text could reasonably take.
    const fallback = setTimeout(resolve, 1500 + text.length * 120);
    const done = () => {
      clearTimeout(fallback);
      resolve();
    };
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.speak(utterance);
  });
}

export type MicState = "idle" | "starting" | "listening" | "denied";

// Live microphone loudness (0 to 1) for voice and breath activities. Audio is only
// measured in the browser; nothing is recorded or sent anywhere.
export function useMicLevel() {
  const [state, setState] = useState<MicState>("idle");
  const [level, setLevel] = useState(0);
  const [voiced, setVoiced] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const thresholdRef = useRef(0.03);

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLevel(0);
    setVoiced(false);
    setState((s) => (s === "denied" ? s : "idle"));
  }, []);

  const start = useCallback(async () => {
    const context = audioContext();
    if (!context || !navigator.mediaDevices?.getUserMedia) {
      setState("denied");
      return;
    }
    setState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      const startedAt = performance.now();
      let ambient = 0;
      let ambientFrames = 0;
      let lastLoudAt = 0;
      let wasVoiced = false;
      const tick = () => {
        analyser.getFloatTimeDomainData(samples);
        let sum = 0;
        for (const s of samples) sum += s * s;
        const rms = Math.sqrt(sum / samples.length);
        // The first half second calibrates for background noise in the room.
        if (performance.now() - startedAt < 500) {
          ambient += rms;
          ambientFrames++;
          // Capped so a child who starts humming straight away still gets heard.
          thresholdRef.current = Math.min(0.06, Math.max(0.025, (ambient / ambientFrames) * 2.5));
        }
        setLevel(Math.min(1, rms * 6));
        // Speech flickers above and below the threshold many times a second, so a
        // sound counts as ongoing until it has been quiet for a quarter second.
        const now = performance.now();
        if (rms > thresholdRef.current) lastLoudAt = now;
        const isVoiced = now - lastLoudAt < 250;
        if (isVoiced !== wasVoiced) {
          wasVoiced = isVoiced;
          setVoiced(isVoiced);
        }
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
      setState("listening");
    } catch {
      setState("denied");
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { state, level, voiced: state === "listening" && voiced, start, stop };
}

export function canRecord() {
  return (
    typeof window !== "undefined" &&
    "MediaRecorder" in window &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  );
}
