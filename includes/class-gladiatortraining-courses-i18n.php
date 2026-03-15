<?php

/**
 * Define the internationalization functionality
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @link       https://github.com/ladariha
 * @since      1.0.0
 *
 * @package    Gladiatortraining_Courses
 * @subpackage Gladiatortraining_Courses/includes
 */

/**
 * Define the internationalization functionality.
 *
 * Loads and defines the internationalization files for this plugin
 * so that it is ready for translation.
 *
 * @since      1.0.0
 * @package    Gladiatortraining_Courses
 * @subpackage Gladiatortraining_Courses/includes
 * @author     Lada Riha <riha.vladimir@gmail.com>
 */
class Gladiatortraining_Courses_i18n
{


	/**
	 * Load the plugin text domain for translation.
	 *
	 * @since    1.0.0
	 */
	public function load_plugin_textdomain()
	{

		load_plugin_textdomain(
			'gladiatortraining-courses',
			false,
			dirname(dirname(plugin_basename(__FILE__))) . '/languages/'
		);

	}



}
