<?php
/**
 * Plugin Name: Influencer Frontend System
 * Description: 100% Frontend Registration and Login for Influencers & Brands.
 * Version: 1.0.0
 * Author: Custom Dev
 */

if (!defined('ABSPATH')) exit;

// 1. Create DB Tables & Roles
add_action('init', 'ifs_setup_database');
function ifs_setup_database() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    dbDelta("CREATE TABLE IF NOT EXISTS {$wpdb->prefix}im_influencers (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        categories text NOT NULL,
        instagram_url varchar(255) DEFAULT '',
        followers int(11) DEFAULT 0,
        price int(11) DEFAULT 0,
        PRIMARY KEY  (id),
        UNIQUE KEY user_id (user_id)
    ) $charset_collate;");

    dbDelta("CREATE TABLE IF NOT EXISTS {$wpdb->prefix}im_brands (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) NOT NULL,
        company_name varchar(255) DEFAULT '',
        gst varchar(50) DEFAULT '',
        category_pref text NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY user_id (user_id)
    ) $charset_collate;");

    add_role( 'influencer', 'Influencer', array( 'read' => true ) );
    add_role( 'brand', 'Brand', array( 'read' => true ) );
}

// 2. Hide Admin Bar & Redirect non-admins
add_action('after_setup_theme', 'ifs_remove_admin_bar');
function ifs_remove_admin_bar() {
    if (!current_user_can('administrator') && !is_admin()) {
        show_admin_bar(false);
    }
}
add_action('init', 'ifs_redirect_non_admins');
function ifs_redirect_non_admins() {
    if (is_admin() && !defined('DOING_AJAX') && is_user_logged_in() && !current_user_can('administrator')) {
        wp_redirect(home_url());
        exit;
    }
}

// 3. Frontend Registration Shortcode [im_registration]
add_shortcode('im_registration', 'ifs_registration_form');
function ifs_registration_form() {
    ob_start(); ?>
    <style>
        .im-form-container { max-width: 500px; margin: 40px auto; padding: 30px; background: #fff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); font-family: sans-serif; }
        .im-form-container h3 { text-align: center; margin-bottom: 20px; }
        .im-form-group { margin-bottom: 15px; }
        .im-form-group label { display: block; font-weight: bold; margin-bottom: 5px; }
        .im-form-group input, .im-form-group select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
        .im-btn { width: 100%; padding: 12px; background: #7C3AED; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
        .im-btn:hover { background: #6D28D9; }
        #brand_fields { display: none; }
    </style>
    <div class="im-form-container">
        <h3>Create an Account</h3>
        <form method="POST">
            <div class="im-form-group">
                <label>I am registering as a:</label>
                <select name="user_role" id="user_role" onchange="document.getElementById('brand_fields').style.display = (this.value === 'brand') ? 'block' : 'none';">
                    <option value="influencer">Influencer</option>
                    <option value="brand">Brand</option>
                </select>
            </div>
            <div class="im-form-group"><label>First Name</label><input type="text" name="first_name" required></div>
            <div class="im-form-group"><label>Last Name</label><input type="text" name="last_name" required></div>
            <div class="im-form-group"><label>Username</label><input type="text" name="username" required></div>
            <div class="im-form-group"><label>Email</label><input type="email" name="email" required></div>
            <div class="im-form-group"><label>Password</label><input type="password" name="password" required></div>
            <div id="brand_fields">
                <div class="im-form-group"><label>Company Name</label><input type="text" name="company_name"></div>
                <div class="im-form-group"><label>GST Number</label><input type="text" name="gst_number"></div>
            </div>
            <button type="submit" name="im_register_submit" class="im-btn">Register Now</button>
        </form>
    </div>
    <?php return ob_get_clean();
}

// 4. Process Registration (Redirects to Login)
add_action('init', 'ifs_process_registration');
function ifs_process_registration() {
    if (isset($_POST['im_register_submit'])) {
        global $wpdb;
        $username = sanitize_user($_POST['username']);
        $email    = sanitize_email($_POST['email']);
        $password = $_POST['password'];
        $role     = sanitize_text_field($_POST['user_role']);
        $fname    = sanitize_text_field($_POST['first_name']);
        $lname    = sanitize_text_field($_POST['last_name']);

        if (username_exists($username) || email_exists($email)) {
            wp_die('Error: Username or Email already exists! Back jaakar naya try karein.');
        }

        $user_id = wp_create_user($username, $password, $email);
        if (!is_wp_error($user_id)) {
            $user = new WP_User($user_id);
            $user->set_role($role);
            wp_update_user(array('ID' => $user_id, 'first_name' => $fname, 'last_name' => $lname, 'display_name' => $fname . ' ' . $lname));

            if ($role === 'brand') {
                $wpdb->insert($wpdb->prefix.'im_brands', array('user_id'=>$user_id, 'company_name'=>sanitize_text_field($_POST['company_name']), 'gst'=>sanitize_text_field($_POST['gst_number'])));
            } else {
                $wpdb->insert($wpdb->prefix.'im_influencers', array('user_id'=>$user_id));
            }
            // Redirect to frontend Login page!
            wp_redirect(home_url('/login/')); 
            exit;
        }
    }
}

// 5. Frontend Login Form Shortcode [im_login]
add_shortcode('im_login', 'ifs_login_form');
function ifs_login_form() {
    if (is_user_logged_in()) {
        return '<p style="text-align:center;">You are already logged in! <a href="' . home_url() . '">Go to Home</a></p>';
    }
    $error = '';
    if (isset($_POST['im_login_submit'])) {
        $creds = array('user_login' => sanitize_text_field($_POST['log']), 'user_password' => $_POST['pwd'], 'remember' => true);
        $user = wp_signon($creds, false);
        if (is_wp_error($user)) {
            $error = '<p style="color:red; text-align:center; font-weight:bold;">Incorrect Username or Password!</p>';
        } else {
            wp_redirect(home_url());
            exit;
        }
    }
    ob_start(); ?>
    <style>
        .im-form-container { max-width: 400px; margin: 40px auto; padding: 30px; background: #fff; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); font-family: sans-serif; }
        .im-form-container h3 { text-align: center; margin-bottom: 20px; }
        .im-form-group { margin-bottom: 15px; }
        .im-form-group label { display: block; font-weight: bold; margin-bottom: 5px; }
        .im-form-group input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
        .im-btn { width: 100%; padding: 12px; background: #7C3AED; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
        .im-btn:hover { background: #6D28D9; }
    </style>
    <div class="im-form-container">
        <h3>Login to Your Account</h3>
        <?php echo $error; ?>
        <form method="POST">
            <div class="im-form-group"><label>Username or Email</label><input type="text" name="log" required></div>
            <div class="im-form-group"><label>Password</label><input type="password" name="pwd" required></div>
            <button type="submit" name="im_login_submit" class="im-btn">Login</button>
        </form>
        <p style="text-align:center; margin-top:15px; font-size:14px;">Don't have an account? <a href="<?php echo home_url('/registration/'); ?>">Register here</a></p>
    </div>
    <?php return ob_get_clean();
}
?>
