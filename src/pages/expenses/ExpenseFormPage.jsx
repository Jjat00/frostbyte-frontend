import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { businessService } from "@/services/business.service";
import { useBusinessStore } from "@/stores/useBusinessStore";
import {
  ArrowLeft,
  Loader2,
  Save,
  Wallet,
} from "lucide-react";
import { expensesService } from "@/services/expenses.service";
import toast from "react-hot-toast";
import { ICON_MAP, COLOR_MAP, KINDS, kindMeta } from "./categoryStyles";



const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "card", label: "Tarjeta" },
  { value: "nequi", label: "Nequi" },
  { value: "daviplata", label: "Daviplata" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Otro" },
];

const ExpenseFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const { selectedBusinessSlug } = useBusinessStore();

  // Negocio al que se asigna el gasto (el seleccionado en el sidebar)
  const { data: businessesData } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const businesses = Array.isArray(businessesData) ? businessesData : businessesData?.results || [];
  const activeBusinessId = useMemo(() => {
    const match = businesses.find((b) => b.slug === selectedBusinessSlug);
    return (match || businesses[0])?.id;
  }, [businesses, selectedBusinessSlug]);

  // Al crear, el negocio del form sigue al selector global del sidebar
  useEffect(() => {
    if (!isEditing && activeBusinessId) {
      setFormData((f) => ({ ...f, business: activeBusinessId }));
    }
  }, [activeBusinessId, isEditing]);

  const [formData, setFormData] = useState({
    category_id: "",
    kind: KINDS.operational.value,
    business: "",
    description: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    status: "pending",
    payment_method: "",
    reference_number: "",
    notes: "",
    is_recurring: false,
    recurrence_period: "none",
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expensesService.getCategories(),
  });

  const { data: expense, isLoading: loadingExpense } = useQuery({
    queryKey: ["expense", id],
    queryFn: () => expensesService.getExpense(id),
    enabled: isEditing,
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        category_id: expense.category?.id || "",
        kind: expense.kind || expense.category?.kind || KINDS.operational.value,
        description: expense.description || "",
        amount: expense.amount || "",
        expense_date: expense.expense_date || new Date().toISOString().split("T")[0],
        status: expense.status || "pending",
        payment_method: expense.payment_method || "",
        reference_number: expense.reference_number || "",
        notes: expense.notes || "",
        is_recurring: expense.is_recurring || false,
        recurrence_period: expense.recurrence_period || "none",
      });
    }
  }, [expense]);

  const createMutation = useMutation({
    mutationFn: (data) => expensesService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pending-expenses"] });
      toast.success("Gasto creado exitosamente");
      navigate("/gastos/lista");
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Error al crear el gasto");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => expensesService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("Gasto actualizado exitosamente");
      navigate("/gastos/lista");
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || "Error al actualizar el gasto");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.category_id) {
      toast.error("Selecciona una categoria");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Ingresa una descripcion");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Ingresa un monto valido");
      return;
    }

    if (!isEditing && !formData.business) {
      toast.error("Selecciona el negocio");
      return;
    }

    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const categoriesList = categories?.results || categories || [];

  // Las categorias se muestran en dos grupos: lo que se consume en el mes y
  // lo que compra algo que dura. Elegir la categoria ya fija el tipo, y el
  // interruptor de abajo permite corregirlo cuando el caso no encaja.
  const categoryGroups = [
    { kind: KINDS.operational, items: categoriesList.filter((c) => c.kind !== KINDS.investment.value) },
    { kind: KINDS.investment, items: categoriesList.filter((c) => c.kind === KINDS.investment.value) },
  ].filter((g) => g.items.length > 0);

  const selectedKind = kindMeta(formData.kind);

  if (loadingCategories || (isEditing && loadingExpense)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-light">
            {isEditing ? "Editar Gasto" : "Nuevo Gasto"}
          </h1>
          <p className="text-gray text-sm mt-1">
            {isEditing
              ? "Modifica los datos del gasto"
              : "Registra un nuevo gasto operativo"}
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="fb-card p-6 space-y-6"
      >
        {/* Negocio: solo en Consolidado. Dentro de un negocio se asigna solo. */}
        {!isEditing && !selectedBusinessSlug && businesses.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray mb-2">Negocio *</label>
            <select
              name="business"
              value={formData.business}
              onChange={(e) => setFormData((f) => ({ ...f, business: Number(e.target.value) }))}
              className="w-full rounded-xl border border-white/[0.1] bg-dark-secondary px-3 py-2 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none [&>option]:bg-dark-secondary [&>option]:text-light"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category selection */}
        <div>
          <label className="block text-sm font-medium text-light mb-3">
            Categoria *
          </label>
          <div className="space-y-4">
            {categoryGroups.map((group) => (
              <div key={group.kind.value}>
                <p className="text-xs font-semibold text-gray uppercase tracking-wide mb-2">
                  {group.kind.label}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((cat) => {
                    const IconComponent = ICON_MAP[cat.icon] || Wallet;
                    const colorClass = COLOR_MAP[cat.color] || COLOR_MAP.gray;
                    const isSelected = formData.category_id === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            category_id: cat.id,
                            // Elegir categoria refija el tipo; el interruptor
                            // de abajo lo puede corregir despues.
                            kind: cat.kind || KINDS.operational.value,
                          }))
                        }
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          isSelected
                            ? `${colorClass} border-2`
                            : "border-white/[0.1] hover:border-white/[0.2]"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-sm font-medium text-light">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipo: gasto corriente o inversion */}
        <div className="rounded-lg border border-white/[0.1] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-light">Es una inversion</p>
              <p className="text-xs text-gray mt-1">
                {selectedKind.description}
              </p>
              <p className="text-xs text-gray/70 mt-1">
                La inversion no resta del margen del mes, pero si de la caja.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={formData.kind === KINDS.investment.value}
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  kind:
                    prev.kind === KINDS.investment.value
                      ? KINDS.operational.value
                      : KINDS.investment.value,
                }))
              }
              className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                formData.kind === KINDS.investment.value
                  ? "bg-indigo-500/60"
                  : "bg-white/[0.12]"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-light transition-transform ${
                  formData.kind === KINDS.investment.value
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-light mb-2">
            Descripcion *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ej: Pago nomina enero, Factura luz diciembre..."
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
          />
        </div>

        {/* Amount and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Monto (COP) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="100"
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Fecha del gasto *
            </label>
            <input
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Status and Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-white/30"
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Metodo de pago
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-white/30"
            >
              <option value="">Sin especificar</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reference number */}
        <div>
          <label className="block text-sm font-medium text-light mb-2">
            Numero de referencia
          </label>
          <input
            type="text"
            name="reference_number"
            value={formData.reference_number}
            onChange={handleChange}
            placeholder="Numero de factura, recibo, etc."
            className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[0.85rem] text-light transition-colors placeholder:text-light/25 focus:border-white/30 focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-light mb-2">
            Notas adicionales
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Notas o comentarios adicionales..."
            className="w-full px-4 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] text-light placeholder:text-light/25 focus:outline-none focus:border-white/30 resize-none"
          />
        </div>

        {/* Recurring checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_recurring"
            name="is_recurring"
            checked={formData.is_recurring}
            onChange={handleChange}
            className="w-5 h-5 rounded border-white/[0.12] bg-white/[0.09] text-primary focus:ring-primary/50"
          />
          <label htmlFor="is_recurring" className="text-sm text-light">
            Este es un gasto recurrente
          </label>
        </div>

        {formData.is_recurring && (
          <div>
            <label className="block text-sm font-medium text-light mb-2">
              Periodo de recurrencia
            </label>
            <select
              name="recurrence_period"
              value={formData.recurrence_period}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-white/30"
            >
              <option value="none">No recurrente</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quincenal</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        )}

        {/* Submit button */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 text-gray hover:text-light transition-colors w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            <Save className="w-4 h-4" />
            {isEditing ? "Guardar cambios" : "Crear gasto"}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default ExpenseFormPage;
