<?php
// READ-ONLY SECTION START - FOLLOWING LINES MUST BE NOT MODIFIED FOR BUILD.SH !!!
$PLUGIN_VERSION = "1.0.0";
$MAIL_API_KEY = "PLACEHOLDER";
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
 * Version:           1.0.0
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

function activate_gladiatortraining_rest()
{
	require_once plugin_dir_path(__FILE__) . 'includes/UserRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/EventsRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/EventRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/RegistrationsRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/RegistrationGroupRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/ErrorsRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/MailRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/ApiKeysRoute.php';
	require_once plugin_dir_path(__FILE__) . 'includes/RegisteredUserRoute.php';

	(new UserRoute())->registerRoutes();
	(new EventsRoute())->registerRoutes();
	(new EventRoute())->registerRoutes();
	(new RegistrationsRoute())->registerRoutes();
	(new RegistrationGroupRoute())->registerRoutes();
	(new MailRoute())->registerRoutes();
	(new ErrorsRoute())->registerRoutes();
	(new ApiKeysRoute())->registerRoutes();
	(new RegisteredUserRoute())->registerRoutes();

}


function frontend_init()
{

	global $fonts;
	global $PLUGIN_VERSION;

	$path = "/frontend/build/static";
	wp_register_script(
		"gladiatortraining_registrations_app_js",
		plugins_url($path . "/js/main.js", __FILE__),
		array(),
		$PLUGIN_VERSION,
		array(
			'in_footer' => true,
		)
	);
	wp_register_style("gladiatortraining_registrations_app_css", plugins_url($path . "/css/main.css", __FILE__), array(), $PLUGIN_VERSION, "all");

	// fonts
	$index = 0;
	foreach (array_filter(glob(__DIR__ . $path . "/media/*.*"), 'is_file') as $file) {
		$fonts[] = $file;
		$index += 1;
		$filename = pathinfo($file);
		wp_register_style("gladiatortraining_registrations_app_font_" . $index, plugins_url($path . "/media/" . $filename["basename"], __FILE__), array(), $PLUGIN_VERSION, "all");
	}
}

function gladiatortraining_courses_app()
{

	global $fonts;
	global $PLUGIN_VERSION;

	wp_enqueue_script("gladiatortraining_registrations_app_js", $PLUGIN_VERSION, true);
	wp_localize_script(
		'gladiatortraining_registrations_app_js',
		'GladiatortrainingRegistrations',
		array(
			'nonce' => wp_create_nonce("wp_rest"),
			'baseUrl' => home_url(),
		)
	);
	wp_enqueue_style("gladiatortraining_registrations_app_css");
	// fonts
	$index = 0;
	foreach ($fonts as $font) {
		$index += 1;
		wp_enqueue_style("gladiatortraining_registrations_app_font_" . $index);

	}

	return "<div id=\"gladiatortraining_registrations_app\"></div>";
}


register_activation_hook(__FILE__, 'activate_gladiatortraining_courses');
register_deactivation_hook(__FILE__, 'deactivate_gladiatortraining_courses');
add_action('rest_api_init', 'activate_gladiatortraining_rest');
add_action('init', 'frontend_init');
add_shortcode('gladiatortraining_courses_app', 'gladiatortraining_courses_app');


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
