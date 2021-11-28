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
            <input class="centered-text" id="school-name" name="school-name" type="text" v-model="schoolNameTemp" placeholder="Zoom University" autocomplete="organization">
            <input class="centered-text" type="submit" value="Search" :disabled="!schoolNameTemp || loading">
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
            <input class="centered-text" id="class-code" name="class-code" type="text" v-model="classTemp" placeholder="Intro to Handwashing / HW 101" autocomplete="off">
            <input class="centered-text" type="submit" value="Add" :disabled="!allowAddClass || loading">
            <ul v-if="classesSet.length">
              <li v-for="(addedClass, index) in classesSet" :key="addedClass.name">
                <span :style="{ marginRight: '5px'}" class="clickable" @click="toggleClassLock(index)"><strong v-if="classesSet[index].locked" class="star">&#9733;</strong><strong v-else>&#9734;</strong></span>
                {{ addedClass.displayName }}<span :style="{ marginLeft: '5px'}" class="clickable" @click="classesSet.splice(index, 1)"><strong>&times;</strong></span>
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
            <input class="centered-text" type="text" id="class-amount" name="class-amount" v-model="classAmountTemp" placeholder="4-5" autocomplete="off">
            <label for="credit-amount">Number of Credits</label>
            <input class="centered-text" type="text" id="credit-amount" name="credit-amount" v-model="creditAmountTemp" placeholder="12-18" autocomplete="off">
            <input class="centered-text" type="submit" value="Confirm" :disabled="!isClassCreditValid">
            <label>You have selected {{ classesSet.length }} class{{ classesSet.length === 1 ? "" : "es" }} worth of {{ creditSum }} credit{{ creditSum === 1 ? "" : "s" }} so far.</label>
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
            <p class="clickable" @click="expand('university')">
              <strong>{{ schoolId }}</strong></p>
            <p class="clickable" @click="expand('amount')">
              <span v-if="classAmountSet">{{ classAmountFormattedLong(true) }}</span>
              <span v-if="classAmountSet && creditAmountSet">, </span>
              <span v-if="creditAmountSet">{{ creditAmountFormattedLong(true) }}</span>
            </p>
            <ul v-if="classesSet.length" class="clickable" @click="expand('classes')">
              <li v-for="(addedClass, index) in classesSet" :key="addedClass.name">
                <span :style="{ marginRight: '5px'}" class=""><strong v-if="classesSet[index].locked" class="star">&#9733;</strong><strong v-else>&#9734;</strong></span>
                {{ addedClass.displayName }}
              </li>
            </ul>
            <input class="centered-text" type="submit" value="Generate Schedule" :disabled="loading">
          </form>
        </template>
      </Expandable>
      <Expandable :id="'schedules'" :expanded="'schedules' === expandedSection">
        <template #header="{id, expanded}">
          <div :class="['expandable-header__button', 'clickable', {disabled: !schoolId || !classesSet.length || (!classAmountSet && !creditAmountSet) || !generatedSchedules || typeof currentScheduleIndex !== 'number'}]" @click="schoolId && classesSet.length && (classAmountSet || creditAmountSet) && generatedSchedules && typeof currentScheduleIndex === 'number' && toggle(id)">
            <p :style="{ marginRight: '10px'}"><strong>Schedules</strong></p>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </div>
        </template>
        <template #content>
          <div id="d3-schedule" ref="d3-schedule"></div>
          <form @submit.prevent="swapSchedule">
            <input class="centered-text" type="submit" value="Shuffle" :disabled="noShuffle">
          </form>
        </template>
      </Expandable>
    </div>
    <footer class="centered-text">&COPY; 2021 Hackers Union</footer>
  </div>
</template>

<script lang="ts">
import * as d3 from "d3";
import Vue from "vue";
import axios from "axios";
import Expandable from "./components/Expandable.vue";

interface ClassData {
  locked: boolean,
  credits: number,
  name: string,
  displayName: string,
  label: string
}

