// Influencer Marketplace – Frontend JS

jQuery(function($) {

    // ── Toggle Password Visibility ─────────────────────────
    window.imTogglePass = function(id) {
        const el = document.getElementById(id);
        el.type = el.type === 'password' ? 'text' : 'password';
    };

    // ── Switch between Influencer / Brand on register ──────
    window.imSwitchType = function(type) {
        document.getElementById('im_account_type').value = type;
        document.querySelectorAll('.im-type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        const brandFields = document.getElementById('im-brand-fields');
        if (brandFields) {
            brandFields.style.display = type === 'brand' ? 'block' : 'none';
        }
    };

    // ── Show Message Helper ────────────────────────────────
    function imShowMsg(msgId, text, isError) {
        const el = $('#' + msgId);
        el.removeClass('success error')
          .addClass(isError ? 'error' : 'success')
          .html(text)
          .slideDown(200);
        $('html, body').animate({ scrollTop: el.offset().top - 100 }, 400);
    }

    // ── LOGIN FORM ─────────────────────────────────────────
    $('#im-login-form').on('submit', function(e) {
        e.preventDefault();
        const btn = $('#im-login-btn');
        btn.text('Logging in...').prop('disabled', true);
        $.post(IM_AJAX.ajax_url, {
            action: 'im_login',
            nonce:  IM_AJAX.nonce,
            log:    $('[name="log"]').val(),
            pwd:    $('[name="pwd"]').val(),
        }).done(function(res) {
            if (res.success) {
                imShowMsg('im-login-msg', '✅ Login successful! Redirecting...', false);
                setTimeout(() => window.location.href = res.data.redirect, 1000);
            } else {
                imShowMsg('im-login-msg', '❌ ' + res.data.message, true);
                btn.text('Login').prop('disabled', false);
            }
        }).fail(function() {
            imShowMsg('im-login-msg', '❌ Something went wrong. Please try again.', true);
            btn.text('Login').prop('disabled', false);
        });
    });

    // ── REGISTER FORM ──────────────────────────────────────
    $('#im-register-form').on('submit', function(e) {
        e.preventDefault();
        const btn = $('#im-reg-btn');
        const formData = $(this).serialize();
        btn.text('Creating account...').prop('disabled', true);
        $.post(IM_AJAX.ajax_url, {
            action: 'im_register',
            nonce:  IM_AJAX.nonce,
        } + '&' + formData.replace('action=&', ''), function() {})
        .done(function(){}) // dummy to prevent conflict
        .fail(function(){});

        // Use proper FormData for checkboxes
        const data = new FormData(document.getElementById('im-register-form'));
        data.append('action', 'im_register');
        data.append('nonce', IM_AJAX.nonce);

        $.ajax({
            url: IM_AJAX.ajax_url,
            type: 'POST',
            data: data,
            processData: false,
            contentType: false,
            success: function(res) {
                if (res.success) {
                    imShowMsg('im-reg-msg', '🎉 Account created! Redirecting to your profile...', false);
                    setTimeout(() => window.location.href = res.data.redirect, 1200);
                } else {
                    imShowMsg('im-reg-msg', '❌ ' + res.data.message, true);
                    btn.text('Create Account').prop('disabled', false);
                }
            },
            error: function() {
                imShowMsg('im-reg-msg', '❌ Something went wrong. Please try again.', true);
                btn.text('Create Account').prop('disabled', false);
            }
        });

        // Remove the incorrectly triggered post above
        return false;
    });

    // Fix double submit issue – use only FormData version
    $('#im-register-form').off('submit').on('submit', function(e) {
        e.preventDefault();
        const btn = $('#im-reg-btn');
        btn.text('Creating account...').prop('disabled', true);
        const data = new FormData(this);
        data.append('action', 'im_register');
        data.append('nonce', IM_AJAX.nonce);
        $.ajax({
            url: IM_AJAX.ajax_url,
            type: 'POST',
            data: data,
            processData: false,
            contentType: false,
            success: function(res) {
                if (res.success) {
                    imShowMsg('im-reg-msg', '🎉 Account created! Redirecting to your profile...', false);
                    setTimeout(() => window.location.href = res.data.redirect, 1200);
                } else {
                    imShowMsg('im-reg-msg', '❌ ' + res.data.message, true);
                    btn.text('Create Account').prop('disabled', false);
                }
            },
            error: function() {
                imShowMsg('im-reg-msg', '❌ Something went wrong. Please try again.', true);
                btn.text('Create Account').prop('disabled', false);
            }
        });
    });

    // ── PROFILE FORM ───────────────────────────────────────
    $('#im-profile-form').on('submit', function(e) {
        e.preventDefault();
        const btn = $(this).find('button[type="submit"]');
        btn.text('Saving...').prop('disabled', true);
        const data = new FormData(this);
        data.append('action', 'im_save_profile');
        data.append('nonce', IM_AJAX.nonce);
        $.ajax({
            url: IM_AJAX.ajax_url,
            type: 'POST',
            data: data,
            processData: false,
            contentType: false,
            success: function(res) {
                if (res.success) {
                    imShowMsg('im-profile-msg', '✅ ' + res.data.message, false);
                } else {
                    imShowMsg('im-profile-msg', '❌ ' + (res.data.message || 'Error saving profile.'), true);
                }
                btn.text('Save Profile').prop('disabled', false);
            },
            error: function() {
                imShowMsg('im-profile-msg', '❌ Something went wrong.', true);
                btn.text('Save Profile').prop('disabled', false);
            }
        });
    });

    // ── SEARCH INFLUENCERS ─────────────────────────────────
    window.imSearchInfluencers = function() {
        const results = $('#im-search-results');
        results.html('<p class="im-loading">🔍 Searching...</p>');
        $.post(IM_AJAX.ajax_url, {
            action:        'im_search_influencers',
            nonce:         IM_AJAX.nonce,
            category:      $('#filter_category').val(),
            location:      $('#filter_location').val(),
            min_followers: $('#filter_min_followers').val(),
            max_charges:   $('#filter_max_charges').val(),
        }, function(res) {
            if (res.success) {
                results.html(res.data.html);
            } else {
                results.html('<p class="im-no-results">❌ An error occurred. Please try again.</p>');
            }
        });
    };

});
