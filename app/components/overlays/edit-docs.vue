<template>
  <UModal
    :close="{ onClick: () => emit('close', false), disabled: status === 'pending' }"
    title="Edit Docs"
    description="Edit the docs below. Make your changes and save."
    :ui="{
      content: 'max-w-2xl',
    }"
    :dismissible="false"
  >
    <template #body>
      <UForm
        id="edit-docs-form"
        :schema="schema"
        :state="state"
        class="space-y-2"
        loading-auto
        @submit="handleSubmit"
      >
        <div
          v-for="(doc, index) in state.docs"
          :key="index"
          class="flex items-start gap-2"
        >
          <UFormField
            :name="`docs.${index}.name`"
            class="flex-1"
          >
            <UInput
              v-model.trim="doc.name"
              placeholder="Name"
              :name="`docs.${index}.name`"
              autocomplete="on"
              type="text"
            />
          </UFormField>

          <UFormField
            :name="`docs.${index}.url`"
            class="flex-1"
          >
            <UInput
              v-model.trim="doc.url"
              placeholder="https://url.com"
              autocomplete="website"
              :name="`docs.${index}.url`"
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
        :disabled="status === 'pending'"
        block
        @click="emit('close', false)"
      />
      <UButton
        label="Save Docs"
        color="primary"
        :loading="status === 'pending'"
        loading-auto
        block
        type="submit"
        form="edit-docs-form"
        :disabled="status === 'pending' || !anyChangeOccurred"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import z from 'zod'

const props = defineProps<{
  docs: { name: string, url: string }[]
}>()

const emit = defineEmits<{ close: [boolean] }>()

const { refresh } = useContextsStore('docs')
const toast = useToast()

const schema = z.object({
  docs: z.array(
    z.object({
      name: z.string('Invalid input').nonempty('Name is required'),
      url: z.url('Invalid URL').nonempty('URL is required'),
    }),
  ),
})

type Schema = z.output<typeof schema>

const state = ref<Schema>({
  docs: props.docs.map(doc => ({ ...doc })),
})

// Tracks whether any field changed to enable Save button
const anyChangeOccurred = computed(() => {
  return props.docs.some((doc, index) => {
    const current = state.value.docs[index]
    return doc.name !== current?.name || doc.url !== current?.url
  })
})


const { execute, status } = useRequest('/api/docs', {
  $fetch: {
    method: 'PATCH',
  },
  hooks: {
    onSuccess() {
      toast.add({
        title: 'Docs updated successfully',
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

async function handleSubmit(event: FormSubmitEvent<Schema>) {
  await execute({
    $fetch: {
      body: {
        docs: [...event.data.docs],
      },
    },
  })
}
</script>

<style scoped>
</style>
