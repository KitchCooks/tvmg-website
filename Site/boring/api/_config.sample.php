<?php
/**
 * TVMG / Boring Business School - Yoco configuration TEMPLATE.
 *
 * DO NOT put real keys in this file. Copy it to a real config in ONE of these
 * locations (checkout.php checks them in this order):
 *
 *   1. /home/<cpanel-user>/tvmg-secrets/yoco.php   <-- preferred, above public_html
 *   2. <this folder>/config.php                    <-- fallback, works but less safe
 *
 * Create it with cPanel File Manager, paste your keys, save. Never commit it.
 */

return [
    // Yoco secret key: Yoco portal > Sell online > Integrations > API keys.
    // Starts with sk_live_ (or sk_test_ while you are testing).
    'secret_key' => 'sk_live_REPLACE_ME',

    // Price in CENTS. R649.00 = 64900.
    'amount_cents' => 64900,

    'currency' => 'ZAR',

    // Where Yoco sends the buyer after each outcome.
    // Must match the page that actually delivers login details after payment.
    // On the live VPS that is welcome.html, NOT success.html.
    'success_url' => 'https://boring.tvmg.co.za/welcome.html',
    'cancel_url'  => 'https://boring.tvmg.co.za/#pricing',
    'failure_url' => 'https://boring.tvmg.co.za/#pricing?failed=1',

    // Who gets told about a new order so access can be granted.
    'notify_email' => 'hello@tvmg.co.za',

    // Optional. Yoco portal > Webhooks. Starts with whsec_.
    // Leave empty and the webhook still records orders, just unverified.
    'webhook_secret' => '',
];
