import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Loader2 } from 'lucide-react';
import { modifiersService } from '@/services/modifiers.service';
import { businessService } from '@/services/business.service';
import { useBusinessStore } from '@/stores/useBusinessStore';
import ModifierGroupCard from '@/components/products/ModifierGroupCard';

const emptyForm = { name: '', business: '', min_select: 1, max_select: 1 };

export default function ModifierGroupsPage() {
  const queryClient = useQueryClient();
  const { selectedBusinessSlug } = useBusinessStore();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const { data: businessesData } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const businesses = Array.isArray(businessesData) ? businessesData : businessesData?.results || [];

  const { data: groupsData, isLoading } = useQuery({
    queryKey: ['modifier-groups', selectedBusinessSlug, 'admin'],
    queryFn: () =>
      modifiersService.getGroups({
        active_only: false,
        ...(selectedBusinessSlug ? { business: selectedBusinessSlug } : {}),
      }),
  });
  const groups = Array.isArray(groupsData) ? groupsData : [];

  // Sincroniza el negocio del form con el selector global (siempre que cambie)
  useEffect(() => {
    if (!businesses.length) return;
    const match = businesses.find((b) => b.slug === selectedBusinessSlug);
    setForm((f) => ({ ...f, business: (match || businesses[0]).id }));
  }, [businesses, selectedBusinessSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetchGroups = () => queryClient.invalidateQueries({ queryKey: ['modifier-groups'] });

  const createGroup = useMutation({
    mutationFn: (data) => modifiersService.createGroup(data),
    onSuccess: () => {
      setForm((f) => ({ ...emptyForm, business: f.business }));
      setError('');
      refetchGroups();
    },
    onError: (e) =>
      setError(
        e.response?.data?.non_field_errors?.[0] ||
          e.response?.data?.name?.[0] ||
          'No se pudo crear el grupo.'
      ),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.business) return;
    createGroup.mutate({
      name: form.name.trim(),
      business: Number(form.business),
      min_select: Number(form.min_select),
      max_select: Number(form.max_select),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-light flex items-center gap-2">
          <Layers className="w-7 h-7 text-secondary" />
          Grupos de opciones
        </h1>
        <p className="text-gray mt-1">
          Crea grupos reutilizables (carnes, salsas, tamaños, bebida…) y luego asígnalos a tus
          productos configurables.
        </p>
      </div>

      {/* Crear grupo */}
      <form
        onSubmit={handleCreate}
        className="backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-xl p-5 space-y-4"
      >
        <h2 className="text-lg font-bold text-light flex items-center gap-2">
          <Plus className="w-5 h-5 text-secondary" /> Nuevo grupo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-gray">
            Nombre
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Carnes"
              className="mt-1 w-full px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light focus:border-secondary/50 focus:outline-none"
            />
          </label>
          <label className="text-sm text-gray">
            Negocio
            <select
              value={form.business}
              onChange={(e) => setForm({ ...form, business: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light focus:border-secondary/50 focus:outline-none"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id} className="bg-dark">
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-gray">
            Mínimo a elegir
            <input
              type="number"
              min="0"
              value={form.min_select}
              onChange={(e) => setForm({ ...form, min_select: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light focus:border-secondary/50 focus:outline-none"
            />
          </label>
          <label className="text-sm text-gray">
            Máximo a elegir
            <input
              type="number"
              min="0"
              value={form.max_select}
              onChange={(e) => setForm({ ...form, max_select: e.target.value })}
              className="mt-1 w-full px-3 py-2 bg-white/[0.09] border border-white/[0.12] rounded-lg text-light focus:border-secondary/50 focus:outline-none"
            />
          </label>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={!form.name.trim() || !form.business || createGroup.isPending}
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-secondary to-primary text-dark font-bold rounded-lg hover:shadow-lg hover:shadow-secondary/30 transition-all disabled:opacity-50"
        >
          {createGroup.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Crear grupo
        </button>
      </form>

      {/* Lista de grupos */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-gray py-8 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando grupos…
        </div>
      ) : groups.length === 0 ? (
        <p className="text-gray italic text-center py-8">
          Aún no hay grupos de opciones. Crea el primero arriba.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <ModifierGroupCard key={group.id} group={group} onChanged={refetchGroups} />
          ))}
        </div>
      )}
    </div>
  );
}
