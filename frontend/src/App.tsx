import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
// import Videos from "./pages/UiElements/Videos";
// import Images from "./pages/UiElements/Images";
// import Alerts from "./pages/UiElements/Alerts";
// import Badges from "./pages/UiElements/Badges";
// import Avatars from "./pages/UiElements/Avatars";
// import Buttons from "./pages/UiElements/Buttons";
// import Calendar from "./pages/Calendar";
// import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Home from "./pages/Dashboard/Home";
import Users from "./pages/Users/Users";
import EditUser from "./pages/Users/EditUser";
import CreateUser from "./pages/Users/CreateUser";
import ViewUser from "./pages/Users/ViewUser";
import Roles from "./pages/Roles/Roles";
import EditRole from "./pages/Roles/EditRole";
import Settings from "./pages/Settings/Settings";
import HppSettings from "./pages/HppAdmin/HppSettings";
import HppCalculatorAdmin from "./pages/HppAdmin/HppCalculatorAdmin";
import HppMasterIndex from "./pages/HppAdmin/HppMasterIndex";
import HppVariablesPage from "./pages/HppAdmin/HppVariablesPage";
import HppLandValuesPage from "./pages/HppAdmin/HppLandValuesPage";
import HppBuildingValuesPage from "./pages/HppAdmin/HppBuildingValuesPage";
import HppLocationFactorsPage from "./pages/HppAdmin/HppLocationFactorsPage";
import HppEntityFactorsPage from "./pages/HppAdmin/HppEntityFactorsPage";
import HppPeriodFactorsPage from "./pages/HppAdmin/HppPeriodFactorsPage";
import HppPaymentFactorsPage from "./pages/HppAdmin/HppPaymentFactorsPage";
import HppTaxesMarginPage from "./pages/HppAdmin/HppTaxesMarginPage";

export default function App() {
  return (
    <>
      <Router basename="/">
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout - Semua route di dalam AppLayout harus protected */}
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Others Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiredPermission="view_myprofile">
                  <UserProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredPermission="view_user">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/create"
              element={
                <ProtectedRoute requiredPermission="create_user">
                  <CreateUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <ProtectedRoute requiredPermission="view_user">
                  <ViewUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute requiredPermission="update_user">
                  <EditUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute requiredPermission="view_role">
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles/:id/edit"
              element={
                <ProtectedRoute requiredPermission={["update_role", "view_role"]}>
                  <EditRole />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/blank"
              element={
                <ProtectedRoute>
                  <Blank />
                </ProtectedRoute>
              }
            /> */}

            {/* Ui Elements */}
            {/* <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/avatars"
              element={
                <ProtectedRoute>
                  <Avatars />
                </ProtectedRoute>
              }
            />
            <Route
              path="/badge"
              element={
                <ProtectedRoute>
                  <Badges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buttons"
              element={
                <ProtectedRoute>
                  <Buttons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/images"
              element={
                <ProtectedRoute>
                  <Images />
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <ProtectedRoute>
                  <Videos />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute requiredPermission="view_setting">
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hpp/settings"
              element={
                <ProtectedRoute requiredPermission="view_setting">
                  <HppMasterIndex />
                </ProtectedRoute>
              }
            />
            <Route path="/hpp/settings/legacy" element={<ProtectedRoute requiredPermission="view_setting"><HppSettings /></ProtectedRoute>} />
            <Route path="/hpp/settings/variables" element={<ProtectedRoute requiredPermission="view_setting"><HppVariablesPage /></ProtectedRoute>} />
            <Route path="/hpp/settings/land-values" element={<ProtectedRoute requiredPermission="view_setting"><HppLandValuesPage /></ProtectedRoute>} />
            <Route path="/hpp/settings/building-values" element={<ProtectedRoute requiredPermission="view_setting"><HppBuildingValuesPage /></ProtectedRoute>} />
            <Route path="/hpp/settings/location-factors" element={<ProtectedRoute requiredPermission="view_setting"><HppLocationFactorsPage /></ProtectedRoute>} />
            <Route path="/hpp/settings/entity-factors" element={<ProtectedRoute requiredPermission="view_setting"><HppEntityFactorsPage /></ProtectedRoute>} />
            <Route path="/hpp/settings/period-factors" element={<ProtectedRoute requiredPermission="view_setting"><HppPeriodFactorsPage /></ProtectedRoute>} />
            <Route path="/hpp/settings/payment-factors" element={<ProtectedRoute requiredPermission="view_setting"><HppPaymentFactorsPage /></ProtectedRoute>} />
            <Route path="/hpp/settings/taxes-margin" element={<ProtectedRoute requiredPermission="view_setting"><HppTaxesMarginPage /></ProtectedRoute>} />
            <Route
              path="/hpp/calculator"
              element={
                <ProtectedRoute>
                  <HppCalculatorAdmin />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route - Full screen, outside AppLayout */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
