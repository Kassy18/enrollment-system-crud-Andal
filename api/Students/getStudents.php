<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
    $stmt = $pdo->query("
        SELECT 
            s.stud_id, 
            CONCAT(s.first_name, ' ', 
                   IF(s.middle_name != '', CONCAT(s.middle_name, ' '), ''), 
                   s.last_name) AS name,
            s.program_id,
            s.allowance,
            p.program_name
        FROM student_tbl s
        LEFT JOIN program_tbl p ON s.program_id = p.program_id
    ");

    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $students
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch students',
        'error' => $e->getMessage()
    ]);
}

?>