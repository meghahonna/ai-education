# Prompt Engineering Template

A structured template for crafting effective prompts. Fill in the sections relevant to your task — not every section is needed every time, but the more context you provide, the better the output.

---

## 1. Task Context
_What is the big picture? Why are you asking for this?_

```
You are helping me with [project/goal]. The purpose of this task is [reason].
```

## 2. Tone Context
_How should the response sound?_

```
Write in a [professional / casual / technical / friendly] tone.
The audience is [who will read this].
```

## 3. Background Data, Documents, and Images
_Paste or reference any supporting material the AI needs to work with._

```
Here is the relevant background:
- [Key fact or data point]
- [Document excerpt or summary]
- [Link or reference]
```

## 4. Detailed Task Description and Rules 🔥
_Be specific about what you want. Include constraints and requirements._

```
Your task is to [specific action].

Rules:
- [Constraint 1, e.g., "Keep it under 300 words"]
- [Constraint 2, e.g., "Do not include jargon"]
- [Constraint 3, e.g., "Use only the data I provided"]
```

## 5. Examples 🔥
_Show what good output looks like. Even one example dramatically improves results._

```
Here is an example of what I'm looking for:

Input: [sample input]
Output: [sample output]
```

## 6. Conversation History 🔥
_If this is a continuation, summarize what has already been discussed or decided._

```
So far we have:
- [Decision or output from a previous step]
- [Agreed-upon direction]
```

## 7. Immediate Task Description or Request
_The specific ask for this turn. Keep it clear and direct._

```
Now, please [do this specific thing].
```

## 8. Thinking Step by Step / Scratchpad
_Ask the AI to reason through the problem before answering._

```
Before giving your final answer, think through this step by step:
1. [First consideration]
2. [Second consideration]
3. Then provide your recommendation.
```

## 9. Output Formatting
_Specify exactly how you want the response structured._

```
Format your response as:
- [Bullet points / numbered list / table / JSON / markdown]
- [Length: e.g., "2-3 paragraphs" or "under 500 words"]
- [Include/exclude: headers, citations, code blocks, etc.]
```

## 10. Prefilled Response (if any)
_Optionally start the response to steer the direction._

```
Start your response with: "[Opening phrase or structure]"
```

---

## Quick-Start Example

Putting it all together for a real task:

```
# Task Context
I'm preparing a quarterly update for my leadership team on our AI adoption progress.

# Tone
Professional but accessible. Avoid deep technical jargon — the audience includes
non-technical executives.

# Background
- We launched an internal AI assistant in January
- 120 staff members have access
- Usage data: 450 queries/week avg, 78% satisfaction rating
- Top use cases: drafting emails, summarizing meeting notes, data analysis

# Task & Rules
Write a one-page executive summary of our AI adoption progress.
- Lead with impact, not technology
- Include one concrete success story
- End with 2-3 recommendations for next quarter
- Keep it under 400 words

# Output Format
Use short paragraphs with bold subheadings. No bullet-point lists.

# Prefilled Response
Start with: "Three months into our AI pilot..."
```

---

## Example 2: Grant Writing

```
# Task Context
I'm applying for a community foundation grant to fund our youth mentorship program
for the next fiscal year. The grant deadline is in two weeks.

# Tone
Formal and persuasive, but warm. The reviewers are community foundation board members
— they care about local impact and sustainability, not academic language.

# Background
- Organization: a nonprofit serving at-risk youth ages 10-17 in rural counties
- Program: weekly one-on-one mentorship pairing adult volunteers with students
- Currently serving 85 youth across 3 counties with 40 trained mentors
- Last year's outcomes: 92% of participants improved school attendance,
  74% reported higher self-confidence (pre/post survey)
- Budget request: $75,000 for 12 months
- Funds will cover: a full-time program coordinator ($45K),
  mentor training materials ($10K), transportation stipends ($12K),
  and evaluation tools ($8K)
- The foundation's priorities: equity, measurable outcomes, and community partnerships

# Task & Rules
Draft the "Program Narrative" section of the grant application (typically 2-3 pages).
- Open with a compelling statement of need using local data
- Clearly describe the program model and what makes it effective
- Connect our outcomes directly to the foundation's stated priorities
- Include a sustainability plan showing how we'll maintain the program beyond this grant
- Do NOT exaggerate outcomes or make unsupported claims
- Keep it under 1,200 words

# Examples
Strong need statement: "In [County], 1 in 4 students will not graduate on time.
For students without a consistent adult mentor, that number doubles."

Weak need statement: "There are many problems facing youth in our community
and we would like to help."

# Thinking Step by Step
Before writing, outline:
1. What is the most compelling local data point to lead with?
2. How does our program model directly address the stated need?
3. Which outcomes align best with the foundation's three priorities?
4. What is our strongest argument for long-term sustainability?

# Output Format
Flowing narrative prose with subheadings: Statement of Need, Program Design,
Demonstrated Impact, and Sustainability Plan. No bullet points in the final output.
```

---

## Example 3: Donor Data Analysis

```
# Task Context
I'm preparing for our annual fundraising campaign and need to understand donor
behavior from the past 3 years so we can segment our outreach strategy.

# Tone
Analytical and direct. This analysis is for our development team's internal
planning meeting — we need clear insights, not a polished report.

# Background Data
[Paste or attach your donor CSV/spreadsheet here]

The dataset includes the following columns:
- donor_id, name, email
- first_gift_date, last_gift_date
- total_lifetime_giving, gift_count
- largest_single_gift, average_gift
- giving_channel (online, event, mail, peer-to-peer)
- donor_type (individual, corporate, foundation)
- lapsed (true/false — no gift in the past 18 months)

# Task & Rules
Analyze the donor data and provide actionable insights for campaign planning.
- Segment donors into meaningful groups (e.g., major donors, recurring loyalists,
  lapsed, new/first-time, event-only)
- For each segment, identify: size, average giving, preferred channel,
  and retention risk
- Flag the top reactivation opportunity (lapsed donors most likely to return)
- Identify any trends: Is average gift size growing or shrinking?
  Are we gaining or losing donors year over year?
- Do NOT include individual donor names in the output — use aggregate data only

# Examples
Good segment insight: "Recurring loyalists (3+ gifts/year, 2+ years active)
represent 12% of donors but contribute 43% of total revenue. Their preferred
channel is online, and average gift has grown 8% year over year.
Recommendation: prioritize retention with a personalized thank-you campaign
before the annual ask."

Bad segment insight: "Some donors give a lot and some don't."

# Thinking Step by Step
Work through this in order:
1. First, define the segments and the criteria for each
2. Then calculate key metrics per segment
3. Identify the 2-3 most important trends
4. End with prioritized recommendations tied to specific segments

# Output Format
Use a summary table for the segments (columns: Segment Name, Count, % of Total Donors,
% of Total Revenue, Avg Gift, Top Channel, Retention Risk).
Follow the table with 3-5 short narrative paragraphs covering key insights
and recommendations. Keep the full analysis under 800 words.
```

---

## Tips

- **You don't need all 10 sections every time.** A simple question needs only sections 1 and 7. A complex task benefits from all of them.
- **Sections 4, 5, and 6 have the highest impact** on output quality — invest your time there.
- **One good example is worth a paragraph of instructions.** When in doubt, show rather than tell.
- **Iterate.** Use the output from one prompt as input for the next. Build in layers.
