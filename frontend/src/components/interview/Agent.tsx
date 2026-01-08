"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface AgentProps {
  interviewId: string;
  questions: string[];
  jobRole: string;
  experienceLevel?: string;
}

export default function Agent({ interviewId, questions, jobRole, experienceLevel = "Mid-Level" }: AgentProps) {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [lastTranscript, setLastTranscript] = useState("");
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const router = useRouter();

  // Check microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Microphone access granted");
        setMicPermission(true);
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error("❌ Microphone access denied:", error);
        setMicPermission(false);
        toast.error("Please allow microphone access to start the interview");
      }
    };
    
    checkMicPermission();
  }, []);

  useEffect(() => {
    console.log("Initializing Vapi with token:", process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => {
      console.log("Call started successfully");
      setIsCallActive(true);
      toast.success("Interview started!");
    });

    vapiInstance.on("call-end", async () => {
      console.log("Call ended");
      setIsCallActive(false);
      
      // Use a small delay to ensure all final transcripts are captured
      setTimeout(async () => {
        const finalTranscript = transcript;
        console.log("Final transcript length:", finalTranscript.length);
        
        // Check if we have any transcript before showing completion
        if (finalTranscript.trim()) {
          toast.success("Interview completed! Generating feedback...");
          await handleGenerateFeedback(finalTranscript);
        } else {
          toast.error("No responses recorded. Please check your microphone.");
          // Still route to feedback page even without transcript
          router.push(`/interview/${interviewId}/feedback`);
        }
      }, 500);
    });

    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error);
      
      // Log detailed error information
      if (error?.error?.message) {
        console.error("Error message:", error.error.message);
        // If it's an array of messages, log each one
        if (Array.isArray(error.error.message)) {
          console.error("Validation errors:", error.error.message);
          error.error.message.forEach((msg: string, idx: number) => {
            console.error(`  ${idx + 1}. ${msg}`);
          });
          toast.error(`Configuration error: ${error.error.message[0]}`);
        } else {
          toast.error(`Error: ${error.error.message}`);
        }
      } else if (error?.message) {
        console.error("Error message:", error.message);
        toast.error(`Error: ${error.message}`);
      } else {
        console.error("Unknown error occurred");
        toast.error("Connection failed. Please check your configuration.");
      }
      
      setIsCallActive(false);
    });

    vapiInstance.on("message", (message: any) => {
      console.log("Vapi message:", message);
      
      // Capture final transcripts from user
      if (message.type === "transcript" && message.transcriptType === "final" && message.role === "user") {
        const userText = message.transcript || "";
        if (userText.trim()) {
          setTranscript(prev => prev + " " + userText);
          setLastTranscript(userText);
          console.log("✅ USER SAID:", userText);
        } else {
          console.warn("⚠️ Empty transcript received");
        }
      }
      
      // Also try to capture partial transcripts as backup
      if (message.type === "transcript" && message.role === "user") {
        console.log("📝 User transcript (type: " + message.transcriptType + "):", message.transcript);
        if (message.transcriptType === "partial" && message.transcript) {
          setLastTranscript(`${message.transcript}...`);
        }
      }
      
      // Log AI responses and track question count
      if (message.type === "transcript" && message.role === "assistant" && message.transcriptType === "final") {
        console.log("🤖 AI SAID:", message.transcript);
        // Count questions (lines ending with ?)
        if (message.transcript.trim().endsWith('?')) {
          setQuestionsAsked(prev => prev + 1);
        }
      }
      
      // Monitor speech activity with more details
      if (message.type === "speech-update") {
        if (message.role === "user" && message.status === "started") {
          console.log("🎤 You started speaking (turn", message.turn, ")");
          setIsSpeaking(true);
          setCurrentTurn(message.turn);
          setLastTranscript("Listening...");
        }
        if (message.role === "user" && message.status === "stopped") {
          console.log("🔇 You stopped speaking (turn", message.turn, ") - waiting for transcription...");
          setIsSpeaking(false);
          setLastTranscript("Processing...");
        }
      }
      
      // Log conversation updates for debugging
      if (message.type === "conversation-update") {
        console.log("💬 Conversation update:", message);
      }
      
      // Log function calls if any
      if (message.type === "function-call") {
        console.log("🔧 Function call:", message);
      }
      
      // Log status updates
      if (message.type === "status-update") {
        console.log("📊 Status:", message.status, message.endedReason ? `(${message.endedReason})` : "");
      }
    });

    return () => {
      vapiInstance.stop();
    };
  }, []);

  const handleGenerateFeedback = async (finalTranscript: string) => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/feedback`,
        {
          interviewId: parseInt(interviewId),
          transcript: finalTranscript
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success("Feedback generated successfully!");
      router.push(`/interview/${interviewId}/feedback`);
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = async () => {
    if (!vapi) {
      toast.error("Vapi not initialized");
      return;
    }

    try {
      setIsLoading(true);
      
      // Calculate question count based on experience level
      const getQuestionLimit = (level: string) => {
        switch (level.toLowerCase()) {
          case 'entry-level':
          case 'junior':
            return 5;
          case 'mid-level':
          case 'intermediate':
            return 8;
          case 'senior':
          case 'expert':
            return 10;
          default:
            return 7;
        }
      };
      
      const questionLimit = getQuestionLimit(experienceLevel);
      
      // Simplified assistant configuration with core settings only
      const assistant = {
        model: {
          provider: "openai" as const,
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system" as const,
              content: `You are an AI interviewer conducting a ${jobRole} interview for a ${experienceLevel} position. 

