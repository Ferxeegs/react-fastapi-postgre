import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { hppAPI } from "../../utils/api";

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
  const [marginFee, setMarginFee] = useState<number>(10);

  const [landForm, setLandForm] = useState({
    code: "",
    sequence_no: 1,
    land_location: "",
    street_name: "",
    estimated_price_per_m2: 0,
  });
  const [buildingForm, setBuildingForm] = useState({
    code: "",
    sequence_no: 1,
    building_location: "",
    building_category: "sederhana" as "sederhana" | "tidak_sederhana",
    price_index_per_m2: 0,
  });
  const [locationForm, setLocationForm] = useState({
    code: "",
    sequence_no: 1,
    location_name: "",
    percentage: 100,
  });
  const [taxForm, setTaxForm] = useState({
    code: "",
    sequence_no: 1,
    tax_name: "",
    tax_rate_pct: 0,
    coverage_pct: 0,
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
    if (mg.success && mg.data) setMarginFee(Number(mg.data.percentage));
    if (sim.success) setSimulations(sim.data || []);
    if (!rv.success || !lv.success || !bv.success) setError("Sebagian data gagal dimuat.");

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

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
                    type="number"
                    defaultValue={v.percentage}
                    onBlur={async (e) => {
                      const pct = Number(e.target.value);
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
              <input type="number" placeholder="No" value={landForm.sequence_no} onChange={(e) => setLandForm({ ...landForm, sequence_no: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input placeholder="Lokasi Tanah" value={landForm.land_location} onChange={(e) => setLandForm({ ...landForm, land_location: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input placeholder="Nama Jalan" value={landForm.street_name} onChange={(e) => setLandForm({ ...landForm, street_name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input type="number" placeholder="Harga/m2" value={landForm.estimated_price_per_m2} onChange={(e) => setLandForm({ ...landForm, estimated_price_per_m2: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
            </div>
          }
          onCreate={async () => {
            const res = await hppAPI.createAdminLandValue(landForm);
            if (res.success) {
              setSuccess("WT ditambahkan");
              setLandForm({ code: "", sequence_no: 1, land_location: "", street_name: "", estimated_price_per_m2: 0 });
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
              <input type="number" placeholder="No" value={buildingForm.sequence_no} onChange={(e) => setBuildingForm({ ...buildingForm, sequence_no: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input placeholder="Lokasi Bangunan" value={buildingForm.building_location} onChange={(e) => setBuildingForm({ ...buildingForm, building_location: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <select value={buildingForm.building_category} onChange={(e) => setBuildingForm({ ...buildingForm, building_category: e.target.value as any })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600">
                <option value="sederhana">Sederhana</option>
                <option value="tidak_sederhana">Tidak sederhana</option>
              </select>
              <input type="number" placeholder="Indeks/m2" value={buildingForm.price_index_per_m2} onChange={(e) => setBuildingForm({ ...buildingForm, price_index_per_m2: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
            </div>
          }
          onCreate={async () => {
            const res = await hppAPI.createAdminBuildingValue(buildingForm);
            if (res.success) {
              setSuccess("WB ditambahkan");
              setBuildingForm({ code: "", sequence_no: 1, building_location: "", building_category: "sederhana", price_index_per_m2: 0 });
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
              <input type="number" placeholder="No" value={locationForm.sequence_no} onChange={(e) => setLocationForm({ ...locationForm, sequence_no: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input placeholder="Nama Lokasi" value={locationForm.location_name} onChange={(e) => setLocationForm({ ...locationForm, location_name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input type="number" placeholder="Besaran (%)" value={locationForm.percentage} onChange={(e) => setLocationForm({ ...locationForm, percentage: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
            </div>
          }
          onCreate={async () => {
            const res = await hppAPI.createAdminLocationFactor(locationForm);
            if (res.success) {
              setSuccess("FP2 ditambahkan");
              setLocationForm({ code: "", sequence_no: 1, location_name: "", percentage: 100 });
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
              <input type="number" placeholder="No" value={taxForm.sequence_no} onChange={(e) => setTaxForm({ ...taxForm, sequence_no: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input placeholder="Jenis Pajak" value={taxForm.tax_name} onChange={(e) => setTaxForm({ ...taxForm, tax_name: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input type="number" placeholder="Nilai Pajak (%)" value={taxForm.tax_rate_pct} onChange={(e) => setTaxForm({ ...taxForm, tax_rate_pct: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
              <input type="number" placeholder="Coverage (%)" value={taxForm.coverage_pct} onChange={(e) => setTaxForm({ ...taxForm, coverage_pct: Number(e.target.value) })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
            </div>
          }
          onCreate={async () => {
            const res = await hppAPI.createAdminTax(taxForm);
            if (res.success) {
              setSuccess("Pajak ditambahkan");
              setTaxForm({ code: "", sequence_no: 1, tax_name: "", tax_rate_pct: 0, coverage_pct: 0 });
              loadAll();
            } else setError(res.message);
          }}
          rows={taxes}
          columns={["code", "sequence_no", "tax_name", "tax_rate_pct", "coverage_pct"]}
        />

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-white">Margin Fee</h3>
          <div className="mt-3 flex gap-2">
            <input type="number" value={marginFee} onChange={(e) => setMarginFee(Number(e.target.value))} className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600" />
            <button
              onClick={async () => {
                const res = await hppAPI.updateAdminMarginFee(marginFee);
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
