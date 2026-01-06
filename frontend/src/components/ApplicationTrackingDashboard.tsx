import React, { useState, useEffect } from 'react';
import { Application } from '@/type';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  FileText,
  Filter
} from 'lucide-react';

interface ApplicationTrackingDashboardProps {
  applications: Application[];
}

const ApplicationTrackingDashboard: React.FC<ApplicationTrackingDashboardProps> = ({ 
  applications 
}) => {
  const [filteredApplications, setFilteredApplications] = useState<Application[]>(applications);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(app => new Date(app.applied_at) >= filterDate);
    }

    setFilteredApplications(filtered);
  }, [applications, statusFilter, dateFilter]);

  const stats = {
    total: applications.length,
    submitted: applications.filter(app => app.status.toLowerCase() === 'submitted').length,
    underReview: applications.filter(app => app.status.toLowerCase() === 'under review').length,
    interviewed: applications.filter(app => 
      app.status.toLowerCase().includes('interview')
    ).length,
    hired: applications.filter(app => app.status.toLowerCase() === 'hired').length,
    rejected: applications.filter(app => app.status.toLowerCase() === 'rejected').length,
  };

  const responseRate = stats.total > 0 ? 
    Math.round(((stats.total - stats.submitted) / stats.total) * 100) : 0;
  
  const successRate = stats.total > 0 ? 
    Math.round((stats.hired / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{responseRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{successRate}%</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Under Review</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.underReview}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Application Status Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Submitted', count: stats.submitted, icon: FileText, color: 'text-gray-600' },
            { label: 'Under Review', count: stats.underReview, icon: Clock, color: 'text-yellow-600' },
            { label: 'Interviewed', count: stats.interviewed, icon: Calendar, color: 'text-blue-600' },
            { label: 'Hired', count: stats.hired, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Rejected', count: stats.rejected, icon: XCircle, color: 'text-red-600' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="text-center">
                <div className={`flex justify-center mb-2 ${item.color}`}>
                  <Icon size={24} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.label}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under review">Under Review</option>
            <option value="interview scheduled">Interview Scheduled</option>
            <option value="interview completed">Interview Completed</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>

          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
          </select>

          <span className="text-sm text-gray-500">
            Showing {filteredApplications.length} of {applications.length} applications
          </span>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
        <div className="space-y-3">
          {filteredApplications.slice(0, 5).map((app) => (
            <div key={app.application_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{app.job_title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Applied: {new Date(app.applied_at).toLocaleDateString()}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ApplicationTrackingDashboard;