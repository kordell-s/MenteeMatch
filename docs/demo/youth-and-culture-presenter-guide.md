# MentorMatch: presenter guide for the Department of Youth and Culture

About 10 minutes of demo, then questions. Everything below was rehearsed on this laptop on 24 Nov 2026.

---

## 1. Before you leave (tonight or in the morning)

1. **Quit Prime Video.** It has been running for four days and is using about eight CPU cores. That is why the app felt slow. With it closed, pages load in one or two seconds.
2. Open Terminal in the project folder and reset the demo data:
   ```bash
   scripts/demo.sh reset
   ```
   This removes anything you clicked in rehearsal and prints the shared test password (the same for every account).
3. Start the app:
   ```bash
   scripts/demo.sh start
   ```
   Leave that Terminal window open. The app is at http://localhost:3000.
4. Open **two browser windows** side by side:
   - **Window A (normal):** sign in as the student, `james.mentee@test.com`.
   - **Window B (Incognito/Private):** sign in as the mentor, `alicia.music@test.com`.
   Two windows mean you never sign out and back in on stage. A normal window and an incognito window keep separate logins.
5. Click through every page once before the meeting so nothing loads for the first time in front of them.
6. **No internet is needed.** It all runs on the laptop. Plug in the charger.

If the laptop restarts, run `scripts/demo.sh start` again. The database starts by itself.

---

## 2. The one-line pitch

> MentorMatch connects young people with a mentor in their field who shares their skills. The mentor doesn't just chat. They set a step-by-step route to the young person's first role, and both of them can see progress along the way.

Why it fits a youth and culture department:
- It is **not only tech**. Mentors span music, creative arts, business, aviation, health, design and marketing.
- A route gives structure that a one-off talk or careers fair can't: milestones, tasks, check-ins and sessions.
- The Department could run it as a **programme**: recruit and vet local mentors, enrol a cohort, and follow their progress.

---

## 3. The walkthrough (about 10 minutes)

### Beat 1: Landing page (1 min), Window A, signed out or on http://localhost:3000
- Read the headline: "Your mentor sets the route."
- Pick a few skills in the picker (try **Interview prep** and **Digital marketing**). Mentor cards re-rank by shared skills, which are taped in yellow.
- Scroll to the climbing route. "Every route is graded, Start to Top, like a climbing wall. Done milestones get a tick. The next one is always visible."
- The aviation example route shows it isn't just for tech.

### Beat 2: The student finds a mentor (2 min), Window A as James
- **Dashboard:** "James has just joined. He has no mentor yet, so the app tells him the first step."
- Click **Find mentors**, then the **Music** filter. Point out the other fields too: Tech, Business, Aviation, Design, Marketing, Health, Creative.
- Open **Alicia Thompson** (music producer) and click **Request mentorship**.
- Choose **Career guidance**. Type something like: *"I make beats at home and want to turn music into a career. Could you help me plan my first year?"* Then **Send request**.
- The card changes to "Request sent".

### Beat 3: The mentor accepts (1 min), Window B as Alicia
- Refresh the **Dashboard**. It shows "1 person wants your help", with James's message.
- Click **Accept**. James moves into "Your mentees".
- "Mentors choose who they take on. Nobody is assigned a mentee without agreeing."

### Beat 4: The mentor sets the route (3 min), Window B
- Click **Set a route** next to James.
- Step 1: title *First year as a music producer*, a short description, length (8 weeks is fine), focus *Production, mixing, releasing*. Click **Next**.
- Step 2: add two milestones, for example *Finish three tracks* and *Release your first EP*. **Each milestone needs a due date** or the Add button stays grey.
- Step 3: review, then **Create Roadmap**.
- On the route page, show the grades (Start, V1) and the **Task / Resource / Check-in** buttons on each milestone.
- ⚠️ **Don't press Esc in the route builder.** It closes the form and loses what you typed.

### Beat 5: Chat (1 min), Window B, then Window A
- Go to **Messages**, pick James and send: *"Welcome James! Your route is up. Start with three finished tracks."*
- Switch to Window A. James's **Dashboard** now shows his route, and **Messages** shows Alicia's note.

### Beat 6: What it looks like weeks in (1 min)
- In Window A, sign out and sign in as `alex.mentee@test.com`. Or skip this beat if time is short.
- Alex is partway through a route: one milestone reached, the next one highlighted, tasks due, a session booked with his mentor, plus **Message** and **Book session** buttons.
- "This is the experience after a few weeks: always one clear next step."

