<?php
/**
 * Plugin Name: IM Marketplace
 * Plugin URI:  https://infdir.kishahaldiamakeup.in
 * Description: Complete Influencer & Brand registration, profile, and matching system.
 * Version:     1.0.0
 * Author:      Custom Dev
 * Text Domain: im-marketplace
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'IM_VERSION', '1.0.0' );
define( 'IM_PATH', plugin_dir_path( __FILE__ ) );
define( 'IM_URL', plugin_dir_url( __FILE__ ) );

// Load sub-files
require_once IM_PATH . 'includes/database.php';
require_once IM_PATH . 'includes/shortcodes.php';
require_once IM_PATH . 'includes/ajax.php';
require_once IM_PATH . 'includes/header-button.php';

// Activation Hook - create DB tables
register_activation_hook( __FILE__, 'im_create_tables' );

// Enqueue assets
add_action( 'wp_enqueue_scripts', 'im_enqueue_assets' );
function im_enqueue_assets() {
    wp_enqueue_style( 'im-style', IM_URL . 'assets/style.css', [], IM_VERSION );
    wp_enqueue_script( 'im-script', IM_URL . 'assets/script.js', ['jquery'], IM_VERSION, true );
    wp_localize_script( 'im-script', 'IM_AJAX', [
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce'    => wp_create_nonce( 'im_nonce' ),
        'site_url' => home_url(),
    ]);
}

// Create pages on activation
register_activation_hook( __FILE__, 'im_create_pages' );
function im_create_pages() {
    $pages = [
        'im-register'  => [ 'title' => 'Register', 'content' => '[im_register_form]' ],
        'im-login'     => [ 'title' => 'Login', 'content' => '[im_login_form]' ],
        'im-dashboard' => [ 'title' => 'My Dashboard', 'content' => '[im_dashboard]' ],
        'im-profile'   => [ 'title' => 'My Profile', 'content' => '[im_profile_form]' ],
        'im-search'    => [ 'title' => 'Find Influencers', 'content' => '[im_search]' ],
    ];
    foreach ( $pages as $slug => $data ) {
        if ( ! get_page_by_path( $slug ) ) {
            wp_insert_post([
                'post_title'   => $data['title'],
                'post_name'    => $slug,
                'post_content' => $data['content'],
                'post_status'  => 'publish',
                'post_type'    => 'page',
            ]);
        }
    }
}
