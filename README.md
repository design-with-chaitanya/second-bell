# Second Bell

The site for Second Bell, the school health and wellbeing programme from RECOUP Health. It is written for school leadership first.

Facts follow the public programme at [recoup.health/second-bell](https://www.recoup.health/second-bell). The site does not add statistics, partnerships, testimonials, or clinical claims beyond that source. Score figures (85 on the homepage, 84 on the score page) are labelled as illustrative and are not results from a named school.

## Preview

From this folder:

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/`.

The site is static HTML, one stylesheet (`css/global.css`), and `js/main.js` (mobile menu, logo fallback, floating WhatsApp button, and the mailto enquiry form). No build step.

## Pages

- `/`: the main journey. Hero, what Second Bell is, why it matters, the six-domain framework, who it is for, why choose it, what it includes, how it works, the RECOUP School Health Score, FAQ, contact
- `/framework/`: the six domains in detail, plus the everyday classroom signals
- `/program/`: the four programme components
- `/interventions/`: targeted support after screening
- `/how-it-works/`: the three phases (`#talk` still resolves to the contact section)
- `/rshs-score/`: the RECOUP School Health Score

Every page ends with the same contact section (`#contact`).

## Framework

The framework has six clinical domains: Physical Readiness, Attention & Effort, Emotional Balance, Digital & Lifestyle, Adolescent Health, and Sports Safety. The six classroom signals (Attention & Readiness, Emotional Regulation, Student Fatigue, Digital Habits, Posture & Physicality, Student Wellbeing) are a separate list. Keep them apart.

## Images

Pages use the `.webp` files in `assets/images/` (resized to 1400px wide at most). The original `.jpg` files remain for social preview images. The header uses `assets/logo/second-bell-logo-wide.webp`, which is the original logo with its white margin trimmed.
