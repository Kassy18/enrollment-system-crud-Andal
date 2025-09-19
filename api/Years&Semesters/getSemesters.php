<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
$stmt = $pdo->query("
SELECT s.sem_id, s.sem_name, s.year_id
FROM semester_tbl s
LEFT JOIN year_tbl y ON s.year_id = y.year_id
");
$semester = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'data' => $semester]);
} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to fetch semester',
'error' => $e->getMessage()
]);
}

?>
