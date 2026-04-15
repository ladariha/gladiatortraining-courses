<?php



class PersistanceGTSocial
{

  public static function getSchedule()
  {
    global $wpdb;

    $table = PersistanceGTSocial::getTableName();
    $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM " . $table));

    $resultObj = new stdClass;
    $resultObj->data = $result[0]->data;
    $resultObj->timestamp = $result[0]->timestamp;
    return $resultObj;
  }

  public static function persistSchedule($jsonString, $timeStamp)
  {
    global $wpdb;

    $table = PersistanceGTSocial::getTableName();
    $result = $wpdb->get_results($wpdb->insert(
      $table,
      array(
        "data" => $jsonString,
        "time" => $timeStamp,
      ),
      array("%s", "%d")
    ));

    PersistanceGTSocial::handleUpdateInsertResult($wpdb, $result, "persistSchedule");

  }

  public static function deleteOldErrors($limit)
  {
    try {
      global $wpdb;
      $table = PersistanceGTSocial::getErrorLogTableName();
      $count = $wpdb->get_results($wpdb->prepare("SELECT COUNT(*) as records FROM " . $table, array()));
      $countNumber = intval($count[0]->records);

      $diff = $countNumber - $limit;
      if ($diff > 0) {
        $result = $wpdb->get_results($wpdb->prepare("DELETE FROM " . $table . " ORDER BY time ASC LIMIT %d", array($diff)));
      }
    } catch (Exception $e) {
      error_log("unable to remove logs");
    }
  }


  public static function logError($msg)
  {
    global $wpdb;
    $table = PersistanceGTSocial::getErrorLogTableName();

    PersistanceGTSocial::deleteOldErrors(1000);
    $wpdb->insert(
      $table,
      array(
        "msg" => mb_strimwidth($msg, 0, 1024, "..."),
      ),
      array("%s")
    );
  }


  private static function handleUpdateInsertResult($wpdb, $result, $methodName)
  {
    $errMsg = $wpdb->last_error;
    if ($result === false) {
      if ($wpdb->last_error !== '') {
        PersistanceGTSocial::logError($errMsg);
      }

      throw new ErrorException("Failed to insert or update " . $methodName . " >> " . $errMsg);
    }
  }


  public static function getTableName()
  {
    global $wpdb;
    $eventTable = $wpdb->prefix . 'gc_data';
    return $eventTable;
  }

  public static function getErrorLogTableName()
  {

    global $wpdb;
    $table = $wpdb->prefix . 'gc__errors';
    return $table;

  }

  public static function getSocialImagesTableName()
  {
    global $wpdb;
    return $wpdb->prefix . 'gt_social';
  }

  public static function getSocialTokenTableName()
  {
    global $wpdb;
    return $wpdb->prefix . 'gt_social_token';
  }

  public static function getSocialToken()
  {
    global $wpdb;

    $table = PersistanceGTSocial::getSocialTokenTableName();
    $result = $wpdb->get_results($wpdb->prepare("SELECT token FROM " . $table . " LIMIT 1"));

    if (empty($result)) {
      return '';
    }

    return $result[0]->token;
  }

  public static function storeSocialToken($token)
  {
    global $wpdb;

    $table = PersistanceGTSocial::getSocialTokenTableName();
    // Remove all existing tokens before inserting the new one.
    // Table name comes from a controlled method, not user input.
    $wpdb->query("DELETE FROM " . $table); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
    $result = $wpdb->insert(
      $table,
      array("token" => $token),
      array("%s")
    );

    PersistanceGTSocial::handleUpdateInsertResult($wpdb, $result, "storeSocialToken");
  }

  public static function getSocialImages()
  {
    global $wpdb;

    $table = PersistanceGTSocial::getSocialImagesTableName();
    $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM " . $table . " ORDER BY id DESC LIMIT 1"));

    if (empty($result)) {
      return null;
    }

    $resultObj = new stdClass;
    $resultObj->data = $result[0]->data;
    $resultObj->time = $result[0]->time;
    return $resultObj;
  }

  public static function persistSocialImages($jsonString, $timeStamp)
  {
    global $wpdb;

    $table = PersistanceGTSocial::getSocialImagesTableName();
    // Replace existing data — table name comes from a controlled method, not user input.
    $wpdb->query("DELETE FROM " . $table); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
    $result = $wpdb->insert(
      $table,
      array(
        "data" => $jsonString,
        "time" => $timeStamp,
      ),
      array("%s", "%d")
    );

    PersistanceGTSocial::handleUpdateInsertResult($wpdb, $result, "persistSocialImages");
  }

  public static function initDatabase()
  {

    global $wpdb;

    $dataTable = PersistanceGTSocial::getTableName();
    $errorsTable = PersistanceGTSocial::getErrorLogTableName();
    $socialTable = PersistanceGTSocial::getSocialImagesTableName();
    $socialTokenTable = PersistanceGTSocial::getSocialTokenTableName();
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    $sql = "CREATE TABLE " . $dataTable . " (
                                    id int NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
                                    time bigint NOT NULL,
                                    data longtext CHARACTER SET utf8mb4
                                  ) " . $charset_collate . ";";
    dbDelta($sql);


    $sql = "CREATE TABLE " . $errorsTable . " (
      id int NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
      time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      msg varchar(8192) CHARACTER SET utf8mb4 NOT NULL
    )" . $charset_collate . ";";

    dbDelta($sql);


    $sql = "CREATE TABLE " . $socialTable . " (
      id int NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
      time bigint NOT NULL,
      data longtext CHARACTER SET utf8mb4
    )" . $charset_collate . ";";

    dbDelta($sql);


    $sql = "CREATE TABLE " . $socialTokenTable . " (
      id int NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
      token text CHARACTER SET utf8mb4 NOT NULL
    )" . $charset_collate . ";";

    dbDelta($sql);


  }

}
