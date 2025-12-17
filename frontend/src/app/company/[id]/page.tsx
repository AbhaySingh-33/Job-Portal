"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { job_service, useAppData } from "@/context/AppContext";
import { Company, Job } from "@/type";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Globe, Plus, FileText, Users, DollarSign, Hash, MapPin, Clock, Home } from "lucide-react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CompanyPage = () => {
  const { id } = useParams();
  const token = Cookies.get("token");

  const { user, isAuth } = useAppData();
  const [loading, setloading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  async function fetchCompany() {
    try {
      setloading(true);
      const { data } = await axios.get(`${job_service}/api/job/company/${id}`);
      setCompany(data);
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  }
  useEffect(() => {
    fetchCompany();
  }, [id]);

  const isRecruiterOwner =
    user && company && user.user_id === company.recruiter_id;

  const [isUpdatedModal, setisUpdatedModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const addModalRef = useRef<HTMLButtonElement>(null);
  const updateModalRef = useRef<HTMLButtonElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [openings, setOpenings] = useState("");
  const [job_type, setJob_type] = useState("");
  const [work_location, setWork_location] = useState("");
  const [is_active, setIs_active] = useState(true);

  const clearInput = () => {
    setTitle("");
    setDescription("");
    setRole("");
    setSalary("");
    setLocation("");
    setOpenings("");
    setJob_type("");
    setWork_location("");
    setIs_active(true);
  };

  const addJobHandler = async () => {
    setBtnLoading(true);
    try {
      const jobData = {
        title,
        description,
        role,
        salary,
        location,
        openings,
        job_type,
        work_location,
        is_active,
        company_id: id,
      };

      await axios.post(`${job_service}/api/job/create`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Job created successfully");
      setBtnLoading(false);
      clearInput();
      fetchCompany();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteJobHandler = async (jobId: number) => {
    if (confirm("Are you sure you want to delete this job?")) {
      setBtnLoading(true);
      try {
        // Extract just the numeric ID in case jobId is in format like "1:1"
        const jobIdStr = String(jobId);
        const id = jobIdStr.includes(':') ? jobIdStr.split(':')[0] : jobIdStr;
        
        await axios.delete(`${job_service}/api/job/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Job deleted successfully");
        setBtnLoading(false);
        fetchCompany();
      } catch (error: any) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setBtnLoading(false);
      }
    }
  };

  const handleOpenUpdateModal = (job: Job) => {
    setSelectedJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRole(job.role);
    setSalary(String(job.salary || ""));
    setLocation(job.location || "");
    setOpenings(String(job.openings));
    setJob_type(job.job_type);
    setWork_location(job.work_location);
    setIs_active(job.is_active);
    setisUpdatedModal(true);
  };

  const handelClosedUpdateModal = () => {
    setisUpdatedModal(false);
    setSelectedJob(null);
    clearInput();
  };

  const updateJobHandler = async () => {
    if (!selectedJob) return;
    setBtnLoading(true);
    try {
      const jobId = selectedJob.job_id;
      
      const updateData = {
        title,
        description,
        role,
        salary,
        location,
        openings,
        job_type,
        work_location,
        is_active,
        company_id: id,
      };
      await axios.put(
        `${job_service}/api/job/update/${jobId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Job updated successfully");
      setBtnLoading(false);
      handelClosedUpdateModal();
      fetchCompany();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <div className="min-h-screen bg-secondary/30">
      {company && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="overflow-hidden shadow-lg border-2 mb-8">
            <div className="h-32 bg-blue-600" />
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16">
                <div className="w-32 h-32 rounded-2xl border-4 border-background overflow-hidden shadow-xl bg-background shrink-0">
                  <img
                    src={company.logo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 md:mb-4">
                  <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                  <p className="text-base leading-relaxed opacity-80 max-w-3xl">
                    {company.description}
                  </p>
                </div>

                <Link
                  href={company.website}
                  target="_blank"
                  className="md:mb-4"
                >
                  <Button className="gap-2">
                    <Globe size={18} />
                    Visit Website
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
          <Dialog>
            {/* Job section */}
            <Card className="shadow-lg border-2 overflow-hidden">
              <div className="bg-blue-600 border-b p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Briefcase size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Open Positions
                      </h2>
                      <p className="text-sm opacity-70 text-white">
                        {company.jobs?.length || 0} active job
                        {company.jobs?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {isRecruiterOwner && (
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus size={18} />
                        Post New Job
                      </Button>
                    </DialogTrigger>
                  )}
                </div>
              </div>

              {isRecruiterOwner && (
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      Post a new Job
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-5 py-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="title"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Briefcase size={16} /> Job Title
                      </label>
                      <input
                        id="title"
                        type="text"
                        placeholder="Enter job title"
                        className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <FileText size={16} /> Job Description
                      </label>
                      <textarea
                        id="description"
                        placeholder="Enter job description"
                        className="min-h-[100px] w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="role"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <Users size={16} /> Role
                      </label>
                      <input
                        id="role"
                        type="text"
                        placeholder="Enter role"
                        className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="salary"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <DollarSign size={16} /> Salary
                        </label>
                        <input
                          id="salary"
                          type="text"
                          placeholder="Enter salary"
                          className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="openings"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Hash size={16} /> Openings
                        </label>
                        <input
                          id="openings"
                          type="number"
                          placeholder="Number of openings"
                          className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                          value={openings}
                          onChange={(e) => setOpenings(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="location"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <MapPin size={16} /> Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        placeholder="Enter job location"
                        className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="job_type"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Clock size={16} /> Job Type
                        </label>
                        <select
                          id="job_type"
                          className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                          value={job_type}
                          onChange={(e) => setJob_type(e.target.value)}
                        >
                          <option value="">Select job type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="work_location"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Home size={16} /> Work Location
                        </label>
                        <select
                          id="work_location"
                          className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                          value={work_location}
                          onChange={(e) => setWork_location(e.target.value)}
                        >
                          <option value="">Select work location</option>
                          <option value="On-site">On-site</option>
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="is_active"
                        type="checkbox"
                        className="h-4 w-4"
                        checked={is_active}
                        onChange={(e) => setIs_active(e.target.checked)}
                      />
                      <label htmlFor="is_active" className="text-sm font-medium">
                        Active Job Posting
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearInput}
                        ref={addModalRef}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        onClick={addJobHandler}
                        disabled={btnLoading}
                      >
                        {btnLoading ? "Creating..." : "Create Job"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              )}
            </Card>
          </Dialog>

          {/* Update Job Dialog */}
          <Dialog open={isUpdatedModal} onOpenChange={setisUpdatedModal}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  Update Job
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <label
                    htmlFor="update-title"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Briefcase size={16} /> Job Title
                  </label>
                  <input
                    id="update-title"
                    type="text"
                    placeholder="Enter job title"
                    className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="update-description"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <FileText size={16} /> Job Description
                  </label>
                  <textarea
                    id="update-description"
                    placeholder="Enter job description"
                    className="min-h-[100px] w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="update-role"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Users size={16} /> Role
                  </label>
                  <input
                    id="update-role"
                    type="text"
                    placeholder="Enter role"
                    className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="update-salary"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <DollarSign size={16} /> Salary
                    </label>
                    <input
                      id="update-salary"
                      type="text"
                      placeholder="Enter salary"
                      className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="update-openings"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Hash size={16} /> Openings
                    </label>
                    <input
                      id="update-openings"
                      type="number"
                      placeholder="Number of openings"
                      className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={openings}
                      onChange={(e) => setOpenings(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="update-location"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <MapPin size={16} /> Location
                  </label>
                  <input
                    id="update-location"
                    type="text"
                    placeholder="Enter job location"
                    className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="update-job_type"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Clock size={16} /> Job Type
                    </label>
                    <select
                      id="update-job_type"
                      className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={job_type}
                      onChange={(e) => setJob_type(e.target.value)}
                    >
                      <option value="">Select job type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="update-work_location"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <Home size={16} /> Work Location
                    </label>
                    <select
                      id="update-work_location"
                      className="h-11 w-full px-3 py-2 border border-input bg-background rounded-md"
                      value={work_location}
                      onChange={(e) => setWork_location(e.target.value)}
                    >
                      <option value="">Select work location</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase size={16} /> Job Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIs_active(true)}
                      className={`h-11 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                        is_active
                          ? 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                          : 'bg-background border-input hover:bg-accent'
                      }`}
                    >
                      ✓ Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setIs_active(false)}
                      className={`h-11 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                        !is_active
                          ? 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200'
                          : 'bg-background border-input hover:bg-accent'
                      }`}
                    >
                      ✕ Inactive
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handelClosedUpdateModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={updateJobHandler}
                    disabled={btnLoading}
                  >
                    {btnLoading ? "Updating..." : "Update Job"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Jobs Display */}
          <div className="grid gap-6 mt-8">
            {company.jobs && company.jobs.length > 0 ? (
              company.jobs.map((job) => (
                <Card key={job.job_id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{job.role}</p>
                      <p className="text-sm leading-relaxed mb-4">{job.description}</p>
                    </div>
                    {isRecruiterOwner && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenUpdateModal(job)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteJobHandler(job.job_id)}
                          disabled={btnLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span>{job.location || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-muted-foreground" />
                      <span>{job.salary || 'Not disclosed'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{job.job_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home size={16} className="text-muted-foreground" />
                      <span>{job.work_location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash size={16} />
                      <span>{job.openings} opening{job.openings !== 1 ? 's' : ''}</span>
                    </div>
                    <Link href={`/jobs/${job.job_id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <Briefcase size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground mb-4">
                  {isRecruiterOwner 
                    ? 'Start by posting your first job opening'
                    : 'This company hasn\'t posted any jobs yet'}
                </p>

              </Card>             
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyPage;
