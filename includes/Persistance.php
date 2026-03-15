<?php
function eventToProperType($event)
{
  $result = new stdClass;
  $result->id = intval($event->id);
  $result->name = $event->name;
  $result->short_description = $event->short_description;
  $result->description = $event->description;
  $result->time = intval($event->time);
  $result->max_people = intval($event->max_people);
  $result->people = intval($event->people);
  $result->visible = intval($event->visible);
  $result->registration_end = intval($event->registration_end);
  $result->image = $event->image;
  $result->registrations = $event->registrations;

  $result->bank_code = $event->bank_code;
  $result->prefix = $event->prefix ? $event->prefix : "";
  $result->swift = $event->swift ? $event->swift : "";
  $result->iban = $event->iban ? $event->iban : "";
  $result->account_number = $event->account_number;
  return $result;
}

function errorToProperType($event)
{
  $result = new stdClass;
  $result->time = $event->time;
  $result->msg = $event->msg;
  return $result;
}


function registrationsToProperType($registrationExtended)
{
  $result = new stdClass;
  $result->id = intval($registrationExtended->id);
  $result->group_id = intval($registrationExtended->group_id);
  $result->gdpr = intval($registrationExtended->gdpr);
  $result->is_leader = intval($registrationExtended->is_leader);
  $result->paid = intval($registrationExtended->paid);
  $result->price = intval($registrationExtended->price);
  $result->date_of_birth = intval($registrationExtended->date_of_birth);
  $result->name = $registrationExtended->name;
  $result->sex = $registrationExtended->sex;
  $result->registration_type_name = $registrationExtended->registration_type_name;

  $result->email = $registrationExtended->email;
  $result->address = $registrationExtended->address;
  $result->club = $registrationExtended->club;
  $result->phone = $registrationExtended->phone;
  $result->last_name = $registrationExtended->last_name;

  return $result;
}


function simpleRegistrationsToProperType($registrationExtended)
{
  $result = new stdClass;
  $result->id = intval($registrationExtended->id);
  $result->group_id = intval($registrationExtended->group_id);
  $result->gdpr = intval($registrationExtended->gdpr);
  $result->is_leader = intval($registrationExtended->is_leader);
  $result->paid = intval($registrationExtended->paid);
  $result->price = intval($registrationExtended->price);
  $result->name = $registrationExtended->name;
  $result->registration_type_name = $registrationExtended->registration_type_name;
  $result->club = $registrationExtended->club;
  $result->last_name = $registrationExtended->last_name;

  return $result;
}


class Persistance
{

  public static function setApiKey($name, $value)
  {
    global $wpdb;
    $table = Persistance::getApiKeyTableName();
    $result = $wpdb->replace($table, array("key_name" => $name, "key_value" => $value));
    Persistance::handleUpdateInsertResult($wpdb, $result, "setApiKey");
  }

  public static function updateEventVisibility($eventId, $desiredState)
  {
    global $wpdb;
    $table = Persistance::getEventsTableName();
    $result = $wpdb->update($table, array("visible" => $desiredState), array("id" => $eventId));
    Persistance::handleUpdateInsertResult($wpdb, $result, "updateEventVisibility");
  }
  public static function getRegistrationCountForRegistration($groupId)
  {
    global $wpdb;
    $table = Persistance::getEventHasRegistrationGroupTableName();
    $result = $wpdb->get_results($wpdb->prepare("SELECT max_people FROM " . $table . " WHERE id=%d ", array($groupId)));
    if (count($result) !== 1) {

      throw new ErrorException("Group not found");
    }
    return intval($result[0]->max_people);
  }

  public static function deleteRegistration($groupId)
  {
    global $wpdb;

    $table = Persistance::getRegisteredUserTableName();
    $rowsRemoved = $wpdb->delete($table, array("group_id" => $groupId));
    Persistance::handleUpdateInsertResult($wpdb, $rowsRemoved, "deleteRegistration");
    return $rowsRemoved;
  }

