import React from "react";
import ProtectedRoute from "@/components/Admin/ProtectedRoute";
import AdminLayout from "@/components/Admin/AdminLayout";
import AdminDashboard from "@/components/Admin/AdminDashboard";
import GlobalBackground from "@/components/GlobalBackground";

export default function AdminPage() {
  return (
    <>
      <GlobalBackground />
      <ProtectedRoute>
        <AdminLayout title="Dashboard">
          <AdminDashboard />
        </AdminLayout>
      </ProtectedRoute>
    </>
  );
}
