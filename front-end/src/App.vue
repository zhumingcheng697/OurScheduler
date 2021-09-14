<template>
  <div id="app" :class="{loading}">
    <div class="top">
      <h1>{{ projectName }}</h1>
      <h2 class="centered-text">Welcome to {{ projectName }}, your best college schedule maker.</h2>
      <Expandable :id="'university'" :expanded="'university' === expandedSection">
        <template #header="{id, expanded}">
          <div class="expandable-header__button clickable" @click="toggle(id)">
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
      <Expandable :id="'classes'" :expanded="'classes' === expandedSection">
        <template #header="{id, expanded}">
          <div :class="['expandable-header__button', 'clickable', {disabled: !schoolId}]" @click="schoolId && toggle(id)">
            <p :style="{ marginRight: '10px'}"><strong>Which classes do you plan to take?</strong></p>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="addClass">
            <label for="class-code">Class Name or Class Code</label>
            <input class="centered-text" id="class-code" type="text" v-model="classTemp" placeholder="Intro to Handwashing / HW 101">
            <input class="centered-text" type="submit" value="Add" :disabled="!allowAddClass">
            <ul v-if="classesSet.length">
              <li v-for="(addedClass, index) in classesSet" :key="addedClass.name">
                <span :style="{ marginRight: '5px'}" class="clickable" @click="classesSet[index].locked = !classesSet[index].locked"><strong v-if="classesSet[index].locked" :style="{color: '#ff2', textShadow: '0 0 2px #3309'}">&#9733;</strong><strong v-else>&#9734;</strong></span>
                {{ addedClass.name }}<span :style="{ marginLeft: '5px'}" class="clickable" @click="classesSet.splice(index, 1)"><strong>&times;</strong></span>
              </li>
            </ul>
            <label v-if="classesSet.length">Click &#9734; to lock or unlock each class from your schedule.</label>
          </form>
        </template>
      </Expandable>
      <Expandable :id="'amount'" :expanded="'amount' === expandedSection">
        <template #header="{id, expanded}">
          <div :class="['expandable-header__button', 'clickable', {disabled: !schoolId}]" @click="schoolId && toggle(id)">
            <p :style="{ marginRight: '10px'}"><strong>How many credits or classes do you plan to take?</strong></p>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="setClassCredit">
            <label for="class-amount">Number of Classes</label>
            <input class="centered-text" type="text" id="class-amount" v-model="classAmountTemp" placeholder="4-5">
            <label for="credit-amount">Number of Credits</label>
            <input class="centered-text" type="text" id="credit-amount" v-model="creditAmountTemp" placeholder="12-18">
            <input class="centered-text" type="submit" value="Confirm" :disabled="!isClassCreditValid">
          </form>
        </template>
      </Expandable>
      <Expandable :id="'summary'" :expanded="'summary' === expandedSection">
        <template #header="{id, expanded}">
          <div :class="['expandable-header__button', 'clickable', {disabled: !schoolId || !classesSet.length || (!classAmountSet && !creditAmountSet)}]" @click="schoolId && classesSet.length && (classAmountSet || creditAmountSet) && toggle(id)">
            <p :style="{ marginRight: '10px'}"><strong>Summary</strong></p>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="generateSchedule">
            <p class="clickable" @click="expandedSection = 'university'">
              <strong>{{ schoolId }}</strong></p>
            <p class="clickable" @click="expandedSection = 'amount'">
              <span v-if="classAmountFormatted">{{ classAmountFormatted }} Classes</span>
              <span v-if="classAmountFormatted && creditAmountFormatted">, </span>
              <span v-if="creditAmountFormatted">{{ creditAmountFormatted }} Credits</span>
            </p>
            <ul v-if="classesSet.length" class="clickable" @click="expandedSection = 'classes'">
              <li v-for="(addedClass, index) in classesSet" :key="addedClass.name">
                <span :style="{ marginRight: '5px'}" class=""><strong v-if="classesSet[index].locked" :style="{color: '#ff2', textShadow: '0 0 2px #3309'}">&#9733;</strong><strong v-else>&#9734;</strong></span>
                {{ addedClass.name }}
              </li>
            </ul>
            <input class="centered-text" type="submit" value="Generate Schedule">
          </form>
        </template>
      </Expandable>
      <Expandable :id="'schedules'" :expanded="'schedules' === expandedSection">
        <template #header="{id, expanded}">
          <div :class="['expandable-header__button', 'clickable', {disabled: !schoolId || !classesSet.length || (!classAmountSet && !creditAmountSet) || !generatedSchedules}]" @click="schoolId && classesSet.length && (classAmountSet || creditAmountSet) && generatedSchedules && toggle(id)">
            <p :style="{ marginRight: '10px'}"><strong>Schedules</strong></p>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </div>
        </template>
        <template #content>
          <div id="d3-schedule" ref="d3-schedule"></div>
        </template>
      </Expandable>
    </div>
    <footer class="centered-text">&COPY; 2021 Hackers Union</footer>
  </div>
