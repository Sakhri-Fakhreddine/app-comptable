<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comptables extends Model
{
    protected $table = 'Comptables';
    protected $primaryKey = 'idComptable';
    protected $fillable = [
        'nom_commerciale', 
        'Nomprenom', 
        'registre_de_commerce', 
        'code_tva', 
        'phone', 
        'email', 
        'etat'
    ];
    public $timestamps = true;

    public function clients()
    {
        return $this->hasMany(Clients_comptables::class, 'id_comptable', 'idComptable');
    }

    // public function demandes()
    // {
    //     return $this->hasMany(Demandes::class, 'Comptables_idComptable', 'idComptable');
    // }
    public function parametresDeclarations()
    {
        return $this->hasMany(Parametres_declarations::class, 'id_comptable', 'idComptable');
    }
}
