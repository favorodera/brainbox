<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Manage URLs"
    description="Add, edit, or remove the URLs used for personalization."
    :ui="{ content: 'max-w-2xl' }"
    :dismissible="false"
  >
    <template #body>
      <Transition
        name="fade-out-in"
        mode="out-in"
      >
        <div
          v-if="data"
          class="flex flex-col gap-2"
        >
          <div class="flex items-center justify-between gap-4">
            <UInput
              id="search-urls"
              v-model="globalFilter"
              name="search-urls"
              placeholder="Search URLs"
              class="max-w-xs"
              size="sm"
            />

            <UButton
              v-if="selectedRows.length > 0"
              :label="`Delete (${selectedRows.length})`"
              color="error"
              variant="soft"
              size="sm"
              icon="lucide:trash-2"
              @click="deleteUrlsConfirmationModal.open({ urls: selectedRows })"
            />

            <UButton
              v-else
              label="Add"
              color="neutral"
              size="sm"
              @click="addUrlsModal.open()"
            />
          </div>

          <UTable
            ref="table"
            v-model:pagination="pagination"
            v-model:row-selection="rowSelection"
            v-model:global-filter="globalFilter"
            caption="URL Table"
            class="shrink-0"
            :data="data"
            :columns="columns"
            sticky
            :ui="{
              thead: 'hidden',
              th: 'hidden',
              td: 'cursor-pointer p-2',
            }"
            @select="onSelect"
          />

          <div class="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
            <p
              class="text-sm text-muted"
              :class="{ 'animate-pulse': status === 'refreshing' }"
            >
              <template v-if="status === 'refreshing'">
                Refreshing...
              </template>

              <template v-else>
                Total URLs: {{ data.length }}
              </template>
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
        </div>

        <div
          v-else-if="error && status === 'error'"
          class="flex flex-col items-center gap-2"
        >
          <UIcon
            name="lucide:alert-circle"
            class="size-5 text-error"
          />
          <p class="line-clamp-2">
            {{ error.data.message }}
          </p>
          <UButton
            label="Retry"
            variant="soft"
            size="sm"
            @click="execute()"
          />
        </div>

        <div
          v-else
          class="flex flex-col items-center gap-2"
        >
          <UIcon
            name="lucide:loader-circle"
            class="size-5 animate-spin"
          />
          <p class="animate-pulse">
            Loading...
          </p>
        </div>
      </Transition>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { LazyOverlaysAddUrls, LazyOverlaysDeleteUrlsConfirmation, UButton, UIcon } from '#components'
import type { TableColumn, TableRow } from '@nuxt/ui'

const { data, status, error, execute } = useUrlsStore('urls')

const emit = defineEmits<{ close: [boolean] }>()

const overlay = useOverlay()
const addUrlsModal = overlay.create(LazyOverlaysAddUrls)
const deleteUrlsConfirmationModal = overlay.create(LazyOverlaysDeleteUrlsConfirmation)

const table = useTemplateRef('table')

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})

const rowSelection = ref<Record<string, boolean>>({})
const globalFilter = ref('')

// Function to handle row selection
function onSelect(row: TableRow<{ name: string, url: string }>, _event?: Event) {
  row.toggleSelected()
}

// Fixed selected rows computation using table API
const selectedRows = computed((): { name: string, url: string }[] => {
  const tableApi = table.value?.tableApi
  if (!tableApi) return []
  return tableApi.getSelectedRowModel().rows.map((row: { original: { name: string, url: string } }) => row.original)
})

const columns = ref<TableColumn<{ name: string, url: string }>[]>([
  {
    accessorKey: 'url',
    header: '',
    cell: ({ row }) => h('div', {
      class: 'flex items-center gap-2 justify-between',
    }, [
      h('span', {}, row.original.url),
      h(UIcon, {
        name: 'lucide:check-circle-2',
        class: `text-default shrink-0 transition-opacity ${row.getIsSelected() ? 'opacity-100' : 'opacity-0'}`,
      }),
    ]),
  },
])
</script>

