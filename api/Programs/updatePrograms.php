<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['program_id']) || !is_numeric($_POST['program_id'])) {
throw new Exception("Invalid program ID.");
}

if (!isset($_POST['program_name']) || empty($_POST['program_name'])) {
throw new Exception("Program name is required.");
}

if (!isset($_POST['ins_id']) || !is_numeric($_POST['ins_id'])) {
throw new Exception("Invalid institute ID.");
}

$program_id = $_POST['program_id'];
$program_name = $_POST['program_name'];
$ins_id = $_POST['ins_id'];

// Prepare and execute the update statement
$stmt = $pdo->prepare("
UPDATE program_tbl
SET program_name = ?, ins_id = ?
WHERE program_id = ?
");

if ($stmt->execute([$program_name, $ins_id, $program_id])) {
if ($stmt->rowCount() > 0) {
echo json_encode(['success' => true, 'message' => 'Program updated successfully']);
} else {
echo json_encode(['success' => false, 'message' => 'Program not found or no changes made']);
}
} else {
throw new Exception("Failed to update program.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to update program',
'error' => $e->getMessage()
]);
}
?>