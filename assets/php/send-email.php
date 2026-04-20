<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

$nome = $_POST['nome'] ?? '';
$telefone = $_POST['telefone'] ?? '';
$email = $_POST['email'] ?? '';
$estado = $_POST['estado'] ?? '';
$cidade = $_POST['cidade'] ?? '';
$assunto = $_POST['assunto'] ?? '';
$mensagem = $_POST['mensagem'] ?? '';

if (empty($nome) || empty($email) || empty($mensagem)) {
    echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios']);
    exit;
}

$to = 'emerson@ctgquimica.com.br';
$subject = "Novo contato do site - $nome";

$body = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a5c4b, #2d8a6e); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #1a5c4b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .value { font-size: 16px; color: #333; margin-top: 4px; }
        .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1a5c4b; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🌿 Novo Contato - CTG Química</h1>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='label'>Nome</div>
                <div class='value'>$nome</div>
            </div>
            <div class='field'>
                <div class='label'>E-mail</div>
                <div class='value'>$email</div>
            </div>
            <div class='field'>
                <div class='label'>Telefone</div>
                <div class='value'>$telefone</div>
            </div>
            <div class='field'>
                <div class='label'>Localização</div>
                <div class='value'>$cidade - $estado</div>
            </div>
            <div class='field'>
                <div class='label'>Área de Interesse</div>
                <div class='value'>$assunto</div>
            </div>
            <div class='field'>
                <div class='label'>Mensagem</div>
                <div class='message-box'>$mensagem</div>
            </div>
        </div>
        <div class='footer'>
            Enviado através do site CTG Química
        </div>
    </div>
</body>
</html>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: CTG Química <noreply@ctgquimica.com.br>\r\n";
$headers .= "Reply-To: $email\r\n";

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Mensagem enviada com sucesso! Retornaremos em breve.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao enviar e-mail. Tente novamente.']);
}