<template>
  <UChatPrompt
    id="chat-prompt"
    class="[view-transition-name:chat-prompt]"
    variant="subtle"
    placeholder="Ask anything..."
    name="chat-prompt"
    autofocus
    autoresize
    autocapitalize
    autocorrect
    :ui="{
      footer: 'justify-between gap-4',
    }"
  >

    <template #footer>
      <USelectMenu
        v-model="model"
        :items="models"
        :icon="selectedModel?.icon"
        variant="ghost"
        value-key="value"
        :search-input="{
          placeholder: 'Search models...',
        }"
        class="w-min"
        :ui="{
          leadingIcon: 'size-4',
          trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
        }"
      />
  
      <UChatPromptSubmit color="neutral" />
    </template>

  </UChatPrompt>
</template>

<script setup lang="ts">
const { model, models } = useAiModels()

const selectedModel = useArrayFind(models, selected => selected.value === model.value)

</script>

<style scoped>

</style>
