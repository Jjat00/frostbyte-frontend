import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  ChevronUp,
  ExternalLink,
  Home,
  Loader2,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useConversations, useConversationMessages } from '@/hooks';
import { whatsappAgentService } from '@/services/whatsappAgent.service';

const AUTHOR_LABEL = { customer: 'Cliente', agent: 'Frosty', human: 'Equipo' };

const ATTENDED = {
  agent: { label: 'Frosty atendiendo', dot: 'bg-secondary' },
  human: { label: 'Atiende el equipo', dot: 'bg-amber-400' },
  blocked: { label: 'Bloqueado', dot: 'bg-red-500' },
};

const money = (value) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

const timeOf = (iso) =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

const dayKey = (iso) => new Date(iso).toDateString();

/** "Hoy", "Ayer" o la fecha: el separador entre días del chat. */
const dayLabel = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
};

/** En la bandeja: la hora si es de hoy, si no la fecha corta. */
const shortWhen = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toDateString() === new Date().toDateString()
    ? timeOf(iso)
    : date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

/** Con indicativo lleva "+"; el celular que dicta el cliente suele venir sin él. */
const withPlus = (digits) => (digits && digits.length > 10 ? `+${digits}` : digits);

/** Cómo se muestra el número: el BSUID no es un teléfono y no se marca. */
const phoneLabel = (contact) => {
  if (contact.is_bsuid) return withPlus(contact.contact_phone) || 'Número oculto';
  return withPlus(contact.phone);
};

const displayName = (contact) => contact.name || phoneLabel(contact);

/**
 * Los mensajes del cliente que el worker convierte para el agente (ubicación,
 * audio transcrito, imagen descrita) llegan entre corchetes y a veces con una
 * instrucción para el modelo ("verifícala con verificar_cobertura"). Al equipo
 * le sirve el hecho, no la instrucción: se quitan las frases que nombran una
 * tool (identificadores en snake_case).
 */
const cleanBody = (body) => {
  const trimmed = (body || '').trim();
  const isNote = trimmed.startsWith('[') && trimmed.endsWith(']');
  if (!isNote) return { text: trimmed, isNote: false };
  const inner = trimmed
    .slice(1, -1)
    .replace(/[^.]*\b[a-z]+_[a-z_]+\b[^.]*\.?/g, '')
    .trim();
  return { text: inner || trimmed.slice(1, -1), isNote: true };
};

const Initials = ({ contact }) => {
  const name = contact.name?.trim();
  const letters = name
    ? name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : null;
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-sm font-semibold text-light/80">
      {letters || <User className="h-5 w-5 text-gray" />}
      <span
        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-dark ${
          ATTENDED[contact.attended_by]?.dot || 'bg-gray'
        }`}
      />
    </span>
  );
};

const ConversationRow = ({ contact, active, onOpen }) => {
  const last = contact.last_message;
  const prefix = last && last.author !== 'customer' ? `${AUTHOR_LABEL[last.author]}: ` : '';
  return (
    <button
      onClick={() => onOpen(contact.id)}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
      }`}
    >
      <Initials contact={contact} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-sm font-semibold text-light">{displayName(contact)}</span>
          <span className="ml-auto shrink-0 text-[0.7rem] text-gray">{shortWhen(contact.last_message_at)}</span>
        </span>
        <span className="mt-0.5 block truncate text-[0.8rem] text-light/50">
          {last ? `${prefix}${cleanBody(last.body).text}` : 'Sin mensajes guardados'}
        </span>
      </span>
    </button>
  );
};

const Bubble = ({ message }) => {
  const { text, isNote } = cleanBody(message.body);
  const mine = message.direction === 'outbound';
  const human = message.author === 'human';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[0.88rem] leading-relaxed md:max-w-[70%] ${
          mine
            ? human
              ? 'rounded-br-md bg-amber-400/[0.14] text-light'
              : 'rounded-br-md bg-secondary/[0.16] text-light'
            : 'rounded-bl-md bg-white/[0.07] text-light'
        }`}
      >
        {mine && (
          <span
            className={`mb-0.5 flex items-center gap-1 text-[0.68rem] font-semibold ${
              human ? 'text-amber-300' : 'text-secondary'
            }`}
          >
            {human ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
            {AUTHOR_LABEL[message.author]}
          </span>
        )}
        <p className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${isNote ? 'italic text-light/60' : ''}`}>{text}</p>
        <span className="mt-0.5 block text-right text-[0.65rem] text-light/35">{timeOf(message.created_at)}</span>
      </div>
    </div>
  );
};

