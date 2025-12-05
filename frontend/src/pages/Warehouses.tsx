import { Component, createResource, Show } from 'solid-js';
import { apiClient } from '@/api/client';
import Loading from '@/components/Loading';

const WarehousesPage: Component = () => {
  const [warehouses] = createResource(() => 
    apiClient.getWarehouses({ pageSize: 100 })
  );

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Склады</h1>
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium">
          + Добавить склад
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <Show when={!warehouses.loading} fallback={<Loading />}>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Адрес
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Город
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Страна
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {warehouses()?.items.map((warehouse) => (
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {warehouse.name}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {warehouse.address}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warehouse.city}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warehouse.country}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {warehouse.type || 'N/A'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-blue-600 hover:text-blue-900 mr-4">Редактировать</button>
                      <button class="text-red-600 hover:text-red-900">Удалить</button>
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

export default WarehousesPage;

