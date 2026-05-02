<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ─── LOGIN FORM ───────────────────────────────────────────────
add_shortcode( 'im_login_form', 'im_render_login_form' );
function im_render_login_form() {
    if ( is_user_logged_in() ) {
        wp_redirect( home_url('/im-dashboard') );
        exit;
    }
    ob_start(); ?>
    <div class="im-wrap">
        <div class="im-card">
            <div class="im-logo">🚀</div>
            <h2 class="im-title">Welcome Back</h2>
            <p class="im-subtitle">Login to your account</p>
            <div id="im-login-msg" class="im-message" style="display:none;"></div>
            <form id="im-login-form">
                <div class="im-field">
                    <label>Email or Username</label>
                    <input type="text" name="log" id="im_log" placeholder="Enter your email or username" required />
                </div>
                <div class="im-field">
                    <label>Password</label>
                    <div class="im-password-wrap">
                        <input type="password" name="pwd" id="im_pwd" placeholder="Enter your password" required />
                        <span class="im-eye" onclick="imTogglePass('im_pwd')">👁</span>
                    </div>
                </div>
                <button type="submit" class="im-btn im-btn-primary" id="im-login-btn">Login</button>
                <div class="im-divider"><span>OR</span></div>
                <a href="<?php echo home_url('/im-register'); ?>" class="im-btn im-btn-outline">Create New Account</a>
                <p class="im-center-link"><a href="<?php echo wp_lostpassword_url(); ?>">Forgot Password?</a></p>
            </form>
        </div>
    </div>
    <?php return ob_get_clean();
}

// ─── REGISTER FORM ───────────────────────────────────────────
add_shortcode( 'im_register_form', 'im_render_register_form' );
function im_render_register_form() {
    if ( is_user_logged_in() ) {
        wp_redirect( home_url('/im-dashboard') );
        exit;
    }
    $categories = get_option('im_categories', []);
    ob_start(); ?>
    <div class="im-wrap">
        <div class="im-card im-card-wide">
            <div class="im-logo">✨</div>
            <h2 class="im-title">Create Your Account</h2>
            <p class="im-subtitle">Join our Influencer Marketplace</p>

            <!-- Account Type Toggle -->
            <div class="im-type-toggle">
                <button type="button" class="im-type-btn active" data-type="influencer" onclick="imSwitchType('influencer')">
                    <span class="im-type-icon">📸</span>
                    <span class="im-type-label">I'm an Influencer</span>
                    <span class="im-type-desc">I create content & promote brands</span>
                </button>
                <button type="button" class="im-type-btn" data-type="brand" onclick="imSwitchType('brand')">
                    <span class="im-type-icon">🏢</span>
                    <span class="im-type-label">I'm a Brand</span>
                    <span class="im-type-desc">I want to hire influencers</span>
                </button>
            </div>

            <div id="im-reg-msg" class="im-message" style="display:none;"></div>
            <form id="im-register-form">
                <input type="hidden" name="account_type" id="im_account_type" value="influencer" />

                <!-- Common Fields -->
                <div class="im-field-row">
                    <div class="im-field">
                        <label>First Name <span class="req">*</span></label>
                        <input type="text" name="first_name" placeholder="First Name" required />
                    </div>
                    <div class="im-field">
                        <label>Last Name <span class="req">*</span></label>
                        <input type="text" name="last_name" placeholder="Last Name" required />
                    </div>
                </div>
                <div class="im-field">
                    <label>Phone Number <span class="req">*</span></label>
                    <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" required />
                </div>
                <div class="im-field">
                    <label>Username <span class="req">*</span></label>
                    <input type="text" name="username" placeholder="Choose a unique username" required />
                </div>
                <div class="im-field">
                    <label>Email ID <span class="req">*</span></label>
                    <input type="email" name="email" placeholder="your@email.com" required />
                </div>
                <div class="im-field">
                    <label>Password <span class="req">*</span></label>
                    <div class="im-password-wrap">
                        <input type="password" name="password" id="im_reg_pwd" placeholder="Min. 8 characters" required />
                        <span class="im-eye" onclick="imTogglePass('im_reg_pwd')">👁</span>
                    </div>
                </div>

                <!-- Brand Extra Fields -->
                <div id="im-brand-fields" style="display:none;">
                    <div class="im-section-divider">🏢 Brand Details</div>
                    <div class="im-field">
                        <label>Brand / Company Name <span class="req">*</span></label>
                        <input type="text" name="company_name" placeholder="Your company name" />
                    </div>
                    <div class="im-field">
                        <label>GST Number</label>
                        <input type="text" name="gst_number" placeholder="22AAAAA0000A1Z5" />
                    </div>
                    <div class="im-field">
                        <label>Office Address <span class="req">*</span></label>
                        <textarea name="office_address" placeholder="Full office address" rows="3"></textarea>
                    </div>
                    <div class="im-field">
                        <label>Category Preference <span class="req">*</span></label>
                        <div class="im-category-grid">
                            <?php foreach ( $categories as $cat ) : ?>
                            <label class="im-cat-check">
                                <input type="checkbox" name="brand_categories[]" value="<?php echo esc_attr($cat); ?>" />
                                <span><?php echo esc_html($cat); ?></span>
                            </label>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <button type="submit" class="im-btn im-btn-primary" id="im-reg-btn">Create Account</button>
                <p class="im-center-link">Already have an account? <a href="<?php echo home_url('/im-login'); ?>">Login here</a></p>
            </form>
        </div>
    </div>
    <?php return ob_get_clean();
}

