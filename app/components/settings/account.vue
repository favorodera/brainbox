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

    <div class="space-y-2" />

  </div>


</template>

<script setup lang="ts">
const { data: user } = await useUserStore('user')
</script>
