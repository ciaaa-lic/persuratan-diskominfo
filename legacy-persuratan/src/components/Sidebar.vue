<template>
  <aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col hidden md:flex h-full">
    <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
      <h1 class="text-xl font-bold text-blue-600 dark:text-blue-400">e-Surat</h1>
    </div>
    
    <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
      <router-link 
        v-for="item in navigation" 
        :key="item.name" 
        :to="item.href"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
        :class="[$route.path === item.href || $route.path.startsWith(item.href + '/') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white']"
      >
        <component :is="item.icon" class="mr-3 flex-shrink-0 h-5 w-5" :class="[$route.path === item.href || $route.path.startsWith(item.href + '/') ? 'text-blue-700 dark:text-blue-300' : 'text-gray-400 dark:text-gray-500']" aria-hidden="true" />
        {{ item.name }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center mb-4">
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
            {{ user?.name || 'User' }}
          </p>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
            {{ user?.role || 'Guest' }}
          </p>
        </div>
      </div>
      <button @click="$emit('logout')" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors">
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  navigation: {
    type: Array,
    required: true
  },
  user: {
    type: Object,
    default: () => ({})
  }
})
defineEmits(['logout'])
</script>