### Close (30 sec)
> "What we'd want to explore with the Department is a pilot: you help us recruit and vet local mentors, we onboard a first cohort of young people, and we report back on milestones reached."

Adjust the ask to whatever you actually want from them.

---

## 4. Questions you may get, and honest answers

**Is this live? Are these real people?**
It's a working prototype running on this laptop. The people are sample data I made up. Some sample bios mention places or credits from elsewhere (for example "Nashville" or "Grammy-nominated albums"). They aren't real mentors, so say so if anyone asks.

**How does matching work?**
Students pick the skills they're working on. Mentors are ranked by how many of those skills they share, and the shared ones are highlighted. Behind that, the app also compares the text of a student's goals with mentors' profiles. The student always chooses. Nothing is assigned automatically.

**How do you keep young people safe?** *(most likely question; be straight about it)*
Today: mentors must accept a request before any contact. Chat is private between the pair. All contact happens in the app, so there's a record. Passwords are stored hashed.
Not built yet: age checks, parental or guardian consent for under-18s, background checks for mentors, and report or block buttons. Mentor "verified" status is currently set by an admin, not through a vetting process.
A good answer: "Before any pilot with young people, we'd add guardian consent and in-app reporting, and we'd want the Department's mentor vetting, such as police checks, to sit in front of any mentor going live."

**Does it do video calls?**
No. Sessions are scheduled in the app (date, time, length and topic), and the call itself happens on whatever the pair already uses, such as Zoom, Meet or WhatsApp. Built-in video could come later.

**Does it send emails or text reminders?**
Not yet. Requests, messages and sessions appear in the app. Notifications are an obvious next step.

**Is there an app?**
It's a website that works on a phone browser. There's no app-store app.

**What does it cost? Are mentors paid?**
There are no payments in the product. For a Department programme, mentors would most likely be volunteers or paid through the programme, not by the young people. Decide your answer before the meeting.

**Can the Department see how young people are doing?**
Not in this version. Each mentor sees their own mentees' progress. We have prototyped an organisation-level view (gap maps and progress across a whole group) for an employer, so it's a realistic next step for a programme dashboard.

**Where is the data stored?**
For the demo, on this laptop. For a real pilot it would be hosted online with a proper database and backups. Where it's hosted (including any data residency requirements) is something to agree with the Department.

**How is this different from LinkedIn or a mentoring WhatsApp group?**
The route. The mentor builds a graded plan with milestones, tasks, resources and check-ins, and both sides see progress. It's structured mentoring, not just a contact list.

**What would you need from us?**
Introductions to local mentors in music, the arts, business and other fields, help with vetting, and a first cohort of young people. Have a number in mind, such as 10 to 20.

**Languages and accessibility?**
English only today. The interface follows standard accessibility practice (keyboard use, labels and contrast), but it hasn't had a formal audit.

If you don't know an answer, it's fine to say: "Good question. That isn't built yet. I'll come back to you on how we'd handle it."

---

## 5. If something goes wrong

| Problem | Fix |
|---|---|
| Page won't load | Check the Terminal running `scripts/demo.sh start` is still open. If not, run it again. |
| "Can't reach database" | Run `scripts/demo.sh start` again; it restarts the database. |
| The demo data is messy from rehearsal | Run `scripts/demo.sh reset`, then sign in again in both windows. |
| Logged in as the wrong person | Use the other window, or click **Sign out** at the bottom left. |
| Route builder closed by accident | Click **Mentees**, then **Set a route** again. |
| Everything is slow | Make sure Prime Video and other heavy apps are closed. |

Backup if the laptop fails: the 46-second launch film at `launch-video/export/mentormatch-launch-1080p.mp4`. Copy it to your phone or a USB stick tonight.

---

## 6. Accounts

The password is the same for every account. `scripts/demo.sh reset` prints it.

| Who | Email | Use it for |
|---|---|---|
| James Wilson, student with no mentor | `james.mentee@test.com` | The live request flow (Window A) |
| Alicia Thompson, music producer and mentor | `alicia.music@test.com` | Accept, set the route, chat (Window B) |
| Alex Thompson, student partway through a route | `alex.mentee@test.com` | "Weeks in" view |
| Sarah Johnson, mentor with two mentees | `sarah.mentor@test.com` | A mentor with active routes, if asked |
| Renee Okafor, airline pilot and mentor | `renee.mentor@test.com` | Aviation example, if asked |
