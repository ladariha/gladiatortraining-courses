<?php

require_once plugin_dir_path(__FILE__) . 'PersistanceGTSocial.php';

class CalendarProvider
{
  private static $logs = array();

  private static function log($message)
  {
    self::$logs[] = $message;
  }

  public static function getLogs()
  {
    return self::$logs;
  }

  public static function getData()
  {
    $now = time();
    $thirtyMinutes = 30 * 60;

    try {
      $persisted = PersistanceGTSocial::getSchedule();
      $cacheAge = $now - intval($persisted->timestamp);
      if ($cacheAge < $thirtyMinutes) {
        self::log('returning cached data');
        return json_decode($persisted->data, true);
      }
    } catch (Exception $e) {
      // no persisted data yet, fall through to fetch
    }

    self::log('fetching from remote');
    $workouts = CalendarProvider::fetchAndParse();

    PersistanceGTSocial::persistSchedule(json_encode($workouts), $now);

    return $workouts;
  }

  public static function fetchAndParse()
  {
    $token = defined('GT_GITHUB_TOKEN') ? GT_GITHUB_TOKEN : '';
    $repo  = 'ladariha/gladiatortraining-courses';
    $headers = array(
      'Authorization'        => 'Bearer ' . $token,
      'Accept'               => 'application/vnd.github+json',
      'X-GitHub-Api-Version' => '2022-11-28',
      'User-Agent'           => 'gladiatortraining-courses-wp-plugin',
    );

    // 1. Find the latest successful run of scrape.yml
    $runsResponse = wp_remote_get(
      "https://api.github.com/repos/{$repo}/actions/workflows/scrape.yml/runs?status=success&per_page=1",
      array('headers' => $headers)
    );
    if (is_wp_error($runsResponse)) {
      self::log('runs API error: ' . $runsResponse->get_error_message());
      return array();
    }
    $runs = json_decode(wp_remote_retrieve_body($runsResponse), true);
    if (empty($runs['workflow_runs'])) {
      self::log('no successful workflow runs found');
      return array();
    }
    $runId = $runs['workflow_runs'][0]['id'];
    self::log('latest run id=' . $runId);

    // 2. Get the "courses" artifact from that run
    $artifactsResponse = wp_remote_get(
      "https://api.github.com/repos/{$repo}/actions/runs/{$runId}/artifacts",
      array('headers' => $headers)
    );
    if (is_wp_error($artifactsResponse)) {
      self::log('artifacts API error: ' . $artifactsResponse->get_error_message());
      return array();
    }
    $artifacts = json_decode(wp_remote_retrieve_body($artifactsResponse), true);
    $artifactId = null;
    foreach ($artifacts['artifacts'] as $artifact) {
      if ($artifact['name'] === 'courses') {
        $artifactId = $artifact['id'];
        break;
      }
    }
    if (!$artifactId) {
      self::log('courses artifact not found in run ' . $runId);
      return array();
    }
    self::log('artifact id=' . $artifactId);

    // 3. Download the artifact zip.
    // GitHub responds with a 302 to a short-lived, pre-signed storage URL. We must not
    // resend the GitHub Authorization/API headers to that URL, so redirects are followed
    // manually instead of letting wp_remote_get do it.
    $zipResponse = wp_remote_get(
      "https://api.github.com/repos/{$repo}/actions/artifacts/{$artifactId}/zip",
      array('headers' => $headers, 'redirection' => 0, 'timeout' => 30)
    );
    if (is_wp_error($zipResponse)) {
      self::log('artifact download error: ' . $zipResponse->get_error_message());
      return array();
    }

    $status = wp_remote_retrieve_response_code($zipResponse);
    if ($status === 302) {
      $downloadUrl = wp_remote_retrieve_header($zipResponse, 'location');
      if (!$downloadUrl) {
        self::log('artifact download redirect missing location header');
        return array();
      }
      $zipResponse = wp_remote_get($downloadUrl, array('timeout' => 30));
      if (is_wp_error($zipResponse)) {
        self::log('artifact download error: ' . $zipResponse->get_error_message());
        return array();
      }
    } elseif ($status !== 200) {
      self::log('artifact download unexpected status ' . $status);
      return array();
    }

    // 4. Extract courses.json from the zip
    $tmpFile = tempnam(sys_get_temp_dir(), 'gt_courses_');
    file_put_contents($tmpFile, wp_remote_retrieve_body($zipResponse));

    $zip = new ZipArchive();
    if ($zip->open($tmpFile) !== true) {
      self::log('failed to open artifact zip');
      unlink($tmpFile);
      return array();
    }
    $json = $zip->getFromName('courses.json');
    $zip->close();
    unlink($tmpFile);

    if ($json === false) {
      self::log('courses.json not found inside artifact zip');
      return array();
    }

    $workouts = json_decode($json, true);
    self::log('loaded ' . count($workouts) . ' workouts from GitHub artifact');

    return $workouts ?: array();
  }
}
