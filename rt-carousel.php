<?php
/**
 * Plugin Name: rtCarousel
 * Description: Carousel block using Embla and WordPress Interactivity API.
 * Plugin URI:  https://github.com/rtCamp/rt-carousel
 * Requires at least: 6.6
 * Requires PHP: 8.2
 * Author:      rtCamp
 * Author URI:  https://rtcamp.com
 * Domain Path: /languages
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Version:     1.0.4
 * Text Domain: rt-carousel
 *
 * @package rt-carousel
 */

namespace Rt_Carousel;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Define plugin constants.
 */
function constants(): void {
	define( 'RT_CAROUSEL_PATH', untrailingslashit( plugin_dir_path( __FILE__ ) ) );
	define( 'RT_CAROUSEL_URL', untrailingslashit( plugin_dir_url( __FILE__ ) ) );
	define( 'RT_CAROUSEL_BUILD_PATH', RT_CAROUSEL_PATH . '/build' );
	define( 'RT_CAROUSEL_BUILD_URL', RT_CAROUSEL_URL . '/build' );
}

constants();

require_once __DIR__ . '/inc/Autoloader.php';
if ( ! Autoloader::autoload() ) {
	return;
}

/**
 * Migrate block names and clean up data from the old "carousel-kit" plugin.
 *
 * Runs once on activation. Replaces `<!-- wp:carousel-kit/ -->` block
 * delimiters in post_content with `<!-- wp:rt-carousel/ -->` and removes
 * the orphaned transient.
 */
function rt_carousel_migrate(): void {
	$migrated_option = 'rt_carousel_migrated_from_carousel_kit';

	if ( get_option( $migrated_option ) ) {
		return;
	}

	global $wpdb;

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-time migration on activation; no persistent query.
	$wpdb->query(
		"UPDATE {$wpdb->posts}
		 SET post_content = REPLACE( post_content, 'wp:carousel-kit/', 'wp:rt-carousel/' )
		 WHERE post_content LIKE '%wp:carousel-kit/%'"
	);

	delete_transient( 'carousel_kit_patterns_cache' );
	update_option( $migrated_option, '1' );
}

register_activation_hook( __FILE__, __NAMESPACE__ . '\\rt_carousel_migrate' );

/**
 * Plugin loader.
 */
function rt_carousel_loader(): void {
	Plugin::get_instance();
}

rt_carousel_loader();
