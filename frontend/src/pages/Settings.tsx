import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings as SettingsIcon, MapPin, Truck, Wrench, Flame, Plus, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const [regions, setRegions] = useState(['North', 'South', 'East', 'West']);
  const [vehicleTypes, setVehicleTypes] = useState(['Heavy Truck', 'Medium Truck', 'Light Van', 'Electric Bus']);
  const [fuelTypes, setFuelTypes] = useState(['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid']);
  const [maintTypes, setMaintTypes] = useState(['Brake Inspection', 'Oil Change', 'Tire Replacement', 'General Service', 'Engine Check']);

  const [newVal, setNewVal] = useState('');
  const [activeSec, setActiveSec] = useState<'regions' | 'types' | 'fuels' | 'maints'>('regions');

  const handleAdd = () => {
    if (!newVal.trim()) return;
    if (activeSec === 'regions') setRegions([...regions, newVal.trim()]);
    if (activeSec === 'types') setVehicleTypes([...vehicleTypes, newVal.trim()]);
    if (activeSec === 'fuels') setFuelTypes([...fuelTypes, newVal.trim()]);
    if (activeSec === 'maints') setMaintTypes([...maintTypes, newVal.trim()]);
    setNewVal('');
  };

  const getActiveList = () => {
    if (activeSec === 'regions') return regions;
    if (activeSec === 'types') return vehicleTypes;
    if (activeSec === 'fuels') return fuelTypes;
    return maintTypes;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">Configure operational metadata values, regional assignments and fuel registries.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Navigation Links */}
        <Card hoverable={false} className="h-fit space-y-1 p-3">
          {[
            { id: 'regions', name: 'Operational Regions', icon: MapPin },
            { id: 'types', name: 'Vehicle Class Types', icon: Truck },
            { id: 'fuels', name: 'Fuel Type Registry', icon: Flame },
            { id: 'maints', name: 'Maintenance Class Categories', icon: Wrench }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSec(sec.id as any);
                setNewVal('');
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                activeSec === sec.id
                  ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/20 shadow-md shadow-blue-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <sec.icon size={15} />
              <span>{sec.name}</span>
            </button>
          ))}
        </Card>

        {/* Right Side: Section Editor */}
        <div className="lg:col-span-2">
          <Card hoverable={false} className="space-y-6">
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                <SettingsIcon size={18} className="text-brand-blue" />
                <span>Manage {activeSec}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Add item form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add new ${activeSec.replace('s', '')}...`}
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  className="flex-1 glass-input text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                  }}
                />
                <Button variant="primary" onClick={handleAdd} size="sm">
                  <Plus size={14} />
                  <span>Add</span>
                </Button>
              </div>

              {/* Items listing */}
              <div className="space-y-2 pt-2 text-xs font-semibold">
                {getActiveList().map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center rounded-xl border border-white/5 bg-slate-950/40 px-4 py-3"
                  >
                    <span className="text-white">{item}</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20">
                      <Check size={12} />
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
