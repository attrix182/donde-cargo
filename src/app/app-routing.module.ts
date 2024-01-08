import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearcherComponent } from './searcher/searcher.component';

const routes: Routes = [
  { path: '', component: SearcherComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
