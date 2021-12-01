<template>
  <div id="app" :class="{loading}" @keydown.esc="collapse(true)">
    <div class="top">
      <h1>{{ projectName }}</h1>
      <h2 class="centered-text">Welcome to {{ projectName }}, your best college schedule maker.</h2>
      <Expandable :id="'university'" :expanded="'university' === expandedSection">
        <template #header="{id, expanded}">
          <button type="button" :aria-label="expanded ? `Close ${id} section` : `Expand ${id} section`" class="expandable-header__button clickable" :ref="id + '-toggle'" @click="toggle(id, true)">
            <span><strong>Which university or college do you attend?</strong></span>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </button>
        </template>
        <template #content="{id, expanded}">
          <form @submit.prevent="!!schoolNameTemp && !loading && setSchoolUrl()">
            <label for="school-name">School Name</label>
            <input class="centered-text" id="school-name" name="school-name" :ref="id + '-input'" type="text" v-model="schoolNameTemp" placeholder="Zoom University" autocomplete="organization" :tabindex="expanded ? 0 : -1">
            <input class="centered-text" type="submit" value="Search" :disabled="!schoolNameTemp || loading" :tabindex="expanded ? 0 : -1">
          </form>
        </template>
      </Expandable>
      <Expandable :id="'classes'" :expanded="'classes' === expandedSection">
        <template #header="{id, expanded}">
          <button type="button" :aria-label="expanded ? `Close ${id} section` : `Expand ${id} section`" class="expandable-header__button clickable" :disabled="!schoolId" :ref="id + '-toggle'" @click="toggle(id, true)">
            <span><strong>Which classes do you plan to take?</strong></span>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </button>
        </template>
        <template #content="{id, expanded}">
          <form @submit.prevent="allowAddClass && !loading && addClass()">
            <label for="class-code">Class Name or Class Code</label>
            <input class="centered-text" :ref="id + '-input'" id="class-code" name="class-code" type="text" v-model="classTemp" placeholder="Intro to Handwashing / HW 101" autocomplete="off" :tabindex="expanded ? 0 : -1">
            <input class="centered-text" type="submit" value="Add" :disabled="!allowAddClass || loading" :tabindex="expanded ? 0 : -1">
            <ul v-if="classesSet.length">
              <li v-for="(addedClass, index) in classesSet" :key="addedClass.displayName" class="class-tag">
                <button type="button" :aria-label="addedClass.locked ? `Lock ${addedClass.displayName} into schedule` : `Unlock ${addedClass.locked} from schedule`" class="clickable star" @click="toggleClassLock(index)" :tabindex="expanded ? 0 : -1">
                  <strong v-if="addedClass.locked" class="locked">&#9733;</strong><strong v-else>&#9734;</strong>
                </button>
                {{ addedClass.displayName }}
                <button type="button" :aria-label="`Remove ${addedClass.displayName}`" class="clickable remove" @click="classesSet.splice(index, 1)" :tabindex="expanded ? 0 : -1">
                  <strong>&times;</strong></button>
              </li>
            </ul>
            <label v-if="classesSet.length">Click
              <span aria-label="Star">&#9734;</span> to lock or unlock each class from your schedule.</label>
          </form>
        </template>
      </Expandable>
      <Expandable :id="'amount'" :expanded="'amount' === expandedSection">
        <template #header="{id, expanded}">
          <button type="button" :aria-label="expanded ? `Close ${id} section` : `Expand ${id} section`" class="expandable-header__button clickable" :ref="id + '-toggle'" @click="toggle(id, true)" :disabled="!schoolId">
            <span><strong>How many credits or classes do you plan to take?</strong></span>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </button>
        </template>
        <template #content="{id, expanded}">
          <form @submit.prevent="isClassCreditValid && setClassCredit()">
            <label for="class-amount">Number of Classes</label>
            <input class="centered-text" :ref="id + '-input'" type="text" id="class-amount" name="class-amount" v-model="classAmountTemp" placeholder="4-5" autocomplete="off" :tabindex="expanded ? 0 : -1">
            <label for="credit-amount">Number of Credits</label>
            <input class="centered-text" type="text" id="credit-amount" name="credit-amount" v-model="creditAmountTemp" placeholder="12-18" autocomplete="off" :tabindex="expanded ? 0 : -1">
            <input class="centered-text" type="submit" value="Confirm" :disabled="!isClassCreditValid" :tabindex="expanded ? 0 : -1">
            <label>You have selected {{ classesSet.length }} class{{ classesSet.length === 1 ? "" : "es" }} worth of {{ creditSum }} credit{{ creditSum === 1 ? "" : "s" }} so far.</label>
          </form>
        </template>
      </Expandable>
      <Expandable :id="'summary'" :expanded="'summary' === expandedSection">
        <template #header="{id, expanded}">
          <button type="button" :aria-label="expanded ? `Close ${id} section` : `Expand ${id} section`" class="expandable-header__button clickable" :ref="id + '-toggle'" @click="toggle(id, true)" :disabled="!schoolId || !classesSet.length || (!classAmountSet && !creditAmountSet)">
            <span><strong>Summary</strong></span>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </button>
        </template>
        <template #content="{id, expanded}">
          <form @submit.prevent="!loading && generateSchedule()">
            <button type="button" class="clickable" @click="expand('university', true)" :tabindex="expanded ? 0 : -1">
              <strong>{{ schoolId }}</strong></button>
            <button type="button" class="clickable" @click="expand('amount', true)" :tabindex="expanded ? 0 : -1">
              <span v-if="classAmountSet">{{ classAmountFormattedLong(true) }}</span>
              <span v-if="classAmountSet && creditAmountSet">, </span>
              <span v-if="creditAmountSet">{{ creditAmountFormattedLong(true) }}</span>
            </button>
            <button type="button" v-if="classesSet.length" class="clickable ul" @click="expand('classes', true)" :tabindex="expanded ? 0 : -1">
              <span v-for="(addedClass, index) in classesSet" :key="addedClass.displayName" class="li class-tag">
                <span class="star" :aria-label="addedClass.locked ? `Locked` : `Not locked`"><strong v-if="classesSet[index].locked" class="locked">&#9733;</strong><strong v-else>&#9734;</strong></span>
                {{ addedClass.displayName }}
              </span>
            </button>
            <input class="centered-text" :ref="id + '-input'" type="submit" value="Generate Schedule" :disabled="loading" :tabindex="expanded ? 0 : -1">
          </form>
        </template>
      </Expandable>
      <Expandable :id="'schedules'" :expanded="'schedules' === expandedSection">
        <template #header="{id, expanded}">
          <button type="button" :aria-label="expanded ? `Close ${id} section` : `Expand ${id} section`" class="expandable-header__button clickable" :ref="id + '-toggle'" @click="toggle(id, true)" :disabled="!schoolId || !classesSet.length || (!classAmountSet && !creditAmountSet) || !generatedSchedules || currentScheduleIndex === null">
            <span><strong>Schedules</strong></span>
            <span :style="{ transform: `rotate(${expanded ? 90 : 0}deg)` }"><strong>&rsaquo;</strong></span>
          </button>
        </template>
        <template #content="{id, expanded}">
          <div id="d3-schedule" ref="d3-schedule"></div>
          <form v-if="currentScheduleIndex !== null && generatedSchedules !== null" @submit.prevent="!noShuffle && swapSchedule()">
            <p>
              <strong>{{ schoolId }}</strong></p>
            <p>
              <span>{{ currentScheduleClassAmountFormatted }}</span>
              <span>, </span>
              <span>{{ currentScheduleCreditAmountFormatted }}</span>
            </p>
            <ul>
              <li v-for="addedClass in classesSet.filter(e => currentScheduleClasses.has(e.name))" :key="addedClass.displayName">
                {{ addedClass.displayName }}
              </li>
            </ul>
            <input class="centered-text" :ref="id + '-input'" type="submit" value="Shuffle" :disabled="noShuffle" :tabindex="expanded ? 0 : -1">
          </form>
        </template>
      </Expandable>
    </div>
    <footer class="centered-text"><span aria-label="Copyright">&COPY;</span> 2021 Hackers Union</footer>
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

