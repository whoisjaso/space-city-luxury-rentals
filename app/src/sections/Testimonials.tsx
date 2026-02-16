import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { Quote } from 'lucide-react';
import { testimonialsConfig } from '../config';

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const elements = content.querySelectorAll('.reveal-item');
    elements.forEach((el, i) => {
      gsap.set(el, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out',
          });
        },
      });
    });
  }, { scope: sectionRef });

  if (!testimonialsConfig.quote) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#1a0e2e] py-32 px-8 lg:px-16"
    >
      <div ref={contentRef} className="max-w-5xl mx-auto text-center">
        {/* Quote Icon */}
        <div className="reveal-item flex justify-center mb-12">
          <Quote className="w-16 h-16 text-[#D4AF37]/40" strokeWidth={1} />
        </div>

        {/* Quote Text */}
        <blockquote className="reveal-item museo-headline text-white text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-12">
          "{testimonialsConfig.quote}"
        </blockquote>

        {/* Author */}
        <div className="reveal-item flex flex-col md:flex-row items-center justify-center gap-6">
          {testimonialsConfig.authorImage && (
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20">
              <img
                src={testimonialsConfig.authorImage}
                alt={testimonialsConfig.authorName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="text-center md:text-left">
            <p className="museo-headline text-white text-lg">{testimonialsConfig.authorName}</p>
            <p className="museo-label text-[#D4AF37]/60">
              {testimonialsConfig.authorTitle}
            </p>
          </div>
        </div>

        {/* Decorative Line */}
        <div className="reveal-item mt-24 flex items-center justify-center">
          <div className="w-24 h-px bg-[#D4AF37]/30" />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
