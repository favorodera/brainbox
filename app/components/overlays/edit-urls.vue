<!-- Modal form to edit existing personalization URLs with change detection -->
<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Edit URLs"
    description="Edit the URLs below. Make your changes and save."
    :ui="{
      content: 'max-w-2xl',
    }"
    :dismissible="false"
  >
    <template #body>
      <UForm
        id="edit-urls-form"
        :schema="schema"
        :state="state"
        class="space-y-2"
        loading-auto
        @submit="handleSubmit"
      >
        <div
          v-for="(url, index) in state.urls"
          :key="index"
          class="flex items-start gap-2"
        >
          <UFormField
            :name="`urls.${index}.name`"
            class="flex-1"
          >
            <UInput
              v-model.trim="url.name"
              placeholder="Name"
              :name="`urls.${index}.name`"
              autocomplete="on"
              type="text"
            />
          </UFormField>

          <UFormField
            :name="`urls.${index}.url`"
            class="flex-1"
          >
            <UInput
              v-model.trim="url.url"
              placeholder="https://url.com"
              autocomplete="website"
              :name="`urls.${index}.url`"
              type="url"
            />
          </UFormField>
        </div>
      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="soft"
        block
        @click="emit('close', false)"
      />
      <UButton
        label="Save URLs"
        color="primary"
        :loading="status === 'pending'"
        loading-auto
        block
        type="submit"
        form="edit-urls-form"
        :disabled="status === 'pending' || !anyChangeOccurred"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'

const props = defineProps<{
  urls: { name: string, url: string }[]
}>()

const emit = defineEmits<{ close: [boolean] }>()

// Store refresh to re-fetch URLs after successful update
const { refresh } = useUrlsStore('urls')
const toast = useToast()

// Form validation schema for URL entries
const schema = z.object({
  urls: z.array(
    z.object({
      name: z.string('Invalid input').nonempty('Name is required'),
      url: z.url('Invalid URL').nonempty('URL is required'),
    }),
  ),
})

type Schema = z.output<typeof schema>

// Local copy of the URLs to edit in-place
const state = ref<Schema>({
  urls: props.urls.map(url => ({ ...url })),
})

// Tracks whether any field changed to enable Save button
const anyChangeOccurred = computed(() => {
  return props.urls.some((item, index) => {
    const current = state.value.urls[index]
    return item.name !== current?.name || item.url !== current?.url
  })
})


// Request helper to PATCH URLs to the server API
const { execute, status } = useRequest('/api/urls', {
  $fetch: {
    method: 'PATCH',
  },
  hooks: {
    onSuccess() {
      toast.add({
        title: 'URLs updated successfully',
        color: 'success',
        icon: 'lucide:check',
      })

      emit('close', false)

      refresh()
    },
    onError(error) {
      toast.add({
        title: error?.data?.message || 'Failed to update URLs',
        color: 'error',
        icon: 'lucide:x',
      })
    },
  },
}, false)

// Submits the form by sending updated URLs to the API
async function handleSubmit(event: FormSubmitEvent<Schema>) {
  await execute({
    $fetch: {
      body: {
        urls: [...event.data.urls],
      },
    },
  })
}
</script>

<style scoped>
</style>
