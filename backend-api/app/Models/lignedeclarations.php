<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class lignedeclarations extends Model
{
    protected $table = 'lignedeclarations';
    protected $primaryKey = 'idlignedeclarations';
    protected $fillable = [
        'documents', 
        'datepiece', 
        'libelle', 
        'declarations_iddeclarations'];
    public $timestamps = true;

    public function declaration()
    {
        return $this->belongsTo(declarations::class, 'declarations_iddeclarations', 'iddeclarations');
    }

    public function lignes()
    {
        return $this->hasMany(ligne_lignedecalarations::class, 'lignedeclarations_idlignedeclarations', 'idlignedeclarations');
    }
}
