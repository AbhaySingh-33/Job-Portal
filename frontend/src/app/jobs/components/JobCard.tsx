"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Clock, DollarSign, Eye, Send, X, Check } from 'lucide-react';
import { Job } from '@/type';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/context/AppContext';

interface JobCardProps {
  job: Job;
  index: number;
}

const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  const { user, btnLoading, applyJob,application } = useAppData();
  const router = useRouter();
  const isJobseeker = user?.role === 'jobseeker';

  const applyJobHandler = async (id:number) =>{
    await applyJob(id);
  }

  const [applied, setApplied] = useState(false);

  useEffect(() =>{
    if(application && job.job_id){
      application.forEach((item: any) =>{
        if(item.job_id === job.job_id){
          setApplied(true);
        }
      })
    }

  },[application, job.job_id,]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <Card className="p-6 h-full border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800 relative overflow-hidden">
          {/* Header with Job Title and Company Logo */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <motion.h3 
                className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2"
                whileHover={{ color: "#3b82f6" }}
              >
                {job.title}
              </motion.h3>
              
              {/* Company Info */}
             
                <div className="flex items-center gap-3 mb-3">
                  <motion.div 
                    className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border"
                    whileHover={{ scale: 1.1 }}
                  >
                    <img
                      src={job.company_logo}
                      alt={job.company_name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {job.company_name}
                    </p>
                  </div>
                </div>
             
            </div>
            
            {/* Status Badge */}
            <Badge 
              variant={job.is_active ? "default" : "secondary"}
              className={`${job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} text-xs`}
            >
              {job.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Job Details */}
          <div className="space-y-3 mb-4">
            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin size={14} className="text-blue-500" />
              <span>{job.location || 'Remote'}</span>
            </div>

            {/* Job Type and Work Location */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock size={14} className="text-purple-500" />
                <span>{job.job_type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building2 size={14} className="text-orange-500" />
                <span>{job.work_location}</span>
              </div>
            </div>

            {/* Salary */}
            {job.salary && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign size={14} className="text-green-500" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>

          {/* Role Badge */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {job.role}
            </Badge>
            
            {/* Openings Count */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {job.openings || 1} opening{(job.openings || 1) !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto relative z-10">
            {job.is_active ? (
              <>
              <Link href={`/jobs/${job.job_id}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`text-xs h-8 ${isJobseeker ? "flex-1" : "w-full"}`}
                >
                  <Eye size={12} className="mr-1" />
                  View Details
                </Button>
              </Link>
                {isJobseeker && (
                  applied ? (
                    <div className="flex-1 flex items-center justify-center py-2 px-4 bg-green-50 text-green-600 rounded-md text-xs font-medium">
                      <Check size={12} className="mr-1" />
                      Applied
                    </div>
                  ) : (
                    <Button 
                      disabled={btnLoading}
                      size="sm" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-8"
                      onClick={() => {
                        applyJobHandler(job.job_id);
                      }}
                    >
                      <Send size={12} className="mr-1" />
                      Easy Apply
                    </Button>
                  )
                )}
              </>
            ) : (
              <div className="w-full flex items-center justify-center py-2 px-4 bg-red-50 text-red-600 rounded-md text-xs font-medium">
                <X size={12} className="mr-1" />
                Position Closed
              </div>
            )}
          </div>

          {/* Hover Effect Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 pointer-events-none"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </Card>
    </motion.div>
  );
};

export default JobCard;