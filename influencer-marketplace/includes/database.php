<?php
if ( ! defined( 'ABSPATH' ) ) exit;

function im_create_tables() {
    global $wpdb;
    $charset = $wpdb->get_charset_collate();

    // Influencer Profiles Table
    $sql1 = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}im_influencer_profiles (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) UNSIGNED NOT NULL,
        dob DATE DEFAULT NULL,
        gender VARCHAR(20) DEFAULT '',
        categories TEXT DEFAULT '',
        instagram_url VARCHAR(255) DEFAULT '',
        instagram_followers BIGINT(20) DEFAULT 0,
        youtube_url VARCHAR(255) DEFAULT '',
        youtube_subscribers BIGINT(20) DEFAULT 0,
        tiktok_url VARCHAR(255) DEFAULT '',
        location VARCHAR(255) DEFAULT '',
        charges DECIMAL(10,2) DEFAULT 0,
        bio TEXT DEFAULT '',
        profile_image VARCHAR(255) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY user_id (user_id)
    ) $charset;";

    // Brand Profiles Table
    $sql2 = "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}im_brand_profiles (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) UNSIGNED NOT NULL,
        company_name VARCHAR(255) DEFAULT '',
        gst_number VARCHAR(50) DEFAULT '',
        office_address TEXT DEFAULT '',
        phone VARCHAR(20) DEFAULT '',
        category_preference TEXT DEFAULT '',
        website VARCHAR(255) DEFAULT '',
        logo VARCHAR(255) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY user_id (user_id)
    ) $charset;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql1 );
    dbDelta( $sql2 );

    // Add default categories
    $default_categories = ['Fashion', 'Beauty', 'Clothing', 'Entertainment', 'Art', 'Food', 'Travel', 'Technology', 'Fitness', 'Lifestyle'];
    update_option( 'im_categories', $default_categories );

    // Add user roles
    add_role( 'influencer', 'Influencer', ['read' => true] );
    add_role( 'brand', 'Brand', ['read' => true] );
}
