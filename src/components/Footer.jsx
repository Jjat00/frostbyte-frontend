import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, MapPin, MessageCircle } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Icono de TikTok personalizado
const TikTokIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const Footer = () => {
  const footerRef = useRef(null);

  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/frostbyte.col/",
      label: "Instagram",
    },
    {
      icon: TikTokIcon,
      href: "https://www.tiktok.com/@frostbyte.col",
      label: "TikTok",
    },
  ];

  useGSAP(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const line = footer.querySelector(".footer-line");
    const cols = footer.querySelectorAll(".footer-col");
    const socialIcons = footer.querySelectorAll(".footer-social-icon");
    const bottom = footer.querySelector(".footer-bottom");

    // 1. Top border line: expands from center
    if (line) {
      gsap.fromTo(line, { scaleX: 0, transformOrigin: "center" }, {
        scaleX: 1, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: footer, start: "top 90%", toggleActions: "play none none none" },
      });
    }

    // 2. Footer columns: batch fade-in
    if (cols.length) {
      gsap.set(cols, { opacity: 0, y: 40 });
      ScrollTrigger.batch(cols, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.15,
        }),
      });
    }

    // 3. Social icons: elastic bounce
    if (socialIcons.length) {
      gsap.fromTo(socialIcons, { opacity: 0, scale: 0, y: 20 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.8,
        ease: "elastic.out(1, 0.5)", stagger: 0.15, delay: 0.5,
        scrollTrigger: { trigger: socialIcons[0], start: "top 88%", toggleActions: "play none none none" },
      });
    }

    // 4. Bottom section fade
    if (bottom) {
      gsap.fromTo(bottom, { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.75,
        scrollTrigger: { trigger: bottom, start: "top 95%", toggleActions: "play none none none" },
      });
    }
  }, { scope: footerRef });

  return (
    <footer ref={footerRef} className="py-12 border-t border-white/[0.06]" style={{ background: "linear-gradient(to bottom, rgba(13,13,26,0.98), rgba(8,8,16,1))" }}>
      {/* Top border line animates scaleX from 0 to 1 */}
      <div className="footer-line h-px bg-gray/20 origin-center" />

      <div className="container mx-auto px-4 pt-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - Brand */}
          <div className="footer-col">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-dark">F</span>
              </div>
              <span className="text-2xl font-bold text-light tracking-wider">
                FROSTBYTE
              </span>
            </div>
            <p className="text-gray leading-relaxed">
              Bebidas heladas en Cumbal, Nariño. Granizados, frappés,
              cocteles, shots, micheladas y el famoso Desguayabator. El mejor
              lugar para pasar con amigos en Cumbal.
            </p>
          </div>

          {/* Column 2 - Quick links */}
          <div className="footer-col">
            <span className="text-light font-bold text-lg mb-4 block">
              Enlaces Rápidos
            </span>
            <nav className="space-y-2">
              <a
                href="#products"
                className="block text-gray hover:text-primary transition-colors duration-300"
              >
                Productos
              </a>
              <a
                href="#features"
                className="block text-gray hover:text-primary transition-colors duration-300"
              >
                Características
              </a>
              <a
                href="#gallery"
                className="block text-gray hover:text-primary transition-colors duration-300"
              >
                Galería
              </a>
              <a
                href="https://wa.me/573164277879"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray hover:text-green-400 transition-colors duration-300"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </nav>
          </div>

          {/* Column 3 - Social */}
          <div className="footer-col">
            <span className="text-light font-bold text-lg mb-4 block">
              Síguenos
            </span>
            <p className="text-gray mb-4">
              Síguenos en redes para promociones de bebidas heladas en Cumbal
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="footer-social-icon w-10 h-10 backdrop-blur-sm bg-white/[0.09] border border-white/[0.1] rounded-lg flex items-center justify-center text-gray hover:text-primary hover:border-primary/50 transition-all duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 4 - Location */}
          <div className="footer-col">
            <span className="text-light font-bold text-lg mb-4 block">
              Ubicación
            </span>
            <div className="flex items-start gap-3 text-gray" itemScope itemType="https://schema.org/PostalAddress">
              <MapPin className="text-primary mt-1 flex-shrink-0" size={20} />
              <div>
                <p className="leading-relaxed">
                  <span itemProp="streetAddress">Cra. 8 #18-13</span>
                  <br />
                  <span itemProp="addressLocality">Cumbal</span>, <span itemProp="addressRegion">Nariño</span>
                  <br />
                  <span itemProp="addressCountry">Colombia</span>
                </p>
                <a
                  href="https://www.google.com/maps/place/Frostbyte/@0.9083283,-77.7931126,800m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e295de01695b4bb:0x5a702a162899374d!8m2!3d0.9083229!4d-77.7905377!16s%2Fg%2F11mm01x7jq?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-primary hover:text-secondary transition-colors duration-300 text-sm font-semibold"
                >
                  Ver en Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="footer-bottom">
          <div className="border-t border-gray/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray text-sm">
                © 2026 Frostbyte Cumbal. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-gray hover:text-primary transition-colors duration-300 text-sm"
                >
                  Política de Privacidad
                </a>
                <a
                  href="#"
                  className="text-gray hover:text-primary transition-colors duration-300 text-sm"
                >
                  Términos de Servicio
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray/20 pt-4 mt-4 text-center">
            <p className="text-gray text-sm">
              Hecho por{" "}
              <a
                href="https://www.instagram.com/jaimejjat/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-secondary transition-colors duration-300 font-semibold"
              >
                Jaime Jjat
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
