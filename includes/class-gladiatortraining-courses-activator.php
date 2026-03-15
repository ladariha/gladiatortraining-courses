<?php
include_once plugin_dir_path(__FILE__) . "Persistance.php";
/**
 * Fired during plugin activation
 *
 * @link       https://github.com/ladariha
 * @since      1.0.0
 *
 * @package    Gladiatortraining_Courses
 * @subpackage Gladiatortraining_Courses/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Gladiatortraining_Courses
 * @subpackage Gladiatortraining_Courses/includes
 * @author     Lada Riha <riha.vladimir@gmail.com>
 */
class Gladiatortraining_Courses_Activator
{
        /**
         * Short Description. (use period)
         *
         * Long Description.
         *
         * @since    1.0.0
         */
        public static function activate()
        {
                Persistance::initDatabase();
        }

}
