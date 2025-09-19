<?php
header('Content-Type: application/json');
require '../dbconnection.php';

$data = json_decode(file_get_contents('php://input'), true);
$stud_id = intval($data['stud_id'] ?? 0);

if ($stud_id === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid student ID']);
    exit;
}

try {
    // Check if student has related student_load records
    $check = $pdo->prepare("SELECT COUNT(*) FROM student_load WHERE stud_id = ?");
    $check->execute([$stud_id]);

    if ($check->fetchColumn() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Cannot delete student. They are enrolled in at least one load.'
        ]);
        exit;
    }

    // Safe to delete student
    $stmt = $pdo->prepare("DELETE FROM student_tbl WHERE stud_id = ?");
    $stmt->execute([$stud_id]);

    if ($stmt->rowCount()) {
        echo json_encode(['success' => true, 'message' => 'Student deleted successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Student not found.']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Deletion failed: ' . $e->getMessage()]);
}

?>