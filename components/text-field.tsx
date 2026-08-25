export function TextField({
  label,
  value,
  onChange,
  type = "text",
  optional,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-graphite-700">{label}</span>
      <input
        type={type}
        required={!optional}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[7px] border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600"
      />
      {hint && <span className="text-xs text-graphite-400">{hint}</span>}
    </label>
  );
}
