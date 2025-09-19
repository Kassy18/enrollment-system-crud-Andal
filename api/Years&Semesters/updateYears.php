<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
// Validate input
if (!isset($_POST['year_id']) || !is_numeric($_POST['year_id'])) {
throw new Exception("Invalid year ID.");
}

if (!isset($_POST['year_from']) || empty($_POST['year_from'])) {
throw new Exception("Year from is required.");
}

if (!isset($_POST['year_to']) || empty($_POST['year_to'])) {
throw new Exception("Year to is required.");
}

$year_id = $_POST['year_id'];
$year_from = $_POST['year_from'];
$year_to = $_POST['year_to'];

// Prepare and execute the update statement
$stmt = $pdo->prepare("
UPDATE year_tbl
SET year_from = ?, year_to = ?
WHERE year_id = ?
");

if ($stmt->execute([$year_from, $year_to, $year_id])) {
if ($stmt->rowCount() > 0) {
echo json_encode(['success' => true, 'message' => 'Year updated successfully']);
} else {
echo json_encode(['success' => false, 'message' => 'Year not found or no changes made']);
}
} else {
throw new Exception("Failed to update year.");
}

} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to update year',
'error' => $e->getMessage()
]);
}
?>