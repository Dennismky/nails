// The starting course. The server copies this into data/course.json the first time it runs.
// After that, edit everything from the admin page (/admin): this file is only the first draft.
//
// Lesson text format (used in the admin "Lesson text" box too):
//   ## Heading        ### Smaller heading
//   - bullet          1. numbered step
//   > Tip: ...        (a highlighted tip box; also "> Warning:" and "> Kenya:")
//   **bold**  *italic*
//   A blank line starts a new paragraph.

const q = (question, options, answer, explain) => ({ q: question, options, answer, explain });

const lessons = [
  // ───────────────────────────── THE COURSE ─────────────────────────────
  {
    id: 'welcome',
    section: 'course',
    title: 'Welcome to the craft',
    duration: '15 min',
    summary: 'What it really means to be a nail technician in Kenya today, and how this course will carry you from beginner to confident pro.',
    body: `## Karibu, future nail artist

Look at anyone's hands for a moment. Hands sign contracts, hold babies, cook, pray and greet. When someone sits at your table and gives you their hands, they are trusting you with something personal. That trust is what this profession is built on.

Being a nail technician is not "just painting nails". You are part health worker, part artist and part business owner. A good tech keeps clients safe from infection, spots problems early, creates something beautiful, and runs a booking diary that pays the rent.

## Why nails, why now?

The nail industry in Kenya is growing fast. From salons on Moi Avenue to home studios in Kitengela, Kisumu and Mombasa, clients want gel, acrylics, builder gel and nail art that looks like what they see on Instagram and TikTok. The techs who stand out are the ones who know the *why* behind every step, not only the *how*.

## How this course works

- **Course steps** run along the top of every lesson. Go in order: each step builds on the last.
- Every step ends with a **5-question quiz**. You get your score out of 5 straight away, with an explanation for every answer.
- The **Nail Art** section is your creative playground once the foundations are solid.
- Your progress saves on this device, so you can stop and come back any time.

> Tip: Keep a notebook. Write down every product you use, how long it took, and what you would do differently. Within a month you will see your own progress on paper.

## What you will be able to do

1. Understand the structure of the nail and the skin around it.
2. Work cleanly and safely, every client, every time.
3. Recognise nail and skin conditions, and know when to say "not today".
4. Give a proper manicure and pedicure.
5. Apply and remove gel polish, builder gel and acrylic without damage.
6. Shape nails beautifully and design nail art with confidence.
7. Price your work, find clients and keep them coming back.

Take a breath. Every great tech you admire started exactly where you are now.`,
    quiz: [
      q('Which best describes the job of a professional nail technician?', ['Painting nails quickly', 'Keeping clients safe, creating beautiful work and running a business', 'Selling nail products', 'Cutting cuticles as short as possible'], 1, 'A pro tech combines hygiene and safety, artistry, and business skill. Painting is only one part of it.'),
      q('In this course, how many questions are in each step\'s quiz?', ['3', '10', '5', 'There is no quiz'], 2, 'Every step ends with 5 questions and you see your score out of 5.'),
      q('Why does knowing the "why" behind each step matter?', ['It lets you charge less', 'It helps you solve problems and keep clients safe when things do not go to plan', 'It is only needed for exams', 'It does not matter if the nails look nice'], 1, 'When you understand why a step exists, you can adapt to each client and avoid damage or infection.'),
      q('What is a good habit for tracking your progress as a beginner?', ['Only practise on clients', 'Keep a notebook of products, timings and lessons learned', 'Change products every week', 'Avoid practising on yourself'], 1, 'Writing things down shows you exactly how you are improving and what to fix next.'),
      q('When should you move to the Nail Art section?', ['Before learning hygiene', 'Once the foundations (safety, prep, application) are solid', 'Never, it is optional', 'Only after a year of work'], 1, 'Beautiful art sits on top of good prep and safe application. Get the base right first.'),
    ],
  },
  {
    id: 'anatomy',
    section: 'course',
    title: 'Nail anatomy: know the nail',
    duration: '25 min',
    summary: 'The parts of the nail and the skin around it, how nails grow, and why the matrix is the one area you must never injure.',
    body: `## Why anatomy comes first

You cannot protect what you do not understand. Every file stroke, every push of the cuticle and every drop of product touches living tissue. Learn these words well: you will use them with clients and with other techs for the rest of your career.

## The parts you can see

- **Nail plate**: the hard, see-through part we paint. It is made of layers of a protein called *keratin*. It has no nerves and no blood.
- **Free edge**: the part of the plate that grows past the fingertip. This is what you shape.
- **Lunula**: the pale half-moon at the base. It is the visible front of the matrix. Not everyone shows one, and that is normal.
- **Eponychium**: the living skin at the base of the nail. It is a seal that keeps germs out. Never cut it.
- **Cuticle**: the thin layer of *dead* tissue that sticks to the nail plate behind the eponychium. This is what we gently push back and remove from the plate.
- **Lateral nail folds** (side walls): the skin along each side of the nail.
- **Hyponychium**: the skin seal under the free edge. Filing too deep underneath can break it and cause pain and infection.

## The parts you cannot see

- **Matrix**: the "factory" under the skin at the base, where new nail cells are made. Damage here (from heavy pushing, drilling or injury) can make the nail grow ridged or misshapen for good.
- **Nail bed**: the skin under the plate. It is full of blood vessels, which is why healthy nails look pink.

## How nails grow

Fingernails grow roughly **3 mm a month** on average, a little faster in summer and in younger people. A whole fingernail replaces itself in about 4 to 6 months. Toenails are much slower: a big toenail can take 12 to 18 months to grow out completely.

> Tip: When a client asks "how long until this damage grows out?", you can now give an honest answer: months, not weeks.

## What healthy nails look like

Smooth, pink-toned (on all skin tones you will see the nail bed colour through the plate), flexible, with no pain, swelling or odd colours. Learn what normal looks like, so the abnormal stands out to you straight away.

> Warning: The eponychium and hyponychium are protective seals. Cutting or damaging them opens a door to bacteria and fungus.`,
    quiz: [
      q('Which part of the nail produces new nail cells?', ['The free edge', 'The matrix', 'The hyponychium', 'The lunula only'], 1, 'The matrix sits under the skin at the base and makes new cells. Injuring it can permanently change how the nail grows.'),
      q('What is the cuticle?', ['Living skin at the base that must be cut', 'Dead tissue stuck to the nail plate', 'The pink part under the nail', 'The white tip of the nail'], 1, 'The cuticle is dead tissue on the plate. The living skin at the base is the eponychium, and you never cut it.'),
      q('Roughly how fast do fingernails grow?', ['About 3 mm a month', 'About 1 cm a week', 'About 1 mm a year', 'They do not grow after age 25'], 0, 'On average fingernails grow about 3 mm a month, so a full nail takes around 4 to 6 months to replace.'),
      q('What is the hyponychium?', ['The half-moon at the base', 'The seal of skin under the free edge', 'Another name for the nail plate', 'A type of nail fungus'], 1, 'The hyponychium seals the space under the free edge. Filing too deep underneath can damage it.'),
      q('Why do healthy nails usually look pink-toned?', ['Because of nail polish residue', 'Because the nail bed underneath has many blood vessels', 'Because keratin is pink', 'Because of the lunula'], 1, 'The plate is see-through, so you see the nail bed and its blood supply underneath.'),
    ],
  },
  {
    id: 'hygiene',
    section: 'course',
    title: 'Hygiene, cleaning & disinfection',
    duration: '30 min',
    summary: 'The most important lesson in the whole course. How to clean, disinfect and sterilise, and why some tools must never be reused.',
    body: `## Clients will forget your design. They never forget an infection.

A beautiful set means nothing if a client leaves with a fungal infection or a painful swollen finger. Hygiene is what turns a hobby into a profession. It also protects *you*: your skin, your lungs and your reputation.

## Three levels of clean

1. **Cleaning**: washing with soap and water and scrubbing off dust and debris. This always comes first, because disinfectant cannot work through dirt.
2. **Disinfecting**: using a hospital-grade disinfectant on hard, non-porous tools (metal pushers, nippers, scissors) and surfaces. The tool must stay fully wet for the **contact time** written on the label, often around 10 minutes.
3. **Sterilising**: destroying *all* microbes, including spores, usually with an autoclave (steam under pressure). This is the gold standard for metal implements.

## Porous vs non-porous

- **Non-porous** (metal, glass, some plastics): can be cleaned and disinfected or sterilised, then reused.
- **Porous** (nail files, buffers, orangewood sticks, toe separators, pumice, cotton, sponges): germs soak in and cannot be reliably removed. These are **single-use**: throw them away, or give them to the client to take home.

> Warning: Using the same file on the next client is one of the most common ways fungus spreads between people. One file, one client.

## Your step-by-step routine for every client

1. Wash your own hands, then ask the client to wash theirs (or use hand sanitiser).
2. Open a fresh set of disposables in front of the client. People notice, and it builds trust.
3. Use metal tools that are cleaned and disinfected, or sterilised and stored in a closed, clean container.
4. After the service, throw away used disposables. Clean metal tools with soap and water, then disinfect or sterilise them.
5. Wipe down the table, lamp, and armrest with disinfectant.
6. Pedicure basins and foot spas must be drained, scrubbed and disinfected after **every** client.

## Protect yourself too

- Wear a dust mask when filing enhancements, and work in a well-ventilated space. Nail dust and product fumes add up over years.
- Wear nitrile gloves when there is any chance of blood or broken skin.
- Keep products with lids closed, and never decant into unlabeled bottles.

> Kenya: Many clients come to home studios through social media. A clean, well-lit station with sealed tool pouches is a powerful selling point. Show it off in your videos.

## If you cut a client

Stay calm. Put on gloves, apply gentle pressure with clean cotton, use an antiseptic, cover with a plaster, and throw away anything that touched blood. Any tool with blood on it must be cleaned and then disinfected or sterilised before it is used again.`,
    quiz: [
      q('What must always happen before disinfecting a metal tool?', ['Nothing, just spray it', 'Clean it with soap and water to remove debris', 'Heat it with a lighter', 'Wipe it on a towel'], 1, 'Disinfectant cannot reach germs under dirt and debris, so cleaning always comes first.'),
      q('Which of these items is single-use (porous)?', ['Stainless steel cuticle pusher', 'Glass bowl', 'Nail file', 'Metal nippers'], 2, 'Files, buffers, orangewood sticks and similar porous items cannot be properly disinfected. Use them once, or give them to the client.'),
      q('What is "contact time" on a disinfectant label?', ['How long the bottle lasts', 'How long the tool must stay fully wet for it to work', 'How long to wait before opening', 'How long the client must sit'], 1, 'If the tool dries before the contact time is over, the disinfectant may not have killed the germs.'),
      q('Which method destroys all microbes including spores?', ['Rinsing with water', 'Wiping with a tissue', 'Sterilising in an autoclave', 'Leaving tools in the sun'], 2, 'Sterilisation (for example an autoclave) is the highest level, killing all microbes including spores.'),
      q('How often should a pedicure foot spa be cleaned and disinfected?', ['Once a week', 'Once a day', 'After every client', 'Only when it looks dirty'], 2, 'Foot spas can harbour bacteria. Drain, clean and disinfect after every single client.'),
    ],
  },
  {
    id: 'disorders',
    section: 'course',
    title: 'Nail & skin conditions: when to say "not today"',
    duration: '25 min',
    summary: 'Recognise common nail conditions, know which ones are safe to work on, and learn how to refer a client kindly.',
    body: `## You are not a doctor, but you are often the first to notice

Clients show you their hands more closely than they show anyone else. You may be the first person to spot a problem. Your job is not to diagnose: it is to **recognise, protect, and refer**.

## Safe to work on (with care)

- **White spots (leukonychia)**: usually from small knocks to the nail. They are not usually from a lack of calcium, whatever people say. They grow out.
- **Vertical ridges**: very common, especially with age. Buff very gently; do not try to file them flat.
- **Beau's lines**: horizontal dents across the nail, often after illness, high fever or stress. Work gently and you can explain to the client what caused them.
- **Bitten nails**: work carefully and kindly; a regular manicure is often what helps people stop biting.
- **Dry, brittle or peeling nails**: recommend cuticle oil daily and gloves for washing and cleaning.

## Do NOT work on: refer to a doctor or clinic

- **Fungal infection**: nail may be thickened, yellow, white or brown, crumbly, or lifting. It spreads easily on tools.
- **Paronychia**: red, swollen, painful, sometimes pus-filled skin around the nail. This is an infection.
- **A green or dark spot under an enhancement**: often a bacterial infection (people call it a "greenie"). Remove the product safely, do not cover it again, and advise the client to see a doctor if it does not clear.
- **Onycholysis with signs of infection**: the plate separating from the bed. A small separation from trauma may be fine, but if there is discoloration, smell or pain, refer.
- **Warts, open wounds, cuts or broken skin** on the area you would work on.
- **A dark streak or spot that is new, growing, or spreading onto the skin**: this needs a doctor to look at it, promptly.

> Warning: Never cover an infection with polish, gel or acrylic. It hides the problem, traps moisture and makes it worse.

## How to say it kindly

Clients can feel embarrassed. Try something like:

*"I've noticed something on this nail that I'm not trained to treat, and I'd hate to make it worse. It's best to have a doctor look at it. As soon as it's cleared, I'd love to have you back."*

Keep it private, keep it calm, and never use words like "dirty" or "disgusting".

## Special care clients

- **Diabetes**: the skin heals slowly and feeling in the feet may be reduced. Avoid sharp tools on the skin, never cut deeply, and check feet carefully for wounds. Refer any open sores.
- **Pregnancy, chemotherapy, or skin conditions like eczema and psoriasis**: ask questions, go gently, and suggest checking with their doctor if unsure.

> Tip: A short consultation card ("Any allergies? Any medical conditions? Any recent nail problems?") protects you and the client. Keep it on file.`,
    quiz: [
      q('A client has thick, yellow, crumbly toenails. What do you do?', ['Cover them with gel to hide it', 'File them flat and polish', 'Do not service those nails; kindly refer them to a doctor', 'Soak them in acetone'], 2, 'These are common signs of fungal infection. It can spread on tools, so do not service and refer kindly.'),
      q('What usually causes small white spots on nails?', ['Lack of calcium', 'Small knocks or trauma to the nail', 'Too much water', 'A fungal infection every time'], 1, 'White spots (leukonychia) usually come from minor injury. They grow out and are safe to work on.'),
      q('What is paronychia?', ['A nail shape', 'An infection of the skin around the nail: red, swollen and painful', 'A type of gel', 'The white half-moon'], 1, 'Paronychia is an infection. Do not work on the area; refer the client.'),
      q('You remove a client\'s acrylic and find a green spot. What should you do?', ['Apply a fresh set over it', 'Leave the product off, do not cover it, and advise them to see a doctor if it does not clear', 'Paint it a dark colour', 'Scrub it with a file'], 1, 'A green spot is often bacterial. Covering it traps moisture. Leave it uncovered and refer if needed.'),
      q('Why should you take extra care with diabetic clients\' feet?', ['They have stronger nails', 'Skin heals slowly and they may not feel small injuries', 'They need more acetone', 'It is not necessary'], 1, 'Reduced healing and feeling mean small cuts can become serious. Avoid sharp tools on the skin and refer any sores.'),
    ],
  },
  {
    id: 'tools',
    section: 'course',
    title: 'Tools, products & your station',
    duration: '20 min',
    summary: 'Everything on a professional nail table, what each item is for, and how to set up a station that works as hard as you do.',
    body: `## Your table is your shop window

Clients judge you in the first ten seconds. A clean, organised table says "this person is a professional" before you have said a word.

## Implements (reusable, metal)

- **Cuticle pusher**: gently pushes the eponychium back and lifts cuticle from the plate.
- **Cuticle nippers**: trims *only* dead hangnails and loose tags. Never living skin.
- **Nail clippers**: shortens long nails before filing.
- **Scissors and tweezers**: for tips, foils and placing decorations.

## Disposables (single-use)

- **Nail files**: the grit number tells you how rough it is. **Lower number = rougher.**
  - 80 to 100 grit: very coarse, for shaping enhancements only.
  - 150 to 180 grit: for refining enhancements and shortening.
  - 180 to 240 grit: for natural nails.
- **Buffers**: smooth the surface and remove shine before gel.
- **Orangewood sticks, cotton, lint-free wipes, toe separators.**

## Products

- **Hand sanitiser and disinfectant**
- **Polish remover**: acetone (fast, strong) and non-acetone (gentler, for natural nails and some tips).
- **Cuticle remover** (softens dead tissue) and **cuticle oil** (feeds the skin; your best aftercare product to sell).
- **Dehydrator and primer**: remove oils and help product stick.
- **Base coat, polish, top coat**
- **Gel system**: base, colour, top coat and a **lamp** (LED or UV) matched to the gel.
- **Enhancement system**: acrylic liquid and powder, or builder gel, and tips.

> Tip: Stay with one gel brand at first and learn it deeply. Mixing brands can cause curing problems, because each gel is made for particular lamp wavelengths.

## Electric file (e-file / drill)

E-files are fast, but in untrained hands they cause real damage: thin nails, heat burns and rings of damage near the cuticle. Learn manual filing first. Take proper e-file training before you use one on a client.

## Setting up your station

1. Disinfect the table and lay a fresh towel or paper.
2. Put disinfected metal tools in a clean, covered container.
3. Have disposables ready in a sealed pack per client.
4. Put a bin within reach, ideally with a lid.
5. Have good, bright, white light: a desk lamp makes a huge difference.
6. Keep good airflow: open windows, or a fan pulling air away from you.

> Kenya: Power cuts happen. A rechargeable or power-bank-friendly LED lamp can save your appointment (and your reviews) when KPLC goes off mid-service.`,
    quiz: [
      q('On a nail file, what does a lower grit number mean?', ['Smoother', 'Rougher', 'Longer', 'Pink colour'], 1, 'Lower grit numbers are coarser. Natural nails need finer files, about 180 to 240 grit.'),
      q('What should cuticle nippers be used for?', ['Cutting the living eponychium', 'Trimming only dead hangnails and loose tags', 'Shortening the nail', 'Opening polish bottles'], 1, 'Nippers are for dead, loose tissue only. Cutting living skin invites infection.'),
      q('Why is it wise to use one gel brand when starting?', ['It is cheaper', 'Each gel is made to cure with particular lamps; mixing can cause curing problems', 'Brands do not matter', 'Clients ask for one brand only'], 1, 'Gels and lamps are designed to work together. Mixing can leave gel under-cured, which can cause lifting and allergies.'),
      q('What is the best aftercare product to sell to clients?', ['Acetone', 'Cuticle oil', 'Coarse file', 'Primer'], 1, 'Daily cuticle oil keeps skin and nails flexible and helps the set last longer.'),
      q('Why learn manual filing before using an e-file?', ['E-files are illegal', 'Untrained e-file use can thin nails, cause heat burns and damage', 'Manual is faster', 'Clients prefer it'], 1, 'Master control and nail structure by hand first, then take proper e-file training.'),
    ],
  },
  {
    id: 'shapes',
    section: 'course',
    title: 'Nail shapes & filing technique',
    duration: '25 min',
    summary: 'The classic shapes, how to choose the right one for each client, and filing that protects the nail.',
    body: `## Shape is the frame of your art

The right shape makes fingers look longer, nails look stronger and designs look intentional. The wrong shape breaks easily and looks unbalanced.

## The classic shapes

- **Square**: flat tip, straight sides, sharp corners. Strong, modern, good for French tips. Can snag on short nails.
- **Squoval**: square with softened corners. The most practical everyday shape and very forgiving.
- **Round**: follows the fingertip. Great for short nails and people who work with their hands.
- **Oval**: longer and more elegant, curved tip. Makes fingers look slimmer.
- **Almond**: slim sides that come to a soft point, like an almond. Very feminine; needs some length.
- **Stiletto**: long and sharply pointed. Dramatic, but best on enhancements for strength.
- **Coffin / ballerina**: tapered sides with a flat tip. Popular with long acrylics and gel extensions.

## Choosing the right shape

Ask about the client's lifestyle first. A nurse, a farmer or a mum of toddlers needs something different from someone styling for a wedding.

- **Short nails or active hands**: round or squoval.
- **Wide nail beds**: oval or almond to create a slimmer look.
- **Long, narrow nail beds**: square or squoval suit them.
- **Want drama and length**: almond, stiletto or coffin on enhancements.

## Filing natural nails

1. Shorten with clippers first if needed; a file is not a saw.
2. Use a fine file (180 to 240 grit).
3. File from the **side to the centre, in one direction**. Sawing back and forth on a natural nail causes splitting and peeling.
4. Hold the file slightly under the free edge, at an angle, so you shape without thinning the top.
5. Check symmetry by looking at the nail from above, from the front (down the finger), and from the side.
6. Finish by gently removing any rough fibres under the free edge.

> Tip: Look at all ten nails together from the client's point of view, with their hands flat. Matching lengths and shapes is what makes a set look professional.

## Common mistakes

- Filing the side walls too deep: weakens the nail and leads to breaks.
- Uneven lengths across the hand.
- Filing on wet nails: soft, wet nails tear and peel. File dry.`,
    quiz: [
      q('Which shape is the most practical, forgiving everyday shape?', ['Stiletto', 'Squoval', 'Coffin', 'Extra-long square'], 1, 'Squoval keeps square strength with softened corners that do not snag.'),
      q('How should you file a natural nail?', ['Back and forth quickly', 'From the side to the centre, in one direction', 'Only on the top surface', 'While it is wet'], 1, 'One-direction filing prevents the layers of the nail from splitting and peeling.'),
      q('Which shape best suits a client with very active hands and short nails?', ['Stiletto', 'Long coffin', 'Round', 'Long almond'], 2, 'Round follows the fingertip and is strong and practical for short, busy hands.'),
      q('Why should you avoid filing deep into the side walls?', ['It takes too long', 'It weakens the nail and causes breaks', 'It changes the colour', 'It is fine to do'], 1, 'The sides support the nail. Filing into them creates weak points that break.'),
      q('Which file grit is best for natural nails?', ['80 grit', '100 grit', '180 to 240 grit', 'Sandpaper from the hardware shop'], 2, 'Finer files (180 to 240) shape natural nails without tearing them.'),
    ],
  },
  {
    id: 'manicure',
    section: 'course',
    title: 'The classic manicure, step by step',
    duration: '35 min',
    summary: 'The full professional manicure, from consultation to the last drop of cuticle oil, including a perfect polish finish.',
    body: `## The manicure is your foundation

Every gel set, every acrylic, every piece of art you will ever do starts with the steps in this lesson. Master the classic manicure and everything else becomes easier.

## Step by step

1. **Consultation**: ask about allergies, health, lifestyle and what they want. Look at the nails and skin.
2. **Hygiene**: sanitise your hands and the client's hands. Open fresh disposables.
3. **Remove old polish**: press a soaked cotton pad on the nail for a few seconds, then wipe from base to tip in one stroke. No scrubbing.
4. **Shape**: shorten if needed and file into the chosen shape.
5. **Soften the cuticle**: apply cuticle remover (or soak briefly in warm water) as the product directs.
6. **Push back**: hold the pusher flat and gently ease back the eponychium, then lift the dead cuticle off the plate in small circles.
7. **Tidy**: nip only loose, dead tags. Never cut living skin to make it "neat".
8. **Buff** (lightly): smooth ridges with a soft buffer. Light pressure; you are not trying to thin the nail.
9. **Massage**: lotion and a hand massage. This is the part clients remember and rebook for.
10. **Cleanse**: wipe the nails with remover or dehydrator so there is no oil or lotion on the plate. Polish will not stick to oil.
11. **Base coat**: one thin coat. Protects against staining and helps polish grip.
12. **Colour**: two thin coats.
13. **Top coat**: seals and adds shine. Wrap the free edge too.
14. **Clean up** around the edges with a small brush dipped in remover.
15. **Cuticle oil** once dry to the touch, and send them home with aftercare advice.

## The perfect polish stroke

Use the **three-stroke method**:
1. Place a small bead of polish slightly away from the cuticle, then push it gently towards the cuticle, leaving a tiny gap.
2. Pull one stroke down the centre to the tip.
3. One stroke down each side.

Then **cap the free edge**: swipe the brush lightly along the tip. This seals the polish and reduces chipping.

> Tip: Thin coats beat thick coats every time. Thick polish stays soft underneath, dents and smudges. Two thin coats dry faster and last longer.

## Aftercare to tell every client

- Polish takes time to harden fully; avoid hot water and hard knocks for a few hours.
- Use cuticle oil daily.
- Wear gloves for washing and cleaning.
- Nails are jewels, not tools: no opening soda cans with them.`,
    quiz: [
      q('Why do you cleanse the nail plate right before the base coat?', ['To make it shine', 'To remove oil and lotion so the polish sticks', 'To soften the cuticle', 'To change the nail colour'], 1, 'Oils from lotion and skin stop polish gripping the nail, causing early peeling and chips.'),
      q('In the three-stroke method, where does the first bead of polish go?', ['Right on the cuticle skin', 'Slightly away from the cuticle, then gently pushed towards it', 'On the free edge', 'On the side walls'], 1, 'Starting slightly away lets you control the edge and leave a neat small gap at the cuticle.'),
      q('What does "capping the free edge" mean?', ['Cutting the tip off', 'Swiping polish along the tip of the nail to seal it', 'Covering the nail with a cap', 'Filing the edge square'], 1, 'Capping seals the tip and reduces chipping where nails take the most wear.'),
      q('Why are two thin coats better than one thick coat?', ['They use more polish', 'Thin coats dry harder and last longer; thick coats stay soft and smudge', 'Thick coats are illegal', 'There is no difference'], 1, 'Thin coats dry and harden properly. Thick coats stay soft underneath.'),
      q('What should you do with living skin around the nail to make it look neat?', ['Cut it with nippers', 'Leave it alone and only remove dead tissue', 'File it away', 'Burn it with an e-file'], 1, 'Living skin protects against infection. Only dead tags and cuticle on the plate are removed.'),
    ],
  },
  {
    id: 'pedicure',
    section: 'course',
    title: 'The pedicure & foot care',
    duration: '30 min',
    summary: 'A safe, relaxing professional pedicure: soaking, toenail care, calluses, and the safety rules for feet.',
    body: `## Feet carry us everywhere

In Kenya, between dusty roads, hot pavements, open shoes and long days standing, feet work hard. A great pedicure is not only beautiful; it can bring real relief.

## Step by step

1. **Check the feet first**, before soaking. Look for cuts, infections, fungal nails, warts or swelling. If you see a problem, do not start.
2. **Soak** in a clean, disinfected basin of warm water for a few minutes. Test the temperature with your own wrist first.
3. **Cut toenails straight across**, and only slightly round the corners with a file. Cutting curved down into the corners is a leading cause of ingrown toenails.
4. **File** the toenails smooth.
5. **Cuticle care**: soften and gently push back, as in the manicure.
6. **Calluses**: soften, then use a foot file gently. Smooth, do not remove completely: some hard skin protects the foot.
7. **Exfoliate** with a scrub, rinse, and dry well, especially between the toes.
8. **Massage** the feet and lower legs with lotion.
9. **Cleanse the nails** so there is no lotion on them.
10. **Toe separators**, base coat, two thin colour coats and top coat.

## Safety rules

> Warning: Never use razor blades or "credo" blades to shave calluses. It is easy to cut too deep, and cuts on feet get infected easily.

- Do not over-soak; skin that is too soft cuts easily.
- Never dig deep into the corners of the toenail.
- Clients with diabetes or poor circulation: no sharp tools on the skin, gentle filing only, and refer any wounds.
- Clean and disinfect the basin after every client.

## Dealing with common foot issues

- **Dry, cracked heels**: gentle filing, rich foot cream and advice to moisturise nightly with socks on.
- **Ingrown toenail that is red, painful or swollen**: do not try to "dig it out". Refer to a doctor or clinic.
- **Fungal toenails**: do not service those nails; refer.

> Tip: Offer a "Mama's Weekend Treat" or "Groom's Feet" pedicure package with a longer massage. Named packages sell better than plain price lists.`,
    quiz: [
      q('How should toenails be cut to prevent ingrown nails?', ['Deeply curved into the corners', 'Straight across, only slightly softening the corners', 'As short as possible', 'Into a point'], 1, 'Cutting straight across stops the corners from growing into the skin.'),
      q('Should you use razor blades to remove calluses?', ['Yes, it is fastest', 'No, they can cut too deep and cause infection', 'Only on thick calluses', 'Only for regular clients'], 1, 'Blades are dangerous on feet. Use a foot file gently instead.'),
      q('When should you check the client\'s feet for problems?', ['After painting', 'Before soaking or starting', 'Only if they complain', 'Never'], 1, 'Check first: if there is an infection or wound, you should not start the service.'),
      q('Why not remove all of a callus?', ['It grows back immediately', 'Some hard skin protects the foot', 'It is too hard', 'Clients like it'], 1, 'Calluses protect pressure points. Smooth them, do not remove them completely.'),
      q('A client has a red, swollen, painful ingrown toenail. What do you do?', ['Dig it out with a pusher', 'Cut deep into the corner', 'Do not treat it; refer them to a doctor or clinic', 'Cover it with polish'], 2, 'An inflamed ingrown nail may be infected. It needs medical care, not a pedicure.'),
    ],
  },
  {
    id: 'gel',
    section: 'course',
    title: 'Gel polish: application & curing',
    duration: '35 min',
    summary: 'Long-lasting, shiny gel the right way: prep, thin coats, proper curing, and avoiding gel allergies.',
    body: `## Why gel is so popular

Gel polish gives two to three weeks of shine with no drying time. It is the bread and butter of most Kenyan salons. But gel done badly causes lifting, damaged nails and, worst of all, allergies.

## How gel works

Gel is a liquid that hardens (cures) when exposed to the light from a **UV or LED lamp**. If it does not get enough of the right light, it stays under-cured: it may look fine on top but is soft and sticky underneath. Under-cured gel lifts, peels and is a main cause of allergy.

## Prep is everything

1. Gently push back and remove cuticle from the plate. Any cuticle left on the nail will cause lifting.
2. Remove the shine from the nail with a soft buffer. Light pressure only.
3. Dust off thoroughly with a clean brush.
4. Apply dehydrator (and primer if your system uses one).

## Application

1. **Base coat**: thin, scrubbed in gently. Keep it off the skin. Cure.
2. **Colour**: thin coat. Cap the free edge. Cure.
3. **Second colour coat**: thin. Cure.
4. **Top coat**: cap the edge. Cure.
5. If your top coat leaves a sticky layer (the *inhibition layer*), wipe it with a lint-free wipe and cleanser. "No-wipe" top coats do not need this.
6. Cuticle oil to finish.

Cure times depend on the lamp and the gel: often **30 to 60 seconds under LED** and around **2 minutes under UV**. Always follow your brand's instructions.

> Tip: Keep the client's hand flat and fully inside the lamp, and do the thumbs separately. Tilted thumbs are where most under-curing happens.

## Allergy: the thing nobody warns beginners about

Gel and acrylic contain chemicals (such as HEMA) that can cause an allergy if they touch the skin repeatedly. Once someone is allergic, it is usually **for life**. It shows as itching, redness, swelling or blisters around the nails.

> Warning: Keep gel off the skin, cure fully, and never use "cheap" lamps with the wrong gel. If a client reacts, stop using that product on them and refer them to a doctor. Techs get allergies too, from gel on their own fingers: wear gloves and clean spills.

## Heat spikes

Some gels get hot as they cure. If a client says "ouch, it's burning", let them take the hand out for a few seconds, then put it back. Thin coats reduce heat spikes.

## Safe removal (never peel!)

1. File off the shiny top coat gently.
2. Place acetone-soaked cotton on each nail and wrap in foil.
3. Wait 10 to 15 minutes.
4. Gently push the loosened gel off with an orangewood stick. If it does not move, rewrap and wait longer.
5. Buff lightly, wash hands and apply cuticle oil.

Peeling gel off pulls away the top layers of the nail. This is the number one cause of "gel ruined my nails".`,
    quiz: [
      q('What makes gel polish harden?', ['Air drying', 'Light from a UV or LED lamp', 'Blowing on it', 'Cold water'], 1, 'Gel cures under UV or LED light. Without enough light it stays soft.'),
      q('Which is a main cause of gel allergies?', ['Gel touching the skin repeatedly and under-curing', 'Using cuticle oil', 'Thin coats', 'Washing hands'], 0, 'Uncured gel on the skin, again and again, can trigger an allergy that usually lasts for life.'),
      q('What is the sticky layer left after curing some top coats?', ['Proof it did not cure', 'The inhibition layer', 'Cuticle oil', 'A mistake'], 1, 'The inhibition layer is normal. Wipe it off with cleanser, or use a no-wipe top coat.'),
      q('What is the correct way to remove gel?', ['Peel it off', 'Bite it off', 'File off the shine, soak with acetone wraps, then gently push off', 'Scrape with a metal blade'], 2, 'Soak-off removal protects the nail. Peeling pulls off layers of the nail plate.'),
      q('A client says the lamp is burning. What do you do?', ['Tell them to hold still', 'Let them take the hand out briefly, then return it; use thinner coats', 'Turn the lamp up', 'Ignore it'], 1, 'That is a heat spike. A short break prevents discomfort, and thinner coats help.'),
    ],
  },
  {
    id: 'acrylic',
    section: 'course',
    title: 'Acrylic nails: liquid & powder',
    duration: '45 min',
    summary: 'Acrylic chemistry, bead control, building the apex and safe products, so your sets are strong, slim and comfortable.',
    body: `## Acrylic in a nutshell

Acrylic is made by mixing a liquid (**monomer**) with a powder (**polymer**). Together they form a soft bead that you place and shape, and it hardens by itself in the air in a few minutes. Acrylic is strong and great for length and dramatic shapes.

## Know your liquid: EMA, not MMA

- **EMA (ethyl methacrylate)** is the professional standard liquid.
- **MMA (methyl methacrylate)** liquid is much cheaper, but it is extremely hard, sticks too strongly, is very hard to remove, and is linked to serious nail damage. It has been banned for nail use in many places.

> Warning: If a liquid is very cheap, has a strong fruity or harsh smell, or the label does not say what is in it, do not use it. Your clients' nails are worth more than the savings.

## The bead: your most important skill

Dip a clean brush in liquid, wipe one side on the edge of the dappen dish, then draw it through the powder. The result is a bead.

- **Too wet**: runs into the cuticle and side walls, stays weak, and can cause lifting and skin contact.
- **Too dry**: grainy and crumbly, does not stick or self-level.
- **Medium (ideal)**: shiny, holds its shape, and slowly relaxes and levels.

Practise beads on a practice hand or tip on a stick until you can make the same one every time.

## Building the nail: three zones

1. **Zone 1, the free edge**: a bead to form the tip or extend length.
2. **Zone 2, the stress area / apex**: the thickest part, around where the free edge meets the nail bed. This is where nails break, so it needs the most strength. The highest point is called the **apex**.
3. **Zone 3, near the cuticle**: very thin, smooth and flat, so it blends seamlessly. Never touch the skin with product.

From the side, a good acrylic nail has a gentle curve that rises to the apex and slopes down to the tip and to the cuticle.

## Prep and primer

- Prep the natural nail like for gel: cuticle off the plate, light buff, dust off, dehydrate.
- **Primer** helps acrylic stick. Acid-free primer is gentler and the common choice. Acid primer is very strong: use a tiny amount, only on the nail, never on skin.

## Ventilation and safety

Monomer has a strong smell and fumes. Work with good airflow, keep lids closed, use a small dappen dish with a lid, and dispose of used liquid on paper towel, not down the sink.

## Fills (infills)

Every 2 to 3 weeks the nail grows out and a gap appears at the cuticle. Thin down the old product, check for lifting (any lifted product must be removed), and fill the gap. Leaving lifted acrylic on traps moisture, which invites bacteria.`,
    quiz: [
      q('Which acrylic liquid is the professional standard?', ['MMA', 'EMA', 'Water', 'Acetone'], 1, 'EMA is the professional standard. MMA is linked to damage and is banned for nail use in many places.'),
      q('What does a bead that is too wet do?', ['Holds its shape perfectly', 'Runs into the skin and side walls and is weak', 'Turns grainy', 'Cures instantly'], 1, 'Too much liquid flows into the skin, weakens the nail and can cause lifting and skin reactions.'),
      q('Where is the apex of an acrylic nail?', ['At the cuticle', 'At the very tip', 'In the stress area, the thickest point of the nail', 'Under the nail'], 2, 'The apex is the high point over the stress area, where nails need the most strength.'),
      q('How should zone 3 (near the cuticle) be?', ['The thickest part', 'Very thin and smooth, without touching the skin', 'Left empty', 'Covered in glitter'], 1, 'Thin and smooth near the cuticle gives a natural look and avoids skin contact and lifting.'),
      q('During a fill you find lifted acrylic. What should you do?', ['Fill over it', 'Remove the lifted product before filling', 'Glue it down', 'Leave it for next time'], 1, 'Lifted product traps moisture and bacteria. Remove it before refilling.'),
    ],
  },
  {
    id: 'builder-gel',
    section: 'course',
    title: 'Builder gel, BIAB & extensions',
    duration: '40 min',
    summary: 'Strengthening natural nails with builder gel, and adding length with tips, forms and gel extensions.',
    body: `## Strength without the bulk

Builder gel (often sold as BIAB, "builder in a bottle") is a thicker gel that adds strength to natural nails. It is perfect for clients who want their own nails to grow long and strong without acrylic.

## Builder gel overlay on natural nails

1. Prep as for gel polish.
2. Apply a thin base layer and cure (with some systems, the base is the builder itself).
3. Apply a bead of builder gel in the centre of the nail and let it **self-level**: turn the client's finger upside down for a few seconds so the gel flows to create the apex.
4. Check the shape from the side: a gentle curve with the apex in the stress area.
5. Cure fully.
6. Wipe, refine the shape with a file, then add colour and top coat if wanted.

> Tip: Do not flood the cuticle area. Builder that touches the skin will lift, and repeated skin contact causes allergies.

## Adding length

### Tips
Plastic tips glued to the natural nail, then blended and covered with gel or acrylic.
1. Choose a tip that fits side wall to side wall. Too narrow puts pressure on the nail; too wide looks bulky and lifts.
2. Glue only to the front part of the nail, press and hold.
3. Cut to length, blend the seam, then overlay.

### Soft gel tips (full-cover tips)
Pre-shaped soft gel tips that cover the entire nail. Apply with gel and cure. Fast, popular, and easy to remove by soaking.

### Forms
A sticker or reusable form placed under the free edge. You sculpt the length with gel or acrylic and remove the form afterwards. Takes more skill, but gives the most natural and strong result.

## Polygel (acrylic-gel)

A thick, putty-like gel that you shape with a brush and slip solution, then cure under a lamp. It does not harden until it is cured, which gives beginners more time to work.

## Removal and maintenance

- Builder gel can be soaked off (some types) or filed down and rebalanced every 2 to 3 weeks.
- Never pull or pry off enhancements. Clients who pick them off lose layers of their own nail.

> Kenya: Many clients want long nails but have jobs that need strong, practical hands. Builder gel on natural length is a brilliant middle option. Offer it as "strong natural nails".`,
    quiz: [
      q('What is builder gel mainly used for?', ['Removing polish', 'Adding strength to natural nails', 'Softening cuticles', 'Cleaning tools'], 1, 'Builder gel is a thicker gel that strengthens natural nails and can build structure.'),
      q('What does "self-levelling" mean?', ['The client files their own nails', 'Turning the finger so the gel flows to form a smooth apex', 'Using a level tool', 'Curing twice'], 1, 'Gravity helps the gel flow into a smooth curve with the apex in the right place.'),
      q('What happens if builder gel touches the skin?', ['Nothing', 'It lifts, and repeated contact can cause allergies', 'It cures faster', 'It makes the nail stronger'], 1, 'Product on skin lifts at the edge and repeated contact risks allergic reactions.'),
      q('How should a plastic tip fit?', ['Narrower than the nail', 'Side wall to side wall', 'Much wider than the nail', 'Only covering half the nail sideways'], 1, 'The tip should match the nail width: too narrow causes pressure; too wide lifts.'),
      q('What is special about polygel?', ['It dries in air instantly', 'It stays workable until cured under a lamp', 'It needs no lamp', 'It is a polish remover'], 1, 'Polygel does not set until cured, so beginners get more time to shape it.'),
    ],
  },
  {
    id: 'nail-health',
    section: 'course',
    title: 'Protecting nail health & safe removal',
    duration: '20 min',
    summary: 'Why nails get damaged, how to prevent it, and how to rebuild a client\'s natural nails after enhancements.',
    body: `## "Gel ruined my nails"

You will hear this a lot. Usually it is not the product itself, it is: over-filing during prep, peeling product off, e-file damage, or never giving the nails a moment of care. A good tech can prevent all of these.

## The main causes of damage

1. **Over-filing**: using a coarse file or heavy buffing during prep thins the plate. You only need to remove the shine.
2. **Picking and peeling**: pulls away the top layers of the nail.
3. **Prying off enhancements**: the same, but worse.
4. **E-file misuse**: heat, rings and thinning near the cuticle.
5. **Lifting left too long**: moisture and bacteria get trapped.
6. **Dryness**: no cuticle oil, harsh cleaning products, washing without gloves.

## Signs of thin, damaged nails

- Nails that bend easily or feel painful under pressure or heat.
- Red patches on the nail where the plate is very thin.
- Peeling layers and white patches after removal.

## How to help a client recover

1. Remove all product gently, by soaking.
2. Keep the nails short. Short nails break less while they recover.
3. A thin builder gel overlay or a strengthening treatment can protect them while they grow out (if the nails are not painful).
4. **Cuticle oil every day**, ideally twice.
5. Gloves for washing up and cleaning.
6. Patience: remember from Anatomy that a full fingernail takes around 4 to 6 months to grow out.

> Tip: Show clients how to use cuticle oil: one drop at the base of each nail, massaged in. Clients who oil daily get longer-lasting sets, which means happier reviews for you.

## Do clients need a "break" from gel?

Healthy nails do not need to "breathe": the nail plate gets its nutrients from the nail bed and blood supply, not from the air. What they need is careful prep, proper removal and good aftercare. If nails are already damaged, though, a period of short nails and gentle care helps them grow back.`,
    quiz: [
      q('What is the most common real cause of "gel damage"?', ['The gel colour', 'Over-filing, peeling, and poor removal', 'Using cuticle oil', 'The lamp colour'], 1, 'It is usually prep and removal habits, not the gel itself.'),
      q('How much should you file the nail surface during gel prep?', ['Until it is very thin', 'Only enough to remove the shine', 'Not at all, never', 'With an 80 grit file'], 1, 'Just remove the shine. Heavy filing thins the plate.'),
      q('Do nails need to "breathe"?', ['Yes, every week', 'No, nails are fed through the nail bed and blood supply, not the air', 'Only toenails', 'Only in hot weather'], 1, 'The nail plate gets what it needs from the body. What matters is gentle prep and removal.'),
      q('What helps a client recover from thin, damaged nails?', ['Longer extensions', 'Short nails, daily cuticle oil and gentle care while they grow out', 'Coarse filing', 'Peeling the damaged layers'], 1, 'Short, oiled, protected nails recover as healthy new nail grows from the matrix.'),
      q('Why does lifting need attention quickly?', ['It looks shiny', 'Moisture and bacteria can get trapped underneath', 'It makes nails grow faster', 'It is harmless'], 1, 'Gaps under the product trap moisture, which can lead to infection.'),
    ],
  },
  {
    id: 'business',
    section: 'course',
    title: 'Clients, pricing & business in Kenya',
    duration: '30 min',
    summary: 'Turn your skill into income: consultations, pricing that pays, M-Pesa, social media, bookings and keeping clients loyal.',
    body: `## Skill gets you started. Business keeps you going.

Many talented techs struggle because they undercharge, run late or vanish from social media. This lesson is about building a business you can grow.

## Registering and staying legal

- If you run a salon or studio, you will need a **Single Business Permit** from your county government. Requirements and fees differ from county to county, so check with your county office or its online portal.
- Keep records of money in and money out. It makes tax returns (KRA) and planning much easier.
- If you rent a chair or space, get the agreement in writing.

## Pricing that actually pays

Your price must cover more than products. Work it out:

1. **Product cost per service**: gel, files, cotton, wipes, foil and so on.
2. **Your time**: how many hours, and what an hour of your skill is worth.
3. **Overheads**: rent, electricity, internet, transport, lamp and tool replacements, divided across your clients.
4. **Profit**: money for growth, savings and slow months.

*Example:* if a gel set costs you KSh 250 in products, takes 1.5 hours, and your overheads work out to about KSh 200 per client, charging KSh 600 means you are paying yourself very little. Know your numbers before you set your prices.

> Tip: Do not compete only on price. There will always be someone cheaper. Compete on cleanliness, punctuality, results that last, and how good clients feel in your chair.

## Getting paid

- Set up an **M-Pesa Till or Paybill** for the business, separate from your personal line. It looks professional and keeps records clean.
- Take a **booking deposit** for long services or new clients. It cuts no-shows dramatically.
- Have a clear, written price list. Surprises at payment time lose clients.

## Finding clients

- **Instagram and TikTok**: post your work in natural light, every week. Short videos of the process (shaping, the chrome rub, the reveal) perform very well.
- **Before and after** photos, always with the client's permission.
- **WhatsApp Business**: a catalogue, quick replies, and status updates with your available slots.
- **Google Business Profile**: so people searching "nails near me" find you.
- **Referrals**: offer a small discount when a client brings a friend.

## Keeping clients

- Be on time. If you run late, message them.
- Remember details: their favourite colour, their daughter's graduation, their sensitivity to heat in the lamp.
- Book the next appointment before they leave.
- Follow up with a quick message: "How are your nails holding up?"

## Consultations and consent

Before every new client: a short consultation form covering allergies, health conditions, and what they want. Agree on the design, length and price *before* you start. A photo reference helps hugely.

> Kenya: Weddings, graduations, Christmas and Eid are big seasons. Plan special packages, open extra slots, and post bridal and festive looks a few weeks early.`,
    quiz: [
      q('What should your price for a service cover?', ['Only the product cost', 'Products, your time, overheads and profit', 'Whatever the shop next door charges', 'Transport only'], 1, 'Pricing that covers all four keeps your business alive and growing.'),
      q('What is a good way to reduce no-shows?', ['Never confirm bookings', 'Take a booking deposit', 'Charge less', 'Only accept walk-ins'], 1, 'Deposits make clients commit, and protect your time.'),
      q('Who issues the Single Business Permit in Kenya?', ['Your county government', 'The client', 'Your nail supplier', 'Nobody, it is not needed'], 0, 'Business permits are handled by county governments, and requirements vary by county.'),
      q('What is a better strategy than competing only on price?', ['Copy other techs\' photos', 'Compete on cleanliness, punctuality and lasting results', 'Work faster and skip prep', 'Stop posting on social media'], 1, 'There is always someone cheaper. Quality and experience build loyal clients.'),
      q('When should you book a client\'s next appointment?', ['Never', 'Before they leave your chair', 'Only if they call you', 'After six months'], 1, 'Booking before they leave keeps your diary full and your clients looked after.'),
    ],
  },

  // ───────────────────────────── NAIL ART ─────────────────────────────
  {
    id: 'art-foundations',
    section: 'art',
    title: 'Nail art foundations: colour & tools',
    duration: '25 min',
    summary: 'Colour theory, the essential art brushes and tools, and how to plan a design that looks intentional.',
    body: `## Art starts with a plan

The most stunning sets you see online look effortless because someone planned them. Before you pick up a brush, decide: what is the mood, what are the colours, and which nails get the "feature"?

## Colour theory in five minutes

- The **colour wheel**: red, yellow, blue (primary), and the colours made by mixing them.
- **Complementary colours** sit opposite each other on the wheel (blue and orange, purple and yellow, red and green). Together they are bold and full of energy.
- **Analogous colours** sit next to each other (pink, coral and peach). Together they feel calm and harmonious.
- **Neutrals** (nude, white, black, grey, brown) let art pop. A nude base with one gold line is pure elegance.

> Tip: Pick nude shades that suit the client's skin tone. A nude that is too light can look chalky on deep skin; a rich caramel or mocha may be the perfect "nude".

## The essential art tools

- **Dotting tools**: perfect dots, flower centres, polka dots and hearts.
- **Striping brush**: long thin bristles for lines.
- **Detail / liner brush**: short fine bristles for small detailed work.
- **Flat and angled brushes**: one-stroke flowers, French tips and clean-ups.
- **Fan brush**: for glitter fades and soft textures.
- **Sponge**: for ombré gradients.
- **Art gel or paint gel**: thick pigmented gel that stays where you put it.
- **Foils, chrome powders, glitter, stickers and gems.**

## Designing the set

- **Feature nails**: put your most detailed art on one or two nails (often the ring finger) and keep the others simple.
- **Balance**: if the right hand has art on the ring finger, mirror it on the left.
- **Repeat elements**: use a colour or shape from the feature nail on the plain nails so the set feels connected.

## Practise smart

Practise on nail tips glued to sticks or on a practice hand, not first on a paying client. Recreate one design every day for a week and compare your first and last attempt.`,
    quiz: [
      q('Which colours are complementary?', ['Pink and coral', 'Blue and orange', 'White and grey', 'Nude and nude'], 1, 'Complementary colours sit opposite on the colour wheel, like blue and orange.'),
      q('What is a striping brush used for?', ['Ombré gradients', 'Long thin lines', 'Removing gel', 'Filing'], 1, 'Its long, thin bristles create smooth, straight lines.'),
      q('What is a "feature nail"?', ['A broken nail', 'The nail or two with the most detailed art', 'The thumb only', 'A nail without polish'], 1, 'Feature nails carry the detailed art while the others support the design.'),
      q('What should you think about when choosing a nude shade?', ['The cheapest bottle', 'The client\'s skin tone', 'The weather', 'The lamp brand'], 1, 'The right nude depends on skin tone, from soft pinks to rich caramels and mochas.'),
      q('Where should you first practise new art designs?', ['On paying clients', 'On tips or a practice hand', 'On the table', 'You do not need to practise'], 1, 'Practise on tips first, and bring the design to clients once it is consistent.'),
    ],
  },
  {
    id: 'art-french',
    section: 'art',
    title: 'French tips, ombré & baby boomer',
    duration: '30 min',
    summary: 'The timeless classics: crisp French smile lines, modern colour Frenchies, and soft gradient ombré.',
    body: `## The French: forever in fashion

A clean French tip is the first thing many clients judge you on. It looks simple, so every wobble shows. Master it and you will always have work.

## Classic French, freehand

1. Prep and apply base, then a sheer pink or nude. Cure.
2. Take a thin brush with white gel. Start at one side of the free edge and pull a curve (the **smile line**) to the centre.
3. Repeat from the other side to meet in the middle.
4. Fill in the tip. Clean any wobbles with a clean brush.
5. Cure, then top coat.

> Tip: The smile line should be the same depth on all ten nails and should follow the natural curve. Look at the hand from above to check that every smile matches.

## Modern French variations

- **Colour French**: neon, pastel, or different colours on each nail.
- **Micro French**: a super-thin line at the very tip. Elegant on short nails.
- **Deep V French**: a pointed V instead of a curve. Lovely on almond and stiletto.
- **Double line French**: a second thin line under the tip, maybe in gold.
- **Side French**: the tip swept to one side for an asymmetric look.

## Ombré (gradient)

Two or more colours that blend smoothly into each other.

**Sponge method:** paint stripes of colours side by side on a makeup sponge, dab onto the nail, build up in thin layers, cure, then top coat. Clean the skin around with a brush.

**Brush method (gel):** apply one colour at the base and another at the tip, then blend the middle with a clean, slightly damp brush in light strokes before curing.

## Baby boomer

A soft fade from milky pink at the cuticle into white at the tip. It is basically a French ombré and is one of the most requested bridal looks.

> Kenya: Bridal season is busy. Offer a bridal trial appointment a few weeks before the wedding to agree on length, shape and shade. Brides love it and it saves stress on the day.`,
    quiz: [
      q('What is the "smile line" in a French manicure?', ['The cuticle line', 'The curved line where the white tip meets the nail', 'A line of glitter', 'The side wall'], 1, 'The smile line is the curve between the tip colour and the rest of the nail.'),
      q('What should be the same on all ten nails in a French set?', ['The depth of the smile line', 'The number of gems', 'The topcoat brand', 'Nothing, it varies'], 0, 'Matching smile line depth is what makes a French set look professional.'),
      q('What is a baby boomer design?', ['A deep V French', 'A soft fade from milky pink to white', 'Black and gold stripes', 'A marble look'], 1, 'Baby boomer is a pink-to-white gradient, a type of French ombré.'),
      q('Which tool is popular for creating ombré?', ['Nail clippers', 'A makeup sponge', 'Cuticle nippers', 'A dotting tool only'], 1, 'Dabbing colours with a sponge builds a smooth gradient.'),
      q('Which French style suits almond and stiletto shapes beautifully?', ['Deep V French', 'Square French', 'No French', 'Flat French'], 0, 'A V-shaped tip follows the point of almond and stiletto nails.'),
    ],
  },
  {
    id: 'art-effects',
    section: 'art',
    title: 'Marble, chrome & cat-eye effects',
    duration: '35 min',
    summary: 'The show-stopping effects clients screenshot: marble veins, mirror chrome, and magnetic cat-eye.',
    body: `## Effects that make people stop and ask

These techniques look advanced but rely on a few simple tricks. They also film beautifully for your social media.

## Marble

**Gel marble with blooming gel**
1. Apply a base colour and cure (white or nude is classic).
2. Apply a thin layer of clear blooming gel. Do not cure.
3. Use a fine brush to drop thin lines of colour (black, grey or gold) onto the wet blooming gel. They spread and soften into veins.
4. Add a thinner, sharper line in places for a realistic stone look.
5. Cure, then top coat.

> Tip: Real marble has veins that cross, split and vary in thickness. Avoid perfect parallel lines.

**Water marble** (with regular polish) swirls drops of polish in a cup of water and dips the nail. It is fun but messy and slow, so most salons now prefer gel marble.

## Chrome (mirror) powder

1. Apply your base colour (black gives the strongest mirror shine) and cure.
2. Apply a **no-wipe top coat** and cure. The surface must be smooth and not sticky.
3. Rub chrome powder onto the nail with a silicone tool or sponge applicator until it turns to a mirror.
4. Brush off the extra powder, cap the edges with top coat, then cure.
5. Apply another top coat and cure for durability.

> Warning: Chrome powder is a fine powder. Avoid breathing it in: use a little at a time, and do not blow it off the nail.

## Cat-eye (magnetic gel)

Cat-eye gel has tiny metallic particles inside it.
1. Apply over a cured base colour (black for drama, nude for soft shimmer).
2. Hold a strong magnet close to the uncured gel for a few seconds. The particles move and create a glowing line or "eye".
3. Cure straight away so the effect locks in. Moving the magnet differently creates different patterns: a straight line, a diagonal, or a soft "velvet" glow.
4. Top coat and cure.

## Combining effects

Chrome tips over a nude base, a marble feature nail with gold foil, or a cat-eye set with one chrome nail. The magic is in mixing with restraint: one or two effects per set.`,
    quiz: [
      q('What does blooming gel do in marble art?', ['Hardens instantly', 'Lets colour spread softly into veins', 'Removes gel', 'Makes nails magnetic'], 1, 'Colour dropped on wet blooming gel spreads, softening into natural-looking veins.'),
      q('Chrome powder is rubbed onto which surface?', ['Wet polish', 'A cured no-wipe top coat', 'The bare natural nail', 'Cuticle oil'], 1, 'Chrome needs a smooth, cured, non-sticky surface, usually a no-wipe top coat.'),
      q('What creates the line in cat-eye gel?', ['A striping brush', 'A magnet pulling metallic particles', 'Chrome powder', 'Water'], 1, 'Cat-eye gel contains metallic particles that line up under a magnet.'),
      q('When should you cure cat-eye gel?', ['A day later', 'Straight after using the magnet so the effect locks in', 'Before the magnet', 'Never'], 1, 'If you wait, the particles drift and the line goes blurry.'),
      q('What does realistic marble look like?', ['Perfect parallel lines', 'Veins that cross, split and vary in thickness', 'Only dots', 'One solid colour'], 1, 'Natural stone has irregular veins. That variety makes it believable.'),
    ],
  },
  {
    id: 'art-african',
    section: 'art',
    title: 'African-inspired art: beadwork, kitenge & safari',
    duration: '30 min',
    summary: 'Designs rooted in our own culture: beadwork patterns, kitenge and kanga prints, and safari-inspired art.',
    body: `## Design that is ours

Kenya is full of colour and pattern: beadwork, kitenge and kanga prints, the savannah at sunset, the coast. Clients love art that feels personal and proud, and tourists and the diaspora love it too.

## Beadwork-inspired designs

Traditional Maasai and Samburu beadwork uses bold colours in geometric patterns. Commonly told meanings include **red** for bravery and unity, **blue** for the sky and energy, **green** for the land and growth, **white** for peace and purity, **orange and yellow** for hospitality, and **black** for the people and their strength. Meanings vary between communities and families, so share them as stories, not strict rules.

**How to do it:**
1. Start with a solid base (black or white makes colours pop). Cure.
2. Use a dotting tool to place rows of dots in a pattern, as if they were beads. Lines, triangles and diamonds work beautifully.
3. Use a striping brush for thin borders between bands of colour.
4. Cure between colours if needed, so they do not bleed into each other.
5. Top coat. A glossy finish makes the "beads" look three-dimensional.

> Tip: Keep it to one or two feature nails per hand with bold beadwork, and give the other nails a solid colour taken from the pattern.

## Kitenge and kanga prints

Kitenge prints use bold circles, spirals, leaves and waves in strong contrasting colours.
- Work from big shapes to small details: first the large circles or leaves, then the outlines, then dots and fine lines.
- Ask clients to bring a photo of their outfit (or the fabric itself) for weddings, ruracio or ceremonies, and match the nails to it. It is a wonderful, personal service.

## Safari and nature

- **Sunset ombré**: orange to deep pink to purple, with a black acacia tree silhouette painted with a fine brush.
- **Animal prints**: leopard and cheetah spots (irregular brown shapes outlined in black), zebra stripes (curved black lines that taper), giraffe patches.
- **Coast vibes**: turquoise ombré, white wave lines, and gold "sand" glitter.

## Respect and pride

These patterns carry meaning for communities. Celebrate them: learn about them, talk about them with your clients with respect, and credit the inspiration when you post.`,
    quiz: [
      q('What tool is best for creating a beadwork "bead" effect?', ['A dotting tool', 'Nail clippers', 'A coarse file', 'A sponge'], 0, 'Rows of dots from a dotting tool look like beads.'),
      q('Why might you cure between colours in beadwork art?', ['To save gel', 'So the colours do not bleed into each other', 'To make it matte', 'It is not needed'], 1, 'Curing between colours keeps each one crisp and separate.'),
      q('What is a great personal service for ceremony clients?', ['Ignoring their outfit', 'Matching nails to a photo of their kitenge outfit', 'Only plain nude', 'Refusing art'], 1, 'Matching nails to their outfit makes the service personal and memorable.'),
      q('In kitenge-style art, which order works best?', ['Small dots first, then big shapes', 'Big shapes first, then outlines, then fine details', 'Top coat first', 'Only outlines'], 1, 'Working from large to small keeps the design balanced and clean.'),
      q('How should you treat the meaning behind cultural patterns?', ['Make them up', 'Share them with respect, as stories that can vary between communities', 'Never mention them', 'Copy without credit'], 1, 'Meanings vary. Share them respectfully and credit the inspiration.'),
    ],
  },
  {
    id: 'art-3d',
    section: 'art',
    title: '3D art, gems, charms & foils',
    duration: '30 min',
    summary: 'Add texture and sparkle that lasts: placing gems securely, building 3D flowers, and using foils and stickers well.',
    body: `## Texture brings art to life

Gems, charms and 3D details turn a nice set into a statement. The challenge is making them **last** without catching on hair and clothes.

## Gems and rhinestones

1. Decide placement first: near the cuticle area or in a small cluster looks elegant. Placing gems right at the tip makes them catch and pop off.
2. Apply a small dab of **gem glue gel** or builder gel where the gem will sit.
3. Pick up the gem with a wax pencil or a slightly damp dotting tool and press it in.
4. Cure.
5. Carefully apply more gel or top coat **around** the base of the gem (not over the top of the stone, which dulls its sparkle). Cure again.

> Tip: Gently run a cotton pad over the nail after curing. If the cotton catches, there is a gap: seal it with more gel before the client leaves.

## Charms and bigger pieces

- Heavier charms need a strong builder gel base around them.
- Recommend them on one or two feature nails, and warn clients that big charms are for special occasions and may catch on things.

## 3D flowers and shapes

Use builder gel, polygel or 3D sculpting gel:
1. Place a small bead for each petal and shape it with a fine brush.
2. Cure each petal or section as you go.
3. Add a centre with a gem or a dot of contrasting colour.

Acrylic 3D art (small acrylic beads shaped into flowers or bows) is another classic method for those who work with acrylic.

## Foils

- **Transfer foil**: apply foil glue or a tacky gel, let it go clear or cure as directed, press the foil shiny side up, rub and peel. Seal with top coat.
- **Flake foil**: small pieces pressed into tacky gel for a broken-gold look, then top coated.

## Stickers and decals

Stickers and water decals are quick and give perfect detail. Seal edges fully with top coat so they do not lift. They are excellent when time is short or for very fine designs.

## Removal of 3D work

Carefully file down the 3D parts and gems before soaking. Never pry gems off with a metal tool against the nail.`,
    quiz: [
      q('Where should you avoid placing gems so they do not catch?', ['Near the cuticle area', 'Right at the tip of the nail', 'In a small cluster', 'On a feature nail'], 1, 'Gems at the very tip take the most knocks and pop off.'),
      q('How do you check that a gem is sealed securely?', ['Shake the client\'s hand', 'Run a cotton pad over it; if it catches, seal the gap', 'Pull on it hard', 'Look from far away'], 1, 'If cotton catches, there is a gap. Seal it before the client leaves.'),
      q('Why apply gel around the gem rather than over the top?', ['To save gel', 'Covering the stone dulls its sparkle', 'It cures faster', 'It does not matter'], 1, 'Sealing around the base holds the gem while keeping its shine.'),
      q('What should you tell clients about big charms?', ['They last forever', 'They are best for special occasions and may catch on things', 'They are lighter than gems', 'They protect the nail'], 1, 'Honest advice prevents disappointment and complaints.'),
      q('How should you remove 3D work and gems?', ['Pry them off with a metal tool', 'Carefully file the 3D parts down before soaking', 'Peel them', 'Leave them on'], 1, 'Filing down first and then soaking protects the natural nail.'),
    ],
  },
];

