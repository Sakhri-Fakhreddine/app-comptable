<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parametres_declarations extends Model
{
    protected $table = 'Parametres_declarations';
    protected $primaryKey = 'idParamtres_declaration';
    protected $fillable = [
        'typedeclaration', 
        'Comptables_idComptable', 
        'typedeclarationArabe'];
    public $timestamps = true;

    public function comptable()
    {
        return $this->belongsTo(Comptables::class, 'Comptables_idComptable', 'idComptable');
    }
    public function lignes()
    {
        return $this->hasMany(
            lignes_parametres_decalarations::class,
            'Paramtres_declaration_idParamtres_declaration', // foreign key in lignes_parametres_decalarations
            'idParamtres_declaration'                        // local key in Parametres_declarations
        );
    }
}
