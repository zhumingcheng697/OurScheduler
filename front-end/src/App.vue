<template>
  <div id="app">
    <div class="top">
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
          <label for="class-name">Class Code</label>
          <input class="centered-text" id="class-name" type="text" v-model="classTemp" placeholder="CS 101">
          <input class="centered-text" type="submit" value="Add" :disabled="!allowAddClass">
          <ul v-if="classesSet.length">
            <li v-for="(addedClass, index) in classesSet" :key="addedClass.name">
              <span :style="{ marginRight: '5px'}" class="clickable" @click="classesSet[index].locked = !classesSet[index].locked"><strong v-if="classesSet[index].locked" :style="{color: '#ff2', textShadow: '0 0 2px #3309'}">&#9733;</strong><strong v-else>&#9734;</strong></span>
              {{ addedClass.name }}<span :style="{ marginLeft: '5px'}" class="clickable" @click="classesSet.splice(index, 1)"><strong>&times;</strong></span>
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
        <form @submit.prevent="setClassCredit">
          <label for="class-amount">Number of Classes</label>
          <input class="centered-text" type="text" id="class-amount" v-model="classAmountTemp" placeholder="4">
          <label for="credit-amount">Number of Credits</label>
          <input class="centered-text" type="text" id="credit-amount" v-model="creditAmountTemp" placeholder="12-18">
          <input class="centered-text" type="submit" value="Confirm" :disabled="!isClassCreditValid">
        </form>
      </template>
    </Expandable>
    <Expandable :id="'summary'" :expanded="'summary' === expandedSection && !!schoolUrl">
      <template #header="{id, expanded}">
        <div :class="['expandable-header__button', 'clickable', {disabled: !schoolUrl || (!classAmountSet && !creditAmountSet)}]" @click="toggle(id)">
          <p :style="{ marginRight: '10px'}"><strong>Summary</strong></p>
          <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="">
          <p><strong>{{ schoolNameSet }}</strong></p>
          <p>
            <span v-if="classAmountFormatted">{{ classAmountFormatted }} Classes</span>
            <span v-if="classAmountFormatted && creditAmountFormatted">, </span>
            <span v-if="creditAmountFormatted">{{ creditAmountFormatted }} Credits</span>
          </p>
          <ul v-if="classesSet.length">
            <li v-for="(addedClass, index) in classesSet" :key="addedClass.name">
              <span :style="{ marginRight: '5px'}" class=""><strong v-if="classesSet[index].locked" :style="{color: '#ff2', textShadow: '0 0 2px #3309'}">&#9733;</strong><strong v-else>&#9734;</strong></span>
              {{ addedClass.name }}
            </li>
          </ul>
          <input class="centered-text" type="submit" value="Generate Schedule">
        </form>
      </template>
    </Expandable>
    </div>
    <footer class="centered-text">&COPY; 2021 Hackers Union</footer>
  </div>
</template>

<script>
// import axios from "axios";
import Expandable from "./components/Expandable.vue";

