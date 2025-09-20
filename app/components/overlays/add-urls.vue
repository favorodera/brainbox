<template>

  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Add New URLs"
    description="Add new URLs for personalization."
    :ui="{
      content: 'max-w-xl',
    }"
    :dismissible="false"
  >

    <template #body>

      <UForm
        id="add-urls-form"
        :schema
        :state
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

          <UButton
            variant="soft"
            color="neutral"
            icon="lucide:trash"
            size="sm"
            :disabled="state.urls?.length === 1"
            @click="handleUrls.remove(index)"
          />


        </div>

        <UButton
          variant="soft"
          color="neutral"
          icon="lucide:plus"
          size="sm"
          square
          label="Add URL"
          @click="handleUrls.add()"
        />

      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Save URLs"
        block
        type="submit"
        form="add-urls-form"
        :loading="status === 'pending'"
        :disabled="status === 'pending'"
      />
    </template>

  </UModal>
  
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'

const emit = defineEmits<{ close: [boolean] }>()

const { refresh } = useUrlsStore('urls')

const toast = useToast()

const schema = z.object({
  urls: z.array(
    z.object({
      name: z.string('Invalid input').nonempty('Name is required'),
      url: z.url('Invalid URL').nonempty('URL is required'),
    }),
  ),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  urls: [{ name: '', url: '' }],
})

const { execute, status } = useRequest('/api/urls', {
  $fetch: {
    method: 'POST',
  },
  hooks: {
    onSuccess() {
      toast.add({
        title: 'URLs saved successfully',
        color: 'success',
        icon: 'lucide:check',
      })

      emit('close', false)

      refresh()
    },
    onError(error) {
      toast.add({
        title: error?.data?.message || 'Failed to save URLs',
        color: 'error',
        icon: 'lucide:x',
      })
    },
  },
  
}, false)

async function handleSubmit(event: FormSubmitEvent<Schema>) {

  await execute({
    $fetch: {
      body: {
        urls: [...event.data.urls],
      },
    },
  })

}

const handleUrls = {
  add() {
    if (!state.urls) {
      state.urls = [{ name: '', url: '' }]
    }
    state.urls.push({ name: '', url: '' })
  },

  remove(index: number) {
    if (state.urls && state.urls.length > 1) {
      state.urls.splice(index, 1)
    }
  },
}

</script>

<style scoped>

</style>
