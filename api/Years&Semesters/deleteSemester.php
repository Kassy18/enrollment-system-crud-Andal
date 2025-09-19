<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['sem_id']) || !is_numeric($_POST['sem_id'])) {
throw new Exception("Invalid semester ID.");
}

$sem_id = $_POST['sem_id'];

// Check if any subjects are associated with the semester (foreign key constraint)
$stmt = $connection->prepare("SELECT COUNT(*) FROM subject_tbl WHERE semester_id = ?");
$stmt->execute([$sem_id]);
$subjectCount = $stmt->fetchColumn();

if ($subjectCount > 0) {
throw new Exception("Cannot delete semester. Subjects are associated with it.");
}

// Prepare and execute the delete statement
$stmt = $pdo->prepare("DELETE FROM semester_tbl WHERE sem_id = ?");
if ($stmt->execute([$sem_id])) {
if ($stmt->rowCount() > 0) {
echo json_encode(['success' => true, 'message' => 'Semester deleted successfully']);
} else {
echo json_encode(['success' => false, 'message' => 'Semester not found']);
}
} else {
throw new Exception("Failed to delete semester.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to delete semester',
'error' => $e->getMessage()
]);
}
?>
