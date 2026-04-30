"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import type { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Phone, PhoneOff, MessageSquare, Brain } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AgentProps {
  interviewId: string;
  questions: string[];
  jobRole: string;
  experienceLevel?: string;
  techStack?: string[];
}

interface ConversationTurn {
  role: "assistant" | "user";
  content: string;
}

interface VapiConversationItem {
  role?: string;
  content?: string;
}

interface VapiMessagePayload {
  type?: string;
  conversation?: VapiConversationItem[];
  transcriptType?: string;
  role?: string;
  status?: string;
  transcript?: string;
  error?: {
    message?: string | string[];
    msg?: string;
  };
  message?: string;
}

const extractFirstString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const extracted = extractFirstString(item);
      if (extracted) return extracted;
    }
    return undefined;
  }

  if (typeof value === "object" && value !== null) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      const extracted = extractFirstString(nested);
      if (extracted) return extracted;
    }
  }

  return undefined;
};

const AGENT_END_PHRASES = [
  "that concludes our interview",
  "thank you for your time. goodbye",
  "thank you for your time goodbye",
];

const hasAgentEndedInterview = (text: string) => {
  const normalized = (text || "").toLowerCase().trim();
  if (!normalized) return false;
  return AGENT_END_PHRASES.some((phrase) => normalized.includes(phrase));
};

const buildTranscriptFromConversation = (turns: ConversationTurn[]) =>
  turns
    .filter((t) => t.role === "user" && t.content?.trim())
    .map((t) => t.content.trim())
    .join(" ");

// Keep browser-level processing light so the user's speech reaches the transcriber
// with minimal clipping or over-aggressive suppression.
const MIC_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: false,
  autoGainControl: true,
  channelCount: 1,
  sampleRate: 48000,
  sampleSize: 16,
};

const getQuestionLimit = (level: string) => {
  const l = level.toLowerCase().trim();
  if (l.includes("entry") || l.includes("junior") || l === "fresher") return 5;
  if (l.includes("senior") || l.includes("expert") || l.includes("lead")) return 10;
  return 7;
};

const START_PROMPT_MAX_CHARS = 3500;

const buildStartPrompt = (
  jobRole: string,
  experienceLevel: string,
  questionLimit: number,
  seedQuestions: string[]
) => {
  const seedPreview = seedQuestions
    .filter((q) => typeof q === "string" && q.trim())
    .slice(0, Math.max(3, Math.min(questionLimit, 5)))
    .join(" | ");

  const prompt = `You are a senior technical interviewer for a ${jobRole} candidate (${experienceLevel}).
Ask exactly ${questionLimit} questions, one at a time.
After each answer, ask a focused follow-up before moving on.
If the answer is unclear, ask for clarification.
Maintain professional, concise tone.
When done, say exactly: "That concludes our interview. Thank you for your time. Goodbye!"

Seed question guide: ${seedPreview || "Use role-relevant technical questions."}`;

  return prompt.length > START_PROMPT_MAX_CHARS
    ? `${prompt.slice(0, START_PROMPT_MAX_CHARS)}...`
    : prompt;
};

