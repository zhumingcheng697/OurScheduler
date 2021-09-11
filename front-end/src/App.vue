<template>
  <div id="app">
    <h1>{{ projectName }}</h1>
    <h2 class="centered">Welcome to {{ projectName }}, your best college schedule maker.</h2>
    <Expandable :expanded="expanded" @toggle="toggle" @expand="expand" @collapse="collapse">
      <template #header>
        <div class="middle-flex side-margin interactable" @click="toggle">
          <p><strong>Which university or college do you attend?</strong></p>
          <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
        </div>
      </template>
      <template #content>
        <p>I am {{ expanded ? "expanded" : "collapsed" }}</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A, ab adipisci at aut commodi dicta dolore eius facere fugit id incidunt odit omnis, optio quaerat repellendus sed ut vitae voluptatem.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur consequuntur deserunt dolores, doloribus enim eos error, et exercitationem impedit incidunt maiores minima minus natus placeat provident quidem sunt veniam voluptatem.</p>
      </template>
    </Expandable>
    <Expandable :expanded="expanded" @toggle="toggle" @expand="expand" @collapse="collapse">
      <template #header="{toggle, expand, collapse}">
        <p>
          <button @click="toggle">toggle</button>
          <button @click="expand" :disabled="expanded">expand</button>
          <button @click="collapse" :disabled="!expanded">collapse</button>
        </p>
      </template>
      <template #content>
        <p>I am {{ expanded ? "expanded" : "collapsed" }}</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. A, ab adipisci at aut commodi dicta dolore eius facere fugit id incidunt odit omnis, optio quaerat repellendus sed ut vitae voluptatem.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur consequuntur deserunt dolores, doloribus enim eos error, et exercitationem impedit incidunt maiores minima minus natus placeat provident quidem sunt veniam voluptatem.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequatur consequuntur deserunt dolores, doloribus enim eos error, et exercitationem impedit incidunt maiores minima minus natus placeat provident quidem sunt veniam voluptatem.</p>
      </template>
    </Expandable>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid assumenda blanditiis commodi corporis dignissimos eaque eius fugiat libero magni molestiae necessitatibus nisi repellendus repudiandae saepe, tempore ut voluptate. Expedita, unde.</p>
  </div>
</template>

<script>
import Expandable from "./components/Expandable.vue";

export default {
  name: "App",
  data() {
    return {
      projectName: "MyScheduler",
      expanded: false
    };
  },
  mounted() {
    this.expanded = true;
  },
  components: {
    Expandable
  },
  methods: {
    expand() {
      this.expanded = true;
    },
    collapse() {
      this.expanded = false;
    },
    toggle() {
      this.expanded = !this.expanded;
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

body {
  background: #f2f2f7;
  margin: 0;
  padding: 0;
}

span {
  transition: transform 0.5s;
}

p {
  /*margin: 20px;*/
}

.side-margin {
  margin-left: 20px;
  margin-right: 20px;
}

h1 {
  margin: 22px 20px;
  font-size: 2em;
  font-weight: 700;
}

h2 {
  margin: 60px 20px;
  font-size: 1.5em;
  font-weight: 600;
}

strong {
  font-size: 1.2em;
  font-weight: 600;
}

.centered {
  text-align: center;
}

.middle-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.interactable {
  cursor: pointer;
}

.interactable.disabled {
  cursor: not-allowed;
}

#app {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
