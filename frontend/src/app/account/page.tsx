"use client";

import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import Info from "./components/info";
import Skills from "./components/skills";
import Company from "./components/company";
import { useRouter } from "next/navigation";
import AppliedJobs from "./components/appliedJobs";
import ApplicationTrackingDashboard from "@/components/ApplicationTrackingDashboard";
import { BarChart3, FileText } from "lucide-react";

const AccountPage = () => {
  const { isAuth, user, loading, application } = useAppData();
  const [activeTab, setActiveTab] = useState<'applications' | 'dashboard'>('applications');
  const router = useRouter();

  useEffect(()=>{
    if(!isAuth && !loading){
      router.push("/login");
    }
  },[isAuth,loading,router]);

  if (loading) return <Loading />;

  return (
    <>
      {user && (
        <div className="relative min-h-screen bg-linear-to-br from-slate-100 via-cyan-50 to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 left-8 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
            <div className="absolute top-24 right-4 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/20" />
            <div className="absolute bottom-8 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/15" />
          </div>

          <div className="relative mx-auto w-[92%] max-w-6xl py-8 md:w-[88%]">
            <Info user={user} isYourAccount={true} />
            {user.role === "jobseeker" && <Skills user={user} isYourAccount={true} />}

            {user.role === "jobseeker" && (
              <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
                {/* Tab Navigation */}
                <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/70">
                  <button
                    onClick={() => setActiveTab("applications")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      activeTab === "applications"
                        ? "bg-white text-cyan-700 shadow-sm dark:bg-slate-700 dark:text-cyan-300"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                    }`}
                  >
                    <FileText size={16} />
                    My Applications
                  </button>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      activeTab === "dashboard"
                        ? "bg-white text-cyan-700 shadow-sm dark:bg-slate-700 dark:text-cyan-300"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                    }`}
                  >
                    <BarChart3 size={16} />
                    Tracking Dashboard
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "applications" && (
                  <AppliedJobs applications={application as any} />
                )}
                {activeTab === "dashboard" && (
                  <ApplicationTrackingDashboard applications={application as any} />
                )}
              </div>
            )}

            {user.role === "recruiter" && <Company />}
          </div>
        </div>
      )}
    </>
  );
};

export default AccountPage;
