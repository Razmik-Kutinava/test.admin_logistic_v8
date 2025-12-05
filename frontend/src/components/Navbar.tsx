import { Component } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import { clsx } from "clsx";

const Navbar: Component = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "🏠" },
    { path: "/drivers", label: "Водители", icon: "🚗" },
    { path: "/orders", label: "Заказы", icon: "📦" },
    { path: "/deliveries", label: "Доставки", icon: "🚚" },
    { path: "/districts", label: "Районы", icon: "🗺️" },
    { path: "/warehouses", label: "Склады", icon: "🏭" },
  ];

  return (
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <span class="text-xl font-bold text-gray-800">
              Admin Logistic Panel v8
            </span>
          </div>
          <div class="flex space-x-4">
            {navItems.map((item) => (
              <A
                href={item.path}
                class={clsx(
                  "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span class="mr-2">{item.icon}</span>
                {item.label}
              </A>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
