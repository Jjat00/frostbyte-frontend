import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';
import { businessService } from '@/services/business.service';
import { useBusinessStore } from '@/stores/useBusinessStore';

const MaterialsPage = () => {
  const queryClient = useQueryClient();
  const { selectedBusinessSlug } = useBusinessStore();
  const biz = selectedBusinessSlug || undefined;
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [editData, setEditData] = useState({});
  const [createData, setCreateData] = useState({
    name: '',
    unit_id: '',
    current_stock: 0,
    minimum_stock: 0,
    cost_per_unit: 0,
    supplier: '',
    business: '',
  });

  // Negocios (para asignar el material a un negocio)
  const { data: businessesData } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const businesses = Array.isArray(businessesData) ? businessesData : businessesData?.results || [];
  const defaultBusinessId = useMemo(() => {
    const match = businesses.find((b) => b.slug === selectedBusinessSlug);
    return (match || businesses[0])?.id || '';
  }, [businesses, selectedBusinessSlug]);

  // Obtener materiales (del negocio seleccionado)
  const { data, isLoading } = useQuery({
    queryKey: ['materials', searchTerm, selectedBusinessSlug],
    queryFn: () => inventoryService.getMaterials({ search: searchTerm, business: biz }),
  });

  // Obtener unidades de medida
  const { data: unitsData } = useQuery({
    queryKey: ['units'],
    queryFn: () => inventoryService.getUnits(),
  });

  const units = unitsData?.results || unitsData || [];

  // Mutación para actualizar material
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryService.updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
      queryClient.invalidateQueries(['inventory-stats']);
      setShowEditModal(null);
      setEditData({});
    },
  });

  // Mutación para crear material
  const createMutation = useMutation({
    mutationFn: (data) => inventoryService.createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
      queryClient.invalidateQueries(['inventory-stats']);
      setShowCreateModal(false);
      resetCreateData();
    },
  });

  // Mutación para eliminar material
  const deleteMutation = useMutation({
    mutationFn: (id) => inventoryService.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
      queryClient.invalidateQueries(['inventory-stats']);
      setShowDeleteModal(null);
    },
  });

  const materials = data?.results || data || [];

  const resetCreateData = () => {
    setCreateData({
      name: '',
      unit_id: '',
      current_stock: 0,
      minimum_stock: 0,
      cost_per_unit: 0,
      supplier: '',
      business: defaultBusinessId,
    });
  };

  const openCreateModal = () => {
    setCreateData((d) => ({ ...d, business: defaultBusinessId }));
    setShowCreateModal(true);
  };

  const handleEdit = (material) => {
    setShowEditModal(material);
    setEditData({
      name: material.name,
      current_stock: material.current_stock,
      cost_per_unit: material.cost_per_unit,
      minimum_stock: material.minimum_stock,
      supplier: material.supplier || '',
      unit_id: material.unit_id,
    });
  };

  const handleSave = () => {
    if (!showEditModal) return;
    updateMutation.mutate({ id: showEditModal.id, data: editData });
  };

  const handleCreate = () => {
    if (!createData.name || !createData.unit_id) return;
    createMutation.mutate({ ...createData, business: createData.business || defaultBusinessId });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const styles = {
      sin_stock: 'bg-red-500/20 text-red-400 border-red-500/30',
      bajo: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      normal: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    const labels = {
      sin_stock: 'Sin stock',
      bajo: 'Stock bajo',
      normal: 'Normal',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Componente Card para móvil
  const MaterialCard = ({ material }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-light truncate">{material.name}</p>
            <p className="text-xs text-gray">{material.unit_abbreviation}</p>
          </div>
        </div>
        {getStatusBadge(material.stock_status)}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark/50 rounded-lg p-3">
          <p className="text-xs text-gray mb-1">Stock Actual</p>
          <p className="font-bold text-light">{material.current_stock}</p>
        </div>
        <div className="bg-dark/50 rounded-lg p-3">
          <p className="text-xs text-gray mb-1">Stock Mín</p>
          <p className="font-bold text-gray">{material.minimum_stock}</p>
        </div>
        <div className="bg-dark/50 rounded-lg p-3">
          <p className="text-xs text-gray mb-1">Precio/Unidad</p>
          <p className="font-bold text-light text-sm">{formatCurrency(material.cost_per_unit)}</p>
        </div>
        <div className="bg-dark/50 rounded-lg p-3">
          <p className="text-xs text-gray mb-1">Proveedor</p>
          <p className="font-bold text-gray text-sm truncate">{material.supplier || '-'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleEdit(material)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => setShowDeleteModal(material)}
          className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-light">Materiales</h1>
            <p className="text-sm text-gray">{materials.length} materiales</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all text-sm md:text-base"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          <input
            type="text"
            placeholder="Buscar materiales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-lg pl-10 pr-4 py-2.5 text-light placeholder-gray/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : materials.length === 0 ? (
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-xl p-8 text-center">
          <Package className="w-12 h-12 text-gray/50 mx-auto mb-4" />
          <p className="text-gray">No se encontraron materiales</p>
        </div>
      ) : (
        <>
          {/* Vista móvil - Cards */}
          <div className="md:hidden space-y-3">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.1]">
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray">Material</th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-gray">Unidad</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Stock</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Mín</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Precio</th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray">Proveedor</th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-gray">Estado</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-b border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-primary" />
                          </div>
                          <p className="font-medium text-light">{material.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-1 bg-white/[0.09] rounded text-xs text-gray">
                          {material.unit_abbreviation}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-light">{material.current_stock}</td>
                      <td className="py-3 px-4 text-right text-gray">{material.minimum_stock}</td>
                      <td className="py-3 px-4 text-right text-light">{formatCurrency(material.cost_per_unit)}</td>
                      <td className="py-3 px-4 text-gray">{material.supplier || '-'}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(material.stock_status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(material)}
                            className="p-2 text-gray hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(material)}
                            className="p-2 text-gray hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Editar Material */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
            onClick={() => setShowEditModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="backdrop-blur-xl bg-white/[0.06] border-t md:border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-lg md:mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-light flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-primary" />
                  Editar Material
                </h3>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray mb-1.5 block">Nombre del Material</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                    placeholder="Nombre del material"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Unidad de Medida</label>
                  <select
                    value={editData.unit_id}
                    onChange={(e) => setEditData({ ...editData, unit_id: e.target.value })}
                    className="w-full backdrop-blur-sm bg-dark-secondary border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  >
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id} className="bg-dark-secondary text-light">
                        {unit.name} ({unit.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray mb-1.5 block">Stock Actual</label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={editData.current_stock}
                      onChange={(e) => setEditData({ ...editData, current_stock: e.target.value })}
                      className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray mb-1.5 block">Stock Mínimo</label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={editData.minimum_stock}
                      onChange={(e) => setEditData({ ...editData, minimum_stock: e.target.value })}
                      className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Precio por Unidad (COP)</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={editData.cost_per_unit}
                    onChange={(e) => setEditData({ ...editData, cost_per_unit: e.target.value })}
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Proveedor</label>
                  <input
                    type="text"
                    value={editData.supplier}
                    onChange={(e) => setEditData({ ...editData, supplier: e.target.value })}
                    placeholder="Nombre del proveedor"
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(null)}
                  className="flex-1 px-4 py-3 border border-gray/30 text-gray rounded-lg hover:text-light hover:border-gray/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Crear Material */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="backdrop-blur-xl bg-white/[0.06] border-t md:border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-lg md:mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-light flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Agregar Material
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {businesses.length > 1 && (
                  <div>
                    <label className="text-sm text-gray mb-1.5 block">Negocio *</label>
                    <select
                      value={createData.business}
                      onChange={(e) => setCreateData({ ...createData, business: Number(e.target.value) })}
                      className="w-full backdrop-blur-sm bg-dark-secondary border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                    >
                      {businesses.map((b) => (
                        <option key={b.id} value={b.id} className="bg-dark-secondary text-light">
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Nombre *</label>
                  <input
                    type="text"
                    value={createData.name}
                    onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                    placeholder="Ej: Pulpa de Mango"
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Unidad de Medida *</label>
                  <select
                    value={createData.unit_id}
                    onChange={(e) => setCreateData({ ...createData, unit_id: e.target.value })}
                    className="w-full backdrop-blur-sm bg-dark-secondary border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  >
                    <option value="" className="bg-dark-secondary text-light">Seleccionar...</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id} className="bg-dark-secondary text-light">
                        {unit.name} ({unit.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray mb-1.5 block">Stock Actual</label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={createData.current_stock}
                      onChange={(e) => setCreateData({ ...createData, current_stock: e.target.value })}
                      placeholder="0"
                      className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray mb-1.5 block">Stock Mínimo</label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={createData.minimum_stock}
                      onChange={(e) => setCreateData({ ...createData, minimum_stock: e.target.value })}
                      placeholder="0"
                      className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Precio por Unidad (COP)</label>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={createData.cost_per_unit}
                    onChange={(e) => setCreateData({ ...createData, cost_per_unit: e.target.value })}
                    placeholder="0"
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray mb-1.5 block">Proveedor</label>
                  <input
                    type="text"
                    value={createData.supplier}
                    onChange={(e) => setCreateData({ ...createData, supplier: e.target.value })}
                    placeholder="Ej: Fruver Local"
                    className="w-full backdrop-blur-sm bg-white/[0.09] border border-white/[0.12] rounded-lg px-4 py-3 text-light focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray/30 text-gray rounded-lg hover:text-light hover:border-gray/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !createData.name || !createData.unit_id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Eliminar */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50"
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="backdrop-blur-xl bg-white/[0.06] border-t md:border border-white/[0.15] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] rounded-t-2xl md:rounded-xl p-5 md:p-6 w-full md:max-w-md md:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-light">Eliminar Material</h3>
                  <p className="text-sm text-gray">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <p className="text-light mb-6">
                ¿Estás seguro de que deseas eliminar{' '}
                <span className="font-bold text-primary">{showDeleteModal.name}</span>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-3 border border-gray/30 text-gray rounded-lg hover:text-light hover:border-gray/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 font-medium rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialsPage;
