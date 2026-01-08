"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InterviewCard from "@/components/interview/InterviewCard";
import Link from "next/link";
import { Plus, Brain, Target, Zap, Crown } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";

interface Interview {
  id: number;
  job_role: string;
  experience_level: string;
  tech_stack: string[];
  rating?: number;
  created_at: string;
  feedback_json?: any;
}

export default function InterviewPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppData();
  const router = useRouter();
  
  const hasSubscription = user?.subscription && user.subscription !== null;

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/my-interviews`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setInterviews(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your interviews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full mb-6">
            <Brain className="h-10 w-10" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Interview Practice
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Sharpen your technical interview skills with AI-powered mock interviews. 
            Get real-time feedback and improve your performance.
          </p>
          
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mx-auto mb-3">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Targeted Practice</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Role-specific questions tailored to your experience level</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mx-auto mb-3">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI-Powered</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Advanced AI conducts realistic interview sessions</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mx-auto mb-3">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Instant Feedback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Detailed analysis and improvement suggestions</p>
            </div>
          </div>
          
          {hasSubscription ? (
            <Link href="/interview/create">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="mr-2 h-5 w-5" />
                Start New Interview
              </Button>
            </Link>
          ) : (
            <div className="space-y-4">
              <Button 
                size="lg" 
                onClick={() => router.push('/subscribe')}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-lg px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Crown className="mr-2 h-5 w-5" />
                Subscribe to Start Interviews
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                🔒 A subscription is required to access AI interview practice
              </p>
            </div>
          )}
        </div>

        {/* Interviews Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your Interviews</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {interviews.length > 0 
                  ? `You have completed ${interviews.length} interview${interviews.length === 1 ? '' : 's'}`
                  : 'No interviews yet - start your first one!'}
              </p>
            </div>
          </div>

          {interviews.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 rounded-full mb-4 mx-auto">
                  <Brain className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Ready to Start?</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  Take your first AI-powered technical interview and get personalized feedback to improve your skills.
                </p>
                <div className="space-y-3">
                  {hasSubscription ? (
                    <Link href="/interview/create">
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Your First Interview
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={() => router.push('/subscribe')}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      Subscribe to Get Started
                    </Button>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 {hasSubscription ? 'Choose your role, experience level, and tech stack to get started' : 'Subscribe to unlock unlimited AI-powered interviews'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}