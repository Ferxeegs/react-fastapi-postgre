import { ReactNode } from "react";

export function WizardStepper({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: readonly { id: number; title: string; subtitle: string }[];
}) {
  const pct = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 100;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {steps.map((s) => {
          const done = currentStep > s.id;
          const active = currentStep === s.id;
          return (
            <div key={s.id} className="flex min-w-0 items-start gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? "bg-brand-500 text-white"
                    : active
                      ? "bg-brand-100 text-brand-800 ring-2 ring-brand-500 dark:bg-brand-900/50 dark:text-brand-200"
                      : "border border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {done ? "✓" : s.id}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-tight ${active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>{s.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-500">{s.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm dark:border-gray-700 dark:bg-gray-800" />
    </div>
  );
}

export function SegmentButton({
  active,
  onClick,
  children,
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-12 rounded-lg border text-sm font-semibold transition ${
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

export function FooterStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
      <p className="text-[11px] uppercase text-gray-500">{label}</p>
      <p className={`mt-1 ${strong ? "text-lg font-bold text-brand-600" : "text-sm font-semibold text-gray-900 dark:text-white"}`}>{value}</p>
    </div>
  );
}
