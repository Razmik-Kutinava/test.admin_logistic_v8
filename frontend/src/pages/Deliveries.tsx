import { Component, createResource, Show, createSignal } from 'solid-js';
import { apiClient } from '@/api/client';
import Loading from '@/components/Loading';

const DeliveriesPage: Component = () => {
  const [statusFilter, setStatusFilter] = createSignal<string>('all');
  
  const [deliveries, { refetch }] = createResource(() => {
    const filters: any = { pageSize: 100 };
    if (statusFilter() !== 'all') {
      filters.status = statusFilter();
    }
    return apiClient.getDeliveries(filters);
  });

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Доставки</h1>
        <select
          value={statusFilter()}
          onChange={(e) => setStatusFilter(e.currentTarget.value)}
          class="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="all">Все статусы</option>
          <option value="ASSIGNED">Назначены</option>
          <option value="PICKED_UP">Взяты</option>
          <option value="IN_TRANSIT">В пути</option>
          <option value="DELIVERED">Доставлены</option>
          <option value="FAILED">Не доставлены</option>
        </select>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <Show when={!deliveries.loading} fallback={<Loading />}>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заказ
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Водитель
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {deliveries()?.items.map((delivery) => (
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.orderNumber || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.driver?.name || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        delivery.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Show>
      </div>
    </div>
  );
};

export default DeliveriesPage;

