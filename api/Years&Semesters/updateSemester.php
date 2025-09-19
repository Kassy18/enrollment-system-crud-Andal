<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['sem_id']) || !is_numeric($_POST['sem_id'])) {
throw new Exception("Invalid semester ID.");
}

if (!isset($_POST['sem_name']) || empty($_POST['sem_name'])) {
throw new Exception("Semester name is required.");
}

if (!isset($_POST['year_id']) || !is_numeric($_POST['year_id'])) {
throw new Exception("Invalid year ID.");
}

$sem_id = $_POST['sem_id'];
$sem_name = $_POST['sem_name'];
$year_id = $_POST['year_id'];

// Prepare and execute the update statement
$stmt = $pdo->prepare("
UPDATE semester_tbl
SET sem_name = ?, year_id = ?
WHERE sem_id = ?
");

if ($stmt->execute([$sem_name, $year_id, $sem_id])) {
if ($stmt->rowCount() > 0) {
echo json_encode(['success' => true, 'message' => 'Semester updated successfully']);
} else {
echo json_encode(['success' => false, 'message' => 'Semester not found or no changes made']);
}
} else {
throw new Exception("Failed to update semester.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to update semester',
'error' => $e->getMessage()
]);
}
?>