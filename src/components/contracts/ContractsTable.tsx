import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, FileText, TrendingUp, Shield, Clock } from 'lucide-react';
import type { Document } from '../../types';

interface ContractsTableProps {
  contracts?: Document[];
  loading: boolean;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { 
        color: 'bg-success-100 text-success-800 border-success-200', 
        icon: Shield,
        label: 'Active'
      };
    case 'pending':
      return { 
        color: 'bg-warning-100 text-warning-800 border-warning-200', 
        icon: Clock,
        label: 'Pending'
      };
    case 'expired':
      return { 
        color: 'bg-danger-100 text-danger-800 border-danger-200', 
        icon: TrendingUp,
        label: 'Expired'
      };
    default:
      return { 
        color: 'bg-secondary-100 text-secondary-800 border-secondary-200', 
        icon: FileText,
        label: status
      };
  }
};

const getRiskConfig = (risk: string) => {
  switch (risk) {
    case 'high':
      return { 
        color: 'bg-danger-100 text-danger-800 border-danger-200',
        dots: 3
      };
    case 'medium':
      return { 
        color: 'bg-warning-100 text-warning-800 border-warning-200',
        dots: 2
      };
    case 'low':
      return { 
        color: 'bg-success-100 text-success-800 border-success-200',
        dots: 1
      };
    default:
      return { 
        color: 'bg-secondary-100 text-secondary-800 border-secondary-200',
        dots: 1
      };
  }
};

export const ContractsTable: React.FC<ContractsTableProps> = ({ contracts, loading }) => {
  if (loading) {
    return (
      <div className="bg-white shadow-soft rounded-2xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-secondary-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                  <div className="h-3 bg-secondary-100 rounded w-1/6"></div>
                </div>
                <div className="h-6 w-16 bg-secondary-200 rounded-full"></div>
                <div className="h-6 w-20 bg-secondary-200 rounded-full"></div>
                <div className="h-8 w-16 bg-secondary-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="bg-white shadow-soft rounded-2xl overflow-hidden">
        <div className="px-6 py-16 text-center">
          <div className="mx-auto h-16 w-16 bg-secondary-100 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-secondary-400" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No contracts found</h3>
          <p className="text-secondary-600 mb-6">
            Get started by uploading your first contract document.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-soft rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-secondary-50/50 border-b border-secondary-200/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                Contract Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                Upload Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {contracts.map((contract) => {
              const statusConfig = getStatusConfig(contract.status);
              const riskConfig = getRiskConfig(contract.risk_level);
              const StatusIcon = statusConfig.icon;
              
              return (
                <tr key={contract.id} className="hover:bg-secondary-50/50 transition-colors duration-200 group">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
                          <FileText className="h-6 w-6 text-primary-700" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-secondary-900 group-hover:text-primary-700 transition-colors duration-200">
                          {contract.filename}
                        </div>
                        <div className="text-xs text-secondary-500 mt-1 flex items-center">
                          <span className="px-2 py-1 bg-secondary-100 rounded-md font-medium">
                            {contract.file_type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`status-badge border ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1.5" />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`risk-badge border ${riskConfig.color}`}>
                      <div className="flex items-center">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={`${contract.id}-risk-dot-${i}`}
                            className={`h-1.5 w-1.5 rounded-full mr-1 ${
                              i < riskConfig.dots ? 'bg-current' : 'bg-current opacity-30'
                            }`}
                          />
                        ))}
                        <span className="ml-1 capitalize">{contract.risk_level}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center text-sm text-secondary-600">
                      <Calendar className="h-4 w-4 mr-2 text-secondary-400" />
                      {new Date(contract.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Link
                      to={`/contracts/${contract.id}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200 hover:shadow-sm"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
