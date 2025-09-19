<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['year_id']) || !is_numeric($_POST['year_id'])) {
throw new Exception("Invalid year ID.");
}

$year_id = $_POST['year_id'];

// Check if any semesters are associated with the year (foreign key constraint)
$stmt = $pdo->prepare("SELECT COUNT(*) FROM semester_tbl WHERE year_id = ?");
$stmt->execute([$year_id]);
$semesterCount = $stmt->fetchColumn();

if ($semesterCount > 0) {
throw new Exception("Cannot delete year. Semesters are associated with it.");
}

// Check if any subjects are associated with the year through semesters
$stmt = $pdo->prepare("SELECT COUNT(*) FROM subject_tbl s JOIN semester_tbl sem ON s.semester_id = sem.semester_id WHERE sem.year_id = ?");
$stmt->execute([$year_id]);
$subjectCount = $stmt->fetchColumn();

if ($subjectCount > 0) {
throw new Exception("Cannot delete year. Subjects are associated with it through semesters.");
}

// Prepare and execute the delete statement
$stmt = $pdo->prepare("DELETE FROM year_tbl WHERE year_id = ?");
if ($stmt->execute([$year_id])) {
if ($stmt->rowCount() > 0) {
echo json_encode(['success' => true, 'message' => 'Year deleted successfully']);
} else {
echo json_encode(['success' => false, 'message' => 'Year not found']);
}
} else {
throw new Exception("Failed to delete year.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to delete year',
'error' => $e->getMessage()
]);
}
?>