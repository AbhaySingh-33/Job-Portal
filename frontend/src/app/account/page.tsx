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
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={true} />
          {
            user.role === "jobseeker" && <Skills user={user} isYourAccount={true} />
          }

          {
            user.role === "jobseeker" && (
              <div className="mt-8">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                  <button
                    onClick={() => setActiveTab('applications')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'applications'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <FileText size={16} />
                    My Applications
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'dashboard'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <BarChart3 size={16} />
                    Tracking Dashboard
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'applications' && (
                  <AppliedJobs applications={application as any} />
                )}
                {activeTab === 'dashboard' && (
                  <ApplicationTrackingDashboard applications={application as any} />
                )}
              </div>
            )
          }

          {
            user.role === "recruiter" && <Company/>
          }
        </div>
      )}
    </>
  );
};

export default AccountPage;
