"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Brain, Code, Zap, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function CreateInterviewPage() {
  const [formData, setFormData] = useState({
    role: "",
    level: "",
    techStack: [] as string[]
  });
  const [currentTech, setCurrentTech] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();

  const addTechStack = () => {
    if (currentTech.trim() && !formData.techStack.includes(currentTech.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, currentTech.trim()]
      }));
      setCurrentTech("");
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role || !formData.level || formData.techStack.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get("token");
      
      console.log("Token from cookies:", token ? "Present" : "Missing");
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/interview/generate`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Interview questions generated!");
        router.push(`/interview/${response.data.data.id}`);
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error("Failed to create interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Create AI Interview
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Design your personalized technical interview experience with AI-powered questions
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Role Field */}
              <div className="space-y-3 group">
                <Label 
                  htmlFor="role" 
                  className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Code className="w-4 h-4" />
                  Job Role *
                </Label>
                <div className="relative">
                  <Input
                    id="role"
                    placeholder="e.g., Frontend Developer, Data Scientist, DevOps Engineer"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    onFocus={() => setFocusedField('role')}
                    onBlur={() => setFocusedField(null)}
                    className={`h-12 text-base transition-all duration-300 border-2 ${
                      focusedField === 'role' 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    required
                  />
                  {focusedField === 'role' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-in slide-in-from-left duration-300" />
                  )}
                </div>
              </div>

              {/* Experience Level Field */}
              <div className="space-y-3 group">
                <Label 
                  htmlFor="level" 
                  className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Zap className="w-4 h-4" />
                  Experience Level *
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                >
                  <SelectTrigger className="h-12 text-base border-2 hover:border-gray-300 transition-all duration-300">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent className="animate-in fade-in slide-in-from-top duration-200">
                    <SelectItem value="Entry" className="hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Entry Level (0-2 years)
                      </div>
                    </SelectItem>
                    <SelectItem value="Mid" className="hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        Mid Level (2-5 years)
                      </div>
                    </SelectItem>
                    <SelectItem value="Senior" className="hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        Senior Level (5+ years)
                      </div>
                    </SelectItem>
                    <SelectItem value="Lead" className="hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        Lead/Principal (8+ years)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tech Stack Field */}
              <div className="space-y-3 group">
                <Label 
                  htmlFor="tech" 
                  className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Sparkles className="w-4 h-4" />
                  Tech Stack *
                </Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      id="tech"
                      placeholder="e.g., React, Node.js, Python, AWS"
                      value={currentTech}
                      onChange={(e) => setCurrentTech(e.target.value)}
                      onFocus={() => setFocusedField('tech')}
                      onBlur={() => setFocusedField(null)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechStack())}
                      className={`h-12 text-base transition-all duration-300 border-2 ${
                        focusedField === 'tech' 
                          ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    {focusedField === 'tech' && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-in slide-in-from-left duration-300" />
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={addTechStack} 
                    className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                {/* Tech Stack Tags */}
                {formData.techStack.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <div className="flex flex-wrap gap-2 mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      {formData.techStack.map((tech, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-300 animate-in fade-in scale-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {tech}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors duration-200"
                            onClick={() => removeTechStack(tech)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating AI Questions...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5" />
                      Create AI Interview
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Smart questions tailored to your role and experience</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Adaptive</h3>
              <p className="text-sm text-muted-foreground">Questions adjust based on your experience level</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Comprehensive</h3>
              <p className="text-sm text-muted-foreground">Covers all aspects of your tech stack</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}