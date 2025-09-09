<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public $token;
    public $url;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
{
    $resetUrl = "http://localhost:4200/reset-password?token={$this->token}&email=" . urlencode($notifiable->email);

    return (new MailMessage)
        ->subject('Réinitialisation de votre mot de passe')
        ->greeting('Bonjour!')
        ->line('Vous recevez cet e-mail parce que nous avons reçu une demande de réinitialisation du mot de passe pour votre compte.')
        ->action('Réinitialiser le mot de passe', $resetUrl)
        ->line('Si vous n’avez pas demandé de réinitialisation du mot de passe, aucune autre action n’est requise.');
}

}
