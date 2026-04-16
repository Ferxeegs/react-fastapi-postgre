import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { 
  TaskIcon, 
  DormitoryIcon, 
  BoxCubeIcon, 
  GroupIcon, 
  PaperPlaneIcon, 
  CalenderIcon, 
  TableIcon, 
  PieChartIcon 
} from "../../icons";

const menus = [
  { title: "Variabel Sewa (VT/VB)", icon: <TaskIcon />, path: "/hpp/settings/variables", desc: "Kelola persentase variabel sewa tanah & bangunan." },
  { title: "Nilai Wajar Tanah (WT)", icon: <DormitoryIcon />, path: "/hpp/settings/land-values", desc: "Kelola master nilai wajar tanah per lokasi/jalan." },
  { title: "Nilai Wajar Bangunan (WB)", icon: <BoxCubeIcon />, path: "/hpp/settings/building-values", desc: "Kelola master nilai wajar bangunan per kategori." },
  { title: "Entity Adjustment Factors", icon: <GroupIcon />, path: "/hpp/settings/entity-factors", desc: "Kelola faktor penyesuaian berdasarkan jenis entitas." },
  { title: "Faktor Lokasi (FP2)", icon: <PaperPlaneIcon />, path: "/hpp/settings/location-factors", desc: "Kelola faktor penyesuaian berdasarkan lokasi." },
  { title: "Period Adjustment Factors", icon: <CalenderIcon />, path: "/hpp/settings/period-factors", desc: "Kelola faktor penyesuaian berdasarkan durasi periode." },
  { title: "Payment Adjustment Factors", icon: <TableIcon />, path: "/hpp/settings/payment-factors", desc: "Kelola faktor penyesuaian berdasarkan skema pembayaran." },
  { title: "Pajak & Margin Fee", icon: <PieChartIcon />, path: "/hpp/settings/taxes-margin", desc: "Kelola pajak, coverage, dan margin fee default." },
];

export default function HppMasterIndex() {
  return (
    <>
      <PageMeta title="HPP Master Data" description="Menu master data HPP" />
      <PageBreadcrumb pageTitle="HPP Master Data" />
      <div className="grid gap-4 md:grid-cols-2">
        {menus.map((m) => (
          <Link
            key={m.path}
            to={m.path}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400">
              <div className="size-6">{m.icon}</div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 transition-colors">{m.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
