"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Agent from "@/components/interview/Agent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, Briefcase, Target, Code } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";

interface Interview {
  id: number;
  job_role: string;
  experience_level: string;
  tech_stack: string[];
  questions: string[];
  created_at: string;
  feedback_json?: any;
}

export default function InterviewDetailPage() {
  const params = useParams();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInterview();
    }
  }, [params.id]);

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
        setInterview(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching interview:", error);
      toast.error("Failed to fetch interview details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading interview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Interview Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400">The interview you're looking for doesn't exist or has been removed.</p>
              <Link href="/interview">
                <Button className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Interviews
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/interview">
              <Button variant="outline" size="sm" className="hover:bg-white/80">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Interviews
              </Button>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
              <Briefcase className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {interview.job_role} Interview
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              AI-Powered Technical Interview Session
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interview Details Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Interview Info Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                  Interview Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(interview.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Experience Level</p>
                    <Badge variant="outline" className="mt-1 bg-green-100 text-green-800 border-green-300">
                      {interview.experience_level} Level
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack Card */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Code className="h-5 w-5 text-purple-600" />
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {interview.tech_stack?.map((tech, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-amber-800 dark:text-amber-200">💡 Interview Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                  <p>• Speak clearly and at a moderate pace</p>
                  <p>• Take your time to think before answering</p>
                  <p>• Ask clarifying questions if needed</p>
                  <p>• Be specific with examples</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Interview Area */}
          <div className="lg:col-span-2">
            <Agent
              interviewId={params.id as string}
              questions={interview.questions || []}
              jobRole={interview.job_role}
            />
          </div>
        </div>
      </div>
    </div>
  );
}