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
        <div className="w-[90%] md:w-[60%] m-auto">
          <Info user={user} isYourAccount={false} />
          {
            user.role === "jobseeker" && <Skills user={user} isYourAccount={false} />
          }
        </div>
      )}
    </>
  )
}

export default UserAccountPage