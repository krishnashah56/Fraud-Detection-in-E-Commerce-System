<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ─── LOGIN AJAX ───────────────────────────────────────────────
add_action( 'wp_ajax_nopriv_im_login', 'im_ajax_login' );
function im_ajax_login() {
    check_ajax_referer( 'im_nonce', 'nonce' );
    $creds = [
        'user_login'    => sanitize_text_field( $_POST['log'] ),
        'user_password' => $_POST['pwd'],
        'remember'      => true,
    ];
    $user = wp_signon( $creds, false );
    if ( is_wp_error( $user ) ) {
        wp_send_json_error( ['message' => 'Invalid email/username or password. Please try again.'] );
    }
    wp_set_current_user( $user->ID );
    wp_send_json_success( ['redirect' => home_url('/im-dashboard')] );
}

// ─── REGISTER AJAX ───────────────────────────────────────────
add_action( 'wp_ajax_nopriv_im_register', 'im_ajax_register' );
function im_ajax_register() {
    check_ajax_referer( 'im_nonce', 'nonce' );
    global $wpdb;

    $type      = sanitize_text_field( $_POST['account_type'] );
    $fname     = sanitize_text_field( $_POST['first_name'] );
    $lname     = sanitize_text_field( $_POST['last_name'] );
    $phone     = sanitize_text_field( $_POST['phone'] );
    $username  = sanitize_user( $_POST['username'] );
    $email     = sanitize_email( $_POST['email'] );
    $password  = $_POST['password'];

    if ( username_exists( $username ) ) {
        wp_send_json_error( ['message' => 'This username is already taken. Please choose another.'] );
    }
    if ( email_exists( $email ) ) {
        wp_send_json_error( ['message' => 'This email is already registered. Please login instead.'] );
    }
    if ( strlen( $password ) < 8 ) {
        wp_send_json_error( ['message' => 'Password must be at least 8 characters long.'] );
    }

    $user_id = wp_create_user( $username, $password, $email );
    if ( is_wp_error( $user_id ) ) {
        wp_send_json_error( ['message' => $user_id->get_error_message() ] );
    }

    $user = new WP_User( $user_id );
    $user->set_role( $type );
    wp_update_user([
        'ID'           => $user_id,
        'first_name'   => $fname,
        'last_name'    => $lname,
        'display_name' => $fname . ' ' . $lname,
    ]);
    update_user_meta( $user_id, 'account_type', $type );
    update_user_meta( $user_id, 'phone', $phone );

    // If brand, save extra fields
    if ( $type === 'brand' ) {
        $company_name = sanitize_text_field( $_POST['company_name'] ?? '' );
        $gst_number   = sanitize_text_field( $_POST['gst_number'] ?? '' );
        $office_addr  = sanitize_textarea_field( $_POST['office_address'] ?? '' );
        $brand_cats   = isset($_POST['brand_categories']) ? implode(',', array_map('sanitize_text_field', (array)$_POST['brand_categories'])) : '';

        $wpdb->insert( $wpdb->prefix . 'im_brand_profiles', [
            'user_id'             => $user_id,
            'company_name'        => $company_name,
            'gst_number'          => $gst_number,
            'office_address'      => $office_addr,
            'phone'               => $phone,
            'category_preference' => $brand_cats,
        ]);
    }

    // Auto login after registration
    wp_set_auth_cookie( $user_id, true );
    wp_set_current_user( $user_id );
    wp_send_json_success( ['redirect' => home_url('/im-profile')] );
}

