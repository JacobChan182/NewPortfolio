import { site } from '../../content/site';
import { ScrollReveal } from '../ui/ScrollReveal';

export function FunStuff() {
  return (
    <section id="fun-stuff" className="section fun-stuff">
      <p className="fun-stuff__watermark" aria-hidden>{site.funStuff.watermark}</p>
      <ChanocasterSection />
      <ListeningSection />
      <TopSongsSection />
    </section>
  );
}

function ChanocasterSection() {
  const { chanocaster } = site;
  const parts = chanocaster.story.split(chanocaster.storyEmphasis);

  return (
    <div className="fun-block">
      <ScrollReveal><h2 className="section__title">{chanocaster.title}</h2></ScrollReveal>
      <ScrollReveal className="card" delay={60}>
        <ul className="chanocaster-specs">
          {chanocaster.specs.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </ScrollReveal>
      <ScrollReveal className="card" delay={180}>
        <p>
          {parts[0]}
          <em>{chanocaster.storyEmphasis}</em>
          {parts[1]}
        </p>
      </ScrollReveal>
      <div className="chanocaster-photos">
        {chanocaster.images.map((img, i) => (
          <ScrollReveal key={img.src} delay={i * 60}>
            <img src={img.src} alt={img.alt} loading="lazy" className="chanocaster-photo" />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

function ListeningSection() {
  return (
    <div className="fun-block">
      <ScrollReveal><h2 className="section__title">{site.listening.title}</h2></ScrollReveal>
      <div className="album-grid">
        {site.listening.albums.map((album, i) => (
          <ScrollReveal key={album.id} delay={(i % 5) * 40}>
            <a className="album" href={album.spotifyUrl} target="_blank" rel="noopener noreferrer" title={album.label}>
              <img src={album.imageUrl} alt={album.label} loading="lazy" />
            </a>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

function TopSongsSection() {
  return (
    <div className="fun-block">
      <ScrollReveal><h2 className="section__title">{site.topSongs.title}</h2></ScrollReveal>
      <ol className="track-list">
        {site.topSongs.tracks.map((track, i) => (
          <li key={track.id}>
            <ScrollReveal delay={i * 35}>
              <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">
                <span className="track-list__rank">{track.rank}</span>
                <img src={track.imageUrl} alt="" />
                <span className="track-list__meta">
                  <span className="track-list__title">{track.title}</span>
                  <span className="track-list__artist">{track.artist}</span>
                </span>
              </a>
            </ScrollReveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
