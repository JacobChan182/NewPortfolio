import { Header } from './components/layout/Header';
import { HeaderVisibilityProvider } from './components/layout/HeaderVisibilityContext';
import { HeroReveal } from './components/layout/HeroReveal';
import { HeroRevealProvider } from './components/layout/HeroRevealContext';
import { Footer } from './components/layout/Footer';
import { LenisProvider } from './components/providers/LenisProvider';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { Hero } from './components/sections/Hero';
import { MaillardMap } from './components/sections/MaillardMap';

export default function App() {
  return (
    <LenisProvider>
      <HeroRevealProvider>
        <HeaderVisibilityProvider>
          <div className="app-shell">
            <Header />
            <main className="main">
              <HeroReveal>
                <Hero />
              </HeroReveal>
              <div className="site-content">
                <About />
                <MaillardMap />
                <Contact />
              </div>
            </main>
            <Footer />
          </div>
        </HeaderVisibilityProvider>
      </HeroRevealProvider>
    </LenisProvider>
  );
}
