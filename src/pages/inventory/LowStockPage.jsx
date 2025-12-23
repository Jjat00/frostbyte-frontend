import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ShoppingCart,
  Package,
  Loader2,
  DollarSign,
  Check,
} from 'lucide-react';
import { inventoryService } from '@/services/inventory.service';

const LowStockPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState([]);

  // Obtener items con stock bajo
  const { data, isLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => inventoryService.getLowStock(),
  });

  // Mutación para generar orden automática
  const generateOrderMutation = useMutation({
    mutationFn: () => inventoryService.generateFromLowStock(),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchase-orders']);
      navigate(`/inventario/ordenes`);
    },
  });

  const materials = data?.results || [];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status) => {
    if (status === 'sin_stock') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
          Sin stock
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        Stock bajo
      </span>
    );
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === materials.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(materials.map((m) => m.id));
    }
  };

  // Componente Card para móvil
  const LowStockCard = ({ material }) => {
    const faltante = Math.max(0, material.minimum_stock * 2 - material.current_stock);
    const costoEstimado = faltante * material.cost_per_unit;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-dark-secondary border rounded-xl p-4 ${
          material.stock_status === 'sin_stock' ? 'border-red-500/30' : 'border-yellow-500/30'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                material.stock_status === 'sin_stock' ? 'bg-red-500/10' : 'bg-yellow-500/10'
              }`}
            >
              <Package
                className={`w-5 h-5 ${
                  material.stock_status === 'sin_stock' ? 'text-red-500' : 'text-yellow-500'
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-light truncate">{material.name}</p>
              <p className="text-xs text-gray">{material.unit_abbreviation}</p>
            </div>
          </div>
          {getStatusBadge(material.stock_status)}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-dark/50 rounded-lg p-2.5">
            <p className="text-xs text-gray">Stock Actual</p>
            <p className={`font-bold ${material.current_stock <= 0 ? 'text-red-400' : 'text-light'}`}>
              {material.current_stock}
            </p>
          </div>
          <div className="bg-dark/50 rounded-lg p-2.5">
            <p className="text-xs text-gray">Stock Mín</p>
            <p className="font-bold text-gray">{material.minimum_stock}</p>
          </div>
          <div className="bg-dark/50 rounded-lg p-2.5">
            <p className="text-xs text-gray">Faltante</p>
            <p className="font-bold text-yellow-400">{faltante.toFixed(0)}</p>
          </div>
          <div className="bg-dark/50 rounded-lg p-2.5">
            <p className="text-xs text-gray">Costo Est.</p>
            <p className="font-bold text-green-400 text-xs">{formatCurrency(costoEstimado)}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-light flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              Stock Bajo
            </h1>
            <p className="text-sm text-gray">
              {data?.count || 0} materiales por reabastecer
            </p>
          </div>
          <button
            onClick={() => generateOrderMutation.mutate()}
            disabled={generateOrderMutation.isPending || materials.length === 0}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
          >
            {generateOrderMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Generar Orden</span>
            <span className="sm:hidden">Orden</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-3 md:p-6">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <Package className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
            <p className="text-xs md:text-sm text-gray">Afectados</p>
          </div>
          <p className="text-xl md:text-3xl font-bold text-light">{data?.count || 0}</p>
        </div>

        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-3 md:p-6">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
            <p className="text-xs md:text-sm text-gray">Sin stock</p>
          </div>
          <p className="text-xl md:text-3xl font-bold text-light">
            {materials.filter((m) => m.stock_status === 'sin_stock').length}
          </p>
        </div>

        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-3 md:p-6">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            <p className="text-xs md:text-sm text-gray">Costo Est.</p>
          </div>
          <p className="text-lg md:text-2xl font-bold text-light truncate">
            {formatCurrency(data?.estimated_restock_cost || 0)}
          </p>
        </div>
      </div>

      {/* Content */}
      {materials.length === 0 ? (
        <div className="bg-dark-secondary border border-gray/20 rounded-xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-light mb-2">¡Todo en orden!</h3>
          <p className="text-gray">No hay materiales con stock bajo</p>
        </div>
      ) : (
        <>
          {/* Vista móvil - Cards */}
          <div className="md:hidden space-y-3">
            {materials.map((material) => (
              <LowStockCard key={material.id} material={material} />
            ))}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block bg-dark-secondary border border-gray/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray/20">
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray">
                      <button
                        onClick={toggleSelectAll}
                        className="w-5 h-5 rounded border border-gray/30 flex items-center justify-center hover:border-primary transition-colors"
                      >
                        {selectedItems.length === materials.length && (
                          <Check className="w-3 h-3 text-primary" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-gray">Material</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Stock Actual</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Stock Mínimo</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Faltante</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Precio/Unidad</th>
                    <th className="text-right py-4 px-4 text-sm font-medium text-gray">Costo Estimado</th>
                    <th className="text-center py-4 px-4 text-sm font-medium text-gray">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => {
                    const faltante = Math.max(0, material.minimum_stock * 2 - material.current_stock);
                    const costoEstimado = faltante * material.cost_per_unit;

                    return (
                      <motion.tr
                        key={material.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray/10 hover:bg-gray/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <button
                            onClick={() => toggleSelect(material.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              selectedItems.includes(material.id)
                                ? 'bg-primary border-primary'
                                : 'border-gray/30 hover:border-primary'
                            }`}
                          >
                            {selectedItems.includes(material.id) && (
                              <Check className="w-3 h-3 text-dark" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                material.stock_status === 'sin_stock'
                                  ? 'bg-red-500/10'
                                  : 'bg-yellow-500/10'
                              }`}
                            >
                              <Package
                                className={`w-5 h-5 ${
                                  material.stock_status === 'sin_stock'
                                    ? 'text-red-500'
                                    : 'text-yellow-500'
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-light">{material.name}</p>
                              <p className="text-xs text-gray">{material.unit_abbreviation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span
                            className={
                              material.current_stock <= 0 ? 'text-red-400 font-bold' : 'text-light'
                            }
                          >
                            {material.current_stock}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-gray">{material.minimum_stock}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-yellow-400 font-medium">{faltante.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-4 text-right text-light">
                          {formatCurrency(material.cost_per_unit)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="text-green-400 font-medium">
                            {formatCurrency(costoEstimado)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(material.stock_status)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LowStockPage;
