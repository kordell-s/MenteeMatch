# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: mentees who are students or new graduates** looking for their first role in their chosen field. That might be tech, business, aviation, design, marketing, health or another career. They need direction (what to learn, in what order), interview and portfolio help, and someone who holds them accountable.
- **Mentors:** working professionals across industries (tech, business, aviation and more) who accept mentees, build roadmaps for them, assign tasks, run sessions and leave ratings.

## Product Purpose

MentorMatch pairs early-career people with experienced mentors in their chosen field and turns each pairing into a structured program instead of a one-off call. A good outcome is a mentee who keeps working through a mentor-built roadmap until they land a role.

## Positioning

- **Structured roadmaps:** mentors build milestone roadmaps with tasks, resources and check-ins, so progress can be seen and measured.
- **Skill-based matching:** mentor recommendations are computed from skill overlap (IoU), not just browsing a directory.

## Operating Context

The core loop:

1. Sign up as a mentor or mentee.
2. Complete onboarding and profile (skills, goals, experience).
3. Browse mentors or see recommended ones.
4. Send a mentorship request.
5. The mentor accepts, which creates a mentorship and a conversation.
6. Messaging, session scheduling and the calendar.
7. The mentor builds a roadmap with milestones, tasks and check-ins.
8. Ratings after sessions.

## Capabilities and Constraints

- **Not tech-only:** the product serves many careers, including business, aviation, design, marketing and health. Copy, the skill taxonomy and examples must not assume tech. Mentor `category` and the `Skill` enum carry the field.

- **Stack:**
  - Next.js 14 App Router, TypeScript, Tailwind, Prisma and PostgreSQL.
  - next-auth with credentials only.
  - Jest tests in `__tests__`.
- **Roles:** `MENTOR` and `MENTEE`, with different dashboards.
- **Payments:** none. The product does not handle paid sessions.

## Evidence on Hand

There are no real testimonials, customers, partner logos or usage numbers. Future work must not fabricate social proof, metrics or partner brands. Mentor profiles shown publicly must come from the database.

## Product Principles

1. **Progress is the product.** Every surface should answer "what's next and how far along am I?"
2. **Matching should be explainable.** Show why a mentor was recommended (shared skills), not just a list.
3. **Honest over impressive.** No invented proof; let real mentors and real roadmaps carry the pitch.
4. **Early-career friendly.** Plain language and low-intimidation first steps, with no assumed industry jargon.

## Accessibility & Inclusion

Target WCAG 2.1 AA: keyboard-operable flows, visible focus, sufficient contrast and reduced-motion support.

## Brand Commitments

- Product name is **MentorMatch** (one word, camel-cased). It replaces every "MenteeMatch" in code, copy and docs.
