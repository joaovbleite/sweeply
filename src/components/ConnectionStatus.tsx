import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConnectionMonitor, RequestQueue } from '@/lib/api/base';
import { toast } from 'sonner';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { t } = useTranslation(['common']);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const monitor = ConnectionMonitor.getInstance();
    const queue = RequestQueue.getInstance();

    const handleConnectionChange = (online: boolean) => {
      setIsOnline(online);
      
      if (!online) {
        setLastOfflineTime(new Date());
        toast.error(t('common:connectionLost'), {
          duration: 5000,
          action: {
            label: t('common:retry'),
            onClick: () => window.location.reload(),
          },
        });
      } else if (lastOfflineTime) {
        const offlineDuration = Math.round((Date.now() - lastOfflineTime.getTime()) / 1000);
        toast.success(t('common:connectionRestored'), {
          description: `${t('common:offlineFor')} ${offlineDuration}s`,
        });
        setReconnectAttempts(0);
      }
      
      setQueueSize(queue.getQueueSize());
    };

    // Update queue size periodically
    const updateQueueSize = () => {
      setQueueSize(queue.getQueueSize());
    };

    const queueInterval = setInterval(updateQueueSize, 1000);

    monitor.addListener(handleConnectionChange);

    return () => {
      monitor.removeListener(handleConnectionChange);
      clearInterval(queueInterval);
    };
  }, [t, lastOfflineTime]);

  const handleRetry = () => {
    setReconnectAttempts(prev => prev + 1);
    window.location.reload();
  };

  if (!showDetails && isOnline) {
    return null; // Don't show anything when online and not showing details
  }

  const getStatusColor = () => {
    if (isOnline) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (isOnline) {
      return <Wifi className="w-4 h-4" />;
    }
    return <WifiOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isOnline) {
      return queueSize > 0 
        ? t('common:syncingChanges', { count: queueSize })
        : t('common:online');
    }
    return t('common:offline');
  };

  if (showDetails) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            {t('common:connectionStatus')}
          </h3>
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>

        {!isOnline && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-800 font-medium">
                  {t('common:noInternetConnection')}
                </p>
                <p className="text-red-600 mt-1">
                  {t('common:changesWillBeSynced')}
                </p>
              </div>
            </div>

            {queueSize > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <RefreshCw className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-800">
                  {t('common:pendingChanges', { count: queueSize })}
                </span>
              </div>
            )}

            <button
              onClick={handleRetry}
              className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common:tryReconnect')}
              {reconnectAttempts > 0 && ` (${reconnectAttempts})`}
            </button>
          </div>
        )}

        {isOnline && queueSize > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-sm text-blue-800">
              {t('common:syncingChanges', { count: queueSize })}
            </span>
          </div>
        )}

        {isOnline && queueSize === 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-800">
              {t('common:allChangesSynced')}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Compact status indicator
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        {!isOnline && (
          <span className="text-xs font-medium">{getStatusText()}</span>
        )}
      </div>
      
      {queueSize > 0 && (
        <div className="flex items-center gap-1 text-yellow-500">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span className="text-xs">{queueSize}</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus; 