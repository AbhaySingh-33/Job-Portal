// src/components/hero.tsx
import React from "react";
import { TrendingUp, Search, ArrowBigRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-secondary">
      {/* soft blobs in background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-5 py-16 md:py-24 relative">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
          {/* LEFT: text content */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background/60 backdrop-blur-sm">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-sm font-medium">
                #1 Job Platform in India
              </span>
            </div>

            {/* heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Find Your Dream Job at{" "}
              <span className="inline-block">
                Hire<span className="text-red-500">Heaven</span>
              </span>
            </h1>

            {/* description */}
            <p className="text-lg md:text-xl leading-relaxed opacity-80 max-w-2xl">
              Connect with top employers and discover opportunities that match
              your skills. Whether you're a job seeker or recruiter, we've got
              you covered with powerful tools and a seamless experience.
            </p>

            {/* stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-8 py-4">
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600">10k+</p>
                <p className="text-sm opacity-70">Active Jobs</p>
              </div>

              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600">5k+</p>
                <p className="text-sm opacity-70">Companies</p>
              </div>

              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600">50k+</p>
                <p className="text-sm opacity-70">Job Seekers</p>
              </div>
            </div>

            {/* buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="text-base px-8 h-12 gap-2 group transition-all"
                >
                  <Search size={18} />
                  Browse Jobs
                  <ArrowBigRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>

              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 gap-2"
                >
                  <Briefcase size={18} />
                  Learn More
                </Button>
              </Link>
            </div>

            {/* trust indicators */}
            <div className="flex items-center gap-2 text-sm opacity-60 pt-4">
              <span>✔ Free to use</span>
              <span>•</span>
              <span>✔ Verified employers</span>
              <span>•</span>
              <span>✔ Secure platform</span>
            </div>
          </div>

          {/* RIGHT: image card */}
          <div className="flex-1 relative w-full max-w-md md:max-w-lg">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-3xl bg-blue-400/30 blur-3xl group-hover:bg-blue-400/40 transition-colors" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-background bg-background">
                <img
                  src="/hero.jpg"
                  alt="Professional candidate in office"
                  className="w-full h-[320px] md:h-[380px] lg:h-[420px] object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
