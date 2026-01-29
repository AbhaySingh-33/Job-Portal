"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Briefcase, Code, ArrowRight, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

interface Interview {
  id: number;
  job_role: string;
  experience_level: string;
  tech_stack: string[];
  rating?: number;
  created_at: string;
  feedback_json?: any;
}

interface InterviewCardProps {
  interview: Interview;
  onDelete?: (id: number) => void;
}

export default function InterviewCard({ interview, onDelete }: InterviewCardProps) {
  const [deleting, setDeleting] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this interview?')) return;
    
    try {
      setDeleting(true);
      const token = Cookies.get("token");
      
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/${interview.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Interview deleted successfully");
      onDelete?.(interview.id);
    } catch (error) {
      toast.error("Failed to delete interview");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {interview.job_role}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  {interview.experience_level} Level
                </Badge>
              </div>
            </div>
          </div>
          {interview.rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-700">{interview.rating}/100</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tech Stack */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tech Stack</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {interview.tech_stack?.slice(0, 4).map((tech, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
              >
                {tech}
              </Badge>
            ))}
            {interview.tech_stack?.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{interview.tech_stack.length - 4} more
              </Badge>
            )}
          </div>
        </div>
        
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Created on {formatDate(interview.created_at)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/interview/${interview.id}`} className="flex-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full group-hover:border-blue-300 group-hover:text-blue-600 transition-colors"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Start Interview
            </Button>
          </Link>
          {interview.feedback_json && (
            <Link href={`/interview/${interview.id}/feedback`}>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              >
                <FileText className="mr-2 h-4 w-4" />
                Feedback
              </Button>
            </Link>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}