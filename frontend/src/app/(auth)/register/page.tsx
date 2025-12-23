"use client";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import { redirect } from "next/navigation";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import { ArrowRight, Briefcase, Lock, Mail, User, Phone, FileText, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";

const RegisterPage = () => {
  const [name, setname] = useState("");
  const [role, setrole] = useState("");
  const [phoneNumber, setphoneNumber] = useState("");
  const [bio, setbio] = useState("");
  const [resume, setresume] = useState<File | null>(null);
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const { isAuth, loading, setIsAuth, setUser } = useAppData();
  if (loading) return <Loading />;

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);
    const formData = new FormData();
    formData.append("role", role);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phoneNumber", phoneNumber);

    if (role === "jobseeker") {
      formData.append("bio", bio);
      if (resume) {
        formData.append("file", resume);
      }
    }

    try {
      const { data } = await axios.post(
        `${auth_service}/api/auth/register`,
        formData
      );
      toast.success(data.message);
      // Don't set auth state immediately - wait for email verification
      // Redirect to a verification pending page or show message
    } catch (error: any) {
      toast.error(error.response.data.message);
      setIsAuth(false);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-spin" style={{animationDuration: '20s'}}></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Join HireHeaven
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Create your account and start your journey</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-blue-500/10 dark:shadow-purple-500/20 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <form onSubmit={submitHandler} className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="role" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Category
              </Label>
              <div className="relative group">
                <select
                  name=""
                  id="role"
                  value={role}
                  onChange={(e) => setrole(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-gray-700 dark:text-gray-200 font-medium hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                  required
                >
                  <option value="">✨ Select your role</option>
                  <option value="jobseeker">🔍 Find a Job</option>
                  <option value="recruiter">💼 Hire Talent</option>
                </select>
              </div>
            </div>

            {role && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-green-500" />
                    Full Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setname(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 hover:border-green-400 group-hover:shadow-lg group-hover:shadow-green-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setemail(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-500" />
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setpassword(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 hover:border-purple-400 group-hover:shadow-lg group-hover:shadow-purple-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    Phone Number
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" />
                    <Input
                      id="phoneNumber"
                      type="number"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setphoneNumber(e.target.value)}
                      required
                      className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 hover:border-orange-400 group-hover:shadow-lg group-hover:shadow-orange-500/10"
                    />
                  </div>
                </div>

                {role === "jobseeker" && (
                  <div className="space-y-6 pt-6 border-t border-gradient-to-r from-blue-200 via-purple-200 to-pink-200 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 animate-in fade-in slide-in-from-bottom duration-500 delay-300">
                    <div className="space-y-3">
                      <Label htmlFor="resume" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Resume (PDF)
                      </Label>
                      <div className="relative group">
                        <Input
                          id="resume"
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setresume(e.target.files[0]);
                            }
                          }}
                          className="h-12 cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 hover:border-indigo-400 group-hover:shadow-lg group-hover:shadow-indigo-500/10 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-500" />
                        Bio
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-200" />
                        <textarea
                          id="bio"
                          placeholder="Tell us about yourself, your skills, and experience..."
                          value={bio}
                          onChange={(e) => setbio(e.target.value)}
                          rows={3}
                          className="w-full pl-12 pt-3 pb-3 pr-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition-all duration-300 hover:border-teal-400 group-hover:shadow-lg group-hover:shadow-teal-500/10 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  disabled={btnLoading} 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                >
                  <span className="flex items-center justify-center gap-2">
                    {btnLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Please wait...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
            )}
          </form>
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <Link
                href={"/login"}
                className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 inline-block"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