const designs = [
  {
    id: 'classic-french', title: 'Classic French', level: 'Beginner', time: '45 min', free: true,
    description: 'The timeless clean look every client asks for: a sheer pink base and a crisp white smile line that follows the natural curve of the nail.',
    tools: 'Base gel, sheer pink gel, white gel or art gel, thin liner brush, clean-up brush, top coat, LED lamp',
    steps: [
      'Prep the nails: push back and lift the cuticle, file the shape, lightly remove the shine and dust off.',
      'Apply a thin base coat, keeping it off the skin. Cure.',
      'Apply one or two thin coats of sheer pink or nude. Cure each coat.',
      'With a thin brush and white gel, pull a curve from one side of the free edge to the centre.',
      'Repeat from the other side so both curves meet in the middle. Fill in the tip.',
      'Check that the smile line is the same depth on all ten nails. Clean any wobbles, then cure.',
      'Apply top coat, cap the free edge and cure. Finish with cuticle oil.',
    ],
  },
  {
    id: 'mirror-chrome', title: 'Mirror chrome', level: 'Intermediate', time: '50 min',
    description: 'A liquid-metal mirror finish that catches every light. Black underneath gives the strongest mirror; nude gives a soft pearl glow.',
    tools: 'Base gel, black or nude gel, no-wipe top coat, chrome powder, silicone applicator, fan brush, LED lamp',
    steps: [
      'Prep the nails and apply base coat. Cure.',
      'Apply two thin coats of your base colour, curing each one.',
      'Apply a no-wipe top coat and cure. The surface must be smooth and not sticky.',
      'Rub a little chrome powder onto the nail with the silicone tool until it turns to a mirror.',
      'Brush off the loose powder gently. Do not blow it.',
      'Cap the edges with top coat and cure, then apply a second top coat and cure again.',
    ],
  },
  {
    id: 'beadwork', title: 'Beadwork pattern', level: 'Intermediate', time: '1 hr',
    description: 'Bold bands of colour inspired by Kenyan beadwork, made with a dotting tool so every dot looks like a bead.',
    tools: 'Black or white gel, red, blue, green, white and orange art gel, dotting tools, striping brush, top coat',
    steps: [
      'Prep, base coat and a solid black or white colour. Cure.',
      'Plan your pattern on one feature nail per hand: lines, triangles or diamonds.',
      'Place rows of dots with a dotting tool, one colour at a time. Cure between colours so they stay crisp.',
      'Add thin borders between bands with a striping brush. Cure.',
      'Paint the other nails in a solid colour taken from the pattern.',
      'Top coat everything. A glossy finish makes the beads look raised.',
    ],
  },
  {
    id: 'soft-marble', title: 'Soft marble', level: 'Intermediate', time: '55 min',
    description: 'Natural stone veins in grey and gold over a milky base. Elegant on short nails and on long almonds.',
    tools: 'Milky white gel, clear blooming gel, black or grey art gel, gold liner, fine brush, top coat',
    steps: [
      'Prep, base coat and a milky white colour. Cure.',
      'Apply a thin layer of clear blooming gel. Do not cure.',
      'Touch thin lines of grey onto the wet blooming gel and watch them spread into soft veins.',
      'Add a few thinner, sharper lines so the veins cross and split like real stone. Cure.',
      'Trace one or two veins with gold liner. Cure.',
      'Top coat and cure.',
    ],
  },
];

