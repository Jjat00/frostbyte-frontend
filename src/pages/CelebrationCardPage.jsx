import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, ImagePlus, Sparkles } from 'lucide-react';
import { useCartaPath } from '@/hooks';
import { env } from '@/config/env';
import '@/components/amor-amistad.css';

const DEFAULT_PHRASE = 'Lo mejor de la vida es compartirla contigo.';

export default function CelebrationCardPage() {
  const { cartaPath } = useCartaPath();
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [phrase, setPhrase] = useState(DEFAULT_PHRASE);
  const [writing, setWriting] = useState(false);
  const [phraseNotice, setPhraseNotice] = useState('');
  const form = useRef(null);
  const controller = useRef(null);
  const locked = useRef(false);
  useEffect(() => {
    if (!photo) { setPreview(''); return; }
    const url = URL.createObjectURL(photo); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  useEffect(() => {
    if (!result) { setResultUrl(''); return; }
    const url = URL.createObjectURL(result); setResultUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);
  useEffect(() => () => controller.current?.abort(), []);

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError('Elige una foto JPG, PNG o WebP de hasta 10 MB.'); event.target.value = ''; return;
    }
    setPhoto(file); setResult(null); setError(''); setNotice('');
  }
  // La frase que está en pantalla viaja como `avoid`: sin eso, pulsar otra vez
  // devuelve casi lo mismo y el botón parece roto.
  async function writePhrase() {
    if (writing) return;
    setWriting(true); setPhraseNotice('');
    const current = new FormData(form.current);
    try {
      const response = await fetch(`${env.API_BASE_URL}/motivational/celebration-card/phrase/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_name: current.get('to_name') || '',
          from_name: current.get('from_name') || '',
          avoid: phrase.slice(0, 240),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.phrase) {
        throw new Error(response.status === 429
          ? 'Ya pediste muchas frases por ahora. Escribe la tuya o vuelve más tarde.'
          : payload.error || 'No pudimos escribirla. Prueba de nuevo o escribe la tuya.');
      }
      setPhrase(payload.phrase);
      setPhraseNotice('Dedicatoria lista. Púlsalo otra vez para otra, o edítala a tu gusto.');
    } catch (e) { setPhraseNotice(e.message); }
    finally { setWriting(false); }
  }

  async function generate(event) {
    event.preventDefault();
    if (locked.current || !photo) return;
    locked.current = true; setBusy(true); setError(''); setNotice('');
    const data = new FormData(event.currentTarget); data.set('image', photo);
    controller.current = new AbortController();
    const timer = setTimeout(() => controller.current.abort(), 110000);
    try {
      const response = await fetch(`${env.API_BASE_URL}/motivational/celebration-card/`, {method: 'POST', body: data, signal: controller.current.signal});
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(response.status === 429 ? 'Ya se alcanzó el límite de tarjetas de esta conexión. Intenta más tarde.' : payload.error || Object.values(payload).flat().join(' ') || 'No pudimos crear la tarjeta. Intenta más tarde.');
      if (!['image/png','image/jpeg','image/webp'].includes(payload.mime_type) || !payload.image_base64) throw new Error('La respuesta no contiene una tarjeta. Intenta de nuevo.');
      const bytes = Uint8Array.from(atob(payload.image_base64), c => c.charCodeAt(0));
      const ext = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[payload.mime_type];
      setResult(new File([bytes], `amor-y-amistad-frostbyte.${ext}`, {type: payload.mime_type}));
      setNotice('Tu tarjeta está lista. Puedes descargarla o compartirla.');
    } catch (e) { setError(e.name === 'AbortError' ? 'La generación tardó demasiado. Espera un momento antes de reintentar.' : e.message); }
    finally { clearTimeout(timer); locked.current = false; setBusy(false); }
  }
  async function share() {
    setNotice('');
    if (!navigator.canShare?.({files: [result]})) { setNotice('Descarga la tarjeta y adjúntala en WhatsApp o en tu red favorita.'); return; }
    try { await navigator.share({files:[result], title:'Feliz Amor y Amistad'}); }
    catch (e) { if (e.name !== 'AbortError') setNotice('No se pudo compartir. Puedes descargar la tarjeta.'); }
  }
  return (
    <main className="theme-amor-amistad aa-card-page">
      <div className="aa-container">
        <Link to={cartaPath} className="aa-back"><ArrowLeft size={18} /> Volver a la carta</Link>
        <div className="aa-card-intro"><p className="aa-kicker">Un recuerdo para regalar</p>
          <h1>Su foto. <em>Tu dedicatoria.</em></h1>
          <p>Una tarjeta de Amor y Amistad con el estilo de Frostbyte y los colores de su ropa y accesorios.</p>
        </div>
        <div className="aa-card-workspace">
          <form ref={form} onSubmit={generate} className="aa-card-form">
            <fieldset disabled={busy}>
              <label htmlFor="card-photo">La foto que quieres regalar</label>
              <label className="aa-photo-upload" htmlFor="card-photo">
                {preview ? <img src={preview} alt="Foto de referencia seleccionada" /> : <><ImagePlus size={32} /><span>Selecciona una foto juntos o un retrato</span></>}
              </label>
              <input id="card-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} required={!photo} />
              <p className="aa-input-hint">JPG, PNG o WebP · Hasta 10 MB. Usa una foto que tengas permiso de compartir.</p>
              <div className="aa-card-names"><label>Para<input name="to_name" maxLength={60} placeholder="Su nombre (opcional)" /></label><label>De<input name="from_name" maxLength={60} placeholder="Tu nombre (opcional)" /></label></div>
              <div className="aa-phrase">
                <label htmlFor="card-phrase">Tu dedicatoria</label>
                <textarea id="card-phrase" name="phrase" maxLength={240} rows={3}
                  value={phrase} onChange={(e) => setPhrase(e.target.value)} />
                <button type="button" className="aa-phrase-write" onClick={writePhrase} disabled={writing}>
                  <Sparkles size={15} aria-hidden="true" />
                  {writing ? 'Escribiendo…' : 'Escríbela por mí'}
                </button>
                <p role="status" className="aa-input-hint">{phraseNotice}</p>
              </div>
              <p className="aa-input-hint">La foto se procesa fuera de Frostbyte solo para crear la tarjeta y no se guarda. Revisa el resultado antes de compartirlo.</p>
              <button className="aa-button aa-button--primary" type="submit" disabled={!photo || busy}>{busy ? 'Creando tu tarjeta…' : result ? 'Crear otra versión' : 'Crear mi tarjeta'}</button>
            </fieldset>
            <p role="status" className="aa-card-status">{busy ? 'Estamos combinando tu foto, los colores y la dedicatoria. Puede tardar hasta dos minutos si el primer intento no sale.' : notice}</p>
            {error && <p role="alert" className="aa-card-error">{error}</p>}
          </form>
          <section className="aa-card-result" aria-label="Tu tarjeta" aria-busy={busy}>
            {/* `result` manda: al elegir una foto nueva se limpia de inmediato,
                pero `resultUrl` (que depende de un efecto) tarda un render en
                seguirlo, y en ese render intermedio seguía apuntando a la
                tarjeta anterior. */}
            {result && resultUrl ? <><img src={resultUrl} alt="Tarjeta de Amor y Amistad generada con tu foto y dedicatoria" /><div className="aa-actions"><a className="aa-button aa-button--primary" href={resultUrl} download={result.name}><Download size={16} /> Descargar</a><button type="button" className="aa-button aa-button--secondary" onClick={share}><Share2 size={16} /> Compartir</button></div></>
              /* Antes había aquí una escena de copas y velas como «referencia de
                 estilo»: prometía una tarjeta que ya no se genera. La única
                 muestra honesta es la foto que acaba de elegir. */
              : preview ? <><img src={preview} alt="La foto que elegiste, tal como entrará en la tarjeta" /><p>Tu foto es la protagonista.<br />Los colores de la tarjeta saldrán de ella.</p></>
              : <div className="aa-card-empty"><p>Tu foto será la protagonista.<br />Los colores de la tarjeta saldrán de ella.</p></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
