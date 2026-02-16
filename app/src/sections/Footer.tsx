import { ArrowUpRight, Instagram, Twitter, Facebook, Linkedin, Youtube, Globe } from 'lucide-react';
import { footerConfig } from '../config';

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Globe,
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  if (!footerConfig.brandName) return null;

  return (
    <footer className="relative w-full bg-[#0a0a12] overflow-hidden">
      {/* Marquee Section */}
      {footerConfig.marqueeText && (
        <div className="py-20 overflow-hidden border-t border-white/10">
          <div className="animate-marquee whitespace-nowrap flex">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="museo-headline text-white/10 text-[15vw] font-semibold tracking-tight mx-8"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
              >
                {footerConfig.marqueeText}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer Content */}
      <div className="px-8 lg:px-16 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <img src="/images/space-city-logo.png" alt="Space City Luxury Rentals" className="h-14 w-14 object-contain" style={{ background: 'transparent' }} />
                <h3 className="museo-headline text-white text-2xl">
                  {footerConfig.brandName}
                </h3>
              </div>
              <p className="museo-body text-white/60 text-sm max-w-sm mb-6">
                {footerConfig.brandDescription}
              </p>
              <div className="flex items-center gap-4">
                {footerConfig.socialLinks.map((link, i) => {
                  const IconComponent = socialIconMap[link.label] || Globe;
                  return (
                    <a
                      key={i}
                      href={link.href}
                      data-cursor="hover"
                      className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            {footerConfig.quickLinks.length > 0 && (
              <div>
                <h4 className="museo-label text-[#D4AF37]/70 mb-6">{footerConfig.quickLinksTitle}</h4>
                <ul className="space-y-3">
                  {footerConfig.quickLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        data-cursor="hover"
                        className="group museo-body text-white/70 text-sm hover:text-white transition-colors flex items-center gap-2"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact */}
            {footerConfig.contactItems.length > 0 && (
              <div>
                <h4 className="museo-label text-[#D4AF37]/70 mb-6">{footerConfig.contactTitle}</h4>
                <ul className="space-y-3">
                  {footerConfig.contactItems.map((item, i) => (
                    <li
                      key={i}
                      className="museo-body text-white/70 text-sm"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
            <p className="museo-body text-white/40 text-xs mb-4 md:mb-0">
              {currentYear} {footerConfig.brandName}. All rights reserved.
            </p>
            {footerConfig.bottomLinks.length > 0 && (
              <div className="flex items-center gap-6">
                {footerConfig.bottomLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    data-cursor="hover"
                    className="museo-body text-white/40 text-xs hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
