import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, VehicleStatusBadge } from '../components/ui/Badge';
import {
  ArrowLeft,
  Truck,
  Shield,
  Wallet,
  Settings,
  Flame,
  FileText,
  TrendingUp,
  MapPin,
  Calendar,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setIsLoading(true);
        const response = await API.get(`/vehicles/${id}`);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicleDetails();
  }, [id]);

  if (isLoading || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-blue border-t-transparent"></div>
      </div>
    );
  }

  const { vehicle, maintenanceLogs, tripHistory, fuelHistory, expenseSummary } = data;

  const isInsuranceExpired = new Date(vehicle.insuranceExpiry).getTime() < Date.now();
  const isInsuranceSoon =
    !isInsuranceExpired &&
    new Date(vehicle.insuranceExpiry).getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000;

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-brand-green';
    if (score >= 60) return 'text-brand-amber';
    return 'text-brand-red';
  };

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/vehicles')}
          className="border-white/5 hover:border-white/10"
        >
          <ArrowLeft size={16} />
          <span>Back to Registry</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">{vehicle.name}</h1>
          <p className="text-[10px] text-gray-500 font-mono -mt-0.5">{vehicle.registrationNumber}</p>
        </div>
      </div>

      {/* Hero card & specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Vehicle Profile Card */}
        <Card hoverable={false} className="lg:col-span-2 flex flex-col md:flex-row gap-6 items-center md:items-stretch">
          <div className="w-full md:w-1/3 rounded-2xl overflow-hidden border border-white/5 bg-slate-950/40 relative min-h-[180px]">
            {vehicle.imageUrl ? (
              <img
                src={vehicle.imageUrl}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-white/[0.01]">
                <Truck size={48} className="stroke-[1.5] mb-2" />
                <span className="text-xs">No vehicle image</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <VehicleStatusBadge status={vehicle.status} />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-gray-500 font-semibold uppercase tracking-wider block">Model</span>
                <span className="text-sm font-bold text-white mt-1 block">{vehicle.model}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold uppercase tracking-wider block">Health Score</span>
                <span className={`text-sm font-bold mt-1 block ${getHealthColor(vehicle.healthScore)}`}>
                  {vehicle.healthScore}%
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold uppercase tracking-wider block">Vehicle Type</span>
                <span className="text-sm font-bold text-white mt-1 block">{vehicle.type}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold uppercase tracking-wider block">Fuel Type</span>
                <span className="text-sm font-bold text-white mt-1 block">{vehicle.fuelType}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold uppercase tracking-wider block">Max Capacity</span>
                <span className="text-sm font-bold text-white mt-1 block">{vehicle.maxCapacity.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold uppercase tracking-wider block">Odometer</span>
                <span className="text-sm font-bold text-white mt-1 block">{vehicle.currentOdometer.toLocaleString()} km</span>
              </div>
            </div>

            {/* Insurance details */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gray-400" />
                <div>
                  <span className="text-gray-500 font-semibold block">Insurance Expiry</span>
                  <span className="font-bold text-white">
                    {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {isInsuranceExpired ? (
                <Badge variant="red">Expired</Badge>
              ) : isInsuranceSoon ? (
                <Badge variant="yellow">Expires Soon</Badge>
              ) : (
                <Badge variant="green">Active</Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Right Side: ROI & Expense summary */}
        <Card hoverable={false} className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full">
              <TrendingUp size={11} />
              <span>ROI Metric</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ROI circular indicators */}
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estimated ROI</span>
                <h2 className="text-3xl font-extrabold text-white mt-1 leading-none">{expenseSummary.roi}%</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estimated Earnings</span>
                <p className="text-sm font-bold text-emerald-400 mt-1">₹{expenseSummary.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Expense rows */}
            <div className="space-y-2 text-xs border-t border-white/5 pt-4">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400 flex items-center gap-1.5"><Wallet size={13} className="text-gray-500" /> Purchase Price</span>
                <span className="text-white">₹{expenseSummary.purchaseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400 flex items-center gap-1.5"><Settings size={13} className="text-gray-500" /> Maintenance Costs</span>
                <span className="text-white">₹{expenseSummary.maintenanceCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400 flex items-center gap-1.5"><Flame size={13} className="text-gray-500" /> Estimated Fuel Costs</span>
                <span className="text-white">₹{expenseSummary.fuelCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-white/5 pt-2 text-white">
                <span>Total Expenditure</span>
                <span>₹{expenseSummary.totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details logs sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side (span 2): Trip History & Fuel History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip History */}
          <Card hoverable={false}>
            <CardHeader>
              <CardTitle>Recent Trip History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tripHistory.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No active trip logs available.</p>
              ) : (
                tripHistory.map((trip: any) => (
                  <div
                    key={trip.id}
                    className="rounded-xl bg-white/[0.01] border border-white/5 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-xl text-brand-blue border border-white/5">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{trip.source}</span>
                          <span className="text-gray-500">➔</span>
                          <span className="font-bold text-white">{trip.destination}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-semibold block mt-1">
                          ID: {trip.id} | Driver: {trip.driver}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 font-semibold block uppercase">Distance</span>
                        <span className="font-bold text-white">{trip.distance} km</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 font-semibold block uppercase">Trip Date</span>
                        <span className="font-bold text-white">{new Date(trip.date).toLocaleDateString()}</span>
                      </div>
                      <Badge variant={trip.status === 'Active' ? 'blue' : 'green'}>{trip.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Fuel Refill Logs */}
          <Card hoverable={false}>
            <CardHeader>
              <CardTitle>Refuel Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fuelHistory.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No fuel fill logs registered.</p>
              ) : (
                fuelHistory.map((fill: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-white/[0.01] border border-white/5 p-4 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-xl text-emerald-400 border border-white/5">
                        <Flame size={15} />
                      </div>
                      <div>
                        <span className="text-white block">{fill.fuelStation}</span>
                        <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
                          Odometer: {fill.odometer.toLocaleString()} km
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block uppercase font-semibold">Quantity</span>
                        <span className="text-white">{fill.quantity} Liters</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block uppercase font-semibold">Cost</span>
                        <span className="text-white">₹{fill.cost.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block uppercase font-semibold">Refuel Date</span>
                        <span className="text-white">{new Date(fill.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Maintenance Timeline & Documents */}
        <div className="space-y-6">
          {/* Maintenance Timeline */}
          <Card hoverable={false}>
            <CardHeader>
              <CardTitle>Maintenance Log History</CardTitle>
            </CardHeader>
            <CardContent className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
              {maintenanceLogs.length === 0 ? (
                <p className="text-xs text-gray-500 py-2 -ml-6 pl-6">No maintenance logs registered.</p>
              ) : (
                maintenanceLogs.map((log: any) => (
                  <div key={log._id} className="relative text-xs">
                    {/* Timeline Node Icon */}
                    <span
                      className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border bg-[#0B0F19] ${
                        log.status === 'Completed'
                          ? 'border-emerald-500/30 text-emerald-400'
                          : log.status === 'In Progress'
                          ? 'border-amber-500/30 text-amber-400'
                          : 'border-white/10 text-gray-400'
                      }`}
                    >
                      {log.status === 'Completed' ? (
                        <CheckCircle2 size={12} />
                      ) : log.status === 'In Progress' ? (
                        <Wrench size={12} />
                      ) : (
                        <Calendar size={12} />
                      )}
                    </span>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{log.type}</span>
                        <Badge
                          variant={
                            log.priority === 'Critical'
                              ? 'red'
                              : log.priority === 'High'
                              ? 'yellow'
                              : 'gray'
                          }
                        >
                          {log.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-400 mt-1">{log.description}</p>
                      <div className="flex justify-between items-center mt-3 text-[10px] text-gray-500 font-semibold">
                        <span>Cost: ₹{(log.actualCost || log.estimatedCost || 0).toLocaleString()}</span>
                        <span>Date: {new Date(log.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Vehicle Documents */}
          <Card hoverable={false}>
            <CardHeader>
              <CardTitle>Digital Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'Registration Certificate (RC)', type: 'PDF Document', size: '2.4 MB' },
                { name: 'Vehicle Insurance Policy', type: 'PDF Document', size: '1.8 MB' },
                { name: 'Pollution Under Control Certificate (PUC)', type: 'JPEG File', size: '940 KB' },
                { name: 'National Road Permit', type: 'PDF Document', size: '3.1 MB' }
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-white/[0.01] border border-white/5 p-3 flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={15} className="text-gray-400" />
                    <div>
                      <span className="font-bold text-white/95 block">{doc.name}</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
                        {doc.type} • {doc.size}
                      </span>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold text-brand-blue hover:underline uppercase tracking-wider">
                    Download
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
