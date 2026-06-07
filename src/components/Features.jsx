import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Cpu, Zap, Shield, Sparkles } from 'lucide-react';
import { Mundial26Backdrop } from '@/components/mundial/Sistema26';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Features = () => {
  const sectionRef = useRef(null);

  const features = [
    {
      icon: Cpu,
      title: 'ENFRIAMIENTO CUÁNTICO',
      description: 'Tecnología de congelación avanzada para la consistencia perfecta en todo momento',
      color: 'primary',
    },
    {
      icon: Zap,
      title: 'ENERGÍA INSTANTÁNEA',
      description: 'Repleto de ingredientes naturales para despertar tu energía',
      color: 'secondary',
    },
    {
      icon: Shield,
      title: 'CALIDAD PREMIUM',
      description: 'Solo los mejores ingredientes llegan a nuestra dimensión digital',
      color: 'primary',
    },
    {
      icon: Sparkles,
      title: 'SABORES NEÓN',
      description: 'Combinaciones de sabores únicas que no encontrarás en ningún otro lugar',
      color: 'secondary',
    },
  ];

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;

    const gradientLine = section.querySelector('.features-gradient-line');
    const titleBlock = section.querySelector('.features-title-block');
    const title = section.querySelector('.features-title');
    const subtitle = section.querySelector('.features-subtitle');
    const cards = section.querySelectorAll('.feature-card');
    const icons = section.querySelectorAll('.feature-icon');

    // Gradient line expands from center with scrub
    if (gradientLine && titleBlock) {
      gsap.fromTo(gradientLine, { scaleX: 0 }, {
        scaleX: 1, transformOrigin: 'center center', ease: 'none',
        scrollTrigger: { trigger: titleBlock, start: 'top 85%', end: 'bottom 60%', scrub: 1 },
      });
    }

    // Title clips in left → right with scrub
    if (title && titleBlock) {
      gsap.fromTo(title, { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', ease: 'none',
        scrollTrigger: { trigger: titleBlock, start: 'top 80%', end: 'bottom 55%', scrub: 1.2 },
      });
    }

    // Subtitle fades in
    if (subtitle && titleBlock) {
      gsap.fromTo(subtitle, { autoAlpha: 0, y: 20 }, {
        autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: titleBlock, start: 'top 65%', toggleActions: 'play none none none' },
      });
    }

    // Feature cards: batch stagger with 3D entrance
    if (cards.length) {
      gsap.set(cards, { autoAlpha: 0, y: 80, scale: 0.8, rotationX: 15 });
      ScrollTrigger.batch(cards, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, {
            autoAlpha: 1, y: 0, scale: 1, rotationX: 0,
            duration: 0.75, ease: 'power3.out', stagger: 0.15, overwrite: true,
          });
        },
      });
    }

    // Icon circles: 360deg rotation with elastic ease
    if (icons.length) {
      ScrollTrigger.batch(icons, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(batch, { rotation: 0 }, {
            rotation: 360, duration: 1, ease: 'elastic.out(1, 0.5)',
            stagger: 0.15, delay: 0.3, overwrite: true,
          });
        },
      });
    }
  }, { scope: sectionRef });

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-20 bg-dark relative overflow-hidden"
    >
      {/* Capa decorativa Sistema 26 (afiche sutil + patron t26 + "26") */}
      <Mundial26Backdrop />

      {/* Gradient line — GSAP animates scaleX via .features-gradient-line */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="features-gradient-line absolute top-1/2 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Title block — targeted as a trigger anchor */}
        <div className="features-title-block text-center mb-16">
          <span className="inline-block text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gold font-bold mb-3">
            Edición Mundial 26
          </span>
          <h2 className="features-title text-4xl md:text-6xl font-black text-light mb-4">
            POR QUÉ <span className="text-gold">FROSTBYTE</span>
          </h2>
          <p className="features-subtitle text-gray text-lg max-w-2xl mx-auto">
            El lugar perfecto en Cumbal para pasar un buen rato con amigos o en
            familia. No solo servimos bebidas, ofrecemos una experiencia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            // feature-card: targeted by ScrollTrigger.batch for entry animation
            <div key={index} className="feature-card group">
              <div className="liquid-glass-interactive backdrop-blur-xl bg-white/[0.08] border border-white/[0.1] rounded-2xl p-8 h-full flex flex-col items-center text-center transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-gold/40 hover:bg-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(242,197,61,0.12)] hover:transform hover:scale-105">
                {/* feature-icon: targeted by ScrollTrigger.batch for rotation */}
                <div
                  className={`feature-icon w-20 h-20 bg-linear-to-br ${
                    feature.color === 'primary' ? 'from-grass to-gold' : 'from-gold to-grass'
                  } rounded-full flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300`}
                >
                  <feature.icon className="text-dark" size={40} />
                </div>

                <h3 className="text-xl font-bold text-light mb-3 tracking-wider">
                  {feature.title}
                </h3>

                <p className="text-gray leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
