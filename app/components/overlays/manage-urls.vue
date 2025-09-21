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

            <div
              v-if="selectedRows.length > 0"
              class="flex gap-2"
            >

              <UButton
                :label="`Edit (${selectedRows.length})`"
                size="sm"
                variant="soft"
                icon="lucide:edit"
                class="max-sm:hidden"
                @click="editUrlsModal.open({ urls: selectedRows })"
              />

              <UButton
                :label="`Delete (${selectedRows.length})`"
                color="error"
                variant="soft"
                size="sm"
                icon="lucide:trash-2"
                class="max-sm:hidden"
                @click="deleteUrlsConfirmationModal.open({ urls: selectedRows })"
              />

              <UDropdownMenu
                class="min-sm:hidden"
                :items="[
                  {
                    label: `Edit ${selectedRows.length}`,
                    icon: 'lucide:edit',
                    onSelect: () => editUrlsModal.open({ urls: selectedRows }),
                  },
                  {
                    label: `Delete ${selectedRows.length}`,
                    icon: 'lucide:trash-2',
                    onSelect: () => deleteUrlsConfirmationModal.open({ urls: selectedRows }),
                    color: 'error',
                  },
                ]"
              >
                <UButton
                  :label="`${selectedRows.length} URLs Selected`"
                  variant="soft"
                  class="min-sm:hidden"
                  size="sm"
                  trailing
                  icon="lucide:chevron-down"
                />
              </UDropdownMenu>
            </div>

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
            empty="No URLs found"
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
import { LazyOverlaysAddUrls, LazyOverlaysDeleteUrlsConfirmation, LazyOverlaysEditUrls, UButton, UIcon } from '#components'
import type { TableColumn, TableRow } from '@nuxt/ui'

const { data, status, error, execute } = useUrlsStore('urls')

const emit = defineEmits<{ close: [boolean] }>()

const overlay = useOverlay()
const addUrlsModal = overlay.create(LazyOverlaysAddUrls)
const deleteUrlsConfirmationModal = overlay.create(LazyOverlaysDeleteUrlsConfirmation)
const editUrlsModal = overlay.create(LazyOverlaysEditUrls)

const table = useTemplateRef('table')

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})

const rowSelection = ref<Record<string, boolean>>({})
const globalFilter = ref('')

function onSelect(row: TableRow<{ name: string, url: string }>, _event?: Event) {
  row.toggleSelected()
}

const selectedRows = computed((): { name: string, url: string }[] => {
  const tableApi = table.value?.tableApi
  if (!tableApi) return []
  return tableApi.getSelectedRowModel().rows.map(row => row.original)
})

const columns = ref<TableColumn<{ name: string, url: string }>[]>([
  {
    accessorKey: 'url',
    header: '',
    cell: ({ row }) => h('div', {
      class: `flex items-center gap-2 ${row.getIsSelected() ? 'text-default' : 'text-muted'}`,
    }, [
      h(UIcon, {
        name: 'lucide:globe',
        class: `shrink-0`,
      }),
      h('span', { class: `flex-1 truncate mx-2 ` }, row.original.url),
    ]),
  },
])

watchEffect(() => {
  if (status.value === 'refreshing') {
    table.value?.tableApi?.resetRowSelection()
    table.value?.tableApi?.resetGlobalFilter()
  }
})
</script>

