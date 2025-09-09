<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class archivesabonnementsglobals extends Model
{
    protected $table = 'archivesabonnementsglobals';
    protected $primaryKey = ['archivesabonnementsglobalid', 'periodedu', 'periodeau'];
    public $incrementing = false;
    protected $fillable = [
        'periodedu', 
        'periodeau', 
        'abonnementactif', 
        'montant', 
        'typeaabonnement', 
        'abonnementsglobals_idabonnementglobals'
    ];
    public $timestamps = true;

    public function abonnementglobal()
    {
        return $this->belongsTo(abonnementsglobals::class, 'abonnementsglobals_idabonnementglobals', 'idabonnementglobals');
    }
}
