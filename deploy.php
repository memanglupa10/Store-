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
    echo "[1/3] Discarding local changes & pulling from GitHub...\n";
    $gitCmd = "cd " . escapeshellarg($repoPath) . " && git reset --hard HEAD && git pull origin main 2>&1";
    $gitOutput = shell_exec($gitCmd);
    echo $gitOutput . "\n";

    if (file_exists($publicPath) && $publicPath !== $repoPath) {
        echo "[2/3] Copying updated files to public_html...\n";
        $cpCmd = "cp -rf " . escapeshellarg($repoPath) . "/* " . escapeshellarg($publicPath) . "/ 2>&1";
        $cpOutput = shell_exec($cpCmd);
        echo ($cpOutput ? $cpOutput : "Files copied successfully.") . "\n";
    }

    echo "[3/3] Deployment complete! Refresh https://babyielstore.my.id\n";
} else {
    echo "Error: Repository path not found at $repoPath\n";
}
?>
