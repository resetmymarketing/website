'use client';

interface ConfirmationItem {
  label: string;
  value: string;
  formField: string;
}

interface IntakeConfirmationCardProps {
  items: ConfirmationItem[];
  onChangeItem: (formField: string) => void;
}

export function IntakeConfirmationCard({ items, onChangeItem }: IntakeConfirmationCardProps) {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-5">
      <p className="mb-4 text-sm font-semibold text-brand-800">
        Here is what you told me earlier -- does this still feel right?
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.formField} className="flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs font-medium uppercase tracking-wider text-warm-500">{item.label}</span>
              <p className="text-sm text-brand-800">{item.value || 'Not answered'}</p>
            </div>
            <button
              type="button"
              onClick={() => onChangeItem(item.formField)}
              className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              [change]
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
