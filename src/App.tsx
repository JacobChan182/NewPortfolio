import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LenisProvider } from './components/providers/LenisProvider';
import { ChanocasterBackground } from './components/three/ChanocasterBackground';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';
import { FunStuff } from './components/sections/FunStuff';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';

export default function App() {
  return (
    <LenisProvider>
      <ChanocasterBackground />
      <div className="app-shell">
        <Header />
        <main>
          <Hero />
          <About />
          <Projects />
          <FunStuff />
          <Contact />
        </main>
        <Footer />
      </div>
    </LenisProvider>
  );
}
