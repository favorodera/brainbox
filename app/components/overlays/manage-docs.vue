<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Manage Docs"
    description="Crawl and index custom resources and documentations"
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
              id="search-docs"
              v-model="globalFilter"
              name="search-docs"
              placeholder="Search docs"
              class="max-w-xs"
              size="sm"
            />

            <div
              v-if="selectedRows.length > 0"
              class="flex gap-2"
            >

              <UButton
                label="Edit"
                size="sm"
                color="neutral"
                variant="soft"
                @click="editDocsModal.open({ docs: selectedRows })"
              />

              <UButton
                label="Delete"
                color="error"
                variant="soft"
                size="sm"
                @click="deleteDocsConfirmationModal.open({ docs: selectedRows })"
              />
            </div>

            <UButton
              v-else
              label="Add Docs"
              color="neutral"
              variant="soft"
              size="sm"
              @click="addDocsModal.open()"
            />


          </div>

          <UTable
            ref="table"
            v-model:pagination="pagination"
            v-model:global-filter="globalFilter"
            caption="Docs Table"
            class="shrink-0"
            empty="No docs found"
            :data="data"
            :columns="columns"
            sticky
            :ui="{
              thead: 'hidden',
              td: 'p-2',
            }"
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

                <template v-if="table?.tableApi?.getSelectedRowModel().rows.length">
                  Selected: {{ table?.tableApi?.getSelectedRowModel().rows.length }} of
                  {{ data.length }} docs
                </template>

                <template v-else>
                  Total docs: {{ data.length }}
                </template>
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
            {{ error?.data?.message || 'An unexpected error occurred' }}
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
import { LazyOverlaysAddDocs, LazyOverlaysDeleteDocsConfirmation, LazyOverlaysEditDocs, UButton, UCheckbox, UIcon } from '#components'
import type { TableColumn } from '@nuxt/ui'

const { data, status, error, execute } = useContextsStore('docs')

const emit = defineEmits<{ close: [boolean] }>()

const overlay = useOverlay()
const addDocsModal = overlay.create(LazyOverlaysAddDocs)
const deleteDocsConfirmationModal = overlay.create(LazyOverlaysDeleteDocsConfirmation)
const editDocsModal = overlay.create(LazyOverlaysEditDocs)

const table = useTemplateRef('table')

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})

const globalFilter = ref('')

const selectedRows = computed((): { name: string, url: string }[] => {
  const tableApi = table.value?.tableApi
  if (!tableApi) return []
  return tableApi.getSelectedRowModel().rows.map(row => row.original)
})


const columns = ref<TableColumn<{ name: string, url: string }>[]>([
  {
    id: 'select',
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row',
        'id': 'select-row',
      }),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    enableGlobalFilter: true,
    meta: { class: { th: 'hidden', td: 'hidden' } },
  },
  {
    accessorKey: 'url',
    header: 'URL',
    enableGlobalFilter: true,
    meta: { class: { th: 'hidden', td: 'hidden' } },
  },
  {
    id: 'urlDisplay',
    header: '',
    cell: ({ row }) => h('div', {}, [
      h('p', { class: 'truncate text-sm font-medium' }, row.original.name),
      h('p', { class: 'truncate text-xs' }, row.original.url),
    ]),
  },
])

// Reset selection and filter when data is refreshing
whenever(() => status.value === 'refreshing', () => {
  table.value?.tableApi?.resetRowSelection()
  table.value?.tableApi?.resetGlobalFilter()
})
</script>

