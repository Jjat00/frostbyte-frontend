import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Wallet,
  Calendar,
  CreditCard,
  FileText,
  Clock,
} from "lucide-react";
import { expensesService } from "@/services/expenses.service";
import toast from "react-hot-toast";
import { ICON_MAP, COLOR_MAP, KINDS, kindMeta } from "./categoryStyles";



const STATUS_STYLES = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pendiente" },
  paid: { bg: "bg-green-500/20", text: "text-green-400", label: "Pagado" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelado" },
};

const ExpenseDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: expense, isLoading } = useQuery({
    queryKey: ["expense", id],
    queryFn: () => expensesService.getExpense(id),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ paymentMethod }) =>
      expensesService.markExpenseAsPaid(id, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("Gasto marcado como pagado");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => expensesService.cancelExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("Gasto cancelado");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => expensesService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("Gasto eliminado");
      navigate("/gastos/lista");
    },
  });

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-12">
        <p className="text-gray">Gasto no encontrado</p>
        <Link to="/gastos/lista" className="text-primary hover:underline mt-2 inline-block">
          Volver a la lista
        </Link>
      </div>
    );
  }

  const IconComponent = ICON_MAP[expense.category?.icon] || Wallet;
  const colorClass = COLOR_MAP[expense.category?.color] || COLOR_MAP.gray;
  const statusStyle = STATUS_STYLES[expense.status] || STATUS_STYLES.pending;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-light">Detalle del Gasto</h1>
            <p className="text-gray text-sm mt-1 font-mono">
              {expense.expense_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/gastos/editar/${id}`}
            className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
          </Link>
          <button
            onClick={() => {
              if (confirm("¿Eliminar este gasto?")) {
                deleteMutation.mutate();
              }
            }}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className={`p-4 rounded-xl border ${colorClass}`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-light">
                  {expense.description}
                </h2>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
                {expense.kind === KINDS.investment.value && (
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${kindMeta(expense.kind).badge}`}
                  >
                    {KINDS.investment.label}
                  </span>
                )}
              </div>
              <p className="text-gray">{expense.category?.name}</p>
              {expense.kind === KINDS.investment.value && (
                <p className="text-xs text-gray/70 mt-1">
                  No resta del margen del mes: {kindMeta(expense.kind).description.toLowerCase()}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-3xl font-bold text-light">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray" />
              <div>
                <p className="text-xs text-gray">Fecha del gasto</p>
                <p className="text-light font-medium">{expense.expense_date}</p>
              </div>
            </div>

            {expense.payment_method_display && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray" />
                <div>
                  <p className="text-xs text-gray">Metodo de pago</p>
                  <p className="text-light font-medium">
                    {expense.payment_method_display}
                  </p>
                </div>
              </div>
            )}

            {expense.reference_number && (
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray" />
                <div>
                  <p className="text-xs text-gray">Referencia</p>
                  <p className="text-light font-medium">
                    {expense.reference_number}
                  </p>
                </div>
              </div>
            )}

            {expense.paid_at && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray" />
                <div>
                  <p className="text-xs text-gray">Fecha de pago</p>
                  <p className="text-light font-medium">
                    {new Date(expense.paid_at).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {expense.notes && (
            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-gray mb-1">Notas</p>
              <p className="text-light">{expense.notes}</p>
            </div>
          )}

          {expense.is_recurring && (
            <div className="pt-4 border-t border-white/[0.06]">
              <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                Gasto recurrente - {expense.recurrence_period_display}
              </span>
            </div>
          )}

          {expense.created_by_name && (
            <div className="pt-4 border-t border-gray/10 text-sm text-gray">
              Creado por {expense.created_by_name} el{" "}
              {new Date(expense.created_at).toLocaleString("es-CO")}
            </div>
          )}
        </div>

        {/* Actions */}
        {expense.status === "pending" && (
          <div className="p-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => markPaidMutation.mutate({ paymentMethod: "cash" })}
              disabled={markPaidMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50"
            >
              {markPaidMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              Marcar como pagado
            </button>
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              Cancelar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ExpenseDetailPage;
