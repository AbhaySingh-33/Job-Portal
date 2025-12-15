"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { job_service, useAppData } from "@/context/AppContext";
import { Application, Job } from "@/type";
import axios from "axios";
import { ArrowLeft, MapPin, DollarSign, Clock, Home, Hash, Check, Send, Users, FileText, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Link from "next/link";

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
        if (item.job_id.toString() === id) {
          setApplied(true);
        }
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
      const {data} = await axios.get(`${job_service}/api/job/applications/${id}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      setJobApplication(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchSingleJob();
  }, [id]);

  useEffect(() =>{
    if(user && job && user.user_id === job.posted_by_recruiter_id) {
      fetchJobApplications();
    }
  },[user, job]);

  const filteredApplications = 
    filterStatus === "All"
    ? JobApplication
    : JobApplication.filter((application) => application.status === filterStatus);

  const updateApplicationHandler = async(appId: number, status: string)=>{
    try {
      const {data} = await axios.put(`${job_service}/api/job/application/status/${appId}`,{
        status: status
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      toast.success(data.message);
      fetchJobApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  const isRecruiter = user && job && user.user_id === job.posted_by_recruiter_id;

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary/30">
      {job && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} /> Back to jobs
          </Button>

          {/* Job Header */}
          <Card className="overflow-hidden shadow-lg border-2 mb-6">
            <div className="bg-blue-600 p-8 border-b">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      job.is_active
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                        : "bg-red-100 dark:bg-red-900/30 text-red-600"
                    }`}>
                      {job.is_active ? "Open" : "Closed"}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                  <p className="text-lg text-blue-100 mb-4">{job.role}</p>
                  
                  {/* Company Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white">
                      <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link href={`/company/${job.company_id}`}>
                        <p className="text-white font-medium hover:underline">{job.company_name}</p>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Apply Button for Job Seekers */}
                {user?.role === 'jobseeker' && job.is_active && (
                  <div className="shrink-0">
                    {applied ? (
                      <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                        <Check size={18} />
                        Already Applied
                      </div>
                    ) : (
                      <Button
                        onClick={() => applyJob(job.job_id)}
                        disabled={btnLoading}
                        className="gap-2 px-6 py-3 bg-white text-blue-600 hover:bg-gray-100"
                      >
                        <Send size={18} />
                        Easy Apply
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Job Details Grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                  <MapPin size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs opacity-70">Location</p>
                    <p className="font-medium">{job.location || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                  <DollarSign size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs opacity-70">Salary</p>
                    <p className="font-medium">{job.salary || 'Not disclosed'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                  <Clock size={20} className="text-purple-600" />
                  <div>
                    <p className="text-xs opacity-70">Job Type</p>
                    <p className="font-medium">{job.job_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary">
                  <Home size={20} className="text-orange-600" />
                  <div>
                    <p className="text-xs opacity-70">Work Location</p>
                    <p className="font-medium">{job.work_location}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Hash size={16} />
                  <span>{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Job Description */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            <p className="text-base leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </Card>

          {/* Applications Section for Recruiters */}
          {isRecruiter && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users size={20} />
                  Applications ({JobApplication.length})
                </h2>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  <option value="All">All Status</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {filteredApplications.length > 0 ? (
                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <div key={app.application_id} className="p-4 border rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{app.applicant_email}</p>
                          <p className="text-sm text-muted-foreground">
                            Applied on {new Date(app.applied_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2 flex items-center gap-4">
                            <Link href={app.resume} target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                              <FileText size={16} className="text-blue-600" />
                              View Resume
                            </Link>

                            <Link href={`/account/${app.application_id}`} target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                              <User size={16} className="text-blue-600" />
                              View Profile
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status}
                          </span>
                          <select
                            onChange={(e) => updateApplicationHandler(app.application_id, e.target.value)}
                            className="px-2 py-1 text-xs border rounded bg-background"
                            defaultValue=""
                          >
                            <option value="">Update Status</option>
                            <option value="Hired">Hire</option>
                            <option value="Rejected">Reject</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No applications found for the selected filter.
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default JobPage;
