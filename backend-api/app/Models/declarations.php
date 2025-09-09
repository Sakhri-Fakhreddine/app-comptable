<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class declarations extends Model
{
    protected $table = 'declarations';
    protected $primaryKey = 'iddeclarations';
    protected $fillable = [
        'datedeclaration', 
        'anneemois', 
        'Clients_comptable_idClients', 
        'etat_declaration', 
        'typedeclaration'
    ];
    public $timestamps = true;

    public function client()
    {
        return $this->belongsTo(Clients_comptables::class, 'Clients_comptable_idClients', 'idClients');
    }

    public function lignedeclarations()
    {
        return $this->hasMany(lignedeclarations::class, 'declarations_iddeclarations', 'iddeclarations');
    }
}
