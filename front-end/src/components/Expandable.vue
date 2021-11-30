<template>
  <div class="expandable" :style="{'--content-height': contentHeight}">
    <div class="expandable__header">
      <slot name="header" :id="id" :expanded="expanded"/>
    </div>
    <div class="expandable__content" ref="expandable__content" :aria-hidden="!expanded">
      <slot name="content" :id="id" :expanded="expanded"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: "Expandable",
  data() {
    return {
      contentHeight: "0px" as string
    };
  },
  props: {
    id: [Number, String, Symbol],
    expanded: Boolean
  },
  watch: {
    expanded(toBeExpanded: boolean): void {
      this.handleExpand(toBeExpanded);
    }
  },
  mounted(): void {
    this.handleExpand(this.expanded);

    (this.$refs.expandable__content as Element).addEventListener("transitionend", () => {
      this.$el.classList.remove("animating");
    });
  },
  methods: {
    handleExpand(toBeExpanded: boolean): void {
      if (this.$el.classList.contains("expanded") !== toBeExpanded) {
        this.contentHeight = (this.$refs.expandable__content as Element).scrollHeight + "px";

        this.$el.classList.add("animating");

        setTimeout(() => {
          if (toBeExpanded) {
            this.$el.classList.add("expanded");
          } else {
            this.$el.classList.remove("expanded");
          }
        }, 5);
      }
    }
  }
});
</script>

<style>
.expandable > .expandable__content {
  overflow: hidden;
}

.expandable.expanded.animating > .expandable__content {
  height: var(--content-height);
  opacity: 1;
}

.expandable:not(.expanded) > .expandable__content {
  height: 0;
  opacity: 0;
}
</style>
