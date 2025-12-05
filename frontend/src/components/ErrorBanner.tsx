import { Component, Show } from "solid-js";
import { createSignal, onMount } from "solid-js";

const ErrorBanner: Component = () => {
  const [showMigrationError, setShowMigrationError] = createSignal(false);

  onMount(() => {
    // Проверяем наличие ошибок миграции в localStorage или sessionStorage
    const checkMigrationError = () => {
      // Можно добавить логику проверки через API health check
      const hasError = sessionStorage.getItem('migration_error');
      if (hasError) {
        setShowMigrationError(true);
      }
    };
    
    checkMigrationError();
    
    // Слушаем события ошибок
    window.addEventListener('api-error', ((e: CustomEvent) => {
      if (e.detail?.status === 503 && e.detail?.message?.includes('migrations')) {
        setShowMigrationError(true);
        sessionStorage.setItem('migration_error', 'true');
      }
    }) as EventListener);
  });

  return (
    <Show when={showMigrationError()}>
      <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <span class="text-red-400 text-xl">⚠️</span>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Требуется применение миграции базы данных
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>
                База данных не настроена. Пожалуйста, примените миграцию в Supabase.
              </p>
              <p class="mt-2">
                <strong>Инструкция:</strong>
              </p>
              <ol class="list-decimal list-inside mt-1 space-y-1">
                <li>Откройте файл <code class="bg-red-100 px-1 rounded">backend/APPLY_MIGRATION.sql</code></li>
                <li>Скопируйте весь SQL код</li>
                <li>Откройте Supabase Dashboard → SQL Editor</li>
                <li>Вставьте и выполните SQL</li>
              </ol>
              <button
                onclick={() => {
                  setShowMigrationError(false);
                  sessionStorage.removeItem('migration_error');
                }}
                class="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default ErrorBanner;

