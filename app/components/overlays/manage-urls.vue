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

      <template v-if="status === 'fetching'" />

      <template v-if="data">
        <div class="flex items-center justify-end gap-2">

          <UButton
            v-if="!table?.tableApi?.getSelectedRowModel().rows.length"
            label="Add URLs"
            color="neutral"
            size="sm"
            @click="addUrlsModal.open()"
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
          :data="data.urls"
          :columns="columns"
          :loading="status === 'refreshing'"
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
            Total URLs: {{ data.urls.length }}
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
  

    </template>


  </UModal>

</template>

<script setup lang="ts">
import { LazyOverlaysAddUrls, UButton, UIcon } from '#components'
import type { TableColumn, TableRow } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/vue-table'

const { data, status } = useUserStore('user')

const emit = defineEmits<{ close: [boolean] }>()

const overlay = useOverlay()
const addUrlsModal = overlay.create(LazyOverlaysAddUrls)

const table = useTemplateRef('table')

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})

const rowSelection = ref<Record<string, boolean>>({})

function onSelect(row: TableRow<{ name: string, url: string }>, _event?: Event) {
  row.toggleSelected()
}

const columns = ref<TableColumn<{ name: string, url: string }>[]>([
  {
    accessorKey: 'url',
    header: '',
    cell: ({ row }) => h('div',
      {
        class: 'flex items-center gap-2 justify-between',
      },
      [
        h('span', {}, row.original.url),
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