const keepAlive: (() => void) = (() => {
  let timeoutId: number;

  return function ping(): void {
    clearTimeout(timeoutId);
    axios.get(`https://ourscheduler.herokuapp.com/keep-alive`);
    timeoutId = setTimeout(ping, 3 * 60 * 1000);
  }
})();

type ScheduleData = [string, [number, number]][];

type NumberRange = [number, number];

export default Vue.extend({
  name: "App",
  data() {
    return {
      loading: false as boolean,
      projectName: "OurScheduler" as string,
      expandedSection: "" as string,
      schoolNameTemp: "" as string,
      classTemp: "" as string,
      classesSet: [] as ClassData[],
      classAmountTemp: "" as string,
      creditAmountTemp: "" as string,
      classAmountSet: null as (NumberRange | null),
      creditAmountSet: null as (NumberRange | null),
      schoolId: "" as string,
      generatedSchedules: null as (ScheduleData[] | null),
      currentScheduleIndex: null as (number | null),
      noShuffle: false as boolean,
      prevProp: "" as string
    };
  },
  watch: {
    expandedSection(toBeExpanded: string): void {
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
    classesSet(): void {
      this.currentScheduleIndex = null;
    }
  },
  mounted(): void {
    keepAlive();
    this.expand("university");
    // this.expand("schedules");
    // this.runD3([["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]]);
    // this.currentScheduleIndex = 0;
    // this.generatedSchedules = [[["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [660, 740]], ["OBJECT ORIENTED PROGRAMMING", [3540, 3620]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [1020, 1100]], ["OBJECT ORIENTED PROGRAMMING", [3900, 3980]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [1020, 1100]], ["OBJECT ORIENTED PROGRAMMING", [3900, 3980]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [1020, 1100]], ["OBJECT ORIENTED PROGRAMMING", [3900, 3980]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [1020, 1100]], ["OBJECT ORIENTED PROGRAMMING", [3900, 3980]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [1020, 1100]], ["OBJECT ORIENTED PROGRAMMING", [3900, 3980]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [1020, 1100]], ["OBJECT ORIENTED PROGRAMMING", [3900, 3980]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [1020, 1100]], ["OBJECT ORIENTED PROGRAMMING", [3900, 3980]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [1020, 1100]], ["OBJECT ORIENTED PROGRAMMING", [3900, 3980]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [570, 650]], ["OBJECT ORIENTED PROGRAMMING", [3450, 3530]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [570, 650]], ["OBJECT ORIENTED PROGRAMMING", [3450, 3530]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [570, 650]], ["OBJECT ORIENTED PROGRAMMING", [3450, 3530]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [570, 650]], ["OBJECT ORIENTED PROGRAMMING", [3450, 3530]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [570, 650]], ["OBJECT ORIENTED PROGRAMMING", [3450, 3530]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [570, 650]], ["OBJECT ORIENTED PROGRAMMING", [3450, 3530]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [570, 650]], ["OBJECT ORIENTED PROGRAMMING", [3450, 3530]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [570, 650]], ["OBJECT ORIENTED PROGRAMMING", [3450, 3530]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6240, 6410]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6420, 6590]]], [["OBJECT ORIENTED PROGRAMMING", [930, 1010]], ["OBJECT ORIENTED PROGRAMMING", [3810, 3890]], ["OBJECT ORIENTED PROGRAMMING", [6600, 6770]]]];
  },
  computed: {
    allowAddClass(): boolean {
      return !!this.classTemp && !this.classesSet.find((e) => e.name === this.classTemp.trim().toUpperCase() || e.label === this.classTemp.trim().toUpperCase());
    },
    isClassAmountValid(): boolean {
      return /^(?:1[0-9]|[1-9])(?:-(?:1[0-9]|[1-9]))?$/.test(this.classAmountTemp);
    },
    isCreditAmountValid(): boolean {
      return /^(?:[1-3][0-9]|[1-9])(?:-(?:[1-3][0-9]|[1-9]))?$/.test(this.creditAmountTemp);
    },
    isClassCreditValid(): boolean {
      return (!!this.classAmountTemp || !!this.creditAmountTemp) && (!this.classAmountTemp || this.isClassAmountValid) && (!this.creditAmountTemp || this.isCreditAmountValid);
    },
    classAmountFormatted(): string {
      if (this.classAmountSet) {
        return this.classAmountSet[0] === this.classAmountSet[1] ? `${ this.classAmountSet[0] }` : this.classAmountSet.join("-");
      }
      return "";
    },
    creditAmountFormatted(): string {
      if (this.creditAmountSet) {
        return this.creditAmountSet[0] === this.creditAmountSet[1] ? `${ this.creditAmountSet[0] }` : this.creditAmountSet.join("-");
      }
      return "";
    },
    creditSum(): number {
      return d3.sum(this.classesSet, (el: ClassData) => el.credits);
    },
    lockedCreditSum(): number {
      return d3.sum(this.classesSet.filter((el: ClassData) => el.locked), (el: ClassData) => el.credits);
    }
  },
  components: {
    Expandable
  },
  methods: {
    expand(id: string): void {
      setTimeout(() => {
        this.expandedSection = id;
      }, 5);
    },
    collapse(): void {
      setTimeout(() => {
        this.expandedSection = "";
      }, 5);
    },
    toggle(id: string): void {
      setTimeout(() => {
        this.expandedSection = (this.expandedSection === id) ? "" : id;
      }, 5);
    },
    setSchoolUrl(): void {
      if (this.loading) {return;}

      if (this.schoolId !== this.schoolNameTemp) {
        this.classTemp = "";
        this.classesSet = [];
        this.currentScheduleIndex = null;
      } else {
        this.expand("classes");
        return;
      }

      this.loading = true;

      try {
        this.schoolId = "";

        const target = this.schoolNameTemp;

        axios.get(`https://ourscheduler.herokuapp.com/search/${ target }`).then(({ data }) => {
          if (typeof data === "string") {
            this.schoolId = data.toUpperCase();
            this.expand("classes");
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
    addClass(): void {
      if (this.loading) {return;}

      this.currentScheduleIndex = null;
      this.loading = true;

      const school = this.schoolId.toLowerCase();
      const target = this.classTemp.trim().toUpperCase();
      try {
        axios.get(`https://ourscheduler.herokuapp.com/retrieve/${ school }/${ target }`).then(({ data }) => {
          if (data) {
            this.classTemp = "";

            const displayName = `${ data.name } (${ data.label })`;
            if (!this.classesSet.find((el) => el.name === data.name)) {
              this.classesSet.push({
                locked: false,
                credits: data.credits,
                name: data.name,
                displayName: displayName,
                label: data.label
              });
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
    toggleClassLock(index: number): void {
      this.classesSet[index].locked = !this.classesSet[index].locked;
      this.currentScheduleIndex = null;
    },
    setClassCredit(): void {
      if (this.classAmountTemp !== this.classAmountFormatted || this.creditAmountTemp !== this.creditAmountFormatted) {
        this.currentScheduleIndex = null;
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

      this.expand(this.classesSet.length ? "summary" : "classes");
    },
    classAmountFormattedLong(cap: boolean): string {
      if (this.classAmountSet) {
        return this.classAmountFormatted + (cap ? " Class" : " class") + (this.classAmountFormatted === "1" ? "" : "es");
      }
      return "";
    },
    creditAmountFormattedLong(cap: boolean): string {
      if (this.creditAmountSet) {
        return this.creditAmountFormatted + (cap ? " Credit" : " credit") + (this.creditAmountFormatted === "1" ? "" : "s");
      }
      return "";
    },
    generateSchedule(): void {
      if (this.loading) {return;}

      let notEnoughClassSelected = false;
      let notEnoughCreditSelected = false;
      let tooManyClassLocked = false;
      let tooManyCreditLocked = false;

      if (this.classAmountSet) {
        notEnoughClassSelected = this.classAmountSet[0] > this.classesSet.length;
        tooManyClassLocked = this.classAmountSet[1] < this.classesSet.filter(el => el.locked).length;
      }

      if (this.creditAmountSet) {
        notEnoughCreditSelected = this.creditAmountSet[0] > this.creditSum;
        tooManyCreditLocked = this.creditAmountSet[1] < this.lockedCreditSum;
      }

      const notEnoughSelected = notEnoughClassSelected || notEnoughCreditSelected;
      const tooMuchLocked = tooManyClassLocked || tooManyCreditLocked;
      const classIssue = notEnoughClassSelected || tooManyClassLocked;
      const creditIssue = notEnoughCreditSelected || tooManyCreditLocked;

      if (notEnoughSelected || tooMuchLocked) {
        alert(`Please ${ notEnoughSelected ? "add more classes" : "" }${ notEnoughSelected && tooMuchLocked ? " and " : "" }${ tooMuchLocked ? "unlock some classes" : "" } so that we can meet your ${ classIssue ? this.classAmountFormattedLong(false) : "" }${ classIssue && creditIssue ? " and " : "" }${ creditIssue ? this.creditAmountFormattedLong(false) : "" } requirement.`);
        return;
      }

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

      const propStr = JSON.stringify(prop);

      if (this.prevProp === propStr && this.generatedSchedules) {
        this.currentScheduleIndex = 0;
        this.expand("schedules");
        return;
      } else {
        this.loading = true;
        this.prevProp = propStr;
      }

      this.currentScheduleIndex = null;
      this.generatedSchedules = null;

      try {
        axios.get(`https://ourscheduler.herokuapp.com/generate/?prop=${ encodeURI(JSON.stringify(prop)) }`).then(({ data }) => {
          this.runD3(data[0]);
          this.currentScheduleIndex = 0;
          this.noShuffle = data.length < 2;
          this.generatedSchedules = data;
          this.loading = false;
          this.expand("schedules");
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
    runD3(schedules: ScheduleData): void {
      interface CalendarEvent {
        timeFrom: number,
        timeTo: number,
        title: string,
        day: number
      }

      const START_TIME: number = Date.parse("1 Jan 1970 00:00:00").valueOf();
      const END_TIME: number = START_TIME + 24 * 60 * 60 * 1000;
      const calendarEvents: CalendarEvent[] = [];
      for (let i = 0; i < schedules.length; i++) {
        calendarEvents.push({
          timeFrom: schedules[i][1][0] % 1440 * 60000 + START_TIME,
          timeTo: schedules[i][1][1] % 1440 * 60000 + START_TIME,
          title: schedules[i][0],
          day: Math.floor(schedules[i][1][0] / 1440)
        });
      }
      // Make an array of dates to use for our yScale later on
      const minDateValue: number = d3.min(calendarEvents.map((d: CalendarEvent) => new Date(d.timeFrom)))?.valueOf() ?? START_TIME;
      const maxDateValue: number = d3.max(calendarEvents.map((d: CalendarEvent) => new Date(d.timeTo)))?.valueOf() ?? END_TIME;
      const margin = { top: 30, right: 10, bottom: 0, left: 40 }; // Gives space for axes and other margins
      const hours: number = (maxDateValue - minDateValue) / 60 / 60000 + 2 / 3;
      const width: number = 920;
      const barHeight: number = 1600 * (hours / 24);
      const barWidth: number = width - margin.left - margin.right;
      const height: number = barHeight + 30;

      // Create the SVG element
      const svg = d3.create("svg").attr("width", width).attr("height", height);
      // All further code additions will go just below this line
      const yScale = d3.scaleTime().domain([new Date(Math.max(START_TIME, minDateValue - 1 / 3 * 60 * 60 * 1000)), new Date(Math.min(END_TIME, maxDateValue + 1 / 3 * 60 * 60 * 1000))]).range([margin.top, height - margin.bottom]);
      const yAxis = d3.axisLeft(yScale).ticks(hours);
      const xAxis = d3.axisTop(d3.scaleLinear().domain([0, 6]).range([margin.left, width - margin.right])).ticks(6).tickSize(height - margin.bottom - margin.top).tickFormat(() => "");

      svg.append("g").attr("transform", `translate(${ margin.left },0)`).attr("opacity", 0.7).call(yAxis);
      svg.selectAll("g.tick").filter((d: Date | any) => d.getMinutes() === 0 && d.getHours() === 0).select("text").text("12 AM");

      svg.append("g").attr("transform", `translate(0,${ height - margin.bottom })`).attr("opacity", 0.2).call(xAxis);

      const gridLines = d3.axisRight(yScale).ticks(hours * 2).tickSize(barWidth).tickFormat(() => ""); // even though they're "ticks" we've set them to be full-width
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", barWidth / 12 + margin.left).attr("y", 20).text("Mon");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 3 * barWidth / 12 + margin.left).attr("y", 20).text("Tue");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 5 * barWidth / 12 + margin.left).attr("y", 20).text("Wed");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 7 * barWidth / 12 + margin.left).attr("y", 20).text("Thu");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 9 * barWidth / 12 + margin.left).attr("y", 20).text("Fri");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 11 * barWidth / 12 + margin.left).attr("y", 20).text("Sat");
      svg.append("g").attr("transform", `translate(${ margin.left },0)`).attr("opacity", 0.2).call(gridLines);
      const barGroups = svg.selectAll("g.barGroup").data(calendarEvents).join("g").attr("class", "barGroup");
      barGroups.append("rect").attr("stroke-width", "2px").attr("x", d => margin.left + barWidth / 6 * d.day + 1).attr("y", d => yScale(new Date(d.timeFrom)) + 1).attr("height", d => yScale(new Date(d.timeTo)) - yScale(new Date(d.timeFrom)) - 2).attr("width", barWidth / 6 - 2);
      // barGroups.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 8).attr("font-weight", 500).attr("text-anchor", "middle").attr("fill", barStyle.textColor).attr("x", d => (1 + 2 * d.day) * barWidth / 12 + margin.left).attr("y", d => yScale(new Date(d.timeFrom)) + 20).text(d => d.title);

      barGroups.append("foreignObject").attr("x", d => margin.left + barWidth / 6 * d.day + 2).attr("y", d => yScale(new Date(d.timeFrom)) + 2).attr("width", barWidth / 6 - 4).attr("height", d => yScale(new Date(d.timeTo)) - yScale(new Date(d.timeFrom)) - 4).append("xhtml:body").style("font-weight", "500").html(d => `<div class="block__text"><p>${ d.title }</p><p>${ new Date(d.timeFrom).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }) }–${ new Date(d.timeTo).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }) }</p></div>`);

      // Actually add the element to the page
      const element = this.$refs["d3-schedule"];
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      element.append(svg.node());
      // This part ^ always goes at the end of our index.js
    },
    swapSchedule(): void {
      if (this.noShuffle || !this.generatedSchedules || typeof this.currentScheduleIndex !== "number") { return; }

      let currStr: string = "";
      let nextStr: string = JSON.stringify(this.generatedSchedules[this.currentScheduleIndex]);
      const lastIndex: number = this.currentScheduleIndex;

      do {
        currStr = nextStr;
        this.currentScheduleIndex = (this.currentScheduleIndex + 1) % this.generatedSchedules.length;
        nextStr = JSON.stringify(this.generatedSchedules[this.currentScheduleIndex]);
      } while (nextStr === currStr && lastIndex !== this.currentScheduleIndex);

      if (lastIndex === this.currentScheduleIndex) {
        this.noShuffle = true;
      } else {
        this.runD3(this.generatedSchedules[this.currentScheduleIndex]);
      }
    }
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

html > body {
  background: var(--bgColorLv2);
  padding: 0;
  max-width: 960px;
  margin: 0 auto;
  --starColor: #dbdb04;
  --bgColorLv0: #020202;
  --bgColorLv1: #010f1a;
  --bgColorLv2: #011724;
  --tagColor: #202536;
  --expandableHoverColor: #022336;
  --btnColor: #03283d;
  --btnHoverColor: #083854;
  --txtColor: #abc3d1;
  transition: fill 0.5s, height 0.5s, color 0.5s, background-color 0.5s, stroke 0.5s, border-top-color 0.5s, border-right-color 0.5s, border-bottom-color 0.5s, border-left-color 0.5s, opacity 0.5s, transform 0.5s;
}

@media (prefers-color-scheme: light) {
  html > body {
    --starColor: #ff2;
    --bgColorLv0: #fff;
    --bgColorLv1: #fafeff;
    --bgColorLv2: #f0f8fa;
    --tagColor: #e9ecf2;
    --expandableHoverColor: #e4eff2;
    --btnColor: #daecf0;
    --btnHoverColor: #ccdfe3;
    --txtColor: #0e3945;
  }
}

#d3-schedule {
  margin: 40px 0 10px 0;
  overflow: auto;
}

#d3-schedule > svg {
  margin: 0 20px;
}

svg body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: auto;
}

svg div.block__text {
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
}

svg p {
  font-size: 0.8em;
  margin: 1px;
  padding: 0;
  font-family: 'Open Sans', sans-serif;
  text-align: center;
}

span, g {
  color: var(--txtColor);
  transition: color 0.5s, transform 0.5s;
}

text {
  color: var(--txtColor);
  fill: var(--txtColor);
  transition: fill 0.5s, color 0.5s;
}

rect {
  fill: var(--expandableHoverColor);
  stroke: var(--btnHoverColor);
  transition: fill 0.5s, stroke 0.5s;
}

h1 {
  color: var(--txtColor);
  transition: color 0.5s;
  margin: 22px 20px;
  font-size: 2em;
  font-weight: 700;
}

h2 {
  color: var(--txtColor);
  transition: color 0.5s;
  margin: 60px 20px;
  font-size: 1.5em;
  font-weight: 600;
}

p {
  color: var(--txtColor);
  transition: color 0.5s;
}

strong {
  font-size: 1.2em;
  font-weight: 600;
}

.star {
  color: var(--starColor);
  transition: color 0.5s;
  text-shadow: 0 0 2px #3309;
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
  transition: color 0.5s, background-color 0.5s, transform 0.5s;
}

.expandable > .expandable__content {
  background: var(--bgColorLv1);
  transition: height 0.5s, color 0.5s, background-color 0.5s, border-top-color 0.5s, border-right-color 0.5s, border-bottom-color 0.5s, border-left-color 0.5s, opacity 0.5s;
}

.expandable .expandable-header__button {
  transition: background-color 0.5s;
}

.expandable .expandable-header__button:not(.disabled):hover {
  background: var(--expandableHoverColor);
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

form:not(div + form) > *:first-child {
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

form > label:last-child {
  font-weight: 300;
}

form > p {
  margin-top: 5px;
  margin-bottom: 5px;
}

label {
  color: var(--txtColor);
  transition: color 0.5s;
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
  border: 2px solid var(--btnHoverColor);
  padding: 10px 0;
  border-radius: 10px;
  font-size: 1.4em;
  background-color: var(--bgColorLv0);
  color: var(--txtColor);
  transition: color 0.5s, background-color 0.5s, border-top-color 0.5s, border-right-color 0.5s, border-bottom-color 0.5s, border-left-color 0.5s;
}

input[type=text]::placeholder {
  opacity: 0.5;
  color: var(--txtColor);
  transition: color 0.5s;
}

input[type=submit] {
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  color: var(--txtColor);
  background: var(--btnColor);
  cursor: pointer;
  border: none;
  border-radius: 10px;
  padding: 12px 25px;
  font-size: 0.9em;
  font-weight: 600;
  transition: color 0.5s, background-color 0.5s;
}

input[type=submit]:not(:disabled):hover, input[type=submit]:not(:disabled):focus {
  background: var(--btnHoverColor);
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
  background: var(--tagColor);
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  color: var(--txtColor);
  transition: color 0.5s, background-color 0.5s;
}

footer {
  color: var(--txtColor);
  font-weight: 600;
  margin: 20px 20px calc(20px + env(safe-area-inset-bottom, 0)) 20px;
  transition: color 0.5s;
}

#app {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

#app.loading * {
  cursor: wait;
}
</style>
