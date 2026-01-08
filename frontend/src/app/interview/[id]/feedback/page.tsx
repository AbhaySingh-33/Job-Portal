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
}

export default function FeedbackPage() {
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
      toast.error("Failed to fetch interview feedback");
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
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading feedback...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!interview || !interview.feedback_json) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Feedback Not Available</h2>
              <p className="text-gray-600 dark:text-gray-400">The feedback for this interview is not ready yet or doesn't exist.</p>
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

  const feedback = interview.feedback_json;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/interview">
              <Button variant="outline" size="sm" className="hover:bg-white/80">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Interviews
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full mb-4">
              <Award className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Interview Feedback
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {interview.job_role} • {formatDate(interview.created_at)}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Overall Score Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative">
                  <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-4">
                    {feedback.overallRating}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-300 mb-4">out of 100</div>
                  <Progress 
                    value={feedback.overallRating} 
                    className="w-full h-3 bg-gray-200 dark:bg-gray-700" 
                  />
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {feedback.overallRating >= 80 ? 'Excellent Performance!' : 
                     feedback.overallRating >= 60 ? 'Good Performance' : 
                     feedback.overallRating >= 40 ? 'Average Performance' : 'Needs Improvement'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Technical Skills</span>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{feedback.technicalScore}/100</span>
                  </div>
                  <Progress value={feedback.technicalScore} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Communication</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{feedback.communicationScore}/100</span>
                  </div>
                  <Progress value={feedback.communicationScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Interview Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feedback.summary}</p>
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <TrendingUp className="h-5 w-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.strengths?.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/10 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <TrendingDown className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {feedback.improvements?.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/10 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{improvement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interview Details */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Position</h4>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{interview.job_role}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Experience Level</h4>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    {interview.experience_level}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {interview.tech_stack?.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {tech}
                      </Badge>
                    ))}
                    {interview.tech_stack?.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
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
              <Button variant="outline" size="lg">
                View All Interviews
              </Button>
            </Link>
            <Link href="/interview/create">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Take Another Interview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}