<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
    
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['sem_name']) || !isset($data['year_id']) || !is_numeric($data['year_id'])) {
        throw new Exception("Semester name and valid year ID are required.");
    }

    $sem_name = trim($data['sem_name']);
    $year_id = intval($data['year_id']);

    // Prepare and execute insert statement
    $stmt = $pdo->prepare("INSERT INTO semester_tbl (sem_name, year_id) VALUES (?, ?)");
    $stmt->execute([$sem_name, $year_id]);

    echo json_encode(['success' => true, 'message' => 'Semester added successfully']);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to add semester',
        'error' => $e->getMessage()
    ]);
}
?>