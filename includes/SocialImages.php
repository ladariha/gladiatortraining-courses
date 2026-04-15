<?php

require_once plugin_dir_path(__FILE__) . 'PersistanceGTSocial.php';

class SocialImages
{
  public static function getData()
  {
    $now = time();
    $twentyFourHours = 24 * 60 * 60;
    $count = intval(GT_SOCIAL_IMAGES_COUNT);

    $persisted = null;
    $cachedImages = array();
    try {
      $persisted = PersistanceGTSocial::getSocialImages();
      if ($persisted !== null) {
        $cachedImages = json_decode($persisted->data, true) ?: array();
      }
    } catch (Exception $e) {
      // no persisted data yet
    }

    // Return fresh cache if it hasn't expired
    if ($persisted !== null && ($now - intval($persisted->time)) < $twentyFourHours) {
      return array_values(array_slice($cachedImages, 0, $count));
    }

    $images = SocialImages::fetchFromFacebook();

    if ($images !== false) {
      // Merge: new images first, then fill remaining slots from old cache (deduplicated)
      $merged = array_values(array_unique(array_merge(array_values($images), array_values($cachedImages))));
      $merged = array_slice($merged, 0, $count);

      try {
        PersistanceGTSocial::persistSocialImages(json_encode($merged), $now);
      } catch (Exception $e) {
        PersistanceGTSocial::logError('SocialImages persist error: ' . $e->getMessage());
      }
      return $merged;
    }

    // Fetch failed – return stale cached data if available
    if (!empty($cachedImages)) {
      return array_values(array_slice($cachedImages, 0, $count));
    }

    return array();
  }

  private static function getRandomItems(array $items, int $max = 10): array
  {
    $count = count($items);

    // 1. Handle empty array immediately
    if ($count === 0) {
      return [];
    }

    // 2. Determine how many items to pick (cannot exceed actual count)
    $numToPick = min($count, $max);

    // 3. Get random keys
    $keys = array_rand($items, $numToPick);

    // 4. Ensure $keys is always an array (array_rand returns a single key if picking 1)
    $keys = (array) $keys;

    // 5. Map keys back to values
    return array_intersect_key($items, array_flip($keys));
  }

  private static function fetchFromFacebook()
  {
    $token = PersistanceGTSocial::getSocialToken();
    if (empty($token)) {
      $token = GT_SOCIAL_FB_TOKEN;
    }
    $page_id = GT_SOCIAL_FB_PAGE_ID;
    $count = intval(GT_SOCIAL_IMAGES_COUNT);

    if (empty($token) || empty($page_id)) {
      return false;
    }
    $url = add_query_arg(
      array(
        'fields' => 'attachments{media,subattachments{media,media_type},type}',
        'limit' => $count,
        'access_token' => $token,
      ),
      'https://graph.facebook.com/v25.0/' . rawurlencode($page_id) . '/feed'
    );

    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
      PersistanceGTSocial::logError('SocialImages fetch error: ' . $response->get_error_message());
      return false;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (isset($data['error'])) {
      PersistanceGTSocial::logError('SocialImages FB API error: ' . $data['error']['message']);
      return false;
    }

    if (!isset($data['data']) || !is_array($data['data'])) {
      return array();
    }

    $sources = array();
    foreach ($data['data'] as $post) {
      if (isset($post['attachments']) && isset($post['attachments']['data']) && is_array($post['attachments']['data'])) {
        foreach ($post['attachments']['data'] as $attachment) {

          if (isset($attachment['media']) && isset($attachment['media']['image']) && isset($attachment['media']['image']['src'])) {
            $sources[] = $attachment['media']['image']['src'];
          }

          if (isset($attachment['subattachments']) && isset($attachment['subattachments']['data']) && is_array($attachment['subattachments']['data'])) {
            foreach ($attachment['subattachments']['data'] as $sub) {
              if ($sub['type'] === 'photo' && isset($sub['media']['image']['src'])) {
                $sources[] = $sub['media']['image']['src'];
              }
            }
          }
        }
      }
    }

    return SocialImages::getRandomItems(array_unique($sources), $count);
  }
}
