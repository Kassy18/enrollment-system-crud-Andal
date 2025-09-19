<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
$stmt = $pdo->query("SELECT subject_id, subject_name, sem_id FROM subject_tbl");
$subjects = $stmt->fetchAll();
echo json_encode(['success' => true, 'data' => $subjects]);
} catch (Exception $e) {
echo json_encode(['success' => false, 'message' => 'Failed to fetch subjects']);
}
?>
