import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { OverviewPage } from "./pages/OverviewPage";
import { PoolDetailPage } from "./pages/PoolDetailPage";
import { WalletPage } from "./pages/WalletPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/pools/:poolId" element={<PoolDetailPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/wallet/:poolId/:address" element={<WalletPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
