import { Component, createResource, Show, createSignal } from 'solid-js';
import { apiClient } from '@/api/client';
import DriversTable from '@/components/DriversTable';
import DriverForm from '@/components/DriverForm';
import Loading from '@/components/Loading';

const DriversPage: Component = () => {
  const [showForm, setShowForm] = createSignal(false);
  const [editingDriver, setEditingDriver] = createSignal<string | null>(null);
  
  const [drivers, { refetch }] = createResource(() => 
    apiClient.getDrivers({ pageSize: 100 })
  );

  const handleCreate = () => {
    setEditingDriver(null);
    setShowForm(true);
  };

  const handleEdit = (driver: any) => {
    setEditingDriver(driver.id.toString());
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDriver(null);
    refetch();
  };

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Водители</h1>
        <button
          onClick={handleCreate}
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium"
        >
          + Добавить водителя
        </button>
      </div>

      <Show when={showForm()}>
        <div class="bg-white rounded-lg shadow-md p-6">
          <DriverForm
            driverId={editingDriver()}
            onClose={handleFormClose}
            onSuccess={handleFormClose}
          />
        </div>
      </Show>

      <div class="bg-white rounded-lg shadow-md p-6">
        <Show when={!drivers.loading} fallback={<Loading />}>
          <DriversTable 
            drivers={drivers()?.items || []} 
            onEdit={(driver) => handleEdit(driver)}
          />
        </Show>
      </div>
    </div>
  );
};

export default DriversPage;

