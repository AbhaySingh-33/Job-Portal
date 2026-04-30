"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, TrendingDown, ArrowLeft, Award, Target, MessageSquare, Code } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";

interface Feedback {
  overallRating: number;
  strengths: string[];
  improvements: string[];
  technicalScore: number;
  communicationScore: number;
  summary: string;
}

interface Interview {
  id: number;
  job_role: string;
  experience_level: string;
  tech_stack: string[];
  rating: number;
  feedback_json: Feedback;
  created_at: string;
  transcript?: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchInterview();
    }
  }, [params.id]);

  // Poll for feedback if not available yet
  useEffect(() => {
    if (interview && !interview.feedback_json && retryCount < 10) {
      const timer = setTimeout(() => {
        console.log("Retrying to fetch feedback... attempt", retryCount + 1);
        fetchInterview();
        setRetryCount(prev => prev + 1);
      }, 2000); // Retry every 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [interview, retryCount]);

  const fetchInterview = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        const interviewData = response.data.data;
        console.log("Interview data received:", interviewData);
        console.log("Feedback available:", !!interviewData.feedback_json);
        console.log("Transcript available:", !!interviewData.transcript);
        console.log("Transcript length:", interviewData.transcript?.length || 0);
        setInterview(interviewData);
      }
    } catch (error) {
      console.error("Error fetching interview:", error);
      toast.error("Failed to fetch interview feedback");
    } finally {
      setLoading(false);
    }
  };

  const manualGenerateFeedback = async () => {
    if (!interview) return;
    
    try {
      setLoading(true);
      const token = Cookies.get("token");
      
      console.log("🔄 Manually generating feedback...");
      
      // Use transcript from interview or provide a fallback
      const transcript = interview.transcript || "Interview completed but no transcript was recorded.";
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/feedback`,
        {
          interviewId: parseInt(params.id as string),
          transcript: transcript
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        toast.success("Feedback generated!");
        setRetryCount(0);
        fetchInterview();
      }
    } catch (error) {
      console.error("Error generating feedback:", error);
      toast.error("Failed to generate feedback");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading feedback...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!interview || !interview.feedback_json) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              {retryCount < 10 ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Generating Feedback</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we analyze your interview responses...
                  </p>
                  <p className="text-sm text-gray-500">Attempt {retryCount + 1} of 10</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">📋</div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Feedback Not Available</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    The feedback for this interview is taking longer than expected.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={manualGenerateFeedback} disabled={loading}>
                      {loading ? "Generating..." : "Generate Feedback"}
                    </Button>
                    <Link href="/interview">
                      <Button variant="outline" className="mt-0">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Interviews
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const feedback = interview.feedback_json;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-10 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute top-36 right-8 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/20" />
        <div className="absolute bottom-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/15" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/interview">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200/70 bg-white/70 text-slate-800 backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Interviews
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-green-600 to-emerald-600 text-white rounded-full mb-4">
              <Award className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Interview Feedback
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {interview.job_role} • {formatDate(interview.created_at)}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Overall Score Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-amber-200/60 shadow-xl bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 dark:border-amber-500/20 dark:from-amber-950/50 dark:via-orange-950/40 dark:to-rose-950/30 dark:shadow-amber-900/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl text-slate-900 dark:text-slate-100">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative">
                  <div className="mb-4 bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-6xl font-bold text-transparent dark:from-amber-300 dark:to-orange-300">
                    {feedback.overallRating}
                  </div>
                  <div className="mb-4 text-lg text-slate-600 dark:text-slate-300">out of 100</div>
                  <Progress 
                    value={feedback.overallRating} 
                    className="h-3 w-full bg-white/70 dark:bg-slate-800 [&>div]:bg-linear-to-r [&>div]:from-amber-500 [&>div]:to-orange-500" 
                  />
                  <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {feedback.overallRating >= 80 ? 'Excellent Performance!' : 
                     feedback.overallRating >= 60 ? 'Good Performance' : 
                     feedback.overallRating >= 40 ? 'Average Performance' : 'Needs Improvement'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/75">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Target className="h-5 w-5 text-blue-600" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Technical Skills</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{feedback.technicalScore}/100</span>
                  </div>
                  <Progress
                    value={feedback.technicalScore}
                    className="h-2 bg-slate-200 dark:bg-slate-800 [&>div]:bg-linear-to-r [&>div]:from-violet-500 [&>div]:to-fuchsia-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Communication</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{feedback.communicationScore}/100</span>
                  </div>
                  <Progress
                    value={feedback.communicationScore}
                    className="h-2 bg-slate-200 dark:bg-slate-800 [&>div]:bg-linear-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="border border-slate-200/80 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/75">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">Interview Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-blue-200/70 bg-linear-to-r from-blue-50 to-cyan-50 p-4 dark:border-blue-900/60 dark:bg-linear-to-r dark:from-blue-950/60 dark:to-cyan-950/40">
                <p className="leading-relaxed text-slate-700 dark:text-slate-200">{feedback.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-emerald-200/60 shadow-xl bg-linear-to-br from-emerald-50 to-teal-50 dark:border-emerald-500/20 dark:from-emerald-950/45 dark:to-teal-950/35">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <TrendingUp className="h-5 w-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.strengths?.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg border border-emerald-200/60 bg-white/70 p-3 dark:border-emerald-900/70 dark:bg-emerald-950/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-orange-200/60 shadow-xl bg-linear-to-br from-orange-50 to-rose-50 dark:border-orange-500/20 dark:from-orange-950/45 dark:to-rose-950/35">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <TrendingDown className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.improvements?.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg border border-orange-200/60 bg-white/70 p-3 dark:border-orange-900/70 dark:bg-orange-950/30">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{improvement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interview Details */}
          <Card className="border border-slate-200/80 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/75">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Interview Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border border-blue-200/70 bg-blue-50 p-4 text-center dark:border-blue-900/50 dark:bg-blue-950/30">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Position</h4>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{interview.job_role}</p>
                </div>
                <div className="rounded-lg border border-purple-200/70 bg-purple-50 p-4 text-center dark:border-purple-900/50 dark:bg-purple-950/30">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Experience Level</h4>
                  <Badge variant="outline" className="border-purple-300 bg-purple-100 text-purple-800 dark:border-purple-700 dark:bg-purple-900/60 dark:text-purple-200">
                    {interview.experience_level}
                  </Badge>
                </div>
                <div className="rounded-lg border border-emerald-200/70 bg-emerald-50 p-4 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {interview.tech_stack?.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="bg-emerald-100 text-xs text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                        {tech}
                      </Badge>
                    ))}
                    {interview.tech_stack?.length > 3 && (
                      <Badge variant="secondary" className="bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        +{interview.tech_stack.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Link href="/interview">
              <Button
                variant="outline"
                size="lg"
                className="border-slate-200/70 bg-white/70 text-slate-800 backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                View All Interviews
              </Button>
            </Link>
            <Link href="/interview/create">
              <Button size="lg" className="border border-cyan-400/30 bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/20 hover:from-cyan-500 hover:to-blue-500">
                Take Another Interview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}