const classes = [
  {
    id: 'beginner-class', title: 'Beginner Nail Technician Class',
    description: 'Hands-on training in our studio: hygiene, nail prep, manicure, gel polish and your first nail art, with your own practice kit and a certificate at the end.',
    startDate: '', endDate: '', schedule: '', location: 'Nairobi', fee: '', seats: '', published: true,
  },
];

// Prices are left empty on purpose: add your own in Admin > Services.
const services = [
  { id: 'gel-manicure', title: 'Gel manicure', duration: '1 hr', price: '', description: 'Shape, cuticle care and long-lasting gel polish in the colour of your choice.' },
  { id: 'acrylic-set', title: 'Acrylic full set', duration: '2 hrs', price: '', description: 'Strong acrylic extensions in your chosen length and shape, finished with gel colour.' },
  { id: 'builder-gel', title: 'Builder gel (BIAB)', duration: '1 hr 15 min', price: '', description: 'Strengthens your natural nails so they can grow long without breaking.' },
  { id: 'pedicure', title: 'Spa pedicure', duration: '1 hr', price: '', description: 'Soak, scrub, gentle callus care, massage and polish.' },
  { id: 'nail-art', title: 'Nail art', duration: 'from 20 min', price: '', description: 'French, chrome, marble, beadwork and custom designs, priced per set.' },
];

