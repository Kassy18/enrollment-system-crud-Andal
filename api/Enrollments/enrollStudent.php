<?php
header('Content-Type: application/json');
require '../dbconnection.php';

$data = json_decode(file_get_contents('php://input'), true);
$stud_id = intval($data['stud_id'] ?? 0);
$subject_id = intval($data['subject_id'] ?? 0);

if ($stud_id <= 0 || $subject_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Student ID and Subject ID are required']);
    exit;
}

try {
    $studentCheck = $pdo->prepare("SELECT COUNT(*) FROM student_tbl WHERE stud_id = ?");
    $studentCheck->execute([$stud_id]);
    if ($studentCheck->fetchColumn() == 0) {
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }

    $subjectCheck = $pdo->prepare("SELECT COUNT(*) FROM subject_tbl WHERE subject_id = ?");
    $subjectCheck->execute([$subject_id]);
    if ($subjectCheck->fetchColumn() == 0) {
        echo json_encode(['success' => false, 'message' => 'Subject not found']);
        exit;
    }

    $check = $pdo->prepare("SELECT COUNT(*) FROM student_load WHERE stud_id = ? AND subject_id = ?");
    $check->execute([$stud_id, $subject_id]);
    if ($check->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'message' => 'Student already enrolled in this subject']);
        exit;
    }

    $maxIdStmt = $pdo->query("SELECT MAX(load_id) FROM student_load");
    $maxId = $maxIdStmt->fetchColumn();
    $nextAutoIncrement = $maxId ? $maxId + 1 : 1;
    $pdo->exec("ALTER TABLE student_load MODIFY COLUMN load_id INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = $nextAutoIncrement");

    $stmt = $pdo->prepare("INSERT INTO student_load (stud_id, subject_id) VALUES (?, ?)");
    $stmt->execute([$stud_id, $subject_id]);
    $load_id = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'message' => 'Enrollment successful', 'load_id' => $load_id]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to enroll student: ' . $e->getMessage()]);
}
?>