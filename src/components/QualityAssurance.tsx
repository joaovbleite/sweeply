import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Monitor, 
  Network, 
  Zap,
  Bug,
  Shield,
  Eye,
  EyeOff,
  Download,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PerformanceMonitor, ConnectionMonitor } from '@/lib/api/base';
import { jobsApi } from '@/lib/api/jobs';

interface QualityAssuranceProps {
  isVisible: boolean;
  onToggle: () => void;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: Date;
}

export const QualityAssurance: React.FC<QualityAssuranceProps> = ({ 
  isVisible, 
  onToggle 
}) => {
  const { t } = useTranslation(['common']);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [logs, setLogs] = useState<Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: any;
  }>>([]);

  // Health checks
  const runHealthChecks = async () => {
    const checks: HealthCheck[] = [];
    const now = new Date();

    // API Health Check
    try {
      await jobsApi.getStats();
      checks.push({
        name: 'API Connection',
        status: 'healthy',
        message: 'API is responding normally',
        lastChecked: now,
      });
    } catch (error) {
      checks.push({
        name: 'API Connection',
        status: 'error',
        message: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: now,
      });
    }

    // Network Health Check
    checks.push({
      name: 'Network Connection',
      status: isOnline ? 'healthy' : 'error',
      message: isOnline ? 'Network connection is stable' : 'No network connection',
      lastChecked: now,
    });

    // Performance Health Check
    const metrics = PerformanceMonitor.getMetrics();
    const avgApiTime = Object.values(metrics).reduce((sum: number, metric: any) => 
      sum + metric.average, 0) / Object.keys(metrics).length;
    
    if (avgApiTime > 5000) {
      checks.push({
        name: 'Performance',
        status: 'warning',
        message: `Average API response time is high: ${avgApiTime.toFixed(0)}ms`,
        lastChecked: now,
      });
    } else {
      checks.push({
        name: 'Performance',
        status: 'healthy',
        message: `Performance is good: ${avgApiTime.toFixed(0)}ms average`,
        lastChecked: now,
      });
    }

    // Memory Health Check
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1024 / 1024; // MB
      const totalMemory = memory.totalJSHeapSize / 1024 / 1024; // MB
      const memoryUsage = (usedMemory / totalMemory) * 100;

      checks.push({
        name: 'Memory Usage',
        status: memoryUsage > 80 ? 'warning' : 'healthy',
        message: `Memory usage: ${usedMemory.toFixed(1)}MB / ${totalMemory.toFixed(1)}MB (${memoryUsage.toFixed(1)}%)`,
        lastChecked: now,
      });
    }

    // Local Storage Health Check
    try {
      const testKey = 'qa_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      checks.push({
        name: 'Local Storage',
        status: 'healthy',
        message: 'Local storage is working correctly',
        lastChecked: now,
      });
    } catch (error) {
      checks.push({
        name: 'Local Storage',
        status: 'error',
        message: 'Local storage is not available',
        lastChecked: now,
      });
    }

    setHealthChecks(checks);
  };

  // Performance monitoring
  const updatePerformanceMetrics = () => {
    const metrics = PerformanceMonitor.getMetrics();
    setPerformanceMetrics(metrics);
  };

  // Connection monitoring
  useEffect(() => {
    const monitor = ConnectionMonitor.getInstance();
    
    const handleConnectionChange = (online: boolean) => {
      setIsOnline(online);
      addLog(online ? 'info' : 'warn', `Connection ${online ? 'restored' : 'lost'}`);
    };

    monitor.addListener(handleConnectionChange);

    return () => {
      monitor.removeListener(handleConnectionChange);
    };
  }, []);

  // Auto-refresh health checks
  useEffect(() => {
    if (isVisible) {
      runHealthChecks();
      updatePerformanceMetrics();
      
      const interval = setInterval(() => {
        runHealthChecks();
        updatePerformanceMetrics();
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Logging
  const addLog = (level: 'info' | 'warn' | 'error', message: string, details?: any) => {
    setLogs(prev => [
      { timestamp: new Date(), level, message, details },
      ...prev.slice(0, 99) // Keep only last 100 logs
    ]);
  };

  // Error simulation for testing
  const simulateError = () => {
    addLog('error', 'Simulated error for testing purposes', { 
      stack: 'Error: Test error\n    at simulateError',
      component: 'QualityAssurance'
    });
  };

  // Export logs
  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      healthChecks,
      performanceMetrics,
      logs: logs.slice(0, 50), // Last 50 logs
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sweeply-qa-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    PerformanceMonitor.reset();
    addLog('info', 'Logs and metrics cleared');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-blue-600';
      case 'warn':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Quality Assurance Dashboard"
      >
        <Monitor className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-pulse-500" />
            <h2 className="text-xl font-bold text-gray-900">Quality Assurance Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportLogs}
              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={clearLogs}
              className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Health Checks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pulse-500" />
                  System Health
                </h3>
                <button
                  onClick={runHealthChecks}
                  className="px-3 py-1 text-sm bg-pulse-500 text-white rounded hover:bg-pulse-600"
                >
                  Refresh
                </button>
              </div>
              
              <div className="space-y-3">
                {healthChecks.map((check, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(check.status)}
                        <span className="font-medium text-gray-900">{check.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {check.lastChecked.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{check.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-pulse-500" />
                Performance Metrics
              </h3>
              
              <div className="space-y-3">
                {Object.entries(performanceMetrics).map(([operation, metrics]: [string, any]) => (
                  <div key={operation} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{operation}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Average:</span>
                        <span className="ml-2 font-mono">{metrics.average.toFixed(0)}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Count:</span>
                        <span className="ml-2 font-mono">{metrics.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Min:</span>
                        <span className="ml-2 font-mono">{metrics.min.toFixed(0)}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Max:</span>
                        <span className="ml-2 font-mono">{metrics.max.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {Object.keys(performanceMetrics).length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No performance data available yet
                  </p>
                )}
              </div>
            </div>

            {/* Debug Tools */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bug className="w-5 h-5 text-pulse-500" />
                Debug Tools
              </h3>
              
              <div className="space-y-2">
                <button
                  onClick={simulateError}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                >
                  Simulate Error
                </button>
                <button
                  onClick={() => addLog('info', 'Manual log entry for testing')}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Add Test Log
                </button>
                <button
                  onClick={() => console.log('QA Dashboard State:', { healthChecks, performanceMetrics, logs })}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  Log State to Console
                </button>
              </div>
            </div>

            {/* Recent Logs */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-pulse-500" />
                Recent Logs ({logs.length})
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.slice(0, 20).map((log, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{log.message}</p>
                    {log.details && (
                      <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
                
                {logs.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No logs available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityAssurance; 