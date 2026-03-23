"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { job_service, useAppData } from "@/context/AppContext";
import { Application, Job } from "@/type";
import axios from "axios";
import {
  ArrowLeft, MapPin, DollarSign, Clock, Home, Hash, Check, Send,
  Users, FileText, User, Building2, Calendar, Briefcase, ChevronDown,
  ExternalLink, Shield
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Link from "next/link";

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

const statusConfig: Record<string, { bg: string; dot: string }> = {
  Submitted:            { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', dot: 'bg-yellow-500' },
  'Under Review':       { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',   dot: 'bg-blue-500' },
  'Interview Scheduled':{ bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', dot: 'bg-purple-500' },
  'Interview Completed':{ bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', dot: 'bg-indigo-500' },
  Hired:                { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', dot: 'bg-green-500' },
  Rejected:             { bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',       dot: 'bg-red-500' },
};

const STATUS_OPTIONS = ['Submitted', 'Under Review', 'Interview Scheduled', 'Interview Completed', 'Hired', 'Rejected'];

const JobPage = () => {
  const { id } = useParams();
  const { user, applyJob, application, btnLoading } = useAppData();
  const router = useRouter();

  const [applied, setApplied] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [JobApplication, setJobApplication] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const token = Cookies.get('token');

  useEffect(() => {
    if (application && id) {
      application.forEach((item: any) => {
        if (item.job_id.toString() === id) setApplied(true);
      });
    }
  }, [application, id]);

  async function fetchSingleJob() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/${id}`);
      setJob(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchJobApplications() {
    try {
      const { data } = await axios.get(`${job_service}/api/job/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobApplication(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => { fetchSingleJob(); }, [id]);
  useEffect(() => {
    if (user && job && user.user_id === job.posted_by_recruiter_id) fetchJobApplications();
  }, [user, job]);

  const filteredApplications =
    filterStatus === "All" ? JobApplication : JobApplication.filter((a) => a.status === filterStatus);

  const updateApplicationHandler = async (appId: number, status: string) => {
    try {
      const { data } = await axios.put(
        `${job_service}/api/job/application/status/${appId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message);
      fetchJobApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const isRecruiter = user && job && user.user_id === job.posted_by_recruiter_id;

  if (loading) return <Loading />;
  if (!job) return null;

  const statCards = [
    { icon: <MapPin size={18} className="text-blue-500" />, label: 'Location', value: job.location || 'Not specified', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: <DollarSign size={18} className="text-green-500" />, label: 'Salary', value: job.salary ? String(job.salary) : 'Not disclosed', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: <Clock size={18} className="text-purple-500" />, label: 'Job Type', value: job.job_type, bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: <Home size={18} className="text-orange-500" />, label: 'Work Mode', value: job.work_location, bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { icon: <Hash size={18} className="text-indigo-500" />, label: 'Openings', value: `${job.openings} position${job.openings !== 1 ? 's' : ''}`, bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { icon: <Calendar size={18} className="text-rose-500" />, label: 'Posted', value: new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to jobs
        </button>

        {/* Hero Card */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/60 shadow-lg mb-6 bg-white dark:bg-gray-900">
          {/* Gradient header */}
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                {/* Company logo */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-lg flex-shrink-0 border-2 border-white/30">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Briefcase size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>

                <div>
                  {/* Status pill */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                    job.is_active
                      ? 'bg-green-400/20 text-green-200 border border-green-400/30'
                      : 'bg-red-400/20 text-red-200 border border-red-400/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${job.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                    {job.is_active ? 'Actively Hiring' : 'Position Closed'}
                  </span>

                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-1">{job.title}</h1>
                  <p className="text-blue-200 text-sm mb-3">{job.role}</p>

                  <Link href={`/company/${job.company_id}`} className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors group/link">
                    <Building2 size={14} />
                    {job.company_name}
                    <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </div>

              {/* Apply button */}
              {user?.role === 'jobseeker' && job.is_active && (
                <div className="shrink-0">
                  {applied ? (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-400/20 border border-green-400/40 text-green-200 rounded-xl text-sm font-semibold">
                      <Check size={16} />Already Applied
                    </div>
                  ) : (
                    <Button
                      onClick={() => applyJob(job.job_id)}
                      disabled={btnLoading}
                      className="gap-2 px-6 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      <Send size={15} />Easy Apply
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Type badges */}
            <div className="relative flex flex-wrap gap-2 mt-5">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${jobTypeColors[job.job_type] || 'bg-white/20 text-white'}`}>
                {job.job_type}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${workLocationColors[job.work_location] || 'bg-white/20 text-white'}`}>
                {job.work_location}
              </span>
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-gray-800">
            {statCards.map((s, i) => (
              <div key={i} className={`flex flex-col items-center justify-center gap-1.5 p-4 text-center ${s.bg}`}>
                {s.icon}
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold">{s.label}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm p-7 mb-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <FileText size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Job Description</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{job.description}</p>
        </div>

        {/* Recruiter: Applications */}
        {isRecruiter && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Applications
                  <span className="ml-2 text-sm font-normal text-gray-400">({JobApplication.length})</span>
                </h2>
              </div>

              {/* Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Status</option>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Application list */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app, i) => {
                  const sc = statusConfig[app.status] || statusConfig['Submitted'];
                  return (
                    <div key={app.application_id} className="flex items-center gap-4 px-7 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {app.applicant_email[0].toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{app.applicant_email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Applied {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <Link href={app.resume} target="_blank" className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                            <FileText size={11} />Resume
                          </Link>
                          <Link href={`/account/${app.application_id}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                            <User size={11} />Profile
                          </Link>
                        </div>
                      </div>

                      {/* Status + update */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {app.status}
                        </span>
                        <div className="relative">
                          <select
                            onChange={(e) => { if (e.target.value) updateApplicationHandler(app.application_id, e.target.value); }}
                            className="appearance-none pl-2.5 pr-7 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>Update</option>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No applications found</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try changing the status filter</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPage;
