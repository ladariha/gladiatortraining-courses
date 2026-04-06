<?php

require_once plugin_dir_path(__FILE__) . 'Persistance.php';

class SocialImages
{
  public static function getData()
  {
    $now = time();
    $twentyFourHours = 24 * 60 * 60;

    try {
      $persisted = Persistance::getSocialImages();
      if ($persisted !== null && ($now - intval($persisted->time)) < $twentyFourHours) {
        return json_decode($persisted->data, true);
      }
    } catch (Exception $e) {
      // no persisted data yet, fall through to fetch
    }

    $images = SocialImages::fetchFromFacebook();

    if ($images !== false) {
      try {
        Persistance::persistSocialImages(json_encode($images), $now);
      } catch (Exception $e) {
        Persistance::logError('SocialImages persist error: ' . $e->getMessage());
      }
      return $images;
    }

    // Fetch failed – return stale cached data if available
    try {
      $persisted = Persistance::getSocialImages();
      if ($persisted !== null) {
        return json_decode($persisted->data, true);
      }
    } catch (Exception $e) {
      // nothing cached
    }

    return array();
  }

  private static function fetchFromFacebook()
  {
    $token   = GT_SOCIAL_FB_TOKEN;
    $page_id = GT_SOCIAL_FB_PAGE_ID;
    $count   = intval(GT_SOCIAL_IMAGES_COUNT);

    if (empty($token) || empty($page_id)) {
      return false;
    }

    $url = add_query_arg(
      array(
        'fields'       => 'source',
        'limit'        => $count,
        'type'         => 'uploaded',
        'access_token' => $token,
      ),
      'https://graph.facebook.com/v18.0/' . rawurlencode($page_id) . '/photos'
    );

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
      Persistance::logError('SocialImages fetch error: ' . $response->get_error_message());
      return false;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (isset($data['error'])) {
      Persistance::logError('SocialImages FB API error: ' . $data['error']['message']);
      return false;
    }

    if (!isset($data['data']) || !is_array($data['data'])) {
      return array();
    }

    $sources = array();
    foreach ($data['data'] as $photo) {
      if (!empty($photo['source'])) {
        $sources[] = $photo['source'];
      }
    }

    return $sources;
  }
}
