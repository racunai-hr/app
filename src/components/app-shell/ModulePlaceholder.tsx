export function ModulePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="app-placeholder">
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="app-placeholder-note">
        Ova ruta postoji u sučelju, ali backend još nije spojen. Radnje ovdje ne mijenjaju poslovne
        knjige.
      </p>
    </div>
  );
}