</template>

<script>
import * as d3 from "d3";
import axios from "axios";
import Expandable from "./components/Expandable.vue";

export default {
  name: "App",
  data() {
    return {
      loading: false,
      projectName: "OurScheduler",
      expandedSection: "",
      schoolNameTemp: "",
      classTemp: "",
      classesSet: [],
      classAmountTemp: "",
      creditAmountTemp: "",
      classAmountSet: null,
      creditAmountSet: null,
      schoolId: "",
      generatedSchedules: null
    };
  },
  watch: {
    expandedSection(toBeExpanded) {
      switch (toBeExpanded) {
        case "university":
          if (this.schoolId) {
            this.schoolNameTemp = this.schoolId;
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
    },
    classesSet() {
      this.generatedSchedules = null;
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
      return /^(?:1[0-9]|[1-9])(?:-(?:1[0-9]|[1-9]))?$/.test(this.classAmountTemp);
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
      if (this.schoolId !== this.schoolNameTemp) {
        this.classTemp = "";
        this.classesSet = [];
        this.generatedSchedules = null;
      } else {
        setTimeout(() => {
          this.expandedSection = "classes";
        }, 10);
        return;
      }

      this.loading = true;

      try {
        this.schoolId = "";

        const target = this.schoolNameTemp;

        axios.get(`https://ourscheduler.herokuapp.com/search/${target}`).then(({ data }) => {
          if (typeof data === "string") {
            this.schoolId = data.toUpperCase();
            this.expand("classes");

            setTimeout(() => {
              this.expandedSection = "classes";
            }, 10);
          } else {
            alert("Unfortunately, something went wrong.");
          }
          this.loading = false;
        }).catch((e) => {
          console.error(e);
          alert("Unfortunately, something went wrong.");
          this.loading = false;
        });
      } catch (e) {
        console.error(e);
        alert("Unfortunately, something went wrong.");
        this.loading = false;
      }
    },
    addClass() {
      this.generatedSchedules = null;
      this.loading = true;

      const school = this.schoolId.toLowerCase();
      const target = this.classTemp.toUpperCase();
      try {
        axios.get(`https://ourscheduler.herokuapp.com/retrieve/${school}/${target}`).then(({ data }) => {
          if (data) {
            this.classTemp = "";

            const displayName = `${data.name} (${data.label})`;
            if (!this.classesSet.find((el) => el.name === displayName)) {
              this.classesSet.push({ locked: false, name: displayName, label: data.label });
            }
            this.loading = false;
          } else {
            alert("Unfortunately, this class does not exist.");
            this.loading = false;
          }
        }).catch((e) => {
          console.error(e);
          alert("Unfortunately, something went wrong.");
          this.loading = false;
        });
      } catch (e) {
        console.error(e);
        alert("Unfortunately, something went wrong.");
        this.loading = false;
      }
    },
    setClassCredit() {
      if (this.classAmountTemp !== this.classAmountFormatted || this.creditAmountTemp !== this.creditAmountFormatted) {
        this.generatedSchedules = null;
      }

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

      this.expandedSection = this.classesSet.length ? "summary" : "classes";
    },
    generateSchedule() {
      this.loading = true;

      const prop = {
        classList: this.classesSet.map((el) => ([this.schoolId.toLowerCase(), el.label.toUpperCase()])),
        locked: this.classesSet.filter((el) => el.locked).map((el) => el.label),
        restrictions: {
          minCredit: this.creditAmountSet && this.creditAmountSet[0] || 1,
          maxCredit: this.creditAmountSet && this.creditAmountSet[1] || 39,
          minCourses: this.classAmountSet && this.classAmountSet[0] || 1,
          maxCourses: this.classAmountSet && this.classAmountSet[1] || 19
        }
      };

      this.generatedSchedules = null;

      try {
        axios.get(`https://ourscheduler.herokuapp.com/generate/?prop=${encodeURI(JSON.stringify(prop))}`).then(({ data }) => {
          this.runD3(data[0]);
          this.generatedSchedules = data;
          this.loading = false;
          setTimeout(() => {
            this.expandedSection = "schedules";
          }, 10);
        }).catch((e) => {
          console.error(e);
          alert("Unfortunately, something went wrong.");
          this.loading = false;
        });
      } catch (e) {
        console.error(e);
        alert("Unfortunately, something went wrong.");
        this.loading = false;
      }
    },
    runD3(schedules) {

      const STIME = 1605070800000;
      const ETIME = 1605157200000;
      const calendarEvents = [
        {
          timeFrom: STIME,
          timeTo: STIME,
          title: "",
          background: "#EBECF0",
          day: 0
        },
        {
          timeFrom: ETIME,
          timeTo: ETIME,
          title: "",
          background: "#EBECF0",
          day: 0
        }
      ];
      for (let i = 0; i < schedules.length; i++) {
        calendarEvents.push({
          timeFrom: schedules[i][1][0] % 1440 * 60000 + STIME,
          timeTo: schedules[i][1][1] % 1440 * 60000 + STIME,
          title: schedules[i][0],
          background: "#EBECF0",
          day: parseInt(schedules[i][1][0] / 1440)
        });
      }
// Make an array of dates to use for our yScale later on
      const dates = [
        ...calendarEvents.map(d => new Date(d.timeFrom)),
        ...calendarEvents.map(d => new Date(d.timeTo))
      ];
      const margin = { top: 30, right: 30, bottom: 30, left: 50 }; // Gives space for axes and other margins
      const height = 1500;
      const width = 960;
      const barWidth = 900;
      const barHeight = 1475;
      // const nowColor = "#EA4335";
      const barStyle = {
        background: "#616161",
        textColor: "black",
        dayColor: "black",
        width: barWidth,
        height: barHeight,
        startPadding: 2,
        endPadding: 3,
        radius: 3
      };
// Create the SVG element
      const svg = d3.create("svg").attr("width", width).attr("height", height);
// All further code additions will go just below this line
      const yScale = d3.scaleTime().domain([d3.min(dates), d3.max(dates)]).range([margin.top, height - margin.bottom]);
      const yAxis = d3.axisLeft().ticks(24).scale(yScale);

      svg.append("g").attr("transform", `translate(${margin.left},0)`).attr("opacity", 0.5).call(yAxis);
      svg.selectAll("g.tick").filter((d, i, ticks) => i === 0 || i === ticks.length - 1).select("text").text("12 AM");

      const gridLines = d3.axisRight().ticks(24).tickSize(barStyle.width) // even though they're "ticks" we've set them to be full-width
          .tickFormat("").scale(yScale);
      svg.append("text").attr("font-family", "Helvetica").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "start").attr("fill", barStyle.dayColor).attr("x", 85).attr("y", 15).text("Monday");
      svg.append("text").attr("font-family", "Helvetica").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "start").attr("fill", barStyle.dayColor).attr("x", 235).attr("y", 15).text("Tuesday");
      svg.append("text").attr("font-family", "Helvetica").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "start").attr("fill", barStyle.dayColor).attr("x", 370).attr("y", 15).text("Wednesday");
      svg.append("text").attr("font-family", "Helvetica").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "start").attr("fill", barStyle.dayColor).attr("x", 530).attr("y", 15).text("Thursday");
      svg.append("text").attr("font-family", "Helvetica").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "start").attr("fill", barStyle.dayColor).attr("x", 695).attr("y", 15).text("Friday");
      svg.append("text").attr("font-family", "Helvetica").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "start").attr("fill", barStyle.dayColor).attr("x", 835).attr("y", 15).text("Saturday");
      svg.append("g").attr("transform", `translate(${margin.left},0)`).attr("opacity", 0.3).call(gridLines);
      const barGroups = svg.selectAll("g.barGroup").data(calendarEvents).join("g").attr("class", "barGroup");
      barGroups.append("rect").attr("fill", d => d.background || barStyle.background).attr("x", d => margin.left + barWidth / 6 * d.day).attr("y", d => yScale(new Date(d.timeFrom)) + barStyle.startPadding).attr("height", d => {
        const startPoint = yScale(new Date(d.timeFrom));
        const endPoint = yScale(new Date(d.timeTo));
        return (
            endPoint - startPoint - barStyle.endPadding - barStyle.startPadding
        );
      }).attr("width", barWidth / 6).attr("rx", barStyle.radius);
      barGroups.append("text").attr("font-family", "Helvetica").attr("font-size", 8).attr("font-weight", 500).attr("text-anchor", "start").attr("fill", barStyle.textColor).attr("x", d => 10 + margin.left + barWidth / 6 * d.day).attr("y", d => yScale(new Date(d.timeFrom)) + 20).text(d => d.title);

// Actually add the element to the page
      const element = this.$refs["d3-schedule"];
      while (element.firstChild) {
        element.removeChild(element.firstChild)
      }
      element.append(svg.node());
      // document.body.append(svg.node());
// This part ^ always goes at the end of our index.js
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

body {
  background: #f0f8fa;
  /*margin: 0;*/
  padding: 0;
  min-height: 100vh;
  max-width: 960px;
  margin: 0 auto;
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
  margin: 10px 20px;
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

#app.loading * {
  cursor: wait;
}

#d3-schedule {
  overflow: auto;
}
</style>
