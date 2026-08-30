import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import useWorkflowStore from '../store/workflowStore';
import api from '../services/api';
import { Plug, Check, X, ExternalLink, Loader2, Mail, MessageSquare, FileSpreadsheet, Bot } from 'lucide-react';

const providerIcons = {
  gmail: Mail,
  slack: MessageSquare,
  discord: Bot,
  'google-sheets': FileSpreadsheet,
};

const providerColors = {
  gmail: 'from-red-500 to-red-600',
  slack: 'from-purple-500 to-purple-600',
  discord: 'from-indigo-500 to-indigo-600',
  'google-sheets': 'from-green-500 to-green-600',
};

export default function IntegrationsPage() {
  const { integrations, fetchIntegrations } = useWorkflowStore();
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleConnect = async (provider) => {
    setConnecting(provider);
    try {
      const { data } = await api.get(`/integrations/oauth/${provider}/start`);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initiate OAuth');
      setConnecting(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Integrations</h1>
            <p className="text-gray-400 text-sm mt-1">Connect third-party services for your workflows</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((integ) => {
              const Icon = providerIcons[integ.provider] || Plug;
              const gradient = providerColors[integ.provider] || 'from-gray-500 to-gray-600';

              return (
                <div key={integ.provider} className="card flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{integ.name}</h3>
                      {integ.isConnected ? (
                        <span className="flex items-center gap-1 text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-gray-500/15 text-gray-400 px-2 py-0.5 rounded-full">
                          <X className="w-3 h-3" /> Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Scopes: {integ.scopes?.join(', ') || 'N/A'}
                    </p>
                    {integ.expiresAt && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Expires: {new Date(integ.expiresAt).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-3">
                      {integ.isConnected ? (
                        <button
                          onClick={() => handleConnect(integ.provider)}
                          className="btn-secondary text-xs flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Reconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(integ.provider)}
                          disabled={connecting === integ.provider}
                          className="btn-primary text-xs flex items-center gap-1"
                        >
                          {connecting === integ.provider ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" /> Connecting...
                            </>
                          ) : (
                            <>
                              <Plug className="w-3 h-3" /> Connect
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {integrations.length === 0 && (
            <div className="card text-center py-12">
              <Plug className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No integrations available. Configure OAuth credentials in your server.</p>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