// ─── DASHBOARD ────────────────────────────────────────────────
add_shortcode( 'im_dashboard', 'im_render_dashboard' );
function im_render_dashboard() {
    if ( ! is_user_logged_in() ) {
        wp_redirect( home_url('/im-login') );
        exit;
    }
    $user    = wp_get_current_user();
    $type    = get_user_meta( $user->ID, 'account_type', true );
    ob_start(); ?>
    <div class="im-wrap">
        <div class="im-dashboard">
            <div class="im-dash-header">
                <div class="im-dash-avatar">
                    <?php echo get_avatar( $user->ID, 80 ); ?>
                </div>
                <div class="im-dash-info">
                    <h2>Welcome, <?php echo esc_html($user->display_name); ?>! 👋</h2>
                    <span class="im-badge im-badge-<?php echo esc_attr($type); ?>"><?php echo $type === 'influencer' ? '📸 Influencer' : '🏢 Brand'; ?></span>
                </div>
                <a href="<?php echo wp_logout_url( home_url('/im-login') ); ?>" class="im-btn im-btn-outline im-btn-sm">Logout</a>
            </div>

            <div class="im-dash-cards">
                <a href="<?php echo home_url('/im-profile'); ?>" class="im-dash-card">
                    <span class="im-dash-card-icon">👤</span>
                    <span class="im-dash-card-title">My Profile</span>
                    <span class="im-dash-card-desc">Update your details</span>
                </a>
                <?php if ( $type === 'influencer' ) : ?>
                <a href="<?php echo home_url('/im-search'); ?>" class="im-dash-card">
                    <span class="im-dash-card-icon">🔍</span>
                    <span class="im-dash-card-title">Find Brands</span>
                    <span class="im-dash-card-desc">Browse brand opportunities</span>
                </a>
                <?php else : ?>
                <a href="<?php echo home_url('/im-search'); ?>" class="im-dash-card">
                    <span class="im-dash-card-icon">🔍</span>
                    <span class="im-dash-card-title">Find Influencers</span>
                    <span class="im-dash-card-desc">Search & filter by category</span>
                </a>
                <?php endif; ?>
                <div class="im-dash-card">
                    <span class="im-dash-card-icon">📊</span>
                    <span class="im-dash-card-title">Analytics</span>
                    <span class="im-dash-card-desc">Coming in Phase 2</span>
                </div>
            </div>
        </div>
    </div>
    <?php return ob_get_clean();
}

