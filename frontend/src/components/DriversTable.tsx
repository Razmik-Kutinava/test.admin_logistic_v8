import { Component, For } from "solid-js";
import type { Driver } from "@/types";
import { getStatusColor } from "@/utils/format";
import { clsx } from "clsx";

interface DriversTableProps {
  drivers: Driver[];
  onEdit?: (driver: Driver) => void;
  onDelete?: (id: string) => void;
}

const DriversTable: Component<DriversTableProps> = (props) => {
  return (
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Имя
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Телефон
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Транспорт
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Статус
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Рейтинг
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Доставок
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <For each={props.drivers}>
            {(driver) => (
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {driver.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {(driver as any).name || `${(driver as any).firstName || ''} ${(driver as any).lastName || ''}`.trim()}
                    </div>
                    {(driver as any).email && (
                      <div class="text-sm text-gray-500">{(driver as any).email}</div>
                    )}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(driver as any).phone || driver.phone}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{(driver as any).vehicleType || driver.vehicleType || '-'}</div>
                  {(driver as any).licenseNumber && (
                    <div class="text-sm text-gray-500">License: {(driver as any).licenseNumber}</div>
                  )}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class={clsx(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      getStatusColor((driver as any).status || driver.status)
                    )}
                  >
                    {(driver as any).status || driver.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(driver as any).rating ? `⭐ ${(driver as any).rating.toFixed(1)}` : "-"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(driver as any)._count?.deliveries || driver.totalDeliveries || 0}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => props.onEdit?.(driver)}
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => props.onDelete?.(driver.id)}
                    class="text-red-600 hover:text-red-900"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default DriversTable;
