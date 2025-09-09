<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class abonnementsglobals extends Model
{
    protected $table = 'abonnementsglobals';
    protected $primaryKey = 'idabonnementglobals';
    protected $fillable = [
        'etat_abonnement', 
        'montant', 
        'typeaabonnement', 
        'id_comptables'
    ];
    public $timestamps = true;
    public function comptable()
    {
        return $this->belongsTo(Comptables::class, 'id_comptable');
    }

    public function demandes()
    {
        return $this->hasMany(Demandes::class, 'abonnementsglobals_idabonnementglobals', 'idabonnementglobals');
    }

    public function archives()
    {
        return $this->hasMany(archivesabonnementsglobals::class, 'abonnementsglobals_idabonnementglobals', 'idabonnementglobals');
    }
}
