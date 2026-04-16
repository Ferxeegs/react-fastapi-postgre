import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PublicHppCalculator from "../HppCalculator/HppCalculator";

export default function HppCalculatorAdmin() {
  return (
    <>
      <PageMeta title="Kalkulator HPP Admin" description="Kalkulator HPP dalam panel admin" />
      <PageBreadcrumb pageTitle="Kalkulator HPP" />
      <PublicHppCalculator embeddedAdmin />
    </>
  );
}
