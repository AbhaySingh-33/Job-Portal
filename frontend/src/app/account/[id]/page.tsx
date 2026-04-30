"use client";
import { User } from '@/type';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import axios from 'axios';
import { user_service } from '@/context/AppContext';
import Loading from '@/components/loading';
import Info from '../components/info';
import Skills from '../components/skills';

const UserAccountPage = () => {
    const [user, setuser] = useState<User|null>(null);
    const [loading, setloading] = useState(true);

    const {id} = useParams();

    async function fetchUser(){
        const token = Cookies.get("token");

        try {
            const {data} = await axios.get(`${user_service}/api/user/${id}`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setuser(data);
            
        } catch (error) {
            console.log(error)
        }
        finally{
            setloading(false);
        }
    }

    useEffect(()=>{
        fetchUser();
    },[id]);

    if(loading) return <Loading/>

  return (
    <>
      {user && (
        <div className="relative min-h-screen bg-linear-to-br from-slate-100 via-cyan-50 to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 left-8 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
            <div className="absolute top-24 right-4 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/20" />
          </div>

          <div className="relative mx-auto w-[92%] max-w-6xl py-8 md:w-[88%]">
            <Info user={user} isYourAccount={false} />
            {user.role === "jobseeker" && <Skills user={user} isYourAccount={false} />}
          </div>
        </div>
      )}
    </>
  )
}

export default UserAccountPage