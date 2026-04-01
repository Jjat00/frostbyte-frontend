import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Save,
  Wallet,
  Users,
  Zap,
  Home,
  Wrench,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { expensesService } from "@/services/expenses.service";
import toast from "react-hot-toast";

const ICON_MAP = {
  Users: Users,
  Zap: Zap,
  Home: Home,
  Wrench: Wrench,
  Megaphone: TrendingUp,
  Shield: CheckCircle,
  FileText: Wallet,
  Package: Wallet,
  MoreHorizontal: Wallet,
};

const COLOR_MAP = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

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

  const [formData, setFormData] = useState({
    category_id: "",
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
          <h1 className="text-2xl font-bold text-light">
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
        className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-6 space-y-6"
      >
        {/* Category selection */}
        <div>
          <label className="block text-sm font-medium text-light mb-3">
            Categoria *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriesList.map((cat) => {
              const IconComponent = ICON_MAP[cat.icon] || Wallet;
              const colorClass = COLOR_MAP[cat.color] || COLOR_MAP.gray;
              const isSelected = formData.category_id === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, category_id: cat.id }))
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
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/[0.05] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:outline-none focus:border-primary/50"
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
              className="w-full px-4 py-3 backdrop-blur-sm bg-white/[0.05] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:outline-none focus:border-primary/50"
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
              className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-primary/50"
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
              className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-primary/50"
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
              className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-primary/50"
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
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/[0.05] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:outline-none focus:border-primary/50"
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
            className="w-full px-4 py-3 backdrop-blur-sm bg-white/[0.05] border border-white/[0.12] rounded-lg text-light placeholder:text-gray focus:outline-none focus:border-primary/50 resize-none"
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
            className="w-5 h-5 rounded border-white/[0.12] bg-white/[0.05] text-primary focus:ring-primary/50"
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
              className="w-full px-4 py-3 bg-dark border border-gray/20 rounded-lg text-light focus:outline-none focus:border-primary/50"
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
