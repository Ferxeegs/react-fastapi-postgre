import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { userAPI } from "../../utils/api";
import { GroupIcon, UserIcon } from "../../icons";

export default function Home() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await userAPI.getAllUsers({ page: 1, limit: 1 });
        if (response.success && response.data?.pagination) {
          setUserCount(response.data.pagination.total);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <>
      <PageMeta
        title="Dashboard | Boilerplate App"
        description="Generic dashboard boilerplate with user management."
      />

      <div className="p-4 sm:p-6 text-gray-900 dark:text-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Selamat Datang!
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Ini adalah dashboard sistem manajemen Anda. Mulailah mengelola data dan pengguna dari sini.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <UserIcon className="size-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pengguna</h3>
              <p className="mt-1 text-2xl font-bold">
                {loading ? "..." : userCount ?? 0}
              </p>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <GroupIcon className="size-6" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status Sistem</h3>
              <p className="mt-1 text-2xl font-bold text-green-500">Aktif</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
