import { useFilters } from '../context/FilterContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const Alerts: React.FC = () => {
  const { alerts, resolveAlert, triggerScan } = useFilters();

  const getSeverityBadge = (severity: 'info' | 'warning' | 'critical') => {
    if (severity === 'critical') return <Badge variant="red">Critical</Badge>;
    if (severity === 'warning') return <Badge variant="yellow">Warning</Badge>;
    return <Badge variant="blue">Info</Badge>;
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Smart Fleet Alerts</h1>
          <p className="text-xs text-gray-400 mt-0.5">Diagnose and resolve real-time threshold warnings and lifecycle events.</p>
        </div>

        <Button variant="primary" onClick={triggerScan}>
          Run Diagnostics Scan
        </Button>
      </div>

      {/* Counters row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hoverable={false} className="border-red-500/10">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Critical Thresholds</span>
          <span className="text-3xl font-black text-brand-red mt-1.5 block">{criticalCount}</span>
        </Card>
        <Card hoverable={false} className="border-amber-500/10">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Warnings Pending</span>
          <span className="text-3xl font-black text-brand-amber mt-1.5 block">{warningCount}</span>
        </Card>
        <Card hoverable={false} className="border-blue-500/10">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Overall Fleet Health</span>
          <span className="text-3xl font-black text-brand-green mt-1.5 block">
            {alerts.length > 5 ? 'At Risk' : 'Optimal'}
          </span>
        </Card>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <Card hoverable={false} className="p-8 text-center text-gray-500 font-semibold bg-slate-950/20">
            All system diagnostics optimal. No active alerts.
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert._id}
              className={`p-5 border-l-4 ${
                alert.severity === 'critical' ? 'border-l-brand-red' : 'border-l-brand-amber'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
                <div className="flex gap-4">
                  <div
                    className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                      alert.severity === 'critical' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-amber/10 text-brand-amber'
                    }`}
                  >
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white leading-none">
                        {alert.vehicle?.name || 'System Alert'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        ({alert.vehicle?.registrationNumber || 'System'})
                      </span>
                      {getSeverityBadge(alert.severity)}
                      <Badge variant="purple">{alert.type}</Badge>
                    </div>
                    <p className="text-gray-400 mt-2 font-medium leading-relaxed max-w-2xl">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-right flex items-center gap-1.5 text-gray-500">
                    <Clock size={12} />
                    <span>{new Date(alert.createdAt).toLocaleString()}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolveAlert(alert._id)}
                    className="border-emerald-500/20 hover:border-emerald-500/40 text-brand-green hover:bg-brand-green/5"
                  >
                    <CheckCircle size={13} />
                    <span>Resolve Alert</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
