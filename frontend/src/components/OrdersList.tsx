import { Component, For } from "solid-js";
import type { Order } from "@/types";
import { formatDate, formatCurrency, getStatusColor, getPriorityColor } from "@/utils/format";
import { clsx } from "clsx";

interface OrdersListProps {
  orders: Order[];
  onViewDetails?: (order: Order) => void;
  onAssignDriver?: (order: Order) => void;
  onUpdateStatus?: (order: Order) => void;
}

const OrdersList: Component<OrdersListProps> = (props) => {
  return (
    <div class="space-y-4">
      <For each={props.orders}>
        {(order) => (
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  Заказ #{order.orderNumber}
                </h3>
                <p class="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <div class="flex space-x-2">
                <span
                  class={clsx(
                    "px-2 py-1 text-xs font-semibold rounded-full",
                    getStatusColor(order.status)
                  )}
                >
                  {order.status}
                </span>
                <span
                  class={clsx(
                    "px-2 py-1 text-xs font-semibold rounded-full",
                    getPriorityColor(order.priority)
                  )}
                >
                  {order.priority}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm font-medium text-gray-700">Клиент</p>
                <p class="text-sm text-gray-900">{order.customer.name}</p>
                <p class="text-sm text-gray-500">{order.customer.phone}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">Адрес доставки</p>
                <p class="text-sm text-gray-900">{order.deliveryAddress.street}</p>
                <p class="text-sm text-gray-500">
                  {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                </p>
              </div>
            </div>

            <div class="border-t pt-4">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-gray-500">Товаров: {order.items.length}</p>
                  <p class="text-lg font-semibold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    onClick={() => props.onViewDetails?.(order)}
                    class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Подробнее
                  </button>
                  {order.status === "pending" && (
                    <button
                      onClick={() => props.onAssignDriver?.(order)}
                      class="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Назначить водителя
                    </button>
                  )}
                  <button
                    onClick={() => props.onUpdateStatus?.(order)}
                    class="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Изменить статус
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export default OrdersList;