// Build the dominant interviewer system prompt with full conversation context injected
const buildSystemPrompt = (
  jobRole: string,
  experienceLevel: string,
  questionLimit: number,
  seedQuestions: string[],
  conversation: ConversationTurn[],
  questionsAsked: number
): string => {
  const conversationBlock =
    conversation.length > 0
      ? `\n\n=== FULL CONVERSATION SO FAR ===\n${conversation
          .map((t) => `${t.role === "assistant" ? "YOU (Interviewer)" : "CANDIDATE"}: ${t.content}`)
          .join("\n")}\n=== END OF CONVERSATION ===`
      : "";

  const lastUserAnswer =
    conversation.filter((t) => t.role === "user").slice(-1)[0]?.content || "";

  const lastAnswerBlock = lastUserAnswer
    ? `\n\n=== CANDIDATE'S LAST ANSWER ===\n"${lastUserAnswer}"\n=== END ===`
    : "";

  return `You are a sharp, dominant, and highly experienced technical interviewer conducting a ${jobRole} interview for a ${experienceLevel} candidate.

YOUR CORE BEHAVIOR — READ CAREFULLY:
1. YOU control the interview completely. You decide what to ask next. Never let the candidate steer.
2. After EVERY candidate answer, you MUST:
   a) Briefly acknowledge their answer in 1 sentence (do NOT praise excessively).
   b) Scan their answer for any technical term, framework, concept, tool, pattern, or topic they mentioned.
   c) If they mentioned something new or interesting (e.g., "I used Redis for caching", "I implemented a singleton pattern", "we used Kafka"), IMMEDIATELY ask a sharp follow-up question drilling into that specific thing.
   d) If their answer was vague or shallow, challenge them: "Can you be more specific about how you implemented that?" or "What were the trade-offs you considered?"
   e) Only move to the next planned question when you've fully explored the current topic.
  f) If the response sounds unclear, unrelated, or likely misheard, ask for a repeat/clarification before evaluating it.
3. Your questions must be STRUCTURED and TECHNICAL — not generic. Example: Instead of "Tell me about databases", ask "You mentioned PostgreSQL — how did you handle connection pooling under high concurrency?"
4. Keep a mental count of questions. You have asked ${questionsAsked} questions so far out of ${questionLimit} total.
5. After exactly ${questionLimit} questions total, say: "That concludes our interview. Thank you for your time. Goodbye!" — then stop.

QUESTION STRATEGY:
- Start with the seed questions as a guide, but adapt based on what the candidate says.
- Seed questions (use as starting points, not a rigid script): ${seedQuestions.slice(0, questionLimit).join(" | ")}
- Always prefer a sharp follow-up on something the candidate mentioned over jumping to the next seed question.
- If the candidate mentions a technology or concept you haven't covered yet, explore it.

TONE & STYLE:
- Professional, direct, and confident. You are in charge.
- Do not say "Great answer!" or "Excellent!" — say "I see" or "Understood, let's dig deeper."
- Ask one question at a time. Never ask multiple questions in one turn.
- Keep your responses concise — acknowledge briefly, then ask the next question.
${lastAnswerBlock}${conversationBlock}

CURRENT STATUS: You have asked ${questionsAsked} of ${questionLimit} questions. ${
    questionsAsked >= questionLimit
      ? "You MUST conclude the interview NOW."
      : `You have ${questionLimit - questionsAsked} questions remaining.`
  }`;
};

