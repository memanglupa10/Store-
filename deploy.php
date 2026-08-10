<?php
/**
 * Babyiel Store - cPanel Auto Sync & Deploy Script
 * Access via: https://babyielstore.my.id/deploy.php
 */
header('Content-Type: text/plain');

echo "===============================================\n";
echo "   Babyiel Store - cPanel Deploy Engine        \n";
echo "===============================================\n\n";

$repoPath = '/home/babyiels/store';
$publicPath = '/home/babyiels/public_html';

if (file_exists($repoPath)) {
    echo "[1/4] Discarding local changes & pulling from GitHub...\n";
    $gitCmd = "cd " . escapeshellarg($repoPath) . " && git reset --hard HEAD && git pull origin main 2>&1";
    $gitOutput = shell_exec($gitCmd);
    echo $gitOutput . "\n";

    if (file_exists($publicPath) && $publicPath !== $repoPath) {
        echo "[2/4] Copying updated files to public_html...\n";
        $cpCmd = "cp -rf " . escapeshellarg($repoPath) . "/* " . escapeshellarg($publicPath) . "/ 2>&1";
        $cpOutput = shell_exec($cpCmd);
        echo ($cpOutput ? $cpOutput : "Files copied successfully.") . "\n";
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
