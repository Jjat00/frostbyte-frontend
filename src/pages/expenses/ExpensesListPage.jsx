import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { expensesService } from "@/services/expenses.service";
import { useBusinessStore } from "@/stores/useBusinessStore";
import toast from "react-hot-toast";
import { ICON_MAP, COLOR_MAP, KINDS, kindMeta } from "./categoryStyles";



const STATUS_STYLES = {
  pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pendiente" },
  paid: { bg: "bg-green-500/20", text: "text-green-400", label: "Pagado" },
  cancelled: { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelado" },
};

const ExpensesListPage = () => {
  const queryClient = useQueryClient();
  const { selectedBusinessSlug } = useBusinessStore();
  const biz = selectedBusinessSlug || undefined;
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const statusFilter = searchParams.get("status") || "";
  const categoryFilter = searchParams.get("category") || "";
  const kindFilter = searchParams.get("kind") || "";

  const now = new Date();
  const currentMonth = searchParams.get("month")
    ? parseInt(searchParams.get("month"))
    : now.getMonth();
  const currentYear = searchParams.get("year")
    ? parseInt(searchParams.get("year"))
    : now.getFullYear();

  const { startDate, endDate } = useMemo(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0);
    const fmt = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { startDate: fmt(start), endDate: fmt(end) };
  }, [currentMonth, currentYear]);

  const monthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    const label = d.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [currentMonth, currentYear]);

  const isCurrentMonth =
    currentMonth === now.getMonth() && currentYear === now.getFullYear();

  const navigateMonth = (direction) => {
    const newParams = new URLSearchParams(searchParams);
    let m = currentMonth + direction;
    let y = currentYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    newParams.set("month", m.toString());
    newParams.set("year", y.toString());
    setSearchParams(newParams);
  };

  const { data: categories } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expensesService.getCategories(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", { status: statusFilter, category: categoryFilter, kind: kindFilter, startDate, endDate, search, business: selectedBusinessSlug }],
    queryFn: () =>
      expensesService.getExpenses({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        kind: kindFilter || undefined,
        start_date: startDate,
        end_date: endDate,
        search: search || undefined,
        business: biz,
      }),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id, paymentMethod }) =>
      expensesService.markExpenseAsPaid(id, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pending-expenses"] });
      toast.success("Gasto marcado como pagado");
      setSelectedExpense(null);
    },
    onError: () => {
      toast.error("Error al marcar como pagado");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => expensesService.cancelExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("Gasto cancelado");
      setSelectedExpense(null);
    },
    onError: () => {
      toast.error("Error al cancelar gasto");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => expensesService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("Gasto eliminado");
      setSelectedExpense(null);
    },
    onError: () => {
      toast.error("Error al eliminar gasto");
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

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const expenses = data?.results || data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.05rem] font-semibold uppercase tracking-[0.12em] text-light">Lista de Gastos</h1>
          <p className="text-gray text-sm mt-1">
            {expenses.length} gastos encontrados
          </p>
        </div>

        <Link
          to="/gastos/nuevo"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          Nuevo Gasto
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar gastos..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.08] border border-white/[0.1] rounded-lg text-light placeholder:text-light/25 focus:outline-none focus:border-white/30"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors w-full sm:w-auto ${
            showFilters || statusFilter || categoryFilter
              ? "bg-primary/20 border-primary/50 text-primary"
            : "bg-white/[0.08] border-white/[0.1] text-gray hover:text-light"
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between fb-card px-4 py-3">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-light font-medium text-lg">{monthLabel}</span>

        <button
          onClick={() => navigateMonth(1)}
          disabled={isCurrentMonth}
          className={`p-2 rounded-lg transition-colors ${
            isCurrentMonth
              ? "text-gray/30 cursor-not-allowed"
              : "text-gray hover:text-light hover:bg-white/[0.06]"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fb-card p-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="fb-eyebrow mb-2 block">Tipo</label>
                <select
                  value={kindFilter}
                  onChange={(e) => handleFilterChange("kind", e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-dark-secondary px-3 py-2 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none [&>option]:bg-dark-secondary [&>option]:text-light"
                >
                  <option value="">Todos</option>
                  <option value={KINDS.operational.value}>{KINDS.operational.label}</option>
                  <option value={KINDS.investment.value}>{KINDS.investment.label}</option>
                </select>
              </div>

              <div>
                <label className="fb-eyebrow mb-2 block">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-dark-secondary px-3 py-2 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none [&>option]:bg-dark-secondary [&>option]:text-light"
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="fb-eyebrow mb-2 block">Categoria</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-dark-secondary px-3 py-2 text-[0.85rem] text-light transition-colors focus:border-white/30 focus:outline-none [&>option]:bg-dark-secondary [&>option]:text-light"
                >
                  <option value="">Todas</option>
                  {categories?.results?.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  )) ||
                    categories?.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expenses List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="fb-card p-8 text-center">
          <Wallet className="w-12 h-12 text-gray mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-light mb-2">
            Sin gastos encontrados
          </h3>
          <p className="text-gray">
            No hay gastos que coincidan con los filtros seleccionados
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const IconComponent = ICON_MAP[expense.category_icon] || Wallet;
            const colorClass = COLOR_MAP[expense.category_color] || COLOR_MAP.gray;
            const statusStyle = STATUS_STYLES[expense.status] || STATUS_STYLES.pending;

            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative fb-card p-4 hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className={`p-3 rounded-lg border ${colorClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-light truncate">
                        {expense.description}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </span>
                      {expense.kind === KINDS.investment.value && (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${kindMeta(expense.kind).badge}`}
                          title="No resta del margen del mes"
                        >
                          {KINDS.investment.short}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray">
                      <span>{expense.category_name}</span>
                      <span>-</span>
                      <span>{expense.expense_date}</span>
                      {expense.expense_number && (
                        <>
                          <span>-</span>
                          <span className="font-mono text-xs">
                            {expense.expense_number}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto sm:text-right">
                    <p className="text-lg font-bold text-light">
                      {formatCurrency(expense.amount)}
                    </p>
                    {expense.payment_method_display && expense.status === "paid" && (
                      <p className="text-xs text-gray">
                        {expense.payment_method_display}
                      </p>
                    )}
                  </div>

                  <div className="relative self-start sm:self-auto">
                    <button
                      onClick={() =>
                        setSelectedExpense(
                          selectedExpense === expense.id ? null : expense.id
                        )
                      }
                      className="p-2 text-gray hover:text-light hover:bg-white/[0.06] rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {selectedExpense === expense.id && (
                        <>
                          {/* Backdrop para cerrar al hacer click afuera */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setSelectedExpense(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed sm:absolute right-4 sm:right-0 bottom-20 sm:bottom-full sm:mb-1 w-[calc(100%-2rem)] sm:w-48 bg-[#1a1a2e]/95 border border-white/[0.15] rounded-lg shadow-2xl z-50 overflow-hidden"
                          >
                            <Link
                              to={`/gastos/${expense.id}`}
                              className="flex items-center gap-2 px-4 py-3 sm:py-2.5 text-sm text-light hover:bg-white/[0.06] transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Ver detalle
                            </Link>

                            {expense.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    markPaidMutation.mutate({
                                      id: expense.id,
                                      paymentMethod: "cash",
                                    })
                                  }
                                  className="w-full flex items-center gap-2 px-4 py-3 sm:py-2.5 text-sm text-green-400 hover:bg-green-500/10 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Marcar pagado
                                </button>
                                <button
                                  onClick={() => cancelMutation.mutate(expense.id)}
                                  className="w-full flex items-center gap-2 px-4 py-3 sm:py-2.5 text-sm text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancelar
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                if (confirm("¿Eliminar este gasto?")) {
                                  deleteMutation.mutate(expense.id);
                                }
                              }}
                              className="w-full flex items-center gap-2 px-4 py-3 sm:py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExpensesListPage;
