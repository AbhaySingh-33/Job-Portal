"use client";
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { job_service } from '@/context/AppContext';
import { Job } from '@/type';
import Loading from '@/components/loading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Ban, Briefcase, Filter, X, Search } from 'lucide-react';
import JobCard from './components/JobCard';
import { motion } from 'framer-motion';

const location: string[]= [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Remote",
]

const JobPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterTitle, setFilterTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchJobs = async (title: string, location: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (title) params.append('title', title);
      if (location) params.append('location', location);
      
      const { data } = await axios.get(`${job_service}/api/job/all?${params}`);
      setJobs(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(filterTitle, filterLocation);
  }, [filterTitle, filterLocation]);

  const handleApplyFilters = () => {
    setFilterTitle(tempTitle);
    setFilterLocation(tempLocation);
    setDialogOpen(false);
  };

  const clearFilters = () => {
    setFilterTitle("");
    setFilterLocation("");
    setTempTitle("");
    setTempLocation("");
  };

  const hasActiveFilters = filterTitle || filterLocation;

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Explore <span className="text-red-500">Opportunities</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {jobs.length} jobs available
          </p>
        </motion.div>

        {/* Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Search size={20} />
                    Filter Jobs
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="Search by job title..."
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <select
                      id="location"
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {location.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleApplyFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active Filters:</span>
                {filterTitle && (
                  <Badge variant="secondary" className="gap-1">
                    Title: {filterTitle}
                    <X size={12} className="cursor-pointer" onClick={() => setFilterTitle("")} />
                  </Badge>
                )}
                {filterLocation && (
                  <Badge variant="secondary" className="gap-1">
                    Location: {filterLocation}
                    <X size={12} className="cursor-pointer" onClick={() => setFilterLocation("")} />
                  </Badge>
                )}
                <Button size="sm" variant="ghost" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <JobCard key={job.job_id} job={job} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 text-center">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No jobs available</h3>
              <p className="text-gray-500">
                There are currently no job postings available. Check back later!
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobPage