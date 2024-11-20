<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 991px) {
  .about {
    left: 170px;
  }
}

.about{
  position: fixed;
  top: 42px;
  bottom: 0;
  right: 0;
  overflow: auto;
  overflow-x: hidden;
  padding: 20px;
  position: relative;
  min-height: 100%;
  background-color: var(--backgroundColorMain, #f3f5f7);
}
</style>