# Yoco payments for boring.tvmg.co.za

Card payments run server side on Afrihost cPanel (PHP). The secret key never
reaches the browser. Verified working against Yoco's live API: a checkout
create returns HTTP 200 with a `redirectUrl`.

## Flow

```
Buyer clicks "Pay with card"
  -> modal collects name + email
  -> POST api/checkout.php          (server holds the secret key)
  -> Yoco returns a redirectUrl
  -> buyer pays on Yoco's hosted page
  -> Yoco returns them to success.html
  -> Yoco POSTs api/webhook.php     -> logs the order + emails you to grant access
```

If `api/checkout.php` is missing, unconfigured, or the provider is down, the
page falls back to showing the EFT details instead of a dead button.

## One-time setup

**1. Create the config file, above the web root.**
cPanel File Manager, in `/home/<your-cpanel-user>/` (the folder that *contains*
`public_html`, not inside it), create a folder `tvmg-secrets` and inside it a
file `yoco.php`. Paste `_config.sample.php` from this folder into it and fill in
your real values:

```php
<?php
return [
    'secret_key'     => 'sk_live_...',        // Yoco portal > Sell online > Integrations
    'amount_cents'   => 64900,                // R649.00
    'currency'       => 'ZAR',
    'success_url'    => 'https://boring.tvmg.co.za/success.html',
    'cancel_url'     => 'https://boring.tvmg.co.za/#pricing',
    'failure_url'    => 'https://boring.tvmg.co.za/#pricing?failed=1',
    'notify_email'   => 'hello@tvmg.co.za',
    'webhook_secret' => '',                   // fill in after step 2
];
```

Keeping it above `public_html` means it can never be served over the web, even
if PHP is misconfigured. If your host will not allow that, `api/config.php`
works too and the included `.htaccess` blocks direct access to it.

**2. Register the webhook.**
Yoco portal > Webhooks > add `https://boring.tvmg.co.za/api/webhook.php`.
Copy the signing secret it gives you (starts with `whsec_`) into
`webhook_secret` in the config. Until you do, orders are still logged and
emailed, just not signature-verified.

**3. Test with a real card.**
Buy the course yourself for R649, confirm you land on `success.html` and get the
notification email, then refund it from the Yoco portal. R649 is a cheap test of
a payment path you are about to run ads at.

## Where orders land

- `api/orders.log` (one JSON line per event, git-ignored, not web-accessible)
- An email to `notify_email` on every successful payment

Access is granted manually today: take the buyer's email from that notification
and whitelist it on the campus. Wiring the webhook straight into Moodle
enrolment is the obvious next step once the campus is settled.

## Security notes

- `config.php` and `orders.log` are git-ignored and blocked by `.htaccess`.
- The page only ever calls `api/checkout.php`. No key, public or secret, is in
  the HTML.
- Rotate the secret key in the Yoco portal if it has ever been pasted into a
  chat, an email, or a screenshot.
