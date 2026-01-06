import { Application, ApplicationStatusHistory } from '@/type'
import { CheckCircle2, XCircle, Briefcase, DollarSign, Eye, Clock, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import React, { useState } from 'react'
import axios from 'axios';

interface AppliedJobsPorps{
    applications: Application[];
}

const AppliedJobs: React.FC<AppliedJobsPorps> = ({applications}) => {
    const [expandedApp, setExpandedApp] = useState<number | null>(null);
    const [statusHistory, setStatusHistory] = useState<{[key: number]: ApplicationStatusHistory[]}>({});
    const [loadingHistory, setLoadingHistory] = useState<{[key: number]: boolean}>({});

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
            case 'interview scheduled':
            case 'interview completed':
                return {
                    icon: Calendar,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100 dark:bg-blue-900/20',
                    border: 'border-blue-200 dark:border-blue-700',
                };
            case 'under review':
                return {
                    icon: Clock,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
                    border: 'border-yellow-200 dark:border-yellow-700',
                };
            default:
                return {
                    icon: FileText,
                    color: 'text-gray-600',
                    bg: 'bg-gray-100 dark:bg-gray-900/20',
                    border: 'border-gray-200 dark:border-gray-700',
                };
        }
    }

    const fetchStatusHistory = async (applicationId: number) => {
        if (statusHistory[applicationId]) {
            return; // Already loaded
        }

        setLoadingHistory(prev => ({...prev, [applicationId]: true}));
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_USER_SERVICE}/api/user/application/history/${applicationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setStatusHistory(prev => ({...prev, [applicationId]: response.data}));
        } catch (error) {
            console.error('Error fetching status history:', error);
        } finally {
            setLoadingHistory(prev => ({...prev, [applicationId]: false}));
        }
    };

    const toggleExpanded = (applicationId: number) => {
        if (expandedApp === applicationId) {
            setExpandedApp(null);
        } else {
            setExpandedApp(applicationId);
            fetchStatusHistory(applicationId);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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

                                                <div className="flex flex-wrap gap-4 items-center mb-3">
                                                    {/* Salary */}
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <DollarSign size={14} className="text-green-600" />
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                                            ₹ {a.job_salary}
                                                        </span>
                                                    </div>

                                                    {/* Status */}
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

                                                    {/* Applied Date */}
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <Clock size={14} />
                                                        <span>Applied: {formatDate(a.applied_at)}</span>
                                                    </div>
                                                </div>

                                                {/* Status History Toggle */}
                                                <button
                                                    onClick={() => toggleExpanded(a.application_id)}
                                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    {expandedApp === a.application_id ? (
                                                        <>
                                                            <ChevronUp size={16} />
                                                            Hide Timeline
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown size={16} />
                                                            View Timeline
                                                        </>
                                                    )}
                                                </button>
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

                                        {/* Expanded Status History */}
                                        {expandedApp === a.application_id && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                                    Application Timeline
                                                </h4>
                                                
                                                {loadingHistory[a.application_id] ? (
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Clock size={16} className="animate-spin" />
                                                        Loading timeline...
                                                    </div>
                                                ) : statusHistory[a.application_id] && statusHistory[a.application_id].length > 0 ? (
                                                    <div className="space-y-3">
                                                        {statusHistory[a.application_id].map((history, index) => {
                                                            const historyStatusConfig = getStatusConfig(history.status);
                                                            const HistoryIcon = historyStatusConfig.icon;
                                                            return (
                                                                <div key={history.history_id} className="flex items-start gap-3">
                                                                    <div className={`p-2 rounded-full ${historyStatusConfig.bg}`}>
                                                                        <HistoryIcon size={16} className={historyStatusConfig.color} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className={`font-medium ${historyStatusConfig.color}`}>
                                                                                {history.status}
                                                                            </span>
                                                                            <span className="text-sm text-gray-500">
                                                                                {formatDate(history.changed_at)}
                                                                            </span>
                                                                        </div>
                                                                        {history.notes && (
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                {history.notes}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 text-sm">No status updates yet</p>
                                                )}
                                            </div>
                                        )}
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