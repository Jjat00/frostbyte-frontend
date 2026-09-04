import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bot,
  Check,
  Heart,
  Home,
  Image as ImageIcon,
  Info,
  Loader2,
  MessageCircle,
  MousePointerClick,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Smile,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  useAgentSettings,
  useUpdateAgentSettings,
  useCreateTone,
  useUpdateTone,
  useDeleteTone,
  useRestoreTone,
  useStickers,
  useCreateSticker,
  useUpdateSticker,
  useDeleteSticker,
} from '@/hooks';
import { useToast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// Los cuatro interruptores, en el orden en que importan. Cada uno quita a la
// vez la tool y el trozo de prompt que la explica: apagarlo no deja al agente
// prometiendo algo que ya no puede hacer.
const CAPABILITIES = [
  {
    field: 'stickers_enabled',
    icon: Smile,
    title: 'Stickers',
    hint: 'Manda uno del banco cuando el momento lo pide. Él decide cuándo y cuál: a veces sí, a veces no.',
  },
  {
    field: 'reactions_enabled',
    icon: Heart,
    title: 'Reacciones',
    hint: 'Responde con un emoji sobre el mensaje del cliente, sin mandar mensaje aparte.',
  },
  {
    field: 'product_photos_enabled',
    icon: ImageIcon,
    title: 'Fotos de productos',
    hint: 'Cuando preguntan cómo es algo, manda la foto real de la carta.',
  },
  {
    field: 'quick_replies_enabled',
    icon: MousePointerClick,
    title: 'Botones',
    hint: 'Botones de respuesta rápida para confirmar el pedido. El pago nunca se pregunta así.',
  },
];

const TEXT_FIELDS = ['agent_name', 'tone_preset', 'tone', 'owner_phones'];

const BLANK_TONE = { name: '', description: '', sample: '', persona: '' };

// El mismo mínimo que exige el servidor: mejor que el botón no deje mandar
// una personalidad de dos palabras a que la rechace después.
const MIN_PERSONA = 40;

const formatWeight = (bytes) => (bytes ? `${Math.round(bytes / 1024)} KB` : '—');

/** Fondo a cuadros: sin él no se distingue un sticker transparente de uno con fondo blanco. */
const CHECKERBOARD = {
  backgroundImage:
    'linear-gradient(45deg,#2a2a2a 25%,transparent 25%),linear-gradient(-45deg,#2a2a2a 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2a2a2a 75%),linear-gradient(-45deg,transparent 75%,#2a2a2a 75%)',
  backgroundSize: '14px 14px',
  backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0',
  backgroundColor: '#1b1b1b',
};

const Switch = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0 transition-colors disabled:opacity-50 ${
      checked ? 'border-secondary/40 bg-secondary/70' : 'border-white/[0.12] bg-white/[0.07]'
    }`}
  >
    <span
      className={`block h-[18px] w-[18px] rounded-full bg-light transition-transform ${
        checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
      }`}
    />
  </button>
);

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="fb-eyebrow mb-2 block">{label}</span>
    {children}
    {hint && <span className="mt-2 block text-[0.72rem] leading-relaxed text-light/40">{hint}</span>}
  </label>
);

const inputClass =
  'w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-3 text-sm text-light ' +
  'placeholder:text-light/25 focus:border-secondary/40 focus:outline-none';

/**
 * Módulo de configuración de Frosty, el agente de pedidos por WhatsApp.
 *
 * Existe porque el admin de Django no es el sitio donde el dueño está: opera
 * desde el celular y el cambio que quiere hacer (subirle un sticker, bajarle
 * el chiste, apagarle los botones) es de un toque. Solo admin.
 *
 * Lo que NO se puede tocar aquí es a propósito: las reglas del pedido
 * (cobertura, pagos, cómo se cotiza) viven en el prompt y tienen tests detrás.
 */
const AgentSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: settings, isLoading } = useAgentSettings();
  const { data: stickers = [], isLoading: loadingStickers } = useStickers();
  const updateSettings = useUpdateAgentSettings();
  const createTone = useCreateTone();
  const updateTone = useUpdateTone();
  const deleteTone = useDeleteTone();
  const restoreTone = useRestoreTone();
  const createSticker = useCreateSticker();
  const updateSticker = useUpdateSticker();
  const deleteSticker = useDeleteSticker();

  const [tab, setTab] = useState('personalidad');
  // Borrador de los campos de texto: se guardan con un botón, no al teclear.
  const [draft, setDraft] = useState(null);
  // Sticker en edición: { id? , label, description, file, previewUrl } | null
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  // Tono en edición: uno del catálogo, o el molde vacío si es nuevo
  const [toneEditing, setToneEditing] = useState(null);
  const [toneRemoving, setToneRemoving] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (settings && !draft) {
      setDraft({
        agent_name: settings.agent_name || '',
        tone_preset: settings.tone_preset || '',
        tone: settings.tone || '',
        owner_phones: settings.owner_phones || '',
      });
    }
  }, [settings, draft]);

  const dirty = useMemo(
    () => !!draft && !!settings && TEXT_FIELDS.some((f) => (draft[f] || '') !== (settings[f] || '')),
    [draft, settings]
  );

  const presets = settings?.tone_presets || [];
  const activeStickers = stickers.filter((s) => s.is_active).length;
  const agentName = settings?.agent_name || 'Frosty';

  const showError = (error, fallback) => {
    const data = error?.response?.data;
    const detail =
      (typeof data === 'string' && data) ||
      data?.archivo ||
      data?.detail ||
      (data && Object.values(data)[0]);
    toast({
      title: fallback,
      description: Array.isArray(detail) ? detail[0] : detail || undefined,
      variant: 'destructive',
    });
  };

  const saveText = () => {
    updateSettings.mutate(draft, {
      onSuccess: (data) => {
        setDraft({
          agent_name: data.agent_name || '',
          tone_preset: data.tone_preset || '',
          tone: data.tone || '',
          owner_phones: data.owner_phones || '',
        });
        toast({ title: 'Listo, así queda' });
      },
      onError: (error) => showError(error, 'No se pudo guardar'),
    });
  };

  // Los interruptores se guardan al toque: son una decisión de un clic y
  // esperar a un botón "Guardar" haría dudar de si quedó aplicado.
  const toggleCapability = (field, value) => {
    updateSettings.mutate(
      { [field]: value },
      { onError: (error) => showError(error, 'No se pudo cambiar') }
    );
  };

  // ---- Los tonos ----
  // Se crean y se editan aquí, pero elegir cuál habla sigue siendo parte del
  // borrador: es un cambio de configuración, no del catálogo.

  const savingTone = createTone.isPending || updateTone.isPending;
  const toneValid =
    toneEditing &&
    toneEditing.name?.trim() &&
    toneEditing.description?.trim() &&
    (toneEditing.persona || '').trim().length >= MIN_PERSONA;
  // El servidor se niega a borrar el que está en uso y el último que queda;
  // aquí el botón ni aparece, para no ofrecer algo que va a fallar.
  const toneRemovable =
    toneEditing?.id && presets.length > 1 && settings?.tone_preset !== toneEditing.key;

  const saveTone = () => {
    const payload = {
      name: (toneEditing.name || '').trim(),
      description: (toneEditing.description || '').trim(),
      sample: (toneEditing.sample || '').trim(),
      persona: (toneEditing.persona || '').trim(),
    };
    const fail = (error) => showError(error, 'No se pudo guardar el tono');

    if (toneEditing.id) {
      updateTone.mutate(
        { id: toneEditing.id, ...payload },
        {
          onSuccess: () => {
            setToneEditing(null);
            toast({
              title: 'Tono actualizado',
              description:
                settings?.tone_preset === toneEditing.key
                  ? 'Es el que está hablando: se aplica desde la próxima conversación.'
                  : undefined,
            });
          },
          onError: fail,
        }
      );
      return;
    }
    createTone.mutate(payload, {
      onSuccess: (data) => {
        setToneEditing(null);
        // Queda elegido, pero sin guardar: quien lo creó lo hizo para usarlo,
        // y aun así el cambio de cómo habla el negocio pasa por el botón.
        setDraft((prev) => ({ ...prev, tone_preset: data.key }));
        toast({
          title: 'Tono creado',
          description: 'Queda elegido: dale a Guardar para que hable así.',
        });
      },
      onError: fail,
    });
  };

  const restoreOriginal = () => {
    restoreTone.mutate(toneEditing.id, {
      onSuccess: (data) => {
        setToneEditing(data);
        toast({ title: 'Tono restaurado', description: 'Volvió al texto con el que vino.' });
      },
      onError: (error) => showError(error, 'No se pudo restaurar'),
    });
  };

  // El preview local es un blob del navegador: si no se suelta, cada archivo
  // que se mire de paso se queda en memoria hasta recargar la página.
  const releasePreview = (url) => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  };

  const closeEditor = () => {
    setEditing((prev) => {
      releasePreview(prev?.previewUrl);
      return null;
    });
  };

  const pickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEditing((prev) => {
      releasePreview(prev?.previewUrl);
      return {
        ...(prev || { label: '', description: '' }),
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
    event.target.value = '';
  };

  const saveSticker = () => {
    const payload = {
      label: (editing.label || '').trim(),
      description: (editing.description || '').trim(),
    };
    const done = (data) => {
      closeEditor();
      toast({
        title: editing.id ? 'Sticker actualizado' : 'Sticker guardado',
        description: data?.warning,
      });
    };
    const fail = (error) => showError(error, 'No se pudo guardar el sticker');

    if (editing.id) {
      updateSticker.mutate(
        { id: editing.id, ...payload, ...(editing.file ? { archivo: editing.file } : {}) },
        { onSuccess: done, onError: fail }
      );
    } else {
      createSticker.mutate({ ...payload, archivo: editing.file }, { onSuccess: done, onError: fail });
    }
  };

  const savingSticker = createSticker.isPending || updateSticker.isPending;
  const stickerValid =
    editing && editing.label?.trim() && editing.description?.trim() && (editing.id || editing.file);

  if (isLoading || !draft) {
    return (
      <div className="fb-screen fb-screen--plain flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="fb-screen fb-screen--plain min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-dark/95">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => navigate('/home')}
            className="rounded-lg p-2 text-gray transition-colors hover:bg-white/[0.06] hover:text-light"
            title="Volver al panel"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
            <Bot className="h-5 w-5 text-secondary" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[0.95rem] font-semibold tracking-[0.12em] text-light">
              {agentName.toUpperCase()}
            </h1>
            <p className="truncate text-xs text-gray">Agente de pedidos por WhatsApp</p>
          </div>
          <Link
            to="/home"
            className="hidden rounded-lg p-2 text-gray transition-colors hover:bg-white/[0.06] hover:text-light sm:block"
            title="Panel"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="mx-auto flex max-w-3xl gap-1 px-4 pb-2">
          {[
            { id: 'personalidad', label: 'Cómo habla' },
            { id: 'stickers', label: `Stickers${stickers.length ? ` · ${stickers.length}` : ''}` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
                tab === item.id
                  ? 'bg-white/[0.08] font-semibold text-light'
                  : 'text-gray hover:text-light'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {tab === 'personalidad' ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Identidad */}
            <section className="fb-card p-4 md:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                <h2 className="text-sm font-semibold text-light">Identidad</h2>
              </div>
              <div className="space-y-4">
                <Field label="Nombre" hint="Con este nombre se presenta ante el cliente.">
                  <input
                    className={inputClass}
                    value={draft.agent_name}
                    maxLength={40}
                    onChange={(e) => setDraft({ ...draft, agent_name: e.target.value })}
                  />
                </Field>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="fb-eyebrow">Tono</span>
                    <button
                      type="button"
                      onClick={() => setToneEditing({ ...BLANK_TONE })}
                      className="-mr-1 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.72rem] text-secondary transition-colors hover:bg-secondary/[0.08]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Nuevo tono
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {presets.map((preset) => {
                      const active = draft.tone_preset === preset.key;
                      return (
                        <div
                          key={preset.key}
                          className={`relative rounded-xl border transition-colors ${
                            active
                              ? 'border-secondary/40 bg-secondary/[0.08]'
                              : 'border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setDraft({ ...draft, tone_preset: preset.key })}
                            className="block w-full px-3.5 py-3 pr-12 text-left"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                  active ? 'bg-secondary' : 'bg-white/20'
                                }`}
                              />
                              <span className="text-sm font-medium text-light">{preset.name}</span>
                              {active && <Check className="h-4 w-4 shrink-0 text-secondary" />}
                            </span>
                            <span className="mt-1.5 block text-[0.72rem] leading-relaxed text-light/45">
                              {preset.description}
                            </span>
                            {preset.sample && (
                              <span className="mt-1 block text-[0.72rem] leading-relaxed text-light/30">
                                «{preset.sample}»
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setToneEditing({ ...preset })}
                            className="absolute right-1.5 top-1.5 rounded-lg p-2.5 text-gray transition-colors hover:bg-white/[0.06] hover:text-light"
                            title={`Editar ${preset.name}`}
                            aria-label={`Editar el tono ${preset.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <span className="mt-2 block text-[0.72rem] leading-relaxed text-light/40">
                    Es la personalidad con la que habla: el tono que elijas reemplaza al de
                    fábrica, no se le suma. Con el lápiz cambias lo que dice cada uno, o creas
                    el tuyo.
                  </span>
                </div>

                <Field
                  label="Ajustes de tono (opcional)"
                  hint="Retoques encima del tono elegido; mandan sobre él. Ej.: «trata al cliente de usted» o «sin emojis». Vacío = el tono tal cual."
                >
                  <textarea
                    className={`${inputClass} min-h-[88px] resize-y leading-relaxed`}
                    value={draft.tone}
                    placeholder="Sin emojis, y nunca digas «pana»…"
                    onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
                  />
                </Field>
              </div>
            </section>

            {/* El dueño */}
            <section className="fb-card p-4 md:p-5">
              <div className="mb-4 flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <h2 className="text-sm font-semibold text-light">El dueño</h2>
              </div>
              <Field
                label="Números que reconoce como tuyos"
                hint="Separados por coma, con indicativo (573164277879). Desde estos números te trata en confianza y te deja subir stickers y cambiarle el tono por chat. Te sigue tomando pedidos de verdad."
              >
                <input
                  className={inputClass}
                  value={draft.owner_phones}
                  inputMode="tel"
                  onChange={(e) => setDraft({ ...draft, owner_phones: e.target.value })}
                />
              </Field>
            </section>

            {/* Qué puede mandar */}
            <section className="fb-card p-4 md:p-5">
              <div className="mb-1 flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-secondary" />
                <h2 className="text-sm font-semibold text-light">Qué puede mandar</h2>
              </div>
              <p className="mb-4 text-[0.72rem] leading-relaxed text-light/40">
                Además de texto. Apagar uno le quita la herramienta y también la parte del prompt
                que se la explica, así que no queda prometiendo algo que ya no puede hacer.
              </p>
              <div className="divide-y divide-white/[0.06]">
                {CAPABILITIES.map(({ field, icon: Icon, title, hint }) => (
                  <div key={field} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.1] bg-white/[0.03]">
                      <Icon className="h-4 w-4 text-light/70" strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-light">{title}</p>
                      <p className="mt-0.5 text-[0.72rem] leading-relaxed text-light/40">{hint}</p>
                    </div>
                    <Switch
                      label={title}
                      checked={!!settings?.[field]}
                      disabled={updateSettings.isPending}
                      onChange={(value) => toggleCapability(field, value)}
                    />
                  </div>
                ))}
              </div>
            </section>

            <p className="flex items-start gap-2 px-1 text-[0.72rem] leading-relaxed text-light/35">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Las reglas del pedido —zona de cobertura, pagos, cómo se cotiza— no se editan aquí:
              viven en el código y tienen pruebas detrás.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.72rem] leading-relaxed text-light/40">
                {activeStickers} activo{activeStickers === 1 ? '' : 's'} de {stickers.length}. El
                agente elige por el «cuándo usarlo», no por el dibujo, y no repite el último que
                mandó: con varios para un mismo momento, menos suena a bot.
              </p>
              <button
                onClick={() => setEditing({ label: '', description: '' })}
                className="fb-btn fb-btn--accent shrink-0 gap-1.5 px-3.5 py-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>

            {loadingStickers ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-secondary" />
              </div>
            ) : stickers.length === 0 ? (
              <div className="fb-card flex flex-col items-center px-5 py-10 text-center">
                <Smile className="mb-3 h-8 w-8 text-light/20" strokeWidth={1.5} />
                <p className="text-sm font-medium text-light">El banco está vacío</p>
                <p className="mt-1.5 max-w-sm text-[0.78rem] leading-relaxed text-light/40">
                  Sube una imagen con fondo transparente, o mándasela a {agentName} por WhatsApp
                  desde tu número y dile cuándo usarla.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {stickers.map((sticker) => (
                  <div key={sticker.id} className="fb-card flex flex-col p-3">
                    <div
                      className="mb-3 flex aspect-square items-center justify-center rounded-xl"
                      style={CHECKERBOARD}
                    >
                      {sticker.preview ? (
                        <img
                          src={sticker.preview}
                          alt={sticker.label}
                          loading="lazy"
                          className={`h-full w-full object-contain p-2 ${
                            sticker.is_active ? '' : 'opacity-35 grayscale'
                          }`}
                        />
                      ) : null}
                    </div>
                    <p className="truncate text-sm font-medium text-light" title={sticker.label}>
                      {sticker.label}
                    </p>
                    <p
                      className="mt-1 line-clamp-2 text-[0.7rem] leading-relaxed text-light/40"
                      title={sticker.description}
                    >
                      {sticker.description}
                    </p>
                    <p className="mt-2 text-[0.65rem] text-light/25">
                      {formatWeight(sticker.byte_size)}
                      {sticker.is_animated ? ' · animado' : ''}
                      {sticker.sent_count ? ` · enviado ${sticker.sent_count}×` : ''}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                      <Switch
                        label={`Activar ${sticker.label}`}
                        checked={sticker.is_active}
                        disabled={updateSticker.isPending}
                        onChange={(value) =>
                          updateSticker.mutate(
                            { id: sticker.id, is_active: value },
                            { onError: (error) => showError(error, 'No se pudo cambiar') }
                          )
                        }
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setEditing({
                              id: sticker.id,
                              label: sticker.label,
                              description: sticker.description,
                              previewUrl: sticker.preview,
                            })
                          }
                          className="rounded-lg p-2 text-gray transition-colors hover:bg-white/[0.06] hover:text-light"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setRemoving(sticker)}
                          className="rounded-lg p-2 text-gray transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="flex items-start gap-2 px-1 text-[0.72rem] leading-relaxed text-light/35">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Un sticker se ve como sticker solo si la imagen trae fondo transparente; si no, en el
              chat queda un cuadro pegado sobre el fondo. Se acepta cualquier formato (también un
              video corto) y aquí se convierte a lo que WhatsApp exige.
            </p>
          </motion.div>
        )}
      </main>

      {/* Barra de guardado: solo aparece cuando hay algo sin guardar */}
      {tab === 'personalidad' && dirty && (
        <motion.div
          initial={{ y: 60 }}
          animate={{ y: 0 }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-dark/95 px-4 py-3"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <button
              onClick={() => setDraft(null)}
              className="fb-btn px-4 py-2.5 text-sm"
              disabled={updateSettings.isPending}
            >
              Descartar
            </button>
            <button
              onClick={saveText}
              disabled={updateSettings.isPending}
              className="fb-btn fb-btn--accent flex-1 justify-center gap-2 py-2.5 text-sm"
            >
              {updateSettings.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar cambios
            </button>
          </div>
        </motion.div>
      )}

      {/* Alta y edición de un tono */}
      <ConfirmDialog
        open={!!toneEditing}
        title={toneEditing?.id ? `Editar «${toneEditing.name}»` : 'Nuevo tono'}
        message={
          toneEditing?.id
            ? 'La personalidad es lo único que lee el agente; lo demás es para reconocerlo aquí.'
            : `Dile a ${agentName} quién es cuando habla así. Reemplaza la personalidad entera, no se le suma.`
        }
        icon={MessageCircle}
        size="lg"
        confirmLabel={toneEditing?.id ? 'Guardar tono' : 'Crear tono'}
        loading={savingTone}
        confirmDisabled={!toneValid}
        onConfirm={saveTone}
        onCancel={() => setToneEditing(null)}
      >
        <div className="space-y-4">
          <Field label="Nombre">
            <input
              className={inputClass}
              value={toneEditing?.name || ''}
              maxLength={40}
              placeholder="Parcero"
              onChange={(e) => setToneEditing({ ...toneEditing, name: e.target.value })}
            />
          </Field>

          <Field label="De qué va" hint="Una línea para reconocerlo al elegir. No la lee el agente.">
            <input
              className={inputClass}
              value={toneEditing?.description || ''}
              maxLength={200}
              placeholder="Caluroso y rápido, hablando como en Nariño."
              onChange={(e) => setToneEditing({ ...toneEditing, description: e.target.value })}
            />
          </Field>

          <Field
            label="Frase de ejemplo (opcional)"
            hint="Cómo sonaría un saludo suyo. Se ve aquí y también se la damos al agente: un ejemplo corto le afina el registro más que explicárselo."
          >
            <input
              className={inputClass}
              value={toneEditing?.sample || ''}
              maxLength={200}
              placeholder="Qué más parce, ¿lo de siempre?"
              onChange={(e) => setToneEditing({ ...toneEditing, sample: e.target.value })}
            />
          </Field>

          <Field
            label="Personalidad"
            hint="Esto SÍ lo lee el agente. Escríbelo hablándole a él («eres…», «tuteas…») y dile también qué hacer cuando el cliente está molesto."
          >
            <textarea
              className={`${inputClass} min-h-[170px] resize-y leading-relaxed`}
              value={toneEditing?.persona || ''}
              placeholder="QUIÉN ERES: el que atiende de siempre en el local, cálido y atento…"
              onChange={(e) => setToneEditing({ ...toneEditing, persona: e.target.value })}
            />
          </Field>

          {toneEditing?.id && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
              {toneEditing.is_builtin && toneEditing.is_modified && (
                <button
                  type="button"
                  onClick={restoreOriginal}
                  disabled={restoreTone.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.72rem] text-gray transition-colors hover:bg-white/[0.06] hover:text-light disabled:opacity-50"
                >
                  {restoreTone.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Restaurar el original
                </button>
              )}
              {toneRemovable ? (
                <button
                  type="button"
                  onClick={() => {
                    setToneRemoving(toneEditing);
                    setToneEditing(null);
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.72rem] text-gray transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
              ) : (
                settings?.tone_preset === toneEditing.key && (
                  <span className="ml-auto text-[0.7rem] text-light/30">
                    Es el tono con el que habla ahora
                  </span>
                )
              )}
            </div>
          )}
        </div>
      </ConfirmDialog>

      {/* Borrado de un tono */}
      <ConfirmDialog
        open={!!toneRemoving}
        title={`¿Eliminar «${toneRemoving?.name || ''}»?`}
        message="Desaparece de la lista de tonos. No se puede deshacer; si solo quieres que hable distinto, edítalo o elige otro."
        confirmLabel="Eliminar"
        tone="danger"
        icon={Trash2}
        loading={deleteTone.isPending}
        onConfirm={() =>
          deleteTone.mutate(toneRemoving.id, {
            onSuccess: () => {
              // Si estaba elegido sin guardar, el borrador vuelve al que sí lo está.
              setDraft((prev) =>
                prev?.tone_preset === toneRemoving.key
                  ? { ...prev, tone_preset: settings?.tone_preset || '' }
                  : prev
              );
              setToneRemoving(null);
              toast({ title: 'Tono eliminado' });
            },
            onError: (error) => showError(error, 'No se pudo eliminar'),
          })
        }
        onCancel={() => setToneRemoving(null)}
      />

      {/* Alta y edición de un sticker */}
      <ConfirmDialog
        open={!!editing}
        title={editing?.id ? 'Editar sticker' : 'Nuevo sticker'}
        message={
          editing?.id
            ? 'Cambia el nombre, el momento en que se usa o la imagen misma.'
            : 'Sube la imagen y dile al agente en qué momento mandarla.'
        }
        icon={Smile}
        confirmLabel={editing?.id ? 'Guardar' : 'Subir sticker'}
        loading={savingSticker}
        confirmDisabled={!stickerValid}
        onConfirm={saveSticker}
        onCancel={closeEditor}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl"
              style={CHECKERBOARD}
            >
              {editing?.previewUrl ? (
                <img src={editing.previewUrl} alt="" className="h-full w-full object-contain p-1.5" />
              ) : (
                <ImageIcon className="h-6 w-6 text-light/25" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="fb-btn w-full justify-center gap-2 py-2.5 text-sm"
              >
                <Upload className="h-4 w-4" />
                {editing?.file ? 'Cambiar archivo' : editing?.id ? 'Cambiar imagen' : 'Elegir archivo'}
              </button>
              <p className="mt-2 truncate text-[0.7rem] text-light/40">
                {editing?.file?.name ||
                  (editing?.id ? 'Se conserva la actual si no eliges otra' : 'PNG, JPG, GIF o un video corto')}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={pickFile}
            />
          </div>

          <Field label="Nombre">
            <input
              className={inputClass}
              value={editing?.label || ''}
              maxLength={60}
              placeholder="granizado feliz"
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
            />
          </Field>

          <Field
            label="Cuándo usarlo"
            hint="Es lo único que el agente lee para elegirlo: describe el momento o el ánimo, no el dibujo. Varios pueden servir para lo mismo."
          >
            <textarea
              className={`${inputClass} min-h-[76px] resize-y leading-relaxed`}
              value={editing?.description || ''}
              maxLength={200}
              placeholder="para celebrar que el pedido quedó listo"
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </Field>
        </div>
      </ConfirmDialog>

      {/* Borrado */}
      <ConfirmDialog
        open={!!removing}
        title={`¿Eliminar «${removing?.label || ''}»?`}
        message="Se borra del banco y el agente deja de tener ese sticker. No se puede deshacer; si solo quieres dejar de usarlo, apágalo."
        confirmLabel="Eliminar"
        tone="danger"
        icon={Trash2}
        loading={deleteSticker.isPending}
        onConfirm={() =>
          deleteSticker.mutate(removing.id, {
            onSuccess: () => {
              setRemoving(null);
              toast({ title: 'Sticker eliminado' });
            },
            onError: (error) => showError(error, 'No se pudo eliminar'),
          })
        }
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
};

export default AgentSettingsPage;
