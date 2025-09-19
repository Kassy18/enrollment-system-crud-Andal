<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['program_id']) || !is_numeric($_POST['program_id'])) {
throw new Exception("Invalid program ID.");
}

$program_id = $_POST['program_id'];

// Check if any students are enrolled in the program (foreign key constraint)
$stmt = $pdo->prepare("SELECT COUNT(*) FROM student_tbl WHERE program_id = ?");
$stmt->execute([$program_id]);
$studentCount = $stmt->fetchColumn();

if ($studentCount > 0) {
throw new Exception("Cannot delete program. Students are currently enrolled in it.");
}

// Prepare and execute the delete statement
$stmt = $pdo->prepare("DELETE FROM program_tbl WHERE program_id = ?");
if ($stmt->execute([$program_id])) {
if ($stmt->rowCount() > 0) {
echo json_encode(['success' => true, 'message' => 'Program deleted successfully']);
} else {
echo json_encode(['success' => false, 'message' => 'Program not found']);
}
} else {
throw new Exception("Failed to delete program.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to delete program',
'error' => $e->getMessage()
]);
}
?>