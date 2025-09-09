<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ligne_lignedecalarations extends Model
{
    protected $table = 'ligne_lignedecalarations';
    protected $primaryKey = 'idligne_lignedecalaration';
    protected $fillable = [
        'valeurs', 
        'lignedeclarations_idlignedeclarations', 
        'lignes_parametres-decalarations'
    ];
    public $timestamps = true;

    public function lignedeclaration()
    {
        return $this->belongsTo(lignedeclarations::class, 'lignedeclarations_idlignedeclarations', 'idlignedeclarations');
    }

    public function parametreLine()
    {
        return $this->belongsTo(lignes_parametres_decalarations::class, 'lignes_parametres-decalarations', 'idlignes_parametres-decalarations');
    }
}
