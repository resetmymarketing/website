'use client';

interface LinkTableRow {
  label: string;
  fieldKey: string;
  placeholder: string;
}

interface IntakeLinkTableProps {
  title: string;
  rows: LinkTableRow[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function IntakeLinkTable({ title, rows, values, onChange }: IntakeLinkTableProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-brand-800">
        {title}
      </label>
      <div className="overflow-hidden rounded-lg border border-brand-200">
        {rows.map((row, i) => (
          <div
            key={row.fieldKey}
            className={`flex items-center ${i > 0 ? 'border-t border-brand-200' : ''}`}
          >
            <span className="w-36 shrink-0 bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800 sm:w-44">
              {row.label}
            </span>
            <input
              type="text"
              value={values[row.fieldKey] || ''}
              onChange={(e) => onChange(row.fieldKey, e.target.value)}
              placeholder={row.placeholder}
              maxLength={500}
              className="min-w-0 flex-1 border-l border-brand-200 bg-white px-3 py-2.5 text-sm text-brand-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sage-500/20"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
