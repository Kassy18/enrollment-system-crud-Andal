<?php
header('Content-Type: application/json');
require '../dbconnection.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (
        empty($data['stud_id']) || 
        empty($data['first_name']) || 
         empty($data['middle_name']) || 
        empty($data['last_name']) || 
        !isset($data['program_id']) || 
        !isset($data['allowance'])
    ) {
        throw new Exception("Missing required fields.");
    }

    $stmt = $pdo->prepare("
        UPDATE student_tbl
        SET first_name = :first_name,
            middle_name = :middle_name,
            last_name = :last_name,
            program_id = :program_id,
            allowance = :allowance
        WHERE stud_id = :stud_id
    ");

    $stmt->execute([
        ':first_name' => $data['first_name'],
        ':middle_name' => $data['middle_name'] ?? null,
        ':last_name' => $data['last_name'],
        ':program_id' => $data['program_id'],
        ':allowance' => $data['allowance'],
        ':stud_id' => $data['stud_id']
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Student updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No changes made or student not found']);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update student',
        'error' => $e->getMessage()
    ]);
}
?>