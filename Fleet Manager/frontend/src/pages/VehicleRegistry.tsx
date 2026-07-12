import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useFilters } from '../context/FilterContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge, VehicleStatusBadge } from '../components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/Table';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Wrench,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  Download,
  Ban,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Zod Schema Validation
const vehicleFormSchema = z.object({
  registrationNumber: z.string().min(4, 'Registration number must be at least 4 characters').toUpperCase(),
  name: z.string().min(2, 'Vehicle name is required'),
  model: z.string().min(2, 'Model is required'),
  type: z.string().min(1, 'Type is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  maxCapacity: z.coerce.number().positive('Capacity must be positive'),
  currentOdometer: z.coerce.number().nonnegative('Odometer cannot be negative'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchaseCost: z.coerce.number().positive('Purchase cost must be positive'),
  insuranceExpiry: z.string().min(1, 'Insurance expiry is required'),
  region: z.string().min(1, 'Region is required'),
  imageUrl: z.string().optional()
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export const VehicleRegistry: React.FC = () => {
  const navigate = useNavigate();
  const { region, refreshTrigger, triggerRefresh } = useFilters();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 10, total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMaintOpen, setIsMaintOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  // React Hook Form for Add/Edit
  const {
    register: formRegister,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      registrationNumber: '',
      name: '',
      model: '',
      type: 'Heavy Truck',
      fuelType: 'Diesel',
      maxCapacity: 15000,
      currentOdometer: 1000,
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: 2500000,
      insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      region: 'North',
      imageUrl: ''
    }
  });

  // Maintenance Form State
  const [maintType, setMaintType] = useState('Brake Inspection');
  const [maintPriority, setMaintPriority] = useState('Medium');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintMechanic, setMaintMechanic] = useState('');
  const [maintCost, setMaintCost] = useState(15000);
  const [maintCompletion, setMaintCompletion] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const fetchVehicles = async () => {
    try {
      const response = await API.get('/vehicles', {
        params: {
          page,
          limit: 10,
          region,
          status: statusFilter || undefined,
          search: searchVal || undefined,
          sortBy,
          sortOrder
        }
      });
      setVehicles(response.data.vehicles);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching registry data:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [page, region, statusFilter, searchVal, sortBy, sortOrder, refreshTrigger]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Checkbox actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(vehicles.map((v) => v._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // CSV Export Trigger
  const handleExportCSV = async () => {
    try {
      const response = await API.get(`/reports/export/vehicles?region=${region}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TransitOps_Vehicles_${region.replace(' ', '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  // Add / Edit Operations
  const onSaveVehicle = async (data: VehicleFormData) => {
    try {
      if (isEditOpen && editingVehicle) {
        await API.put(`/vehicles/${editingVehicle._id}`, data);
        setIsEditOpen(false);
      } else {
        await API.post('/vehicles', data);
        setIsAddOpen(false);
      }
      reset();
      triggerRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing vehicle request');
    }
  };

  const handleOpenEdit = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setValue('registrationNumber', vehicle.registrationNumber);
    setValue('name', vehicle.name);
    setValue('model', vehicle.model);
    setValue('type', vehicle.type);
    setValue('fuelType', vehicle.fuelType);
    setValue('maxCapacity', vehicle.maxCapacity);
    setValue('currentOdometer', vehicle.currentOdometer);
    setValue('purchaseDate', new Date(vehicle.purchaseDate).toISOString().split('T')[0]);
    setValue('purchaseCost', vehicle.purchaseCost);
    setValue('insuranceExpiry', new Date(vehicle.insuranceExpiry).toISOString().split('T')[0]);
    setValue('region', vehicle.region);
    setValue('imageUrl', vehicle.imageUrl || '');
    setIsEditOpen(true);
  };

  // Retire / Delete Vehicle
  const handleRetire = async (id: string) => {
    if (confirm('Are you sure you want to retire this vehicle?')) {
      try {
        await API.post(`/vehicles/${id}/retire`);
        triggerRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle and all history? This cannot be undone.')) {
      try {
        await API.delete(`/vehicles/${id}`);
        setSelectedIds(prev => prev.filter(i => i !== id));
        triggerRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Bulk Operations
  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected vehicles?`)) {
      try {
        await API.post('/vehicles/bulk/op', {
          action: 'delete',
          vehicleIds: selectedIds
        });
        setSelectedIds([]);
        triggerRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleScheduleBulkMaintenance = async () => {
    try {
      await API.post('/vehicles/bulk/op', {
        action: 'maintenance',
        vehicleIds: selectedIds,
        data: {
          type: maintType,
          priority: maintPriority,
          description: maintDesc,
          mechanic: maintMechanic,
          estimatedCost: maintCost,
          expectedCompletion: maintCompletion
        }
      });
      setIsMaintOpen(false);
      setSelectedIds([]);
      setMaintDesc('');
      setMaintMechanic('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getHealthColorClass = (score: number) => {
    if (score >= 80) return 'bg-brand-green';
    if (score >= 60) return 'bg-brand-amber';
    return 'bg-brand-red';
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Vehicle Registry</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage and audit fleet registrations, diagnostics, and ROI.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-white/5 hover:border-white/10"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              reset();
              setIsAddOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add Vehicle</span>
          </Button>
        </div>
      </div>

      {/* Filter and search panel */}
      <Card hoverable={false} className="p-4 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search by name, model or registration number..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#0B0F19]/40 border border-white/5 rounded-xl text-xs placeholder-gray-500 text-white focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Status filter */}
        <div className="w-full md:w-48 relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 bg-[#0D1321]/45 border border-white/5 rounded-xl text-xs text-gray-300 focus:outline-none appearance-none font-medium cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="In Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
          <ChevronDown size={14} className="text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </Card>

      {/* Bulk actions banner */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
          <span className="text-xs font-semibold text-brand-blue">
            {selectedIds.length} vehicle(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMaintOpen(true)}
              className="bg-transparent border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5"
            >
              <Wrench size={13} />
              <span>Bulk Maintenance</span>
            </Button>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              <Trash2 size={13} />
              <span>Bulk Delete</span>
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-hidden">
        {vehicles.length === 0 ? (
          <Card hoverable={false} className="p-8 text-center text-gray-500">
            No vehicles found matching filters.
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === vehicles.length}
                    onChange={handleSelectAll}
                    className="rounded border-white/10 bg-white/5 text-brand-blue focus:ring-brand-blue cursor-pointer"
                  />
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('registrationNumber')}>
                  <div className="flex items-center gap-1">
                    <span>Reg Number</span>
                    <ArrowUpDown size={12} className="text-gray-500" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ArrowUpDown size={12} className="text-gray-500" />
                  </div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('currentOdometer')}>
                  <div className="flex items-center gap-1">
                    <span>Odometer</span>
                    <ArrowUpDown size={12} className="text-gray-500" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('purchaseCost')}>
                  <div className="flex items-center gap-1">
                    <span>Value</span>
                    <ArrowUpDown size={12} className="text-gray-500" />
                  </div>
                </TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('healthScore')}>
                  <div className="flex items-center gap-1">
                    <span>Health</span>
                    <ArrowUpDown size={12} className="text-gray-500" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v._id} selected={selectedIds.includes(v._id)}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(v._id)}
                      onChange={(e) => handleSelectRow(v._id, e.target.checked)}
                      className="rounded border-white/10 bg-white/5 text-brand-blue focus:ring-brand-blue cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="font-bold text-white font-mono">{v.registrationNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-white leading-normal">{v.name}</p>
                      <span className="text-[10px] text-gray-500 font-semibold">{v.model}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-gray-400">{v.type}</TableCell>
                  <TableCell className="text-xs font-mono">{(v.currentOdometer || 0).toLocaleString()} km</TableCell>
                  <TableCell className="text-xs font-mono">₹{(v.purchaseCost || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="purple">{v.region}</Badge>
                  </TableCell>
                  <TableCell>
                    <VehicleStatusBadge status={v.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${getHealthColorClass(v.healthScore)}`}
                          style={{ width: `${v.healthScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white">{v.healthScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/vehicles/${v._id}`)}
                        className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-white/5 rounded-lg transition-colors duration-150"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        disabled={v.status === 'Retired'}
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:pointer-events-none"
                        title="Edit Details"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        disabled={v.status === 'Retired'}
                        onClick={() => {
                          setEditingVehicle(v);
                          setIsMaintOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-brand-amber hover:bg-white/5 rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:pointer-events-none"
                        title="Schedule Maintenance"
                      >
                        <Wrench size={15} />
                      </button>
                      <button
                        disabled={v.status === 'Retired'}
                        onClick={() => handleRetire(v._id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors duration-150 disabled:opacity-30 disabled:pointer-events-none"
                        title="Retire Vehicle"
                      >
                        <Ban size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(v._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors duration-150"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-xs text-gray-500 font-semibold">
            Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total vehicles)
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="p-2 min-w-0"
            >
              <ChevronLeft size={16} />
            </Button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className="w-8 h-8 p-0"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.pages}
              onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
              className="p-2 min-w-0"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setEditingVehicle(null);
          reset();
        }}
        title={isEditOpen ? 'Edit Vehicle Profile' : 'Register New Fleet Vehicle'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSaveVehicle)} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Registration Number (Unique)</label>
              <input
                type="text"
                disabled={isEditOpen}
                placeholder="e.g. DL3C-AB-1234"
                className="w-full glass-input"
                {...formRegister('registrationNumber')}
              />
              {errors.registrationNumber && (
                <p className="text-[10px] text-brand-red font-medium">{errors.registrationNumber.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Vehicle Name</label>
              <input
                type="text"
                placeholder="e.g. Truck-15"
                className="w-full glass-input"
                {...formRegister('name')}
              />
              {errors.name && (
                <p className="text-[10px] text-brand-red font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Model Name</label>
              <input
                type="text"
                placeholder="e.g. Ashok Leyland 4220"
                className="w-full glass-input"
                {...formRegister('model')}
              />
              {errors.model && (
                <p className="text-[10px] text-brand-red font-medium">{errors.model.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1 font-medium">
              <label className="text-gray-400 font-semibold">Vehicle Type</label>
              <select className="w-full glass-input bg-[#0D1321]" {...formRegister('type')}>
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Medium Truck">Medium Truck</option>
                <option value="Light Van">Light Van</option>
                <option value="Electric Bus">Electric Bus</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1 font-medium">
              <label className="text-gray-400 font-semibold">Fuel Type</label>
              <select className="w-full glass-input bg-[#0D1321]" {...formRegister('fuelType')}>
                <option value="Diesel">Diesel</option>
                <option value="Petrol">Petrol</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Max Capacity (kg / passengers)</label>
              <input
                type="number"
                placeholder="25000"
                className="w-full glass-input"
                {...formRegister('maxCapacity')}
              />
              {errors.maxCapacity && (
                <p className="text-[10px] text-brand-red font-medium">{errors.maxCapacity.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Current Odometer (km)</label>
              <input
                type="number"
                placeholder="2500"
                className="w-full glass-input"
                {...formRegister('currentOdometer')}
              />
              {errors.currentOdometer && (
                <p className="text-[10px] text-brand-red font-medium">{errors.currentOdometer.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Purchase Date</label>
              <input
                type="date"
                className="w-full glass-input"
                {...formRegister('purchaseDate')}
              />
              {errors.purchaseDate && (
                <p className="text-[10px] text-brand-red font-medium">{errors.purchaseDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Purchase Cost (₹)</label>
              <input
                type="number"
                placeholder="3500000"
                className="w-full glass-input"
                {...formRegister('purchaseCost')}
              />
              {errors.purchaseCost && (
                <p className="text-[10px] text-brand-red font-medium">{errors.purchaseCost.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Insurance Expiry Date</label>
              <input
                type="date"
                className="w-full glass-input"
                {...formRegister('insuranceExpiry')}
              />
              {errors.insuranceExpiry && (
                <p className="text-[10px] text-brand-red font-medium">{errors.insuranceExpiry.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1 font-medium">
              <label className="text-gray-400 font-semibold">Operational Region</label>
              <select className="w-full glass-input bg-[#0D1321]" {...formRegister('region')}>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-gray-400">Image URL (Optional)</label>
              <input
                type="text"
                placeholder="https://unsplash.com/..."
                className="w-full glass-input"
                {...formRegister('imageUrl')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
                setEditingVehicle(null);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditOpen ? 'Save Changes' : 'Register Vehicle'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Maintenance Modal (Single or Bulk) */}
      <Modal
        isOpen={isMaintOpen}
        onClose={() => {
          setIsMaintOpen(false);
          setSelectedIds([]);
        }}
        title="Schedule Maintenance Event"
        size="md"
      >
        <div className="space-y-4 text-xs font-semibold">
          {selectedIds.length > 0 ? (
            <p className="text-gray-400">
              Scheduling maintenance event for <span className="text-brand-blue font-bold">{selectedIds.length} selected vehicles</span>.
            </p>
          ) : (
            <p className="text-gray-400">
              Scheduling maintenance event for <span className="text-white font-bold">{editingVehicle?.name} ({editingVehicle?.registrationNumber})</span>.
            </p>
          )}

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 font-medium col-span-2 sm:col-span-1">
                <label className="text-gray-400 font-semibold">Service Type</label>
                <select
                  value={maintType}
                  onChange={(e) => setMaintType(e.target.value)}
                  className="w-full glass-input bg-[#0D1321]"
                >
                  <option value="Brake Inspection">Brake Inspection</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Replacement">Tire Replacement</option>
                  <option value="General Service">General Service</option>
                  <option value="Engine Check">Engine Check</option>
                </select>
              </div>

              <div className="space-y-1.5 font-medium col-span-2 sm:col-span-1">
                <label className="text-gray-400 font-semibold">Priority Level</label>
                <select
                  value={maintPriority}
                  onChange={(e) => setMaintPriority(e.target.value)}
                  className="w-full glass-input bg-[#0D1321]"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-400">Task Description</label>
              <textarea
                placeholder="Describe issues, parts to inspect..."
                rows={3}
                value={maintDesc}
                onChange={(e) => setMaintDesc(e.target.value)}
                className="w-full glass-input resize-none py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 font-medium">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-gray-400 font-semibold">Assign Mechanic</label>
                <input
                  type="text"
                  placeholder="e.g. Satish Pal"
                  value={maintMechanic}
                  onChange={(e) => setMaintMechanic(e.target.value)}
                  className="w-full glass-input"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-gray-400 font-semibold">Estimated Cost (₹)</label>
                <input
                  type="number"
                  value={maintCost}
                  onChange={(e) => setMaintCost(Number(e.target.value))}
                  className="w-full glass-input"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-gray-400 font-semibold">Expected Completion Date</label>
                <input
                  type="date"
                  value={maintCompletion}
                  onChange={(e) => setMaintCompletion(e.target.value)}
                  className="w-full glass-input"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsMaintOpen(false);
                setSelectedIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={async () => {
                if (selectedIds.length > 0) {
                  await handleScheduleBulkMaintenance();
                } else if (editingVehicle) {
                  try {
                    await API.post('/maintenance', {
                      vehicle: editingVehicle._id,
                      type: maintType,
                      priority: maintPriority,
                      description: maintDesc,
                      mechanic: maintMechanic,
                      estimatedCost: maintCost,
                      expectedCompletion: maintCompletion,
                      status: 'Scheduled'
                    });
                    setIsMaintOpen(false);
                    setMaintDesc('');
                    setMaintMechanic('');
                    triggerRefresh();
                  } catch (err: any) {
                    alert(err.response?.data?.message || 'Error scheduling maintenance');
                  }
                }
              }}
            >
              Confirm Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
