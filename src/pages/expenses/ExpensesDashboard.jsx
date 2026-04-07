import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Zap,
  Home,
  Wrench,
  Loader2,
  AlertCircle,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { expensesService } from "@/services/expenses.service";

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

const ExpensesDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["expense-stats", startDate, endDate],
    queryFn: () => expensesService.getExpenseStats({ start_date: startDate, end_date: endDate }),
  });

  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["pending-expenses"],
    queryFn: () => expensesService.getPendingExpenses(),
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

  if (loadingStats || loadingPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-light">Gastos Operativos</h1>
          <p className="text-gray text-sm mt-1">
            Control de gastos del negocio
          </p>
        </div>

        <Link
          to="/gastos/nuevo"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Nuevo Gasto</span>
        </Link>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl px-4 py-3">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-gray">Pagados</span>
          </div>
          <p className="text-2xl font-bold text-light">
            {formatCurrency(stats?.total_paid)}
          </p>
          <p className="text-xs text-gray mt-1">
            {stats?.paid_count || 0} gastos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-sm text-gray">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-light">
            {formatCurrency(stats?.total_pending)}
          </p>
          <p className="text-xs text-gray mt-1">
            {stats?.pending_count || 0} gastos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm text-gray">Cancelados</span>
          </div>
          <p className="text-2xl font-bold text-light">
            {stats?.cancelled_count || 0}
          </p>
          <p className="text-xs text-gray mt-1">gastos cancelados</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-gray">Total Gastos</span>
          </div>
          <p className="text-2xl font-bold text-light">
            {stats?.expenses_count || 0}
          </p>
          <p className="text-xs text-gray mt-1">en el periodo</p>
        </motion.div>
      </div>

      {/* Categories breakdown */}
      {stats?.by_category && stats.by_category.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-5"
        >
          <h2 className="text-lg font-semibold text-light mb-4">
            Gastos por Categoria
          </h2>
          <div className="space-y-3">
            {stats.by_category.map((cat, index) => {
              const IconComponent = ICON_MAP[cat.category__icon] || Wallet;
              const colorClass = COLOR_MAP[cat.category__color] || COLOR_MAP.gray;
              const total = parseFloat(stats.total_paid) || 1;
              const percentage = ((parseFloat(cat.total) / total) * 100).toFixed(1);

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg border ${colorClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-light">
                        {cat.category__name}
                      </span>
                      <span className="text-sm text-gray">
                        {formatCurrency(cat.total)} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Pending expenses list */}
      {pendingData?.expenses && pendingData.expenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-light">
              Gastos Pendientes
            </h2>
            <Link
              to="/gastos/lista?status=pending"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {pendingData.expenses.slice(0, 5).map((expense) => {
              const IconComponent = ICON_MAP[expense.category_icon] || Wallet;
              const colorClass = COLOR_MAP[expense.category_color] || COLOR_MAP.gray;

              return (
                <Link
                  key={expense.id}
                  to={`/gastos/${expense.id}`}
                  className="flex items-center gap-4 p-3 backdrop-blur-sm bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.06] transition-colors"
                >
                  <div className={`p-2 rounded-lg border ${colorClass}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-light truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray">
                      {expense.category_name} - {expense.expense_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-yellow-400">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="text-xs text-gray">Pendiente</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {(!stats?.by_category || stats.by_category.length === 0) &&
        (!pendingData?.expenses || pendingData.expenses.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-12 h-12 text-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-light mb-2">
              Sin gastos registrados
            </h3>
            <p className="text-gray mb-4">
              Comienza registrando tu primer gasto operativo
            </p>
            <Link
              to="/gastos/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Registrar Gasto
            </Link>
          </motion.div>
        )}
    </div>
  );
};

export default ExpensesDashboard;
