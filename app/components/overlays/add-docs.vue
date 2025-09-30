<template>

  <UModal
    :close="{ onClick: () => emit('close', false), disabled: status === 'pending' }"
    title="Add New Docs"
    description="Add new docs for indexing and crawling"
    :ui="{
      content: 'max-w-2xl',
    }"
    :dismissible="false"
  >

    <template #body>

      <UForm
        id="add-docs-form"
        :schema
        :state
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

          <UButton
            variant="soft"
            color="neutral"
            icon="lucide:trash"
            size="sm"
            :disabled="state.docs?.length === 1"
            @click="handleDocs.remove(index)"
          />


        </div>

        <UButton
          variant="soft"
          color="neutral"
          icon="lucide:plus"
          size="sm"
          square
          label="Add Doc"
          @click="handleDocs.add()"
        />

      </UForm>
    </template>

    <template #footer>
      <UButton
        label="Save Docs"
        block
        type="submit"
        form="add-docs-form"
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

const state = reactive<Partial<Schema>>({
  docs: [{ name: '', url: '' }],
})

const { execute, status } = useRequest('/api/docs', {
  $fetch: {
    method: 'POST',
  },
  hooks: {
    onSuccess() {
      toast.add({
        title: 'Docs saved successfully',
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
        docs: [...event.data.docs],
      },
    },
  })

}

// Helpers to add/remove doc rows in the form
const handleDocs = {
  add() {
    if (!state.docs) {
      state.docs = [{ name: '', url: '' }]
    }
    state.docs.push({ name: '', url: '' })
  },

  remove(index: number) {
    if (state.docs && state.docs.length > 1) {
      state.docs.splice(index, 1)
    }
  },
}

</script>

<style scoped>

</style>
