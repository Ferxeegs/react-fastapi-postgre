import type { PricingRecommendation, PricingSimulationResult, Tax } from "../calculatorTypes";

export function PricingSection({
  error,
  setError,
  setMainPhase,
  selectedTaxes,
  onToggleTax,
  taxes,
  selectedHpp,
  pricingRecommended,
  simulatedGrossStr,
  setSimulatedGrossStr,
  pricingSimulation,
  onSaveSnapshot,
  submitting,
  saveNotice,
  formatCurrency,
}: {
  error: string | null;
  setError: (value: string | null) => void;
  setMainPhase: (phase: "costing" | "pricing") => void;
  selectedTaxes: number[];
  onToggleTax: (taxId: number) => void;
  taxes: Tax[];
  selectedHpp: number;
  pricingRecommended: PricingRecommendation;
  simulatedGrossStr: string;
  setSimulatedGrossStr: (value: string) => void;
  pricingSimulation: PricingSimulationResult;
  onSaveSnapshot: () => void;
  submitting: boolean;
  saveNotice: string | null;
  formatCurrency: (value: number) => string;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <button
        type="button"
        onClick={() => {
          setMainPhase("costing");
          setError(null);
        }}
        className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
      >
        ← Kembali ke analisa biaya
      </button>

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-800 dark:bg-error-950/40 dark:text-error-300">
          {error}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-lg shadow-brand-500/20">
        <div className="absolute -right-4 -top-4 opacity-10 blur-xl">
          <div className="h-40 w-40 rounded-full bg-white"></div>
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">HPP tahunan (basis)</p>
            <p className="mt-2 text-4xl font-black tracking-tight">{formatCurrency(selectedHpp)}</p>
            <p className="mt-2 text-xs text-white/90">Dasar perhitungan tarif bruto dan simulasi pajak.</p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm shadow-sm ring-1 ring-white/30">🏢</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Bagian A</p>
          <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Rekomendasi tarif sewa (bruto)</h2>
        </div>
        <div className="space-y-6 px-6 py-6">
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Langkah 1</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pilih pajak yang akan dikenakan</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {taxes.map((tx) => {
                const on = selectedTaxes.includes(tx.id);
                return (
                  <label
                    key={tx.id}
                    className={`flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-4 transition ${
                      on ? "border-brand-500 bg-brand-50/80 dark:bg-brand-900/25" : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1 rounded border-gray-300" checked={on} onChange={() => onToggleTax(tx.id)} />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{tx.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tarif {tx.rate}% · coverage {tx.coverage}%
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Langkah 2</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Rekomendasi harga jual (bruto)</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600 dark:text-gray-400">HPP tahunan basis</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedHpp)}</dd>
              </div>
              {pricingRecommended.coverageLines.map((line) => (
                <div key={line.id} className="flex justify-between gap-4">
                  <dt className="text-gray-600 dark:text-gray-400">
                    Coverage {line.name} ({line.coveragePct}%)
                  </dt>
                  <dd className="font-semibold text-brand-600">+{formatCurrency(line.amount)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 dark:border-gray-600">
                <dt className="font-semibold text-gray-900 dark:text-white">Tarif sewa (bruto)</dt>
                <dd className="text-lg font-bold text-brand-600">{formatCurrency(pricingRecommended.grossRecommended)}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-lg border border-blue-light-200 bg-blue-light-25 px-4 py-3 text-sm text-blue-light-800 dark:border-blue-light-800 dark:bg-blue-light-950/30 dark:text-blue-light-200">
              <span className="font-semibold">Saran pembulatan (ROUNDUP 1.000):</span> {formatCurrency(pricingRecommended.grossRounded)}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Bagian B</p>
          <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">Simulasi tarif</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Ubah tarif bruto untuk melihat dampak pajak dan tarif netto; sistem membandingkan netto dengan HPP tahunan basis.</p>
        </div>
        <div className="space-y-4 px-6 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Tarif bruto simulasi (Rp)</p>
              <input
                type="number"
                min={0}
                value={simulatedGrossStr}
                onChange={(e) => setSimulatedGrossStr(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-shadow dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-brand-500/20"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Gunakan nilai rekomendasi, pembulatan, atau nominal lain untuk uji coba.</p>
            </div>
            <button
              type="button"
              onClick={() => setSimulatedGrossStr(String(pricingRecommended.grossRounded))}
              className="h-11 shrink-0 rounded-lg border border-brand-200 bg-brand-50 px-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-300 dark:hover:bg-brand-900/60"
            >
              Gunakan rekomendasi
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Tarif bruto</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(pricingSimulation.gross)}</td>
                </tr>
                {pricingSimulation.taxes.map((t) => (
                  <tr key={t.name}>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {t.name}
                      <span className="mt-0.5 block text-xs text-gray-500">DPP = {formatCurrency(t.dpp)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-error-600 dark:text-error-400">−{formatCurrency(t.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">Tarif netto</td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-brand-600">{formatCurrency(pricingSimulation.netAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {!pricingSimulation.isFeasible && (
            <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800 dark:border-error-800 dark:bg-error-950/40 dark:text-error-200">
              <p className="font-semibold">Tarif kurang</p>
              <p className="mt-1">
                Netto ({formatCurrency(pricingSimulation.netAmount)}) &lt; HPP tahunan basis ({formatCurrency(selectedHpp)}). Selisih:{" "}
                {formatCurrency(Math.max(0, pricingSimulation.shortfall))}. Naikkan tarif bruto.
              </p>
            </div>
          )}
          {pricingSimulation.isFeasible && pricingSimulation.taxes.length > 0 && (
            <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-800 dark:bg-success-950/30 dark:text-success-200">
              Netto memenuhi atau melampaui HPP tahunan basis.
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onSaveSnapshot}
              disabled={submitting}
              className="rounded-lg border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 disabled:opacity-60 dark:text-brand-300"
            >
              Simpan snapshot (lokal)
            </button>
            {saveNotice && <p className="w-full text-xs text-blue-light-600">{saveNotice}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
