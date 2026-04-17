import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { hppAPI } from "../../utils/api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { blurNormalizeDecimalDraft, parseDecimalDraft } from "./numericFormDraft";
import { useAuth } from "../../context/AuthContext";

export default function HppTaxesMarginPage() {
  const [taxes, setTaxes] = useState<any[]>([]);
  const [marginFees, setMarginFees] = useState<any[]>([]);
  const [editingTaxId, setEditingTaxId] = useState<number | null>(null);
  const [editingMarginId, setEditingMarginId] = useState<number | null>(null);
  const [marginForm, setMarginForm] = useState<{ name: string; rate: string }>({ name: "", rate: "" });
  const [form, setForm] = useState<{ name: string; rate: string; coverage: string; description: string }>({
    name: "",
    rate: "",
    coverage: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const taxModal = useModal();
  const marginModal = useModal();
  const { success, error: showError } = useToast();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("create_hpp_master");
  const canUpdate = hasPermission("update_hpp_master");
  const canDelete = hasPermission("delete_hpp_master");
  const filteredTaxes = taxes.filter((item) =>
    `${item.name} ${item.description || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const load = async () => {
    const [tx, mgs] = await Promise.all([hppAPI.getAdminTaxes(), hppAPI.getAdminMarginFees()]);
    if (tx.success) setTaxes(tx.data || []);
    if (mgs.success) setMarginFees(mgs.data || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <>
      <PageMeta title="Tax & Margin HPP" description="Kelola pajak dan margin fee" />
      <PageBreadcrumb pageTitle="Pajak (Tax) & Margin Fee" />
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari nama pajak/deskripsi..."
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
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
              onClick={() => {
                setEditingTaxId(null);
                setForm({ name: "", rate: "", coverage: "", description: "" });
                taxModal.openModal();
              }}
            >
              <PlusIcon className="size-4" />
              Tambah Pajak
            </button>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Manajemen Margin Fee</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Atur margin default atau tambahkan varian margin fee sesuai kebutuhan bisnis.</p>
          {marginFees.length === 0 && (
            <div className="mt-3">
              <button
                className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                onClick={() => {
                  setEditingMarginId(null);
                  setMarginForm({ name: "", rate: "" });
                  marginModal.openModal();
                }}
              >
                <PlusIcon className="size-4" />
                Tambah Margin Baru
              </button>
            </div>
          )}
          <div className="mt-3 space-y-2">
            {marginFees.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                <span>{m.name} - {m.rate}</span>
                <div className="flex gap-1">
                  {canUpdate && (
                    <button
                      className="flex items-center justify-center rounded p-1.5 text-gray-500 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                      title="Edit"
                      onClick={() => {
                        setEditingMarginId(m.id);
                        setMarginForm({ name: m.name, rate: String(Number(m.rate)) });
                        marginModal.openModal();
                      }}
                    >
                      <PencilIcon className="size-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="flex items-center justify-center rounded p-1.5 text-gray-500 transition-colors hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                      title="Hapus"
                      onClick={async () => {
                        if (!window.confirm("Hapus margin fee ini?")) return;
                        try {
                          await hppAPI.deleteAdminMarginFee(m.id);
                          success("Margin fee berhasil dihapus!");
                          load();
                        } catch (err: any) {
                          showError(err.message || "Gagal menghapus margin fee.");
                        }
                      }}
                    >
                      <TrashBinIcon className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Manajemen Pajak</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Kelola parameter pajak yang dipakai saat proses kalkulasi HPP.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
            <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Total data: <span className="font-semibold text-gray-900 dark:text-white">{filteredTaxes.length}</span></p>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <TableHeader className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.02]">
                <TableRow>
                  {["No.", "Jenis Pajak", "Rate (%)", "Coverage (%)", "Deskripsi", "Aksi"].map((h) => (
                    <TableCell key={h} isHeader className="px-6 py-3.5 text-left text-[12px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">{h}</TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTaxes.length === 0 && (
                  <TableRow>
                    <TableCell className="px-6 py-8 text-center text-[13px] text-gray-500" colSpan={6}>
                      Belum ada data pajak.
                    </TableCell>
                  </TableRow>
                )}
                {filteredTaxes.map((t, index) => (
                  <TableRow key={t.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.01]">
                    <TableCell className="px-6 py-4 text-[13px] font-medium text-gray-900 whitespace-nowrap dark:text-white">{index + 1}</TableCell>
                    <TableCell className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-300">{t.name}</TableCell>
                    <TableCell className="px-6 py-4 text-[13px] font-medium text-gray-900 dark:text-white">{t.rate}%</TableCell>
                    <TableCell className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-300">{t.coverage}%</TableCell>
                    <TableCell className="px-6 py-4 text-[13px] text-gray-600 dark:text-gray-300 max-w-xs truncate" title={t.description}>{t.description || "-"}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          className="flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:text-gray-500 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
                          title="Edit"
                          onClick={() => {
                            setEditingTaxId(t.id);
                            setForm({
                              name: t.name,
                              rate: String(Number(t.rate)),
                              coverage: String(Number(t.coverage)),
                              description: t.description || "",
                            });
                            taxModal.openModal();
                          }}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          className="flex items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600 dark:text-gray-500 dark:hover:bg-error-500/10 dark:hover:text-error-400"
                          title="Hapus"
                          onClick={async () => {
                            if (!window.confirm("Hapus pajak ini?")) return;
                            try {
                              await hppAPI.deleteAdminTax(t.id);
                              success("Pajak berhasil dihapus!");
                              load();
                            } catch (err: any) {
                              showError(err.message || "Gagal menghapus pajak.");
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

      <Modal isOpen={taxModal.isOpen} onClose={taxModal.closeModal} className="max-w-[500px] p-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingTaxId ? "Edit Pajak" : "Tambah Pajak"}
          </h3>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Pajak</label>
            <input placeholder="Contoh: PPN" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Rate (%)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Mis. 11"
              autoComplete="off"
              value={form.rate}
              onChange={(e) => {
                const next = parseDecimalDraft(e);
                if (next !== null) setForm({ ...form, rate: next });
              }}
              onBlur={() => {
                const t = blurNormalizeDecimalDraft(form.rate);
                if (t !== form.rate) setForm({ ...form, rate: t });
              }}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Coverage (%)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Mis. 100"
              autoComplete="off"
              value={form.coverage}
              onChange={(e) => {
                const next = parseDecimalDraft(e);
                if (next !== null) setForm({ ...form, coverage: next });
              }}
              onBlur={() => {
                const t = blurNormalizeDecimalDraft(form.coverage);
                if (t !== form.coverage) setForm({ ...form, coverage: t });
              }}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi (Opsional)</label>
            <input placeholder="Keterangan singkat" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500" />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={taxModal.closeModal} className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            Batal
          </button>
          <button
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
            onClick={async () => {
              try {
                const rate = Number(form.rate.trim().replace(",", "."));
                const coverage = Number(form.coverage.trim().replace(",", "."));
                if (form.name.trim() === "") {
                  showError("Isi nama pajak.");
                  return;
                }
                if (form.rate.trim() === "" || !Number.isFinite(rate) || rate < 0) {
                  showError("Isi rate (%) dengan angka yang valid.");
                  return;
                }
                if (form.coverage.trim() === "" || !Number.isFinite(coverage) || coverage < 0) {
                  showError("Isi coverage (%) dengan angka yang valid.");
                  return;
                }
                const taxPayload = { name: form.name.trim(), rate, coverage, description: form.description };
                if (editingTaxId) {
                  await hppAPI.updateAdminTax(editingTaxId, taxPayload);
                  success("Akses pajak berhasil diperbarui!");
                } else {
                  await hppAPI.createAdminTax(taxPayload);
                  success("Akses pajak berhasil ditambahkan!");
                }
                taxModal.closeModal();
                setEditingTaxId(null);
                setForm({ name: "", rate: "", coverage: "", description: "" });
                load();
              } catch (err: any) {
                showError(err.message || "Gagal menyimpan pajak.");
              }
            }}
          >
            {editingTaxId ? "Simpan Perubahan" : "Tambah"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={marginModal.isOpen} onClose={marginModal.closeModal} className="max-w-[500px] p-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingMarginId ? "Edit Margin Fee" : "Tambah Margin Fee"}
          </h3>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Margin</label>
            <input placeholder="Contoh: Operasional" value={marginForm.name} onChange={(e) => setMarginForm({ ...marginForm, name: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Rate (%)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Mis. 10"
              autoComplete="off"
              value={marginForm.rate}
              onChange={(e) => {
                const next = parseDecimalDraft(e);
                if (next !== null) setMarginForm({ ...marginForm, rate: next });
              }}
              onBlur={() => {
                const t = blurNormalizeDecimalDraft(marginForm.rate);
                if (t !== marginForm.rate) setMarginForm({ ...marginForm, rate: t });
              }}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={marginModal.closeModal} className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            Batal
          </button>
          <button
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
            onClick={async () => {
              try {
                const mrate = Number(marginForm.rate.trim().replace(",", "."));
                if (marginForm.name.trim() === "") {
                  showError("Isi nama margin.");
                  return;
                }
                if (marginForm.rate.trim() === "" || !Number.isFinite(mrate) || mrate < 0) {
                  showError("Isi rate (%) dengan angka yang valid.");
                  return;
                }
                const marginPayload = { name: marginForm.name.trim(), rate: mrate };
                if (editingMarginId) {
                  await hppAPI.updateAdminMarginFeeById(editingMarginId, marginPayload);
                  success("Margin fee berhasil diperbarui!");
                } else {
                  await hppAPI.createAdminMarginFee(marginPayload);
                  success("Margin fee berhasil ditambahkan!");
                }
                marginModal.closeModal();
                setEditingMarginId(null);
                setMarginForm({ name: "", rate: "" });
                load();
              } catch (err: any) {
                showError(err.message || "Gagal menyimpan margin fee.");
              }
            }}
          >
            {editingMarginId ? "Simpan Perubahan" : "Tambah"}
          </button>
        </div>
      </Modal>
    </>
  );
}
