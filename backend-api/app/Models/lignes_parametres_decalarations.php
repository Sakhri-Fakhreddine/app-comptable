<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class lignes_parametres_decalarations extends Model
{
    protected $table = 'lignes_parametres_decalarations';
    protected $primaryKey = 'idlignes_parametres_decalarations'; // maintenant simple clé
    public $incrementing = true;

    protected $fillable = [
        'libellee', 
        'compte_comptable', 
        'debit_credit', 
        'Paramtres_declaration_idParamtres_declaration', 
        'rang', 
        'libelleeArabe'
    ];

    public $timestamps = true;

    public function parametreDeclaration()
    {
        return $this->belongsTo(Parametres_declarations::class, 'Paramtres_declaration_idParamtres_declaration', 'idParamtres_declaration');
    }

    public function lignes()
    {
        return $this->hasMany(ligne_lignedecalarations::class, 'lignes_parametres-decalarations', 'idlignes_parametres-decalarations');
    }
}
