<?php
header('Content-Type: application/json');
require '../dbconnection.php';

$data = json_decode(file_get_contents('php://input'), true);
$program_id = intval($data['program_id'] ?? 0);
$program_name = trim($data['program_name'] ?? '');
$ins_id = intval($data['ins_id'] ?? 0);
$ins_name = floatval($data['ins_name'] ?? 0);

if ($program_id <= 0 || $program_name === '' || $ins_id <= 0) {
echo json_encode(['success' => false, 'message' => 'Program ID, Program Name and Institute are required']);
exit;
}

$check = $pdo->prepare("SELECT COUNT(*) FROM program_tbl WHERE program_id = ?");
$check->execute([$program_id]);
if ($check->fetchColumn() > 0) {
echo json_encode(['success' => false, 'message' => 'Program ID already exists']);
exit;
}

try {
$stmt = $pdo->prepare("INSERT INTO program_tbl (program_id, program_name, ins_id, ins_name) VALUES (?, ?, ?, ?)");
$stmt->execute([$program_id, $program_name, $ins_id, $ins_name]);
echo json_encode(['success' => true, 'message' => 'Program added successfully']);
} catch (Exception $e) {
echo json_encode(['success' => false, 'message' => 'Failed to add program']);
}

?>