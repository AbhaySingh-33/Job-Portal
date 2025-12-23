"use client";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const router = useRouter();
  const { setIsAuth, setUser } = useAppData();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const { data } = await axios.get(
        `${auth_service}/api/auth/verify-email/${token}`
      );
      
      toast.success(data.message);
      setStatus("success");
      setMessage(data.message);
      
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      
      setUser(data.user);
      setIsAuth(true);
      
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
      setStatus("error");
      setMessage(error.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl p-8 shadow-2xl text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Verifying Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Email Verified Successfully!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting you to the homepage...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/register">
                    Try Registering Again
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;