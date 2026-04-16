import { useMemo, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import HppLandValuesPage from "./HppLandValuesPage";
import HppBuildingValuesPage from "./HppBuildingValuesPage";

type TabId = "wt" | "wb";

export default function HppFairValuesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("wt");

  const tabs = useMemo(
    () => [
      { id: "wt" as const, label: "Nilai Wajar Tanah (WT)" },
      { id: "wb" as const, label: "Nilai Wajar Bangunan (WB)" },
    ],
    []
  );

  return (
    <>
      <PageMeta title="Nilai Wajar Aset HPP" description="Kelola Nilai Wajar Tanah (WT) dan Nilai Wajar Bangunan (WB) dalam satu halaman tab." />
      <PageBreadcrumb pageTitle="Nilai Wajar Aset (WT & WB)" />

      <div className="space-y-4">
        <div className="flex w-full overflow-x-auto rounded-xl border border-gray-200 bg-gray-50/50 p-1.5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex w-full gap-1">
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

        {activeTab === "wt" && <HppLandValuesPage embedded />}
        {activeTab === "wb" && <HppBuildingValuesPage embedded />}
      </div>
    </>
  );
}
