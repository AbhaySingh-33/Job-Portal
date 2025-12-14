"use client";

import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import React, { useEffect } from "react";
import Info from "./components/info";
import Skills from "./components/skills";
import Company from "./components/company";
import { useRouter } from "next/navigation";


const AccountPage = () => {
  const { isAuth, user, loading } = useAppData();

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
            user.role === "recruiter" && <Company/>
          }
        </div>
      )}
    </>
  );
};

export default AccountPage;
