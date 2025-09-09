<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class notifications extends Model
{
    protected $table = 'notifications';
    protected $primaryKey = 'idnotifications';
    protected $fillable = [
        'destination', 
        'id_destination', 
        'contenu_notification', 
        'etat_notification'
    ];
    public $timestamps = true;
}
