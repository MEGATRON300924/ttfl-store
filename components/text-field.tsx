export function TextField({
  label,
  value,
  onChange,
  type = "text",
  optional = false,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  optional?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-graphite-700">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-graphite-400">
            (optional)
          </span>
        )}
      </span>

      <input
        type={type}
        required={!optional}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[7px] border border-graphite-200 px-3 py-2.5 text-sm outline-none focus:border-ember-600"
      />

      {hint && (
        <span className="text-xs text-graphite-400">
          {hint}
        </span>
      )}
    </label>
  );
}
