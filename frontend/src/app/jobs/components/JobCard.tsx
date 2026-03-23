"use client";
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Clock, DollarSign, Eye, Send, X, Check, Briefcase } from 'lucide-react';
import { Job } from '@/type';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/context/AppContext';

interface JobCardProps {
  job: Job;
  index: number;
}

const jobTypeColors: Record<string, string> = {
  'Full-time': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Part-time': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Contract': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Internship': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

const workLocationColors: Record<string, string> = {
  'Remote': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'On-site': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Hybrid': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
};

const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  const { user, btnLoading, applyJob, application } = useAppData();
  const isJobseeker = user?.role === 'jobseeker';
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (application && job.job_id) {
      application.forEach((item: any) => {
        if (item.job_id === job.job_id) setApplied(true);
      });
    }
  }, [application, job.job_id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <div className="group h-full flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 overflow-hidden">
        
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex flex-col flex-1 p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0 shadow-sm">
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Briefcase size={18} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{job.company_name}</p>
            </div>
            <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
              job.is_active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {job.is_active ? 'Active' : 'Closed'}
            </span>
          </div>

          {/* Meta info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin size={13} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{job.location || 'Remote'}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <DollarSign size={13} className="text-green-500 flex-shrink-0" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${jobTypeColors[job.job_type] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
              <Clock size={10} className="inline mr-1" />{job.job_type}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${workLocationColors[job.work_location] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
              <Building2 size={10} className="inline mr-1" />{job.work_location}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 truncate max-w-[140px]">
              {job.role}
            </span>
          </div>

          {/* Openings */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
            {job.openings || 1} opening{(job.openings || 1) !== 1 ? 's' : ''} available
          </p>

          {/* Actions */}
          <div className="mt-auto flex gap-2">
            {job.is_active ? (
              <>
                <Link href={`/jobs/${job.job_id}`} className={isJobseeker ? 'flex-1' : 'w-full'}>
                  <Button variant="outline" size="sm" className="w-full h-9 text-xs font-medium border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors">
                    <Eye size={12} className="mr-1.5" />View Details
                  </Button>
                </Link>
                {isJobseeker && (
                  applied ? (
                    <div className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md text-xs font-medium border border-green-200 dark:border-green-800">
                      <Check size={12} />Applied
                    </div>
                  ) : (
                    <Button
                      disabled={btnLoading}
                      size="sm"
                      className="flex-1 h-9 text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                      onClick={() => applyJob(job.job_id)}
                    >
                      <Send size={12} className="mr-1.5" />Easy Apply
                    </Button>
                  )
                )}
              </>
            ) : (
              <div className="w-full flex items-center justify-center gap-1.5 h-9 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-md text-xs font-medium border border-red-200 dark:border-red-800">
                <X size={12} />Position Closed
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;
