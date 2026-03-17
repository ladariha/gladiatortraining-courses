<?php

function errorToProperType($event)
{
  $result = new stdClass;
  $result->time = $event->time;
  $result->msg = $event->msg;
  return $result;
}




class Persistance
{

  public static function getSchedule()
  {
    global $wpdb;

    $table = Persistance::getTableName();
    $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM " . $table));

    $resultObj = new stdClass;
    $resultObj->data = $result[0]->data;
    $resultObj->timestamp = $result[0]->timestamp;
    return $resultObj;
  }

  public static function persistSchedule($jsonString, $timeStamp)
  {
    global $wpdb;

    $table = Persistance::getTableName();
    $result = $wpdb->get_results($wpdb->insert(
      $table,
      array(
        "data" => $jsonString,
        "time" => $timeStamp,
      ),
      array("%s", "%d")
    ));

    Persistance::handleUpdateInsertResult($wpdb, $result, "persistSchedule");

  }

  public static function deleteOldErrors($limit)
  {
    try {
      global $wpdb;
      $table = Persistance::getErrorLogTableName();
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
    $table = Persistance::getErrorLogTableName();

    Persistance::deleteOldErrors(1000);
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
    if ($result === false) {
      if ($wpdb->last_error !== '') {
        Persistance::logError($wpdb->last_error);
      }

      throw new ErrorException("Failed to insert or update " . $methodName);
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

  public static function initDatabase()
  {

    global $wpdb;

    $dataTable = Persistance::getTableName();
    $errorsTable = Persistance::getErrorLogTableName();
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


  }

}
