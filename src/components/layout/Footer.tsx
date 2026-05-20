import { site } from '../../content/site';

export function Footer() {
  return (
    <footer className="footer">
      <p>{site.footer.text}</p>
    </footer>
  );
}
