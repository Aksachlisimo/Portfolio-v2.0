# Mohamed Mouhimine · Portfolio

Personal site: **[mohamedmouhimine.com](https://mohamedmouhimine.com/)**

Freelance AI model trainer and evaluator (LLM evaluation, RLHF data, prompt testing) with a machine learning background. Based in Strasbourg, France, working remotely in English, French and Arabic.

## Stack

Plain HTML, CSS and JavaScript. No framework, no build step, under 300 KB total.

- Interactive "Try my job" demo: visitors judge real-style LLM outputs in English, French and Arabic, then see the rubric scores and rationale
- Bottom tab bar on phones, light/dark theme (follows the OS, with a toggle)
- Mobile-first responsive layout
- Contact form via [FormSubmit](https://formsubmit.co/) (no backend needed)
- SEO: meta description, Open Graph/Twitter preview image, JSON-LD `Person` schema, sitemap, robots.txt, web manifest, 404 page

## Structure

```
index.html
assets/css/style.css
assets/js/main.js    demo tasks (edit TASKS to change them), nav, form
assets/img/          headshot, testimonial photo, Moon Healing screenshot, favicons, og.jpg (share preview)
assets/cv/           downloadable CV (PDF)
CNAME                custom domain
```

## Run locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
```

## Projects

- [Heart Disease Classification](https://github.com/Aksachlisimo/heart_disease_classification_project): tuned Logistic Regression, 88.5% test accuracy, 0.92 recall (5-fold CV)
- [Bulldozer Price Regression](https://github.com/Aksachlisimo/bulldozer_price_regression_project): Random Forest, validation RMSLE 0.247, R² 0.88
- [Dog Vision](https://github.com/Aksachlisimo/dog_vision_project): MobileNetV2 transfer learning, 120 breeds
- [Moon Healing](https://github.com/Aksachlisimo/moon_healing): bilingual client website ([live](https://moon-healing-zeta.vercel.app))
- Arcadia Zoo: full-stack zoo website with role-based staff areas, Node.js/Express, PostgreSQL, MongoDB ([live](https://arcadia-zoo-v1.onrender.com))

## Contact

[LinkedIn](https://www.linkedin.com/in/mohamed-mouhimine/) · mohamedmouhimine@gmail.com
