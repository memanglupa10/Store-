<?php
/**
 * Babyiel Store - cPanel Auto Sync & Deploy Script
 * Access via: https://babyielstore.my.id/deploy.php
 */
header('Content-Type: text/plain');

echo "===============================================\n";
echo "   Babyiel Store - cPanel Deploy Engine        \n";
echo "===============================================\n\n";

$repoPath = '/home/babyiels/repositories/Store-';
if (!file_exists($repoPath)) {
    $repoPath = '/home/babyiels/store';
}
$publicPath = '/home/babyiels/public_html';

function runCmd($cmd) {
    $fullCmd = "export PATH=\$PATH:/usr/bin:/usr/local/bin:/bin; " . $cmd . " 2>&1";
    if (function_exists('shell_exec')) {
        $out = shell_exec($fullCmd);
        if ($out !== null && trim($out) !== '') return trim($out);
    }
    if (function_exists('exec')) {
        $output = [];
        $returnVar = 0;
        @exec($fullCmd, $output, $returnVar);
        if (!empty($output)) return implode("\n", $output);
    }
    if (function_exists('system')) {
        ob_start();
        @system($fullCmd);
        $out = ob_get_clean();
        if (trim($out) !== '') return trim($out);
    }
    return "[ERROR] System execution functions (shell_exec/exec/system) disabled or returned empty output.";
}

if (file_exists($repoPath)) {
    echo "Using Repository Path: $repoPath\n\n";
    
    echo "[1/4] Discarding local changes & pulling from GitHub...\n";
    $gitCmd = "cd " . escapeshellarg($repoPath) . " && git reset --hard HEAD && git pull origin main";
    $gitOutput = runCmd($gitCmd);
    echo $gitOutput . "\n\n";

    if (file_exists($publicPath) && $publicPath !== $repoPath) {
        echo "[2/4] Copying updated files to public_html...\n";
        $cpCmd = "cp -rf " . escapeshellarg($repoPath) . "/* " . escapeshellarg($publicPath) . "/";
        $cpOutput = runCmd($cpCmd);
        echo ($cpOutput ? $cpOutput : "Files copied successfully.") . "\n\n";
    }

    echo "[3/4] Purging dummy stock data from database.json...\n";
    foreach ([$repoPath, $publicPath] as $dir) {
        $dbFile = $dir . '/data/database.json';
        if (file_exists($dbFile)) {
            $jsonStr = file_get_contents($dbFile);
            $dbData = json_decode($jsonStr, true);
            if (is_array($dbData)) {
                $dbData['stocks'] = [];
                $dbData['orders'] = [];
                file_put_contents($dbFile, json_encode($dbData, JSON_PRETTY_PRINT));
                echo "Wiped stocks in $dbFile\n";
            }
        }
    }
    echo "\n";

    echo "[4/4] Restarting Node.js App Server (Passenger)...\n";
    @mkdir($publicPath . '/tmp', 0755, true);
    @touch($publicPath . '/tmp/restart.txt');
    echo "Passenger restart.txt touched.\n\n";

    echo "===============================================\n";
    echo "Deployment & Stock Wipe Complete!             \n";
    echo "Refresh https://babyielstore.my.id             \n";
    echo "===============================================\n";
} else {
    echo "Error: Repository path not found at $repoPath\n";
}
?>