  public static function deleteRegistrationGroup($groupId)
  {
    global $wpdb;

    $table = Persistance::getEventHasRegistrationGroupTableName();
    $rowsRemoved = $wpdb->delete($table, array("id" => $groupId));
    Persistance::handleUpdateInsertResult($wpdb, $rowsRemoved, "deleteRegistration");
    return $rowsRemoved;
  }

  public static function updateGroupLeader($leaderId, $groupId)
  {
    global $wpdb;
    $table = Persistance::getEventHasRegistrationGroupTableName();
    $result = $wpdb->update($table, array("group_leader_id" => $leaderId), array("id" => $groupId));
    Persistance::handleUpdateInsertResult($wpdb, $result, "updateEventVisibility");
  }

  public static function changeRegistrationGroupPaid($groupId, $paid)
  {
    global $wpdb;
    $table = Persistance::getEventHasRegistrationGroupTableName();
    $result = $wpdb->update($table, array("paid" => $paid), array("id" => $groupId));
    Persistance::handleUpdateInsertResult($wpdb, $result, "updateEventVisibility");
  }

  private static function logCharsets()
  {
    global $wpdb;
    $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM information_schema.CHARACTER_SETS ORDER BY CHARACTER_SET_NAME", array()));
    Persistance::logError(json_encode($result));
  }
  private static function logTables()
  {
    global $wpdb;
    $result = $wpdb->get_results($wpdb->prepare("SHOW TABLES LIKE '%gt3_registration%'", array()));
    Persistance::logError(json_encode($result));
  }

  public static function listEvents($onlyVisible, $limit = 100, $offset = 0)
  {
    global $wpdb;

    $table = Persistance::getEventsTableName();
    if ($onlyVisible) {
      $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM " . $table . " WHERE visible=%d ORDER BY time DESC LIMIT %d OFFSET %d ", array(1, $limit, $offset)));

      return array_map("eventToProperType", $result);
    }
    $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM " . $table . " ORDER BY time DESC LIMIT %d OFFSET %d ", array($limit, $offset)));

    return array_map("eventToProperType", $result);
  }