// ─── SAVE PROFILE AJAX ───────────────────────────────────────
add_action( 'wp_ajax_im_save_profile', 'im_ajax_save_profile' );
function im_ajax_save_profile() {
    check_ajax_referer( 'im_nonce', 'nonce' );
    if ( ! is_user_logged_in() ) wp_send_json_error(['message' => 'Not logged in.']);

    global $wpdb;
    $user_id = get_current_user_id();
    $type    = sanitize_text_field( $_POST['account_type'] );

    if ( $type === 'influencer' ) {
        $cats = isset($_POST['categories']) ? implode(',', array_map('sanitize_text_field', (array)$_POST['categories'])) : '';
        $data = [
            'user_id'              => $user_id,
            'dob'                  => sanitize_text_field($_POST['dob'] ?? ''),
            'gender'               => sanitize_text_field($_POST['gender'] ?? ''),
            'categories'           => $cats,
            'instagram_url'        => esc_url_raw($_POST['instagram_url'] ?? ''),
            'instagram_followers'  => intval($_POST['instagram_followers'] ?? 0),
            'youtube_url'          => esc_url_raw($_POST['youtube_url'] ?? ''),
            'youtube_subscribers'  => intval($_POST['youtube_subscribers'] ?? 0),
            'tiktok_url'           => esc_url_raw($_POST['tiktok_url'] ?? ''),
            'location'             => sanitize_text_field($_POST['location'] ?? ''),
            'charges'              => floatval($_POST['charges'] ?? 0),
            'bio'                  => sanitize_textarea_field($_POST['bio'] ?? ''),
        ];
        $exists = $wpdb->get_var( $wpdb->prepare("SELECT id FROM {$wpdb->prefix}im_influencer_profiles WHERE user_id = %d", $user_id) );
        if ( $exists ) {
            $wpdb->update( $wpdb->prefix . 'im_influencer_profiles', $data, ['user_id' => $user_id] );
        } else {
            $wpdb->insert( $wpdb->prefix . 'im_influencer_profiles', $data );
        }
    } else {
        $brand_cats = isset($_POST['brand_categories']) ? implode(',', array_map('sanitize_text_field', (array)$_POST['brand_categories'])) : '';
        $data = [
            'user_id'             => $user_id,
            'company_name'        => sanitize_text_field($_POST['company_name'] ?? ''),
            'gst_number'          => sanitize_text_field($_POST['gst_number'] ?? ''),
            'office_address'      => sanitize_textarea_field($_POST['office_address'] ?? ''),
            'phone'               => sanitize_text_field($_POST['phone'] ?? ''),
            'website'             => esc_url_raw($_POST['website'] ?? ''),
            'category_preference' => $brand_cats,
        ];
        $exists = $wpdb->get_var( $wpdb->prepare("SELECT id FROM {$wpdb->prefix}im_brand_profiles WHERE user_id = %d", $user_id) );
        if ( $exists ) {
            $wpdb->update( $wpdb->prefix . 'im_brand_profiles', $data, ['user_id' => $user_id] );
        } else {
            $wpdb->insert( $wpdb->prefix . 'im_brand_profiles', $data );
        }
    }
    wp_send_json_success(['message' => 'Profile saved successfully! ✅']);
}

// ─── SEARCH INFLUENCERS AJAX ──────────────────────────────────
add_action( 'wp_ajax_im_search_influencers', 'im_ajax_search_influencers' );
add_action( 'wp_ajax_nopriv_im_search_influencers', 'im_ajax_search_influencers' );
function im_ajax_search_influencers() {
    check_ajax_referer( 'im_nonce', 'nonce' );
    global $wpdb;

    $category      = sanitize_text_field( $_POST['category'] ?? '' );
    $location      = sanitize_text_field( $_POST['location'] ?? '' );
    $min_followers = intval( $_POST['min_followers'] ?? 0 );
    $max_charges   = floatval( $_POST['max_charges'] ?? 0 );

    $where = "WHERE 1=1";
    if ( $category )      $where .= $wpdb->prepare(" AND p.categories LIKE %s", '%' . $wpdb->esc_like($category) . '%');
    if ( $location )      $where .= $wpdb->prepare(" AND p.location LIKE %s", '%' . $wpdb->esc_like($location) . '%');
    if ( $min_followers ) $where .= $wpdb->prepare(" AND p.instagram_followers >= %d", $min_followers);
    if ( $max_charges )   $where .= $wpdb->prepare(" AND p.charges <= %f", $max_charges);

    $results = $wpdb->get_results("
        SELECT p.*, u.display_name, u.user_email
        FROM {$wpdb->prefix}im_influencer_profiles p
        JOIN {$wpdb->users} u ON p.user_id = u.ID
        $where
        ORDER BY p.instagram_followers DESC
        LIMIT 50
    ");

    if ( empty($results) ) {
        wp_send_json_success(['html' => '<p class="im-no-results">No influencers found matching your criteria. Try adjusting your filters.</p>']);
    }

    $html = '';
    foreach ( $results as $r ) {
        $avatar = get_avatar_url($r->user_id, ['size' => 80]);
        $cats   = implode(', ', array_filter(explode(',', $r->categories)));
        $html  .= '<div class="im-influencer-card">';
        $html  .= '<img src="' . esc_url($avatar) . '" alt="Avatar" class="im-inf-avatar" />';
        $html  .= '<h3>' . esc_html($r->display_name) . '</h3>';
        $html  .= $r->location ? '<p class="im-inf-location">📍 ' . esc_html($r->location) . '</p>' : '';
        $html  .= $cats ? '<p class="im-inf-cats">🏷️ ' . esc_html($cats) . '</p>' : '';
        $html  .= $r->instagram_followers ? '<p class="im-inf-stats">📸 ' . number_format($r->instagram_followers) . ' Followers</p>' : '';
        $html  .= $r->charges ? '<p class="im-inf-charge">💰 ₹' . number_format($r->charges) . ' / post</p>' : '';
        $html  .= $r->bio ? '<p class="im-inf-bio">' . esc_html(substr($r->bio, 0, 100)) . '...</p>' : '';
        $html  .= '</div>';
    }
    wp_send_json_success(['html' => $html]);
}
