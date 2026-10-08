# Second Bell

A minimal, editorial site for Second Bell, the school health program from RECOUP Health. Academic performance has a health side. The pages are for school leadership first.

Facts follow the public program at [recoup.health/second-bell](https://www.recoup.health/second-bell). The site does not add statistics, partnerships, testimonials, or clinical claims beyond that source.

## Preview

From this folder:

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/`.

The site is static HTML, CSS, and JavaScript. `js/main.js` handles the menu, the logo fallback, and the mailto form. No build step.

## Pages

- `/` Overview
- `/framework/` Six clinical domains
- `/program/` The school health program
- `/interventions/` Targeted support
- `/how-it-works/` Alignment, screening, integration
- `/rshs-score/` The RECOUP School Health Score

## Logo

The header uses `assets/logo/second-bell-logo.jpg` unchanged: the full square, including its white margin, inside a thin frame. The words live in the mark, so the header does not repeat them.
