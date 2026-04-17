import { useEffect, useState } from "react";
import { Select } from "../../components/ui/Select";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { hppAPI } from "../../utils/api";
import { blurNormalizeDecimalDraft, blurNormalizeIntDraft, parseDecimalDraft, parseDigitsOnlyDraft, parseDraftToNumber } from "./numericFormDraft";

export default function HppSettings() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rentalVariables, setRentalVariables] = useState<any[]>([]);
  const [landValues, setLandValues] = useState<any[]>([]);
  const [buildingValues, setBuildingValues] = useState<any[]>([]);
  const [locationFactors, setLocationFactors] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [marginFee, setMarginFee] = useState<string>("10");
  const [rentVarDrafts, setRentVarDrafts] = useState<Record<string, string>>({});

  const [landForm, setLandForm] = useState<{
    code: string;
    sequence_no: string;
    land_location: string;
    street_name: string;
    estimated_price_per_m2: string;
  }>({
    code: "",
    sequence_no: "1",
    land_location: "",
    street_name: "",
    estimated_price_per_m2: "",
  });
  const [buildingForm, setBuildingForm] = useState<{
    code: string;
    sequence_no: string;
    building_location: string;
    building_category: "sederhana" | "tidak_sederhana";
    price_index_per_m2: string;
  }>({
    code: "",
    sequence_no: "1",
    building_location: "",
    building_category: "sederhana",
    price_index_per_m2: "",
  });
  const [locationForm, setLocationForm] = useState<{
    code: string;
    sequence_no: string;
    location_name: string;
    percentage: string;
  }>({
    code: "",
    sequence_no: "1",
    location_name: "",
    percentage: "100",
  });
  const [taxForm, setTaxForm] = useState<{
    code: string;
    sequence_no: string;
    tax_name: string;
    tax_rate_pct: string;
    coverage_pct: string;
  }>({
    code: "",
    sequence_no: "1",
    tax_name: "",
    tax_rate_pct: "",
    coverage_pct: "",
  });

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    const [
      rv,
      lv,
      bv,
      lf,
      tx,
      mg,
      sim,
    ] = await Promise.all([
      hppAPI.getAdminRentalVariables(),
      hppAPI.getAdminLandValues(),
      hppAPI.getAdminBuildingValues(),
      hppAPI.getAdminLocationFactors(),
      hppAPI.getAdminTaxes(),
      hppAPI.getAdminMarginFee(),
      hppAPI.getAdminSimulations(),
    ]);

    if (rv.success) setRentalVariables(rv.data || []);
    if (lv.success) setLandValues(lv.data || []);
    if (bv.success) setBuildingValues(bv.data || []);
    if (lf.success) setLocationFactors(lf.data || []);
    if (tx.success) setTaxes(tx.data || []);
    if (mg.success && mg.data) setMarginFee(String(Number(mg.data.percentage)));
    if (sim.success) setSimulations(sim.data || []);
    if (!rv.success || !lv.success || !bv.success) setError("Sebagian data gagal dimuat.");

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const v of rentalVariables) {
      next[v.code] = v.percentage == null || v.percentage === "" ? "" : String(Number(v.percentage));
    }
    setRentVarDrafts(next);
  }, [rentalVariables]);

  const setSuccess = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <>
      <PageMeta title="HPP Settings" description="Kelola master data kalkulator HPP" />
      <PageBreadcrumb pageTitle="HPP Settings" />
      <div className="space-y-6">
        {loading && <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">Memuat data...</div>}
        {error && <div className="rounded-xl border border-error-200 bg-error-50 p-4 text-error-700">{error}</div>}
        {message && <div className="rounded-xl border border-success-200 bg-success-50 p-4 text-success-700">{message}</div>}

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">Variabel Sewa (VT/VB)</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {rentalVariables.map((v) => (
              <div key={v.code} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <p className="text-sm font-semibold">{v.code} - {v.name}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={rentVarDrafts[v.code] ?? ""}
                    onChange={(e) => {
                      const next = parseDecimalDraft(e);
                      if (next === null) return;
                      setRentVarDrafts((d) => ({ ...d, [v.code]: next }));
                    }}
                    onBlur={async () => {
                      const draft = rentVarDrafts[v.code] ?? "";
                      const t = blurNormalizeDecimalDraft(draft);
                      setRentVarDrafts((d) => ({ ...d, [v.code]: t }));
                      const pct = parseDraftToNumber(t);
                      if (pct === null) {
                        setError("Nilai variabel tidak boleh kosong.");
                        return;
                      }
                      const res = await hppAPI.updateRentalVariable(v.code, { percentage: pct, is_active: true });
                      if (res.success) {
                        setSuccess(`Variabel ${v.code} diperbarui`);
                        loadAll();
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <CreateTableSection
          title="Nilai Wajar Tanah (WT)"
          form={
            <div className="grid gap-2 md:grid-cols-5">
              <input placeholder="Code" value={landForm.code} onChange={(e) => setLandForm({ ...landForm, code: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="No"
                autoComplete="off"
                value={landForm.sequence_no}
                onChange={(e) => {
                  const next = parseDigitsOnlyDraft(e);
                  if (next !== null) setLandForm({ ...landForm, sequence_no: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeIntDraft(landForm.sequence_no);
                  if (t !== landForm.sequence_no) setLandForm({ ...landForm, sequence_no: t || "1" });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
              <input placeholder="Lokasi Tanah" value={landForm.land_location} onChange={(e) => setLandForm({ ...landForm, land_location: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input placeholder="Nama Jalan" value={landForm.street_name} onChange={(e) => setLandForm({ ...landForm, street_name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Harga/m2"
                autoComplete="off"
                value={landForm.estimated_price_per_m2}
                onChange={(e) => {
                  const next = parseDigitsOnlyDraft(e);
                  if (next !== null) setLandForm({ ...landForm, estimated_price_per_m2: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeIntDraft(landForm.estimated_price_per_m2);
                  if (t !== landForm.estimated_price_per_m2) setLandForm({ ...landForm, estimated_price_per_m2: t });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
            </div>
          }
          onCreate={async () => {
            const res = await hppAPI.createAdminLandValue({
              ...landForm,
              estimated_price_per_m2: landForm.estimated_price_per_m2.trim() === "" ? 0 : Number(landForm.estimated_price_per_m2),
            });
            if (res.success) {
              setSuccess("WT ditambahkan");
              setLandForm({ code: "", sequence_no: "1", land_location: "", street_name: "", estimated_price_per_m2: "" });
              loadAll();
            } else setError(res.message);
          }}
          rows={landValues}
          columns={["code", "sequence_no", "land_location", "street_name", "estimated_price_per_m2"]}
        />

        <CreateTableSection
          title="Nilai Wajar Bangunan (WB)"
          form={
            <div className="grid gap-2 md:grid-cols-5">
              <input placeholder="Code" value={buildingForm.code} onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="No"
                autoComplete="off"
                value={buildingForm.sequence_no}
                onChange={(e) => {
                  const next = parseDigitsOnlyDraft(e);
                  if (next !== null) setBuildingForm({ ...buildingForm, sequence_no: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeIntDraft(buildingForm.sequence_no);
                  if (t !== buildingForm.sequence_no) setBuildingForm({ ...buildingForm, sequence_no: t || "1" });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
              <input placeholder="Lokasi Bangunan" value={buildingForm.building_location} onChange={(e) => setBuildingForm({ ...buildingForm, building_location: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <Select
                value={buildingForm.building_category}
                options={[
                  { value: "sederhana", label: "Sederhana" },
                  { value: "tidak_sederhana", label: "Tidak sederhana" },
                ]}
                onChange={(v) => setBuildingForm({ ...buildingForm, building_category: v })}
                className="col-span-1"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Indeks/m2"
                autoComplete="off"
                value={buildingForm.price_index_per_m2}
                onChange={(e) => {
                  const next = parseDigitsOnlyDraft(e);
                  if (next !== null) setBuildingForm({ ...buildingForm, price_index_per_m2: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeIntDraft(buildingForm.price_index_per_m2);
                  if (t !== buildingForm.price_index_per_m2) setBuildingForm({ ...buildingForm, price_index_per_m2: t });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
            </div>
          }
          onCreate={async () => {
            const res = await hppAPI.createAdminBuildingValue({
              ...buildingForm,
              price_index_per_m2: buildingForm.price_index_per_m2.trim() === "" ? 0 : Number(buildingForm.price_index_per_m2),
            });
            if (res.success) {
              setSuccess("WB ditambahkan");
              setBuildingForm({ code: "", sequence_no: "1", building_location: "", building_category: "sederhana", price_index_per_m2: "" });
              loadAll();
            } else setError(res.message);
          }}
          rows={buildingValues}
          columns={["code", "sequence_no", "building_location", "building_category", "price_index_per_m2"]}
        />

        <CreateTableSection
          title="Faktor Penyesuai Lokasi (FP2)"
          form={
            <div className="grid gap-2 md:grid-cols-4">
              <input placeholder="Code" value={locationForm.code} onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="No"
                autoComplete="off"
                value={locationForm.sequence_no}
                onChange={(e) => {
                  const next = parseDigitsOnlyDraft(e);
                  if (next !== null) setLocationForm({ ...locationForm, sequence_no: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeIntDraft(locationForm.sequence_no);
                  if (t !== locationForm.sequence_no) setLocationForm({ ...locationForm, sequence_no: t || "1" });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
              <input placeholder="Nama Lokasi" value={locationForm.location_name} onChange={(e) => setLocationForm({ ...locationForm, location_name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Besaran (%)"
                autoComplete="off"
                value={locationForm.percentage}
                onChange={(e) => {
                  const next = parseDecimalDraft(e);
                  if (next !== null) setLocationForm({ ...locationForm, percentage: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeDecimalDraft(locationForm.percentage);
                  if (t !== locationForm.percentage) setLocationForm({ ...locationForm, percentage: t });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
            </div>
          }
          onCreate={async () => {
            const res = await hppAPI.createAdminLocationFactor({
              ...locationForm,
              percentage: locationForm.percentage.trim() === "" ? 0 : Number(locationForm.percentage.replace(",", ".")),
            });
            if (res.success) {
              setSuccess("FP2 ditambahkan");
              setLocationForm({ code: "", sequence_no: "1", location_name: "", percentage: "100" });
              loadAll();
            } else setError(res.message);
          }}
          rows={locationFactors}
          columns={["code", "sequence_no", "location_name", "percentage"]}
        />

        <CreateTableSection
          title="Pajak & Coverage"
          form={
            <div className="grid gap-2 md:grid-cols-5">
              <input placeholder="Code" value={taxForm.code} onChange={(e) => setTaxForm({ ...taxForm, code: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="No"
                autoComplete="off"
                value={taxForm.sequence_no}
                onChange={(e) => {
                  const next = parseDigitsOnlyDraft(e);
                  if (next !== null) setTaxForm({ ...taxForm, sequence_no: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeIntDraft(taxForm.sequence_no);
                  if (t !== taxForm.sequence_no) setTaxForm({ ...taxForm, sequence_no: t || "1" });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
              <input placeholder="Jenis Pajak" value={taxForm.tax_name} onChange={(e) => setTaxForm({ ...taxForm, tax_name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Nilai Pajak (%)"
                autoComplete="off"
                value={taxForm.tax_rate_pct}
                onChange={(e) => {
                  const next = parseDecimalDraft(e);
                  if (next !== null) setTaxForm({ ...taxForm, tax_rate_pct: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeDecimalDraft(taxForm.tax_rate_pct);
                  if (t !== taxForm.tax_rate_pct) setTaxForm({ ...taxForm, tax_rate_pct: t });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Coverage (%)"
                autoComplete="off"
                value={taxForm.coverage_pct}
                onChange={(e) => {
                  const next = parseDecimalDraft(e);
                  if (next !== null) setTaxForm({ ...taxForm, coverage_pct: next });
                }}
                onBlur={() => {
                  const t = blurNormalizeDecimalDraft(taxForm.coverage_pct);
                  if (t !== taxForm.coverage_pct) setTaxForm({ ...taxForm, coverage_pct: t });
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
              />
            </div>
          }
          onCreate={async () => {
            const res = await hppAPI.createAdminTax({
              ...taxForm,
              tax_rate_pct: taxForm.tax_rate_pct.trim() === "" ? 0 : Number(taxForm.tax_rate_pct.replace(",", ".")),
              coverage_pct: taxForm.coverage_pct.trim() === "" ? 0 : Number(taxForm.coverage_pct.replace(",", ".")),
            });
            if (res.success) {
              setSuccess("Pajak ditambahkan");
              setTaxForm({ code: "", sequence_no: "1", tax_name: "", tax_rate_pct: "", coverage_pct: "" });
              loadAll();
            } else setError(res.message);
          }}
          rows={taxes}
          columns={["code", "sequence_no", "tax_name", "tax_rate_pct", "coverage_pct"]}
        />

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">Margin Fee</h3>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={marginFee}
              onChange={(e) => {
                const next = parseDecimalDraft(e);
                if (next !== null) setMarginFee(next);
              }}
              onBlur={() => {
                const t = blurNormalizeDecimalDraft(marginFee);
                if (t !== marginFee) setMarginFee(t);
              }}
              className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
            />
            <button
              onClick={async () => {
                const m = parseDraftToNumber(marginFee);
                if (m === null) {
                  setError("Isi margin fee dengan angka yang valid.");
                  return;
                }
                const res = await hppAPI.updateAdminMarginFee(m);
                if (res.success) {
                  setSuccess("Margin fee diperbarui");
                  loadAll();
                } else setError(res.message);
              }}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Simpan Margin
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">Riwayat Simulasi</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="px-2 py-2">Ref</th>
                  <th className="px-2 py-2">Mitra</th>
                  <th className="px-2 py-2">Periode</th>
                  <th className="px-2 py-2">HPP</th>
                  <th className="px-2 py-2">Netto</th>
                </tr>
              </thead>
              <tbody>
                {simulations.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-2 py-2">{s.reference_no}</td>
                    <td className="px-2 py-2">{s.partner_name}</td>
                    <td className="px-2 py-2">{s.selected_period_type}</td>
                    <td className="px-2 py-2">{Number(s.selected_hpp_amount).toLocaleString("id-ID")}</td>
                    <td className="px-2 py-2">{Number(s.net_amount || 0).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function CreateTableSection({
  title,
  form,
  onCreate,
  rows,
  columns,
}: {
  title: string;
  form: React.ReactNode;
  onCreate: () => void | Promise<void>;
  rows: any[];
  columns: string[];
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <div className="mt-3 space-y-3">
        {form}
        <button onClick={onCreate} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
          Tambah Data
        </button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              {columns.map((c) => (
                <th key={c} className="px-2 py-2">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                {columns.map((c) => (
                  <td key={c} className="px-2 py-2">{String(row[c] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
