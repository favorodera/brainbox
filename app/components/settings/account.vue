<template>

  <div class="space-y-2">

    <h3 class="line-clamp-1 w-full text-lg font-normal">
      Account
    </h3>

    <USeparator />

    <UUser
      v-if="user"
      :name="user.name"
      :description="user.email"
      :avatar="{
        src: user.avatar,
        alt: user.name,
      }"
      size="3xl"
      orientation="vertical"
      class="items-center text-center"
    />

    <USeparator />

    <div class="space-y-2">

      <div class="flex justify-between">
        <p>
          Plan and Usage
        </p>

        <UBadge
          label="PRO"
          color="success"
          variant="soft"
        />
      </div>

      <UProgress
        size="sm"
        color="neutral"
        :model-value="5"
      />

    </div>

  </div>


</template>

<script setup lang="ts">
const { data: user } = await useUserStore('user')
</script>

<style scoped>

</style>
