<?php
// READ-ONLY SECTION START - FOLLOWING LINES MUST BE NOT MODIFIED FOR BUILD.SH !!!
$PLUGIN_VERSION = "1.0.31";
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://github.com/ladariha/gladiatortraining-courses
 * @since             1.0.0
 * @package           Gladiatortraining_Courses
 *
 * @wordpress-plugin
 * Plugin Name:       gladiatortraining-courses
 * Plugin URI:        https://github.com/ladariha/gladiatortraining-courses
 * Description:       Registrace na události Gladiator Training.
 * Version:           1.0.31
 * Author:            Lada Riha
 * Author URI:        https://github.com/ladariha/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       gladiatortraining-courses
 * Domain Path:       /languages
 */


// READ-ONLY SECTION END

define('PLUGIN_VERSION', $PLUGIN_VERSION);


// If this file is called directly, abort.
if (!defined('WPINC')) {
	die;
}

$fonts = array();

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */

define('GLADIATORTRAINING_COURSES_VERSION', $PLUGIN_VERSION);

/**
 * Facebook social images configuration.
 * Replace the empty strings with real values or override in wp-config.php.
 */
if (!defined('GT_SOCIAL_FB_TOKEN')) {
	define('GT_SOCIAL_FB_TOKEN', '');
}
if (!defined('GT_SOCIAL_FB_PAGE_ID')) {
	define('GT_SOCIAL_FB_PAGE_ID', '668361683249635');
}
if (!defined('GT_SOCIAL_IMAGES_COUNT')) {
	define('GT_SOCIAL_IMAGES_COUNT', 10);
}

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-gladiatortraining-courses-activator.php
 */
function activate_gladiatortraining_courses()
{
	require_once plugin_dir_path(__FILE__) . 'includes/class-gladiatortraining-courses-activator.php';
	Gladiatortraining_Courses_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-gladiatortraining-courses-deactivator.php
 */
function deactivate_gladiatortraining_courses()
{
	require_once plugin_dir_path(__FILE__) . 'includes/class-gladiatortraining-courses-deactivator.php';
	Gladiatortraining_Courses_Deactivator::deactivate();
}



function frontend_gladiatortraining_courses()
{

	global $PLUGIN_VERSION;

	$path = "/frontend/build";
	wp_register_script(
		"gladiatortraining_courses_app_js",
		plugins_url($path . "/gc.js", __FILE__),
		array(),
		$PLUGIN_VERSION,
		array(
			'in_footer' => true,
		)
	);

	wp_register_script(
		"gladiatortraining_social_js",
		plugins_url("/public/js/gladiatortraining-social.js", __FILE__),
		array(),
		$PLUGIN_VERSION,
		array(
			'in_footer' => true,
		)
	);
}

function gladiatortraining_courses_app()
{

	require_once plugin_dir_path(__FILE__) . 'includes/CalendarProvider.php';
	$calendarData = CalendarProvider::getData();

	wp_enqueue_script("gladiatortraining_courses_app_js");
	wp_localize_script(
		'gladiatortraining_courses_app_js',
		'GladiatortrainingCourses',
		$calendarData
	);
	$jsonData = json_encode($calendarData);
	return "<div id=\"gladiatortraining_courses_app\"><div id=\"gladiatortraining_courses_app_content\" style=\"overflow: auto\"></div><script>renderTimetable(" . $jsonData . ")</script></div>";
}


function gladiator_social_images_app()
{

	require_once plugin_dir_path(__FILE__) . 'includes/SocialImages.php';
	$images = SocialImages::getData();

	wp_enqueue_script("gladiatortraining_social_js");
	wp_localize_script(
		'gladiatortraining_social_js',
		'GladiatortrainingSocialImages',
		array_values($images)
	);
	return "<div id=\"gladiator_social_images\"></div>";
}


register_activation_hook(__FILE__, 'activate_gladiatortraining_courses');
register_deactivation_hook(__FILE__, 'deactivate_gladiatortraining_courses');

add_action('init', 'frontend_gladiatortraining_courses');
add_shortcode('gladiatortraining_courses_app', 'gladiatortraining_courses_app');
add_shortcode('gladiator_social_images', 'gladiator_social_images_app');

add_action('rest_api_init', function () {
	register_rest_route('gladiatortraining/v1', '/social-token', array(
		'methods' => 'POST',
		'callback' => 'gladiatortraining_store_social_token',
		'permission_callback' => function () {
			// return true;
			return current_user_can('manage_options');
		},
		'args' => array(
			'token' => array(
				'required' => true,
				'type' => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			),
		),
	));

	register_rest_route('gladiatortraining/v1', '/social-images/refresh', array(
		'methods' => 'GET',
		'callback' => 'gladiatortraining_refresh_social_images',
		'permission_callback' => function () {
			return true;
			// return current_user_can('manage_options');
		},
	));
});

function gladiatortraining_store_social_token(WP_REST_Request $request)
{
	require_once plugin_dir_path(__FILE__) . 'includes/PersistanceGTSocial.php';

	$token = $request->get_param('token');
	try {
		PersistanceGTSocial::storeSocialToken($token);
		return new WP_REST_Response(array('success' => true), 200);
	} catch (Exception $e) {
		return new WP_REST_Response(array('success' => false, 'message' => $e->getMessage()), 500);
	}
}

function gladiatortraining_refresh_social_images()
{
	require_once plugin_dir_path(__FILE__) . 'includes/PersistanceGTSocial.php';

	try {
		PersistanceGTSocial::clearSocialImages();
		return new WP_REST_Response(array('success' => true), 200);
	} catch (Exception $e) {
		return new WP_REST_Response(array('success' => false, 'message' => $e->getMessage()), 500);
	}
}


/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path(__FILE__) . 'includes/class-gladiatortraining-courses.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_gladiatortraining_courses()
{

	$plugin = new Gladiatortraining_Courses();
	$plugin->run();

}
run_gladiatortraining_courses();
