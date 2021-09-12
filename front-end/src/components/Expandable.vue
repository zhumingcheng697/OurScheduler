<template>
  <div class="expandable" :style="{'--content-height': contentHeight}">
    <div class="expandable__header">
      <slot name="header" :id="id" :expanded="expanded"/>
    </div>
    <div class="expandable__content" ref="expandable__content">
      <slot name="content" :id="id" :expanded="expanded"/>
    </div>
  </div>
</template>

<script>
export default {
  name: "Expandable",
  data() {
    return {
      contentHeight: "0px"
    };
  },
  props: {
    id: [Number, String, Symbol],
    expanded: Boolean
  },
  watch: {
    expanded(toBeExpanded) {
      this.handleExpand(toBeExpanded);
    }
  },
  mounted() {
    this.handleExpand(this.expanded);

    this.$refs.expandable__content.addEventListener("transitionend", () => {
      this.$el.classList.remove("animating");
    });
  },
  methods: {
    handleExpand(toBeExpanded) {
      if (this.$el.classList.contains("expanded") !== toBeExpanded) {
        this.contentHeight = this.$refs.expandable__content.scrollHeight + "px";

        this.$el.classList.add("animating");

        setTimeout(() => {
          if (toBeExpanded) {
            this.$el.classList.add("expanded");
          } else {
            this.$el.classList.remove("expanded");
          }
        }, 10);
      }
    }
  }
};
</script>

<style>
.expandable > .expandable__content {
  overflow: hidden;
  transition: height 0.5s;
}

.expandable.expanded.animating > .expandable__content {
  height: var(--content-height);
}

.expandable:not(.expanded) > .expandable__content {
  height: 0px;
}
</style>
