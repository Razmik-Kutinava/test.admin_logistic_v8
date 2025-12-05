import { Component } from "solid-js";

const Loading: Component = () => {
  return (
    <div class="flex justify-center items-center p-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default Loading;
