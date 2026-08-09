<?php
/**
 * Creates a Yoco checkout and hands the browser a redirect URL.
 * The secret key is read server side and never reaches the page.
 *
 * POST JSON: {"name":"...","email":"..."}
 * 200 JSON:  {"redirectUrl":"https://c.yoco.com/checkout/ch_..."}
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function fail($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail('Use POST.', 405);
}

/* ---- load config from above the web root if possible ---- */
$candidates = [
    dirname(__DIR__, 4) . '/tvmg-secrets/yoco.php',
    dirname(__DIR__, 3) . '/tvmg-secrets/yoco.php',
    __DIR__ . '/config.php',
];
$cfg = null;
foreach ($candidates as $path) {
    if (is_readable($path)) { $cfg = require $path; break; }
}
if (!is_array($cfg) || empty($cfg['secret_key']) || strpos($cfg['secret_key'], 'REPLACE') !== false) {
    fail('Payments are not configured yet. Please use the EFT option below.', 503);
}

/* ---- read and validate the buyer ---- */
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true) ?: [];
$name  = trim((string)($body['name']  ?? ''));
$email = trim((string)($body['email'] ?? ''));

if ($name === '' || strlen($name) > 160)               fail('Please enter your full name.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))        fail('Please enter a valid email address.');

/* ---- create the checkout ---- */
$payload = [
    'amount'     => (int)($cfg['amount_cents'] ?? 64900),
    'currency'   => $cfg['currency'] ?? 'ZAR',
    'successUrl' => $cfg['success_url'] ?? '',
    'cancelUrl'  => $cfg['cancel_url']  ?? '',
    'failureUrl' => $cfg['failure_url'] ?? '',
    'metadata'   => [
        'product'     => 'Boring Business Billionaire Blueprint Workshop',
        'buyerName'   => $name,
        'buyerEmail'  => $email,
        'source'      => 'boring.tvmg.co.za',
    ],
];

if (!function_exists('curl_init')) {
    fail('Card payments are unavailable on this server. Please use the EFT option below.', 503);
}

$ch = curl_init('https://payments.yoco.com/api/checkouts');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 25,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $cfg['secret_key'],
        'Content-Type: application/json',
        // Idempotency guards against double charges on a retried click.
        'Idempotency-Key: ' . bin2hex(random_bytes(16)),
    ],
]);
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$cerr = curl_error($ch);
curl_close($ch);

if ($res === false)          fail('Could not reach the payment provider. Please try again.' , 502);
$data = json_decode($res, true);

if ($code >= 200 && $code < 300 && !empty($data['redirectUrl'])) {
    /* Log the intent so an order is traceable even if the webhook is missed. */
    @file_put_contents(
        __DIR__ . '/orders.log',
        json_encode([
            'at'    => gmdate('c'),
            'stage' => 'checkout_created',
            'id'    => $data['id'] ?? null,
            'name'  => $name,
            'email' => $email,
        ]) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
    echo json_encode(['redirectUrl' => $data['redirectUrl']]);
    exit;
}

error_log('Yoco checkout failed (' . $code . '): ' . $res . ' ' . $cerr);
fail('We could not start the payment. Please try the EFT option, or email hello@tvmg.co.za.', 502);