export default function Agent({
  interviewId,
  questions,
  jobRole,
  experienceLevel = "Mid-Level",
}: AgentProps) {
  const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [micLevel, setMicLevel] = useState(0);
  const [isMicMonitorActive, setIsMicMonitorActive] = useState(false);

  // Refs for always-fresh values inside Vapi callbacks
  const transcriptRef = useRef("");
  const conversationRef = useRef<ConversationTurn[]>([]);
  const questionsAskedRef = useRef(0);
  const vapiRef = useRef<Vapi | null>(null);
  const lastAssistantMessageRef = useRef("");
  // True ONLY when the agent has spoken an end-of-interview phrase.
  const interviewCompletedRef = useRef(false);
  // Single-entry guard: prevents concurrent / duplicate feedback requests.
  const feedbackInProgressRef = useRef(false);
  const startInFlightRef = useRef(false);
  const lastStartErrorRef = useRef<unknown>(null);
  const micMonitorStreamRef = useRef<MediaStream | null>(null);
  const micAudioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micRafRef = useRef<number | null>(null);
  const micLevelLastUpdateRef = useRef(0);
  const questionLimit = getQuestionLimit(experienceLevel);
  const router = useRouter();

  const stopMicMonitor = () => {
    if (micRafRef.current !== null) {
      cancelAnimationFrame(micRafRef.current);
      micRafRef.current = null;
    }
    if (micMonitorStreamRef.current) {
      micMonitorStreamRef.current.getTracks().forEach((track) => track.stop());
      micMonitorStreamRef.current = null;
    }
    if (micAudioContextRef.current) {
      micAudioContextRef.current.close();
      micAudioContextRef.current = null;
    }
    micAnalyserRef.current = null;
    micLevelLastUpdateRef.current = 0;
    setMicLevel(0);
    setIsMicMonitorActive(false);
  };

  const startMicMonitor = async () => {
    if (micMonitorStreamRef.current || micAnalyserRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: MIC_AUDIO_CONSTRAINTS,
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);

      micMonitorStreamRef.current = stream;
      micAudioContextRef.current = audioContext;
      micAnalyserRef.current = analyser;
      setIsMicMonitorActive(true);

      const updateLevel = () => {
        if (!micAnalyserRef.current) return;

        micAnalyserRef.current.getByteTimeDomainData(buffer);

        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) {
          const normalized = (buffer[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }

        const rms = Math.sqrt(sumSquares / buffer.length);
        const scaledLevel = Math.min(100, Math.round(rms * 360));
        const now = performance.now();

        if (now - micLevelLastUpdateRef.current > 80) {
          micLevelLastUpdateRef.current = now;
          setMicLevel(scaledLevel);
        }

        micRafRef.current = requestAnimationFrame(updateLevel);
      };

      micRafRef.current = requestAnimationFrame(updateLevel);
    } catch (err) {
      console.warn("Mic monitor setup failed:", err);
      setIsMicMonitorActive(false);
      setMicLevel(0);
    }
  };

  // Sync refs with state
  useEffect(() => { conversationRef.current = conversation; }, [conversation]);
  useEffect(() => { questionsAskedRef.current = questionsAsked; }, [questionsAsked]);

  const getErrorMessage = (error: unknown) => {
    if (typeof error !== "object" || error === null) {
      return "Unknown error";
    }

    const typedError = error as {
      type?: string;
      stage?: string;
      error?: unknown;
      message?: string;
    };

    const nestedMessage = extractFirstString(typedError.error);
    if (nestedMessage) {
      return nestedMessage;
    }

    if (
      typeof typedError.error === "object" &&
      typedError.error !== null &&
      "msg" in (typedError.error as Record<string, unknown>) &&
      typeof (typedError.error as Record<string, unknown>).msg === "string"
    ) {
      return ((typedError.error as Record<string, unknown>).msg as string).trim() || "Unknown error";
    }

    if (typeof typedError.message === "string" && typedError.message.trim()) {
      return typedError.message;
    }

    if (typedError.type === "start-method-error") {
      return `Vapi start failed at stage: ${typedError.stage || "unknown"}`;
    }

    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") {
        return serialized;
      }
    } catch {
      // ignore
    }

    return "Unknown error";
  };

  // Check mic permission
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: MIC_AUDIO_CONSTRAINTS,
      })
      .then((stream) => {
        setMicPermission(true);
        stream.getTracks().forEach((t) => t.stop());
      })
      .catch(() => {
        setMicPermission(false);
        toast.error("Please allow microphone access to start the interview");
      });
  }, []);

  // Mic level indicator is visible before speaking; pause monitor during active call.
  useEffect(() => {
    if (micPermission === true && !isCallActive) {
      startMicMonitor();
    } else {
      stopMicMonitor();
    }

    return () => {
      stopMicMonitor();
    };
  }, [micPermission, isCallActive]);

  // Inject updated system prompt mid-call after each user answer
  const injectContextUpdate = useCallback((updatedConversation: ConversationTurn[], updatedQCount: number) => {
    const vapiInstance = vapiRef.current;
    if (!vapiInstance) return;

    const updatedPrompt = buildSystemPrompt(
      jobRole,
      experienceLevel,
      questionLimit,
      questions,
      updatedConversation,
      updatedQCount
    );

    try {
      vapiInstance.send({
        type: "add-message",
        message: {
          role: "system",
          content: updatedPrompt,
        },
      });
      console.log("🧠 Context injected — conversation turns:", updatedConversation.length, "| questions asked:", updatedQCount);
    } catch (e) {
      console.warn("Context injection failed:", e);
    }
  }, [jobRole, experienceLevel, questionLimit, questions]);

  // ── Guarded feedback flow — single entry point, no race conditions ──
  const finalizeFeedback = useCallback(async () => {
    // Single-entry guard: if already in progress, bail out.
    if (feedbackInProgressRef.current) {
      console.log("⏭️ finalizeFeedback skipped — already in progress");
      return;
    }
    feedbackInProgressRef.current = true;

    // Build the best transcript we have.
    const rawTranscript = transcriptRef.current.trim();
    const convTranscript = buildTranscriptFromConversation(conversationRef.current);
    // Use whichever source captured more content.
    const finalTranscript = rawTranscript.length >= convTranscript.length ? rawTranscript : convTranscript;

    if (finalTranscript.length > 10) {
      toast.success("Interview completed! Generating feedback...");
      setIsGeneratingFeedback(true);
      try {
        setIsLoading(true);
        const token = Cookies.get("token");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_INTERVIEW_SERVICE}/api/interview/feedback`,
          { interviewId: parseInt(interviewId), transcript: finalTranscript },
          { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
        );
        if (response.data.success) {
          toast.success("Feedback generated successfully!");
          setTimeout(() => router.push(`/interview/${interviewId}/feedback`), 500);
        } else {
          throw new Error("Feedback generation failed");
        }
      } catch (error) {
        console.error("❌ Error generating feedback:", error);
        const apiMessage = axios.isAxiosError(error)
          ? (error.response?.data?.message || error.response?.data?.error || error.message)
          : "Failed to generate feedback";
        toast.error(`Feedback error: ${apiMessage}`);
        setTimeout(() => router.push(`/interview/${interviewId}/feedback`), 1000);
      } finally {
        setIsLoading(false);
        setIsGeneratingFeedback(false);
        feedbackInProgressRef.current = false;
      }
    } else {
      toast.error("No responses recorded. Please check your microphone and try again.");
      setIsGeneratingFeedback(false);
      feedbackInProgressRef.current = false;
    }
  }, [interviewId, router]);

  // ── Clean-up helper to reset all call state ──
  const cleanupCall = () => {
    setIsCallActive(false);
    setIsSpeaking(false);
    setLastUserMessage("");
  };

  // Init Vapi
  useEffect(() => {
    if (!vapiToken) {
      toast.error("Missing NEXT_PUBLIC_VAPI_WEB_TOKEN. Voice interview cannot start.");
      return;
    }

    const vapiInstance = new Vapi(vapiToken);
    setVapi(vapiInstance);
    vapiRef.current = vapiInstance;

    vapiInstance.on("call-start", () => {
      // Reset ALL state for new call
      interviewCompletedRef.current = false;
      feedbackInProgressRef.current = false;
      lastAssistantMessageRef.current = "";
      transcriptRef.current = "";
      conversationRef.current = [];
      questionsAskedRef.current = 0;
      setConversation([]);
      setQuestionsAsked(0);
      setIsCallActive(true);
      setIsGeneratingFeedback(false);
      startInFlightRef.current = false;
      lastStartErrorRef.current = null;
      toast.success("Interview started!");
    });

    vapiInstance.on("call-end", async () => {
      cleanupCall();

      // Only generate feedback when the AI interviewer completed the interview.
      if (!interviewCompletedRef.current) {
        // User ended or call dropped before AI finished — no feedback.
        setIsGeneratingFeedback(false);
        toast("Interview ended. Complete all questions to receive feedback.", { icon: "ℹ️" });
        return;
      }

      // AI completed the interview — generate feedback (guarded).
      await finalizeFeedback();
    });

    vapiInstance.on("call-start-failed", (event) => {
      lastStartErrorRef.current = event;
      console.error("Vapi call-start-failed:", event);
      console.error("Vapi call-start-failed JSON:", JSON.stringify(event, null, 2));
      const parsedErrorMessage = getErrorMessage(event);
      toast.error(`Call start failed: ${parsedErrorMessage}`);
      cleanupCall();
      startInFlightRef.current = false;
    });

    vapiInstance.on("error", (error) => {
      lastStartErrorRef.current = error;
      const dailyMessage = error?.error?.msg || error?.error?.message;
      if (
        error?.type === "daily-error" &&
        typeof dailyMessage === "string" &&
        dailyMessage.toLowerCase().includes("meeting has ended")
      ) {
        // Platform ended the meeting. This can happen AFTER the agent already
        // concluded — in that case call-end will handle feedback via the
        // interviewCompletedRef flag. We just clean up UI here.
        console.info("Vapi daily meeting ended (platform):", error);
        cleanupCall();
        // Do NOT trigger feedback here — let call-end handle it.
        return;
      }

      console.error("Vapi error:", error);
      console.error("Vapi error JSON:", JSON.stringify(error, null, 2));

      const parsedErrorMessage = getErrorMessage(error);
      toast.error(`Error: ${parsedErrorMessage}`);
      cleanupCall();
      startInFlightRef.current = false;
    });

    vapiInstance.on("message", (message: VapiMessagePayload) => {
      // ── Capture full conversation from Vapi's conversation-update ──
      if (message.type === "conversation-update" && Array.isArray(message.conversation)) {
        const turns: ConversationTurn[] = message.conversation
          .filter((m): m is Required<Pick<VapiConversationItem, "role" | "content">> =>
            m.role === "assistant" || m.role === "user"
          )
          .map((m) => ({ role: m.role as ConversationTurn["role"], content: m.content || "" }));

        conversationRef.current = turns;
        setConversation(turns);

        // Count AI questions from conversation
        const aiQuestions = turns.filter(
          (t) => t.role === "assistant" && t.content.trim().endsWith("?")
        ).length;
        questionsAskedRef.current = aiQuestions;
        setQuestionsAsked(aiQuestions);

        const latestAssistant = [...turns].reverse().find((t) => t.role === "assistant" && t.content.trim());
        if (latestAssistant) {
          lastAssistantMessageRef.current = latestAssistant.content;
          if (hasAgentEndedInterview(latestAssistant.content)) {
            interviewCompletedRef.current = true;
          }
        }
      }

      // ── On final user transcript: append to raw transcript + inject context ──
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        message.role === "user"
      ) {
        const userText: string = message.transcript || "";
        if (userText.trim()) {
          // Append to raw transcript buffer — this gives us the best
          // word-for-word capture of everything the user said.
          transcriptRef.current =
            (transcriptRef.current ? transcriptRef.current + " " : "") + userText;
          setLastUserMessage(userText);

          // Inject updated context so AI can analyze this answer and pivot
          injectContextUpdate(conversationRef.current, questionsAskedRef.current);
        }
      }

      // Track when AI has formally concluded the interview.
      if (
        message.type === "transcript" &&
        message.transcriptType === "final" &&
        message.role === "assistant" &&
        message.transcript
      ) {
        lastAssistantMessageRef.current = message.transcript;
        if (hasAgentEndedInterview(message.transcript)) {
          interviewCompletedRef.current = true;
        }
      }

      // ── Partial transcript for live display ──
      if (
        message.type === "transcript" &&
        message.role === "user" &&
        message.transcriptType === "partial" &&
        message.transcript
      ) {
        setLastUserMessage(`${message.transcript}...`);
      }

      // ── Speech status ──
      if (message.type === "speech-update") {
        if (message.role === "user" && message.status === "started") {
          setIsSpeaking(true);
          setLastUserMessage("Listening...");
        }
        if (message.role === "user" && message.status === "stopped") {
          setIsSpeaking(false);
          setLastUserMessage("Processing...");
        }
      }
    });

    return () => { vapiInstance.stop(); };
  }, [vapiToken, finalizeFeedback, injectContextUpdate]);

  const startCall = async () => {
    if (startInFlightRef.current) {
      return;
    }
    if (!vapiToken) {
      return toast.error("Voice setup missing. Add NEXT_PUBLIC_VAPI_WEB_TOKEN and restart frontend.");
    }
    if (micPermission !== true) {
      return toast.error("Microphone is not ready yet. Please allow mic access and try again.");
    }
    if (!vapi) return toast.error("Vapi not initialized");
    startInFlightRef.current = true;
    lastStartErrorRef.current = null;
    try {
      setIsLoading(true);

      // Release local monitor stream before call connects to avoid audio-device contention.
      stopMicMonitor();

      const systemPrompt = buildStartPrompt(
        jobRole,
        experienceLevel,
        questionLimit,
        questions
      );

      const assistant: CreateAssistantDTO = {
        model: {
          provider: "openai" as const,
          model: "gpt-4o-mini",
          messages: [{ role: "system" as const, content: systemPrompt }],
          temperature: 0.6,
        },
        voice: { provider: "openai" as const, voiceId: "alloy" },
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2" as const,
          language: "en" as const,
          // Favor accurate, complete utterances over aggressive cutoffs.
          smartFormat: true,
          endpointing: 300,
        },
        firstMessage: `Hi! I'm your AI interviewer for the ${jobRole} role. Let's get started — please introduce yourself briefly.`,
        endCallMessage: "Thank you for your time. Your responses have been recorded and feedback will be generated shortly. Good luck!",
        endCallPhrases: ["that concludes our interview", "thank you for your time goodbye"],
        maxDurationSeconds: 2400,
        backgroundSound: "off" as const,
      };

      console.info("Starting Vapi web call with payload summary", {
        model: assistant.model?.model,
        voiceProvider: assistant.voice?.provider,
        transcriberProvider: assistant.transcriber?.provider,
        promptChars: systemPrompt.length,
        questionCount: questions.length,
      });

      const startedCall = await vapi.start(assistant);
      if (!startedCall) {
        const fallbackError = getErrorMessage(lastStartErrorRef.current || { message: "Call start rejected by Vapi" });
        throw new Error(fallbackError);
      }
    } catch (error) {
      console.error("Failed to start Vapi call:", error);
      console.error("Failed to start Vapi call JSON:", JSON.stringify(error, null, 2));
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to start: ${errorMessage}`);
    } finally {
      startInFlightRef.current = false;
      setIsLoading(false);
    }
  };

  const endCall = () => {
    // User-initiated end — interviewCompletedRef stays false so call-end
    // handler will NOT generate feedback.
    vapi?.stop();
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 mx-auto transition-all duration-300 ${
          isCallActive
            ? isSpeaking
              ? "bg-linear-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/40 scale-110"
              : "bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 animate-pulse"
            : "bg-linear-to-br from-blue-600 to-purple-600"
        }`}>
          <Mic className="h-10 w-10 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Interview Assistant
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
          {isCallActive
            ? "Interview in progress — AI will adapt questions based on your answers"
            : `Ready to conduct your ${jobRole} interview`}
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Mic permission banners */}
        {micPermission === false && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <MicOff className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Microphone Access Required</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">Allow microphone access in your browser settings.</p>
            </div>
          </div>
        )}
        {micPermission === true && !isCallActive && (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <Mic className="h-5 w-5 shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">Microphone Ready</p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-0.5">Your microphone is working. You can start the interview.</p>
            </div>
          </div>
        )}
        {micPermission === null && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Checking microphone access...</p>
          </div>
        )}

        {/* Mic input level indicator */}
        {micPermission === true && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-800/60 dark:bg-blue-950/25">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-800 dark:text-blue-200">Mic Input Level</span>
              <span className="text-blue-700 dark:text-blue-300">
                {isMicMonitorActive ? `${micLevel}%` : "Paused during interview"}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/50">
              <div className="relative h-full w-full">
                {/* Recommended speaking zone: 25% to 60% */}
                <div className="pointer-events-none absolute inset-y-0 left-[25%] w-[35%] bg-green-400/25 dark:bg-green-400/20" />
                <div className="pointer-events-none absolute inset-y-0 left-[25%] w-px bg-green-600/80 dark:bg-green-300/80" />
                <div className="pointer-events-none absolute inset-y-0 left-[60%] w-px bg-green-600/80 dark:bg-green-300/80" />

                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    micLevel > 60
                      ? "bg-red-500"
                      : micLevel > 25
                      ? "bg-green-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.max(isMicMonitorActive ? micLevel : 0, 3)}%` }}
                />
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-blue-700 dark:text-blue-300">
              <span>Low</span>
              <span>Recommended: 25-60%</span>
              <span>High</span>
            </div>
            <p className="mt-1 text-[11px] text-blue-700 dark:text-blue-300">
              {isMicMonitorActive
                ? micLevel > 8
                  ? "Voice detected"
                  : "Speak now to test microphone capture"
                : "Live meter resumes when interview is idle"}
            </p>
            <p className="mt-1 text-[11px] text-blue-600/90 dark:text-blue-300/90">
              For best clarity: use a headset mic and keep your voice in the recommended zone.
            </p>
          </div>
        )}

        {/* Active call panel */}
        {isCallActive && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Status bar */}
            <div className={`flex items-center justify-between px-4 py-3 text-sm font-medium text-white ${
              isSpeaking ? "bg-linear-to-r from-green-500 to-emerald-600" : "bg-linear-to-r from-blue-600 to-indigo-600"
            }`}>
              <div className="flex items-center gap-2">
                <Mic className={`h-4 w-4 ${isSpeaking ? "animate-pulse" : ""}`} />
                <span>{isSpeaking ? "You are speaking..." : "AI is listening / responding..."}</span>
              </div>
              <span className="text-xs opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
                Q {questionsAsked}/{questionLimit}
              </span>
            </div>

            {/* Live transcript */}
            {lastUserMessage && (
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                  <MessageSquare size={11} /> Last captured
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{lastUserMessage}</p>
              </div>
            )}

            {/* Conversation context indicator */}
            {conversation.length > 0 && (
              <div className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border-t border-indigo-100 dark:border-indigo-800/40 flex items-center gap-2">
                <Brain size={13} className="shrink-0 text-indigo-500" />
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  AI has full context of {conversation.length} conversation turns — adapting questions dynamically
                </p>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        {!isCallActive ? (
          <Button
            onClick={startCall}
            size="lg"
            className="w-full h-14 text-base font-semibold bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isLoading || micPermission === false || isGeneratingFeedback}
          >
            {isGeneratingFeedback ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />Generating Feedback...</>
            ) : isLoading ? (
              <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />Connecting...</>
            ) : (
              <><Phone className="mr-3 h-5 w-5" />{micPermission === false ? "Microphone Access Needed" : "Start Interview"}</>
            )}
          </Button>
        ) : (
          <Button
            onClick={endCall}
            size="lg"
            variant="destructive"
            className="w-full h-14 text-base font-semibold bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isGeneratingFeedback}
          >
            <PhoneOff className="mr-3 h-5 w-5" />
            {isGeneratingFeedback ? "Processing..." : "End Interview"}
          </Button>
        )}

        {/* System status */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">System Status</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-gray-600 dark:text-gray-300">
                API: {process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? "Ready" : "Error"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${micPermission === true ? "bg-green-500" : micPermission === false ? "bg-red-500" : "bg-yellow-500"}`} />
              <span className="text-gray-600 dark:text-gray-300">
                Mic: {micPermission === null ? "Checking..." : micPermission ? "Ready" : "Denied"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              <span className="text-gray-600 dark:text-gray-300">
                Call: {isCallActive ? "Active" : "Idle"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${conversation.length > 0 ? "bg-indigo-500" : "bg-gray-400"}`} />
              <span className="text-gray-600 dark:text-gray-300">
                Context: {conversation.length > 0 ? `${conversation.length} turns` : "None yet"}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            💡 Speak clearly. The AI will ask follow-up questions based on what you say.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
