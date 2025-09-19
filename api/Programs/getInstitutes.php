<?php
header('Content-Type: application/json');
require_once '../dbconnection.php';

try {
    $stmt = $pdo->prepare("SELECT i.ins_name FROM institute_tbl i");
    $stmt->execute();
    $institute = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($institute) {
        echo json_encode([
            'success' => true,
            'data' => $institute
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Institute data not found.'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
