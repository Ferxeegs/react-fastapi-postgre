import { useState, useRef, useEffect } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  subLabel?: string;
}

interface SelectProps {
  label?: string;
  value: string | number | null;
  options: SelectOption[];
  onChange: (v: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = "Pilih opsi...",
  className = "",
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && <p className="mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-left shadow-theme-xs transition-all hover:border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:focus:ring-brand-500/20 ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      >
        <span className={`block truncate text-sm ${selectedOption ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-99999 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1.5 shadow-theme-lg backdrop-blur-md dark:border-gray-700 dark:bg-gray-950/95 animate-in fade-in zoom-in duration-200 origin-top">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-center text-sm text-gray-500">Tidak ada pilihan</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex w-full flex-col px-4 py-2.5 text-left transition-colors ${
                  opt.value === value
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
                {opt.subLabel && <span className="mt-0.5 text-[11px] opacity-70">{opt.subLabel}</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
