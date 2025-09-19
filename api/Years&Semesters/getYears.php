<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
$stmt = $pdo->query("
SELECT y.year_id, y.year_from, y.year_to
FROM year_tbl y
LEFT JOIN semester_tbl s ON y.year_id = s.year_id
");
$years = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'data' => $years]);
} catch (Exception $e) {
echo json_encode([
'success' => false,
'message' => 'Failed to fetch years',
'error' => $e->getMessage()
]);
}

?>