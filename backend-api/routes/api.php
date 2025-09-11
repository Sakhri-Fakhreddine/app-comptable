<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DeclarationController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\LignedeclarationController;
use App\Http\Controllers\MailingController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ComptableController;

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

//login/register/ reset password links 
Route::post('/register', [DemandeController::class, 'register']); // Create a demande
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'sendResetLink']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {return $request->user();});

//admin routes 
Route::post('/admin/send-email', [MailingController::class, 'sendEmail']);
Route::middleware('auth:sanctum')->group(function () {
    Route::delete('admin/declarationlinesettings/{id}', [LignedeclarationController::class, 'deleteDeclarationLineSetting']);
    Route::delete('admin/declarationsettings/{id}', [DeclarationController::class, 'deleteDeclarationSetting']);
    Route::post('admin/declarationlinesettings', [LignedeclarationController::class, 'storesettings']);
    Route::post('admin/declarationsettings', [DeclarationController::class, 'storesettings']);
    Route::get('/admin/declarationlinesettings/{declarationId}', [DeclarationController::class, 'getLinesByDeclaration']);
    Route::get('admin/declarationlinesettings', [LignedeclarationController::class, 'getDeclatarionlineSettings']);
    Route::get('admin/declarationsettings', [DeclarationController::class, 'getDeclarationSettings']);
    Route::post('admin/notifications/read', [NotificationController::class, 'markAsRead']);
    Route::get('admin/notifications', [NotificationController::class, 'getAdminNotifications']);
    Route::put('/admin/acceptdemande', [DemandeController::class, 'acceptDemande']);
    Route::put('/admin/refusedemande', [DemandeController::class, 'refuseDemande']);
    Route::get('/admin/demandeinfo/{id}', [DemandeController::class, 'demandeinfo']);
    Route::put('/admin/comptable/{id}/etat', [AdminController::class, 'updateEtatComptable']);
    Route::get('/admin/comptableinfo/{id}', [AdminController::class, 'comptableinfo']);
    Route::get('/admin/clientinfo/{id}', [AdminController::class, 'clientinfo']);
    Route::get('/admin/demandeslist', [AdminController::class, 'demandeslist']);
    Route::get('/admin/clientslist', [AdminController::class, 'clientslist']);
    Route::get('/admin/comptableslist', [AdminController::class, 'comptableslist']);

});


 // comptables routes
 Route::middleware('auth:sanctum')->group(function () { 
    Route::post('/createclient', [ComptableController::class, 'createclient']);
    Route::get('/clientslist', [ComptableController::class, 'clientslist']);
    Route::get('/clientinfo/{id}', [ClientController::class, 'clientinfo']);
    Route::delete('/client/{id}', [ClientController::class, 'deleteclient']);
    Route::get('/declarationlinesettings', [LignedeclarationController::class, 'getDeclatarionlineSettings']);
    Route::get('/declarationsettings', [DeclarationController::class, 'getDeclarationSettings']);
    Route::get('/declarationlinesettings/{declarationId}', [DeclarationController::class, 'getLinesByDeclaration']);
    Route::get('/declarationsettings/{id}', [DeclarationController::class, 'getDeclarationSettingById']);
    Route::put('/declarationsettings/{id}', [DeclarationController::class, 'updateDeclarationSettings']);
    Route::post('/declarationsettings', [DeclarationController::class, 'createDeclarationSettings']);

 });





