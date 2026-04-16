import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import HppEntityFactorsPage from "./HppEntityFactorsPage";
import HppLocationFactorsPage from "./HppLocationFactorsPage";
import HppPeriodFactorsPage from "./HppPeriodFactorsPage";
import HppPaymentFactorsPage from "./HppPaymentFactorsPage";

type TabId = "fp1" | "fp2" | "fp3" | "fp4";

export default function HppAdjustmentFactorsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fp1");

  const tabs = useMemo(
    () => [
      { id: "fp1" as const, label: "FP1 Entitas Penyewa" },
      { id: "fp2" as const, label: "FP2 Lokasi Aset" },
      { id: "fp3" as const, label: "FP3 Periode Sewa" },
      { id: "fp4" as const, label: "FP4 Mekanisme Pembayaran" },
    ],
    []
  );

  return (
    <>
      <PageMeta title="Faktor Penyesuai HPP" description="Kelola faktor penyesuai FP1 sampai FP4 dalam satu halaman tab." />
      <PageBreadcrumb pageTitle="Faktor Penyesuai (FP1 - FP4)" />

      <div className="space-y-4">
        <div className="flex w-full overflow-x-auto rounded-xl border border-gray-200 bg-gray-50/50 p-1.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900/50 scrollbar-hide">
          <div className="flex w-full min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-brand-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-brand-300 dark:ring-gray-700"
                    : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "fp1" && <HppEntityFactorsPage embedded />}
        {activeTab === "fp2" && <HppLocationFactorsPage embedded />}
        {activeTab === "fp3" && <HppPeriodFactorsPage embedded />}
        {activeTab === "fp4" && <HppPaymentFactorsPage embedded />}
      </div>
    </>
  );
}
