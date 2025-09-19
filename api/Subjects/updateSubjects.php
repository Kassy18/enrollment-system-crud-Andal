<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['subject_id']) || !is_numeric($_POST['subject_id'])) {
throw new Exception("Invalid subject ID.");
}

if (!isset($_POST['subject_name']) || empty($_POST['subject_name'])) {
throw new Exception("Subject name is required.");
}

if (!isset($_POST['sem_id']) || !is_numeric($_POST['sem_id'])) {
throw new Exception("Invalid semester ID.");
}

$subject_id = $_POST['subject_id'];
$subject_name = $_POST['subject_name'];
$sem_id = $_POST['sem_id'];

// Prepare and execute the update statement
$stmt = $pdo->prepare("
UPDATE subject_tbl
SET subject_name = ?, sem_id = ?
WHERE subject_id = ?
");

if ($stmt->execute([$subject_name, $sem_id, $subject_id])) {
if ($stmt->rowCount() > 0) {
echo json_encode(['success' => true, 'message' => 'Subject updated successfully']);
} else {
echo json_encode(['success' => false, 'message' => 'Subject not found or no changes made']);
}
} else {
throw new Exception("Failed to update subject.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to update subject',
'error' => $e->getMessage()
]);
}
?>