export function seedCourse() {
  return {
    site: {
      name: 'Élan Beauty',
      tagline: 'Nail artistry & academy · Kenya',
      heroTitle: 'Nails with élan.',
      heroText: 'A nail studio and academy in Kenya. Book a set with our artists, or train with us in person and online, from your very first manicure to running your own nail business.',
      heroImage: '/img/elan-logo.jpg',
      theme: { accent: '#111111', detail: '#8a8a8a', font: 'elan' },
      logo: '',
      whatWeDo: [
        { title: 'Nail studio', text: 'Gel, acrylic, builder gel and nail art by our artists. Book a time that suits you on WhatsApp.' },
        { title: 'Physical classes', text: 'Small, hands-on classes in our studio. You practise on real hands with a tutor beside you.' },
        { title: 'Online course', text: 'Step-by-step lessons on hygiene, anatomy, gel, acrylic and builder gel, with a quiz at the end of every step.' },
        { title: 'Nail art', text: 'French, chrome, marble and African-inspired designs, taught from real photos, one step at a time.' },

      ],
      classesNote: 'New classes are coming soon. Dates will be posted here. Message us on WhatsApp to reserve a seat.',
      whatsapp: '0746906609', phone: '0746906609', email: '', tiktok: '', instagram: '',
      location: 'Nairobi, Kenya', hours: '', bookFrom: '09:00', bookTo: '18:00', closedDays: [0],
      about: '"Élan" means flair: doing something with style, confidence and grace. That is how we do nails, and how we teach them. Our studio offers manicures, extensions and nail art, and our academy trains new nail technicians in safety, technique, artistry and business.',
    },
    lessons: lessons.map((l, i) => ({ videoUrl: '', linkLabel: '', published: true, free: i === 0, ...l })),
    designs: designs.map((d) => ({ image: '', published: true, free: false, ...d })),
    classes,
    services: services.map((x) => ({ image: '', published: true, ...x })),
    products: [],
  };
}
