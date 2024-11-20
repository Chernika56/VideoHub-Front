<template>
  <div class="item">
    <i>
      <slot name="icon"></slot>
    </i>
    <div class="details">
      <h3>
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 991px) {
  .item {
    left: 170px;
  }
}

.item {
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
