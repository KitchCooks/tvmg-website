<?php
/**
 * Yoco webhook receiver.
 *
 * Register this URL in the Yoco portal (Webhooks):
 *   https://boring.tvmg.co.za/api/webhook.php
 *
 * On a successful payment it logs the order and emails you the buyer's name and
 * email so their campus access can be granted. Always returns 200 quickly so
 * Yoco does not retry a message we have already stored.
 */

$rawBody = file_get_contents('php://input');

/* ---- config ---- */
$candidates = [
    dirname(__DIR__, 4) . '/tvmg-secrets/yoco.php',
    dirname(__DIR__, 3) . '/tvmg-secrets/yoco.php',
    __DIR__ . '/config.php',
];
$cfg = [];
foreach ($candidates as $path) {
    if (is_readable($path)) { $cfg = require $path; break; }
}

/* ---- signature check (skipped if no webhook secret is configured yet) ---- */
$verified = null;
$secret = $cfg['webhook_secret'] ?? '';
if ($secret !== '') {
    $id   = $_SERVER['HTTP_WEBHOOK_ID']        ?? '';
    $ts   = $_SERVER['HTTP_WEBHOOK_TIMESTAMP'] ?? '';
    $sigH = $_SERVER['HTTP_WEBHOOK_SIGNATURE'] ?? '';

    $key      = base64_decode(substr($secret, strlen('whsec_')));
    $expected = base64_encode(hash_hmac('sha256', "$id.$ts.$rawBody", $key, true));

    $verified = false;
    foreach (preg_split('/\s+/', trim($sigH)) as $part) {
        $val = strpos($part, ',') !== false ? substr($part, strpos($part, ',') + 1) : $part;
        if ($val !== '' && hash_equals($expected, $val)) { $verified = true; break; }
    }
    if (!$verified) {
        http_response_code(401);
        error_log('Yoco webhook: bad signature');
        echo 'invalid signature';
        exit;
    }
}

/* ---- handle the event ---- */
$event = json_decode($rawBody, true) ?: [];
$type  = $event['type'] ?? '';
$p     = $event['payload'] ?? [];
$meta  = $p['metadata'] ?? [];

$record = [
    'at'       => gmdate('c'),
    'stage'    => $type ?: 'unknown_event',
    'verified' => $verified,
    'id'       => $p['id'] ?? ($event['id'] ?? null),
    'amount'   => $p['amount'] ?? null,
    'currency' => $p['currency'] ?? null,
    'name'     => $meta['buyerName']  ?? null,
    'email'    => $meta['buyerEmail'] ?? null,
];
@file_put_contents(__DIR__ . '/orders.log', json_encode($record) . PHP_EOL, FILE_APPEND | LOCK_EX);

if ($type === 'payment.succeeded') {
    $to   = $cfg['notify_email'] ?? 'hello@tvmg.co.za';
    $rand = number_format((int)($record['amount'] ?? 0) / 100, 2);
    $subject = 'BBS purchase: ' . ($record['email'] ?: 'unknown buyer');
    $lines = [
        'A Boring Business School purchase succeeded.',
        '',
        'Name:      ' . ($record['name']  ?: 'not supplied'),
        'Email:     ' . ($record['email'] ?: 'not supplied'),
        'Amount:    R' . $rand,
        'Payment:   ' . ($record['id'] ?: 'unknown'),
        'Time:      ' . $record['at'] . ' UTC',
        '',
        'Grant campus access to this email address.',
    ];
    @mail($to, $subject, implode("\n", $lines),
          "From: BBS Payments <no-reply@tvmg.co.za>\r\nContent-Type: text/plain; charset=utf-8");
}

http_response_code(200);
echo 'ok';
