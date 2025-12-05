import { Component, createResource, Show, createSignal } from 'solid-js';
import { apiClient } from '@/api/client';
import OrdersList from '@/components/OrdersList';
import Loading from '@/components/Loading';

const OrdersPage: Component = () => {
  const [statusFilter, setStatusFilter] = createSignal<string>('all');
  
  const [orders, { refetch }] = createResource(() => {
    const filters: any = { pageSize: 100 };
    if (statusFilter() !== 'all') {
      filters.status = statusFilter();
    }
    return apiClient.getOrders(filters);
  });

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Заказы</h1>
        <div class="flex gap-2">
          <select
            value={statusFilter()}
            onChange={(e) => setStatusFilter(e.currentTarget.value)}
            class="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">Все статусы</option>
            <option value="NEW">Новые</option>
            <option value="ASSIGNED">Назначены</option>
            <option value="IN_PROGRESS">В работе</option>
            <option value="COMPLETED">Завершены</option>
            <option value="CANCELLED">Отменены</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <Show when={!orders.loading} fallback={<Loading />}>
          <OrdersList 
            orders={orders()?.items || []}
            onUpdate={refetch}
          />
        </Show>
      </div>
    </div>
  );
};

export default OrdersPage;

