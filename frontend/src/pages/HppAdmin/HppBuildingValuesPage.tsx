import { useEffect, useState } from "react";
import { Select } from "../../components/ui/Select";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { hppAPI } from "../../utils/api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { blurNormalizeIntDraft, parseDigitsOnlyDraft } from "./numericFormDraft";
import { useAuth } from "../../context/AuthContext";

export default function HppBuildingValuesPage({ embedded = false }: { embedded?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const [form, setForm] = useState<{
    asset_location: string;
    category: string;
    /** Draft teks input angka (boleh kosong saat mengetik; diparse saat simpan). */
    rent_price_index: string;
  }>({
    asset_location: "",
    category: "sederhana",
    rent_price_index: "",
  });
  const { success, error: showError } = useToast();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("create_hpp_master");
  const canUpdate = hasPermission("update_hpp_master");
  const canDelete = hasPermission("delete_hpp_master");

  const load = async () => {
    const res = await hppAPI.getAdminBuildingValues();
    if (res.success) setRows(res.data || []);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ asset_location: "", category: "sederhana", rent_price_index: "" });
    setEditingId(null);
  };
  const filteredRows = rows.filter((item) =>
    `${item.asset_location} ${item.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {!embedded && <PageMeta title="Master WB" description="Kelola Nilai Wajar Bangunan" />}
      {!embedded && <PageBreadcrumb pageTitle="Nilai Wajar Bangunan (WB)" />}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari lokasi/kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 sm:h-11 rounded-lg border border-gray-200 bg-transparent py-2 pl-10 sm:pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-gray-500 dark:fill-gray-400 sm:left-4" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="currentColor" />
            </svg>
          </div>
          {canCreate && (
            <button
            onClick={() => {
              resetForm();
              openModal();
            }}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
          >
            <PlusIcon className="size-4" />
            Tambah WB
          </button>
          )}
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Total data: <span className="font-semibold text-gray-900 dark:text-white">{filteredRows.length}</span></p>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <TableHeader className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.02]">
                <TableRow>
                  {["No.", "Lokasi Aset", "Kategori", "Indeks Harga Sewa (Rp/m²)", "Aksi"].map((h) => (
                    <TableCell key={h} isHeader className="px-6 py-3.5 text-left text-[12px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">{h}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell className="px-6 py-8 text-center text-[13px] text-gray-500" colSpan={5}>
                      Belum ada data Nilai Wajar Bangunan.
                    </TableCell>
                  </TableRow>
                )}
                {filteredRows.map((r, index) => (
                  <TableRow key={r.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.01]">
                    <TableCell className="px-6 py-4 text-[13px] font-medium text-gray-900 whitespace-nowrap dark:text-white">{index + 1}</TableCell>
                    <TableCell className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-300">{r.asset_location}</TableCell>
                    <TableCell className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-300 capitalize">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                        {r.category.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-white">Rp {Number(r.rent_price_index).toLocaleString("id-ID")}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {canUpdate && (
                          <button 
                          className="flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:text-gray-500 dark:hover:bg-brand-500/10 dark:hover:text-brand-400" 
                          title="Edit"
                          onClick={() => {
                            setEditingId(r.id);
                            setForm({
                              asset_location: r.asset_location,
                              category: r.category,
                              rent_price_index:
                                r.rent_price_index == null || r.rent_price_index === ""
                                  ? ""
                                  : String(Number(r.rent_price_index)),
                            });
                            openModal();
                          }}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        )}
                        {canDelete && (
                          <button 
                          className="flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600 dark:text-gray-500 dark:hover:bg-error-500/10 dark:hover:text-error-400" 
                          title="Hapus"
                          onClick={async () => {
                            if (!window.confirm("Hapus data WB ini?")) return;
                            try {
                              await hppAPI.deleteAdminBuildingValue(r.id);
                              success("Nilai wajar bangunan berhasil dihapus!");
                              load();
                            } catch (err: any) {
                              showError(err.message || "Gagal menghapus nilai wajar bangunan.");
                            }
                          }}
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingId ? "Edit Nilai Wajar Bangunan" : "Tambah Nilai Wajar Bangunan"}
          </h3>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Lokasi Aset</label>
            <input placeholder="Contoh: Jakarta" value={form.asset_location} onChange={(e) => setForm({ ...form, asset_location: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Kategori</label>
            <Select
              value={form.category}
              options={[
                { value: "sederhana", label: "Sederhana" },
                { value: "tidak_sederhana", label: "Tidak sederhana" },
              ]}
              onChange={(v) => setForm({ ...form, category: v })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Indeks Harga Sewa</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Mis. 1500000"
              autoComplete="off"
              value={form.rent_price_index}
              onChange={(e) => {
                const next = parseDigitsOnlyDraft(e);
                if (next !== null) setForm({ ...form, rent_price_index: next });
              }}
              onBlur={() => {
                const t = blurNormalizeIntDraft(form.rent_price_index);
                if (t !== form.rent_price_index) setForm({ ...form, rent_price_index: t });
              }}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={() => { closeModal(); resetForm(); }} className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            Batal
          </button>
          <button 
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1" 
            onClick={async () => {
              try {
                const trimmed = form.rent_price_index.trim();
                if (trimmed === "") {
                  showError("Isi indeks harga sewa (Rp/m²).");
                  return;
                }
                const rent_price_index = Number(trimmed);
                if (!Number.isFinite(rent_price_index) || rent_price_index < 0) {
                  showError("Indeks harga sewa harus berupa angka yang valid.");
                  return;
                }
                const payload = {
                  asset_location: form.asset_location,
                  category: form.category,
                  rent_price_index,
                };
                if (editingId) {
                  await hppAPI.updateAdminBuildingValue(editingId, payload);
                  success("Nilai wajar bangunan berhasil diperbarui!");
                } else {
                  await hppAPI.createAdminBuildingValue(payload);
                  success("Nilai wajar bangunan berhasil ditambahkan!");
                }
                closeModal();
                resetForm();
                load();
              } catch (err: any) {
                showError(err.message || "Gagal menyimpan nilai wajar bangunan.");
              }
            }}
          >
            {editingId ? "Simpan Perubahan" : "Tambah WB"}
          </button>
        </div>
      </Modal>
    </>
  );
}
