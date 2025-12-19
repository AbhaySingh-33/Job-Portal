"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { Job } from '@/type';
import JobCard from './JobCard';
import { job_service, useAppData } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const RecommendedJobs = () => {
  const { user } = useAppData();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [matchScores, setMatchScores] = useState<number[]>([]);

  const token = Cookies.get('token');

  const fetchRecommendations = async () => {
    if (!user || user.role !== 'jobseeker') return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${job_service}/api/job/recommend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecommendedJobs(data.jobs || []);
      setMatchScores(data.match_scores || []);
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error);
      toast.error(
        error.response?.data?.message || 'Failed to load recommendations'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'jobseeker' && user.skills?.length > 0) {
      fetchRecommendations();
    }
  }, [user]);

  if (!user || user.role !== 'jobseeker') {
    return null;
  }

  if (user.skills?.length === 0) {
    return (
      <Card className="p-8 mb-8 border-2 border-dashed">
        <div className="text-center">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            Add Skills to Get Personalized Recommendations
          </h3>
          <p className="text-muted-foreground mb-4">
            Add your skills in your profile to see job recommendations tailored for you
          </p>
          <Button onClick={() => window.location.href = '/account'}>
            Add Skills Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Recommended For You
            </h2>
            <p className="text-sm text-muted-foreground">
              Based on your skills: {user.skills.join(', ')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRecommendations}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <TrendingUp size={16} />
          )}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </Card>
          ))}
        </div>
      ) : recommendedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedJobs.map((job, index) => (
            <div key={job.job_id} className="relative">
              <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                {Math.round((matchScores[index] || 0) * 100)}% Match
              </div>
              <JobCard job={job} index={index} />
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-2 border-dashed">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground">
            We couldn't find jobs matching your skills right now. Check back later!
          </p>
        </Card>
      )}
    </div>
  );
};

export default RecommendedJobs;