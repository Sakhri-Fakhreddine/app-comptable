<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Demandes extends Model
{
    protected $table = 'Demandes';
    protected $primaryKey = 'idDemande';
    protected $fillable = [
        'detailcomptables', 
        'typeabonnement', 
        'etat_demande', 
        'commentaire', 
        'Comptables_idComptable', 
        'abonnementsglobals_idabonnementglobals'];
    public $timestamps = true;

    public function comptable()
    {
        return $this->belongsTo(Comptables::class, 'Comptables_idComptable', 'idComptable');
    }

    public function abonnementglobal()
    {
        return $this->belongsTo(abonnementsglobals::class, 'abonnementsglobals_idabonnementglobals', 'idabonnementglobals');
    }
}