// ─── PROFILE FORM ────────────────────────────────────────────
add_shortcode( 'im_profile_form', 'im_render_profile_form' );
function im_render_profile_form() {
    if ( ! is_user_logged_in() ) {
        wp_redirect( home_url('/im-login') );
        exit;
    }
    global $wpdb;
    $user    = wp_get_current_user();
    $type    = get_user_meta( $user->ID, 'account_type', true );
    $categories = get_option('im_categories', []);

    if ( $type === 'influencer' ) {
        $profile = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}im_influencer_profiles WHERE user_id = %d", $user->ID ) );
    } else {
        $profile = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}im_brand_profiles WHERE user_id = %d", $user->ID ) );
    }

    $saved_cats = [];
    if ( $profile ) {
        $cat_string = '';
        if ( $type === 'influencer' && isset($profile->categories) ) {
            $cat_string = $profile->categories;
        } elseif ( $type === 'brand' && isset($profile->category_preference) ) {
            $cat_string = $profile->category_preference;
        }
        $saved_cats = $cat_string ? explode(',', $cat_string) : [];
    }

    ob_start(); ?>
    <div class="im-wrap">
        <div class="im-card im-card-wide">
            <h2 class="im-title"><?php echo $type === 'influencer' ? '📸 Influencer Profile' : '🏢 Brand Profile'; ?></h2>
            <div id="im-profile-msg" class="im-message" style="display:none;"></div>
            <form id="im-profile-form">
                <input type="hidden" name="account_type" value="<?php echo esc_attr($type); ?>" />

                <?php if ( $type === 'influencer' ) : ?>

                <div class="im-field-row">
                    <div class="im-field">
                        <label>Date of Birth</label>
                        <input type="date" name="dob" value="<?php echo esc_attr($profile->dob ?? ''); ?>" />
                    </div>
                    <div class="im-field">
                        <label>Gender</label>
                        <select name="gender">
                            <option value="">Select Gender</option>
                            <option value="male" <?php selected($profile->gender ?? '', 'male'); ?>>Male</option>
                            <option value="female" <?php selected($profile->gender ?? '', 'female'); ?>>Female</option>
                            <option value="other" <?php selected($profile->gender ?? '', 'other'); ?>>Other</option>
                        </select>
                    </div>
                </div>

                <div class="im-field">
                    <label>Location / City</label>
                    <input type="text" name="location" placeholder="e.g. Mumbai, Delhi" value="<?php echo esc_attr($profile->location ?? ''); ?>" />
                </div>

                <div class="im-field">
                    <label>Categories</label>
                    <div class="im-category-grid">
                        <?php foreach ( $categories as $cat ) : ?>
                        <label class="im-cat-check">
                            <input type="checkbox" name="categories[]" value="<?php echo esc_attr($cat); ?>" <?php checked( in_array($cat, $saved_cats) ); ?> />
                            <span><?php echo esc_html($cat); ?></span>
                        </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="im-section-divider">📱 Social Media</div>
                <div class="im-field-row">
                    <div class="im-field">
                        <label>Instagram URL</label>
                        <input type="url" name="instagram_url" placeholder="https://instagram.com/yourhandle" value="<?php echo esc_attr($profile->instagram_url ?? ''); ?>" />
                    </div>
                    <div class="im-field">
                        <label>Instagram Followers</label>
                        <input type="number" name="instagram_followers" placeholder="e.g. 50000" value="<?php echo esc_attr($profile->instagram_followers ?? ''); ?>" />
                    </div>
                </div>
                <div class="im-field-row">
                    <div class="im-field">
                        <label>YouTube URL</label>
                        <input type="url" name="youtube_url" placeholder="https://youtube.com/@yourchannel" value="<?php echo esc_attr($profile->youtube_url ?? ''); ?>" />
                    </div>
                    <div class="im-field">
                        <label>YouTube Subscribers</label>
                        <input type="number" name="youtube_subscribers" placeholder="e.g. 10000" value="<?php echo esc_attr($profile->youtube_subscribers ?? ''); ?>" />
                    </div>
                </div>
                <div class="im-field">
                    <label>TikTok / Other URL (Optional)</label>
                    <input type="url" name="tiktok_url" placeholder="https://tiktok.com/@yourhandle" value="<?php echo esc_attr($profile->tiktok_url ?? ''); ?>" />
                </div>

                <div class="im-section-divider">💰 Pricing</div>
                <div class="im-field">
                    <label>Promotion Charges (₹ per post)</label>
                    <input type="number" name="charges" placeholder="e.g. 5000" value="<?php echo esc_attr($profile->charges ?? ''); ?>" />
                </div>

                <div class="im-field">
                    <label>Bio / About You</label>
                    <textarea name="bio" rows="4" placeholder="Tell brands about yourself..."><?php echo esc_textarea($profile->bio ?? ''); ?></textarea>
                </div>

                <?php else : // BRAND ?>

                <div class="im-field">
                    <label>Brand / Company Name <span class="req">*</span></label>
                    <input type="text" name="company_name" placeholder="Your company name" value="<?php echo esc_attr($profile->company_name ?? ''); ?>" required />
                </div>
                <div class="im-field-row">
                    <div class="im-field">
                        <label>GST Number</label>
                        <input type="text" name="gst_number" placeholder="22AAAAA0000A1Z5" value="<?php echo esc_attr($profile->gst_number ?? ''); ?>" />
                    </div>
                    <div class="im-field">
                        <label>Phone Number</label>
                        <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value="<?php echo esc_attr($profile->phone ?? ''); ?>" />
                    </div>
                </div>
                <div class="im-field">
                    <label>Office Address</label>
                    <textarea name="office_address" rows="3" placeholder="Full office address"><?php echo esc_textarea($profile->office_address ?? ''); ?></textarea>
                </div>
                <div class="im-field">
                    <label>Website (Optional)</label>
                    <input type="url" name="website" placeholder="https://yourbrand.com" value="<?php echo esc_attr($profile->website ?? ''); ?>" />
                </div>
                <div class="im-field">
                    <label>Category Preference (What type of influencers do you need?)</label>
                    <div class="im-category-grid">
                        <?php foreach ( $categories as $cat ) : ?>
                        <label class="im-cat-check">
                            <input type="checkbox" name="brand_categories[]" value="<?php echo esc_attr($cat); ?>" <?php checked( in_array($cat, $saved_cats) ); ?> />
                            <span><?php echo esc_html($cat); ?></span>
                        </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <?php endif; ?>

                <button type="submit" class="im-btn im-btn-primary">Save Profile</button>
                <a href="<?php echo home_url('/im-dashboard'); ?>" class="im-btn im-btn-outline">Back to Dashboard</a>
            </form>
        </div>
    </div>
    <?php return ob_get_clean();
}

