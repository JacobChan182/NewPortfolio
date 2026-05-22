import { useEffect, useState } from 'react';
import { site, type NavSectionId } from '../../content/site';
import { scrollToSection, useLenisInstance } from '../providers/LenisProvider';

function getScrollY(lenis: ReturnType<typeof useLenisInstance>) {
  return lenis?.scroll ?? window.scrollY;
}

export function Header() {
  const lenis = useLenisInstance();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<NavSectionId>('home');

  useEffect(() => {
    const onScroll = () => {
      const scrollY = getScrollY(lenis);
      setScrolled(scrollY > 20);

      const trigger = scrollY + 120;
      let current: NavSectionId = 'contact';
      for (const { id } of site.nav) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.offsetTop;
        const bottom = top + el.offsetHeight;
        if (trigger >= top && trigger < bottom) {
          current = id;
          break;
        }
      }
      setActive(current);
    };

    if (lenis) {
      lenis.on('scroll', onScroll);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      lenis?.off('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, [lenis]);

  const goTo = (id: NavSectionId) => {
    setOpen(false);
    scrollToSection(id, lenis);
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <button
        type="button"
        className="header__menu"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`header__nav ${open ? 'header__nav--open' : ''}`}>
        <ul>
          {site.nav.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                className={`header__link ${active === id ? 'header__link--active' : ''}`}
                onClick={() => goTo(id)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
