"use client";
import Hero from '@/components/hero'
import CareerGuide from '@/components/carrer-guide'
import { Button } from '@/components/ui/button'
import React from 'react'
import ResumeAnalyzer from '@/components/resume-analyzer'
import { useAppData } from '@/context/AppContext'
import Loading from '@/components/loading'

const Home = () => {
  const {loading} = useAppData();
  if(loading) return <Loading/>
  return (
    <div>
      <Hero />
      <CareerGuide />
      <ResumeAnalyzer/>
    </div>
  )
}

export default Home