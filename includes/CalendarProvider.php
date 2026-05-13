<?php

require_once plugin_dir_path(__FILE__) . 'PersistanceGTSocial.php';

class CalendarProvider
{
  public static function getData()
  {
    $now = time();
    $thirtyMinutes = 30 * 60;

    try {
      $persisted = PersistanceGTSocial::getSchedule();
      if ($now - intval($persisted->timestamp) < $thirtyMinutes) {
        return json_decode($persisted->data, true);
      }
    } catch (Exception $e) {
      // no persisted data yet, fall through to fetch
    }

    $workouts = CalendarProvider::fetchAndParse(
      intval(date('d', $now)),
      intval(date('n', $now)),
      intval(date('Y', $now))
    );

    PersistanceGTSocial::persistSchedule(json_encode($workouts), $now);

    return $workouts;
  }

  public static function fetchAndParse($day, $month, $year)
  {
    $url = "https://gladiatortraining.isportsystem.cz/ajax/ajax.schema.php";
    $response = wp_remote_post($url, array(
      'headers' => array(
        'content-type' => 'application/x-www-form-urlencoded; charset=UTF-8',
      ),
      'body' => http_build_query(array(
        'id_sport' => 5,
        'day' => $day,
        'month' => $month,
        'year' => $year,
        'event' => 'init',
        'timetableWidth' => 1210,
      )),
    ));
    if (is_wp_error($response)) {
      return array();
    }

    $html = wp_remote_retrieve_body($response);

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="UTF-8">' . $html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $slots = $xpath->query('//a[contains(@class, "slot")]');

    $workouts = array();
    foreach ($slots as $slot) {
      // rel format: act|5|25|{id}|{start_unix}|{end_unix}|{price}
      $parts = explode('|', $slot->getAttribute('rel'));
      if (count($parts) < 6)
        continue;

      $startTimestamp = intval($parts[4]);
      $endTimestamp = intval($parts[5]);

      $getSpanText = function ($class) use ($xpath, $slot) {
        $nodes = $xpath->query('.//span[@class="' . $class . '"]', $slot);
        return $nodes->length > 0 ? trim($nodes->item(0)->textContent) : '';
      };

      $timeStr = $getSpanText('time'); // e.g. "17:00–18:15"
      $timeParts = preg_split('/\x{2013}/u', $timeStr); // split on en-dash

      $workouts[] = array(
        'name' => $getSpanText('name'),
        'start_day' => date('Y-m-d', $startTimestamp),
        'end_day' => date('Y-m-d', $endTimestamp),
        'start_time' => isset($timeParts[0]) ? trim($timeParts[0]) : '',
        'end_time' => isset($timeParts[1]) ? trim($timeParts[1]) : '',
        'instructor' => $getSpanText('instructor'),
      );
    }

    return $workouts;
  }
}