// ─── SEARCH ───────────────────────────────────────────────────
add_shortcode( 'im_search', 'im_render_search' );
function im_render_search() {
    $categories = get_option('im_categories', []);
    ob_start(); ?>
    <div class="im-wrap">
        <div class="im-search-section">
            <h2 class="im-title">🔍 Find Influencers</h2>
            <div class="im-search-filters">
                <select id="filter_category">
                    <option value="">All Categories</option>
                    <?php foreach ( $categories as $cat ) : ?>
                    <option value="<?php echo esc_attr($cat); ?>"><?php echo esc_html($cat); ?></option>
                    <?php endforeach; ?>
                </select>
                <input type="text" id="filter_location" placeholder="Location (e.g. Mumbai)" />
                <input type="number" id="filter_min_followers" placeholder="Min Followers" />
                <input type="number" id="filter_max_charges" placeholder="Max Budget (₹)" />
                <button onclick="imSearchInfluencers()" class="im-btn im-btn-primary">Search</button>
            </div>
            <div id="im-search-results" class="im-results-grid">
                <p class="im-loading">Click Search to find influencers...</p>
            </div>
        </div>
    </div>
    <?php return ob_get_clean();
}

// ─── HOME HERO ────────────────────────────────────────────────
add_shortcode( 'im_home_hero', 'im_render_home_hero' );
function im_render_home_hero() {
    $categories = get_option('im_categories', []);
    ob_start(); ?>
    <div class="im-hero-section">
        <div class="im-hero-content">
            <h1 class="im-hero-title">Find & Hire Top Influencers <span>Instantly</span></h1>
            <p class="im-hero-subtitle">Connect with thousands of authentic creators and elevate your brand's reach. Search by location, category, and audience size.</p>
            <div class="im-hero-search-box">
                <form action="<?php echo home_url('/im-search'); ?>" method="GET" class="im-hero-form">
                    <div class="im-hero-input-group">
                        <span class="im-hero-icon">🏷️</span>
                        <select name="category" class="im-hero-select">
                            <option value="">All Categories</option>
                            <?php foreach ( $categories as $cat ) : ?>
                            <option value="<?php echo esc_attr($cat); ?>"><?php echo esc_html($cat); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="im-hero-input-group">
                        <span class="im-hero-icon">📍</span>
                        <input type="text" name="location" placeholder="Location (e.g. Mumbai)" />
                    </div>
                    <button type="submit" class="im-btn im-btn-primary im-hero-btn">Search Now</button>
                </form>
            </div>
            <div class="im-hero-stats">
                <div class="im-stat"><strong>5,000+</strong> Creators</div>
                <div class="im-stat"><strong>2,000+</strong> Brands</div>
                <div class="im-stat"><strong>100%</strong> Secure</div>
            </div>
        </div>
    </div>
    <?php return ob_get_clean();
}

