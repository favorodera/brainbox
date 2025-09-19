<template>

  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Manage URLs"
    description="Add, edit, or remove the URLs used for personalization."
    :ui="{
      content: 'max-w-xl',
      body: 'space-y-2',
    }"
    :dismissible="false"
  >

    <template #body>
  

      <div class="flex items-center justify-end gap-2">

        <UButton
          v-if="!table?.tableApi?.getSelectedRowModel().rows.length"
          label="Add URL"
          color="neutral"
          size="sm"
        />

        <template v-if="table?.tableApi?.getSelectedRowModel().rows.length">
          <UButton
            label="Clear selection"
            color="neutral"
            size="sm"
            variant="soft"
            icon="lucide:x"
            @click="table?.tableApi?.resetRowSelection()"
          />

          <UButton
            :label="`Remove (${table?.tableApi?.getSelectedRowModel().rows.length})`"
            color="error"
            variant="soft"
            size="sm"
            icon="lucide:trash-2"
          />
        </template>


      </div>


      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:row-selection="rowSelection"
        caption="URL Table"
        class="shrink-0"
        :data="urls"
        :columns="columns"
        sticky
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
        :ui="{
          root: 'border-t border-default',
          thead: 'hidden',
          th: 'hidden',
          td: 'border-b border-default cursor-pointer',
        }"
        @select="onSelect"
      />

      <div class="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
        <p class="text-sm text-muted">
          Total URLs: {{ urls.length }}
        </p>

        <UPagination
          :sibling-count="1"
          size="xs"
          color="neutral"
          variant="link"
          active-variant="soft"
          :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(page: number) => table?.tableApi?.setPageIndex(page - 1)"
        />
      </div>
  

    </template>


  </UModal>

</template>

<script setup lang="ts">
import { UButton, UIcon } from '#components'


import type { TableColumn, TableRow } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'

const emit = defineEmits<{ close: [boolean] }>()

const urls = ref([
  'https://example.com',
  'https://news.ycombinator.com',
  'https://vuejs.org',
  'https://github.com',
  'https://docs.nuxt.com',
  'https://openai.com',
  'https://google.com',
  'https://twitter.com',
  'https://facebook.com',
  'https://reddit.com',
  'https://stackoverflow.com',
  'https://github.com/nuxt',
  'https://vitejs.dev',
  'https://developer.mozilla.org',
  'https://npmjs.com',
  'https://yarnpkg.com',
  'https://pnpm.io',
  'https://nextjs.org',
  'https://astro.build',
  'https://vercel.com',
  'https://netlify.com',
  'https://supabase.com',
])

const table = useTemplateRef('table')

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})

const rowSelection = ref<Record<string, boolean>>({})

function onSelect(row: TableRow<string>, _event?: Event) {
  row.toggleSelected()
}

const columns = ref<TableColumn<string>[]>([
  {
    accessorKey: 'url',
    header: '',
    cell: ({ row }) => h('div',
      {
        class: 'flex items-center gap-2 justify-between',
      },
      [
        h('span', {}, row.original),
        h(UIcon,
          {
            name: 'lucide:check-circle-2',
            class: `text-default shrink-0 ${row.getIsSelected() ? 'opacity-100' : 'opacity-0 transition-opacity'}`,
          },
        ),
      ]),
  },
])
</script>

<style scoped>

</style>
