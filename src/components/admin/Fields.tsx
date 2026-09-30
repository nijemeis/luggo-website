/** Inputs for saveContentForm: the name carries a type prefix and the content path. */
export function Text({ name, label, value, rows, placeholder, help }: { name: string; label: string; value: string; rows?: number; placeholder?: string; help?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {rows ? <textarea className="textarea" name={`s:${name}`} rows={rows} defaultValue={value} placeholder={placeholder} /> : <input className="input input-sm" name={`s:${name}`} defaultValue={value} placeholder={placeholder} />}
      {help && <span className="help">{help}</span>}
    </label>
  );
}

export function Num({ name, label, value }: { name: string; label: string; value: number }) {
  return <label className="field"><span>{label}</span><input className="input input-sm" type="number" name={`n:${name}`} defaultValue={value} /></label>;
}

export function Bool({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="check-row">
      <input type="hidden" name={`b:${name}`} value="false" />
      <input type="checkbox" name={`b:${name}`} defaultChecked={checked} />
      <span>{label}</span>
    </label>
  );
}
