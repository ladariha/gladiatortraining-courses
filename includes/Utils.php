<?php

class Utils
{


  public static function isPastDate($timestampInMs)
  {

    $now = new DateTime('now', new DateTimeZone('Europe/Prague'));
    $date = new DateTime('now', new DateTimeZone('Europe/Prague'));
    $date->setTimestamp(round($timestampInMs / 1000));
    return $now >= $date;
  }

  public static function isValidString($value)
  {
    return is_string($value) && strlen($value) > 0;
  }


  public static function isString($value)
  {
    return is_string($value);
  }

  public static function isValidDate($value)
  {
    return is_int($value);
  }

  public static function isValidStringNumber($value)
  {
    if (!Utils::isValidString($value)) {
      return false;
    }

    return preg_match('/^\d+$/', $value);
  }

  public static function isValidNumber($value, $minimumValue)
  {
    return is_int($value) && $value >= $minimumValue;
  }
  public static function isValidNumberInBounds($value, $minimumValue, $maximumValue)
  {
    return is_int($value) && $value >= $minimumValue && $value <= $maximumValue;
  }

  public static function log($msg)
  {
    error_log($msg);
  }
}