  public static function listErrors()
  {
    global $wpdb;
    $table = Persistance::getErrorLogTableName();
    $max = 1000;

    $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM " . $table . " ORDER BY time DESC LIMIT %d", array($max)));
    return array_map("errorToProperType", $result);
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
      array("%s", "%d")
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


  public static function createRegistration($eventId, $groupId, $payload, $club, $transactionId)
  {
    global $wpdb;

    $data_to_be_inserted = array();

    foreach ($payload->registrations as $registration) {
      array_push(
        $data_to_be_inserted,
        array(
          'name' => $registration->name,
          'event_id' => $eventId,
          'group_id' => $groupId,
          'last_name' => $registration->last_name,
          'email' => $registration->email,
          'date_of_birth' => $registration->date_of_birth,
          'address' => $registration->address,
          'club' => $club,
          'phone' => $registration->phone,
          'flags' => "",
          'gdpr' => 1,

          'transaction_id' => $transactionId,
          'sex' => $registration->sex,
        )
      );
    }


    $values = $place_holders = array();
    foreach ($data_to_be_inserted as $data) {
      array_push($values, $data['name'], $data['event_id'], $data['group_id'], $data['last_name'], $data['email'], $data['date_of_birth'], $data['address'], $data['club'], $data['phone'], $data['flags'], $data['gdpr'], $data['transaction_id'], $data['sex']);
      $place_holders[] = "( %s, %d, %d, %s, %s, %d, %s, %s, %s, %s, %d, %d, %s)";
    }



    $query = "INSERT INTO " . Persistance::getRegisteredUserTableName() . " (`name`, `event_id`, `group_id`, `last_name`, `email`, `date_of_birth`, `address`, `club`, `phone`, `flags`, `gdpr`, `transaction_id`, `sex`) VALUES ";
    $query .= implode(', ', $place_holders);
    $sql = $wpdb->prepare("$query ", $values);
    $result = $wpdb->query($sql);

    Persistance::handleUpdateInsertResult($wpdb, $result, "createRegistration");
  }


  public static function updateEventHeadCount($eventId, $people)
  {
    global $wpdb;
    $table = Persistance::getEventsTableName();
    $result = $wpdb->update($table, array("people" => $people), array("id" => $eventId));
    Persistance::handleUpdateInsertResult($wpdb, $result, "updateEventHeadCount");
  }
  public static function deleteRegistrationGroupByTransactionId($transactionId)
  {
    global $wpdb;
    $table = Persistance::getEventHasRegistrationGroupTableName();
    $result = $wpdb->delete($table, array("transaction_id" => $transactionId));
    Persistance::handleUpdateInsertResult($wpdb, $result, "deleteRegistrationGroupByTransactionId");
  }


  public static function deleteRegistrations($transactionId)
  {
    global $wpdb;
    $table = Persistance::getRegisteredUserTableName();
    $result = $wpdb->delete($table, array("transaction_id" => $transactionId));
    Persistance::handleUpdateInsertResult($wpdb, $result, "deleteRegistrations");
  }


  public static function createRegistrationGroup($eventId, $leaderId, $name, $price, $maxPeople, $mainEmail, $transactionId)
  {
    global $wpdb;

    $table = Persistance::getEventHasRegistrationGroupTableName();
    $now = new DateTime('now', new DateTimeZone('Europe/Prague'));

    $inserted = $wpdb->insert(
      $table,
      array(
        "event_id" => $eventId,
        "group_leader_id" => $leaderId,
        "registration_type_name" => $name,
        "price" => $price,
        "max_people" => $maxPeople,
        "main_email" => $mainEmail,
        "transaction_id" => $transactionId,
        "registration_date" => $now->format('Uv'),
      ),
      array("%d", "%d", "%s", "%d", "%d", "%s", "%d", "%d")

    );
    Persistance::handleUpdateInsertResult($wpdb, $inserted, "createRegistrationGroup");
    $newId = $wpdb->insert_id;
    return $newId;

  }

  public static function createSingleRegistration($eventId, $groupId, $registration, $club, $transactionId)
  {
    global $wpdb;

    $table = Persistance::getRegisteredUserTableName();

    $inserted = $wpdb->insert(
      $table,
      array(
        'name' => $registration->name,
        'event_id' => $eventId,
        'group_id' => $groupId,
        'last_name' => $registration->last_name,
        'email' => $registration->email,
        'date_of_birth' => $registration->date_of_birth,
        'address' => $registration->address,
        'club' => $club,
        'phone' => $registration->phone,
        'flags' => "",
        'gdpr' => 1,
        'transaction_id' => $transactionId,
        'sex' => $registration->sex,
      ),
      array("%s", "%d", "%d", "%s", "%s", "%d", "%s", "%s", "%s", "%s", "%d", "%d", "%s")
    );
    Persistance::handleUpdateInsertResult($wpdb, $inserted, "createSingleRegistration");
    $newId = $wpdb->insert_id;
    return $newId;
  }


  public static function createEvent($event)
  {
    global $wpdb;

    $table = Persistance::getEventsTableName();

    $inserted = $wpdb->insert(
      $table,
      array(
        "name" => $event->name,
        "short_description" => $event->short_description,
        "description" => $event->description,
        "time" => $event->time,
        "max_people" => $event->max_people,
        "visible" => 0,
        "registration_end" => $event->registration_end,
        "image" => $event->image,
        "people" => 0,
        "bank_code" => $event->bank_code,
        "account_number" => $event->account_number,
        "prefix" => $event->prefix,
        "iban" => $event->iban,
        "swift" => $event->swift,
        "registrations" => $event->registrations,

      ),
      array(
        "%s",
        "%s",
        "%s",
        "%d",
        "%d",
        "%d",
        "%d",
        "%s",
        "%d",
        "%s",
        "%s",
        "%s",
        "%s",
        "%s",
        "%s",
        "%s"
      )
    );

    Persistance::handleUpdateInsertResult($wpdb, $inserted, "createEvent");
    $newId = $wpdb->insert_id;
    return $newId;
  }


  private static function getUsedRegistrationTypeNames($eventId)
  {
    global $wpdb;
    $table = Persistance::getEventHasRegistrationGroupTableName();
    $result = $wpdb->get_results($wpdb->prepare("SELECT DISTINCT registration_type_name FROM " . $table . " WHERE event_id=%d", array($eventId)));
    return $result;
  }

  private static function checkEventRegistrationTypeNameConsistency($event)
  {
    $usedNames = Persistance::getUsedRegistrationTypeNames($event->id);

    $namesInUpdateData = json_decode($event->registrations);

    foreach ($usedNames as $usedName) {
      //
      $isInPayload = false;
      foreach ($namesInUpdateData as $updateRegistration) {
        $isInPayload = $isInPayload || $updateRegistration->name === $usedName->registration_type_name;
      }

      if (!$isInPayload) {
        Persistance::logError("checkEventRegistrationTypeNameConsistency error for " . $updateRegistration->name);
        throw new ErrorException("Failed to insert or update, there is already existing registration that is missing in update data");
      }
    }

  }


  public static function deleteEvent($eventId)
  {
    global $wpdb;

    $table = Persistance::getEventsTableName();
    $rowsRemoved = $wpdb->delete($table, array("id" => $eventId));
    Persistance::handleUpdateInsertResult($wpdb, $rowsRemoved, "deleteEvent - event");

    $table = Persistance::getEventHasRegistrationGroupTableName();
    $rowsRemoved = $wpdb->delete($table, array("event_id" => $eventId));
    Persistance::handleUpdateInsertResult($wpdb, $rowsRemoved, "deleteEvent - groups");


    $table = Persistance::getRegisteredUserTableName();
    $rowsRemoved = $wpdb->delete($table, array("event_id" => $eventId));
    Persistance::handleUpdateInsertResult($wpdb, $rowsRemoved, "deleteEvent - users");

  }

  public static function getRegistrations($eventId, $includeDetails)
  {
    global $wpdb;
    $groupTable = Persistance::getEventHasRegistrationGroupTableName();
    $userTable = Persistance::getRegisteredUserTableName();
    if ($includeDetails) {
      $result = $wpdb->get_results($wpdb->prepare("SELECT u.*, IF(u.id = g.group_leader_id, 1, 0) as is_leader ,g.registration_type_name, g.paid, g.price FROM " . $userTable . " u, " . $groupTable . " g WHERE g.id = u.group_id AND u.event_id = %d;", array($eventId)));
      return array_map("registrationsToProperType", $result);
    }

    $result = $wpdb->get_results($wpdb->prepare("SELECT u.id, u.group_id, u.gdpr, u.name, u.club, u.last_name , IF(u.id = g.group_leader_id, 1, 0) as is_leader ,g.registration_type_name, g.paid, g.price FROM " . $userTable . " u, " . $groupTable . " g WHERE g.id = u.group_id AND u.event_id = %d;", array($eventId)));
    return array_map("simpleRegistrationsToProperType", $result);
  }

  public static function getRegistrationsByGroupId($groupId)
  {
    global $wpdb;
    $groupTable = Persistance::getEventHasRegistrationGroupTableName();
    $userTable = Persistance::getRegisteredUserTableName();

    $result = $wpdb->get_results($wpdb->prepare("SELECT u.*, IF(u.id = g.group_leader_id, 1, 0) as is_leader ,g.registration_type_name, g.paid, g.price FROM " . $userTable . " u, " . $groupTable . " g WHERE g.id = u.group_id AND u.group_id = %d;", array($groupId)));
    return array_map("registrationsToProperType", $result);

  }

  public static function getLeader($groupId)
  {
    global $wpdb;
    $groupTable = Persistance::getEventHasRegistrationGroupTableName();
    $userTable = Persistance::getRegisteredUserTableName();

    $result = $wpdb->get_results($wpdb->prepare("SELECT u.* FROM " . $userTable . " u, " . $groupTable . " g WHERE g.id = u.group_id AND g.group_leader_id = u.id AND u.group_id = %d;", array($groupId)));
    return $result[0];
  }

  public static function updateRegisteredUser($userId, $registration)
  {
    global $wpdb;

    $table = Persistance::getRegisteredUserTableName();
    $result = $wpdb->update(
      $table,
      array(
        'name' => $registration->name,
        'last_name' => $registration->last_name,
        'email' => $registration->email,
        'date_of_birth' => $registration->date_of_birth,
        'address' => $registration->address,
        'club' => $registration->club,
        'phone' => $registration->phone,
        'sex' => $registration->sex,
      ),
      array("id" => $userId),
      array("%s", "%s", "%s", "%d", "%s", "%s", "%s", "%s")
    );
    Persistance::handleUpdateInsertResult($wpdb, $result, "updateRegisteredUser");
  }


  public static function updateEvent($eventId, $event)
  {
    global $wpdb;

    $table = Persistance::getEventsTableName();
    Persistance::checkEventRegistrationTypeNameConsistency($event);

    $updated = $wpdb->update(
      $table,
      array(
        "name" => $event->name,
        "short_description" => $event->short_description,
        "description" => $event->description,
        "time" => $event->time,
        "max_people" => $event->max_people,
        "registration_end" => $event->registration_end,
        "image" => $event->image,
        "bank_code" => $event->bank_code,
        "account_number" => $event->account_number,
        "prefix" => $event->prefix,
        "iban" => $event->iban,
        "swift" => $event->swift,
        "registrations" => $event->registrations,
      ),
      array("id" => $eventId),
      array(
        "%s",
        "%s",
        "%s",
        "%d",
        "%d",
        "%d",
        "%s",
        "%s",
        "%s",
        "%s",
        "%s",
        "%s",
        "%s",
      ),
      array("%d"),
    );


    Persistance::handleUpdateInsertResult($wpdb, $updated, "updateEvent");

  }


  public static function getEvent($id, $onlyVisible)
  {
    global $wpdb;

    $table = Persistance::getEventsTableName();
    if ($onlyVisible) {
      $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM " . $table . " WHERE id=%d AND visible=%d", array($id, 1)));
      if (count($result) !== 1) {
        return null;
      }
      return eventToProperType($result[0]);
    }
    $result = $wpdb->get_results($wpdb->prepare("SELECT * FROM " . $table . " WHERE id=%d ", array($id)));
    if (count($result) !== 1) {
      return null;
    }
    return eventToProperType($result[0]);
  }


  public static function getEventByGroup($groupId, $onlyVisible)
  {
    global $wpdb;

    $table = Persistance::getEventsTableName();
    $groupTable = Persistance::getEventHasRegistrationGroupTableName();

    if ($onlyVisible) {
      $result = $wpdb->get_results($wpdb->prepare("SELECT e.* FROM " . $table . " e, " . $groupTable . " g WHERE e.id=g.event_id AND g.id=%d AND e.visible=%d", array($groupId, 1)));
      if (count($result) !== 1) {
        return null;
      }
      return eventToProperType($result[0]);
    }

    $result = $wpdb->get_results($wpdb->prepare("SELECT e.* FROM " . $table . " e, " . $groupTable . " g WHERE e.id=g.event_id AND g.id=%d", array($groupId)));
    if (count($result) !== 1) {
      return null;
    }
    return eventToProperType($result[0]);
  }



  public static function getEventsTableName()
  {
    global $wpdb;
    $eventTable = $wpdb->prefix . 'gt3_registration_event';
    return $eventTable;
  }
  public static function getApiKeyTableName()
  {
    global $wpdb;
    $table = $wpdb->prefix . 'gt3_registration_key';
    return $table;
  }


  public static function getEventHasRegistrationGroupTableName()
  {

    global $wpdb;
    $table = $wpdb->prefix . 'gt3_registration_event_registration_group';
    return $table;

  }
  public static function getErrorLogTableName()
  {

    global $wpdb;
    $table = $wpdb->prefix . 'gt3_registration_event_errors';
    return $table;

  }

  public static function getRegisteredUserTableName()
  {

    global $wpdb;
    $table = $wpdb->prefix . 'gt3_registration_registered_user';
    return $table;

  }


  public static function initDatabase()
  {

    global $wpdb;

    $eventTable = Persistance::getEventsTableName();
    // $eventRegistrationTable = Persistance::getEventHasRegistrationTableName();
    $eventRegistrationGroup = Persistance::getEventHasRegistrationGroupTableName();
    $errorsTable = Persistance::getErrorLogTableName();
    $userTable = Persistance::getRegisteredUserTableName();
    $keysTable = Persistance::getApiKeyTableName();
    $charset_collate = $wpdb->get_charset_collate();
    require_once (ABSPATH . 'wp-admin/includes/upgrade.php');

    $sql = "CREATE TABLE " . $eventTable . " (
                                    id int NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
                                    name longtext CHARACTER SET utf8mb4,
                                    short_description longtext CHARACTER SET utf8mb4 NOT NULL,
                                    registrations longtext CHARACTER SET utf8mb4 NOT NULL,
                                    description longtext CHARACTER SET utf8mb4 NOT NULL,
                                    image varchar(4096) NULL,
                                    time bigint NOT NULL,
                                    max_people int NOT NULL,
                                    bank_code varchar(256) NOT NULL,
                                    account_number varchar(256) NOT NULL,
                                    prefix varchar(256) NOT NULL,
                                    iban varchar(256) NOT NULL,
                                    swift varchar(256) NOT NULL,
                                    people int NOT NULL,
                                    visible int NOT NULL,
                                    registration_end bigint NOT NULL
                                  ) " . $charset_collate . ";";
    dbDelta($sql);



    $sql = "CREATE TABLE " . $eventRegistrationGroup . " (
      id int NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
      event_id int NOT NULL,
      group_leader_id int NOT NULL,
      registration_type_name varchar(4096) NOT NULL,
      registration_date bigint NOT NULL,
      price int NOT NULL,
      paid int NOT NULL,
      transaction_id int NOT NULL,
      max_people int NOT NULL,
      main_email varchar(1024) CHARACTER SET utf8mb4 NOT NULL
    ) " . $charset_collate . ";";

