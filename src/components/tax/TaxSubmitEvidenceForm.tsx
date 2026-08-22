'use client';

type Props = {
  busy: boolean;
  onSubmit: (eporeznaIdentifier: string, submittedAtIso: string) => void;
};

export function TaxSubmitEvidenceForm({ busy, onSubmit }: Props) {
  return (
    <form
      className="tax-evidence-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const identifier = String(data.get('eporezna_identifier') || '').trim();
        const local = String(data.get('submitted_at') || '');
        const submitted = new Date(local);
        if (!identifier || Number.isNaN(submitted.getTime())) return;
        onSubmit(identifier, submitted.toISOString());
      }}
    >
      <h2>Označi predano</h2>
      <p className="app-placeholder-note">
        Predaja na ePoreznu ostaje ručna. Ovdje se bilježi portal UUID i vrijeme, bez datoteke.
      </p>
      <label>
        ePorezna UUID
        <input name="eporezna_identifier" required placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
      </label>
      <label>
        Vrijeme predaje
        <input name="submitted_at" type="datetime-local" required />
      </label>
      <button type="submit" className="btn" disabled={busy}>
        {busy ? 'Zapisivanje…' : 'Označi predano'}
      </button>
    </form>
  );
}
