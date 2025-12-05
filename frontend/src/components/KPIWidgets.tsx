import { Component } from "solid-js";
import type { DashboardStats } from "@/types";
import { formatCurrency, formatDuration } from "@/utils/format";

interface KPIWidgetsProps {
  stats: DashboardStats;
}

const KPIWidgets: Component<KPIWidgetsProps> = (props) => {
  const widgets = [
    {
      label: "Всего заказов",
      value: props.stats.totalOrders,
      icon: "📦",
      color: "bg-blue-500",
    },
    {
      label: "Активные доставки",
      value: props.stats.activeDeliveries,
      icon: "🚚",
      color: "bg-green-500",
    },
    {
      label: "Доступные водители",
      value: props.stats.availableDrivers,
      icon: "🚗",
      color: "bg-purple-500",
    },
    {
      label: "Выручка",
      value: formatCurrency(props.stats.totalRevenue),
      icon: "💰",
      color: "bg-yellow-500",
    },
    {
      label: "Среднее время доставки",
      value: formatDuration(props.stats.averageDeliveryTime),
      icon: "⏱️",
      color: "bg-indigo-500",
    },
    {
      label: "Рейтинг удовлетворенности",
      value: `${props.stats.customerSatisfaction}%`,
      icon: "⭐",
      color: "bg-pink-500",
    },
  ];

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgets.map((widget) => (
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class={`${widget.color} rounded-lg p-3 text-white text-2xl`}>
              {widget.icon}
            </div>
            <div class="ml-4">
              <p class="text-gray-500 text-sm">{widget.label}</p>
              <p class="text-2xl font-bold text-gray-800">{widget.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPIWidgets;
