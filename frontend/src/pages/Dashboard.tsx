import { Component, createSignal, createResource, Show } from "solid-js";
import { apiClient } from "@/api/client";
import KPIWidgets from "@/components/KPIWidgets";
import DriversTable from "@/components/DriversTable";
import OrdersList from "@/components/OrdersList";
import Loading from "@/components/Loading";

const Dashboard: Component = () => {
  const [stats] = createResource(() => apiClient.getDashboardStats());
  const [drivers] = createResource(() =>
    apiClient.getDrivers({ status: "ACTIVE", pageSize: 5 })
  );
  const [orders] = createResource(() =>
    apiClient.getOrders({ status: "NEW", pageSize: 5 })
  );

  return (
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>

      <Show when={!stats.loading} fallback={<Loading />}>
        <KPIWidgets stats={stats() || {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          activeDeliveries: 0,
          availableDrivers: 0,
          totalRevenue: 0,
          averageDeliveryTime: 0,
          customerSatisfaction: 0,
        }} />
      </Show>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Доступные водители
          </h2>
          <Show when={!drivers.loading} fallback={<Loading />}>
            <DriversTable drivers={drivers()?.items || []} />
          </Show>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Ожидающие заказы
          </h2>
          <Show when={!orders.loading} fallback={<Loading />}>
            <OrdersList orders={orders()?.items || []} />
          </Show>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
