type Phase = "costing" | "pricing";

export function CalculatorHeader({
  mainPhase,
  setMainPhase,
  partnerName,
  setError,
  setSimulatedGrossStr,
  roundedGross,
  embeddedAdmin,
  theme,
  toggleTheme,
}: {
  mainPhase: Phase;
  setMainPhase: (phase: Phase) => void;
  partnerName: string;
  setError: (value: string | null) => void;
  setSimulatedGrossStr: (value: string) => void;
  roundedGross: number;
  embeddedAdmin: boolean;
  theme: string;
  toggleTheme: () => void;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Kalkulator HPP sewa</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {mainPhase === "costing" ? "Analisa biaya (costing)" : "Analisa harga (pricing)"}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mainPhase === "costing"
              ? "Susun komponen biaya sewa hingga ringkasan HPP sebelum menentukan tarif dan pajak."
              : "Tentukan tarif sewa bruto berdasarkan HPP referensi dan struktur pajak yang dipilih; sesuaikan nominal bila perlu."}
          </p>
          <div className="mt-4 inline-flex rounded-xl border border-gray-200 p-1 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setMainPhase("costing")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mainPhase === "costing"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              Analisa biaya
            </button>
            <button
              type="button"
              onClick={() => {
                if (!partnerName.trim()) {
                  setError("Lengkapi nama penyewa di analisa biaya terlebih dahulu.");
                  setMainPhase("costing");
                  return;
                }
                setError(null);
                setSimulatedGrossStr(String(roundedGross));
                setMainPhase("pricing");
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mainPhase === "pricing"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              Analisa harga
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {!embeddedAdmin && (
            <>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200"
              >
                Mode {theme === "dark" ? "Terang" : "Gelap"}
              </button>
              <a href="/signin" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                Login admin
              </a>
            </>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-200 dark:bg-brand-900/20 dark:text-brand-300"
          >
            Cetak / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
