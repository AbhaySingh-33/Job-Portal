import { Application } from '@/type'
import { CheckCircle2, XCircle, Briefcase, DollarSign, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import React from 'react'

interface AppliedJobsPorps{
    applications: Application[];
}


const AppliedJobs: React.FC<AppliedJobsPorps> = ({applications}) => {
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'hired':
                return {
                    icon: CheckCircle2,
                    color: 'text-green-600',
                    bg: 'bg-green-100 dark:bg-green-900/20',
                    border: 'border-green-200 dark:border-green-700',
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bg: 'bg-red-100 dark:bg-red-900/20',
                    border: 'border-red-200 dark:border-red-700',
                };
            default:
                return {
                    icon: null,
                    color: 'text-gray-600',
                    bg: 'bg-gray-100 dark:bg-gray-900/20',
                    border: 'border-gray-200 dark:border-gray-700',
                };
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <Card className="shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Briefcase size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Your Applied Jobs</h1>
                            <p className="text-blue-100">
                                {applications.length} applications submitted
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {applications && applications.length > 0 ? (
                        <div className="space-y-4">
                            {applications.map((a) => {
                                const statusConfig = getStatusConfig(a.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <Card
                                        key={a.application_id}
                                        className="p-5 hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
                                    >
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            {/* Left: Job info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                                    {a.job_title}
                                                </h3>

                                                <div className="flex flex-wrap gap-4 items-center">
                                                    {/* Salary */}
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <DollarSign size={14} className="text-green-600" />
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            ₹ {a.job_salary}
                                                        </span>
                                                    </div>

                                                    {/* Status */}
                                                    {StatusIcon && (
                                                        <div
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.border}`}
                                                        >
                                                            <StatusIcon
                                                                size={14}
                                                                className={statusConfig.color}
                                                            />
                                                            <span
                                                                className={`font-medium text-sm ${statusConfig.color}`}
                                                            >
                                                                {a.status}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: View job link */}
                                            <Link
                                                href={`/jobs/${a.job_id}`}
                                                className="shrink-0 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Eye size={16} />
                                                <span className="font-medium">View Job</span>
                                            </Link>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-lg">No Applications Yet</p>
                            <p className="text-gray-400 text-sm mt-2">Start applying to jobs to see them here</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default AppliedJobs