type SectionId = "" | "university" | "classes" | "amount" | "summary" | "schedules"
type ScheduleDatum = [string, [number, number]];
type ScheduleData = ScheduleDatum[];
type NumberRange = [number, number];

const backendUrl = "https://ourscheduler.herokuapp.com";

const keepAlive: (() => void) = (() => {
  let timeoutId: number;

  return function ping(): void {
    clearTimeout(timeoutId);
    axios.get(`${ backendUrl }/keep-alive`);
    timeoutId = setTimeout(ping, 3 * 60 * 1000);
  };
})();

export default Vue.extend({
  name: "App",
  data() {
    return {
      loading: false as boolean,
      projectName: "OurScheduler" as string,
      expandedSection: "" as SectionId,
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
    setTimeout(() => {
      this.expand("university");
    }, 100);
    keepAlive();
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
    },
    currentScheduleClasses(): Set<string> {
      if (this.generatedSchedules === null || this.currentScheduleIndex === null) { return new Set<string>(); }
      return new Set<string>(this.generatedSchedules[this.currentScheduleIndex].map((el: ScheduleDatum) => el[0]));
    },
    currentScheduleCreditSum(): number {
      return d3.sum(this.classesSet.filter((el: ClassData) => this.currentScheduleClasses.has(el.name)), (el: ClassData) => el.credits);
    },
    currentScheduleClassAmountFormatted(): string {
      const classAmount = this.currentScheduleClasses.size;
      return classAmount + " Class" + (classAmount === 1 ? "" : "es");
    },
    currentScheduleCreditAmountFormatted(): string {
      return this.currentScheduleCreditSum + " Credit" + (this.currentScheduleCreditSum === 1 ? "" : "es");
    }
  },
  components: {
    Expandable
  },
  methods: {
    expand(id: SectionId, focus: boolean = false): void {
      setTimeout(() => {
        this.expandedSection = id;

        if (focus && document.activeElement && document.activeElement.tagName !== "BODY") {
          const inputEl: HTMLElement = this.$refs[id + "-input"];

          if (inputEl) {
            setTimeout(() => {
              inputEl.focus();
            }, 505);
          }
        }
      }, 5);
    },
    collapse(focus: boolean = false): void {
      setTimeout(() => {
        if (focus && this.expandedSection && document.activeElement && document.activeElement.tagName !== "BODY") {
          const inputEl: HTMLElement = this.$refs[this.expandedSection + "-toggle"];

          if (inputEl) {
            setTimeout(() => {
              inputEl.focus();
            }, 505);
          }
        }

        this.expandedSection = "";
      }, 5);
    },
    toggle(id: SectionId, focus: boolean = false): void {
      setTimeout(() => {
        this.expandedSection = (this.expandedSection === id) ? "" : id;

        if (focus && document.activeElement && document.activeElement.tagName !== "BODY") {
          const inputEl: HTMLElement = this.$refs[id + (this.expandedSection ? "-input" : "-toggle")];

          if (inputEl) {
            setTimeout(() => {
              inputEl.focus();
            }, 505);
          }
        }
      }, 5);
    },
    setSchoolUrl(): void {
      if (this.loading) {return;}

      if (this.schoolId !== this.schoolNameTemp) {
        this.classTemp = "";
        this.classesSet = [];
        this.currentScheduleIndex = null;
      } else {
        this.expand("classes", true);
        return;
      }

      this.loading = true;

      try {
        this.schoolId = "";

        const target = this.schoolNameTemp;

        axios.get(`${ backendUrl }/search/${ target }`).then(({ data }) => {
          if (typeof data === "string") {
            this.schoolId = data.toUpperCase();
            this.expand("classes", true);
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
        axios.get(`${ backendUrl }/retrieve/${ school }/${ target }`).then(({ data }) => {
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

      this.expand(this.classesSet.length ? "summary" : "classes", true);
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
        this.expand("schedules", true);
        return;
      } else {
        this.loading = true;
        this.prevProp = propStr;
      }

      this.currentScheduleIndex = null;
      this.generatedSchedules = null;

      try {
        axios.get(`${ backendUrl }/generate/?prop=${ encodeURI(JSON.stringify(prop)) }`).then(({ data }) => {
          this.runD3(data[0]);
          this.currentScheduleIndex = 0;
          this.noShuffle = data.length < 2;
          this.generatedSchedules = data;
          this.loading = false;
          this.expand("schedules", true);
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
      const margin = { top: 30, right: 10, bottom: 5, left: 40 }; // Gives space for axes and other margins
      const hours: number = (maxDateValue - minDateValue) / 60 / 60000 + 2 / 3;
      const width: number = 920;
      const barHeight: number = 1600 * (hours / 24);
      const barWidth: number = width - margin.left - margin.right;
      const height: number = barHeight + 30;

      // Create the SVG element
      const svg = d3.create("svg").attr("width", width).attr("height", height);
      // All further code additions will go just below this line
      const yScale = d3.scaleTime().domain([new Date(Math.max(START_TIME, minDateValue - 1 / 3 * 60 * 60 * 1000)), new Date(Math.min(END_TIME, maxDateValue + 1 / 3 * 60 * 60 * 1000))]).range([margin.top, height - margin.bottom]);
      const yAxis = d3.axisLeft<Date>(yScale).ticks(hours).tickFormat((d: Date) => d.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true
      }));
      const xAxis = d3.axisTop(d3.scaleLinear().domain([0, 6]).range([margin.left, width - margin.right])).ticks(6).tickSize(height - margin.bottom - margin.top).tickFormat(() => "");

      svg.append("g").attr("transform", `translate(${ margin.left },0)`).call(yAxis).call(g => g.select(".domain").remove());

      svg.append("g").attr("transform", `translate(0,${ height - margin.bottom })`).attr("opacity", 0.3).call(xAxis).call(g => g.select(".domain").remove()).call(g => g.selectAll(".tick").filter(d => d === 0).remove());

      const gridLines = d3.axisRight(yScale).ticks(hours * 4).tickSize(barWidth).tickFormat(() => ""); // even though they're "ticks" we've set them to be full-width
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", barWidth / 12 + margin.left).attr("y", 20).text("Mon");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 3 * barWidth / 12 + margin.left).attr("y", 20).text("Tue");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 5 * barWidth / 12 + margin.left).attr("y", 20).text("Wed");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 7 * barWidth / 12 + margin.left).attr("y", 20).text("Thu");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 9 * barWidth / 12 + margin.left).attr("y", 20).text("Fri");
      svg.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 20).attr("font-weight", 500).attr("text-anchor", "middle").attr("x", 11 * barWidth / 12 + margin.left).attr("y", 20).text("Sat");
      svg.append("g").attr("transform", `translate(${ margin.left },0)`).call(gridLines).call(g => g.select(".domain").attr("opacity", 0.3)).call(g => g.selectAll(".tick").attr("opacity", (d) => (d as Date).getMinutes() === 0 ? 0.3 : 0.1));
      const barGroups = svg.selectAll("g.barGroup").data(calendarEvents).join("g").attr("class", "barGroup");
      barGroups.append("rect").attr("stroke-width", "2px").attr("x", d => margin.left + barWidth / 6 * d.day + 1).attr("y", d => yScale(new Date(d.timeFrom)) + 1).attr("height", d => yScale(new Date(d.timeTo)) - yScale(new Date(d.timeFrom)) - 2).attr("width", barWidth / 6 - 2);
      // barGroups.append("text").attr("font-family", "'Open Sans', sans-serif").attr("font-size", 8).attr("font-weight", 500).attr("text-anchor", "middle").attr("fill", barStyle.textColor).attr("x", d => (1 + 2 * d.day) * barWidth / 12 + margin.left).attr("y", d => yScale(new Date(d.timeFrom)) + 20).text(d => d.title);

      barGroups.append("foreignObject").attr("x", d => margin.left + barWidth / 6 * d.day + 2).attr("y", d => yScale(new Date(d.timeFrom)) + 2).attr("width", barWidth / 6 - 4).attr("height", d => yScale(new Date(d.timeTo)) - yScale(new Date(d.timeFrom)) - 4).append("xhtml:body").style("font-weight", "500").html(d => `<div class="block__text"><p>${ d.title }</p><p>${ new Date(d.timeFrom).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }) }–${ new Date(d.timeTo).toLocaleTimeString("en-US", {
        hour: "numeric",
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
      if (this.noShuffle || !this.generatedSchedules || this.currentScheduleIndex === null) { return; }

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

button[type=button] {
  -webkit-appearance: none;
  -webkit-border-radius: 0;
  border: inherit;
  padding: 0;
  background: inherit;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
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

h1, h2, span, p, g, strong {
  color: var(--txtColor);
  transition: color 0.5s;
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

.locked {
  color: var(--starColor);
  transition: color 0.5s;
  text-shadow: 0 0 2px #3309;
}

.centered-text {
  text-align: center;
}

button.expandable-header__button {
  width: 100%;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button.expandable-header__button span:first-child {
  text-align: start;
  margin: 1em 10px 1em 0;
}

button.expandable-header__button span:last-child {
  transition: color 0.5s, transform 0.5s;
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

.expandable .expandable-header__button:not(:disabled):hover,
.expandable .expandable-header__button:not(:disabled):focus {
  background: var(--expandableHoverColor);
}

.expandable .clickable:disabled {
  opacity: 0.5;
}

.clickable:disabled {
  cursor: not-allowed;
}

.class-tag > button {
  padding: 0;
  margin: 0;
}

.class-tag .star {
  margin-right: 5px;
}

.class-tag > .remove {
  margin-left: 5px;
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

form > p, form > button[type=button] {
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

ul, button[type=button].ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0;
}

ul > li, button[type=button].ul > span.li {
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
