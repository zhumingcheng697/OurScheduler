<template>
  <div id="app">
    <h1>{{ projectName }}</h1>
    <h2 class="centered-text">Welcome to {{ projectName }}, your best college schedule maker.</h2>
    <Expandable :id="'university'" :expanded="'university' === expandedSection">
      <template #header="{id, expanded}">
        <div tabindex="0" class="expandable-header__button clickable" @click="toggle(id)">
          <p :style="{ marginRight: '10px'}"><strong>Which university or college do you attend?</strong></p>
          <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="setSchoolUrl">
          <label for="school-name">School Name</label>
          <input class="centered-text" id="school-name" type="text" v-model="schoolNameTemp" placeholder="Zoom University">
          <input class="centered-text" type="submit" value="Search" :disabled="!schoolNameTemp">
        </form>
      </template>
    </Expandable>
    <Expandable :id="'classes'" :expanded="'classes' === expandedSection && !!schoolUrl">
      <template #header="{id, expanded}">
        <div :class="['expandable-header__button', 'clickable', {disabled: !schoolUrl}]" @click="toggle(id)">
          <p :style="{ marginRight: '10px'}"><strong>Which classes do you plan to take?</strong></p>
          <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="addClass">
          <label for="class-name">Class Name</label>
          <input class="centered-text" id="class-name" type="text" v-model="classTemp" placeholder="Social Distancing 101">
          <input class="centered-text" type="submit" value="Add" :disabled="!allowAddClass">
          <ul v-if="classesSet.length">
            <li v-for="(addedClass, index) in classesSet" :key="addedClass.name">
              <span :style="{ marginRight: '5px'}" class="clickable" @click="classesSet.splice(index, 1)"><strong>&times;</strong></span> {{ addedClass.name }}
            </li>
          </ul>
        </form>
      </template>
    </Expandable>
    <Expandable :id="'amount'" :expanded="'amount' === expandedSection && !!schoolUrl">
      <template #header="{id, expanded}">
        <div :class="['expandable-header__button', 'clickable', {disabled: !schoolUrl}]" @click="toggle(id)">
          <p :style="{ marginRight: '10px'}"><strong>How many credits or classes do you plan to take?</strong></p>
          <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="addClass">
              <label for="class-amount">Number of Classes</label>
              <input class="centered-text" type="text" id="class-amount" v-model="classAmount" placeholder="4">
              <label for="credit-amount">Number of Credits</label>
              <input class="centered-text" type="text" id="credit-amount" v-model="creditAmount" placeholder="12-18">
          <input class="centered-text" type="submit" value="Confirm" :disabled="!classAmount && !creditAmount">
        </form>
      </template>
    </Expandable>
  </div>
</template>

<script>
import axios from "axios";
import Expandable from "./components/Expandable.vue";

export default {
  name: "App",
  data() {
    return {
      projectName: "MyScheduler",
      expandedSection: "",
      schoolNameTemp: "",
      schoolNameSet: "",
      classTemp: "",
      classesSet: [{ priority: true, name: "Hand Washing 202" }, { priority: true, name: "Hand Washing 203" }],
      classAmount: "",
      creditAmount: "",
      schoolUrl: "http"
    };
  },
  mounted() {
    this.expandedSection = "university";
  },
  computed: {
    allowAddClass() {
      return !!this.classTemp && !this.classesSet.find((e) => e.name === this.classTemp);
    }
  },
  components: {
    Expandable
  },
  methods: {
    expand(id) {
      this.expandedSection = id;
    },
    collapse() {
      this.expandedSection = "";
    },
    toggle(id) {
      this.expandedSection = (this.expandedSection === id) ? "" : id;
    },
    setSchoolUrl() {
      try {
        this.schoolUrl = "";

        axios.get("https://www.google.com").then(({ data }) => {
          // if (data) {
          this.schoolUrl = data;
          this.schoolNameSet = this.schoolNameTemp;
          this.expand("classes");
          // } else {
          //   alert("Unfortunately, your school is not supported at the moment.");
          // }
        }).catch(() => {
          // console.error(e);
        });
      } catch (e) {
        // console.error(e);
      }
    },
    addClass() {
      this.classesSet.push(Object.assign({ priority: false }, { name: this.classTemp }));


      // try {
      //   axios.get("https://www.google.com").then(({ data }) => {
      //     // if (data) {
      //     this.classesSet.push(Object.assign({ priority: false }, data));
      //   }).catch(() => {
      //     // console.error(e);
      //   });
      // } catch (e) {
      //   // console.error(e);
      // }
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

body {
  background: #f0f8fa;
  margin: 0;
  padding: 0;
}

span {
  transition: transform 0.5s;
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

.centered-text {
  text-align: center;
}

.expandable-header__button {
  padding: 0 20px;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clickable {
  cursor: pointer;
  transition: background-color 0.5s;
}

.expandable > .expandable__content {
  background: #fafeff;
}

.expandable .expandable-header__button {
  transition: background-color 0.5s;
}

.expandable .expandable-header__button:not(.disabled):hover {
  background: #e4eff2;
}

.expandable .clickable.disabled {
  opacity: 50%;
}

.clickable.disabled {
  cursor: not-allowed;
}

form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

form > *:first-child {
  margin-top: 40px;
}

form > * {
  margin: 10px;
}

form > *:last-child {
  margin-bottom: 40px;
}

form > label {
  margin-bottom: 0;
}

input {
  font-family: 'Open Sans', sans-serif;
}

input[type=text] {
  box-sizing: border-box;
  width: min(800px, calc(100% - 40px));
  outline: none;
  border: solid #bfd5db 2px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 1.4em;
}

input[type=submit] {
  color: #0e3945;
  background: #daecf0;
  cursor: pointer;
  border: none;
  outline: none;
  border-radius: 10px;
  padding: 12px 25px;
  font-size: 0.9em;
  transition: background-color 0.5s;
}

input[type=submit]:not(:disabled):hover {
  background: #ccdfe3;
}

input[type=submit]:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

ul {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
}

li {
  display: inline-flex;
  list-style: none;
  font-size: 1em;
  margin: 10px;
  justify-content: center;
  align-items: center
}

#app {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #0e3945;
}
</style>