export default {
  name: "App",
  data() {
    return {
      projectName: "OurScheduler",
      expandedSection: "",
      schoolNameTemp: "",
      schoolNameSet: "",
      classTemp: "",
      classesSet: [],
      classAmountTemp: "",
      creditAmountTemp: "",
      classAmountSet: null,
      creditAmountSet: null,
      schoolUrl: ""
    };
  },
  watch: {
    expandedSection(toBeExpanded) {
      switch (toBeExpanded) {
        case "university":
          if (this.schoolNameSet) {
            this.schoolNameTemp = this.schoolNameSet;
          }
          break;
        case "classes":
          this.classTemp = "";
          break;
        case "amount":
          if (this.classAmountSet && this.creditAmountSet) {
            this.classAmountTemp = this.classAmountFormatted;
            this.creditAmountTemp = this.creditAmountFormatted;
          } else if (this.classAmountSet) {
            this.classAmountTemp = this.classAmountFormatted;
            this.creditAmountTemp = "";
          } else if (this.creditAmountSet) {
            this.creditAmountTemp = this.creditAmountFormatted;
            this.classAmountTemp = "";
          }
          break;
      }
    }
  },
  mounted() {
    this.expandedSection = "university";
  },
  computed: {
    allowAddClass() {
      return !!this.classTemp && !this.classesSet.find((e) => e.name === this.classTemp);
    },
    isClassAmountValid() {
      return /^[1-9](?:-[1-9])?$/.test(this.classAmountTemp);
    },
    isCreditAmountValid() {
      return /^(?:[1-3][0-9]|[1-9])(?:-(?:[1-3][0-9]|[1-9]))?$/.test(this.creditAmountTemp);
    },
    isClassCreditValid() {
      return (this.classAmountTemp || this.creditAmountTemp) && (!this.classAmountTemp || this.isClassAmountValid) && (!this.creditAmountTemp || this.isCreditAmountValid);
    },
    classAmountFormatted() {
      if (this.classAmountSet) {
        return this.classAmountSet[0] === this.classAmountSet[1] ? `${this.classAmountSet[0]}` : this.classAmountSet.join("-");
      }
      return "";
    },
    creditAmountFormatted() {
      if (this.creditAmountSet) {
        return this.creditAmountSet[0] === this.creditAmountSet[1] ? `${this.creditAmountSet[0]}` : this.creditAmountSet.join("-");
      }
      return "";
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
      this.schoolNameSet = this.schoolNameTemp;
      this.schoolUrl = "https://";
      this.expandedSection = "classes";
      // try {
      //   this.schoolUrl = "";
      //
      //   axios.get("https://www.google.com").then(({ data }) => {
      //     // if (data) {
      //     this.schoolUrl = data;
      //     this.schoolNameSet = this.schoolNameTemp;
      //     this.expand("classes");
      //     // } else {
      //     //   alert("Unfortunately, your school is not supported at the moment.");
      //     // }
      //   }).catch(() => {
      //     // console.error(e);
      //   });
      // } catch (e) {
      //   // console.error(e);
      // }
    },
    addClass() {
      this.classesSet.push(Object.assign({ locked: false }, { name: this.classTemp }));


      // try {
      //   axios.get("https://www.google.com").then(({ data }) => {
      //     // if (data) {
      //     this.classesSet.push(Object.assign({ locked: false }, data));
      //   }).catch(() => {
      //     // console.error(e);
      //   });
      // } catch (e) {
      //   // console.error(e);
      // }
    },
    setClassCredit() {
      if (this.classAmountTemp) {
        const range = this.classAmountTemp.split("-").map(Number);
        this.classAmountSet = range.length === 1 ? [range[0], range[0]] : [Math.min(...range), Math.max(...range)];
      } else {
        this.classAmountSet = null;
      }

      if (this.creditAmountTemp) {
        const range = this.creditAmountTemp.split("-").map(Number);
        this.creditAmountSet = range.length === 1 ? [range[0], range[0]] : [Math.min(...range), Math.max(...range)];
      } else {
        this.creditAmountSet = null;
      }

      this.expandedSection = "summary";
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
  min-height: 100vh;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clickable {
  user-select: none;
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
  opacity: 0.5;
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

form > p {
  margin-top: 5px;
  margin-bottom: 5px;
}

label {
  font-size: 1em;
}

input {
  font-family: 'Open Sans', sans-serif;
}

input[type=text] {
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  box-sizing: border-box;
  width: min(800px, calc(100% - 40px));
  outline: none;
  border: solid #bfd5db 2px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 1.4em;
}

input[type=submit] {
  -webkit-appearance: none;
  -webkit-border-radius: 0;
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
  opacity: 0.5;
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
  margin: 8px;
  padding: 5px 10px;
  background: #e9f1f2;
  border-radius: 8px;
  justify-content: center;
  align-items: center
}

footer {
  margin: 20px;
}

#app {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  color: #0e3945;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
