<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Clients_comptables extends Model
{
    protected $table = 'Clients_comptables';
    protected $primaryKey = 'idClients';
    protected $fillable = [
        'Nomprenom',
        'nom_commerciale',
        'adresse', 
        'email', 
        'phone',
        'code_tva', 
        'compte_daccess',
        'password', 
        'id_comptable'
    ];
    public $timestamps = true; // No created_at/updated_at columns

    public function comptable()
    {
        return $this->belongsTo(Comptables::class, 'id_comptable', 'idComptable');
    }
}
