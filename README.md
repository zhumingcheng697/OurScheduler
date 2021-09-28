# [OurScheduler](https://ourscheduler.netlify.app/)

Welcome to OurScheduler, your best college schedule maker.

## Inspiration

Stressed over the course selection process? Overwhelmed with registration info and options? We've all been there. Nailing down next semester's schedule is a big thing for every college student, but open-source scheduling tools are lacking. While exclusive fee-based schedulers are keeping the majority of students out, currently available free scheduler tools such as Free College Schedule Maker with limited functions are hardly satisfying in addressing students' diverse needs.

We believe that course selection process need not be complicated and stressful, and we are dedicated to make college schedule planning experience inclusive, simple, and stress-free for all. Therefore, we have developed OurScheduler, a powerful, open-source customizable course scheduler tool for every college student.

## What it does

OurScheduler is a powerful, open-source customizable course scheduler tool for all college students.

Our features include:

1. Allow students to add classes directly by entering course registration numbers.

2. Allow students to "lock" core (or "must-have") classes in the schedule and generate a schedule that revolves around the locked classes.

3. Allow students to input as many courses as they like and generate schedule plans based on credit cap, locked classes etc...

## How we built it

We used Vue.js and TypeScript for the front end, Node.js and express.js for the back end, and MongoDB for the database. We also utilized tools such as Puppeteer for web scraping and D3.js for visualizing the schedules.

## Challenges & accomplishments

The overall coding and debugging was very challenging in the mere 30ish hours we got to work on this, especially the interactions between the various tools we were using was very buggy and required delicate work from some very hurried people(us!). But we are very proud for being able to produce a wholly functional version of our original blueprint, for actually building a meaningful and useful application in such a short time and for overcoming all the difficulties together as a team.

## What we learned

We learned how to work under stress, collaborate as a team, and adapt to challenging circumstances. We also learned about different tech stacks: we each experimented with a technology that we rarely/never used before.

## What’s next for OurScheduler

We envisioned quite a few future updates for OurScheduler: having it be able to suggest alternatives if a certain schedule cannot be fulfilled or fill in a schedule under the course/credit limit with courses that were not prompted by the user, both using machine learning algorithms; having it be able to take in user manual input, to update our database to gradually correct our mistakes and fill in missing information, and also to let user put in "breaks" at the same priority level as locked-in courses to further optimize schedule generation; having it be able to do more and more, everything that a fellow college student would have hoped for in his scheduler.

## Built With

HTML, CSS, JavaScript, TypeScript, D3.js, Vue.js, Node.js, express.js, axios, Puppeteer, MongoDB, netlify, heroku
