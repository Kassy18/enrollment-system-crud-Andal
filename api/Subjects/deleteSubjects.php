<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['subject_id']) || !is_numeric($_POST['subject_id'])) {
throw new Exception("Invalid subject ID.");
}

$subject_id = $_POST['subject_id'];

// Check if any students are enrolled in the subject (foreign key constraint)
$stmt = $co->prepare("SELECT COUNT(*) FROM enrollment_tbl WHERE subject_id = ?");
$stmt->execute([$subject_id]);
$enrollmentCount = $stmt->fetchColumn();

if ($enrollmentCount > 0) {
throw new Exception("Cannot delete subject. Students are currently enrolled in it.");
}

// Prepare and execute the delete statement
$stmt = $pdo->prepare("DELETE FROM subject_tbl WHERE subject_id = ?");
if ($stmt->execute([$subject_id])) {
if ($stmt->rowCount() > 0) {
echo json_encode(['success' => true, 'message' => 'Subject deleted successfully']);
} else {
echo json_encode(['success' => false, 'message' => 'Subject not found']);
}
} else {
throw new Exception("Failed to delete subject.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to delete subject',
'error' => $e->getMessage()
]);
}
?>