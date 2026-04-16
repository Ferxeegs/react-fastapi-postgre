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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
        {steps.map((s) => {
          const done = currentStep > s.id;
          const active = currentStep === s.id;
          return (
            <div key={s.id} className="relative flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  done
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : active
                      ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500 shadow-sm dark:bg-brand-900/50 dark:text-brand-200"
                      : "border border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-500"
                }`}
              >
                {done ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.id
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold leading-tight tracking-tight ${active ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{s.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-gray-400 dark:text-gray-500">{s.subtitle}</p>
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
      <p className="mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-shadow dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-brand-500/20" 
      />
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
      className={`h-11 rounded-lg text-sm font-semibold transition-all ${
        active
          ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-500 shadow-sm dark:bg-brand-500/20 dark:text-brand-300"
          : "border border-gray-200 bg-white text-gray-700 shadow-theme-xs hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800/80"
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
