import emailjs from '@emailjs/browser';
import { useRef, useState, type FormEvent } from 'react';
import { site } from '../../content/site';
import { ScrollReveal } from '../ui/ScrollReveal';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? '';

const platformLabel: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  email: 'Email',
};

export function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sending, setSending] = useState(false);
  const { contact } = site;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setStatus({ type: 'error', message: contact.form.errorConfig });
      return;
    }

    setSending(true);
    setStatus(null);

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, { publicKey: PUBLIC_KEY })
      .then(
        () => {
          setSending(false);
          setStatus({ type: 'success', message: contact.form.success });
          formRef.current?.reset();
        },
        (error: { text?: string }) => {
          setSending(false);
          setStatus({
            type: 'error',
            message: error.text ?? contact.form.errorGeneric,
          });
        },
      );
  };

  return (
    <section id="contact" className="section">
      <ScrollReveal>
        <h2 className="section__title">{contact.title}</h2>
      </ScrollReveal>
      <div className="contact-grid">
        <ScrollReveal className="card" delay={60}>
          <div className="contact-cards">
            {contact.cards.map((card) => (
              <a
                key={card.platform}
                className="contact-card"
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="contact-card__platform">{platformLabel[card.platform]}</span>
                <span className="contact-card__name">{card.name}</span>
              </a>
            ))}
          </div>
        </ScrollReveal>
        <ScrollReveal className="card" delay={120}>
          <form ref={formRef} className="contact-form" onSubmit={onSubmit}>
            <label className="contact-form__label">{contact.form.label}</label>
            <input
              type="text"
              name="from_name"
              placeholder={contact.form.namePlaceholder}
              required
              disabled={sending}
            />
            <input
              type="email"
              name="from_email"
              placeholder={contact.form.emailPlaceholder}
              required
              disabled={sending}
            />
            <textarea
              name="message"
              placeholder={contact.form.messagePlaceholder}
              rows={5}
              required
              disabled={sending}
            />
            <button type="submit" disabled={sending}>
              {sending ? contact.form.sending : contact.form.submit}
            </button>
            {status && (
              <p className={`contact-form__status contact-form__status--${status.type}`}>
                {status.message}
              </p>
            )}
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
}
