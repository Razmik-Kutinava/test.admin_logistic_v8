import { Component, createSignal } from "solid-js";
import type { Driver } from "@/types";

interface DriverFormProps {
  driver?: Driver;
  onSubmit: (driver: Partial<Driver>) => void;
  onCancel: () => void;
}

const DriverForm: Component<DriverFormProps> = (props) => {
  const [formData, setFormData] = createSignal<Partial<Driver>>(
    props.driver || {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      vehicleType: "car",
      vehicleNumber: "",
      status: "available",
    }
  );

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSubmit(formData());
  };

  const updateField = (field: keyof Driver, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Имя</label>
          <input
            type="text"
            value={formData().firstName}
            onInput={(e) => updateField("firstName", e.currentTarget.value)}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Фамилия</label>
          <input
            type="text"
            value={formData().lastName}
            onInput={(e) => updateField("lastName", e.currentTarget.value)}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Телефон</label>
          <input
            type="tel"
            value={formData().phone}
            onInput={(e) => updateField("phone", e.currentTarget.value)}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData().email}
            onInput={(e) => updateField("email", e.currentTarget.value)}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Тип транспорта</label>
          <select
            value={formData().vehicleType}
            onChange={(e) => updateField("vehicleType", e.currentTarget.value as Driver["vehicleType"])}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="car">Легковой автомобиль</option>
            <option value="van">Фургон</option>
            <option value="truck">Грузовик</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Номер транспорта</label>
          <input
            type="text"
            value={formData().vehicleNumber}
            onInput={(e) => updateField("vehicleNumber", e.currentTarget.value)}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Статус</label>
        <select
          value={formData().status}
          onChange={(e) => updateField("status", e.currentTarget.value as Driver["status"])}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="available">Доступен</option>
          <option value="busy">Занят</option>
          <option value="offline">Оффлайн</option>
        </select>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          onClick={props.onCancel}
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Отмена
        </button>
        <button
          type="submit"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {props.driver ? "Обновить" : "Создать"}
        </button>
      </div>
    </form>
  );
};

export default DriverForm;