// ─── TOP INFLUENCERS ──────────────────────────────────────────
add_shortcode( 'im_top_influencers', 'im_render_top_influencers' );
function im_render_top_influencers( $atts ) {
    $a = shortcode_atts( [
        'limit'    => 4,
        'category' => '',
    ], $atts );

    global $wpdb;
    $where = "WHERE 1=1";
    if ( $a['category'] ) {
        $where .= $wpdb->prepare(" AND p.categories LIKE %s", '%' . $wpdb->esc_like($a['category']) . '%');
    }

    $results = $wpdb->get_results( $wpdb->prepare("
        SELECT p.*, u.display_name
        FROM {$wpdb->prefix}im_influencer_profiles p
        JOIN {$wpdb->users} u ON p.user_id = u.ID
        $where
        ORDER BY p.instagram_followers DESC
        LIMIT %d
    ", intval($a['limit'])) );

    if ( empty($results) ) return '<p class="im-no-results">No influencers found.</p>';

    ob_start(); ?>
    <div class="im-top-influencers-wrap">
        <h2 class="im-section-heading">Trending <?php echo esc_html($a['category'] ? $a['category'] . ' ' : ''); ?>Creators</h2>
        <div class="im-results-grid">
            <?php foreach ( $results as $r ) : 
                $avatar = get_avatar_url($r->user_id, ['size' => 120]);
                $cats = implode(', ', array_filter(explode(',', $r->categories)));
            ?>
            <div class="im-influencer-card im-premium-card">
                <div class="im-card-banner"></div>
                <img src="<?php echo esc_url($avatar); ?>" alt="Avatar" class="im-inf-avatar" />
                <h3><?php echo esc_html($r->display_name); ?></h3>
                <?php if ( $cats ) echo '<p class="im-inf-cats">🏷️ ' . esc_html($cats) . '</p>'; ?>
                <?php if ( $r->location ) echo '<p class="im-inf-location">📍 ' . esc_html($r->location) . '</p>'; ?>
                
                <div class="im-inf-metrics">
                    <div class="im-metric">
                        <span class="im-metric-icon">📸</span>
                        <span class="im-metric-val"><?php echo number_format($r->instagram_followers); ?></span>
                    </div>
                    <?php if ( $r->youtube_subscribers > 0 ) : ?>
                    <div class="im-metric">
                        <span class="im-metric-icon">▶️</span>
                        <span class="im-metric-val"><?php echo number_format($r->youtube_subscribers); ?></span>
                    </div>
                    <?php endif; ?>
                </div>
                
                <?php if ( $r->charges > 0 ) echo '<p class="im-inf-charge">💰 ₹' . number_format($r->charges) . ' / post</p>'; ?>
                <a href="<?php echo home_url('/im-search'); ?>" class="im-btn im-btn-outline im-btn-sm im-mt-3">View Profile</a>
            </div>
            <?php endforeach; ?>
        </div>
        <div class="im-view-all-wrap">
            <a href="<?php echo home_url('/im-search' . ($a['category'] ? '?category='.urlencode($a['category']) : '')); ?>" class="im-btn im-btn-primary im-btn-inline">Explore All <?php echo esc_html($a['category']); ?> Creators &rarr;</a>
        </div>
    </div>
    <?php return ob_get_clean();
}

// ─── TOP BRANDS ───────────────────────────────────────────────
add_shortcode( 'im_top_brands', 'im_render_top_brands' );
function im_render_top_brands( $atts ) {
    $a = shortcode_atts( [
        'limit' => 4,
    ], $atts );

    global $wpdb;
    $results = $wpdb->get_results( $wpdb->prepare("
        SELECT *
        FROM {$wpdb->prefix}im_brand_profiles
        WHERE company_name != ''
        ORDER BY id DESC
        LIMIT %d
    ", intval($a['limit'])) );

    if ( empty($results) ) return '';

    ob_start(); ?>
    <div class="im-top-brands-wrap">
        <h2 class="im-section-heading">Explore Top Brands</h2>
        <div class="im-brands-grid">
            <?php foreach ( $results as $r ) : ?>
            <div class="im-brand-card">
                <div class="im-brand-icon">🏢</div>
                <h3 class="im-brand-name"><?php echo esc_html($r->company_name); ?></h3>
                <?php if ( $r->category_preference ) : ?>
                <p class="im-brand-req">Looking for: <span><?php echo esc_html(str_replace(',', ', ', $r->category_preference)); ?></span></p>
                <?php endif; ?>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php return ob_get_clean();
}