const OrderChip = ({ order }) => (
  <Link
    to={`/pedidos/${order.id}`}
    className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-[0.75rem] text-light/80 transition-colors hover:bg-white/[0.08]"
  >
    <ShoppingBag className="h-3.5 w-3.5 text-secondary" />
    <span className="font-semibold">#{order.order_number}</span>
    <span className="text-light/50">{order.status_display}</span>
    <span>{money(order.total)}</span>
  </Link>
);

/** Un chat abierto: encabezado con el cliente y sus pedidos, y los mensajes. */
const ChatThread = ({ contactId, onBack }) => {
  const { data, isLoading, isError } = useConversationMessages(contactId);
  const [older, setOlder] = useState([]);
  const [olderHasMore, setOlderHasMore] = useState(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);
  const restoreFrom = useRef(null);

  useEffect(() => {
    setOlder([]);
    setOlderHasMore(null);
    stickToBottom.current = true;
  }, [contactId]);

  const messages = useMemo(() => {
    const recent = data?.messages || [];
    const seen = new Set(recent.map((m) => m.id));
    return [...older.filter((m) => !seen.has(m.id)), ...recent];
  }, [older, data]);

  const hasMore = olderHasMore ?? data?.has_more;

  // Baja al final al abrir y cuando llega algo nuevo, salvo que el usuario
  // haya subido a leer: el refresco no le puede arrancar el scroll.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (restoreFrom.current != null) {
      el.scrollTop = el.scrollHeight - restoreFrom.current;
      restoreFrom.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadOlder = async () => {
    if (!messages.length) return;
    setLoadingOlder(true);
    try {
      const page = await whatsappAgentService.getConversationMessages(contactId, {
        before: messages[0].created_at,
      });
      restoreFrom.current = scrollRef.current?.scrollHeight - scrollRef.current?.scrollTop;
      setOlder((prev) => [...page.messages, ...prev]);
      setOlderHasMore(page.has_more);
    } finally {
      setLoadingOlder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-secondary" />
      </div>
    );
  }
  if (isError || !data) {
    return <div className="flex flex-1 items-center justify-center text-sm text-gray">No se pudo abrir el chat.</div>;
  }

  const { contact, orders } = data;
  const attended = ATTENDED[contact.attended_by];
  const dialable = contact.is_bsuid ? contact.contact_phone : contact.phone;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="border-b border-white/[0.07] px-3 py-2.5 md:px-5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-lg p-2 text-gray transition-colors hover:bg-white/[0.06] hover:text-light md:hidden"
            title="Volver a los chats"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Initials contact={contact} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-light">{displayName(contact)}</p>
            <p className="flex items-center gap-1.5 truncate text-[0.72rem] text-gray">
              <span className={`h-1.5 w-1.5 rounded-full ${attended?.dot}`} />
              {attended?.label}
              {contact.attended_by === 'human' && contact.human_until && ` hasta las ${timeOf(contact.human_until)}`}
              {contact.name && <span className="text-light/30">· {phoneLabel(contact)}</span>}
            </p>
          </div>
          {dialable && (
            <a
              href={`tel:${withPlus(dialable)}`}
              className="rounded-lg p-2 text-gray transition-colors hover:bg-white/[0.06] hover:text-light"
              title="Llamar"
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
        </div>
        {orders.length > 0 && (
          <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-0.5">
            {orders.map((order) => (
              <OrderChip key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3 py-4 md:px-6">
        {hasMore && (
          <div className="flex justify-center pb-2">
            <button
              onClick={loadOlder}
              disabled={loadingOlder}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.1] px-3 py-1.5 text-xs text-light/70 hover:bg-white/[0.05] disabled:opacity-50"
            >
              {loadingOlder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronUp className="h-3.5 w-3.5" />}
              Ver mensajes anteriores
            </button>
          </div>
        )}
        {messages.length === 0 && <p className="py-10 text-center text-sm text-gray">Este chat no tiene mensajes guardados.</p>}
        {messages.map((message, index) => {
          const newDay = index === 0 || dayKey(messages[index - 1].created_at) !== dayKey(message.created_at);
          return (
            <React.Fragment key={message.id}>
              {newDay && (
                <div className="flex justify-center py-2">
                  <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[0.68rem] first-letter:uppercase text-light/50">
                    {dayLabel(message.created_at)}
                  </span>
                </div>
              )}
              <Bubble message={message} />
            </React.Fragment>
          );
        })}
      </div>

      {/* Responder desde aquí no pasaría por la pausa humana ni por el agente:
          se responde donde siempre, en la app de WhatsApp Business. */}
      <div className="border-t border-white/[0.07] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-[0.72rem] text-light/40">
        Solo lectura. Para responder, usa WhatsApp Business
        {!contact.is_bsuid && (
          <>
            {' · '}
            <a
              href={`https://wa.me/${contact.phone}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-secondary hover:underline"
            >
              abrir chat <ExternalLink className="h-3 w-3" />
            </a>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Bandeja de chats de WhatsApp: lo que hablan los clientes con Frosty y con
 * el equipo, para admin y empleados.
 *
 * Solo lectura a propósito. Lo que se escribe desde la app de WhatsApp
 * Business es lo que el sistema reconoce como intervención humana (pausa al
 * agente); un mensaje mandado desde aquí se saltaría esa regla.
 */
const ConversationsPage = () => {
  const navigate = useNavigate();
  const { contactId } = useParams();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  // La búsqueda espera a que se deje de teclear: cada letra no es una consulta
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useConversations(search);
  const conversations = data?.results || [];

  const open = (id) => navigate(`/chats-whatsapp/${id}`);
  const back = () => navigate('/chats-whatsapp');

  return (
    <div className="fb-screen fb-screen--plain flex h-[100dvh] flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/[0.07] bg-dark/95">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3.5">
          <button
            onClick={() => navigate('/home')}
            className="rounded-lg p-2 text-gray transition-colors hover:bg-white/[0.06] hover:text-light"
            title="Volver al panel"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/[0.1] bg-white/[0.03]">
            <MessageCircle className="h-5 w-5 text-secondary" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-[0.95rem] font-semibold tracking-[0.12em] text-light">CHATS DE WHATSAPP</h1>
            <p className="truncate text-xs text-gray">Lo que hablan los clientes con Frosty y el equipo</p>
          </div>
          <Link
            to="/home"
            className="hidden rounded-lg p-2 text-gray transition-colors hover:bg-white/[0.06] hover:text-light sm:block"
            title="Panel"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-6xl flex-1">
        {/* Bandeja: en el celular se esconde cuando hay un chat abierto */}
        <aside
          className={`min-h-0 w-full min-w-0 flex-col border-white/[0.07] md:flex md:w-80 md:shrink-0 md:border-r lg:w-96 ${
            contactId ? 'hidden' : 'flex'
          }`}
        >
          <div className="p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-light/30" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o número"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] py-2.5 pl-9 pr-9 text-sm text-light placeholder:text-light/25 focus:border-secondary/40 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-light/40 hover:text-light"
                  title="Limpiar"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-secondary" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-gray">
                {search ? 'Ningún chat coincide con la búsqueda.' : 'Todavía no hay chats.'}
              </p>
            ) : (
              conversations.map((contact) => (
                <ConversationRow
                  key={contact.id}
                  contact={contact}
                  active={String(contact.id) === contactId}
                  onOpen={open}
                />
              ))
            )}
          </div>
        </aside>

        {/* Chat abierto */}
        <section className={`min-h-0 min-w-0 flex-1 flex-col ${contactId ? 'flex' : 'hidden md:flex'}`}>
          {contactId ? (
            <ChatThread key={contactId} contactId={contactId} onBack={back} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray">
              <MessageCircle className="h-8 w-8 text-light/20" />
              <p className="text-sm">Elige un chat para leerlo</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ConversationsPage;
