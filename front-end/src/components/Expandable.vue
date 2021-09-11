<template>
  <div class="expandable" :style="{'--content-height': contentHeight}">
    <div class="expandable__header">
      <slot name="header" :toggle="toggle" :expand="expand" :collapse="collapse"/>
    </div>
    <div class="expandable__content" ref="expandable__content">
      <slot name="content" :toggle="toggle" :expand="expand" :collapse="collapse"/>
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
    expand() {
      this.$emit("expand", this.id);
    },
    collapse() {
      this.$emit("collapse", this.id);
    },
    toggle() {
      this.$emit("toggle", this.id);
    },
    handleExpand(toBeExpanded) {
      if (this.$el.classList.contains("expanded") !== toBeExpanded) {
        this.contentHeight = this.$refs.expandable__content.scrollHeight + "px";

        this.$el.classList.add("animating");

        setImmediate(() => {
          if (toBeExpanded) {
            this.$el.classList.add("expanded");
          } else {
            this.$el.classList.remove("expanded");
          }
        });
      }
    }
  }
};
</script>

<style>
.expandable > .expandable__content {
  background: #fff;
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
