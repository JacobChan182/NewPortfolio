import { Header } from './components/layout/Header';
import { HeroReveal } from './components/layout/HeroReveal';
import { Footer } from './components/layout/Footer';
import { LenisProvider } from './components/providers/LenisProvider';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { FunStuff } from './components/sections/FunStuff';
import { Hero } from './components/sections/Hero';
import { MaillardMap } from './components/sections/MaillardMap';

export default function App() {
  return (
    <LenisProvider>
      <div className="app-shell">
        <Header />
        <main className="main">
          <HeroReveal>
            <Hero />
          </HeroReveal>
          <div className="site-content">
            <About />
            <MaillardMap />
            <FunStuff />
            <Contact />
          </div>
        </main>
        <Footer />
      </div>
    </LenisProvider>
  );
}
