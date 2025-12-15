"use client";

import { AppContextType, Application, AppProviderProps, User } from "@/type";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

export const utils_service = "http://localhost:5001";
export const auth_service = "http://localhost:5000";
export const user_service = "http://localhost:5002";
export const job_service = "http://localhost:5003";
export const payment_service = "http://localhost:5004";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const token = Cookies.get("token");

  async function updateProfilePic(formData: any) {
    setLoading(true);
    try {
      const {data} = await axios.put(
        `${user_service}/api/user/update/profile-pic`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success(data.message);
      fetchUser();
      
    } catch (error: any) {
      toast.error(error.response.data.message)
    }
    finally{
      setLoading(false);
    }
  }

  async function updateResume(formData: any) {
    setLoading(true);
    try {
      const {data} = await axios.put(
        `${user_service}/api/user/update/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success(data.message);
      fetchUser();
      
    } catch (error: any) {
      toast.error(error.response.data.message)
    }
    finally{
      setLoading(false);
    }
  }

  async function updateUser(name:string, phone_number:string, bio:string) {
    setBtnLoading(true);
    try {
      const {data} = await axios.put(`${user_service}/api/user/update/profile`,
        {name, phone_number, bio},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      toast.success(data.message);
      fetchUser();
      
    } catch (error: any) {
      toast.error(error.response.data.message)
    }
    finally{
      setBtnLoading(false);
    }
  }

  async function logoutUser(){
    Cookies.set("token","");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out succesfully");
  }

  async function addSkill(skill: string, setskill: React.Dispatch<React.SetStateAction<string>>) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${user_service}/api/user/add/skills`,
        { skillName: skill },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      setskill("");
      fetchUser();
    }catch (error: any) {
      toast.error(error.response.data.message)
    }
    finally{
      setBtnLoading(false);
    }
  }

  async function removeSkill(skill: string) {
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `${user_service}/api/user/delete/skills`,
        { skillName: skill },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      fetchUser();
    }catch (error: any) {
      toast.error(error.response.data.message)
    }
    finally{
      setBtnLoading(false);
    }
  }

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${user_service}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
      setIsAuth(false);
    }
  }, [token]);

  useEffect(() =>{
    fetchApplications();
  },[]);

  async function applyJob(jobId: number) { 
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${user_service}/api/user/apply/job`,
        {job_id: jobId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  const [application, setApplication] = useState<Application[] | null>([]);

  async function fetchApplications() {
    try {
      const { data } = await axios.get(
        `${user_service}/api/user/application/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setApplication(data);
    } catch (error:any) {
      console.log(error);
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        btnLoading,
        setUser,
        isAuth,
        setIsAuth,
        setLoading,
        logoutUser,
        updateProfilePic,
        updateResume,
        updateUser,
        addSkill,
        removeSkill,
        applyJob,
        application,
        fetchApplications
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};
