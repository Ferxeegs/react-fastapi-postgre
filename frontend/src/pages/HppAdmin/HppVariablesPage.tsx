import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { hppAPI } from "../../utils/api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon, PlusIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { blurNormalizeDecimalDraft, parseDecimalDraft } from "./numericFormDraft";

export default function HppVariablesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<{ name: string; value: string }>({ name: "", value: "" });
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const { success, error: showError } = useToast();

  const filteredRows = rows.filter((item) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ name: "", value: "" });
    setEditingId(null);
  };

  const load = async () => {
    const res = await hppAPI.getAdminRentalVariables();
    if (res.success) setRows(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <PageMeta title="Variabel Sewa HPP" description="Kelola VT dan VB" />
      <PageBreadcrumb pageTitle="Variabel Sewa (VT/VB)" />
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari variabel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 sm:h-11 rounded-lg border border-gray-200 bg-transparent py-2 pl-10 sm:pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 fill-gray-500 dark:fill-gray-400 sm:left-4" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill="currentColor" />
            </svg>
          </div>
          <button
            onClick={() => {
              resetForm();
              openModal();
            }}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
          >
            <PlusIcon className="size-4" />
            Tambah Variabel
          </button>
        </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
          <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Total data: <span className="font-semibold text-gray-900 dark:text-white">{filteredRows.length}</span></p>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full text-left border-collapse">
            <TableHeader className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.02]">
              <TableRow>
                <TableCell isHeader className="px-6 py-3.5 text-left text-[12px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400 w-[80px]">No.</TableCell>
                <TableCell isHeader className="px-6 py-3.5 text-left text-[12px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Nama</TableCell>
                <TableCell isHeader className="px-6 py-3.5 text-left text-[12px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400 w-[220px]">Nilai</TableCell>
                <TableCell isHeader className="px-6 py-3.5 text-left text-[12px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400 w-[160px]">Aksi</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell className="px-6 py-8 text-center text-[13px] text-gray-500" colSpan={4}>
                    Belum ada data variabel sewa.
                  </TableCell>
                </TableRow>
              )}
              {filteredRows.map((r, index) => (
                <TableRow key={r.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.01]">
                  <TableCell className="px-6 py-4 text-[13px] font-medium text-gray-900 whitespace-nowrap dark:text-white">{index + 1}</TableCell>
                  <TableCell className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-300">{r.name}</TableCell>
                  <TableCell className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-white">{Number(r.value).toLocaleString("id-ID")}</TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        className="flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:text-gray-500 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                        title="Edit"
                        onClick={() => {
                          setEditingId(r.id);
                          setForm({
                            name: r.name,
                            value: r.value == null || r.value === "" ? "" : String(Number(r.value)),
                          });
                          openModal();
                        }}
                      >
                        <PencilIcon className="size-4" />
                      </button>
                      <button
                        className="flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600 dark:text-gray-500 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                        title="Hapus"
                        onClick={async () => {
                          if (!window.confirm("Hapus variabel ini?")) return;
                          try {
                            await hppAPI.deleteRentalVariable(r.id);
                            success("Variabel berhasil dihapus!");
                            load();
                          } catch (err: any) {
                            showError(err.message || "Gagal menghapus variabel");
                          }
                        }}
                      >
                        <TrashBinIcon className="size-4" />
                      </button>
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
            {editingId ? "Edit Variabel" : "Tambah Variabel"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Isi nama variabel dan nilai yang akan digunakan untuk kalkulasi HPP.
          </p>
        </div>
        
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Variabel
            </label>
            <input
              placeholder="Contoh: VT"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nilai
            </label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Mis. 0.05"
              autoComplete="off"
              value={form.value}
              onChange={(e) => {
                const next = parseDecimalDraft(e);
                if (next !== null) setForm({ ...form, value: next });
              }}
              onBlur={() => {
                const t = blurNormalizeDecimalDraft(form.value);
                if (t !== form.value) setForm({ ...form, value: t });
              }}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            onClick={() => { closeModal(); resetForm(); }} 
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Batal
          </button>
          <button
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
            onClick={async () => {
              try {
                const trimmed = form.value.trim();
                if (trimmed === "") {
                  showError("Isi nilai variabel.");
                  return;
                }
                const value = Number(trimmed.replace(",", "."));
                if (!Number.isFinite(value)) {
                  showError("Nilai harus berupa angka yang valid.");
                  return;
                }
                const payload = { name: form.name, value };
                if (editingId) {
                  await hppAPI.updateRentalVariable(editingId, payload);
                  success("Variabel berhasil diperbarui!");
                } else {
                  await hppAPI.createRentalVariable(payload);
                  success("Variabel berhasil ditambahkan!");
                }
                closeModal();
                resetForm();
                load();
              } catch (err: any) {
                showError(err.message || "Terjadi kesalahan saat menyimpan data");
              }
            }}
          >
            {editingId ? "Simpan Perubahan" : "Tambah Variabel"}
          </button>
        </div>
      </Modal>
    </>
  );
}
