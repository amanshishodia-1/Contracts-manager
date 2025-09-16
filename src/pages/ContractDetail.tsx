import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertTriangle, CheckCircle, FileText, Shield, Clock, Eye, Download, Share2, TrendingUp, Users, Brain, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { documentsAPI } from '../services/api';
import type { ContractDetail as ContractDetailType, ContractClause, ContractInsight } from '../types';

export const ContractDetail: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const [contract, setContract] = useState<ContractDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (docId) {
      loadContract();
    }
  }, [docId]);

  const loadContract = async () => {
    if (!docId) return;
    
    setLoading(true);
    try {
      const data = await documentsAPI.getDetail(docId);
      setContract(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>;

  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-red-600">Error: {error}</div></div>;

  if (!contract) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Contract not found</div></div>;


  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Active':
        return { icon: Shield, color: 'text-success-600 bg-success-100', label: 'Active' };
      case 'Renewal Due':
        return { icon: Clock, color: 'text-warning-600 bg-warning-100', label: 'Renewal Due' };
      case 'Expired':
        return { icon: AlertTriangle, color: 'text-danger-600 bg-danger-100', label: 'Expired' };
      default:
        return { icon: FileText, color: 'text-secondary-600 bg-secondary-100', label: status };
    }
  };

  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case 'High':
        return { color: 'text-danger-700 bg-danger-100 border-danger-200', dots: 3 };
      case 'Medium':
        return { color: 'text-warning-700 bg-warning-100 border-warning-200', dots: 2 };
      case 'Low':
        return { color: 'text-success-700 bg-success-100 border-success-200', dots: 1 };
      default:
        return { color: 'text-secondary-700 bg-secondary-100 border-secondary-200', dots: 1 };
    }
  };

  const statusConfig = getStatusConfig(contract.document.status);
  const riskConfig = getRiskConfig(contract.document.risk_score);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-secondary-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{contract.document.contract_name}</h1>
              <p className="text-secondary-600 text-lg">{contract.document.filename}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Contract Overview */}
      <div className="bg-white shadow-soft rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
          <TrendingUp className="h-6 w-6 mr-3 text-primary-600" />
          Contract Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-xl">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Status</p>
              <p className="text-lg font-bold text-secondary-900">{statusConfig.label}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-xl">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${riskConfig.color}`}>
              <div className="flex space-x-0.5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`risk-dot-${i}`}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < riskConfig.dots ? 'bg-current' : 'bg-current opacity-30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Parties</p>
              <div className="text-lg font-bold text-secondary-900">{contract.document.parties}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-xl">
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Created At</p>
              <div className="text-2xl font-bold text-secondary-900">{contract?.document.created_at ? new Date(contract.document.created_at).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          {contract?.document.parties && (
            <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-xl">
              <div className="h-12 w-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary-600 uppercase tracking-wide">Parties</p>
                <p className="text-sm font-medium text-secondary-900 truncate">{contract.document.parties}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Clauses */}
        <div className="bg-white shadow-soft rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
            <FileText className="h-6 w-6 mr-3 text-primary-600" />
            Key Clauses
          </h2>
          {contract?.clauses && contract.clauses.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {contract.clauses.map((clause: ContractClause, index: number) => (
                <div key={`clause-${index}`} className="border border-secondary-200 rounded-xl p-5 hover:bg-secondary-50/50 transition-colors duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-secondary-900 text-lg">{clause.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-2 py-1 rounded-full">
                        {Math.round(clause.confidence * 100)}%
                      </span>
                      <span className="text-xs font-medium text-secondary-600 bg-secondary-100 px-2 py-1 rounded-full">
                        Page {clause.page_number}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-700 leading-relaxed">{clause.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-secondary-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-secondary-400" />
              </div>
              <p className="text-secondary-500 font-medium">No key clauses identified</p>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-white shadow-soft rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
            <Brain className="h-6 w-6 mr-3 text-primary-600" />
            AI Insights
          </h2>
          {contract?.insights && contract.insights.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {contract.insights.map((insight: ContractInsight, index: number) => (
                <div key={`insight-${index}`} className={`border-l-4 p-5 rounded-r-xl ${
                  insight.type === 'risk' 
                    ? 'border-danger-400 bg-danger-50' 
                    : 'border-success-400 bg-success-50'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {insight.type === 'risk' ? (
                        <div className="h-10 w-10 bg-danger-100 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-danger-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-success-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-success-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 mb-2">{insight.title}</h3>
                      <p className="text-sm text-secondary-700 mb-3">{insight.description}</p>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        insight.severity === 'high' ? 'bg-danger-100 text-danger-800' :
                        insight.severity === 'medium' ? 'bg-warning-100 text-warning-800' :
                        'bg-success-100 text-success-800'
                      }`}>
                        {insight.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-secondary-100 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-secondary-400" />
              </div>
              <p className="text-secondary-500 font-medium">No insights available</p>
            </div>
          )}
        </div>
      </div>

      {/* Document Statistics */}
      <div className="bg-white shadow-soft rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6 flex items-center">
          <Zap className="h-6 w-6 mr-3 text-primary-600" />
          Document Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-primary-50 rounded-2xl">
            <div className="text-4xl font-bold text-primary-600 mb-2">{contract?.chunks_count}</div>
            <div className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Text Chunks</div>
            <div className="text-sm text-secondary-600">{contract?.document.filename}</div>
          </div>
          <div className="text-center p-6 bg-success-50 rounded-2xl">
            <div className="text-3xl font-bold text-primary-600">{contract?.clauses?.length || 0}</div>
            <div className="text-sm font-semibold text-success-700 uppercase tracking-wide">AI Insights</div>
            <div className="text-sm text-secondary-600">Generated insights</div>
          </div>
          <div className="text-center p-6 bg-warning-50 rounded-2xl">
            <div className="text-3xl font-bold text-warning-600">{contract?.document.risk_level === 'high' ? 'High' : contract?.document.risk_level === 'medium' ? 'Medium' : 'Low'}</div>
            <div className="text-sm font-semibold text-primary-700 uppercase tracking-wide">Risk Level</div>
            <div className="text-xs text-secondary-600 mt-1">Risk assessment</div>
          </div>
        </div>
      </div>
    </div>
  );
};
