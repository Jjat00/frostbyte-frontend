import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Clock,
  Eye,
  CheckCircle,
  Archive,
  Loader2,
  RefreshCw,
  Calendar,
  Star,
  User,
  ThumbsUp,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { feedbackService } from '@/services';
import { useToast } from '@/components/ui/use-toast';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    icon: Clock,
    bgClass: 'bg-yellow-500/10 border-yellow-500/30',
    textClass: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/20 text-yellow-400',
  },
  reviewed: {
    label: 'Revisado',
    color: 'blue',
    icon: Eye,
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-400',
  },
  responded: {
    label: 'Respondido',
    color: 'green',
    icon: CheckCircle,
    bgClass: 'bg-green-500/10 border-green-500/30',
    textClass: 'text-green-400',
    badgeClass: 'bg-green-500/20 text-green-400',
  },
  archived: {
    label: 'Archivado',
    color: 'gray',
    icon: Archive,
    bgClass: 'bg-gray/10 border-gray/30',
    textClass: 'text-gray',
    badgeClass: 'bg-gray/20 text-gray',
  },
};

const feedbackTypeConfig = {
  compliment: {
    label: 'Felicitacion',
    icon: ThumbsUp,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  suggestion: {
    label: 'Sugerencia',
    icon: Lightbulb,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  complaint: {
    label: 'Queja',
    icon: AlertCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  question: {
    label: 'Pregunta',
    icon: HelpCircle,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  other: {
    label: 'Otro',
    icon: FileText,
    color: 'text-gray',
    bgColor: 'bg-gray/10',
  },
};

const StarRating = ({ rating }) => {
  if (!rating) return null;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray/30'
          }`}
        />
      ))}
    </div>
  );
};

const FeedbackCard = ({ feedback, onUpdateStatus }) => {
  const status = statusConfig[feedback.status] || statusConfig.pending;
  const feedbackType = feedbackTypeConfig[feedback.feedback_type] || feedbackTypeConfig.other;
  const StatusIcon = status.icon;
  const TypeIcon = feedbackType.icon;
  const { toast } = useToast();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdateStatus(feedback.id, newStatus);
      toast({
        title: "Estado actualizado",
        description: `El feedback ahora esta ${statusConfig[newStatus].label.toLowerCase()}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-dark-secondary border-2 ${status.bgClass} rounded-xl p-5 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg ${feedbackType.bgColor} flex items-center justify-center`}>
              <TypeIcon className={`w-5 h-5 ${feedbackType.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-light">
                  {feedback.customer_name || 'Anonimo'}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${feedbackType.bgColor} ${feedbackType.color}`}>
                  {feedbackType.label}
                </span>
              </div>
              <StarRating rating={feedback.rating} />
            </div>
          </div>

          <p className="text-light text-sm mt-3 leading-relaxed">
            "{feedback.comment}"
          </p>

          {feedback.admin_notes && (
            <div className="mt-3 p-3 bg-dark rounded-lg border border-gray/20">
              <p className="text-xs text-gray mb-1">Notas del admin:</p>
              <p className="text-sm text-light">{feedback.admin_notes}</p>
            </div>
          )}
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.badgeClass} flex items-center gap-1.5 ml-4`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(feedback.created_at)}</span>
        </div>
        {feedback.reviewed_at && (
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Revisado: {formatDate(feedback.reviewed_at)}</span>
          </div>
        )}
      </div>

      {/* Botones de accion segun el estado */}
      <div className="flex flex-wrap gap-2">
        {feedback.status === 'pending' && (
          <>
            <button
              onClick={() => handleStatusChange('reviewed')}
              className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              Marcar Revisado
            </button>
            <button
              onClick={() => handleStatusChange('archived')}
              className="px-4 py-2 bg-gray/20 text-gray border border-gray/30 rounded-lg hover:bg-gray/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Archive className="w-4 h-4" />
              Archivar
            </button>
          </>
        )}

        {feedback.status === 'reviewed' && (
          <>
            <button
              onClick={() => handleStatusChange('responded')}
              className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar Respondido
            </button>
            <button
              onClick={() => handleStatusChange('archived')}
              className="px-4 py-2 bg-gray/20 text-gray border border-gray/30 rounded-lg hover:bg-gray/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Archive className="w-4 h-4" />
              Archivar
            </button>
          </>
        )}

        {feedback.status === 'responded' && (
          <p className="text-sm text-gray italic">Este feedback ya fue atendido</p>
        )}

        {feedback.status === 'archived' && (
          <p className="text-sm text-gray italic">Este feedback esta archivado</p>
        )}
      </div>
    </motion.div>
  );
};

const FeedbackListPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);

  // Obtener todos los feedbacks
  const { data: feedbackData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['feedback', 'admin', statusFilter, typeFilter],
    queryFn: () => {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      return feedbackService.getAll(params);
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  const feedbacks = feedbackData?.results || [];

  // Mutacion para actualizar estado
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => feedbackService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedback']);
    },
  });

  const handleUpdateStatus = async (id, status) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const statusCounts = {
    pending: feedbacks.filter(f => f.status === 'pending').length,
    reviewed: feedbacks.filter(f => f.status === 'reviewed').length,
    responded: feedbacks.filter(f => f.status === 'responded').length,
    archived: feedbacks.filter(f => f.status === 'archived').length,
  };

  const filteredFeedbacks = statusFilter
    ? feedbacks.filter(f => f.status === statusFilter)
    : feedbacks.filter(f => f.status !== 'archived'); // Por defecto, no mostrar archivados

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-light mb-2 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-teal-400" />
              Feedback de Clientes
            </h1>
            <p className="text-gray">Gestiona los comentarios y opiniones de los clientes</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 text-gray hover:text-light hover:bg-gray/10 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filtros de estado */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === null
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Todas ({feedbacks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Pendientes ({statusCounts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'reviewed'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Revisados ({statusCounts.reviewed})
          </button>
          <button
            onClick={() => setStatusFilter('responded')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'responded'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Respondidos ({statusCounts.responded})
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'archived'
                ? 'bg-gray/20 text-gray border border-gray/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Archivados ({statusCounts.archived})
          </button>
        </div>

        {/* Filtros de tipo */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray py-2">Tipo:</span>
          <button
            onClick={() => setTypeFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === null
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
            }`}
          >
            Todos
          </button>
          {Object.entries(feedbackTypeConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                typeFilter === key
                  ? `${config.bgColor} ${config.color} border border-current/30`
                  : 'bg-dark-secondary text-gray border border-gray/20 hover:border-gray/40'
              }`}
            >
              <config.icon className="w-3.5 h-3.5" />
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de feedbacks */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-16 h-16 text-gray/50 mx-auto mb-4" />
          <p className="text-gray text-lg">
            {statusFilter
              ? `No hay feedback con estado "${statusConfig[statusFilter]?.label}"`
              : 'No hay feedback pendiente'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FeedbackListPage;
