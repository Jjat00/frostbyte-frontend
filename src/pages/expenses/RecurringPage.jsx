import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Plus,
  Loader2,
  Edit,
  Trash2,
  X,
  Save,
  Play,
  Calendar,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { expensesService } from "@/services/expenses.service";
import { useBusinessStore } from "@/stores/useBusinessStore";
import toast from "react-hot-toast";
import { ICON_MAP, COLOR_MAP } from "./categoryStyles";



const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
];

const RecurringPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    category_id: "",
    recurrence_type: "monthly",
    day_of_month: 1,
    is_active: true,
  });

  const { selectedBusinessSlug } = useBusinessStore();
  const biz = selectedBusinessSlug || undefined;

  const { data: templates, isLoading } = useQuery({
    queryKey: ["recurring-templates", selectedBusinessSlug],
    queryFn: () => expensesService.getRecurringTemplates({ business: biz }),
  });

  const { data: categories } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expensesService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => expensesService.createRecurringTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      toast.success("Plantilla creada");
      closeModal();
    },
    onError: () => toast.error("Error al crear plantilla"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => expensesService.updateRecurringTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      toast.success("Plantilla actualizada");
      closeModal();
    },
    onError: () => toast.error("Error al actualizar plantilla"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => expensesService.deleteRecurringTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      toast.success("Plantilla eliminada");
    },
    onError: () => toast.error("Error al eliminar plantilla"),
  });

  const generateMutation = useMutation({
    mutationFn: (id) => expensesService.generateFromTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("Gasto generado exitosamente");
    },
    onError: () => toast.error("Error al generar gasto"),
  });

  const generateAllMutation = useMutation({
    mutationFn: () => expensesService.generateAllDue(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success(`${data.generated_count} gastos generados`);
    },
    onError: () => toast.error("Error al generar gastos"),
  });

  const openModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || "",
        amount: template.amount,
        category_id: template.category?.id || template.category,
        recurrence_type: template.recurrence_type,
        day_of_month: template.day_of_month || 1,
        is_active: template.is_active,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        description: "",
        amount: "",
        category_id: "",
        recurrence_type: "monthly",
        day_of_month: 1,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Ingresa un nombre");
      return;
    }
    if (!formData.category_id) {
      toast.error("Selecciona una categoria");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Ingresa un monto valido");
      return;
    }

    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      category: formData.category_id,
    };

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const templatesList = templates?.results || templates || [];
  const categoriesList = categories?.results || categories || [];

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isDue = (template) => {
    if (!template.next_due_date) return false;
    return new Date(template.next_due_date) <= new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-light">Gastos Recurrentes</h1>
          <p className="text-gray text-sm mt-1">
            Plantillas para gastos que se repiten periodicamente
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => generateAllMutation.mutate()}
            disabled={generateAllMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {generateAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Generar vencidos
          </button>

          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Nueva Plantilla
          </button>
        </div>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : templatesList.length === 0 ? (
        <div className="fb-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-gray mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-light mb-2">
            Sin plantillas recurrentes
          </h3>
          <p className="text-gray mb-4">
            Crea plantillas para gastos que se repiten mensualmente
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva Plantilla
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {templatesList.map((template) => {
            const IconComponent = ICON_MAP[template.category_icon] || Wallet;
            const colorClass = COLOR_MAP[template.category_color] || COLOR_MAP.gray;
            const due = isDue(template);

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`fb-card p-5 border transition-colors ${
                  due ? "border-yellow-500/50" : "border-white/[0.1]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className={`p-3 rounded-xl border ${colorClass}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-light">{template.name}</h3>
                      {!template.is_active && (
                        <span className="px-2 py-0.5 text-xs bg-white/[0.08] text-gray rounded-full">
                          Inactivo
                        </span>
                      )}
                      {due && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Vencido
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray">{template.category_name}</p>
                    <p className="text-sm text-gray mt-1">{template.description}</p>
                  </div>

                  <div className="w-full sm:w-auto sm:text-right">
                    <p className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.12em] text-light">
                      {formatCurrency(template.amount)}
                    </p>
                    <p className="text-sm text-gray">
                      {template.recurrence_type_display}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => generateMutation.mutate(template.id)}
                      disabled={generateMutation.isPending}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                      title="Generar gasto ahora"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openModal(template)}
                      className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar esta plantilla?")) {
                          deleteMutation.mutate(template.id);
                        }
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {template.next_due_date && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-sm text-gray">
                    <Calendar className="w-4 h-4" />
                    Proxima fecha: {template.next_due_date}
                    {template.last_generated_at && (
                      <span className="ml-4">
                        Ultimo generado: {template.last_generated_at}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md fb-card z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/[0.08] sticky top-0 bg-white/[0.06]">
                <h2 className="text-lg font-semibold text-light">
                  {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray hover:text-light rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="fb-eyebrow mb-2 block">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none"
                    placeholder="Ej: Nomina mensual"
                  />
                </div>

                <div>
                  <label className="fb-eyebrow mb-2 block">Categoria *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_id: parseInt(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none"
                  >
                    <option value="">Seleccionar categoria</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="fb-eyebrow mb-2 block">Descripcion</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none"
                    placeholder="Descripcion del gasto"
                  />
                </div>

                <div>
                  <label className="fb-eyebrow mb-2 block">Monto (COP) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="fb-eyebrow mb-2 block">Recurrencia</label>
                    <select
                      value={formData.recurrence_type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          recurrence_type: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none"
                    >
                      {RECURRENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.recurrence_type === "monthly" && (
                    <div>
                      <label className="fb-eyebrow mb-2 block">
                        Dia del mes
                      </label>
                      <input
                        type="number"
                        value={formData.day_of_month}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            day_of_month: parseInt(e.target.value),
                          }))
                        }
                        className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none"
                        min="1"
                        max="31"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-light">
                    Plantilla activa
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 text-gray hover:text-light transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-dark rounded-lg font-medium disabled:opacity-50"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecurringPage;
