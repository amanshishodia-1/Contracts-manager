import React, { useState } from 'react';
import { Search, MessageSquare, FileText, Zap, Sparkles, Brain, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { queryAPI } from '../services/api';
import type { QueryResponse } from '../types';

export const QueryInterface: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await queryAPI.search(question);
      setResponse(result);
    } catch (err) {
      setError('Failed to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    {
      question: "What are the key terms in my contracts?",
      category: "Analysis",
      icon: FileText
    },
    {
      question: "Which contracts are expiring soon?",
      category: "Timeline",
      icon: MessageSquare
    },
    {
      question: "What are the payment terms across all contracts?",
      category: "Financial",
      icon: Zap
    },
    {
      question: "Are there any high-risk clauses I should review?",
      category: "Risk",
      icon: Brain
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-6">
          <div className="h-20 w-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="h-10 w-10 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-4">
            AI Contract Intelligence
          </h1>
          <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
            Ask natural language questions and get intelligent insights from your contract documents
          </p>
        </div>
      </div>

      <div className="bg-white shadow-soft rounded-2xl p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about your contracts..."
              icon={<Search className="h-5 w-5" />}
              className="text-lg py-4 pr-16"
            />
            <Button
              type="submit"
              loading={loading}
              disabled={!question.trim()}
              className="absolute right-3 top-3 h-12 w-12 p-0 rounded-xl"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </form>

        {!response && !loading && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-secondary-900">
                Try these questions to get started
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedQuestions.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={`suggested-${index}`}
                    onClick={() => setQuestion(item.question)}
                    className="group text-left p-6 rounded-xl border border-secondary-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors duration-200">
                        <IconComponent className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
                          {item.category}
                        </div>
                        <p className="text-sm font-medium text-secondary-900 group-hover:text-primary-700 transition-colors duration-200">
                          {item.question}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-center space-x-3">
            <div className="h-5 w-5 text-danger-600">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-danger-700 font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto h-16 w-16 bg-primary-100 rounded-2xl flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-secondary-900 mb-1">Analyzing your contracts</p>
              <p className="text-secondary-600">This may take a few moments...</p>
            </div>
          </div>
        )}
      </div>

      {response && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white shadow-soft rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-r from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary-900">AI Analysis</h3>
                <p className="text-sm text-secondary-600">Based on your contract documents</p>
              </div>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-secondary-700 leading-relaxed text-lg">{response.answer}</p>
            </div>
          </div>

          {response.results.length > 0 && (
            <div className="bg-white shadow-soft rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900">Source Evidence</h3>
                    <p className="text-sm text-secondary-600">{response.total_results} relevant excerpts found</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {response.results.map((result, index) => (
                  <div key={`result-${index}`} className="border border-secondary-200 rounded-xl p-6 hover:bg-secondary-50/50 transition-colors duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-secondary-900 text-lg">{result.contract_name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-primary-700 bg-primary-100 px-3 py-1 rounded-full">
                          {Math.round(result.relevance_score * 100)}% match
                        </span>
                      </div>
                    </div>
                    <div className="bg-secondary-50 rounded-lg p-4 mb-3">
                      <p className="text-secondary-700 leading-relaxed">
                        "{result.text_chunk}"
                      </p>
                    </div>
                    {result.page_number && (
                      <p className="text-xs text-secondary-500 flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        Page {result.page_number}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
