<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// Add Login/Register OR User menu button in header
add_action( 'wp_nav_menu_items', 'im_add_header_button', 10, 2 );
function im_add_header_button( $items, $args ) {
    // Only add to the primary menu
    if ( $args->theme_location !== 'primary' && $args->theme_location !== 'main-menu' && $args->theme_location !== 'primary-menu' ) {
        return $items;
    }

    if ( is_user_logged_in() ) {
        $user = wp_get_current_user();
        $type = get_user_meta( $user->ID, 'account_type', true );
        $icon = $type === 'brand' ? '🏢' : '📸';
        $items .= '
        <li class="im-header-user">
            <a href="' . home_url('/im-dashboard') . '" class="im-header-btn im-header-user-btn">
                ' . get_avatar( $user->ID, 28 ) . '
                <span>' . $icon . ' ' . esc_html( $user->display_name ) . '</span>
            </a>
            <ul class="im-header-dropdown">
                <li><a href="' . home_url('/im-dashboard') . '">🏠 Dashboard</a></li>
                <li><a href="' . home_url('/im-profile') . '">👤 My Profile</a></li>
                <li><a href="' . home_url('/im-search') . '">🔍 ' . ($type === 'brand' ? 'Find Influencers' : 'Find Brands') . '</a></li>
                <li class="im-dropdown-divider"></li>
                <li><a href="' . wp_logout_url( home_url('/im-login') ) . '">🚪 Logout</a></li>
            </ul>
        </li>';
    } else {
        $items .= '
        <li class="im-header-auth">
            <a href="' . home_url('/im-login') . '" class="im-header-btn im-header-login-btn">Login</a>
            <a href="' . home_url('/im-register') . '" class="im-header-btn im-header-register-btn">Register Free</a>
        </li>';
    }
    return $items;
}
