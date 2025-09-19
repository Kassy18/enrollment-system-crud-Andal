<?php
header('Content-Type: application/json');
require '../dbconnection.php';

$data = json_decode(file_get_contents('php://input'), true);
$load_id = intval($data['load_id'] ?? 0);
$new_stud_id = intval($data['stud_id'] ?? 0);
$new_subject_id = intval($data['subject_id'] ?? 0);

if ($load_id <= 0 || $new_stud_id <= 0 || $new_subject_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Enrollment ID, student and subject are required']);
    exit;
}
try {
    $stmt = $pdo->prepare("SELECT stud_id, subject_id FROM student_load WHERE load_id = ?");
    $stmt->execute([$load_id]);
    $current = $stmt->fetch();

    if (!$current) {
        echo json_encode(['success' => false, 'message' => 'Enrollment not found']);
        exit;
    }
    $check = $pdo->prepare("SELECT COUNT(*) FROM student_load WHERE stud_id = ? AND subject_id = ? AND load_id != ?");
    $check->execute([$new_stud_id, $new_subject_id, $load_id]);
    if ($check->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'message' => 'This student is already enrolled in this subject']);
        exit;
    }
    $upd = $pdo->prepare("UPDATE student_load SET stud_id = ?, subject_id = ? WHERE load_id = ?");
    $upd->execute([$new_stud_id, $new_subject_id, $load_id]);
    echo json_encode(['success' => true, 'message' => 'Enrollment updated successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to update enrollment: ' . $e->getMessage()]);
}
?>