    dbDelta($sql);

    $sql = "CREATE TABLE " . $userTable . " (
                            id int NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
                            name varchar(4096) CHARACTER SET utf8mb4 NOT NULL,
                            event_id int NOT NULL,
                            group_id int NOT NULL,
                            transaction_id int NOT NULL,
                            last_name varchar(1024) CHARACTER SET utf8mb4 NOT NULL,
                            email varchar(1024) CHARACTER SET utf8mb4 NOT NULL,
                            date_of_birth bigint NOT NULL,
                            address varchar(4096) CHARACTER SET utf8mb4 NOT NULL,
                            club varchar(1024) CHARACTER SET utf8mb4 NOT NULL,
                            phone varchar(1024) NOT NULL,
                            sex varchar(128) NOT NULL,
                            flags varchar(1000) NOT NULL,
                            gdpr int NOT NULL
                          )" . $charset_collate . ";";

    dbDelta($sql);



    $sql = "CREATE TABLE " . $errorsTable . " (
      id int NOT NULL AUTO_INCREMENT, PRIMARY KEY (id),
      time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      msg varchar(8192) CHARACTER SET utf8mb4 NOT NULL
    )" . $charset_collate . ";";

    dbDelta($sql);



    $sql = "CREATE TABLE " . $keysTable . " (
      key_name varchar(512) NOT NULL, PRIMARY KEY (key_name),
      key_value varchar(512) CHARACTER SET utf8mb4 NOT NULL
    )" . $charset_collate . ";";

    dbDelta($sql);

  }

}
