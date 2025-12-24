"use client";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import { redirect } from "next/navigation";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, Mail, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";

const LoginPage = () => {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const { isAuth, loading, setIsAuth, setUser, fetchApplications } = useAppData();

  if(loading) return <Loading/>;

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${auth_service}/api/auth/login`, {
        email,
        password,
      });
      
      if (data.requiresOTP) {
        toast.success(data.message);
        setShowOtpForm(true);
      } else {
        toast.success(data.message);
        Cookies.set("token", data.token, {
          expires: 15,
          secure: false,
          path: "/",
        });
        setUser(data.user);
        setIsAuth(true);
        fetchApplications();
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setIsAuth(false);
    } finally {
      setBtnLoading(false);
    }
  };

  const verifyOtpHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${auth_service}/api/auth/verify-otp`, {
        email,
        otp,
      });
      
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setUser(data.user);
      setIsAuth(true);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
            {showOtpForm ? <Shield className="w-8 h-8 text-white" /> : <Mail className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {showOtpForm ? "Verify OTP" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {showOtpForm ? "Enter the code sent to your email" : "Sign in to HireHeaven"}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
          {!showOtpForm ? (
            <form onSubmit={submitHandler} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setemail(e.target.value)}
                    required
                    className="pl-11 h-12 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                    required
                    className="pl-11 h-12 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href={"/forgot"}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button 
                disabled={btnLoading} 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
              >
                {btnLoading ? "Signing in..." : "Sign In"}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtpHandler} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Verification Code
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="pl-11 h-12 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                  />
                </div>
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-300">
                Code expires in 5 minutes
              </div>

              <Button 
                disabled={btnLoading} 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100"
              >
                {btnLoading ? "Verifying..." : "Verify & Sign In"}
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <Button 
                type="button"
                onClick={() => setShowOtpForm(false)}
                variant="outline"
                className="w-full h-12 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200"
              >
                Back to Login
              </Button>
            </form>
          )}

          {!showOtpForm && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-center text-gray-600 dark:text-gray-300">
                Don't have an account?{" "}
                <Link
                  href={"/register"}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Create Account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
