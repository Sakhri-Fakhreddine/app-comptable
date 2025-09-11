import { Routes } from '@angular/router';
import { RegisterComponent } from './Components/auth/register/register.component';
import { LoginComponent } from './Components/auth/login/login.component';
import { HomeComponent } from './Components/home/home.component';
import { AdminhomeComponent } from './Components/adminhome/adminhome.component';
import { LayoutComponent } from './Components/Layout/layout/layout.component';
import { ForgotPasswordComponent } from './Components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Components/auth/reset-password/reset-password.component';
import { ComptablehomeComponent } from './Components/comptablehome/comptablehome.component';
import { ClienthomeComponent } from './Components/clienthome/clienthome.component';
import { ClientlistComponent } from './Components/comptable/clientlist/clientlist.component';
import { CreateclientComponent } from './Components/comptable/createclient/createclient.component';
import { ComptableslistComponent } from './Components/admin/comptables/comptableslist/comptableslist.component';
import { AdminBodyComponent } from './Components/adminhome/admin-body/admin-body.component';
import { ComptableinfoComponent } from './Components/admin/comptables/comptableinfo/comptableinfo.component';
import { Clientcomptableslist } from './Components/admin/clientcomptables/clientcomptableslist/clientcomptableslist';
import { Accepteddemandesliste } from './Components/admin/demandes/accepteddemandesliste/accepteddemandesliste';
import { Wiatingdemandesliste } from './Components/admin/demandes/wiatingdemandesliste/wiatingdemandesliste';
import { Demandeinfo } from './Components/admin/demandes/demandeinfo/demandeinfo';
import { Demandesliste } from './Components/admin/demandes/demandesliste/demandesliste';
import { Refusedddemandesliste } from './Components/admin/demandes/refusedddemandesliste/refusedddemandesliste';
import { Activecomptable } from './Components/admin/comptables/activecomptable/activecomptable';
import { Inactivecomptable } from './Components/admin/comptables/inactivecomptable/inactivecomptable';
import { Declaration } from './Components/admin/settings/declaration/declaration';
import { Declarationline } from './Components/admin/settings/declarationline/declarationline';
import { Associateddeclarationline } from './Components/admin/settings/associateddeclarationline/associateddeclarationline';
import { Adddeclaration } from './Components/admin/settings/adddeclaration/adddeclaration';
import { Adddeclarationline } from './Components/admin/settings/adddeclarationline/adddeclarationline';
import { Clientinfo } from './Components/comptable/clientinfo/clientinfo';
import { Settingslist } from './Components/comptable/settingslist/settingslist';
import { AddsettingsComponent } from './Components/comptable/addsettings/addsettings.component';
import { Clientinformations } from './Components/admin/clientcomptables/clientinformations/clientinformations';

export const routes: Routes = [
    {
            path: "",
            component: LayoutComponent, // Use the LayoutComponent as the root layout
            children: [
            // { path: '', redirectTo: 'register', pathMatch: 'full' },
            { path: '', component: HomeComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'login', component: LoginComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent },
            { path: 'home', component: HomeComponent },
            { path: 'comptablehome', component: ComptablehomeComponent },
            { path: 'clienthome', component: ClienthomeComponent },
            { path: 'clientslist', component: ClientlistComponent },
            { path : 'createclient', component: CreateclientComponent},
            { path: 'client-info/:id', component: Clientinfo },
            { path: 'settingslist', component: Settingslist},
            { path: 'addsettings/:id', component:AddsettingsComponent}
            ]
    },
    {path:"admin",component :AdminhomeComponent,
        children: [
            { path: '', component: AdminBodyComponent },
            { path: 'comptableslist', component: ComptableslistComponent },
            { path: 'activecomptableslist', component: Activecomptable },
            { path: 'inactivecomptableslist', component: Inactivecomptable },
            { path: 'comptable-info/:id', component: ComptableinfoComponent },
            { path: 'client-info/:id', component: Clientinformations },
            { path: 'clientslist', component: Clientcomptableslist },
            { path: 'demandeslist', component: Demandesliste },
            { path: 'accepteddemandeslist', component: Accepteddemandesliste },
            { path: 'waitingdemandeslist', component: Wiatingdemandesliste },
            { path: 'refuseddemandeslist', component: Refusedddemandesliste },
            { path: 'demande-info/:id', component: Demandeinfo },
            { path: 'defaultdeclarationsettings', component: Declaration },
            { path: 'defaultlinesettings', component: Declarationline },
            { path: 'associateddeclarationline', component: Associateddeclarationline},
            { path: 'adddeclarationsetting', component: Adddeclaration},
            { path: 'associateddeclarationlines/:id', component: Associateddeclarationline },
            { path: 'adddeclarationlinesetting', component: Adddeclarationline},


        ]
    }
];
