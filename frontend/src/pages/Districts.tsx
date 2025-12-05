import { Component, createResource, Show } from 'solid-js';
import { apiClient } from '@/api/client';
import Loading from '@/components/Loading';

const DistrictsPage: Component = () => {
  const [districts] = createResource(() => 
    apiClient.getDistricts({ pageSize: 100 })
  );

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Районы</h1>
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium">
          + Добавить район
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <Show when={!districts.loading} fallback={<Loading />}>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Город
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Страна
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Улицы
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {districts()?.items.map((district) => (
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {district.name}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {district.city}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {district.country}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">
                      {(district.streets || []).length} улиц
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

export default DistrictsPage;

