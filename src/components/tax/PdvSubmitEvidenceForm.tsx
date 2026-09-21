'use client';

type Props = {
  busy: boolean;
  onSubmit: (submittedXml: File) => void;
};

export function PdvSubmitEvidenceForm({ busy, onSubmit }: Props) {
  return (
    <form
      className="tax-evidence-form"
      onSubmit={(event) => {
        event.preventDefault();
        const xmlInput = event.currentTarget.elements.namedItem('submitted_xml') as HTMLInputElement;
        const file = xmlInput.files?.[0];
        if (file) onSubmit(file);
      }}
    >
      <h2>Uvezi predani XML</h2>
      <p className="app-placeholder-note">
        XML obrasca skinut s ePorezne nakon predaje. Portal često vraća obrazac bez
        XML potpisa — to je u redu.
      </p>
      <label>
        Predani XML obrazac
        <input name="submitted_xml" type="file" accept=".xml,application/xml,text/xml" required />
      </label>
      <button type="submit" className="btn" disabled={busy}>
        {busy ? 'Uvoz…' : 'Uvezi XML'}
      </button>
    </form>
  );
}
