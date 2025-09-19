<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['subject_name']) || empty($_POST['subject_name'])) {
throw new Exception("Subject name is required.");
}

if (!isset($_POST['sem_id']) || !is_numeric($_POST['sem_id'])) {
throw new Exception("Invalid semester ID.");
}

$subject_name = $_POST['subject_name'];
$sem_id = $_POST['sem_id'];

// Prepare and execute the insert statement
$stmt = $pdo->prepare("
INSERT INTO subject_tbl (subject_name, sem_id)
VALUES (?, ?)
");

if ($stmt->execute([$subject_name, $sem_id])) {
echo json_encode(['success' => true, 'message' => 'Subject added successfully']);
} else {
throw new Exception("Failed to add subject.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to add subject',
'error' => $e->getMessage()
]);
}
?>