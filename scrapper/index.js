const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function fetchAndParse(day, month, year) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://gladiatortraining.isportsystem.cz/', { waitUntil: 'domcontentloaded' });

    const workouts = await page.evaluate(async ({ day, month, year }) => {
      const body = new URLSearchParams({
        id_sport: '5',
        day: String(day),
        month: String(month),
        year: String(year),
        event: 'init',
        timetableWidth: '1210',
      });

      const res = await fetch('/ajax/ajax.schema.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: body.toString(),
      });

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const slots = doc.querySelectorAll('a[class*="slot"]');

      console.log("Slots: " + slots.length);

      const formatDate = (ts) => {
        const d = new Date(ts * 1000);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      return Array.from(slots).flatMap((slot) => {
        const parts = (slot.getAttribute('rel') || '').split('|');
        if (parts.length < 6) return [];

        const startTimestamp = parseInt(parts[4], 10);
        const endTimestamp = parseInt(parts[5], 10);

        const getSpanText = (cls) => {
          const el = slot.querySelector(`span.${cls}`);
          return el ? el.textContent.trim() : '';
        };

        const timeStr = getSpanText('time');
        const timeParts = timeStr.split('–'); // en-dash

        return [{
          name: getSpanText('name'),
          start_day: formatDate(startTimestamp),
          end_day: formatDate(endTimestamp),
          start_time: timeParts[0]?.trim() ?? '',
          end_time: timeParts[1]?.trim() ?? '',
          instructor: getSpanText('instructor'),
        }];
      });
    }, { day, month, year });

    return workouts;
  } catch(e){
    console.error("scrapping failed " + e.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  const now = new Date();
  const workouts = await fetchAndParse(
    now.getDate(),
    now.getMonth() + 1,
    now.getFullYear()
  );

  const outPath = path.join(__dirname, 'courses.json');
  fs.writeFileSync(outPath, JSON.stringify(workouts, null, 2));
  console.log(`Written ${workouts.length} workouts to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