IMPORTANT INSTRUCTIONS:
- Ask ONLY ${questionLimit} questions total during this interview
- Ask questions one at a time and wait for complete responses
- Keep track of how many questions you've asked
- After ${questionLimit} questions, thank the candidate and say "That concludes our interview. Thank you for your time!"
- Be conversational, professional, and encouraging
- Provide brief acknowledgments between questions

Questions to cover: ${questions.join(", ")}

Remember: Stop after ${questionLimit} questions and end the interview gracefully.`
            }
          ],
          temperature: 0.7,
        },
        voice: {
          provider: "openai" as const,
          voiceId: "alloy",
        },
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2" as const,
          language: "en" as const,
        },
        firstMessage: `Hello! I'm conducting an interview for the ${jobRole} position. I'm excited to learn more about you. Let's start with our first question: Can you tell me about yourself and your background?`,
        endCallMessage: "Thank you for your time today. Your interview has been recorded and you'll receive feedback shortly. Good luck!",
        endCallPhrases: ["goodbye", "thank you goodbye", "end interview"],
        recordingEnabled: true,
        silenceTimeoutSeconds: 30,
        responseDelaySeconds: 1,
        maxDurationSeconds: 1800,
        backgroundSound: "off" as const,
        clientMessages: ["transcript", "speech-update", "status-update"],
      } as any;
      
      console.log("Starting call with assistant:", assistant);
      await vapi.start(assistant);
      
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error(`Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapi) {
      console.log("Ending call...");
      vapi.stop();
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full mb-4 mx-auto">
          <Mic className="h-10 w-10" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Interview Assistant
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Ready to conduct your {jobRole} interview. Click start when you're ready to begin.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Microphone Permission Status */}
        {micPermission === false && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <MicOff className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  Microphone Access Required
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Please allow microphone access in your browser settings to start the interview.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {micPermission === true && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Mic className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  Microphone Ready
                </p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                  Your microphone is working properly. You can start the interview.
                </p>
              </div>
            </div>
          </div>
        )}

        {micPermission === null && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  Checking Microphone Access
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Please wait while we verify your microphone permissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interview Controls */}
        <div className="text-center space-y-4">
          {!isCallActive ? (
            <Button
              onClick={startCall}
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading || micPermission === false}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="mr-3 h-5 w-5" />
                  {micPermission === false ? "Microphone Access Needed" : "Start Interview"}
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Mic className={`h-6 w-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
                  <span className="text-lg font-semibold">Interview in Progress</span>
                </div>
                <p className="text-sm opacity-90 text-center mb-2">
                  Speak clearly and wait for the AI to respond between questions
                </p>
                
                {/* Live Speech Indicator */}
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">Status:</span>
                    <span className="text-xs">
                      {isSpeaking ? "🎤 Speaking..." : "👂 Listening..."}
                    </span>
                  </div>
                  {currentTurn > 0 && (
                    <div className="text-xs opacity-90">
                      Turn: {currentTurn}
                    </div>
                  )}
                  {questionsAsked > 0 && (
                    <div className="text-xs opacity-90 mt-1">
                      Questions: {questionsAsked} / {(() => {
                        const level = experienceLevel.toLowerCase();
                        return level.includes('junior') || level.includes('entry') ? 5 : 
                               level.includes('senior') || level.includes('expert') ? 10 : 8;
                      })()}
                    </div>
                  )}
                  {lastTranscript && (
                    <div className="mt-2 text-xs bg-white/20 rounded p-2 max-h-16 overflow-y-auto">
                      <span className="font-semibold">Last:</span> {lastTranscript}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                onClick={endCall}
                size="lg"
                variant="destructive"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PhoneOff className="mr-3 h-5 w-5" />
                End Interview
              </Button>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
            System Status
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-600 dark:text-gray-300">
                API Connection: {process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? 'Ready' : 'Error'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                micPermission === true ? 'bg-green-500' : 
                micPermission === false ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="text-gray-600 dark:text-gray-300">
                Microphone: {
                  micPermission === null ? 'Checking...' : 
                  micPermission ? 'Ready' : 'Access Denied'
                }
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
              💡 <span>Tip: Speak clearly after the AI asks a question and wait for responses</span>
            </p>
            {isCallActive && (
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                ⚠️ <span>If speech isn&apos;t detected: Check mic volume, reduce background noise, or refresh and try again</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}