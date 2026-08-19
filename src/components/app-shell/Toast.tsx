export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="app-toast" role="status" data-testid="mock-toast">
      <p>{message}</p>
      <button type="button" className="app-toast-close" onClick={onDismiss} aria-label="Zatvori obavijest">
        Zatvori
      </button>
    </div>
  );
}
